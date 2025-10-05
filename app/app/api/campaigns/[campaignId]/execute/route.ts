
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

// POST /api/campaigns/[campaignId]/execute - Ejecutar campaña
export async function POST(request: NextRequest, { params }: RouteParams) {
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
      },
      include: {
        template: true,
        audienceFilters: true
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaña no encontrada' },
        { status: 404 }
      )
    }

    // Solo ejecutar campañas en DRAFT o SCHEDULED
    if (!['DRAFT', 'SCHEDULED'].includes(campaign.status)) {
      return NextResponse.json(
        { error: 'La campaña no está en estado ejecutable' },
        { status: 400 }
      )
    }

    // Verificar que la plantilla sigue aprobada
    if (campaign.template.status !== 'APPROVED' || !campaign.template.isActive) {
      return NextResponse.json(
        { error: 'La plantilla asociada no está aprobada o está inactiva' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { dryRun = false, confirmAudience = false } = body

    // Por ahora, solo actualizamos el estado de la campaña

    if (dryRun) {
      // Simulación - no enviar realmente
      return NextResponse.json({
        success: true,
        data: {
          campaignId: params.campaignId,
          simulation: true,
          estimatedRecipients: campaign.targetAudienceSize,
          estimatedCost: campaign.estimatedCost,
          message: 'Simulación de campaña completada'
        }
      })
    }

    // Ejecutar campaña real
    const updatedCampaign = await prisma.campaign.update({
      where: { id: params.campaignId },
      data: {
        status: campaign.type === 'SCHEDULED' && campaign.scheduledFor && campaign.scheduledFor > new Date() 
          ? 'SCHEDULED' 
          : 'SENDING',
        startedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedCampaign,
      message: 'Campaña iniciada exitosamente'
    })

  } catch (error) {
    console.error('Error al ejecutar campaña:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
