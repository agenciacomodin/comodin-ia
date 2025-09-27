
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { processIncomingMessage } from '@/lib/ai-broker'

const prisma = new PrismaClient()

// POST /api/crm/messages/incoming - Recibir mensaje entrante (webhook de WhatsApp o simulación)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Para este ejemplo, validamos que se proporcione organizationId
    // En un webhook real de WhatsApp, esto vendría en el token o configuración
    const { organizationId, conversationId, contactId, content, whatsappMessageId, whatsappChannelId } = body

    if (!organizationId || !content?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'OrganizationId y contenido son requeridos'
      }, { status: 400 })
    }

    // Verificar que la organización existe
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    })

    if (!organization) {
      return NextResponse.json({
        success: false,
        error: 'Organización no encontrada'
      }, { status: 404 })
    }

    let conversation
    let contact

    // Si se proporciona conversationId, usarlo
    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          organizationId
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

      contact = conversation.contact
    }
    // Si se proporciona contactId, buscar o crear conversación
    else if (contactId) {
      contact = await prisma.contact.findFirst({
        where: {
          id: contactId,
          organizationId
        }
      })

      if (!contact) {
        return NextResponse.json({
          success: false,
          error: 'Contacto no encontrado'
        }, { status: 404 })
      }

      // Buscar conversación existente o crear una nueva
      conversation = await prisma.conversation.findFirst({
        where: {
          contactId: contact.id,
          status: { in: ['OPEN', 'PENDING'] }
        },
        include: {
          contact: true
        }
      })

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            organizationId,
            contactId: contact.id,
            status: 'OPEN',
            priority: 'MEDIUM',
            whatsappChannelId,
            messageCount: 0,
            unreadCount: 0
          },
          include: {
            contact: true
          }
        })
      }
    }
    // Si no se proporciona conversación ni contacto, error
    else {
      return NextResponse.json({
        success: false,
        error: 'Debe proporcionar conversationId o contactId'
      }, { status: 400 })
    }

    // Crear el mensaje entrante
    const newMessage = await prisma.message.create({
      data: {
        organizationId,
        conversationId: conversation.id,
        direction: 'INCOMING',
        type: 'TEXT',
        content: content.trim(),
        whatsappId: whatsappMessageId,
        whatsappChannelId,
        isRead: false,
        sentAt: new Date()
      }
    })

    // Actualizar información de la conversación
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        lastMessageText: content.trim().substring(0, 100),
        lastMessageFrom: 'INCOMING',
        messageCount: { increment: 1 },
        unreadCount: { increment: 1 },
        status: 'OPEN' // Reabrir conversación si estaba cerrada
      }
    })

    // Actualizar fecha de último contacto
    await prisma.contact.update({
      where: { id: contact.id },
      data: {
        lastContact: new Date()
      }
    })

    let aiProcessingResult = null

    try {
      // *** AQUÍ ES DONDE LA INTELIGENCIA ARTIFICIAL SE ACTIVA ***
      // Procesar el mensaje con el AI Broker y ejecutar automatizaciones
      console.log(`🤖 Procesando mensaje con IA para organización ${organizationId}`)
      
      aiProcessingResult = await processIncomingMessage(
        organizationId,
        newMessage.id,
        content
      )

      console.log(`✅ IA procesamiento completado:`, {
        intentions: aiProcessingResult.analysis.detectedIntentions,
        confidence: aiProcessingResult.analysis.confidenceScore,
        automationsExecuted: aiProcessingResult.automationsExecuted,
        automationsSkipped: aiProcessingResult.automationsSkipped
      })

    } catch (aiError) {
      console.error('❌ Error en procesamiento de IA:', aiError)
      // No fallar la creación del mensaje por errores de IA
      // Solo log el error y continuar
    }

    return NextResponse.json({
      success: true,
      data: {
        messageId: newMessage.id,
        conversationId: conversation.id,
        contactId: contact.id,
        contactName: contact.name,
        aiProcessing: aiProcessingResult ? {
          analysis: aiProcessingResult.analysis,
          automationsExecuted: aiProcessingResult.automationsExecuted,
          automationsSkipped: aiProcessingResult.automationsSkipped
        } : null
      },
      message: 'Mensaje recibido y procesado exitosamente'
    })

  } catch (error) {
    console.error('Error procesando mensaje entrante:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}
