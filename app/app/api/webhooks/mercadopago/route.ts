
import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoService } from '@/lib/mercadopago-service';
import { SubscriptionService } from '@/lib/subscription-service';
import { db } from '@/lib/db';
import { SubscriptionStatus, PaymentStatus, PaymentProvider } from '@prisma/client';

// POST /api/webhooks/mercadopago - Webhook de MercadoPago
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { type, data } = body;
    
    if (!type || !data?.id) {
      return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 });
    }

    const result = await MercadoPagoService.processWebhookNotification({
      id: data.id,
      type,
      data
    });

    if (!result) {
      return NextResponse.json({ received: true });
    }

    if (result.type === 'subscription') {
      await handleSubscriptionNotification(result.data);
    } else if (result.type === 'payment') {
      await handlePaymentNotification(result.data);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing MercadoPago webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}

// Manejar notificaciones de suscripción (preapproval)
async function handleSubscriptionNotification(preapproval: any) {
  try {
    const organizationId = preapproval.external_reference;
    if (!organizationId) {
      console.error('No organizationId in preapproval external_reference');
      return;
    }

    // Mapear estado de MercadoPago a nuestro enum
    let status: SubscriptionStatus;
    switch (preapproval.status) {
      case 'authorized':
        status = SubscriptionStatus.ACTIVE;
        break;
      case 'cancelled':
        status = SubscriptionStatus.CANCELED;
        break;
      case 'paused':
        status = SubscriptionStatus.PAST_DUE;
        break;
      default:
        status = SubscriptionStatus.INCOMPLETE;
    }

    const startDate = preapproval.auto_recurring?.start_date ? 
      new Date(preapproval.auto_recurring.start_date) : new Date();
    
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + (preapproval.auto_recurring?.frequency || 1));

    // Buscar suscripción existente
    const existingSubscription = await db.subscription.findFirst({
      where: { mercadopagoPreapprovalId: preapproval.id }
    });

    if (existingSubscription) {
      // Actualizar suscripción existente
      await db.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          status,
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate,
        }
      });
    } else {
      // Crear nueva suscripción
      await db.subscription.create({
        data: {
          organizationId,
          mercadopagoPreapprovalId: preapproval.id,
          mercadopagoPayerId: preapproval.payer_id,
          plan: 'STARTER', // Default, se debe determinar por el plan
          status,
          paymentProvider: PaymentProvider.MERCADO_PAGO,
          pricePerMonth: preapproval.auto_recurring?.transaction_amount || 0,
          currency: preapproval.auto_recurring?.currency_id || 'ARS',
          billingCycle: 'monthly',
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate,
        }
      });
    }

  } catch (error) {
    console.error('Error handling preapproval notification:', error);
  }
}

// Manejar notificaciones de pago
async function handlePaymentNotification(payment: any) {
  try {
    const organizationId = payment.external_reference;
    if (!organizationId) return;

    // Buscar la suscripción relacionada
    const subscription = await db.subscription.findFirst({
      where: { organizationId }
    });

    let paymentStatus: PaymentStatus;
    let paidAt: Date | null = null;
    let failedAt: Date | null = null;
    let failureReason: string | null = null;

    switch (payment.status) {
      case 'approved':
        paymentStatus = PaymentStatus.COMPLETED;
        paidAt = new Date(payment.date_approved);
        break;
      case 'rejected':
      case 'cancelled':
        paymentStatus = PaymentStatus.FAILED;
        failedAt = new Date();
        failureReason = payment.status_detail || 'Payment rejected';
        break;
      case 'refunded':
        paymentStatus = PaymentStatus.REFUNDED;
        break;
      default:
        paymentStatus = PaymentStatus.PENDING;
    }

    // Crear registro de pago
    await db.payment.create({
      data: {
        organizationId,
        subscriptionId: subscription?.id,
        amount: payment.transaction_amount || 0,
        currency: payment.currency_id || 'ARS',
        status: paymentStatus,
        paymentProvider: PaymentProvider.MERCADO_PAGO,
        mercadopagoPaymentId: payment.id.toString(),
        description: payment.description || 'Pago de suscripción MercadoPago',
        paidAt,
        failedAt,
        failureReason,
        metadata: {
          paymentMethod: payment.payment_method_id,
          paymentType: payment.payment_type_id
        }
      }
    });

    // Si el pago falló, manejar degradación
    if (paymentStatus === PaymentStatus.FAILED) {
      await SubscriptionService.handleFailedPayment(organizationId);
    }

  } catch (error) {
    console.error('Error handling payment notification:', error);
  }
}
