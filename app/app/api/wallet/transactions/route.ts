
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AIWalletService } from '@/lib/ai-wallet-service';
import { getUserOrganization } from '@/lib/auth-utils';

// GET /api/wallet/transactions - Obtener historial de transacciones de IA
export async function GET(request: NextRequest) {
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

    // Solo el Owner puede ver las transacciones
    const user = organization.users.find((u: any) => u.email === session.user.email);
    if (user?.role !== 'PROPIETARIO') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const result = await AIWalletService.getAITransactionHistory(
      organization.id,
      page,
      limit
    );

    return NextResponse.json({
      success: true,
      data: result.transactions,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit)
      }
    });

  } catch (error) {
    console.error('Error getting AI transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
