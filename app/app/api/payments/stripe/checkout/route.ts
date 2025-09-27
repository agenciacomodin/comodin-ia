
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { StripeService } from '@/lib/stripe-service';
import { getPlanConfig } from '@/lib/subscription-plans';
import { SubscriptionPlan } from '@prisma/client';

// POST /api/payments/stripe/checkout - Crear sesión de checkout de Stripe
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plan, billingCycle = 'monthly', trialDays = 7 } = body;

    if (!plan || !Object.values(SubscriptionPlan).includes(plan)) {
      return NextResponse.json({ error: 'Invalid or missing plan' }, { status: 400 });
    }

    const planConfig = getPlanConfig(plan);
    
    // En producción, aquí usarías los priceIds reales de Stripe
    // Por ahora usamos un priceId de ejemplo
    const priceId = `price_${plan.toLowerCase()}_${billingCycle}`;

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/dashboard?subscription=success`;
    const cancelUrl = `${baseUrl}/dashboard?subscription=cancelled`;

    const checkoutSession = await StripeService.createCheckoutSession({
      priceId,
      successUrl,
      cancelUrl,
      organizationId: session.user.organizationId,
      customerEmail: session.user.email!,
      trialPeriodDays: trialDays
    });

    return NextResponse.json({ 
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id
    });
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
