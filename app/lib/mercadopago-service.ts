
import { MercadoPagoConfig, PreApproval, Payment } from 'mercadopago';

// Configuración de MercadoPago
const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
  options: { timeout: 5000 }
});

const preApproval = new PreApproval(mercadopago);
const payment = new Payment(mercadopago);

export interface CreateMercadoPagoSubscriptionData {
  email: string;
  organizationId: string;
  planId: string;
  amount: number;
  currency: string;
  frequency: number; // 1 para mensual
  frequencyType: 'months' | 'days';
  backUrl: string;
  notificationUrl: string;
}

export interface CreateMercadoPagoPaymentData {
  amount: number;
  currency: string;
  description: string;
  payerEmail: string;
  organizationId: string;
  externalReference: string;
}

export class MercadoPagoService {
  
  // Crear suscripción (preapproval) en MercadoPago
  static async createSubscription(data: CreateMercadoPagoSubscriptionData) {
    try {
      const preApprovalData = {
        reason: `Suscripción COMODÍN IA - Plan ${data.planId}`,
        payer_email: data.email,
        back_url: data.backUrl,
        auto_recurring: {
          frequency: data.frequency,
          frequency_type: data.frequencyType,
          transaction_amount: data.amount,
          currency_id: data.currency,
          start_date: new Date().toISOString(),
        },
        external_reference: data.organizationId,
        notification_url: data.notificationUrl,
        status: 'pending'
      };

      const response = await preApproval.create({ body: preApprovalData });
      return response;
    } catch (error) {
      console.error('Error creating MercadoPago subscription:', error);
      throw new Error('Failed to create MercadoPago subscription');
    }
  }

  // Actualizar suscripción
  static async updateSubscription(
    preApprovalId: string, 
    data: { status?: 'authorized' | 'cancelled' | 'paused'; amount?: number }
  ) {
    try {
      const updateData: any = {};
      
      if (data.status) {
        updateData.status = data.status;
      }
      
      if (data.amount) {
        updateData.auto_recurring = {
          transaction_amount: data.amount
        };
      }

      const response = await preApproval.update({
        id: preApprovalId,
        body: updateData
      });
      
      return response;
    } catch (error) {
      console.error('Error updating MercadoPago subscription:', error);
      throw new Error('Failed to update MercadoPago subscription');
    }
  }

  // Cancelar suscripción
  static async cancelSubscription(preApprovalId: string) {
    try {
      const response = await preApproval.update({
        id: preApprovalId,
        body: { status: 'cancelled' }
      });
      
      return response;
    } catch (error) {
      console.error('Error canceling MercadoPago subscription:', error);
      throw new Error('Failed to cancel MercadoPago subscription');
    }
  }

  // Obtener detalles de suscripción
  static async getSubscription(preApprovalId: string) {
    try {
      const response = await preApproval.get({ id: preApprovalId });
      return response;
    } catch (error) {
      console.error('Error retrieving MercadoPago subscription:', error);
      throw new Error('Failed to retrieve MercadoPago subscription');
    }
  }

  // Crear pago único
  static async createPayment(data: CreateMercadoPagoPaymentData) {
    try {
      const paymentData = {
        transaction_amount: data.amount,
        currency_id: data.currency,
        description: data.description,
        payer: {
          email: data.payerEmail
        },
        external_reference: data.externalReference,
        metadata: {
          organization_id: data.organizationId,
          source: 'comodin_ia'
        }
      };

      const response = await payment.create({ body: paymentData });
      return response;
    } catch (error) {
      console.error('Error creating MercadoPago payment:', error);
      throw new Error('Failed to create MercadoPago payment');
    }
  }

  // Obtener detalles de pago
  static async getPayment(paymentId: string) {
    try {
      const response = await payment.get({ id: paymentId });
      return response;
    } catch (error) {
      console.error('Error retrieving MercadoPago payment:', error);
      throw new Error('Failed to retrieve MercadoPago payment');
    }
  }

  // Procesar notificación webhook
  static async processWebhookNotification(notificationData: {
    id: string;
    type: string;
    data?: { id: string };
  }) {
    try {
      if (notificationData.type === 'preapproval') {
        // Es una notificación de suscripción
        const preApprovalId = notificationData.data?.id || notificationData.id;
        const subscription = await this.getSubscription(preApprovalId);
        return { type: 'subscription', data: subscription };
      } else if (notificationData.type === 'payment') {
        // Es una notificación de pago
        const paymentId = notificationData.data?.id || notificationData.id;
        const paymentData = await this.getPayment(paymentId);
        return { type: 'payment', data: paymentData };
      }
      
      return null;
    } catch (error) {
      console.error('Error processing MercadoPago webhook notification:', error);
      throw new Error('Failed to process MercadoPago webhook notification');
    }
  }
}
