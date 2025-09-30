
/**
 * Evolution API - WhatsApp Business Integration
 * La mejor solución para conectar WhatsApp con código QR
 */

interface EvolutionInstance {
  instanceName: string
  instanceId: string
  status: 'CONNECTING' | 'OPEN' | 'CLOSED' | 'PAIRING'
  qrcode?: string
  base64?: string
  phone?: string
  profilePictureUrl?: string
  profileName?: string
}

interface EvolutionMessage {
  key: {
    remoteJid: string
    fromMe: boolean
    id: string
  }
  message: {
    conversation?: string
    imageMessage?: {
      url: string
      caption?: string
    }
    documentMessage?: {
      url: string
      fileName: string
      mimetype: string
    }
  }
  messageTimestamp: number
  pushName?: string
}

export class EvolutionAPI {
  private baseUrl: string
  private apiKey: string
  
  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.apiKey = apiKey
  }

  private async request(endpoint: string, method: string = 'GET', data?: any) {
    const url = `${this.baseUrl}${endpoint}`
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'apiKey': this.apiKey
      }
    }

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data)
    }

    const response = await fetch(url, options)
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Evolution API Error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  /**
   * Crea una nueva instancia de WhatsApp
   */
  async createInstance(instanceName: string): Promise<any> {
    return this.request('/instance/create', 'POST', {
      instanceName,
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS'
    })
  }

  /**
   * Obtiene información de una instancia
   */
  async getInstance(instanceName: string): Promise<EvolutionInstance> {
    return this.request(`/instance/fetchInstances?instanceName=${instanceName}`)
  }

  /**
   * Conecta la instancia (genera código QR)
   */
  async connectInstance(instanceName: string): Promise<any> {
    return this.request(`/instance/connect/${instanceName}`, 'GET')
  }

  /**
   * Obtiene el código QR para conectar
   */
  async getQRCode(instanceName: string): Promise<{ qrcode: string; base64: string }> {
    return this.request(`/instance/qrcode/${instanceName}`)
  }

  /**
   * Obtiene el estado de la conexión
   */
  async getConnectionState(instanceName: string): Promise<{ state: string }> {
    return this.request(`/instance/connectionState/${instanceName}`)
  }

  /**
   * Envía un mensaje de texto
   */
  async sendTextMessage(instanceName: string, to: string, message: string): Promise<any> {
    const cleanNumber = to.replace(/[^\d]/g, '')
    const whatsappNumber = cleanNumber.includes('@') ? cleanNumber : `${cleanNumber}@s.whatsapp.net`
    
    return this.request(`/message/sendText/${instanceName}`, 'POST', {
      number: whatsappNumber,
      textMessage: {
        text: message
      }
    })
  }

  /**
   * Envía una imagen
   */
  async sendImageMessage(instanceName: string, to: string, imageUrl: string, caption?: string): Promise<any> {
    const cleanNumber = to.replace(/[^\d]/g, '')
    const whatsappNumber = cleanNumber.includes('@') ? cleanNumber : `${cleanNumber}@s.whatsapp.net`
    
    return this.request(`/message/sendMedia/${instanceName}`, 'POST', {
      number: whatsappNumber,
      mediaMessage: {
        mediatype: 'image',
        media: imageUrl,
        caption: caption || ''
      }
    })
  }

  /**
   * Envía un documento
   */
  async sendDocumentMessage(instanceName: string, to: string, documentUrl: string, fileName: string): Promise<any> {
    const cleanNumber = to.replace(/[^\d]/g, '')
    const whatsappNumber = cleanNumber.includes('@') ? cleanNumber : `${cleanNumber}@s.whatsapp.net`
    
    return this.request(`/message/sendMedia/${instanceName}`, 'POST', {
      number: whatsappNumber,
      mediaMessage: {
        mediatype: 'document',
        media: documentUrl,
        fileName
      }
    })
  }

  /**
   * Obtiene información del perfil
   */
  async getProfile(instanceName: string): Promise<any> {
    return this.request(`/chat/fetchProfile/${instanceName}`)
  }

  /**
   * Lista todas las instancias
   */
  async listInstances(): Promise<EvolutionInstance[]> {
    const response = await this.request('/instance/fetchInstances')
    return Array.isArray(response) ? response : []
  }

  /**
   * Elimina una instancia
   */
  async deleteInstance(instanceName: string): Promise<any> {
    return this.request(`/instance/delete/${instanceName}`, 'DELETE')
  }

  /**
   * Reinicia una instancia
   */
  async restartInstance(instanceName: string): Promise<any> {
    return this.request(`/instance/restart/${instanceName}`, 'PUT')
  }

  /**
   * Desconecta una instancia
   */
  async logoutInstance(instanceName: string): Promise<any> {
    return this.request(`/instance/logout/${instanceName}`, 'DELETE')
  }

  /**
   * Configura webhook para recibir mensajes
   */
  async setWebhook(instanceName: string, webhookUrl: string): Promise<any> {
    return this.request(`/webhook/set/${instanceName}`, 'POST', {
      webhook: {
        url: webhookUrl,
        enabled: true,
        webhookByEvents: true,
        webhookBase64: false,
        events: [
          'APPLICATION_STARTUP',
          'QRCODE_UPDATED',
          'MESSAGES_UPSERT',
          'MESSAGES_UPDATE',
          'MESSAGES_DELETE',
          'SEND_MESSAGE',
          'CONTACTS_SET',
          'CONTACTS_UPSERT',
          'CONTACTS_UPDATE',
          'PRESENCE_UPDATE',
          'CHATS_SET',
          'CHATS_UPSERT',
          'CHATS_UPDATE',
          'CHATS_DELETE',
          'GROUPS_UPSERT',
          'GROUP_UPDATE',
          'GROUP_PARTICIPANTS_UPDATE',
          'CONNECTION_UPDATE',
          'CALL',
          'NEW_JWT_TOKEN'
        ]
      }
    })
  }
}

export default EvolutionAPI
