
/**
 * 📊 SERVICIO DE INTEGRACIÓN CON GOOGLE ANALYTICS 4
 * 
 * Cliente para la API de Google Analytics 4 que permite:
 * - Envío de eventos personalizados
 * - Tracking de conversiones
 * - Seguimiento de usuarios
 * - Análisis de comportamiento
 * - Integración con WhatsApp
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface GoogleAnalyticsConfig {
  measurementId: string // G-XXXXXXXXXX
  apiSecret: string
  propertyId?: string
}

export interface GAEvent {
  name: string
  params?: {
    [key: string]: string | number | boolean
  }
}

export interface GAUser {
  client_id?: string
  user_id?: string
  user_properties?: {
    [key: string]: {
      value: string | number | boolean
    }
  }
}

export class GoogleAnalyticsService {
  private config: GoogleAnalyticsConfig
  private baseUrl: string

  constructor(config: GoogleAnalyticsConfig) {
    this.config = config
    this.baseUrl = 'https://www.google-analytics.com/mp/collect'
  }

  /**
   * Envía un evento a Google Analytics 4
   */
  async sendEvent(params: {
    clientId: string
    userId?: string
    events: GAEvent[]
    userProperties?: {
      [key: string]: {
        value: string | number | boolean
      }
    }
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const payload: any = {
        client_id: params.clientId,
        events: params.events
      }
      
      // Solo agregar user_id si está definido
      if (params.userId) {
        payload.user_id = params.userId
      }
      
      // Solo agregar user_properties si están definidas
      if (params.userProperties) {
        payload.user_properties = params.userProperties
      }

      const url = `${this.baseUrl}?measurement_id=${this.config.measurementId}&api_secret=${this.config.apiSecret}`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Google Analytics API error: ${response.status} - ${error}`)
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  // ==================== EVENTOS PREDEFINIDOS ====================

  /**
   * Registra una conversación iniciada
   */
  async trackConversationStarted(params: {
    clientId: string
    userId?: string
    organizationId: string
    channel: string
  }): Promise<void> {
    await this.sendEvent({
      clientId: params.clientId,
      userId: params.userId,
      events: [{
        name: 'conversation_started',
        params: {
          organization_id: params.organizationId,
          channel: params.channel,
          timestamp: Date.now()
        }
      }]
    })
  }

  /**
   * Registra un mensaje enviado
   */
  async trackMessageSent(params: {
    clientId: string
    userId?: string
    organizationId: string
    messageType: 'text' | 'image' | 'document' | 'audio'
    automated: boolean
  }): Promise<void> {
    await this.sendEvent({
      clientId: params.clientId,
      userId: params.userId,
      events: [{
        name: 'message_sent',
        params: {
          organization_id: params.organizationId,
          message_type: params.messageType,
          automated: params.automated,
          timestamp: Date.now()
        }
      }]
    })
  }

  /**
   * Registra una campaña enviada
   */
  async trackCampaignSent(params: {
    clientId: string
    userId?: string
    organizationId: string
    campaignId: string
    campaignName: string
    recipientsCount: number
  }): Promise<void> {
    await this.sendEvent({
      clientId: params.clientId,
      userId: params.userId,
      events: [{
        name: 'campaign_sent',
        params: {
          organization_id: params.organizationId,
          campaign_id: params.campaignId,
          campaign_name: params.campaignName,
          recipients_count: params.recipientsCount,
          timestamp: Date.now()
        }
      }]
    })
  }

  /**
   * Registra un contacto creado
   */
  async trackContactCreated(params: {
    clientId: string
    userId?: string
    organizationId: string
    contactId: string
    source: string
  }): Promise<void> {
    await this.sendEvent({
      clientId: params.clientId,
      userId: params.userId,
      events: [{
        name: 'contact_created',
        params: {
          organization_id: params.organizationId,
          contact_id: params.contactId,
          source: params.source,
          timestamp: Date.now()
        }
      }]
    })
  }

  /**
   * Registra una automatización ejecutada
   */
  async trackAutomationTriggered(params: {
    clientId: string
    userId?: string
    organizationId: string
    automationId: string
    automationName: string
    triggerType: string
  }): Promise<void> {
    await this.sendEvent({
      clientId: params.clientId,
      userId: params.userId,
      events: [{
        name: 'automation_triggered',
        params: {
          organization_id: params.organizationId,
          automation_id: params.automationId,
          automation_name: params.automationName,
          trigger_type: params.triggerType,
          timestamp: Date.now()
        }
      }]
    })
  }

  /**
   * Registra una integración conectada
   */
  async trackIntegrationConnected(params: {
    clientId: string
    userId?: string
    organizationId: string
    integrationType: string
    integrationName: string
  }): Promise<void> {
    await this.sendEvent({
      clientId: params.clientId,
      userId: params.userId,
      events: [{
        name: 'integration_connected',
        params: {
          organization_id: params.organizationId,
          integration_type: params.integrationType,
          integration_name: params.integrationName,
          timestamp: Date.now()
        }
      }]
    })
  }

  /**
   * Registra una venta/conversión
   */
  async trackConversion(params: {
    clientId: string
    userId?: string
    organizationId: string
    value: number
    currency: string
    transactionId?: string
  }): Promise<void> {
    const eventParams: any = {
      organization_id: params.organizationId,
      value: params.value,
      currency: params.currency,
      timestamp: Date.now()
    }
    
    // Solo agregar transaction_id si está definido
    if (params.transactionId) {
      eventParams.transaction_id = params.transactionId
    }
    
    await this.sendEvent({
      clientId: params.clientId,
      userId: params.userId,
      events: [{
        name: 'purchase',
        params: eventParams
      }]
    })
  }

  // ==================== VALIDACIÓN Y TEST ====================

  /**
   * Verifica que la configuración sea válida enviando un evento de prueba
   */
  async testConnection(): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const result = await this.sendEvent({
        clientId: 'test_client_' + Date.now(),
        events: [{
          name: 'test_connection',
          params: {
            test: true,
            timestamp: Date.now()
          }
        }]
      })

      return result
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  /**
   * Genera un client_id único para tracking
   */
  static generateClientId(): string {
    return `${Date.now()}.${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * Crea una instancia del servicio de Google Analytics desde la configuración
 */
export async function createGoogleAnalyticsService(
  organizationIntegrationId: string
): Promise<GoogleAnalyticsService | null> {
  const integration = await prisma.organizationIntegration.findUnique({
    where: { id: organizationIntegrationId },
    include: { integration: true }
  })

  if (!integration || integration.integration.name !== 'google_analytics') {
    return null
  }

  const config = integration.config as any

  return new GoogleAnalyticsService({
    measurementId: config.measurement_id,
    apiSecret: config.api_secret,
    propertyId: config.property_id
  })
}
