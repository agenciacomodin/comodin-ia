
/**
 * API para procesar mensajes entrantes reales
 * Reemplaza las simulaciones por procesamiento real de webhooks
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import WhatsAppService from '@/lib/whatsapp-service'

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

    // Buscar o crear conversación
    const conversation = await prisma.conversation.upsert({
      where: {
        organizationId_contactId: {
          organizationId,
          contactId: contact.id
        }
      },
      update: {
        lastMessageAt: messageTimestamp,
        unreadCount: {
          increment: 1
        },
        status: 'OPEN'
      },
      create: {
        organizationId,
        contactId: contact.id,
        channel: 'WHATSAPP',
        status: 'OPEN',
        lastMessageAt: messageTimestamp,
        unreadCount: 1
      }
    })

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

    // Crear mensaje
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: contact.id,
        content: messageContent,
        type: type.toUpperCase(),
        direction: 'INBOUND',
        status: 'DELIVERED',
        whatsappMessageId: messageId,
        metadata: messageMetadata,
        sentAt: messageTimestamp
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
        
        trigger: {
          in: ['MESSAGE_RECEIVED', 'FIRST_MESSAGE', 'KEYWORD_MATCH']
        }
      }
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
              where: { direction: 'INBOUND' },
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

      switch (rule.trigger) {
        case 'MESSAGE_RECEIVED':
          shouldTrigger = true
          break
        
        case 'FIRST_MESSAGE':
          shouldTrigger = isFirstMessage
          break
        
        case 'KEYWORD_MATCH':
          const keywords = (rule.conditions as any)?.keywords || []
          shouldTrigger = keywords.some((keyword: string) => 
            messageContent.includes(keyword.toLowerCase())
          )
          break
      }

      if (shouldTrigger) {
        // Ejecutar la acción de la regla
        await executeAutomationAction(rule, conversationId, messageId)
      }
    }
  } catch (error) {
    console.error('Error triggering automations:', error)
  }
}

/**
 * Ejecuta una acción de automatización
 */
async function executeAutomationAction(rule: any, conversationId: string, messageId: string) {
  try {
    const action = rule.action
    const actionData = rule.actionData || {}

    switch (action) {
      case 'SEND_MESSAGE':
        if (actionData.message) {
          // Enviar mensaje automático
          const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { contact: true }
          })

          if (conversation) {
            await WhatsAppService.sendMessage(rule.organizationId, {
              to: conversation.contact.phone,
              type: 'text',
              text: { body: actionData.message }
            })

            // Guardar el mensaje enviado en la base de datos
            await prisma.message.create({
              data: {
                conversationId,
                senderId: 'system', // ID del sistema
                content: actionData.message,
                type: 'TEXT',
                direction: 'OUTBOUND',
                status: 'SENT',
                sentAt: new Date(),
                metadata: {
                  automation: {
                    ruleId: rule.id,
                    ruleName: rule.name,
                    triggeredBy: messageId
                  }
                }
              }
            })
          }
        }
        break

      case 'ADD_TAG':
        if (actionData.tagName) {
          const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { contact: true }
          })

          if (conversation) {
            // Buscar o crear el tag
            const tag = await prisma.contactTag.upsert({
              where: {
                organizationId_name: {
                  organizationId: rule.organizationId,
                  name: actionData.tagName
                }
              },
              update: {},
              create: {
                organizationId: rule.organizationId,
                name: actionData.tagName,
                color: actionData.tagColor || '#3B82F6'
              }
            })

            // Agregar el tag al contacto
            await prisma.contact.update({
              where: { id: conversation.contact.id },
              data: {
                tags: {
                  connect: { id: tag.id }
                }
              }
            })
          }
        }
        break

      case 'ASSIGN_AGENT':
        if (actionData.agentId) {
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { assignedToId: actionData.agentId }
          })
        }
        break
    }

    // Registrar la ejecución de la automatización
    await prisma.automationExecution.create({
      data: {
        ruleId: rule.id,
        conversationId,
        messageId,
        status: 'SUCCESS',
        executedAt: new Date(),
        metadata: {
          action,
          actionData
        }
      }
    })
  } catch (error) {
    console.error('Error executing automation action:', error)
    
    // Registrar el error
    await prisma.automationExecution.create({
      data: {
        ruleId: rule.id,
        conversationId,
        messageId,
        status: 'ERROR',
        executedAt: new Date(),
        error: error instanceof Error ? error.message : 'Error desconocido',
        metadata: {
          action: rule.action,
          actionData: rule.actionData
        }
      }
    })
  }
}
