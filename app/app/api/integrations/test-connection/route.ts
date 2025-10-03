
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.organizationId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { integrationName, authData } = body

    if (!integrationName || !authData) {
      return NextResponse.json(
        { success: false, error: 'Datos de prueba incompletos' },
        { status: 400 }
      )
    }

    // Realizar pruebas reales de conexión según el tipo de integración
    const testResult = await testRealConnection(integrationName, authData)

    return NextResponse.json(testResult)
  } catch (error) {
    console.error('Error testing connection:', error)
    return NextResponse.json(
      { success: false, error: 'Error al probar la conexión' },
      { status: 500 }
    )
  }
}

/**
 * Prueba conexiones reales con servicios externos
 */
async function testRealConnection(integrationName: string, authData: any) {
  try {
    switch (integrationName.toLowerCase()) {
      case 'whatsapp-business':
        return await testWhatsAppConnection(authData)
      
      case 'stripe':
        return await testStripeConnection(authData)
      
      case 'mercadopago':
        return await testMercadoPagoConnection(authData)
      
      case 'google':
        return await testGoogleConnection(authData)
      
      case 'openai':
        return await testOpenAIConnection(authData)
      
      case 'n8n':
        return await testN8NConnection(authData)
      
      case 'shopify':
        return await testShopifyConnection(authData)
      
      case 'woocommerce':
        return await testWooCommerceConnection(authData)
      
      case 'mailchimp':
        return await testMailchimpConnection(authData)
      
      case 'google_analytics':
        return await testGoogleAnalyticsConnection(authData)
      
      default:
        return {
          success: false,
          error: `Integración ${integrationName} no soportada`
        }
    }
  } catch (error) {
    console.error(`Error testing ${integrationName}:`, error)
    return {
      success: false,
      error: 'Error interno al probar la conexión'
    }
  }
}

/**
 * Prueba conexión con WhatsApp Business API
 */
async function testWhatsAppConnection(authData: any) {
  const { accessToken, phoneNumberId } = authData

  if (!accessToken || !phoneNumberId) {
    return { success: false, error: 'Access Token y Phone Number ID son requeridos' }
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        message: 'WhatsApp Business conectado exitosamente',
        data: { phoneNumber: data.display_phone_number }
      }
    } else {
      const errorData = await response.json()
      return {
        success: false,
        error: `Error de WhatsApp: ${errorData.error?.message || 'Credenciales inválidas'}`
      }
    }
  } catch (error) {
    return { success: false, error: 'Error al conectar con WhatsApp API' }
  }
}

/**
 * Prueba conexión con Stripe
 */
async function testStripeConnection(authData: any) {
  const { secretKey } = authData

  if (!secretKey) {
    return { success: false, error: 'Secret Key es requerido' }
  }

  try {
    const response = await fetch('https://api.stripe.com/v1/account', {
      headers: {
        'Authorization': `Bearer ${secretKey}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        message: 'Stripe conectado exitosamente',
        data: { accountId: data.id, country: data.country }
      }
    } else {
      return { success: false, error: 'Credenciales de Stripe inválidas' }
    }
  } catch (error) {
    return { success: false, error: 'Error al conectar con Stripe API' }
  }
}

/**
 * Prueba conexión con MercadoPago
 */
async function testMercadoPagoConnection(authData: any) {
  const { accessToken } = authData

  if (!accessToken) {
    return { success: false, error: 'Access Token es requerido' }
  }

  try {
    const response = await fetch(`https://api.mercadopago.com/users/me?access_token=${accessToken}`)

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        message: 'MercadoPago conectado exitosamente',
        data: { userId: data.id, country: data.country_id }
      }
    } else {
      return { success: false, error: 'Credenciales de MercadoPago inválidas' }
    }
  } catch (error) {
    return { success: false, error: 'Error al conectar con MercadoPago API' }
  }
}

/**
 * Prueba conexión con Google
 */
async function testGoogleConnection(authData: any) {
  const { clientId, clientSecret } = authData

  if (!clientId || !clientSecret) {
    return { success: false, error: 'Client ID y Client Secret son requeridos' }
  }

  // Para Google OAuth, solo validamos que las credenciales tengan formato válido
  if (clientId.includes('googleusercontent.com') && clientSecret.length > 20) {
    return {
      success: true,
      message: 'Credenciales de Google válidas'
    }
  } else {
    return { success: false, error: 'Credenciales de Google inválidas' }
  }
}

/**
 * Prueba conexión con OpenAI
 */
async function testOpenAIConnection(authData: any) {
  const { apiKey } = authData

  if (!apiKey) {
    return { success: false, error: 'API Key es requerido' }
  }

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      return {
        success: true,
        message: 'OpenAI conectado exitosamente'
      }
    } else {
      return { success: false, error: 'API Key de OpenAI inválido' }
    }
  } catch (error) {
    return { success: false, error: 'Error al conectar con OpenAI API' }
  }
}

/**
 * Prueba conexión con N8N
 */
async function testN8NConnection(authData: any) {
  const { url, apiKey } = authData

  if (!url) {
    return { success: false, error: 'URL de N8N es requerida' }
  }

  try {
    const testUrl = `${url}/api/v1/workflows`
    const headers: any = { 'Content-Type': 'application/json' }
    
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`
    }

    const response = await fetch(testUrl, { headers })

    if (response.ok) {
      return {
        success: true,
        message: 'N8N conectado exitosamente'
      }
    } else {
      return { success: false, error: 'Error al conectar con N8N' }
    }
  } catch (error) {
    return { success: false, error: 'Error al conectar con N8N API' }
  }
}

/**
 * Prueba conexión con Shopify
 */
async function testShopifyConnection(authData: any) {
  const { shop_domain, access_token } = authData

  if (!shop_domain || !access_token) {
    return { success: false, error: 'Shop Domain y Access Token son requeridos' }
  }

  try {
    const apiVersion = '2024-01'
    const url = `https://${shop_domain}/admin/api/${apiVersion}/shop.json`
    
    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': access_token,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        message: `Shopify conectado exitosamente`,
        data: { shopName: data.shop.name, domain: data.shop.domain }
      }
    } else {
      return { success: false, error: 'Credenciales de Shopify inválidas' }
    }
  } catch (error) {
    return { success: false, error: 'Error al conectar con Shopify API' }
  }
}

/**
 * Prueba conexión con WooCommerce
 */
async function testWooCommerceConnection(authData: any) {
  const { site_url, consumer_key, consumer_secret } = authData

  if (!site_url || !consumer_key || !consumer_secret) {
    return { success: false, error: 'Site URL, Consumer Key y Consumer Secret son requeridos' }
  }

  try {
    const cleanUrl = site_url.replace(/\/$/, '')
    const url = `${cleanUrl}/wp-json/wc/v3/system_status`
    
    const auth = Buffer.from(`${consumer_key}:${consumer_secret}`).toString('base64')
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        message: 'WooCommerce conectado exitosamente',
        data: { siteUrl: data.environment?.site_url || site_url }
      }
    } else {
      return { success: false, error: 'Credenciales de WooCommerce inválidas' }
    }
  } catch (error) {
    return { success: false, error: 'Error al conectar con WooCommerce API' }
  }
}

/**
 * Prueba conexión con Mailchimp
 */
async function testMailchimpConnection(authData: any) {
  const { api_key } = authData

  if (!api_key) {
    return { success: false, error: 'API Key es requerido' }
  }

  try {
    // Extraer el servidor del API key (ej: us1, us2)
    const serverPrefix = api_key.split('-')[1] || 'us1'
    const url = `https://${serverPrefix}.api.mailchimp.com/3.0/`
    
    const auth = Buffer.from(`anystring:${api_key}`).toString('base64')
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        message: 'Mailchimp conectado exitosamente',
        data: { accountName: data.account_name }
      }
    } else {
      return { success: false, error: 'API Key de Mailchimp inválido' }
    }
  } catch (error) {
    return { success: false, error: 'Error al conectar con Mailchimp API' }
  }
}

/**
 * Prueba conexión con Google Analytics
 */
async function testGoogleAnalyticsConnection(authData: any) {
  const { measurement_id, api_secret } = authData

  if (!measurement_id || !api_secret) {
    return { success: false, error: 'Measurement ID y API Secret son requeridos' }
  }

  try {
    // Google Analytics 4 requiere enviar un evento de prueba
    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurement_id}&api_secret=${api_secret}`
    
    const testEvent = {
      client_id: `test_${Date.now()}`,
      events: [{
        name: 'test_connection',
        params: {
          test: true,
          timestamp: Date.now()
        }
      }]
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testEvent)
    })

    // GA4 devuelve 204 en éxito (sin contenido)
    if (response.ok || response.status === 204) {
      return {
        success: true,
        message: 'Google Analytics 4 conectado exitosamente'
      }
    } else {
      return { success: false, error: 'Credenciales de Google Analytics inválidas' }
    }
  } catch (error) {
    return { success: false, error: 'Error al conectar con Google Analytics API' }
  }
}
