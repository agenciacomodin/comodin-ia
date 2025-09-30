
/**
 * WhatsApp Business API Service (Producción)
 * Conecta con la API real de Meta/Facebook
 */

import { prisma } from '@/lib/db'

interface WhatsAppConfig {
  accessToken: string
  phoneNumberId: string
  businessAccountId: string
  webhookVerifyToken: string
}

interface WhatsAppMessage {
  to: string
  type: 'text' | 'image' | 'document' | 'template'
  text?: {
    body: string
  }
  image?: {
    link: string
    caption?: string
  }
  document?: {
    link: string
    filename: string
  }
  template?: {
    name: string
    language: {
      code: string
    }
    components?: Array<any>
  }
}

interface WhatsAppResponse {
  success: boolean
  messageId?: string
  error?: string
  data?: any
}

export class WhatsAppService {
  private static readonly API_VERSION = 'v17.0'
  private static readonly BASE_URL = `https://graph.facebook.com/${this.API_VERSION}`

  /**
   * Obtiene la configuración de WhatsApp para una organización
   */
  static async getOrgConfig(organizationId: string): Promise<WhatsAppConfig | null> {
    try {
      const orgIntegration = await prisma.organizationIntegration.findFirst({
        where: {
          organizationId,
          integration: {
            name: 'whatsapp-business'
          },
          status: 'CONNECTED'
        },
        include: {
          integration: true
        }
      })

      if (!orgIntegration?.config) {
        return null
      }

      const config = orgIntegration.config as any
      return {
        accessToken: config.accessToken,
        phoneNumberId: config.phoneNumberId,
        businessAccountId: config.businessAccountId,
        webhookVerifyToken: config.webhookVerifyToken || process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || ''
      }
    } catch (error) {
      console.error('Error getting WhatsApp config:', error)
      return null
    }
  }

  /**
   * Envía un mensaje de WhatsApp
   */
  static async sendMessage(
    organizationId: string,
    message: WhatsAppMessage
  ): Promise<WhatsAppResponse> {
    try {
      const config = await this.getOrgConfig(organizationId)
      if (!config) {
        return {
          success: false,
          error: 'WhatsApp no configurado para esta organización'
        }
      }

      const url = `${this.BASE_URL}/${config.phoneNumberId}/messages`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: message.to,
          type: message.type,
          ...this.formatMessagePayload(message)
        })
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || 'Error al enviar mensaje',
          data
        }
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
        data
      }
    } catch (error) {
      console.error('Error sending WhatsApp message:', error)
      return {
        success: false,
        error: 'Error interno al enviar mensaje'
      }
    }
  }

  /**
   * Verifica el webhook de WhatsApp
   */
  static verifyWebhook(token: string, expectedToken: string): boolean {
    return token === expectedToken
  }

  /**
   * Procesa webhooks entrantes de WhatsApp
   */
  static async processWebhook(payload: any, organizationId: string) {
    try {
      if (!payload.entry) return

      for (const entry of payload.entry) {
        if (!entry.changes) continue

        for (const change of entry.changes) {
          if (change.field !== 'messages') continue

          const value = change.value
          if (!value.messages) continue

          for (const message of value.messages) {
            await this.processIncomingMessage(message, value, organizationId)
          }
        }
      }
    } catch (error) {
      console.error('Error processing WhatsApp webhook:', error)
    }
  }

  /**
   * Procesa mensaje entrante
   */
  private static async processIncomingMessage(
    message: any,
    value: any,
    organizationId: string
  ) {
    try {
      const phoneNumber = message.from
      const messageText = message.text?.body || ''
      const messageType = message.type || 'text'
      const messageId = message.id
      const timestamp = new Date(parseInt(message.timestamp) * 1000)

      // Buscar o crear contacto
      const contact = await prisma.contact.upsert({
        where: {
          organizationId_phone: {
            organizationId,
            phone: phoneNumber
          }
        },
        update: {
          lastContactAt: timestamp
        },
        create: {
          organizationId,
          name: value.contacts?.[0]?.profile?.name || phoneNumber,
          phone: phoneNumber,
          whatsappId: phoneNumber,
          source: 'WHATSAPP',
          status: 'ACTIVE',
          lastContactAt: timestamp
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
          lastMessageAt: timestamp,
          unreadCount: {
            increment: 1
          }
        },
        create: {
          organizationId,
          contactId: contact.id,
          channel: 'WHATSAPP',
          status: 'OPEN',
          lastMessageAt: timestamp,
          unreadCount: 1
        }
      })

      // Crear mensaje
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: contact.id,
          content: messageText,
          type: messageType,
          direction: 'INBOUND',
          status: 'DELIVERED',
          whatsappMessageId: messageId,
          metadata: {
            whatsapp: {
              timestamp: message.timestamp,
              context: message.context || null
            }
          },
          sentAt: timestamp
        }
      })

      console.log(`Processed incoming WhatsApp message from ${phoneNumber}`)
    } catch (error) {
      console.error('Error processing incoming message:', error)
    }
  }

  /**
   * Obtiene el estado de un mensaje
   */
  static async getMessageStatus(
    organizationId: string,
    messageId: string
  ): Promise<any> {
    try {
      const config = await this.getOrgConfig(organizationId)
      if (!config) {
        throw new Error('WhatsApp no configurado')
      }

      const url = `${this.BASE_URL}/${messageId}`
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${config.accessToken}`
        }
      })

      return await response.json()
    } catch (error) {
      console.error('Error getting message status:', error)
      return null
    }
  }

  /**
   * Formatea el payload del mensaje según el tipo
   */
  private static formatMessagePayload(message: WhatsAppMessage): any {
    const payload: any = {}

    switch (message.type) {
      case 'text':
        if (message.text) {
          payload.text = message.text
        }
        break

      case 'image':
        if (message.image) {
          payload.image = message.image
        }
        break

      case 'document':
        if (message.document) {
          payload.document = message.document
        }
        break

      case 'template':
        if (message.template) {
          payload.template = message.template
        }
        break
    }

    return payload
  }
}

export default WhatsAppService
