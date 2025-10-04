
/**
 * ⚡ API DE ACCIONES DE INTEGRACIONES
 * 
 * Endpoint para ejecutar acciones específicas en integraciones:
 * - Crear productos
 * - Actualizar pedidos
 * - Enviar campañas de email
 * - Registrar eventos en Google Analytics
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import {
  createShopifyService,
  createWooCommerceService,
  createMailchimpService,
  createGoogleAnalyticsService
} from '@/lib/integrations'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { integrationId, action, params } = body

    if (!integrationId || !action) {
      return NextResponse.json(
        { error: 'integrationId y action son requeridos' },
        { status: 400 }
      )
    }

    // Obtener la integración
    const integration = await prisma.organizationIntegration.findUnique({
      where: { id: integrationId },
      include: {
        integration: true,
        organization: true
      }
    })

    if (!integration) {
      return NextResponse.json(
        { error: 'Integración no encontrada' },
        { status: 404 }
      )
    }

    // Verificar permisos
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (user?.organizationId !== integration.organizationId) {
      return NextResponse.json(
        { error: 'No tienes permiso para esta integración' },
        { status: 403 }
      )
    }

    let result: any

    // Ejecutar acción según el tipo de integración
    switch (integration.integration.name) {
      case 'shopify':
        result = await executeShopifyAction(integration.id, action, params)
        break

      case 'woocommerce':
        result = await executeWooCommerceAction(integration.id, action, params)
        break

      case 'mailchimp':
        result = await executeMailchimpAction(integration.id, action, params)
        break

      case 'google_analytics':
        result = await executeGoogleAnalyticsAction(integration.id, action, params)
        break

      default:
        return NextResponse.json(
          { error: 'Tipo de integración no soportado' },
          { status: 400 }
        )
    }

    // Registrar la acción en logs
    await prisma.integrationLog.create({
      data: {
        organizationIntegrationId: integration.id,
        eventType: `action.${action}`,
        eventData: { params, result },
        success: true
      }
    })

    return NextResponse.json({
      success: true,
      result
    })
  } catch (error) {
    console.error('Error ejecutando acción:', error)
    return NextResponse.json(
      {
        error: 'Error al ejecutar la acción',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

async function executeShopifyAction(
  integrationId: string,
  action: string,
  params: any
) {
  const service = await createShopifyService(integrationId)
  if (!service) {
    throw new Error('No se pudo crear el servicio de Shopify')
  }

  switch (action) {
    case 'getProduct':
      return await service.getProduct(params.productId)
    case 'getOrder':
      return await service.getOrder(params.orderId)
    case 'updateInventory':
      return await service.updateInventory(params)
    default:
      throw new Error(`Acción no soportada: ${action}`)
  }
}

async function executeWooCommerceAction(
  integrationId: string,
  action: string,
  params: any
) {
  const service = await createWooCommerceService(integrationId)
  if (!service) {
    throw new Error('No se pudo crear el servicio de WooCommerce')
  }

  switch (action) {
    case 'getProduct':
      return await service.getProduct(params.productId)
    case 'createProduct':
      return await service.createProduct(params.product)
    case 'updateProduct':
      return await service.updateProduct(params.productId, params.data)
    case 'getOrder':
      return await service.getOrder(params.orderId)
    case 'updateOrderStatus':
      return await service.updateOrderStatus(params.orderId, params.status)
    default:
      throw new Error(`Acción no soportada: ${action}`)
  }
}

async function executeMailchimpAction(
  integrationId: string,
  action: string,
  params: any
) {
  const service = await createMailchimpService(integrationId)
  if (!service) {
    throw new Error('No se pudo crear el servicio de Mailchimp')
  }

  switch (action) {
    case 'getLists':
      return await service.getLists(params)
    case 'addMember':
      return await service.addOrUpdateMember(params.listId, params.member)
    case 'getCampaigns':
      return await service.getCampaigns(params)
    case 'createCampaign':
      return await service.createCampaign(params.campaign)
    case 'sendCampaign':
      await service.sendCampaign(params.campaignId)
      return { success: true }
    default:
      throw new Error(`Acción no soportada: ${action}`)
  }
}

async function executeGoogleAnalyticsAction(
  integrationId: string,
  action: string,
  params: any
) {
  const service = await createGoogleAnalyticsService(integrationId)
  if (!service) {
    throw new Error('No se pudo crear el servicio de Google Analytics')
  }

  switch (action) {
    case 'trackEvent':
      return await service.sendEvent(params)
    case 'trackConversation':
      return await service.trackConversationStarted(params)
    case 'trackMessage':
      return await service.trackMessageSent(params)
    case 'trackCampaign':
      return await service.trackCampaignSent(params)
    case 'trackConversion':
      return await service.trackConversion(params)
    default:
      throw new Error(`Acción no soportada: ${action}`)
  }
}
