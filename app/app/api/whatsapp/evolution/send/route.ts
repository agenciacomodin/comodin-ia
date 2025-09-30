
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import EvolutionAPI from '@/lib/evolution-api'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { organizationId, to, message, type = 'text', mediaUrl, fileName } = await request.json()

    if (!organizationId || !to || !message) {
      return NextResponse.json({ 
        error: 'organizationId, to y message son requeridos' 
      }, { status: 400 })
    }

    // Verificar acceso a la organización
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      }
    })

    if (!user || user.organizationId !== organizationId) {
      return NextResponse.json({ error: 'Sin acceso a la organización' }, { status: 403 })
    }

    // Obtener configuración de WhatsApp
    const orgIntegration = await prisma.organizationIntegration.findFirst({
      where: {
        organizationId,
        integrationId: 'whatsapp-evolution',
        status: 'CONNECTED'
      }
    })

    if (!orgIntegration?.config) {
      return NextResponse.json({
        error: 'WhatsApp no conectado para esta organización'
      }, { status: 400 })
    }

    const config = orgIntegration.config as any
    const instanceName = config.instanceName

    if (!instanceName) {
      return NextResponse.json({
        error: 'Configuración de WhatsApp incompleta'
      }, { status: 400 })
    }

    // Configurar Evolution API
    const evolutionUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080'
    const evolutionKey = process.env.EVOLUTION_API_KEY || 'comodin_ia_key'
    
    const evolutionAPI = new EvolutionAPI(evolutionUrl, evolutionKey)

    // Enviar mensaje según el tipo
    let result
    switch (type) {
      case 'text':
        result = await evolutionAPI.sendTextMessage(instanceName, to, message)
        break
      case 'image':
        if (!mediaUrl) {
          return NextResponse.json({ error: 'mediaUrl requerido para imágenes' }, { status: 400 })
        }
        result = await evolutionAPI.sendImageMessage(instanceName, to, mediaUrl, message)
        break
      case 'document':
        if (!mediaUrl || !fileName) {
          return NextResponse.json({ error: 'mediaUrl y fileName requeridos para documentos' }, { status: 400 })
        }
        result = await evolutionAPI.sendDocumentMessage(instanceName, to, mediaUrl, fileName)
        break
      default:
        return NextResponse.json({ error: 'Tipo de mensaje no soportado' }, { status: 400 })
    }

    // Buscar o crear contacto
    const phoneNumber = to.replace(/[^\d]/g, '')
    const contact = await prisma.contact.upsert({
      where: {
        organizationId_phone: {
          organizationId,
          phone: phoneNumber
        }
      },
      update: {
        lastContact: new Date()
      },
      create: {
        organizationId,
        name: phoneNumber,
        phone: phoneNumber,
        whatsappId: phoneNumber,
        source: 'WHATSAPP',
        status: 'ACTIVE',
        lastContact: new Date()
      }
    })

    // Buscar o crear conversación
    let conversation = await prisma.conversation.findFirst({
      where: {
        organizationId,
        contactId: contact.id
      }
    })

    if (conversation) {
      conversation = await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: new Date()
        }
      })
    } else {
      conversation = await prisma.conversation.create({
        data: {
          organizationId,
          contactId: contact.id,
          status: 'OPEN',
          lastMessageAt: new Date(),
          unreadCount: 0,
          whatsappChatId: phoneNumber // Usar el número como chat ID
        }
      })
    }

    // Guardar mensaje enviado
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: session.user.id,
        content: message,
        type: type,
        direction: 'OUTGOING',
        status: 'SENT',
        whatsappMessageId: result.key?.id,
        metadata: {
          whatsapp: {
            instance: instanceName,
            to: to,
            mediaUrl: mediaUrl || null,
            fileName: fileName || null
          }
        },
        sentAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      messageId: result.key?.id,
      conversationId: conversation.id
    })

  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}
