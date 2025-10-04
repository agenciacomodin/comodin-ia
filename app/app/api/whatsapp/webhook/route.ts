
/**
 * WhatsApp Webhook Endpoint (Producción)
 * Recibe y procesa webhooks de Meta/Facebook
 */

import { NextRequest, NextResponse } from 'next/server'
import WhatsAppService from '@/lib/whatsapp-service'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const mode = searchParams.get('hub.mode')
    const token = searchParams.get('hub.verify_token')
    const challenge = searchParams.get('hub.challenge')

    console.log('WhatsApp webhook verification:', { mode, token })

    // Verificación del webhook
    if (mode === 'subscribe') {
      const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'comodin_whatsapp_webhook_2024'
      
      if (WhatsAppService.verifyWebhook(token || '', expectedToken)) {
        console.log('WhatsApp webhook verified successfully')
        return new NextResponse(challenge)
      } else {
        console.error('WhatsApp webhook verification failed')
        return NextResponse.json(
          { error: 'Verificación fallida' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json({ error: 'Método no permitido' }, { status: 405 })
  } catch (error) {
    console.error('Error in WhatsApp webhook verification:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    console.log('WhatsApp webhook payload:', JSON.stringify(payload, null, 2))

    // Verificar que sea un webhook de WhatsApp válido
    if (!payload.object || payload.object !== 'whatsapp_business_account') {
      return NextResponse.json({ error: 'Webhook inválido' }, { status: 400 })
    }

    // Procesar cada entrada del webhook
    for (const entry of payload.entry || []) {
      if (!entry.changes) continue

      for (const change of entry.changes) {
        if (change.field !== 'messages') continue

        const phoneNumberId = change.value?.metadata?.phone_number_id
        if (!phoneNumberId) continue

        // Buscar la organización que tiene este número configurado
        const orgIntegration = await prisma.organizationIntegration.findFirst({
          where: {
            integration: {
              name: 'whatsapp-business'
            },
            status: 'CONNECTED',
            config: {
              path: ['phoneNumberId'],
              equals: phoneNumberId
            }
          },
          include: {
            organization: true
          }
        })

        if (!orgIntegration) {
          console.warn(`No organization found for phone number ID: ${phoneNumberId}`)
          continue
        }

        // Procesar el webhook para esta organización
        await WhatsAppService.processWebhook(
          { entry: [entry] },
          orgIntegration.organizationId
        )
      }
    }

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
