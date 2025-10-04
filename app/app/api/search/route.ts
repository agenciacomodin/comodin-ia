
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
    const query = searchParams.get('q') || '';

    if (query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true }
    });

    if (!user?.organizationId) {
      return NextResponse.json({ results: [] });
    }

    // Buscar en contactos
    const contacts = await prisma.contact.findMany({
      where: {
        organizationId: user.organizationId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 5,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true
      }
    });

    // Buscar en conversaciones
    const conversations = await prisma.conversation.findMany({
      where: {
        organizationId: user.organizationId,
        contact: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query } }
          ]
        }
      },
      take: 5,
      select: {
        id: true,
        contact: {
          select: {
            name: true,
            phone: true
          }
        },
        updatedAt: true
      }
    });

    // Buscar en campañas
    const campaigns = await prisma.campaign.findMany({
      where: {
        organizationId: user.organizationId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 5,
      select: {
        id: true,
        name: true,
        description: true
      }
    });

    // Formatear resultados
    const results = [
      ...contacts.map(c => ({
        id: c.id,
        type: 'contact' as const,
        title: c.name || c.phone,
        subtitle: c.email || c.phone,
        link: `/contacts?id=${c.id}`
      })),
      ...conversations.map(c => ({
        id: c.id,
        type: 'conversation' as const,
        title: `Conversación con ${c.contact?.name || c.contact?.phone || 'Desconocido'}`,
        subtitle: c.contact?.phone || '',
        link: `/inbox?conversation=${c.id}`
      })),
      ...campaigns.map(c => ({
        id: c.id,
        type: 'campaign' as const,
        title: c.name,
        subtitle: c.description || '',
        link: `/campaigns?id=${c.id}`
      }))
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json(
      { error: 'Error en la búsqueda' },
      { status: 500 }
    );
  }
}
