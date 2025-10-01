
/**
 * API para enviar mensajes de WhatsApp (Producción)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import WhatsAppService from '@/lib/whatsapp-service'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.organizationId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { to, message, type = 'text' } = body

    if (!to || !message) {
      return NextResponse.json(
        { success: false, error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // Formatear mensaje según el tipo
    let whatsappMessage: any = {
      to: to.replace(/\D/g, ''), // Solo números
      type
    }

    switch (type) {
      case 'text':
        whatsappMessage.text = { body: message }
        break
      case 'image':
        whatsappMessage.image = { link: message.url, caption: message.caption }
        break
      case 'document':
        whatsappMessage.document = { link: message.url, filename: message.filename }
        break
      default:
        whatsappMessage.text = { body: message }
    }

    // Enviar mensaje a través del servicio de WhatsApp
    const result = await WhatsAppService.sendMessage(
      session.user.organizationId,
      whatsappMessage
    )

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    // Buscar o crear contacto
    const contact = await prisma.contact.upsert({
      where: {
        organizationId_phone: {
          organizationId: session.user.organizationId,
          phone: whatsappMessage.to
        }
      },
      update: {
      },
      create: {
        organizationId: session.user.organizationId,
        name: `+${whatsappMessage.to}`,
        phone: whatsappMessage.to,
        whatsappId: whatsappMessage.to,
        source: 'WHATSAPP',
        status: 'ACTIVE',
      }
    })

    // Buscar o crear conversación
    const conversation = await prisma.conversation.upsert({
      where: {
        organizationId_contactId: {
          organizationId: session.user.organizationId,
          contactId: contact.id
        }
      },
      update: {
        lastMessageAt: new Date()
      },
      create: {
        organizationId: session.user.organizationId,
        contactId: contact.id,
        channel: 'WHATSAPP',
        status: 'OPEN',
        lastMessageAt: new Date(),
        unreadCount: 0
      }
    })

    // Guardar mensaje en la base de datos
    const savedMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: session.user.id,
        content: type === 'text' ? message : `[${type.toUpperCase()}] ${message.filename || message.caption || 'Archivo'}`,
        type: type.toUpperCase(),
        direction: 'OUTBOUND',
        status: 'SENT',
        whatsappMessageId: result.messageId,
        sentAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        messageId: result.messageId,
        conversationId: conversation.id,
        savedMessage
      }
    })
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
