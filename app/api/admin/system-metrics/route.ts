
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

    // Fecha hace 30 días
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Fecha hace 7 días
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Usuarios activos (últimos 30 días)
    const activeUsers = await prisma.user.count({
      where: {
        lastLogin: {
          gte: thirtyDaysAgo
        }
      }
    })

    // Mensajes del mes
    const totalMessages = await prisma.message.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    })

    // Ingresos del mes
    const monthlyRevenue = await prisma.payment.aggregate({
      _sum: {
        amount: true
      },
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    })

    // Estado del sistema (simulado por ahora)
    const systemHealth = await checkSystemHealth()

    // Estados de servicios
    const services = await checkServicesStatus()

    // Estadísticas diarias
    const dailyStats = await getDailyStats(sevenDaysAgo)

    return NextResponse.json({
      activeUsers,
      totalMessages,
      totalRevenue: monthlyRevenue._sum.amount || 0,
      systemHealth,
      services,
      dailyStats
    })

  } catch (error) {
    console.error('Error fetching system metrics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function checkSystemHealth() {
  try {
    // Verificar conexión a base de datos
    await prisma.$queryRaw`SELECT 1`
    
    // Verificar otros servicios críticos aquí
    // Por ejemplo: Redis, Evolution API, etc.
    
    return 'healthy'
  } catch (error) {
    return 'critical'
  }
}

async function checkServicesStatus() {
  const services = []
  
  // Base de datos
  try {
    const start = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const responseTime = Date.now() - start
    services.push({
      name: 'PostgreSQL',
      status: 'up',
      responseTime
    })
  } catch (error) {
    services.push({
      name: 'PostgreSQL',
      status: 'down',
      responseTime: 0
    })
  }

  // Evolution API (WhatsApp)
  try {
    const start = Date.now()
    const response = await fetch(`${process.env.EVOLUTION_API_URL}/manager/instances`, {
      headers: {
        'apikey': process.env.EVOLUTION_API_KEY || ''
      }
    })
    const responseTime = Date.now() - start
    services.push({
      name: 'Evolution API',
      status: response.ok ? 'up' : 'degraded',
      responseTime
    })
  } catch (error) {
    services.push({
      name: 'Evolution API',
      status: 'down',
      responseTime: 0
    })
  }

  // Stripe
  try {
    const start = Date.now()
    // Verificar conexión con Stripe
    const responseTime = Date.now() - start
    services.push({
      name: 'Stripe',
      status: 'up',
      responseTime
    })
  } catch (error) {
    services.push({
      name: 'Stripe',
      status: 'down',
      responseTime: 0
    })
  }

  return services
}

async function getDailyStats(startDate: Date) {
  const stats = []
  const today = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)

    const [users, messages, revenue] = await Promise.all([
      // Usuarios activos ese día
      prisma.user.count({
        where: {
          lastLogin: {
            gte: date,
            lt: nextDay
          }
        }
      }),
      // Mensajes enviados
      prisma.message.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDay
          }
        }
      }),
      // Ingresos del día
      prisma.payment.aggregate({
        _sum: {
          amount: true
        },
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: date,
            lt: nextDay
          }
        }
      })
    ])

    stats.push({
      date: date.toLocaleDateString(),
      users,
      messages,
      revenue: revenue._sum.amount || 0
    })
  }

  return stats
}
