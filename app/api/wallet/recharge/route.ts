
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AIWalletService } from '@/lib/ai-wallet-service';
import { getUserOrganization } from '@/lib/auth-utils';
import { StripeService } from '@/lib/stripe-service';
import { MercadoPagoService } from '@/lib/mercadopago-service';
import { PaymentProvider } from '@prisma/client';

// POST /api/wallet/recharge - Crear sesión de pago para recargar billetera
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const organization = await getUserOrganization(session.user.email);
    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Solo el Owner puede recargar la billetera
    const user = organization.users.find((u: any) => u.email === session.user.email);
    if (user?.role !== 'PROPIETARIO') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { amount, currency = 'USD', provider = 'STRIPE' } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Crear sesión de pago según el proveedor
    let paymentResult;

    if (provider === 'STRIPE') {
      paymentResult = await StripeService.createPaymentCheckoutSession({
        amount: amount * 100, // Stripe usa centavos
        currency: currency.toLowerCase(),
        description: `AI Wallet Recharge - $${amount}`,
        organizationId: organization.id,
        customerEmail: session.user.email,
        successUrl: `${process.env.NEXTAUTH_URL}/facturacion?wallet_recharged=true`,
        cancelUrl: `${process.env.NEXTAUTH_URL}/facturacion?wallet_recharge_cancelled=true`,
        metadata: {
          type: 'wallet_recharge',
          organizationId: organization.id,
          amount: amount.toString(),
          currency
        }
      });

      return NextResponse.json({
        success: true,
        provider: 'stripe',
        sessionId: paymentResult.sessionId,
        sessionUrl: paymentResult.sessionUrl
      });

    } else if (provider === 'MERCADO_PAGO') {
      paymentResult = await MercadoPagoService.createPreference({
        organizationId: organization.id,
        title: `AI Wallet Recharge - $${amount}`,
        price: amount,
        currency: currency,
        description: `Recarga de billetera IA para ${organization.name}`,
        customerEmail: session.user.email,
        successUrl: `${process.env.NEXTAUTH_URL}/facturacion?wallet_recharged=true`,
        failureUrl: `${process.env.NEXTAUTH_URL}/facturacion?wallet_recharge_failed=true`,
        pendingUrl: `${process.env.NEXTAUTH_URL}/facturacion?wallet_recharge_pending=true`,
        metadata: {
          type: 'wallet_recharge',
          organizationId: organization.id,
          amount: amount.toString(),
          currency
        }
      });

      return NextResponse.json({
        success: true,
        provider: 'mercado_pago',
        preferenceId: paymentResult.preferenceId,
        initPoint: paymentResult.initPoint
      });
    }

    return NextResponse.json(
      { error: 'Invalid payment provider' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error creating recharge session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
