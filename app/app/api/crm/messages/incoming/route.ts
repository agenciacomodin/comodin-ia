
/**
 * API para procesar mensajes entrantes reales
 * Reemplaza las simulaciones por procesamiento real de webhooks
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { MessageType, MessageDirection } from '@prisma/client'

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

    const messageTimestamp = timestamp ? new Date(parseInt(timestamp) * 1000) : new Date()
    const phoneNumber = from.replace(/\D/g, '') // Solo números

    // Buscar o crear contacto
    const contact = await prisma.contact.upsert({
      where: {
        organizationId_phone: {
          organizationId,
          phone: phoneNumber
        }
      },
      update: {
        name: contactName || undefined,
        lastContact: messageTimestamp,
        
        status: 'ACTIVE'
      },
      create: {
        organizationId,
        name: contactName || `+${phoneNumber}`,
        phone: phoneNumber,
        whatsappId: phoneNumber,
        source: 'WHATSAPP',
        status: 'ACTIVE',
        
        lastContact: messageTimestamp
      }
    })

    // Buscar conversación abierta o crear nueva
    let conversation = await prisma.conversation.findFirst({
      where: {
        organizationId,
        contactId: contact.id,
        status: { in: ['OPEN', 'PENDING'] }
      }
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          organizationId,
          contactId: contact.id,
          status: 'OPEN',
          lastMessageAt: messageTimestamp,
          unreadCount: 1,
          lastMessageFrom: MessageDirection.INCOMING
        }
      })
    } else {
      conversation = await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: messageTimestamp,
          lastMessageText: content.substring(0, 200), // Preview del último mensaje
          lastMessageFrom: MessageDirection.INCOMING,
          unreadCount: {
            increment: 1
          },
          status: 'OPEN'
        }
      })
    }

    // Mapear el tipo entrante a enum MessageType
    const incomingType = String(type ?? 'text').toLowerCase()
    const typeMap: Record<string, MessageType> = {
      text: MessageType.TEXT,
      image: MessageType.IMAGE,
      audio: MessageType.AUDIO,
      video: MessageType.VIDEO,
      document: MessageType.DOCUMENT,
      sticker: MessageType.IMAGE, // Los stickers se tratan como imágenes
      location: MessageType.LOCATION,
      contact: MessageType.CONTACT,
      voice: MessageType.AUDIO, // Las notas de voz se tratan como audio
    }
    const prismaMessageType = typeMap[incomingType] ?? MessageType.TEXT

    // Preparar contenido del mensaje según el tipo
    let messageContent = content
    let messageMetadata: any = {
      whatsapp: {
        messageId,
        timestamp: timestamp || Date.now(),
        context: context || null
      }
    }

    if (type !== 'text' && mediaUrl) {
      messageContent = `[${type.toUpperCase()}]${mediaCaption ? ` ${mediaCaption}` : ''}`
      messageMetadata.whatsapp.mediaUrl = mediaUrl
      messageMetadata.whatsapp.caption = mediaCaption
    }

    // Crear mensaje usando enums correctos
    const message = await prisma.message.create({
      data: {
        organizationId,
        conversationId: conversation.id,
        sentBy: null, // Para mensajes INCOMING, sentBy es null (el contacto no es un usuario del sistema)
        content: messageContent,
        type: prismaMessageType,              // ✅ enum correcto
        direction: MessageDirection.INCOMING, // ✅ enum correcto
        whatsappId: messageId,
        sentAt: messageTimestamp,
        metadata: messageMetadata
      }
    })

    // Ejecutar automaciones si existen
    await triggerAutomations(conversation.id, message.id, organizationId)

    console.log(`Processed incoming message from ${phoneNumber} in org ${organizationId}`)

    return NextResponse.json({
      success: true,
      data: {
        messageId: message.id,
        conversationId: conversation.id,
        contactId: contact.id,
        contactName: contact.name,
        message: messageContent
      }
    })
  } catch (error) {
    console.error('Error processing incoming message:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * Ejecutar automaciones basadas en el mensaje entrante
 */
async function triggerAutomations(conversationId: string, messageId: string, organizationId: string) {
  try {
    // Buscar reglas de automatización activas para esta organización
    const automationRules = await prisma.automationRule.findMany({
      where: {
        organizationId,
        isActive: true
      },
      include: {
        conditions: true,
        actions: {
          orderBy: { executionOrder: 'asc' }
        }
      },
      orderBy: { priority: 'asc' }
    })

    if (automationRules.length === 0) {
      return
    }

    // Obtener información del mensaje y conversación
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: {
          include: {
            contact: true,
            messages: {
              where: { direction: 'INCOMING' },
              orderBy: { sentAt: 'asc' },
              take: 1
            }
          }
        }
      }
    })

    if (!message) return

    const isFirstMessage = message.conversation.messages.length === 1
    const messageContent = message.content.toLowerCase()

    // Evaluar cada regla
    for (const rule of automationRules) {
      let shouldTrigger = false

      // Evaluar todas las condiciones de la regla
      if (rule.conditions && rule.conditions.length > 0) {
        // Por simplicidad, aplicamos lógica AND a todas las condiciones
        shouldTrigger = rule.conditions.every(condition => {
          switch (condition.type) {
            case 'FIRST_MESSAGE':
              return isFirstMessage
            
            case 'KEYWORDS_CONTAINS':
              if (!condition.keywords || condition.keywords.length === 0) return true
              return condition.keywords.some((keyword: string) => 
                messageContent.includes(keyword.toLowerCase())
              )
            
            default:
              return true // Condiciones no implementadas se consideran como verdaderas
          }
        })
      } else {
        // Si no hay condiciones, se ejecuta siempre
        shouldTrigger = true
      }

      if (shouldTrigger) {
        // Ejecutar las acciones de la regla
        for (const action of rule.actions) {
          await executeAutomationAction(action, conversationId, messageId, rule.organizationId, rule.id)
        }
        
        // Actualizar estadísticas de la regla
        await prisma.automationRule.update({
          where: { id: rule.id },
          data: {
            executionCount: { increment: 1 },
            successCount: { increment: 1 },
            lastExecutedAt: new Date()
          }
        })
      }
    }
  } catch (error) {
    console.error('Error triggering automations:', error)
  }
}

/**
 * Ejecuta una acción de automatización
 */
async function executeAutomationAction(action: any, conversationId: string, messageId: string, organizationId: string, ruleId?: string) {
  try {
    switch (action.type) {
      case 'AUTO_REPLY':
        if (action.replyMessage) {
          // Enviar mensaje automático
          const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { contact: true }
          })

          if (conversation) {
            // Solo guardar el mensaje - el envío real se maneja por otro proceso

            // Guardar el mensaje enviado en la base de datos
            await prisma.message.create({
              data: {
                organizationId: conversation.organizationId,
                conversationId,
                sentBy: null, // Mensaje automático del sistema
                sentByName: 'Sistema', // Indicar que es del sistema
                content: action.replyMessage,
                type: MessageType.TEXT,
                direction: MessageDirection.OUTGOING,
                sentAt: new Date(),
                metadata: {
                  automation: {
                    actionId: action.id,
                    actionType: action.type,
                    triggeredBy: messageId
                  }
                }
              }
            })
          }
        }
        break

      case 'ADD_TAG':
        if (action.data?.tagName) {
          const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { contact: true }
          })

          if (conversation) {
            // Buscar o crear el tag
            const tag = await prisma.contactTag.upsert({
              where: {
                contactId_name: {
                  contactId: conversation.contact.id,
                  name: action.data.tagName
                }
              },
              update: {},
              create: {
                organizationId: organizationId,
                contactId: conversation.contact.id,
                name: action.data.tagName,
                color: action.data.tagColor || '#3B82F6'
              }
            })
          }
        }
        break

      case 'ASSIGN_AGENT':
        if (action.data.agentId) {
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { assignedAgentId: action.data.agentId }
          })
        }
        break
    }

    // Registrar la ejecución de la automatización
    if (ruleId) {
      await prisma.automationExecution.create({
        data: {
          ruleId,
          conversationId,
          messageId,
          success: true
        }
      })
    }
  } catch (error) {
    console.error('Error executing automation action:', error)
    
    // Registrar el error
    if (ruleId) {
      await prisma.automationExecution.create({
        data: {
          ruleId,
          conversationId,
          messageId,
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        }
      })
    }
  }
}
