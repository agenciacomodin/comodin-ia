
import { NextRequest, NextResponse } from 'next/server';
import { StripeService } from '@/lib/stripe-service';
import { SubscriptionService } from '@/lib/subscription-service';
import { db } from '@/lib/db';
import { SubscriptionStatus, PaymentStatus, PaymentProvider } from '@prisma/client';

// POST /api/webhooks/stripe - Webhook de Stripe
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
    }

    const event = StripeService.constructWebhookEvent(body, signature);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionEvent(event.data.object as any);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object as any);
        break;
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as any);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as any);
        break;
        
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Stripe webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}

// Manejar eventos de suscripción
async function handleSubscriptionEvent(subscription: any) {
  try {
    const organizationId = subscription.metadata?.organizationId;
    if (!organizationId) {
      console.error('No organizationId in subscription metadata');
      return;
    }

    // Mapear estado de Stripe a nuestro enum
    let status: SubscriptionStatus;
    switch (subscription.status) {
      case 'active':
        status = SubscriptionStatus.ACTIVE;
        break;
      case 'canceled':
        status = SubscriptionStatus.CANCELED;
        break;
      case 'past_due':
        status = SubscriptionStatus.PAST_DUE;
        break;
      case 'unpaid':
        status = SubscriptionStatus.UNPAID;
        break;
      case 'trialing':
        status = SubscriptionStatus.TRIALING;
        break;
      default:
        status = SubscriptionStatus.INCOMPLETE;
    }

    // Buscar suscripción existente
    const existingSubscription = await db.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id }
    });

    if (existingSubscription) {
      // Actualizar suscripción existente
      await db.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
        }
      });
    } else {
      // Crear nueva suscripción
      await db.subscription.create({
        data: {
          organizationId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer,
          plan: 'STARTER', // Default, se debe determinar por el price_id
          status,
          paymentProvider: PaymentProvider.STRIPE,
          pricePerMonth: subscription.items.data[0]?.price?.unit_amount / 100 || 0,
          currency: subscription.currency?.toUpperCase() || 'USD',
          billingCycle: subscription.items.data[0]?.price?.recurring?.interval === 'year' ? 'yearly' : 'monthly',
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
        }
      });
    }

  } catch (error) {
    console.error('Error handling subscription event:', error);
  }
}

// Manejar cancelación de suscripción
async function handleSubscriptionCanceled(subscription: any) {
  try {
    const organizationId = subscription.metadata?.organizationId;
    if (!organizationId) return;

    await db.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: SubscriptionStatus.CANCELED,
        endedAt: new Date()
      }
    });

    // Degradar al plan gratuito
    await SubscriptionService.updateOrganizationLimits(organizationId, 'FREE');
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}

// Manejar pago exitoso
async function handlePaymentSucceeded(invoice: any) {
  try {
    const organizationId = invoice.subscription_details?.metadata?.organizationId;
    if (!organizationId) return;

    const subscription = await db.subscription.findFirst({
      where: { stripeSubscriptionId: invoice.subscription }
    });

    if (!subscription) return;

    // Crear registro de pago
    await db.payment.create({
      data: {
        organizationId,
        subscriptionId: subscription.id,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency.toUpperCase(),
        status: PaymentStatus.COMPLETED,
        paymentProvider: PaymentProvider.STRIPE,
        stripePaymentIntentId: invoice.payment_intent,
        stripeChargeId: invoice.charge,
        description: `Pago de suscripción - ${subscription.plan}`,
        paidAt: new Date(invoice.status_transitions.paid_at * 1000),
        invoiceUrl: invoice.hosted_invoice_url,
        receiptUrl: invoice.receipt_number ? `https://dashboard.stripe.com/receipts/${invoice.receipt_number}` : null
      }
    });
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

// Manejar pago fallido
async function handlePaymentFailed(invoice: any) {
  try {
    const organizationId = invoice.subscription_details?.metadata?.organizationId;
    if (!organizationId) return;

    const subscription = await db.subscription.findFirst({
      where: { stripeSubscriptionId: invoice.subscription }
    });

    if (!subscription) return;

    // Crear registro de pago fallido
    await db.payment.create({
      data: {
        organizationId,
        subscriptionId: subscription.id,
        amount: invoice.amount_due / 100,
        currency: invoice.currency.toUpperCase(),
        status: PaymentStatus.FAILED,
        paymentProvider: PaymentProvider.STRIPE,
        stripePaymentIntentId: invoice.payment_intent,
        description: `Pago fallido de suscripción - ${subscription.plan}`,
        failedAt: new Date(),
        failureReason: invoice.last_finalization_error?.message || 'Payment failed'
      }
    });

    // Manejar pago fallido en el servicio
    await SubscriptionService.handleFailedPayment(organizationId);
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}
