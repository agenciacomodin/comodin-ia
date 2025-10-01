import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel'); // whatsapp, email, etc.
    const agentId = searchParams.get('agentId');
    const status = searchParams.get('status'); // OPEN, CLOSED, etc.
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId: session.user.organizationId,
      ...(agentId && { assignedAgentId: agentId }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { contact: { 
            name: { contains: search, mode: 'insensitive' as const }
          }},
          { contact: { 
            phone: { contains: search, mode: 'insensitive' as const }
          }}
        ]
      })
    };

    // Filtro por canal (WhatsApp específicamente)
    if (channel === 'whatsapp') {
      where.whatsappChannelId = { not: null };
    }

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        include: {
          contact: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              avatar: true
            }
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              content: true,
              direction: true,
              createdAt: true
            }
          }
        },
        orderBy: { lastMessageAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.conversation.count({ where })
    ]);

    return NextResponse.json({
      conversations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch conversations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, assignedAgentId, assignedAgentName, status, priority } = body;

    if (!id) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    // Verificar que la conversación pertenece a la organización
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId
      }
    });

    if (!existingConversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Si se asigna un agente, verificar que pertenece a la organización
    if (assignedAgentId) {
      const agent = await prisma.rAGAgent.findFirst({
        where: {
          id: assignedAgentId,
          organizationId: session.user.organizationId
        }
      });

      if (!agent) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
      }
    }

    const conversation = await prisma.conversation.update({
      where: { id },
      data: {
        ...(assignedAgentId !== undefined && { assignedAgentId }),
        ...(assignedAgentName !== undefined && { assignedAgentName }),
        ...(status && { status }),
        ...(priority && { priority })
      },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json({ 
      error: 'Failed to update conversation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
