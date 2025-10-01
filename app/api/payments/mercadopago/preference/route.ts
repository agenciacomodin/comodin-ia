
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MercadoPagoService } from '@/lib/mercadopago-service';
import { getPlanConfig, getPlanPrice } from '@/lib/subscription-plans';
import { SubscriptionPlan } from '@prisma/client';

// POST /api/payments/mercadopago/preference - Crear preferencia de pago para suscripción
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plan, billingCycle = 'monthly', currency = 'ARS' } = body;

    if (!plan || !Object.values(SubscriptionPlan).includes(plan)) {
      return NextResponse.json({ error: 'Invalid or missing plan' }, { status: 400 });
    }

    const planConfig = getPlanConfig(plan);
    const amount = getPlanPrice(plan, currency.toLowerCase() as 'usd' | 'mxn' | 'ars', billingCycle);

    if (amount === 0) {
      return NextResponse.json({ error: 'Free plan cannot be purchased' }, { status: 400 });
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const backUrl = `${baseUrl}/dashboard`;
    const notificationUrl = `${baseUrl}/api/webhooks/mercadopago`;

    const subscription = await MercadoPagoService.createSubscription({
      email: session.user.email!,
      organizationId: session.user.organizationId,
      planId: plan,
      amount,
      currency,
      frequency: billingCycle === 'yearly' ? 12 : 1,
      frequencyType: billingCycle === 'yearly' ? 'months' : 'months',
      backUrl,
      notificationUrl
    });

    return NextResponse.json({ 
      preapprovalUrl: subscription.init_point,
      preapprovalId: subscription.id
    });
  } catch (error) {
    console.error('Error creating MercadoPago preference:', error);
    return NextResponse.json({ error: 'Failed to create payment preference' }, { status: 500 });
  }
}
