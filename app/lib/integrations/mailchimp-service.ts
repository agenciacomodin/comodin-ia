
/**
 * 📧 SERVICIO DE INTEGRACIÓN CON MAILCHIMP
 * 
 * Cliente para la API de Mailchimp que permite:
 * - Gestión de listas de suscriptores
 * - Creación y envío de campañas
 * - Sincronización de contactos
 * - Automatizaciones de email marketing
 * - Seguimiento de métricas
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface MailchimpConfig {
  apiKey: string
  serverPrefix: string // ej: us1, us2, etc.
}

export interface MailchimpList {
  id: string
  web_id: number
  name: string
  contact: {
    company: string
    address1: string
    city: string
    state: string
    zip: string
    country: string
  }
  stats: {
    member_count: number
    unsubscribe_count: number
    cleaned_count: number
    member_count_since_send: number
    unsubscribe_count_since_send: number
    cleaned_count_since_send: number
  }
  date_created: string
}

export interface MailchimpMember {
  id: string
  email_address: string
  unique_email_id: string
  status: 'subscribed' | 'unsubscribed' | 'cleaned' | 'pending'
  merge_fields: {
    FNAME?: string
    LNAME?: string
    PHONE?: string
    [key: string]: any
  }
  stats: {
    avg_open_rate: number
    avg_click_rate: number
  }
  tags: Array<{ id: number; name: string }>
  timestamp_signup?: string
  timestamp_opt?: string
}

export interface MailchimpCampaign {
  id: string
  web_id: number
  type: 'regular' | 'plaintext' | 'absplit' | 'rss' | 'variate'
  create_time: string
  send_time?: string
  status: 'save' | 'paused' | 'schedule' | 'sending' | 'sent'
  emails_sent: number
  settings: {
    subject_line: string
    preview_text: string
    title: string
    from_name: string
    reply_to: string
  }
  report_summary?: {
    opens: number
    unique_opens: number
    open_rate: number
    clicks: number
    subscriber_clicks: number
    click_rate: number
  }
}

export class MailchimpService {
  private config: MailchimpConfig
  private baseUrl: string

  constructor(config: MailchimpConfig) {
    this.config = config
    this.baseUrl = `https://${config.serverPrefix}.api.mailchimp.com/3.0`
  }

  /**
   * Realiza una petición a la API de Mailchimp
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const auth = Buffer.from(`anystring:${this.config.apiKey}`).toString('base64')

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Mailchimp API error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  // ==================== LISTAS ====================

  /**
   * Obtiene todas las listas de audiencia
   */
  async getLists(params?: {
    count?: number
    offset?: number
  }): Promise<{ lists: MailchimpList[]; total_items: number }> {
    const queryParams = new URLSearchParams()
    if (params?.count) queryParams.append('count', params.count.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())

    return this.request(`/lists?${queryParams.toString()}`)
  }

  /**
   * Obtiene una lista específica
   */
  async getList(listId: string): Promise<MailchimpList> {
    return this.request(`/lists/${listId}`)
  }

  /**
   * Crea una nueva lista de audiencia
   */
  async createList(data: {
    name: string
    contact: {
      company: string
      address1: string
      city: string
      state: string
      zip: string
      country: string
    }
    permission_reminder: string
    campaign_defaults: {
      from_name: string
      from_email: string
      subject: string
      language: string
    }
    email_type_option: boolean
  }): Promise<MailchimpList> {
    return this.request('/lists', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // ==================== MIEMBROS ====================

  /**
   * Obtiene todos los miembros de una lista
   */
  async getListMembers(
    listId: string,
    params?: {
      count?: number
      offset?: number
      status?: string
    }
  ): Promise<{ members: MailchimpMember[]; total_items: number }> {
    const queryParams = new URLSearchParams()
    if (params?.count) queryParams.append('count', params.count.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())
    if (params?.status) queryParams.append('status', params.status)

    return this.request(`/lists/${listId}/members?${queryParams.toString()}`)
  }

  /**
   * Obtiene un miembro específico
   */
  async getListMember(listId: string, subscriberHash: string): Promise<MailchimpMember> {
    return this.request(`/lists/${listId}/members/${subscriberHash}`)
  }

  /**
   * Añade o actualiza un miembro en una lista
   */
  async addOrUpdateMember(
    listId: string,
    data: {
      email_address: string
      status?: 'subscribed' | 'unsubscribed' | 'cleaned' | 'pending'
      merge_fields?: {
        FNAME?: string
        LNAME?: string
        PHONE?: string
        [key: string]: any
      }
      tags?: string[]
    }
  ): Promise<MailchimpMember> {
    // Calcular MD5 del email para el subscriber hash
    const crypto = require('crypto')
    const subscriberHash = crypto
      .createHash('md5')
      .update(data.email_address.toLowerCase())
      .digest('hex')

    return this.request(`/lists/${listId}/members/${subscriberHash}`, {
      method: 'PUT',
      body: JSON.stringify({
        email_address: data.email_address,
        status_if_new: data.status || 'subscribed',
        merge_fields: data.merge_fields,
        tags: data.tags
      })
    })
  }

  /**
   * Elimina un miembro de una lista
   */
  async deleteMember(listId: string, subscriberHash: string): Promise<void> {
    await this.request(`/lists/${listId}/members/${subscriberHash}`, {
      method: 'DELETE'
    })
  }

  /**
   * Sincroniza contactos de COMODÍN IA a Mailchimp
   */
  async syncContacts(
    organizationId: string,
    listId: string
  ): Promise<{
    synced: number
    errors: number
  }> {
    try {
      const contacts = await prisma.contact.findMany({
        where: {
          organizationId,
          email: { not: null }
        },
        take: 500
      })

      let synced = 0
      let errors = 0

      for (const contact of contacts) {
        if (!contact.email) continue

        try {
          await this.addOrUpdateMember(listId, {
            email_address: contact.email,
            status: 'subscribed',
            merge_fields: {
              FNAME: contact.name?.split(' ')[0] || '',
              LNAME: contact.name?.split(' ').slice(1).join(' ') || '',
              PHONE: contact.phone || ''
            }
          })
          synced++
        } catch (error) {
          console.error(`Error sincronizando contacto ${contact.id}:`, error)
          errors++
        }
      }

      return { synced, errors }
    } catch (error) {
      console.error('Error en syncContacts:', error)
      throw error
    }
  }

  // ==================== CAMPAÑAS ====================

  /**
   * Obtiene todas las campañas
   */
  async getCampaigns(params?: {
    count?: number
    offset?: number
    status?: string
  }): Promise<{ campaigns: MailchimpCampaign[]; total_items: number }> {
    const queryParams = new URLSearchParams()
    if (params?.count) queryParams.append('count', params.count.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())
    if (params?.status) queryParams.append('status', params.status)

    return this.request(`/campaigns?${queryParams.toString()}`)
  }

  /**
   * Obtiene una campaña específica
   */
  async getCampaign(campaignId: string): Promise<MailchimpCampaign> {
    return this.request(`/campaigns/${campaignId}`)
  }

  /**
   * Crea una nueva campaña
   */
  async createCampaign(data: {
    type: 'regular' | 'plaintext' | 'absplit' | 'rss' | 'variate'
    recipients: {
      list_id: string
    }
    settings: {
      subject_line: string
      preview_text?: string
      title: string
      from_name: string
      reply_to: string
    }
  }): Promise<MailchimpCampaign> {
    return this.request('/campaigns', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  /**
   * Envía una campaña
   */
  async sendCampaign(campaignId: string): Promise<void> {
    await this.request(`/campaigns/${campaignId}/actions/send`, {
      method: 'POST'
    })
  }

  // ==================== VALIDACIÓN Y TEST ====================

  /**
   * Verifica que las credenciales sean válidas
   */
  async testConnection(): Promise<{
    success: boolean
    accountName?: string
    error?: string
  }> {
    try {
      const response = await this.request<{ account_name: string }>('/')
      return {
        success: true,
        accountName: response.account_name
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }
}

/**
 * Crea una instancia del servicio de Mailchimp desde la configuración
 */
export async function createMailchimpService(
  organizationIntegrationId: string
): Promise<MailchimpService | null> {
  const integration = await prisma.organizationIntegration.findUnique({
    where: { id: organizationIntegrationId },
    include: { integration: true }
  })

  if (!integration || integration.integration.name !== 'mailchimp') {
    return null
  }

  const config = integration.config as any

  return new MailchimpService({
    apiKey: config.api_key,
    serverPrefix: config.server_prefix || config.api_key.split('-')[1] || 'us1'
  })
}
