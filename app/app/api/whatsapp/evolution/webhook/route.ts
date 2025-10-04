
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    
    console.log('WhatsApp Webhook received:', JSON.stringify(payload, null, 2))

    // Obtener instancia desde el payload
    const instanceName = payload.instance || payload.instanceName

    if (!instanceName) {
      console.log('No instance name in webhook payload')
      return NextResponse.json({ success: true })
    }

    // Buscar la organización que corresponde a esta instancia
    const orgIntegration = await prisma.organizationIntegration.findFirst({
      where: {
        config: {
          path: ['instanceName'],
          equals: instanceName
        }
      }
    })

    if (!orgIntegration) {
      console.log(`No organization found for instance: ${instanceName}`)
      return NextResponse.json({ success: true })
    }

    const organizationId = orgIntegration.organizationId

    // Procesar diferentes tipos de eventos
    if (payload.event === 'messages.upsert' && payload.data?.messages) {
      await processIncomingMessages(payload.data.messages, organizationId)
    } else if (payload.event === 'connection.update') {
      await processConnectionUpdate(payload.data, instanceName, organizationId)
    } else if (payload.event === 'qrcode.updated') {
      await processQRCodeUpdate(payload.data, instanceName)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

async function processIncomingMessages(messages: any[], organizationId: string) {
  for (const message of messages) {
    try {
      if (message.key.fromMe) {
        // Ignorar mensajes enviados por nosotros
        continue
      }

      const phoneNumber = message.key.remoteJid?.replace('@s.whatsapp.net', '') || ''
      const messageContent = message.message?.conversation || 
                           message.message?.extendedTextMessage?.text || 
                           '[Multimedia]'
      const messageId = message.key.id
      const timestamp = new Date(parseInt(message.messageTimestamp) * 1000)
      const senderName = message.pushName || phoneNumber

      // Buscar o crear contacto
      const contact = await prisma.contact.upsert({
        where: {
          organizationId_phone: {
            organizationId,
            phone: phoneNumber
          }
        },
        update: {
          name: senderName,
          lastContact: timestamp
        },
        create: {
          organizationId,
          name: senderName,
          phone: phoneNumber,
          whatsappId: phoneNumber,
          source: 'WHATSAPP',
          status: 'ACTIVE',
          lastContact: timestamp
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
            lastMessageAt: timestamp,
            unreadCount: {
              increment: 1
            }
          }
        })
      } else {
        conversation = await prisma.conversation.create({
          data: {
            organizationId,
            contactId: contact.id,
            status: 'OPEN',
            lastMessageAt: timestamp,
            unreadCount: 1,
            whatsappChatId: phoneNumber // Usar el número como chat ID
          }
        })
      }

      // Crear mensaje
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          organizationId: conversation.organizationId,
          content: messageContent,
          type: 'TEXT',
          direction: 'INCOMING',
          whatsappId: messageId,
          metadata: {
            whatsapp: {
              instance: message.instance,
              timestamp: message.messageTimestamp,
              pushName: message.pushName
            }
          },
          sentAt: timestamp
        }
      })

      console.log(`Processed incoming WhatsApp message from ${phoneNumber}`)

    } catch (error) {
      console.error('Error processing message:', error)
    }
  }
}

async function processConnectionUpdate(data: any, instanceName: string, organizationId: string) {
  try {
    const connectionState = data.state || data.connection

    let status = 'CONNECTING'
    if (connectionState === 'open') {
      status = 'CONNECTED'
    } else if (connectionState === 'close') {
      status = 'DISCONNECTED'
    }

    // Actualizar estado en la base de datos
    await prisma.organizationIntegration.updateMany({
      where: {
        organizationId,
        config: {
          path: ['instanceName'],
          equals: instanceName
        }
      },
      data: {
        status: status as any,
        config: {
          instanceName,
          connectionState,
          updatedAt: new Date().toISOString()
        }
      }
    })

    console.log(`Updated connection status for ${instanceName}: ${status}`)

  } catch (error) {
    console.error('Error processing connection update:', error)
  }
}

async function processQRCodeUpdate(data: any, instanceName: string) {
  try {
    // El QR code se maneja en tiempo real por polling desde el frontend
    console.log(`QR Code updated for instance: ${instanceName}`)
  } catch (error) {
    console.error('Error processing QR code update:', error)
  }
}
