
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

// POST /api/campaigns/[campaignId]/pause - Pausar campaña
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!userHasPermission(session.user.role, Permission.PAUSE_CAMPAIGNS)) {
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

    // Solo pausar campañas en SENDING o SCHEDULED
    if (!['SENDING', 'SCHEDULED'].includes(campaign.status)) {
      return NextResponse.json(
        { error: 'Solo se pueden pausar campañas en proceso o programadas' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { reason } = body

    const updatedCampaign = await prisma.campaign.update({
      where: { id: params.campaignId },
      data: {
        status: 'PAUSED',
        pausedAt: new Date(),
        lastError: reason ? `Pausada manualmente: ${reason}` : 'Pausada manualmente'
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedCampaign,
      message: 'Campaña pausada exitosamente'
    })

  } catch (error) {
    console.error('Error al pausar campaña:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/campaigns/[campaignId]/pause - Reanudar campaña
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!userHasPermission(session.user.role, Permission.EXECUTE_CAMPAIGNS)) {
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

    // Solo reanudar campañas PAUSED
    if (campaign.status !== 'PAUSED') {
      return NextResponse.json(
        { error: 'Solo se pueden reanudar campañas pausadas' },
        { status: 400 }
      )
    }

    const updatedCampaign = await prisma.campaign.update({
      where: { id: params.campaignId },
      data: {
        status: 'SENDING',
        pausedAt: null,
        lastError: null
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedCampaign,
      message: 'Campaña reanudada exitosamente'
    })

  } catch (error) {
    console.error('Error al reanudar campaña:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
