
/**
 * 🔔 WEBHOOK DE WOOCOMMERCE
 * 
 * Recibe notificaciones en tiempo real de WooCommerce para:
 * - Nuevos pedidos
 * - Productos actualizados
 * - Clientes nuevos
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import * as crypto from 'crypto'

const prisma = new PrismaClient()

/**
 * Verifica la autenticidad del webhook de WooCommerce
 */
function verifyWooCommerceWebhook(
  body: string,
  signature: string,
  secret: string
): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('base64')
  
  return hash === signature
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-wc-webhook-signature')
    const topic = request.headers.get('x-wc-webhook-topic')
    const source = request.headers.get('x-wc-webhook-source')

    if (!signature || !topic || !source) {
      return NextResponse.json(
        { error: 'Missing required headers' },
        { status: 400 }
      )
    }

    // Buscar la integración de WooCommerce para este sitio
    const integration = await prisma.organizationIntegration.findFirst({
      where: {
        integration: {
          name: 'woocommerce'
        },
        config: {
          path: ['site_url'],
          string_contains: source
        }
      },
      include: {
        integration: true,
        organization: true
      }
    })

    if (!integration) {
      console.error(`No se encontró integración para ${source}`)
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      )
    }

    // Verificar firma
    const config = integration.config as any
    const webhookSecret = config.webhook_secret || config.consumer_secret

    if (!verifyWooCommerceWebhook(body, signature, webhookSecret)) {
      console.error('Firma inválida')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const data = JSON.parse(body)

    // Procesar según el tipo de evento
    switch (topic) {
      case 'order.created':
      case 'order.updated':
        await handleOrderEvent(integration.organizationId, data)
        break

      case 'product.created':
      case 'product.updated':
        await handleProductEvent(integration.organizationId, data)
        break

      case 'customer.created':
      case 'customer.updated':
        await handleCustomerEvent(integration.organizationId, data)
        break

      default:
        console.log(`Evento no manejado: ${topic}`)
    }

    // Registrar el evento
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
    console.error('Error procesando webhook de WooCommerce:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleOrderEvent(organizationId: string, order: any) {
  console.log(`📦 Evento de pedido WooCommerce: ${order.number}`)
  
  if (order.billing && order.billing.email) {
    const existingContact = await prisma.contact.findFirst({
      where: {
        organizationId,
        email: order.billing.email
      }
    })

    if (!existingContact) {
      await prisma.contact.create({
        data: {
          organizationId,
          name: `${order.billing.first_name} ${order.billing.last_name}`.trim(),
          email: order.billing.email,
          phone: order.billing.phone || undefined,
          metadata: {
            woocommerce_customer_id: order.customer_id,
            last_order_id: order.id,
            last_order_total: order.total
          }
        }
      })
    }
  }
}

async function handleProductEvent(organizationId: string, product: any) {
  console.log(`🛍️ Producto WooCommerce actualizado: ${product.name}`)
}

async function handleCustomerEvent(organizationId: string, customer: any) {
  console.log(`👤 Cliente WooCommerce actualizado: ${customer.email}`)
  
  const existingContact = await prisma.contact.findFirst({
    where: {
      organizationId,
      email: customer.email
    }
  })

  if (existingContact) {
    await prisma.contact.update({
      where: { id: existingContact.id },
      data: {
        name: `${customer.first_name} ${customer.last_name}`.trim(),
        phone: customer.billing?.phone || existingContact.phone,
        metadata: {
          ...(existingContact.metadata as any || {}),
          woocommerce_customer_id: customer.id,
          last_woocommerce_sync: new Date().toISOString()
        }
      }
    })
  } else {
    await prisma.contact.create({
      data: {
        organizationId,
        name: `${customer.first_name} ${customer.last_name}`.trim(),
        email: customer.email,
        phone: customer.billing?.phone || undefined,
        metadata: {
          woocommerce_customer_id: customer.id
        }
      }
    })
  }
}
