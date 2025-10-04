
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      totalSpent,
      avgResolutionTime
    ] = await Promise.all([
      prisma.supportTicket.count({
        where: { organizationId: session.user.organizationId }
      }),
      prisma.supportTicket.count({
        where: {
          organizationId: session.user.organizationId,
          status: 'OPEN'
        }
      }),
      prisma.supportTicket.count({
        where: {
          organizationId: session.user.organizationId,
          status: 'IN_PROGRESS'
        }
      }),
      prisma.supportTicket.count({
        where: {
          organizationId: session.user.organizationId,
          status: 'RESOLVED'
        }
      }),
      prisma.supportTicket.aggregate({
        where: {
          organizationId: session.user.organizationId,
          status: 'RESOLVED'
        },
        _sum: {
          finalPrice: true
        }
      }),
      prisma.supportTicket.aggregate({
        where: {
          organizationId: session.user.organizationId,
          status: 'RESOLVED',
          hoursWorked: { not: null }
        },
        _avg: {
          hoursWorked: true
        }
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        totalSpent: totalSpent._sum.finalPrice || 0,
        avgResolutionTime: avgResolutionTime._avg?.hoursWorked || 0
      }
    })

  } catch (error) {
    console.error('Error fetching ticket stats:', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo estadísticas' },
      { status: 500 }
    )
  }
}
