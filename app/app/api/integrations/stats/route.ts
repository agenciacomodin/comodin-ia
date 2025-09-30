
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.organizationId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const [totalConnections, activeConnections, recentActivity] = await Promise.all([
      prisma.organizationIntegration.count({
        where: {
          organizationId: session.user.organizationId
        }
      }),
      prisma.organizationIntegration.count({
        where: {
          organizationId: session.user.organizationId,
          status: 'CONNECTED'
        }
      }),
      prisma.organizationIntegration.findMany({
        where: {
          organizationId: session.user.organizationId
        },
        include: {
          integration: true
        },
        orderBy: {
          lastSyncAt: 'desc'
        },
        take: 5
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalConnections,
        activeConnections,
        recentActivity
      }
    })
  } catch (error) {
    console.error('Error getting integration stats:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}
