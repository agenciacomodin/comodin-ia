
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { hasPermission, userHasPermission, Permission } from '@/lib/permissions'

interface RouteParams {
  params: {
    campaignId: string
  }
}

// GET /api/campaigns/[campaignId] - Obtener campaña específica
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!userHasPermission(session.user.role, Permission.VIEW_CAMPAIGNS)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
    }

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: params.campaignId,
        organizationId: session.user.organizationId
      },
      include: {
        template: true,
        audienceFilters: {
          orderBy: { filterOrder: 'asc' }
        }
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaña no encontrada' },
        { status: 404 }
      )
    }

    // Calcular métricas derivadas
    const campaignWithMetrics = {
      ...campaign,
      deliveryRate: campaign.totalRecipients > 0 
        ? (campaign.messagesDelivered / campaign.totalRecipients) * 100 
        : 0,
      readRate: campaign.messagesDelivered > 0 
        ? (campaign.messagesRead / campaign.messagesDelivered) * 100 
        : 0
    }

    return NextResponse.json({
      success: true,
      data: campaignWithMetrics
    })

  } catch (error) {
    console.error('Error al obtener campaña:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/campaigns/[campaignId] - Actualizar campaña
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!userHasPermission(session.user.role, Permission.MANAGE_CAMPAIGNS)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
    }

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: params.campaignId,
        organizationId: session.user.organizationId
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaña no encontrada' },
        { status: 404 }
      )
    }

    // Solo permitir editar campañas en DRAFT
    if (campaign.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Solo se pueden editar campañas en borrador' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      messageVariables,
      maxRecipients,
      scheduledFor,
      timezone,
      sendRate,
      batchSize,
      budgetLimit
    } = body

    const updatedCampaign = await prisma.campaign.update({
      where: { id: params.campaignId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(messageVariables !== undefined && { messageVariables }),
        ...(maxRecipients !== undefined && { maxRecipients }),
        ...(scheduledFor !== undefined && { scheduledFor: scheduledFor ? new Date(scheduledFor) : null }),
        ...(timezone && { timezone }),
        ...(sendRate !== undefined && { sendRate }),
        ...(batchSize !== undefined && { batchSize }),
        ...(budgetLimit !== undefined && { budgetLimit })
      },
      include: {
        template: true,
        audienceFilters: true
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedCampaign,
      message: 'Campaña actualizada exitosamente'
    })

  } catch (error) {
    console.error('Error al actualizar campaña:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/campaigns/[campaignId] - Eliminar campaña
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!userHasPermission(session.user.role, Permission.DELETE_CAMPAIGNS)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
    }

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: params.campaignId,
        organizationId: session.user.organizationId
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaña no encontrada' },
        { status: 404 }
      )
    }

    // Solo permitir eliminar campañas en DRAFT o CANCELLED
    if (!['DRAFT', 'CANCELLED', 'FAILED'].includes(campaign.status)) {
      return NextResponse.json(
        { error: 'Solo se pueden eliminar campañas en borrador, canceladas o fallidas' },
        { status: 400 }
      )
    }

    await prisma.campaign.delete({
      where: { id: params.campaignId }
    })

    return NextResponse.json({
      success: true,
      message: 'Campaña eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error al eliminar campaña:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
