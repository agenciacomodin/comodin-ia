
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

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '7d'
    
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Calcular métricas de crecimiento
    const growth = await calculateGrowthMetrics(startDate, days)
    
    // Calcular KPIs principales
    const kpis = await calculateKPIs(startDate)
    
    // Obtener tendencias
    const trends = await getTrends(startDate, days)
    
    // Segmentación de usuarios
    const userSegmentation = await getUserSegmentation()
    
    // Features más utilizadas
    const topFeatures = await getTopFeatures(startDate)

    return NextResponse.json({
      growth,
      kpis,
      trends,
      userSegmentation,
      topFeatures
    })

  } catch (error) {
    console.error('Error fetching business analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function calculateGrowthMetrics(startDate: Date, days: number) {
  const previousStartDate = new Date(startDate)
  previousStartDate.setDate(previousStartDate.getDate() - days)
  
  const [currentUsers, previousUsers] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: startDate } } }),
    prisma.user.count({ 
      where: { 
        createdAt: { 
          gte: previousStartDate, 
          lt: startDate 
        } 
      } 
    })
  ])

  const [currentRevenue, previousRevenue] = await Promise.all([
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { 
        status: 'COMPLETED',
        createdAt: { gte: startDate }
      }
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { 
        status: 'COMPLETED',
        createdAt: { 
          gte: previousStartDate, 
          lt: startDate 
        }
      }
    })
  ])

  const [currentMessages, previousMessages] = await Promise.all([
    prisma.message.count({ where: { createdAt: { gte: startDate } } }),
    prisma.message.count({ 
      where: { 
        createdAt: { 
          gte: previousStartDate, 
          lt: startDate 
        } 
      } 
    })
  ])

  // Calcular tasa de retención
  const retentionRate = await calculateRetentionRate(startDate)

  const currentRevenueNum = Number(currentRevenue._sum.amount || 0)
  const previousRevenueNum = Number(previousRevenue._sum.amount || 0)
  
  return {
    userGrowth: previousUsers ? (currentUsers - previousUsers) / previousUsers : 0,
    revenueGrowth: previousRevenueNum > 0 ? 
      (currentRevenueNum - previousRevenueNum) / previousRevenueNum : 0,
    messageGrowth: previousMessages ? (currentMessages - previousMessages) / previousMessages : 0,
    retentionRate
  }
}

async function calculateKPIs(startDate: Date) {
  // MRR (Monthly Recurring Revenue)
  const currentMonth = new Date()
  currentMonth.setDate(1)
  currentMonth.setHours(0, 0, 0, 0)
  
  const mrr = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: {
      status: 'COMPLETED',
      createdAt: { gte: currentMonth }
    }
  })

  // Total de usuarios activos
  const activeUsers = await prisma.user.count({
    where: {
      lastLogin: { gte: startDate }
    }
  })

  // ARPU (Average Revenue Per User)
  const arpu = activeUsers > 0 ? Number(mrr._sum.amount || 0) / activeUsers : 0

  // Churn Rate
  const churnRate = await calculateChurnRate()

  // LTV (Lifetime Value) - Estimación simplificada
  const ltv = churnRate > 0 ? arpu / churnRate : arpu * 12

  // CAC (Customer Acquisition Cost) - Ejemplo fijo, debería calcularse con datos de marketing
  const cac = 25 // Placeholder

  return {
    mrr: mrr._sum.amount || 0,
    arpu,
    churnRate,
    ltv,
    cac
  }
}

async function getTrends(startDate: Date, days: number) {
  const daily = []
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)

    const [revenue, newUsers, activeUsers, messages] = await Promise.all([
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'COMPLETED',
          createdAt: { gte: date, lt: nextDay }
        }
      }),
      prisma.user.count({
        where: { createdAt: { gte: date, lt: nextDay } }
      }),
      prisma.user.count({
        where: { lastLogin: { gte: date, lt: nextDay } }
      }),
      prisma.message.count({
        where: { createdAt: { gte: date, lt: nextDay } }
      })
    ])

    daily.push({
      date: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      revenue: revenue._sum.amount || 0,
      newUsers,
      activeUsers,
      messages
    })
  }

  return { daily, weekly: [], monthly: [] }
}

async function getUserSegmentation() {
  // Segmentación simplificada basada en organizaciones
  const [basic, pro, enterprise, free] = await Promise.all([
    prisma.organization.count({ where: { currentPlan: 'STARTER' } }),
    prisma.organization.count({ where: { currentPlan: 'PREMIUM' } }),
    prisma.organization.count({ where: { currentPlan: 'ENTERPRISE' } }),
    prisma.organization.count({ where: { currentPlan: 'FREE' } })
  ])

  return [
    { name: 'Free', value: free, arpu: 0, retention: 0.3, engagement: 3 },
    { name: 'Starter', value: basic, arpu: 29, retention: 0.75, engagement: 6 },
    { name: 'Premium', value: pro, arpu: 79, retention: 0.85, engagement: 8 },
    { name: 'Enterprise', value: enterprise, arpu: 199, retention: 0.95, engagement: 9 }
  ]
}

async function getTopFeatures(startDate: Date) {
  // Simulación de uso de features - en producción esto vendría de tracking de eventos
  return [
    { name: 'WhatsApp Messaging', usage: 95 },
    { name: 'AI Responses', usage: 78 },
    { name: 'Contact Management', usage: 68 },
    { name: 'Campaign Builder', usage: 45 },
    { name: 'Analytics Dashboard', usage: 32 }
  ]
}

async function calculateRetentionRate(startDate: Date) {
  const totalUsers = await prisma.user.count({
    where: { createdAt: { lt: startDate } }
  })
  
  const activeUsers = await prisma.user.count({
    where: {
      createdAt: { lt: startDate },
      lastLogin: { gte: startDate }
    }
  })
  
  return totalUsers > 0 ? activeUsers / totalUsers : 0
}

async function calculateChurnRate() {
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  
  const twoMonthsAgo = new Date()
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)
  
  const usersAtStart = await prisma.user.count({
    where: { createdAt: { lt: twoMonthsAgo } }
  })
  
  const churnedUsers = await prisma.user.count({
    where: {
      createdAt: { lt: twoMonthsAgo },
      lastLogin: { lt: oneMonthAgo }
    }
  })
  
  return usersAtStart > 0 ? churnedUsers / usersAtStart : 0
}
