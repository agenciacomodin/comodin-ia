
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { SendMessageRequest } from '@/lib/types'
import { processIncomingMessage } from '@/lib/ai-broker'

const prisma = new PrismaClient()

// GET /api/crm/messages - Obtener mensajes de una conversación
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    
    if (!conversationId) {
      return NextResponse.json({
        success: false,
        error: 'ID de conversación requerido'
      }, { status: 400 })
    }

    const skip = (page - 1) * limit

    // Verificar que la conversación pertenece a la organización
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        organizationId: session.user.organizationId
      }
    })

    if (!conversation) {
      return NextResponse.json({
        success: false,
        error: 'Conversación no encontrada'
      }, { status: 404 })
    }

    // Obtener mensajes de la conversación
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: {
          conversationId,
          organizationId: session.user.organizationId
        },
        orderBy: { sentAt: 'asc' },
        skip,
        take: limit,
        include: {
          replyTo: {
            select: {
              id: true,
              content: true,
              sentByName: true
            }
          }
        }
      }),
      prisma.message.count({
        where: {
          conversationId,
          organizationId: session.user.organizationId
        }
      })
    ])

    // Marcar mensajes como leídos si no son del usuario actual
    await prisma.message.updateMany({
      where: {
        conversationId,
        direction: 'INCOMING',
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    // Actualizar contador de no leídos en la conversación
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { unreadCount: 0 }
    })

    return NextResponse.json({
      success: true,
      data: messages.map(msg => ({
        id: msg.id,
        conversationId: msg.conversationId,
        direction: msg.direction,
        type: msg.type,
        content: msg.content,
        attachmentUrl: msg.attachmentUrl,
        attachmentType: msg.attachmentType,
        attachmentName: msg.attachmentName,
        sentBy: msg.sentBy,
        sentByName: msg.sentByName,
        isRead: msg.isRead,
        readAt: msg.readAt,
        sentAt: msg.sentAt,
        replyTo: msg.replyTo
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error obteniendo mensajes:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

// POST /api/crm/messages - Enviar nuevo mensaje
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId || !session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body: SendMessageRequest = await request.json()

    // Validaciones
    if (!body.conversationId || !body.content?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'ID de conversación y contenido son requeridos'
      }, { status: 400 })
    }

    // Verificar que la conversación existe y pertenece a la organización
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: body.conversationId,
        organizationId: session.user.organizationId
      },
      include: {
        contact: true
      }
    })

    if (!conversation) {
      return NextResponse.json({
        success: false,
        error: 'Conversación no encontrada'
      }, { status: 404 })
    }

    // Crear el mensaje
    const newMessage = await prisma.message.create({
      data: {
        organizationId: session.user.organizationId,
        conversationId: body.conversationId,
        direction: 'OUTGOING',
        type: body.type || 'TEXT',
        content: body.content.trim(),
        attachmentUrl: body.attachmentUrl,
        attachmentType: body.attachmentType,
        attachmentName: body.attachmentName,
        sentBy: session.user.id,
        sentByName: session.user.name || session.user.email || 'Usuario',
        replyToId: body.replyToId,
        sentAt: new Date()
      },
      include: {
        replyTo: {
          select: {
            id: true,
            content: true,
            sentByName: true
          }
        }
      }
    })

    // Actualizar información de la conversación
    await prisma.conversation.update({
      where: { id: body.conversationId },
      data: {
        lastMessageAt: new Date(),
        lastMessageText: body.content.trim().substring(0, 100),
        lastMessageFrom: 'OUTGOING',
        messageCount: { increment: 1 }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: newMessage.id,
        conversationId: newMessage.conversationId,
        direction: newMessage.direction,
        type: newMessage.type,
        content: newMessage.content,
        attachmentUrl: newMessage.attachmentUrl,
        attachmentType: newMessage.attachmentType,
        attachmentName: newMessage.attachmentName,
        sentBy: newMessage.sentBy,
        sentByName: newMessage.sentByName,
        isRead: newMessage.isRead,
        readAt: newMessage.readAt,
        sentAt: newMessage.sentAt,
        replyTo: newMessage.replyTo
      },
      message: 'Mensaje enviado exitosamente'
    })

  } catch (error) {
    console.error('Error enviando mensaje:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}
