
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { integrationId, config } = body

    // Verificar si la integración ya existe
    const existingIntegration = await prisma.organizationIntegration.findUnique({
      where: {
        organizationId_integrationId: {
          organizationId: session.user.organizationId,
          integrationId
        }
      }
    })

    if (existingIntegration) {
      return NextResponse.json(
        { success: false, error: 'Integración ya conectada' },
        { status: 400 }
      )
    }

    // Buscar la integración base (crear si no existe)
    let integration = await prisma.integration.findUnique({
      where: { name: integrationId }
    })

    if (!integration) {
      // Crear integración base basada en el ID
      const integrationData = getIntegrationData(integrationId)
      if (!integrationData) {
        return NextResponse.json(
          { success: false, error: 'Integración no soportada' },
          { status: 400 }
        )
      }

      integration = await prisma.integration.create({
        data: integrationData
      })
    }

    // Crear la conexión de la organización
    const organizationIntegration = await prisma.organizationIntegration.create({
      data: {
        organizationId: session.user.organizationId,
        integrationId: integration.id,
        status: 'PENDING',
        config,
        name: `${integration.displayName} - ${session.user.organizationId}`,
        configuredBy: session.user.id
      },
      include: {
        integration: true
      }
    })

    // Aquí se podría validar la conexión y actualizar el estado
    // Por ahora, la marcamos como conectada
    await prisma.organizationIntegration.update({
      where: {
        id: organizationIntegration.id
      },
      data: {
        status: 'CONNECTED'
      }
    })

    return NextResponse.json({
      success: true,
      data: organizationIntegration
    })

  } catch (error) {
    console.error('Error in connect integration API:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

function getIntegrationData(integrationId: string) {
  const integrations: Record<string, any> = {
    shopify: {
      name: 'shopify',
      displayName: 'Shopify',
      description: 'Conecta tu tienda Shopify para sincronizar productos, pedidos y clientes automáticamente',
      type: 'ECOMMERCE',
      platform: 'SHOPIFY',
      authType: 'api_key',
      authFields: {
        shop_domain: {
          label: 'Dominio de la tienda',
          type: 'text',
          required: true
        },
        access_token: {
          label: 'Token de acceso',
          type: 'password',
          required: true
        }
      },
      supportedFeatures: {
        sync_products: true,
        sync_orders: true,
        sync_customers: true,
        webhooks: true
      },
      brandColor: '#96BF48'
    },
    woocommerce: {
      name: 'woocommerce',
      displayName: 'WooCommerce',
      description: 'Integra tu tienda WooCommerce para gestionar productos y pedidos desde WhatsApp',
      type: 'ECOMMERCE',
      platform: 'WOOCOMMERCE',
      authType: 'api_key',
      authFields: {
        site_url: {
          label: 'URL del sitio',
          type: 'text',
          required: true
        },
        consumer_key: {
          label: 'Consumer Key',
          type: 'text',
          required: true
        },
        consumer_secret: {
          label: 'Consumer Secret',
          type: 'password',
          required: true
        }
      },
      supportedFeatures: {
        sync_products: true,
        sync_orders: true,
        sync_customers: true,
        inventory: true
      },
      brandColor: '#96588A'
    },
    stripe: {
      name: 'stripe',
      displayName: 'Stripe',
      description: 'Procesa pagos seguros y gestiona suscripciones directamente desde WhatsApp',
      type: 'PAYMENT',
      authType: 'api_key',
      authFields: {
        publishable_key: {
          label: 'Clave pública',
          type: 'text',
          required: true
        },
        secret_key: {
          label: 'Clave secreta',
          type: 'password',
          required: true
        }
      },
      supportedFeatures: {
        payments: true,
        subscriptions: true,
        invoices: true,
        webhooks: true
      },
      brandColor: '#635BFF'
    },
    google_analytics: {
      name: 'google_analytics',
      displayName: 'Google Analytics',
      description: 'Rastrea conversiones y analiza el comportamiento de tus clientes desde WhatsApp',
      type: 'ANALYTICS',
      authType: 'oauth',
      authFields: {
        measurement_id: {
          label: 'Measurement ID',
          type: 'text',
          required: true
        },
        api_secret: {
          label: 'API Secret',
          type: 'password',
          required: true
        }
      },
      supportedFeatures: {
        events: true,
        conversions: true,
        ecommerce: true,
        custom_dimensions: true
      },
      brandColor: '#FF6F00'
    },
    mailchimp: {
      name: 'mailchimp',
      displayName: 'Mailchimp',
      description: 'Sincroniza contactos y automatiza campañas de email marketing basadas en conversaciones',
      type: 'EMAIL',
      authType: 'api_key',
      authFields: {
        api_key: {
          label: 'API Key',
          type: 'password',
          required: true
        },
        server: {
          label: 'Servidor',
          type: 'text',
          required: true
        }
      },
      supportedFeatures: {
        sync_contacts: true,
        campaigns: true,
        automation: true,
        segmentation: true
      },
      brandColor: '#FFE01B'
    }
  }

  return integrations[integrationId] || null
}
