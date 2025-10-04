
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AIWalletService } from '@/lib/ai-wallet-service';
import { getUserOrganization } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic'

// GET /api/wallet - Obtener estadísticas de la billetera
export async function GET() {
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

    // Solo el Owner puede ver la información financiera
    const user = organization.users.find((u: any) => u.email === session.user.email);
    if (user?.role !== 'PROPIETARIO') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const walletStats = await AIWalletService.getWalletStats(organization.id);

    return NextResponse.json({
      success: true,
      data: walletStats
    });

  } catch (error) {
    console.error('Error getting wallet stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
