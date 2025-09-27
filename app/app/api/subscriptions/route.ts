
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SubscriptionService } from '@/lib/subscription-service';
import { SubscriptionPlan, PaymentProvider } from '@prisma/client';

// GET /api/subscriptions - Obtener detalles de suscripción
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const details = await SubscriptionService.getSubscriptionDetails(session.user.organizationId);
    
    return NextResponse.json(details);
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription details' }, { status: 500 });
  }
}

// POST /api/subscriptions - Crear nueva suscripción
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plan, paymentProvider, billingCycle, currency, trialDays } = body;

    // Validar datos requeridos
    if (!plan || !paymentProvider || !billingCycle || !currency) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validar enum values
    if (!Object.values(SubscriptionPlan).includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    if (!Object.values(PaymentProvider).includes(paymentProvider)) {
      return NextResponse.json({ error: 'Invalid payment provider' }, { status: 400 });
    }

    const subscription = await SubscriptionService.createSubscription({
      organizationId: session.user.organizationId,
      plan,
      paymentProvider,
      billingCycle,
      currency,
      customerEmail: session.user.email!,
      trialDays: trialDays || 0
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}

// PUT /api/subscriptions - Cambiar plan de suscripción
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plan, billingCycle } = body;

    if (!plan) {
      return NextResponse.json({ error: 'Plan is required' }, { status: 400 });
    }

    if (!Object.values(SubscriptionPlan).includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const subscription = await SubscriptionService.changePlan(
      session.user.organizationId,
      plan,
      billingCycle || 'monthly'
    );

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error changing subscription plan:', error);
    return NextResponse.json({ error: 'Failed to change subscription plan' }, { status: 500 });
  }
}

// DELETE /api/subscriptions - Cancelar suscripción
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cancelAtPeriodEnd = searchParams.get('cancelAtPeriodEnd') === 'true';

    const subscription = await SubscriptionService.cancelSubscription(
      session.user.organizationId,
      cancelAtPeriodEnd
    );

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
  }
}
