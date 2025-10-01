import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, MessageType, MessageDirection } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Processing incoming message:', JSON.stringify(body, null, 2))

    const {
      organizationId,
      messageId,
      from,
      content,
      type = 'text',
      timestamp,
      context,
      mediaUrl,
      mediaCaption,
      contactName
    } = body

    if (!organizationId || !messageId || !from || !content) {
      return NextResponse.json(
        { success: false, error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // Verificar que la organización existe
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    })

    if (!organization) {
      return NextResponse.json(
        { success: false, error: 'Organización no encontrada' },
        { status: 404 }
      )
    }

    const messageTimestamp =
      timestamp ? new Date(parseInt(timestamp) * 1000) : new Date()
    const phoneNumber = String(from).replace(/\D/g, '') // Solo números

    // Buscar o crear el contacto usando el campo correcto 'phone'
    const contact = await prisma.contact.upsert({
      where: {
        organizationId_phone: {
          organizationId,
          phone: phoneNumber
        }
      },
      update: {
        name: contactName || `Contacto ${phoneNumber}`,
      },
      create: {
        organizationId,
        phone: phoneNumber,
        name: contactName || `Contacto ${phoneNumber}`,
      }
    })

    // Buscar conversación existente abierta
    let conversation = await prisma.conversation.findFirst({
      where: {
        organizationId,
        contactId: contact.id,
        status: { in: ['OPEN', 'PENDING'] }
      }
    })

    // Si no existe conversación abierta, crear una nueva
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          organizationId,
          contactId: contact.id,
          status: 'OPEN',
          lastMessageAt: messageTimestamp,
          unreadCount: 1,
          whatsappChatId: from // Usar el from como whatsappChatId
        }
      })
    } else {
      // Actualizar conversación existente
      conversation = await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: messageTimestamp,
          unreadCount: { increment: 1 }
        }
      })
    }

    // Obtener canal de WhatsApp si existe
    const whatsappChannel = await prisma.whatsAppChannel.findFirst({
      where: { organizationId }
    })

    // Preparar contenido del mensaje
    let messageContent = content
    if (mediaCaption) {
      messageContent = `${content}\n\nCaption: ${mediaCaption}`
    }

    // Preparar metadata
    const messageMetadata: any = {}
    if (context) messageMetadata.context = context
    if (mediaUrl) messageMetadata.mediaUrl = mediaUrl
    if (mediaCaption) messageMetadata.mediaCaption = mediaCaption

    // Mapear tipo de mensaje entrante a enum de Prisma
    const incomingType = String(type ?? 'TEXT').toLowerCase()
    const typeMap: Record<string, MessageType> = {
      text: MessageType.TEXT,
      image: MessageType.IMAGE,
      audio: MessageType.AUDIO,
      video: MessageType.VIDEO,
      document: MessageType.DOCUMENT,
      location: MessageType.LOCATION,
      contact: MessageType.CONTACT,
    }
    const prismaMessageType = typeMap[incomingType] ?? MessageType.TEXT

    // Crear el mensaje
    const message = await prisma.message.create({
      data: {
        organizationId,
        conversationId: conversation.id,
        content: messageContent,
        type: prismaMessageType,
        direction: MessageDirection.INCOMING,
        whatsappId: messageId,
        whatsappChannelId: whatsappChannel?.id ?? null,
        sentAt: messageTimestamp,
        metadata: messageMetadata,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        messageId: message.id,
        conversationId: conversation.id,
        contactId: contact.id
      }
    })
  } catch (error) {
    console.error('Error processing incoming message:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hubMode = searchParams.get('hub.mode')
    const hubChallenge = searchParams.get('hub.challenge')
    const hubVerifyToken = searchParams.get('hub.verify_token')

    // Verificación del webhook de WhatsApp
    if (hubMode === 'subscribe') {
      const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN
      if (hubVerifyToken === verifyToken) {
        return new NextResponse(hubChallenge, { status: 200 })
      } else {
        return NextResponse.json(
          { error: 'Token de verificación inválido' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json({ message: 'Webhook endpoint activo' })
  } catch (error) {
    console.error('Error in GET handler:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
