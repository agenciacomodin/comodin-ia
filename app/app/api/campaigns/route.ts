
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { hasPermission, Permission } from '@/lib/permissions'
import { CampaignStatus, CampaignType } from '@prisma/client'

// GET /api/campaigns - Obtener campañas
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!hasPermission(session.user.role, Permission.VIEW_CAMPAIGNS)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as CampaignStatus | null
    const type = searchParams.get('type') as CampaignType | null
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where = {
      organizationId: session.user.organizationId,
      ...(status && { status }),
      ...(type && { type })
    }

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: {
          template: {
            select: {
              name: true,
              status: true,
              category: true
            }
          }
        },
        orderBy: [
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.campaign.count({ where })
    ])

    // Calcular métricas derivadas
    const campaignsWithMetrics = campaigns.map(campaign => ({
      ...campaign,
      templateName: campaign.template.name,
      deliveryRate: campaign.totalRecipients > 0 
        ? (campaign.messagesDelivered / campaign.totalRecipients) * 100 
        : 0,
      readRate: campaign.messagesDelivered > 0 
        ? (campaign.messagesRead / campaign.messagesDelivered) * 100 
        : 0
    }))

    return NextResponse.json({
      success: true,
      data: campaignsWithMetrics,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error al obtener campañas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/campaigns - Crear nueva campaña
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!hasPermission(session.user.role, Permission.CREATE_CAMPAIGNS)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      description,
      type = 'IMMEDIATE',
      templateId,
      messageVariables,
      audienceFilters,
      maxRecipients,
      scheduledFor,
      timezone = 'America/Mexico_City',
      sendRate = 10,
      batchSize = 100,
      budgetLimit
    } = body

    // Validaciones básicas
    if (!name || !templateId || !audienceFilters || audienceFilters.length === 0) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: name, templateId, audienceFilters' },
        { status: 400 }
      )
    }

    // Verificar que la plantilla existe y está aprobada
    const template = await prisma.messageTemplate.findFirst({
      where: {
        id: templateId,
        organizationId: session.user.organizationId,
        status: 'APPROVED',
        isActive: true
      }
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Plantilla no encontrada o no está aprobada' },
        { status: 404 }
      )
    }

    // Crear la campaña
    const campaign = await prisma.campaign.create({
      data: {
        organizationId: session.user.organizationId,
        name,
        description,
        type,
        templateId,
        messageVariables,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        timezone,
        sendRate,
        batchSize,
        budgetLimit,
        maxRecipients,
        createdBy: session.user.id,
        createdByName: session.user.name || 'Usuario',
        audienceFilters: {
          create: audienceFilters.map((filter: any, index: number) => ({
            filterType: filter.type,
            operator: filter.operator || 'AND',
            tagNames: filter.configuration.tagNames || [],
            channelIds: filter.configuration.channelIds || [],
            vipStatus: filter.configuration.vipStatus,
            lastContactAfter: filter.configuration.lastContactAfter,
            lastContactBefore: filter.configuration.lastContactBefore,
            conversationStatuses: filter.configuration.conversationStatuses || [],
            includeInactive: filter.configuration.includeInactive || false,
            metadata: filter.configuration,
            filterOrder: index + 1
          }))
        }
      },
      include: {
        template: true,
        audienceFilters: true
      }
    })

    return NextResponse.json({
      success: true,
      data: campaign,
      message: 'Campaña creada exitosamente'
    }, { status: 201 })

  } catch (error) {
    console.error('Error al crear campaña:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
