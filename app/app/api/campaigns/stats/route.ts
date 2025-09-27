
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { hasPermission, Permission } from '@/lib/permissions'

// GET /api/campaigns/stats - Obtener estadísticas de campañas
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!hasPermission(session.user.role, Permission.VIEW_CAMPAIGNS)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
    }

    const organizationId = session.user.organizationId

    // Obtener estadísticas generales
    const [totalCampaigns, activeCampaigns, completedCampaigns, campaignMetrics] = await Promise.all([
      // Total de campañas
      prisma.campaign.count({
        where: { organizationId }
      }),

      // Campañas activas (enviando o programadas)
      prisma.campaign.count({
        where: {
          organizationId,
          status: { in: ['SENDING', 'SCHEDULED'] }
        }
      }),

      // Campañas completadas
      prisma.campaign.count({
        where: {
          organizationId,
          status: 'COMPLETED'
        }
      }),

      // Métricas agregadas
      prisma.campaign.aggregate({
        where: { organizationId },
        _sum: {
          messagesSent: true,
          messagesDelivered: true,
          messagesRead: true,
          actualCost: true
        },
        _avg: {
          messagesSent: true,
          messagesDelivered: true
        }
      })
    ])

    // Calcular tasas promedio
    const totalMessagesSent = campaignMetrics._sum.messagesSent || 0
    const totalMessagesDelivered = campaignMetrics._sum.messagesDelivered || 0
    const totalMessagesRead = campaignMetrics._sum.messagesRead || 0
    const totalCostThisMonth = campaignMetrics._sum.actualCost || 0

    const avgDeliveryRate = totalMessagesSent > 0 
      ? (totalMessagesDelivered / totalMessagesSent) * 100 
      : 0

    const avgReadRate = totalMessagesDelivered > 0 
      ? (totalMessagesRead / totalMessagesDelivered) * 100 
      : 0

    // Obtener plantillas más utilizadas
    const topPerformingTemplates = await prisma.messageTemplate.findMany({
      where: {
        organizationId,
        campaigns: {
          some: {
            status: 'COMPLETED'
          }
        }
      },
      include: {
        campaigns: {
          where: {
            status: 'COMPLETED'
          },
          select: {
            id: true,
            messagesDelivered: true,
            totalRecipients: true
          }
        }
      },
      orderBy: {
        usageCount: 'desc'
      },
      take: 5
    })

    const processedTopTemplates = topPerformingTemplates.map(template => ({
      templateId: template.id,
      templateName: template.name,
      campaignsCount: template.campaigns.length,
      avgDeliveryRate: template.campaigns.length > 0
        ? template.campaigns.reduce((sum, campaign) => {
            return sum + (campaign.totalRecipients > 0 
              ? (campaign.messagesDelivered / campaign.totalRecipients) * 100 
              : 0)
          }, 0) / template.campaigns.length
        : 0
    }))

    // Obtener actividad reciente
    const recentActivity = await prisma.campaign.findMany({
      where: {
        organizationId,
        OR: [
          { startedAt: { not: null } },
          { completedAt: { not: null } },
          { status: 'FAILED' }
        ]
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 10,
      select: {
        id: true,
        name: true,
        status: true,
        startedAt: true,
        completedAt: true,
        messagesSent: true,
        updatedAt: true
      }
    })

    const processedRecentActivity = recentActivity.map(campaign => ({
      id: campaign.id,
      type: campaign.status === 'COMPLETED' ? 'campaign_completed' as const :
            campaign.status === 'FAILED' ? 'campaign_failed' as const :
            'campaign_started' as const,
      campaignName: campaign.name,
      timestamp: campaign.completedAt || campaign.startedAt || campaign.updatedAt,
      messagesSent: campaign.messagesSent
    }))

    const stats = {
      totalCampaigns,
      activeCampaigns,
      completedCampaigns,
      totalMessagesSent,
      totalCostThisMonth: Number(totalCostThisMonth),
      avgDeliveryRate,
      avgReadRate,
      topPerformingTemplates: processedTopTemplates,
      recentActivity: processedRecentActivity
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Error al obtener estadísticas de campañas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
