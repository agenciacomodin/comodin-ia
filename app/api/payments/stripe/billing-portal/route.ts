
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { StripeService } from '@/lib/stripe-service';
import { db } from '@/lib/db';

// POST /api/payments/stripe/billing-portal - Crear sesión del portal de facturación
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar la suscripción activa para obtener el customer ID
    const subscription = await db.subscription.findFirst({
      where: {
        organizationId: session.user.organizationId,
        paymentProvider: 'STRIPE',
        stripeCustomerId: { not: null }
      }
    });

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json({ error: 'No Stripe customer found' }, { status: 404 });
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/dashboard`;

    const portalSession = await StripeService.createBillingPortalSession(
      subscription.stripeCustomerId,
      returnUrl
    );

    return NextResponse.json({ 
      portalUrl: portalSession.url 
    });
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    return NextResponse.json({ error: 'Failed to create billing portal session' }, { status: 500 });
  }
}
