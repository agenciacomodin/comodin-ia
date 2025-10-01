
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SubscriptionService } from '@/lib/subscription-service';

// GET /api/subscriptions/usage - Obtener uso actual
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usage = await SubscriptionService.getSubscriptionUsage(session.user.organizationId);
    
    return NextResponse.json(usage);
  } catch (error) {
    console.error('Error fetching subscription usage:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription usage' }, { status: 500 });
  }
}

// POST /api/subscriptions/usage/messages - Incrementar uso de mensajes
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { increment = 1 } = body;

    await SubscriptionService.incrementMessageUsage(session.user.organizationId, increment);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error incrementing message usage:', error);
    return NextResponse.json({ error: 'Failed to increment message usage' }, { status: 500 });
  }
}

// POST /api/subscriptions/usage/reset - Resetear uso mensual (admin endpoint)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Solo permitir a Super Admins resetear uso
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { organizationId } = body;

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    await SubscriptionService.resetMonthlyUsage(organizationId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resetting monthly usage:', error);
    return NextResponse.json({ error: 'Failed to reset monthly usage' }, { status: 500 });
  }
}
