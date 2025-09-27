
import { 
  SubscriptionPlan, 
  SubscriptionStatus, 
  PaymentProvider,
  PaymentStatus,
  Organization,
  Subscription,
  Payment
} from '@prisma/client';
import { db } from './db';
import { StripeService } from './stripe-service';
import { MercadoPagoService } from './mercadopago-service';
import { getPlanConfig, validateUsageLimits } from './subscription-plans';
import { addDays, addMonths, isAfter } from 'date-fns';

export interface CreateSubscriptionData {
  organizationId: string;
  plan: SubscriptionPlan;
  paymentProvider: PaymentProvider;
  billingCycle: 'monthly' | 'yearly';
  currency: string;
  priceId?: string;
  customerEmail: string;
  trialDays?: number;
}

export interface SubscriptionUsage {
  currentUsers: number;
  currentMessages: number;
  currentIntegrations: number;
  limitsExceeded: boolean;
  resetDate: Date | null;
}

export class SubscriptionService {
  
  // Crear una nueva suscripción
  static async createSubscription(data: CreateSubscriptionData): Promise<Subscription> {
    try {
      const organization = await db.organization.findUnique({
        where: { id: data.organizationId }
      });

      if (!organization) {
        throw new Error('Organization not found');
      }

      const planConfig = getPlanConfig(data.plan);
      const currentPeriodStart = new Date();
      const currentPeriodEnd = addMonths(currentPeriodStart, data.billingCycle === 'yearly' ? 12 : 1);
      
      let trialStart = null;
      let trialEnd = null;
      if (data.trialDays && data.trialDays > 0) {
        trialStart = currentPeriodStart;
        trialEnd = addDays(currentPeriodStart, data.trialDays);
      }

      // Crear la suscripción en la base de datos
      const subscription = await db.subscription.create({
        data: {
          organizationId: data.organizationId,
          plan: data.plan,
          status: data.trialDays ? SubscriptionStatus.TRIALING : SubscriptionStatus.ACTIVE,
          paymentProvider: data.paymentProvider,
          pricePerMonth: planConfig.pricing.monthly.usd, // Se puede ajustar según la moneda
          currency: data.currency,
          billingCycle: data.billingCycle,
          currentPeriodStart,
          currentPeriodEnd,
          trialStart,
          trialEnd,
          metadata: {
            customerEmail: data.customerEmail,
            planName: planConfig.name
          }
        }
      });

      // Actualizar la organización con los límites del nuevo plan
      await this.updateOrganizationLimits(data.organizationId, data.plan, subscription.id);

      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  // Actualizar los límites de la organización según el plan
  static async updateOrganizationLimits(
    organizationId: string, 
    plan: SubscriptionPlan, 
    subscriptionId?: string
  ): Promise<void> {
    try {
      const planConfig = getPlanConfig(plan);
      const usageResetDate = addMonths(new Date(), 1);

      await db.organization.update({
        where: { id: organizationId },
        data: {
          currentPlan: plan,
          subscriptionId: subscriptionId || null,
          maxUsers: planConfig.features.maxUsers,
          maxMessages: planConfig.features.maxMessages,
          maxIntegrations: planConfig.features.maxIntegrations,
          hasAdvancedFeatures: planConfig.features.hasAdvancedFeatures,
          usageResetDate: usageResetDate
        }
      });
    } catch (error) {
      console.error('Error updating organization limits:', error);
      throw new Error('Failed to update organization limits');
    }
  }

  // Cambiar plan de suscripción
  static async changePlan(
    organizationId: string, 
    newPlan: SubscriptionPlan, 
    billingCycle: 'monthly' | 'yearly' = 'monthly'
  ): Promise<Subscription> {
    try {
      const organization = await db.organization.findUnique({
        where: { id: organizationId },
        include: { subscriptions: { where: { status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] } } } }
      });

      if (!organization) {
        throw new Error('Organization not found');
      }

      const currentSubscription = organization.subscriptions[0];
      if (!currentSubscription) {
        throw new Error('No active subscription found');
      }

      // Actualizar la suscripción en el proveedor de pago
      if (currentSubscription.paymentProvider === PaymentProvider.STRIPE && currentSubscription.stripeSubscriptionId) {
        // Actualizar en Stripe (requiere priceId del nuevo plan)
        // await StripeService.updateSubscription(currentSubscription.stripeSubscriptionId, newPriceId);
      } else if (currentSubscription.paymentProvider === PaymentProvider.MERCADO_PAGO && currentSubscription.mercadopagoPreapprovalId) {
        // Actualizar en MercadoPago
        const newPlanConfig = getPlanConfig(newPlan);
        const newAmount = billingCycle === 'yearly' ? 
          newPlanConfig.pricing.yearly.usd : 
          newPlanConfig.pricing.monthly.usd;
        
        await MercadoPagoService.updateSubscription(currentSubscription.mercadopagoPreapprovalId, {
          amount: newAmount
        });
      }

      // Actualizar la suscripción en la base de datos
      const updatedSubscription = await db.subscription.update({
        where: { id: currentSubscription.id },
        data: {
          plan: newPlan,
          billingCycle: billingCycle,
          pricePerMonth: getPlanConfig(newPlan).pricing.monthly.usd
        }
      });

      // Actualizar los límites de la organización
      await this.updateOrganizationLimits(organizationId, newPlan, updatedSubscription.id);

      return updatedSubscription;
    } catch (error) {
      console.error('Error changing subscription plan:', error);
      throw new Error('Failed to change subscription plan');
    }
  }

  // Cancelar suscripción
  static async cancelSubscription(organizationId: string, cancelAtPeriodEnd: boolean = true): Promise<Subscription> {
    try {
      const subscription = await db.subscription.findFirst({
        where: { 
          organizationId,
          status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] }
        }
      });

      if (!subscription) {
        throw new Error('No active subscription found');
      }

      // Cancelar en el proveedor de pago
      if (subscription.paymentProvider === PaymentProvider.STRIPE && subscription.stripeSubscriptionId) {
        await StripeService.cancelSubscription(subscription.stripeSubscriptionId, cancelAtPeriodEnd);
      } else if (subscription.paymentProvider === PaymentProvider.MERCADO_PAGO && subscription.mercadopagoPreapprovalId) {
        await MercadoPagoService.cancelSubscription(subscription.mercadopagoPreapprovalId);
      }

      // Actualizar en la base de datos
      const updatedSubscription = await db.subscription.update({
        where: { id: subscription.id },
        data: {
          status: cancelAtPeriodEnd ? SubscriptionStatus.ACTIVE : SubscriptionStatus.CANCELED,
          cancelAtPeriodEnd,
          canceledAt: new Date()
        }
      });

      // Si se cancela inmediatamente, degradar al plan gratuito
      if (!cancelAtPeriodEnd) {
        await this.updateOrganizationLimits(organizationId, SubscriptionPlan.FREE);
      }

      return updatedSubscription;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  // Obtener uso actual de la organización
  static async getSubscriptionUsage(organizationId: string): Promise<SubscriptionUsage> {
    try {
      const organization = await db.organization.findUnique({
        where: { id: organizationId }
      });

      if (!organization) {
        throw new Error('Organization not found');
      }

      const limits = validateUsageLimits(
        organization.currentPlan,
        organization.currentUsers,
        organization.currentMessages,
        0 // TODO: Implementar conteo de integraciones
      );

      return {
        currentUsers: organization.currentUsers,
        currentMessages: organization.currentMessages,
        currentIntegrations: 0, // TODO: Implementar
        limitsExceeded: limits.usersExceeded || limits.messagesExceeded || limits.integrationsExceeded,
        resetDate: organization.usageResetDate
      };
    } catch (error) {
      console.error('Error getting subscription usage:', error);
      throw new Error('Failed to get subscription usage');
    }
  }

  // Incrementar uso de mensajes
  static async incrementMessageUsage(organizationId: string, increment: number = 1): Promise<void> {
    try {
      await db.organization.update({
        where: { id: organizationId },
        data: {
          currentMessages: {
            increment: increment
          }
        }
      });
    } catch (error) {
      console.error('Error incrementing message usage:', error);
      throw new Error('Failed to increment message usage');
    }
  }

  // Resetear uso mensual (para ejecutar automáticamente)
  static async resetMonthlyUsage(organizationId: string): Promise<void> {
    try {
      const nextResetDate = addMonths(new Date(), 1);
      
      await db.organization.update({
        where: { id: organizationId },
        data: {
          currentMessages: 0,
          usageResetDate: nextResetDate
        }
      });
    } catch (error) {
      console.error('Error resetting monthly usage:', error);
      throw new Error('Failed to reset monthly usage');
    }
  }

  // Verificar si la suscripción está activa y dentro de los límites
  static async validateSubscriptionAccess(organizationId: string): Promise<{
    hasAccess: boolean;
    reason?: string;
    usage?: SubscriptionUsage;
  }> {
    try {
      const organization = await db.organization.findUnique({
        where: { id: organizationId },
        include: { 
          subscriptions: { 
            where: { status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] } },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      if (!organization) {
        return { hasAccess: false, reason: 'Organization not found' };
      }

      const subscription = organization.subscriptions[0];
      
      // Si no hay suscripción activa y no es plan gratuito
      if (!subscription && organization.currentPlan !== SubscriptionPlan.FREE) {
        return { hasAccess: false, reason: 'No active subscription' };
      }

      // Verificar si la suscripción ha expirado
      if (subscription && isAfter(new Date(), subscription.currentPeriodEnd)) {
        return { hasAccess: false, reason: 'Subscription expired' };
      }

      // Verificar límites de uso
      const usage = await this.getSubscriptionUsage(organizationId);
      if (usage.limitsExceeded) {
        return { hasAccess: false, reason: 'Usage limits exceeded', usage };
      }

      return { hasAccess: true, usage };
    } catch (error) {
      console.error('Error validating subscription access:', error);
      return { hasAccess: false, reason: 'Validation error' };
    }
  }

  // Procesar pago fallido y degradar plan si es necesario
  static async handleFailedPayment(organizationId: string): Promise<void> {
    try {
      const subscription = await db.subscription.findFirst({
        where: { 
          organizationId,
          status: SubscriptionStatus.ACTIVE
        }
      });

      if (!subscription) return;

      // Marcar la suscripción como past_due
      await db.subscription.update({
        where: { id: subscription.id },
        data: { status: SubscriptionStatus.PAST_DUE }
      });

      // Degradar al plan gratuito después de X intentos fallidos
      // Por ahora, degradamos inmediatamente
      await this.updateOrganizationLimits(organizationId, SubscriptionPlan.FREE);
      
    } catch (error) {
      console.error('Error handling failed payment:', error);
      throw new Error('Failed to handle failed payment');
    }
  }

  // Obtener detalles completos de la suscripción
  static async getSubscriptionDetails(organizationId: string) {
    try {
      const organization = await db.organization.findUnique({
        where: { id: organizationId },
        include: {
          subscriptions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { payments: { orderBy: { createdAt: 'desc' }, take: 5 } }
          }
        }
      });

      if (!organization) {
        throw new Error('Organization not found');
      }

      const planConfig = getPlanConfig(organization.currentPlan);
      const usage = await this.getSubscriptionUsage(organizationId);

      return {
        organization,
        currentSubscription: organization.subscriptions[0] || null,
        planConfig,
        usage,
        recentPayments: organization.subscriptions[0]?.payments || []
      };
    } catch (error) {
      console.error('Error getting subscription details:', error);
      throw new Error('Failed to get subscription details');
    }
  }
}
