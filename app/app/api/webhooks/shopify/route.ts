
/**
 * 🔔 WEBHOOK DE SHOPIFY
 * 
 * Recibe notificaciones en tiempo real de Shopify para:
 * - Nuevos pedidos
 * - Productos actualizados
 * - Clientes nuevos o actualizados
 * - Cambios en inventario
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import * as crypto from 'crypto'

const prisma = new PrismaClient()

/**
 * Verifica la autenticidad del webhook de Shopify
 */
function verifyShopifyWebhook(
  body: string,
  hmacHeader: string,
  secret: string
): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64')
  
  return hash === hmacHeader
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const hmacHeader = request.headers.get('x-shopify-hmac-sha256')
    const topic = request.headers.get('x-shopify-topic')
    const shopDomain = request.headers.get('x-shopify-shop-domain')

    if (!hmacHeader || !topic || !shopDomain) {
      return NextResponse.json(
        { error: 'Missing required headers' },
        { status: 400 }
      )
    }

    // Buscar la integración de Shopify para esta tienda
    const integration = await prisma.organizationIntegration.findFirst({
      where: {
        integration: {
          name: 'shopify'
        },
        config: {
          path: ['shop_domain'],
          equals: shopDomain
        }
      },
      include: {
        integration: true,
        organization: true
      }
    })

    if (!integration) {
      console.error(`No se encontró integración para ${shopDomain}`)
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      )
    }

    // Verificar firma HMAC
    const config = integration.config as any
    const webhookSecret = config.webhook_secret || config.access_token

    if (!verifyShopifyWebhook(body, hmacHeader, webhookSecret)) {
      console.error('Firma HMAC inválida')
      return NextResponse.json(
        { error: 'Invalid HMAC signature' },
        { status: 401 }
      )
    }

    const data = JSON.parse(body)

    // Procesar según el tipo de evento
    switch (topic) {
      case 'orders/create':
        await handleOrderCreated(integration.organizationId, data)
        break

      case 'orders/updated':
        await handleOrderUpdated(integration.organizationId, data)
        break

      case 'products/create':
      case 'products/update':
        await handleProductUpdated(integration.organizationId, data)
        break

      case 'customers/create':
      case 'customers/update':
        await handleCustomerUpdated(integration.organizationId, data)
        break

      default:
        console.log(`Evento no manejado: ${topic}`)
    }

    // Registrar el evento en los logs
    await prisma.integrationLog.create({
      data: {
        organizationIntegrationId: integration.id,
        eventType: topic,
        eventData: data,
        success: true
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error procesando webhook de Shopify:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Maneja la creación de un nuevo pedido
 */
async function handleOrderCreated(organizationId: string, order: any) {
  console.log(`📦 Nuevo pedido de Shopify: ${order.order_number}`)
  
  // Buscar o crear el contacto del cliente
  if (order.customer && order.customer.email) {
    const existingContact = await prisma.contact.findFirst({
      where: {
        organizationId,
        email: order.customer.email
      }
    })

    if (!existingContact) {
      await prisma.contact.create({
        data: {
          organizationId,
          name: `${order.customer.first_name} ${order.customer.last_name}`.trim(),
          email: order.customer.email,
          phone: order.customer.phone || undefined,
          metadata: {
            shopify_customer_id: order.customer.id,
            total_spent: order.customer.total_spent,
            orders_count: order.customer.orders_count
          }
        }
      })
    }
  }

  // Aquí puedes implementar lógica adicional como:
  // - Enviar notificación al equipo
  // - Crear tarea de seguimiento
  // - Iniciar automatización de confirmación de pedido
}

/**
 * Maneja la actualización de un pedido
 */
async function handleOrderUpdated(organizationId: string, order: any) {
  console.log(`📝 Pedido actualizado de Shopify: ${order.order_number}`)
  // Implementar lógica de actualización
}

/**
 * Maneja la creación/actualización de productos
 */
async function handleProductUpdated(organizationId: string, product: any) {
  console.log(`🛍️ Producto actualizado de Shopify: ${product.title}`)
  // Implementar lógica de sincronización de productos
}

/**
 * Maneja la creación/actualización de clientes
 */
async function handleCustomerUpdated(organizationId: string, customer: any) {
  console.log(`👤 Cliente actualizado de Shopify: ${customer.email}`)
  
  // Buscar contacto existente
  const existingContact = await prisma.contact.findFirst({
    where: {
      organizationId,
      email: customer.email
    }
  })

  if (existingContact) {
    // Actualizar contacto existente
    await prisma.contact.update({
      where: { id: existingContact.id },
      data: {
        name: `${customer.first_name} ${customer.last_name}`.trim(),
        phone: customer.phone || existingContact.phone,
        metadata: {
          ...(existingContact.metadata as any || {}),
          shopify_customer_id: customer.id,
          total_spent: customer.total_spent,
          orders_count: customer.orders_count,
          last_shopify_sync: new Date().toISOString()
        }
      }
    })
  } else {
    // Crear nuevo contacto
    await prisma.contact.create({
      data: {
        organizationId,
        name: `${customer.first_name} ${customer.last_name}`.trim(),
        email: customer.email,
        phone: customer.phone || undefined,
        metadata: {
          shopify_customer_id: customer.id,
          total_spent: customer.total_spent,
          orders_count: customer.orders_count
        }
      }
    })
  }
}
