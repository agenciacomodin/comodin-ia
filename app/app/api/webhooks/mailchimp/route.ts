
/**
 * 🔔 WEBHOOK DE MAILCHIMP
 * 
 * Recibe notificaciones en tiempo real de Mailchimp para:
 * - Nuevos suscriptores
 * - Desuscripciones
 * - Actualizaciones de perfil
 * - Cambios de estado
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const type = formData.get('type')
    const firedAt = formData.get('fired_at')
    
    // Datos del suscriptor
    const email = formData.get('data[email]')
    const listId = formData.get('data[list_id]')
    const mergeFields = {
      FNAME: formData.get('data[merges][FNAME]'),
      LNAME: formData.get('data[merges][LNAME]'),
      PHONE: formData.get('data[merges][PHONE]')
    }

    console.log(`📧 Evento de Mailchimp: ${type} para ${email}`)

    // Buscar la integración de Mailchimp
    const integration = await prisma.organizationIntegration.findFirst({
      where: {
        integration: {
          name: 'mailchimp'
        },
        status: 'CONNECTED'
      },
      include: {
        integration: true
      }
    })

    if (!integration) {
      console.error('No se encontró integración activa de Mailchimp')
      return NextResponse.json({ success: true }) // Mailchimp requiere 200 OK
    }

    // Procesar según el tipo de evento
    switch (type) {
      case 'subscribe':
        await handleSubscribe(integration.organizationId, {
          email: email as string,
          firstName: mergeFields.FNAME as string,
          lastName: mergeFields.LNAME as string,
          phone: mergeFields.PHONE as string
        })
        break

      case 'unsubscribe':
        await handleUnsubscribe(integration.organizationId, email as string)
        break

      case 'profile':
        await handleProfileUpdate(integration.organizationId, {
          email: email as string,
          firstName: mergeFields.FNAME as string,
          lastName: mergeFields.LNAME as string,
          phone: mergeFields.PHONE as string
        })
        break

      case 'cleaned':
        await handleCleaned(integration.organizationId, email as string)
        break

      default:
        console.log(`Evento no manejado: ${type}`)
    }

    // Registrar el evento
    await prisma.integrationLog.create({
      data: {
        organizationIntegrationId: integration.id,
        eventType: `mailchimp.${type}`,
        eventData: {
          email: email?.toString() || null,
          listId: listId?.toString() || null,
          mergeFields: {
            FNAME: mergeFields.FNAME?.toString() || null,
            LNAME: mergeFields.LNAME?.toString() || null,
            PHONE: mergeFields.PHONE?.toString() || null
          },
          firedAt: firedAt?.toString() || null
        },
        success: true
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error procesando webhook de Mailchimp:', error)
    // Mailchimp requiere 200 OK incluso en errores
    return NextResponse.json({ success: true })
  }
}

async function handleSubscribe(
  organizationId: string,
  data: { email: string; firstName: string; lastName: string; phone: string }
) {
  console.log(`✅ Nueva suscripción: ${data.email}`)
  
  const existingContact = await prisma.contact.findFirst({
    where: {
      organizationId,
      email: data.email
    }
  })

  if (existingContact) {
    // Actualizar contacto existente
    await prisma.contact.update({
      where: { id: existingContact.id },
      data: {
        metadata: {
          ...(existingContact.metadata as any || {}),
          mailchimp_subscribed: true,
          mailchimp_subscribed_at: new Date().toISOString()
        }
      }
    })
  } else if (data.email) {
    // Crear nuevo contacto - email es requerido para crear
    // Necesitamos un teléfono, usamos un placeholder si no existe
    const phone = data.phone || `mailchimp_${Date.now()}`
    
    await prisma.contact.create({
      data: {
        organizationId,
        name: `${data.firstName} ${data.lastName}`.trim() || data.email,
        email: data.email,
        phone,
        metadata: {
          mailchimp_subscribed: true,
          mailchimp_subscribed_at: new Date().toISOString(),
          source: 'mailchimp',
          placeholder_phone: !data.phone
        }
      }
    })
  }
}

async function handleUnsubscribe(organizationId: string, email: string) {
  console.log(`❌ Desuscripción: ${email}`)
  
  const contact = await prisma.contact.findFirst({
    where: {
      organizationId,
      email
    }
  })

  if (contact) {
    await prisma.contact.update({
      where: { id: contact.id },
      data: {
        metadata: {
          ...(contact.metadata as any || {}),
          mailchimp_subscribed: false,
          mailchimp_unsubscribed_at: new Date().toISOString()
        }
      }
    })
  }
}

async function handleProfileUpdate(
  organizationId: string,
  data: { email: string; firstName: string; lastName: string; phone: string }
) {
  console.log(`📝 Actualización de perfil: ${data.email}`)
  
  const contact = await prisma.contact.findFirst({
    where: {
      organizationId,
      email: data.email
    }
  })

  if (contact) {
    await prisma.contact.update({
      where: { id: contact.id },
      data: {
        name: `${data.firstName} ${data.lastName}`.trim(),
        phone: data.phone || contact.phone,
        metadata: {
          ...(contact.metadata as any || {}),
          last_mailchimp_sync: new Date().toISOString()
        }
      }
    })
  }
}

async function handleCleaned(organizationId: string, email: string) {
  console.log(`🧹 Email limpiado: ${email}`)
  
  const contact = await prisma.contact.findFirst({
    where: {
      organizationId,
      email
    }
  })

  if (contact) {
    await prisma.contact.update({
      where: { id: contact.id },
      data: {
        metadata: {
          ...(contact.metadata as any || {}),
          mailchimp_cleaned: true,
          mailchimp_cleaned_at: new Date().toISOString()
        }
      }
    })
  }
}

// Mailchimp requiere un endpoint GET para verificación
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'ok' })
}
