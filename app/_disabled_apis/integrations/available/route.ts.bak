
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener integraciones disponibles (datos mock por ahora)
    const integrations = [
      {
        id: 'shopify',
        name: 'shopify',
        displayName: 'Shopify',
        description: 'Conecta tu tienda Shopify para sincronizar productos, pedidos y clientes automáticamente',
        type: 'ECOMMERCE',
        platform: 'SHOPIFY',
        iconUrl: null,
        brandColor: '#96BF48',
        isActive: true,
        authType: 'api_key',
        authFields: {
          shop_domain: {
            label: 'Dominio de la tienda',
            type: 'text',
            placeholder: 'mi-tienda.myshopify.com',
            required: true,
            description: 'Introduce el dominio de tu tienda Shopify'
          },
          access_token: {
            label: 'Token de acceso',
            type: 'password',
            placeholder: 'shpat_xxxxx',
            required: true,
            description: 'Token de acceso privado de Shopify'
          }
        },
        supportedFeatures: {
          'sync_products': 'Sincronización de productos',
          'sync_orders': 'Sincronización de pedidos',
          'sync_customers': 'Sincronización de clientes',
          'webhooks': 'Notificaciones en tiempo real'
        },
        documentation: 'https://help.shopify.com/en/api'
      },
      {
        id: 'woocommerce',
        name: 'woocommerce',
        displayName: 'WooCommerce',
        description: 'Integra tu tienda WooCommerce para gestionar productos y pedidos desde WhatsApp',
        type: 'ECOMMERCE',
        platform: 'WOOCOMMERCE',
        iconUrl: null,
        brandColor: '#96588A',
        isActive: true,
        authType: 'api_key',
        authFields: {
          site_url: {
            label: 'URL del sitio',
            type: 'text',
            placeholder: 'https://mi-tienda.com',
            required: true,
            description: 'URL completa de tu sitio WooCommerce'
          },
          consumer_key: {
            label: 'Consumer Key',
            type: 'text',
            placeholder: 'ck_xxxxx',
            required: true,
            description: 'Consumer Key de la API de WooCommerce'
          },
          consumer_secret: {
            label: 'Consumer Secret',
            type: 'password',
            placeholder: 'cs_xxxxx',
            required: true,
            description: 'Consumer Secret de la API de WooCommerce'
          }
        },
        supportedFeatures: {
          'sync_products': 'Sincronización de productos',
          'sync_orders': 'Sincronización de pedidos',
          'sync_customers': 'Sincronización de clientes',
          'inventory': 'Control de inventario'
        },
        documentation: 'https://woocommerce.github.io/woocommerce-rest-api-docs/'
      },
      {
        id: 'stripe',
        name: 'stripe',
        displayName: 'Stripe',
        description: 'Procesa pagos seguros y gestiona suscripciones directamente desde WhatsApp',
        type: 'PAYMENT',
        iconUrl: null,
        brandColor: '#635BFF',
        isActive: true,
        authType: 'api_key',
        authFields: {
          publishable_key: {
            label: 'Clave pública',
            type: 'text',
            placeholder: 'pk_xxxxx',
            required: true,
            description: 'Clave pública de Stripe'
          },
          secret_key: {
            label: 'Clave secreta',
            type: 'password',
            placeholder: 'sk_xxxxx',
            required: true,
            description: 'Clave secreta de Stripe'
          },
          webhook_secret: {
            label: 'Webhook Secret',
            type: 'password',
            placeholder: 'whsec_xxxxx',
            required: false,
            description: 'Secret para validar webhooks de Stripe'
          }
        },
        supportedFeatures: {
          'payments': 'Procesamiento de pagos',
          'subscriptions': 'Gestión de suscripciones',
          'invoices': 'Facturación automática',
          'webhooks': 'Notificaciones de eventos'
        },
        documentation: 'https://stripe.com/docs/api'
      },
      {
        id: 'google_analytics',
        name: 'google_analytics',
        displayName: 'Google Analytics',
        description: 'Rastrea conversiones y analiza el comportamiento de tus clientes desde WhatsApp',
        type: 'ANALYTICS',
        iconUrl: null,
        brandColor: '#FF6F00',
        isActive: true,
        authType: 'oauth',
        authFields: {
          measurement_id: {
            label: 'Measurement ID',
            type: 'text',
            placeholder: 'G-XXXXXXXXXX',
            required: true,
            description: 'ID de medición de Google Analytics 4'
          },
          api_secret: {
            label: 'API Secret',
            type: 'password',
            placeholder: 'xxxxx',
            required: true,
            description: 'API Secret para enviar eventos'
          }
        },
        supportedFeatures: {
          'events': 'Seguimiento de eventos',
          'conversions': 'Seguimiento de conversiones',
          'ecommerce': 'Ecommerce tracking',
          'custom_dimensions': 'Dimensiones personalizadas'
        },
        documentation: 'https://developers.google.com/analytics/devguides/collection/ga4'
      },
      {
        id: 'mailchimp',
        name: 'mailchimp',
        displayName: 'Mailchimp',
        description: 'Sincroniza contactos y automatiza campañas de email marketing basadas en conversaciones',
        type: 'EMAIL',
        iconUrl: null,
        brandColor: '#FFE01B',
        isActive: true,
        authType: 'api_key',
        authFields: {
          api_key: {
            label: 'API Key',
            type: 'password',
            placeholder: 'xxxxx-us1',
            required: true,
            description: 'API Key de Mailchimp'
          },
          server: {
            label: 'Servidor',
            type: 'text',
            placeholder: 'us1',
            required: true,
            description: 'Prefijo del servidor (ej: us1, us2, etc.)'
          }
        },
        supportedFeatures: {
          'sync_contacts': 'Sincronización de contactos',
          'campaigns': 'Gestión de campañas',
          'automation': 'Automatización de marketing',
          'segmentation': 'Segmentación de audiencias'
        },
        documentation: 'https://mailchimp.com/developer/marketing/'
      }
    ]

    return NextResponse.json({
      success: true,
      data: integrations
    })

  } catch (error) {
    console.error('Error in available integrations API:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
