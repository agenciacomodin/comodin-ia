
import Stripe from 'stripe';

// Configuración de Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
  typescript: true,
});

export interface CreateStripeCustomerData {
  email: string;
  name: string;
  organizationId: string;
  currency?: string;
}

export interface CreateSubscriptionData {
  customerId: string;
  priceId: string;
  organizationId: string;
  currency: string;
  trialPeriodDays?: number;
}

export class StripeService {
  
  // Crear customer en Stripe
  static async createCustomer(data: CreateStripeCustomerData): Promise<Stripe.Customer> {
    try {
      const customer = await stripe.customers.create({
        email: data.email,
        name: data.name,
        metadata: {
          organizationId: data.organizationId,
          source: 'comodin_ia'
        }
      });

      return customer;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw new Error('Failed to create Stripe customer');
    }
  }

  // Crear suscripción en Stripe
  static async createSubscription(data: CreateSubscriptionData): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: data.customerId,
        items: [
          {
            price: data.priceId,
          },
        ],
        currency: data.currency,
        trial_period_days: data.trialPeriodDays,
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          organizationId: data.organizationId,
          source: 'comodin_ia'
        }
      });

      return subscription;
    } catch (error) {
      console.error('Error creating Stripe subscription:', error);
      throw new Error('Failed to create Stripe subscription');
    }
  }

  // Actualizar suscripción (cambiar de plan)
  static async updateSubscription(
    subscriptionId: string, 
    newPriceId: string
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: newPriceId,
        }],
        proration_behavior: 'create_prorations',
      });

      return updatedSubscription;
    } catch (error) {
      console.error('Error updating Stripe subscription:', error);
      throw new Error('Failed to update Stripe subscription');
    }
  }

  // Cancelar suscripción
  static async cancelSubscription(
    subscriptionId: string, 
    cancelAtPeriodEnd: boolean = true
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: cancelAtPeriodEnd,
      });

      return subscription;
    } catch (error) {
      console.error('Error canceling Stripe subscription:', error);
      throw new Error('Failed to cancel Stripe subscription');
    }
  }

  // Obtener detalles de suscripción
  static async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['latest_invoice', 'customer', 'items.data.price']
      });

      return subscription;
    } catch (error) {
      console.error('Error retrieving Stripe subscription:', error);
      throw new Error('Failed to retrieve Stripe subscription');
    }
  }

  // Crear portal de facturación
  static async createBillingPortalSession(
    customerId: string, 
    returnUrl: string
  ): Promise<Stripe.BillingPortal.Session> {
    try {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return portalSession;
    } catch (error) {
      console.error('Error creating billing portal session:', error);
      throw new Error('Failed to create billing portal session');
    }
  }

  // Crear checkout session
  static async createCheckoutSession(data: {
    customerId?: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    organizationId: string;
    customerEmail?: string;
    trialPeriodDays?: number;
  }): Promise<Stripe.Checkout.Session> {
    try {
      const session = await stripe.checkout.sessions.create({
        customer: data.customerId,
        customer_email: data.customerId ? undefined : data.customerEmail,
        line_items: [
          {
            price: data.priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: data.successUrl,
        cancel_url: data.cancelUrl,
        subscription_data: {
          trial_period_days: data.trialPeriodDays,
          metadata: {
            organizationId: data.organizationId,
            source: 'comodin_ia'
          }
        },
        metadata: {
          organizationId: data.organizationId,
          source: 'comodin_ia'
        }
      });

      return session;
    } catch (error) {
      console.error('Error creating Stripe checkout session:', error);
      throw new Error('Failed to create Stripe checkout session');
    }
  }

  // Crear checkout session para pagos únicos (recargas de billetera)
  static async createPaymentCheckoutSession(data: {
    amount: number; // en centavos
    currency: string;
    description: string;
    successUrl: string;
    cancelUrl: string;
    organizationId: string;
    customerEmail: string;
    metadata?: Record<string, string>;
  }): Promise<{ sessionId: string; sessionUrl: string }> {
    try {
      const session = await stripe.checkout.sessions.create({
        customer_email: data.customerEmail,
        line_items: [
          {
            price_data: {
              currency: data.currency.toLowerCase(),
              product_data: {
                name: data.description,
                description: `Recarga de billetera IA - ${data.organizationId}`
              },
              unit_amount: data.amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: data.successUrl,
        cancel_url: data.cancelUrl,
        metadata: {
          organizationId: data.organizationId,
          type: 'wallet_recharge',
          amount: (data.amount / 100).toString(),
          currency: data.currency,
          ...data.metadata
        }
      });

      return {
        sessionId: session.id,
        sessionUrl: session.url!
      };
    } catch (error) {
      console.error('Error creating Stripe payment checkout session:', error);
      throw new Error('Failed to create Stripe payment checkout session');
    }
  }

  // Procesar webhook
  static constructWebhookEvent(body: string | Buffer, signature: string): Stripe.Event {
    try {
      return stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (error) {
      console.error('Error constructing Stripe webhook event:', error);
      throw new Error('Invalid Stripe webhook signature');
    }
  }
}

export { stripe };
