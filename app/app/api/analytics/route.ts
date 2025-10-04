
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const range = searchParams.get('range') || '7d';

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true }
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'Organización no encontrada' }, { status: 404 });
    }

    // Calcular fechas
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Obtener estadísticas
    const totalConversations = await prisma.conversation.count({
      where: {
        organizationId: user.organizationId,
        createdAt: { gte: startDate }
      }
    });

    const totalContacts = await prisma.contact.count({
      where: {
        organizationId: user.organizationId,
        createdAt: { gte: startDate }
      }
    });

    const totalMessages = await prisma.message.count({
      where: {
        conversation: {
          organizationId: user.organizationId
        },
        createdAt: { gte: startDate }
      }
    });

    return NextResponse.json({
      totalConversations,
      totalContacts,
      totalMessages,
      range
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Error al obtener analytics' },
      { status: 500 }
    );
  }
}
