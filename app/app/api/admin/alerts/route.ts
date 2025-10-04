
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface Alert {
  id: string
  type: 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: Date
  resolved: boolean
  metadata?: any
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const alerts = await generateSystemAlerts()
    
    return NextResponse.json({ alerts })

  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generateSystemAlerts(): Promise<Alert[]> {
  const alerts: Alert[] = []
  
  try {
    // 1. Verificar usuarios inactivos
    const inactiveUsersCount = await prisma.user.count({
      where: {
        lastLogin: {
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 días
        }
      }
    })
    
    if (inactiveUsersCount > 0) {
      alerts.push({
        id: 'inactive-users',
        type: 'warning',
        title: 'Usuarios Inactivos',
        message: `${inactiveUsersCount} usuarios no han estado activos en los últimos 7 días`,
        timestamp: new Date(),
        resolved: false,
        metadata: { count: inactiveUsersCount }
      })
    }

    // 2. Verificar pagos fallidos
    const failedPayments = await prisma.payment.count({
      where: {
        status: 'FAILED',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 horas
        }
      }
    })
    
    if (failedPayments > 0) {
      alerts.push({
        id: 'failed-payments',
        type: 'error',
        title: 'Pagos Fallidos',
        message: `${failedPayments} pagos han fallado en las últimas 24 horas`,
        timestamp: new Date(),
        resolved: false,
        metadata: { count: failedPayments }
      })
    }

    // 3. Verificar suscripciones que expiran pronto
    const expiringSubscriptions = await prisma.subscription.count({
      where: {
        status: 'ACTIVE',
        currentPeriodEnd: {
          lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 días
        }
      }
    })
    
    if (expiringSubscriptions > 0) {
      alerts.push({
        id: 'expiring-subscriptions',
        type: 'warning',
        title: 'Suscripciones por Expirar',
        message: `${expiringSubscriptions} suscripciones expiran en los próximos 3 días`,
        timestamp: new Date(),
        resolved: false,
        metadata: { count: expiringSubscriptions }
      })
    }

    // 4. Verificar uso de IA alto - Comentado hasta implementar el modelo AIUsage correctamente
    // const totalTokens = 0 // Placeholder por ahora
    // if (totalTokens > 100000) { 
    //   alerts.push({
    //     id: 'high-ai-usage',
    //     type: 'warning',
    //     title: 'Alto Uso de IA',
    //     message: `Se han usado ${totalTokens.toLocaleString()} tokens de IA en las últimas 24 horas`,
    //     timestamp: new Date(),
    //     resolved: false,
    //     metadata: { tokens: totalTokens }
    //   })
    // }

    // 5. Verificar actividad de mensajes (alta actividad como indicador de salud)
    const messageCount = await prisma.message.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    })
    
    if (messageCount < 10) { // Si hay muy pocos mensajes, puede indicar un problema
      alerts.push({
        id: 'low-message-activity',
        type: 'warning',
        title: 'Baja Actividad de Mensajes',
        message: `Solo se han enviado ${messageCount} mensajes en las últimas 24 horas`,
        timestamp: new Date(),
        resolved: false,
        metadata: { count: messageCount }
      })
    }

  } catch (error) {
    alerts.push({
      id: 'system-error',
      type: 'error',
      title: 'Error del Sistema',
      message: 'Error al generar alertas automáticas',
      timestamp: new Date(),
      resolved: false,
      metadata: { error: error instanceof Error ? error.message : String(error) }
    })
  }

  return alerts
}
