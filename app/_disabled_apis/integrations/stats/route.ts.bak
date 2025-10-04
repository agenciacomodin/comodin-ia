
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentOrganization } from '@/lib/multi-tenant'
import { prisma } from '@/lib/db'
import { hasPermission, userHasPermission, Permission } from '@/lib/permissions'

// GET /api/integrations/stats - Obtener estadísticas de integraciones
export async function GET(request: NextRequest) {
  try {
    const { organization, user } = await getCurrentOrganization()
    
    if (!userHasPermission(user.role, Permission.VIEW_INTEGRATIONS)) {
      return NextResponse.json(
        { error: 'No tienes permisos para ver las estadísticas de integraciones' },
        { status: 403 }
      )
    }

    // Contar integraciones disponibles
    const totalIntegrations = await prisma.integration.count({
      where: { isActive: true }
    })

    // Contar conexiones por estado
    const connectionStats = await prisma.organizationIntegration.groupBy({
      by: ['status'],
      where: {
        organizationId: organization.id
      },
      _count: {
        id: true
      }
    })

    // Contar conexiones por tipo de integración
    const typeStats = await prisma.organizationIntegration.findMany({
      where: {
        organizationId: organization.id
      },
      include: {
        integration: {
          select: {
            type: true
          }
        }
      }
    })

    // Procesar estadísticas por tipo
    const byType: Record<string, number> = {}
    typeStats.forEach(connection => {
      const type = connection.integration.type
      byType[type] = (byType[type] || 0) + 1
    })

    // Crear objeto de contadores por estado
    const statusCounts = {
      connected: 0,
      disconnected: 0,
      error: 0,
      pending: 0
    }

    connectionStats.forEach(stat => {
      switch (stat.status) {
        case 'CONNECTED':
          statusCounts.connected = stat._count.id
          break
        case 'DISCONNECTED':
          statusCounts.disconnected = stat._count.id
          break
        case 'ERROR':
          statusCounts.error = stat._count.id
          break
        case 'PENDING':
          statusCounts.pending = stat._count.id
          break
      }
    })

    // Obtener actividad reciente
    const recentActivity = await prisma.integrationLog.findMany({
      where: {
        organizationIntegration: {
          organizationId: organization.id
        }
      },
      include: {
        organizationIntegration: {
          include: {
            integration: {
              select: {
                displayName: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    const formattedActivity = recentActivity.map(activity => ({
      id: activity.id,
      action: activity.eventType,
      integrationName: activity.organizationIntegration.integration.displayName,
      timestamp: activity.createdAt,
      status: activity.success ? 'success' : 'error'
    }))

    const stats = {
      total: totalIntegrations,
      connected: statusCounts.connected,
      disconnected: statusCounts.disconnected,
      error: statusCounts.error,
      pending: statusCounts.pending,
      byType,
      recentActivity: formattedActivity
    }

    return NextResponse.json({
      stats
    })
  } catch (error) {
    console.error('Error fetching integration stats:', error)
    return NextResponse.json(
      { error: 'Error al cargar las estadísticas' },
      { status: 500 }
    )
  }
}
