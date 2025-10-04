
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { hasPermission, userHasPermission, Permission } from '@/lib/permissions'
import { AudienceFilterType } from '@prisma/client'

// POST /api/campaigns/audience-preview - Generar vista previa de audiencia
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!userHasPermission(session.user.role, Permission.VIEW_AUDIENCE_PREVIEW)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
    }

    const body = await request.json()
    const { filters, campaignId } = body

    if (!filters || !Array.isArray(filters) || filters.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere al menos un filtro de audiencia' },
        { status: 400 }
      )
    }

    const startTime = Date.now()

    // Construir consulta base de contactos
    let whereClause: any = {
      organizationId: session.user.organizationId,
      status: 'ACTIVE' // Solo contactos activos por defecto
    }

    // Procesar cada filtro
    const andConditions: any[] = []
    const orConditions: any[] = []

    for (const filter of filters) {
      const condition = await buildFilterCondition(filter, session.user.organizationId)
      if (condition) {
        if (filter.operator === 'OR') {
          orConditions.push(condition)
        } else {
          andConditions.push(condition)
        }
      }
    }

    // Combinar condiciones
    if (andConditions.length > 0) {
      whereClause.AND = andConditions
    }
    if (orConditions.length > 0) {
      if (whereClause.AND) {
        whereClause.AND.push({ OR: orConditions })
      } else {
        whereClause.OR = orConditions
      }
    }

    // Obtener contactos que coinciden con los filtros
    const [totalContacts, contacts] = await Promise.all([
      prisma.contact.count({ where: whereClause }),
      prisma.contact.findMany({
        where: whereClause,
        include: {
          tags: true,
          conversations: {
            orderBy: { lastMessageAt: 'desc' },
            take: 1,
            select: {
              lastMessageAt: true,
              whatsappChannelId: true
            }
          }
        },
        take: 20, // Muestra limitada para preview
        orderBy: { lastContact: 'desc' }
      })
    ])

    // Preparar muestra de contactos para preview
    const sampleContacts = contacts.map(contact => ({
      id: contact.id,
      name: contact.name,
      phone: contact.phone,
      isVip: contact.isVip,
      lastContact: contact.lastContact,
      tags: contact.tags.map(tag => tag.name),
      channel: contact.conversations[0]?.whatsappChannelId || 'unknown'
    }))

    // Calcular estadísticas
    const vipCount = contacts.filter(contact => contact.isVip).length
    
    // Distribución por canales
    const channelsDistribution: Record<string, number> = {}
    contacts.forEach(contact => {
      const channel = contact.conversations[0]?.whatsappChannelId || 'unknown'
      channelsDistribution[channel] = (channelsDistribution[channel] || 0) + 1
    })

    // Distribución por etiquetas
    const tagsDistribution: Record<string, number> = {}
    contacts.forEach(contact => {
      contact.tags.forEach(tag => {
        tagsDistribution[tag.name] = (tagsDistribution[tag.name] || 0) + 1
      })
    })

    const processingTime = Date.now() - startTime

    // Crear registro de preview
    const preview = await prisma.campaignAudiencePreview.create({
      data: {
        organizationId: session.user.organizationId,
        campaignId,
        filtersConfig: filters,
        totalContacts,
        contactIds: contacts.map(c => c.id),
        sampleContacts,
        vipCount,
        channelsDistribution,
        tagsDistribution,
        processingTime,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
        createdBy: session.user.id,
        createdByName: session.user.name || 'Usuario'
      }
    })

    return NextResponse.json({
      success: true,
      data: preview
    })

  } catch (error) {
    console.error('Error al generar preview de audiencia:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Función auxiliar para construir condiciones de filtro
async function buildFilterCondition(filter: any, organizationId: string) {
  const { type, configuration } = filter

  switch (type as AudienceFilterType) {
    case 'INCLUDE_TAG':
      if (configuration.tagNames && configuration.tagNames.length > 0) {
        return {
          tags: {
            some: {
              name: { in: configuration.tagNames }
            }
          }
        }
      }
      break

    case 'EXCLUDE_TAG':
      if (configuration.tagNames && configuration.tagNames.length > 0) {
        return {
          NOT: {
            tags: {
              some: {
                name: { in: configuration.tagNames }
              }
            }
          }
        }
      }
      break

    case 'VIP_STATUS':
      if (configuration.vipStatus !== null && configuration.vipStatus !== undefined) {
        return {
          isVip: configuration.vipStatus
        }
      }
      break

    case 'LAST_CONTACT':
      const conditions: any = {}
      if (configuration.lastContactAfter) {
        conditions.gte = new Date(configuration.lastContactAfter)
      }
      if (configuration.lastContactBefore) {
        conditions.lte = new Date(configuration.lastContactBefore)
      }
      if (Object.keys(conditions).length > 0) {
        return {
          lastContact: conditions
        }
      }
      break

    case 'CHANNEL':
      if (configuration.channelIds && configuration.channelIds.length > 0) {
        return {
          conversations: {
            some: {
              whatsappChannelId: { in: configuration.channelIds }
            }
          }
        }
      }
      break

    case 'CONVERSATION_STATUS':
      if (configuration.conversationStatuses && configuration.conversationStatuses.length > 0) {
        return {
          conversations: {
            some: {
              status: { in: configuration.conversationStatuses }
            }
          }
        }
      }
      break

    default:
      return null
  }

  return null
}
