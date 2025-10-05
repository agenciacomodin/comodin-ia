
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

    const notifications = [
      {
        id: '1',
        type: 'message',
        title: 'Nuevo mensaje de Juan Pérez',
        description: 'Hola, necesito información sobre...',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutos atrás
      },
      {
        id: '2',
        type: 'payment',
        title: 'Pago recibido',
        description: 'Se recibió un pago de $50 USD',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
      },
      {
        id: '3',
        type: 'alert',
        title: 'Créditos de IA bajos',
        description: 'Te quedan solo 100 créditos. Recarga pronto.',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
      },
    ];

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Error al obtener notificaciones' },
      { status: 500 }
    );
  }
}
