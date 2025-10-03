
/**
 * 🔄 API DE SINCRONIZACIÓN DE INTEGRACIONES
 * 
 * Endpoint para sincronizar datos de integraciones externas:
 * - Productos
 * - Pedidos
 * - Clientes
 * - Contactos
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import {
  createShopifyService,
  createWooCommerceService,
  createMailchimpService
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
    const { integrationId, syncType } = body

    // Validar parámetros
    if (!integrationId || !syncType) {
      return NextResponse.json(
        { error: 'integrationId y syncType son requeridos' },
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

    // Verificar permisos del usuario
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (user?.organizationId !== integration.organizationId) {
      return NextResponse.json(
        { error: 'No tienes permiso para esta integración' },
        { status: 403 }
      )
    }

    let result = { synced: 0, errors: 0 }

    // Sincronizar según el tipo de integración
    switch (integration.integration.name) {
      case 'shopify':
        result = await syncShopify(integration.id, syncType, integration.organizationId)
        break

      case 'woocommerce':
        result = await syncWooCommerce(integration.id, syncType, integration.organizationId)
        break

      case 'mailchimp':
        result = await syncMailchimp(integration.id, syncType, integration.organizationId)
        break

      default:
        return NextResponse.json(
          { error: 'Tipo de integración no soportado' },
          { status: 400 }
        )
    }

    // Registrar la sincronización en logs
    await prisma.integrationLog.create({
      data: {
        organizationIntegrationId: integration.id,
        eventType: `sync.${syncType}`,
        eventData: result,
        success: result.errors === 0,
        recordsProcessed: result.synced
      }
    })

    // Actualizar última sincronización
    await prisma.organizationIntegration.update({
      where: { id: integration.id },
      data: {
        lastSyncAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error('Error en sincronización:', error)
    return NextResponse.json(
      { error: 'Error al sincronizar' },
      { status: 500 }
    )
  }
}

async function syncShopify(
  integrationId: string,
  syncType: string,
  organizationId: string
) {
  const service = await createShopifyService(integrationId)
  if (!service) {
    throw new Error('No se pudo crear el servicio de Shopify')
  }

  switch (syncType) {
    case 'products':
      return await service.syncProducts(organizationId)
    case 'orders':
      return await service.syncOrders(organizationId)
    case 'customers':
      return await service.syncCustomers(organizationId)
    case 'all':
      const products = await service.syncProducts(organizationId)
      const orders = await service.syncOrders(organizationId)
      const customers = await service.syncCustomers(organizationId)
      return {
        synced: products.synced + orders.synced + customers.synced,
        errors: products.errors + orders.errors + customers.errors
      }
    default:
      throw new Error('Tipo de sincronización no válido')
  }
}

async function syncWooCommerce(
  integrationId: string,
  syncType: string,
  organizationId: string
) {
  const service = await createWooCommerceService(integrationId)
  if (!service) {
    throw new Error('No se pudo crear el servicio de WooCommerce')
  }

  switch (syncType) {
    case 'products':
      return await service.syncProducts(organizationId)
    case 'orders':
      return await service.syncOrders(organizationId)
    case 'customers':
      return await service.syncCustomers(organizationId)
    case 'all':
      const products = await service.syncProducts(organizationId)
      const orders = await service.syncOrders(organizationId)
      const customers = await service.syncCustomers(organizationId)
      return {
        synced: products.synced + orders.synced + customers.synced,
        errors: products.errors + orders.errors + customers.errors
      }
    default:
      throw new Error('Tipo de sincronización no válido')
  }
}

async function syncMailchimp(
  integrationId: string,
  syncType: string,
  organizationId: string
) {
  const service = await createMailchimpService(integrationId)
  if (!service) {
    throw new Error('No se pudo crear el servicio de Mailchimp')
  }

  // Para Mailchimp, necesitamos el listId de la configuración
  const integration = await prisma.organizationIntegration.findUnique({
    where: { id: integrationId }
  })

  const config = integration?.config as any
  const listId = config?.default_list_id

  if (!listId) {
    throw new Error('No se ha configurado un listId por defecto')
  }

  switch (syncType) {
    case 'contacts':
      return await service.syncContacts(organizationId, listId)
    default:
      throw new Error('Tipo de sincronización no válido para Mailchimp')
  }
}
