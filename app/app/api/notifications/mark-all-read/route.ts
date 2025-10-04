
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // En producción: actualizar todas las notificaciones en BD
    // await prisma.notification.updateMany({
    //   where: { userId: session.user.id, read: false },
    //   data: { read: true }
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking all as read:', error);
    return NextResponse.json(
      { error: 'Error al marcar todas como leídas' },
      { status: 500 }
    );
  }
}
