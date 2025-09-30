
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fecha del primer día del mes actual
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const [
      totalUsers,
      activeUsers,
      newThisMonth,
      churnedUsers
    ] = await Promise.all([
      // Total de usuarios
      prisma.user.count(),
      
      // Usuarios activos (con login en los últimos 30 días)
      prisma.user.count({
        where: {
          lastLogin: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Nuevos usuarios este mes
      prisma.user.count({
        where: {
          createdAt: {
            gte: currentMonth
          }
        }
      }),
      
      // Usuarios que han dejado de ser activos este mes (simplificado)
      prisma.user.count({
        where: {
          isActive: false,
          updatedAt: {
            gte: currentMonth
          }
        }
      })
    ])

    // ARPU simplificado (esto debería calcularse con datos reales de pagos)
    const avgRevenue = 45 // Placeholder

    return NextResponse.json({
      totalUsers,
      activeUsers,
      newThisMonth,
      churnedUsers,
      avgRevenue
    })

  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
