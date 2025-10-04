
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { hasPermission } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!hasPermission(session.user.role, 'VIEW_FOLLOW_UPS')) {
      return NextResponse.json({ error: 'Sin permisos suficientes' }, { status: 403 })
    }

    const organizationId = session.user.organizationId
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Ejecutar consultas en paralelo para mejor rendimiento
    const [
      activeSequences,
      totalExecutions,
      completedToday,
      scheduledToday,
      totalMessagesSent,
      totalRepliesReceived,
      responseTimeData
    ] = await Promise.all([
      // Secuencias activas
      prisma.followUpSequence.count({
        where: {
          organizationId,
          isActive: true
        }
      }),

      // Total de ejecuciones
      prisma.followUpExecution.count({
        where: {
          organizationId,
          status: {
            in: ['ACTIVE', 'PAUSED', 'COMPLETED']
          }
        }
      }),

      // Completados hoy (mensajes enviados hoy)
      prisma.followUpStepExecution.count({
        where: {
          execution: {
            organizationId
          },
          sentAt: {
            gte: startOfDay,
            lt: endOfDay
          }
        }
      }),

      // Programados para hoy
      prisma.followUpExecution.count({
        where: {
          organizationId,
          status: 'ACTIVE',
          nextScheduled: {
            gte: startOfDay,
            lt: endOfDay
          }
        }
      }),

      // Total mensajes enviados
      prisma.followUpStepExecution.count({
        where: {
          execution: {
            organizationId
          },
          sentAt: {
            not: null
          }
        }
      }),

      // Total respuestas recibidas (ejecutions completadas por respuesta)
      prisma.followUpExecution.count({
        where: {
          organizationId,
          status: 'COMPLETED',
          repliesReceived: {
            gt: 0
          }
        }
      }),

      // Datos para calcular tiempo promedio de respuesta
      prisma.followUpExecution.findMany({
        where: {
          organizationId,
          status: 'COMPLETED',
          lastMessageSent: { not: null },
          lastReplyReceived: { not: null }
        },
        select: {
          lastMessageSent: true,
          lastReplyReceived: true
        }
      })
    ])

    // Calcular tiempo promedio de respuesta
    let averageResponseTime = 0
    if (responseTimeData.length > 0) {
      const totalResponseTime = responseTimeData.reduce((acc, execution) => {
        if (execution.lastMessageSent && execution.lastReplyReceived) {
          const responseTime = execution.lastReplyReceived.getTime() - execution.lastMessageSent.getTime()
          return acc + (responseTime / (1000 * 60 * 60)) // Convertir a horas
        }
        return acc
      }, 0)
      averageResponseTime = totalResponseTime / responseTimeData.length
    }

    // Calcular tasa de conversión
    const conversionRate = totalExecutions > 0 
      ? (totalRepliesReceived / totalExecutions) * 100 
      : 0

    const metrics = {
      activeSequences,
      totalExecutions,
      completedToday,
      scheduledToday,
      totalMessagesSent,
      totalRepliesReceived,
      averageResponseTime: Math.round(averageResponseTime * 10) / 10, // Redondear a 1 decimal
      conversionRate: Math.round(conversionRate * 10) / 10 // Redondear a 1 decimal
    }

    return NextResponse.json({ metrics })
  } catch (error) {
    console.error('Error fetching follow-up metrics:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
