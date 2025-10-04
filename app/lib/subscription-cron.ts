
import { SubscriptionService } from './subscription-service';
import { db } from './db';
import { SubscriptionStatus, SubscriptionPlan } from '@prisma/client';
import { isAfter, addDays, isToday } from 'date-fns';

export class SubscriptionCronService {
  
  // Procesar suscripciones expiradas y degradar planes
  static async processExpiredSubscriptions() {
    try {
      console.log('[CRON] Processing expired subscriptions...');
      
      const expiredSubscriptions = await db.subscription.findMany({
        where: {
          status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING, SubscriptionStatus.PAST_DUE] },
          currentPeriodEnd: { lt: new Date() },
          cancelAtPeriodEnd: false
        },
        include: { organization: true }
      });

      for (const subscription of expiredSubscriptions) {
        console.log(`[CRON] Processing expired subscription: ${subscription.id} for org: ${subscription.organizationId}`);
        
        // Marcar suscripción como expirada
        await db.subscription.update({
          where: { id: subscription.id },
          data: {
            status: SubscriptionStatus.CANCELED,
            endedAt: new Date()
          }
        });

        // Degradar al plan gratuito
        await SubscriptionService.updateOrganizationLimits(
          subscription.organizationId,
          SubscriptionPlan.FREE
        );

        console.log(`[CRON] Organization ${subscription.organizationId} degraded to FREE plan due to expired subscription`);
      }

      console.log(`[CRON] Processed ${expiredSubscriptions.length} expired subscriptions`);
      return { processed: expiredSubscriptions.length, success: true };
    } catch (error) {
      console.error('[CRON] Error processing expired subscriptions:', error);
      return { processed: 0, success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  // Procesar suscripciones que deben cancelarse al final del período
  static async processCancelAtPeriodEnd() {
    try {
      console.log('[CRON] Processing cancel-at-period-end subscriptions...');
      
      const cancellingSubscriptions = await db.subscription.findMany({
        where: {
          status: SubscriptionStatus.ACTIVE,
          cancelAtPeriodEnd: true,
          currentPeriodEnd: { lte: new Date() }
        }
      });

      for (const subscription of cancellingSubscriptions) {
        console.log(`[CRON] Canceling subscription at period end: ${subscription.id}`);
        
        // Marcar como cancelada
        await db.subscription.update({
          where: { id: subscription.id },
          data: {
            status: SubscriptionStatus.CANCELED,
            endedAt: new Date()
          }
        });

        // Degradar al plan gratuito
        await SubscriptionService.updateOrganizationLimits(
          subscription.organizationId,
          SubscriptionPlan.FREE
        );
      }

      console.log(`[CRON] Processed ${cancellingSubscriptions.length} cancel-at-period-end subscriptions`);
      return { processed: cancellingSubscriptions.length, success: true };
    } catch (error) {
      console.error('[CRON] Error processing cancel-at-period-end subscriptions:', error);
      return { processed: 0, success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  // Resetear uso mensual para organizaciones donde corresponde
  static async resetMonthlyUsage() {
    try {
      console.log('[CRON] Resetting monthly usage...');
      
      const organizationsToReset = await db.organization.findMany({
        where: {
          usageResetDate: { lte: new Date() }
        }
      });

      for (const organization of organizationsToReset) {
        await SubscriptionService.resetMonthlyUsage(organization.id);
        console.log(`[CRON] Reset monthly usage for organization: ${organization.id}`);
      }

      console.log(`[CRON] Reset usage for ${organizationsToReset.length} organizations`);
      return { processed: organizationsToReset.length, success: true };
    } catch (error) {
      console.error('[CRON] Error resetting monthly usage:', error);
      return { processed: 0, success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  // Procesar recordatorios de renovación (avisar 3 días antes del vencimiento)
  static async processRenewalReminders() {
    try {
      console.log('[CRON] Processing renewal reminders...');
      
      const threeDaysFromNow = addDays(new Date(), 3);
      
      const subscriptionsNearExpiry = await db.subscription.findMany({
        where: {
          status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] },
          currentPeriodEnd: {
            gte: addDays(new Date(), 2),
            lte: addDays(new Date(), 4)
          },
          cancelAtPeriodEnd: false
        },
        include: { organization: true }
      });

      for (const subscription of subscriptionsNearExpiry) {
        // Aquí podrías enviar emails de recordatorio
        // await sendRenewalReminderEmail(subscription);
        console.log(`[CRON] Renewal reminder needed for subscription: ${subscription.id} (expires in 3 days)`);
      }

      console.log(`[CRON] Processed ${subscriptionsNearExpiry.length} renewal reminders`);
      return { processed: subscriptionsNearExpiry.length, success: true };
    } catch (error) {
      console.error('[CRON] Error processing renewal reminders:', error);
      return { processed: 0, success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  // Procesar pagos fallidos con retry
  static async processFailedPayments() {
    try {
      console.log('[CRON] Processing failed payments...');
      
      const failedPayments = await db.payment.findMany({
        where: {
          status: 'FAILED',
          createdAt: { gte: addDays(new Date(), -7) }, // Solo los últimos 7 días
        },
        include: { organization: true, subscription: true }
      });

      for (const payment of failedPayments) {
        // Intentar reintentar el pago (esto dependería del proveedor)
        // Por ahora, solo marcamos para revisión manual
        console.log(`[CRON] Failed payment requiring attention: ${payment.id} for organization: ${payment.organizationId}`);
        
        // Degradar si ha pasado más de X días
        const daysSinceFailure = Math.floor((new Date().getTime() - payment.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceFailure >= 3) {
          await SubscriptionService.handleFailedPayment(payment.organizationId);
          console.log(`[CRON] Organization ${payment.organizationId} degraded due to failed payment older than 3 days`);
        }
      }

      console.log(`[CRON] Processed ${failedPayments.length} failed payments`);
      return { processed: failedPayments.length, success: true };
    } catch (error) {
      console.error('[CRON] Error processing failed payments:', error);
      return { processed: 0, success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  // Ejecutar todas las tareas de mantenimiento
  static async runAllMaintenanceTasks() {
    console.log('[CRON] Starting subscription maintenance tasks...');
    
    const results = {
      expiredSubscriptions: await this.processExpiredSubscriptions(),
      cancelAtPeriodEnd: await this.processCancelAtPeriodEnd(),
      monthlyUsageReset: await this.resetMonthlyUsage(),
      renewalReminders: await this.processRenewalReminders(),
      failedPayments: await this.processFailedPayments()
    };

    console.log('[CRON] Subscription maintenance tasks completed:', results);
    return results;
  }

  // Generar reporte de estado de suscripciones
  static async generateSubscriptionReport() {
    try {
      const [
        totalOrganizations,
        activeSubscriptions,
        trialingSubscriptions,
        expiredSubscriptions,
        failedPayments,
        planDistribution
      ] = await Promise.all([
        db.organization.count(),
        db.subscription.count({ where: { status: SubscriptionStatus.ACTIVE } }),
        db.subscription.count({ where: { status: SubscriptionStatus.TRIALING } }),
        db.subscription.count({ where: { status: { in: [SubscriptionStatus.CANCELED, SubscriptionStatus.PAST_DUE] } } }),
        db.payment.count({ where: { status: 'FAILED', createdAt: { gte: addDays(new Date(), -30) } } }),
        db.organization.groupBy({
          by: ['currentPlan'],
          _count: { currentPlan: true }
        })
      ]);

      return {
        timestamp: new Date(),
        summary: {
          totalOrganizations,
          activeSubscriptions,
          trialingSubscriptions,
          expiredSubscriptions,
          failedPaymentsLastMonth: failedPayments
        },
        planDistribution: planDistribution.reduce((acc: Record<string, number>, item: any) => {
          acc[item.currentPlan] = item._count.currentPlan;
          return acc;
        }, {} as Record<string, number>)
      };
    } catch (error) {
      console.error('[CRON] Error generating subscription report:', error);
      throw error;
    }
  }
}
