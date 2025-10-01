
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AIWalletService } from '@/lib/ai-wallet-service';
import { getUserOrganization } from '@/lib/auth-utils';

// PUT /api/wallet/settings - Configurar alertas de saldo bajo
export async function PUT(request: NextRequest) {
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

    // Solo el Owner puede configurar las alertas
    const user = organization.users.find((u: any) => u.email === session.user.email);
    if (user?.role !== 'PROPIETARIO') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { threshold, alertsEnabled } = body;

    if (threshold < 0) {
      return NextResponse.json(
        { error: 'Threshold must be positive' },
        { status: 400 }
      );
    }

    const updatedWallet = await AIWalletService.updateLowBalanceSettings(
      organization.id,
      threshold,
      alertsEnabled
    );

    return NextResponse.json({
      success: true,
      data: {
        lowBalanceThreshold: updatedWallet.lowBalanceThreshold,
        alertsEnabled: updatedWallet.alertsEnabled
      }
    });

  } catch (error) {
    console.error('Error updating wallet settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
