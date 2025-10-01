
/**
 * API para conectar WhatsApp Business (Producción)
 * Permite a las organizaciones configurar su propia cuenta de WhatsApp Business
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import WhatsAppService from '@/lib/whatsapp-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.organizationId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      accessToken,
      phoneNumberId,
      businessAccountId,
      webhookVerifyToken
    } = body

    if (!accessToken || !phoneNumberId || !businessAccountId) {
      return NextResponse.json(
        { success: false, error: 'Faltan credenciales requeridas' },
        { status: 400 }
      )
    }

    // Verificar que las credenciales sean válidas
    try {
      const testUrl = `https://graph.facebook.com/v17.0/${phoneNumberId}`
      const testResponse = await fetch(testUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!testResponse.ok) {
        const errorData = await testResponse.json()
        return NextResponse.json(
          { 
            success: false, 
            error: `Credenciales inválidas: ${errorData.error?.message || 'Token o Phone Number ID incorrecto'}` 
          },
          { status: 400 }
        )
      }

      const phoneData = await testResponse.json()
      console.log('Phone number verified:', phoneData)
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Error al verificar credenciales con Meta API' },
        { status: 400 }
      )
    }

    // Buscar o crear la integración de WhatsApp Business
    const whatsappIntegration = await prisma.integration.upsert({
      where: { name: 'whatsapp-business' },
      update: {},
      create: {
        name: 'whatsapp-business',
        displayName: 'WhatsApp Business',
        description: 'Integración con WhatsApp Business API de Meta',
        type: 'CRM',
        authType: 'API_KEY',
        authFields: {
          accessToken: { label: 'Access Token', type: 'password', required: true },
          phoneNumberId: { label: 'Phone Number ID', type: 'text', required: true },
          businessAccountId: { label: 'Business Account ID', type: 'text', required: true },
          webhookVerifyToken: { label: 'Webhook Verify Token', type: 'password', required: false }
        },
        supportedFeatures: ['send_messages', 'receive_messages', 'media_messages'],
        brandColor: '#25D366',
        isActive: true
      }
    })

    // Crear o actualizar la conexión de la organización
    const connection = await prisma.organizationIntegration.upsert({
      where: {
        organizationId_integrationId: {
          organizationId: session.user.organizationId,
          integrationId: whatsappIntegration.id
        }
      },
      update: {
        config: {
          accessToken,
          phoneNumberId,
          businessAccountId,
          webhookVerifyToken: webhookVerifyToken || process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
          connectedAt: new Date().toISOString()
        },
        status: 'CONNECTED',
        lastSyncAt: new Date()
      },
      create: {
        organizationId: session.user.organizationId,
        integrationId: whatsappIntegration.id,
        config: {
          accessToken,
          phoneNumberId,
          businessAccountId,
          webhookVerifyToken: webhookVerifyToken || process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
          connectedAt: new Date().toISOString()
        },
        status: 'CONNECTED',
        lastSyncAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        connectionId: connection.id,
        phoneNumberId,
        status: 'CONNECTED',
        webhookUrl: `${process.env.NEXTAUTH_URL}/api/whatsapp/webhook`
      },
      message: 'WhatsApp Business conectado exitosamente'
    })
  } catch (error) {
    console.error('Error connecting WhatsApp Business:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.organizationId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener el estado de la conexión actual
    const connection = await prisma.organizationIntegration.findFirst({
      where: {
        organizationId: session.user.organizationId,
        integration: {
          name: 'whatsapp-business'
        }
      },
      include: {
        integration: true
      }
    })

    if (!connection) {
      return NextResponse.json({
        success: true,
        data: {
          isConnected: false,
          webhookUrl: `${process.env.NEXTAUTH_URL}/api/whatsapp/webhook`
        }
      })
    }

    const config = connection.config as any
    return NextResponse.json({
      success: true,
      data: {
        isConnected: connection.status === 'CONNECTED',
        phoneNumberId: config?.phoneNumberId,
        businessAccountId: config?.businessAccountId,
        connectedAt: config?.connectedAt,
        status: connection.status,
        webhookUrl: `${process.env.NEXTAUTH_URL}/api/whatsapp/webhook`
      }
    })
  } catch (error) {
    console.error('Error getting WhatsApp connection status:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
