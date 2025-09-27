
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentOrganization } from '@/lib/multi-tenant'
import { prisma } from '@/lib/db'
import { hasPermission, Permission } from '@/lib/permissions'

// POST /api/integrations/test-connection - Probar credenciales de una integración
export async function POST(request: NextRequest) {
  try {
    const { user } = await getCurrentOrganization()
    
    if (!hasPermission(user.role, Permission.CONNECT_INTEGRATIONS)) {
      return NextResponse.json(
        { error: 'No tienes permisos para probar integraciones' },
        { status: 403 }
      )
    }

    const data = await request.json()
    const { integrationId, credentials, features } = data

    // Obtener la integración
    const integration = await prisma.integration.findUnique({
      where: { id: integrationId }
    })

    if (!integration) {
      return NextResponse.json(
        { error: 'Integración no encontrada' },
        { status: 404 }
      )
    }

    // Probar conexión según la plataforma
    let testResult: { success: boolean; error: string; storeInfo: any } = { success: false, error: '', storeInfo: null }

    try {
      switch (integration.platform) {
        case 'SHOPIFY':
          testResult = await testShopifyConnection(credentials)
          break
        case 'WOOCOMMERCE':
          testResult = await testWooCommerceConnection(credentials)
          break
        case 'TIENDANUBE':
          testResult = await testTiendaNubeConnection(credentials)
          break
        default:
          testResult = {
            success: false,
            error: 'Plataforma no soportada para pruebas automáticas',
            storeInfo: null
          }
      }
    } catch (error) {
      console.error('Error testing connection:', error)
      testResult = {
        success: false,
        error: 'Error al probar la conexión',
        storeInfo: null
      }
    }

    return NextResponse.json(testResult)
  } catch (error) {
    console.error('Error in test-connection endpoint:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Función para probar conexión con Shopify
async function testShopifyConnection(credentials: any) {
  const { shop_domain, access_token } = credentials

  if (!shop_domain || !access_token) {
    return {
      success: false,
      error: 'Dominio de tienda y token de acceso son requeridos',
      storeInfo: null
    }
  }

  try {
    // Probar llamada a la API de Shopify
    const response = await fetch(`https://${shop_domain}/admin/api/2023-10/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': access_token,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        success: false,
        error: `Error de Shopify: ${response.status} - ${errorText}`,
        storeInfo: null
      }
    }

    const data = await response.json()
    const shop = data.shop

    // Obtener información adicional como número de productos
    const productsResponse = await fetch(`https://${shop_domain}/admin/api/2023-10/products/count.json`, {
      headers: {
        'X-Shopify-Access-Token': access_token,
        'Content-Type': 'application/json'
      }
    })

    let productsCount = 0
    if (productsResponse.ok) {
      const productsData = await productsResponse.json()
      productsCount = productsData.count || 0
    }

    return {
      success: true,
      error: '',
      storeInfo: {
        name: shop.name,
        url: shop.domain,
        email: shop.email,
        currency: shop.currency,
        timezone: shop.timezone,
        productsCount
      }
    }
  } catch (error) {
    return {
      success: false,
      error: `Error al conectar con Shopify: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      storeInfo: null
    }
  }
}

// Función para probar conexión con WooCommerce
async function testWooCommerceConnection(credentials: any) {
  const { site_url, consumer_key, consumer_secret } = credentials

  if (!site_url || !consumer_key || !consumer_secret) {
    return {
      success: false,
      error: 'URL del sitio, Consumer Key y Consumer Secret son requeridos',
      storeInfo: null
    }
  }

  try {
    // Crear autenticación básica
    const auth = Buffer.from(`${consumer_key}:${consumer_secret}`).toString('base64')
    
    // Probar llamada a la API de WooCommerce
    const response = await fetch(`${site_url}/wp-json/wc/v3/system_status`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        success: false,
        error: `Error de WooCommerce: ${response.status} - ${errorText}`,
        storeInfo: null
      }
    }

    const systemStatus = await response.json()

    // Obtener información de productos
    const productsResponse = await fetch(`${site_url}/wp-json/wc/v3/products?per_page=1`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    })

    let productsCount = 0
    if (productsResponse.ok) {
      const totalHeader = productsResponse.headers.get('X-WP-Total')
      productsCount = totalHeader ? parseInt(totalHeader) : 0
    }

    return {
      success: true,
      error: '',
      storeInfo: {
        name: systemStatus.settings?.title || 'Tienda WooCommerce',
        url: site_url,
        version: systemStatus.environment?.wp_version,
        wc_version: systemStatus.environment?.wc_version,
        productsCount
      }
    }
  } catch (error) {
    return {
      success: false,
      error: `Error al conectar con WooCommerce: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      storeInfo: null
    }
  }
}

// Función para probar conexión con TiendaNube
async function testTiendaNubeConnection(credentials: any) {
  const { store_id, access_token } = credentials

  if (!store_id || !access_token) {
    return {
      success: false,
      error: 'ID de tienda y token de acceso son requeridos',
      storeInfo: null
    }
  }

  try {
    // Probar llamada a la API de TiendaNube
    const response = await fetch(`https://api.tiendanube.com/v1/${store_id}/store`, {
      headers: {
        'Authentication': `bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        success: false,
        error: `Error de TiendaNube: ${response.status} - ${errorText}`,
        storeInfo: null
      }
    }

    const storeData = await response.json()

    // Obtener información de productos
    const productsResponse = await fetch(`https://api.tiendanube.com/v1/${store_id}/products?per_page=1`, {
      headers: {
        'Authentication': `bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    })

    let productsCount = 0
    if (productsResponse.ok) {
      const productsData = await productsResponse.json()
      productsCount = Array.isArray(productsData) ? productsData.length : 0
      // Para obtener el total real necesitaríamos hacer más llamadas o usar headers si los proporcionan
    }

    return {
      success: true,
      error: '',
      storeInfo: {
        name: storeData.name?.es || storeData.name,
        url: storeData.url,
        email: storeData.email,
        currency: storeData.currency,
        country: storeData.country,
        productsCount
      }
    }
  } catch (error) {
    return {
      success: false,
      error: `Error al conectar con TiendaNube: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      storeInfo: null
    }
  }
}
