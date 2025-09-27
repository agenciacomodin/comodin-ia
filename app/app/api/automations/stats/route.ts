
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { AutomationStats } from '@/lib/types'

const prisma = new PrismaClient()

// GET /api/automations/stats - Obtener estadísticas de automatizaciones
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const organizationId = session.user.organizationId

    // Obtener estadísticas básicas
    const [
      totalRules,
      activeRules,
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      avgExecutionTime,
      executionsToday
    ] = await Promise.all([
      // Total de reglas
      prisma.automationRule.count({
        where: { organizationId }
      }),
      
      // Reglas activas
      prisma.automationRule.count({
        where: { 
          organizationId,
          isActive: true 
        }
      }),
      
      // Total de ejecuciones
      prisma.automationExecution.count({
        where: {
          rule: { organizationId }
        }
      }),
      
      // Ejecuciones exitosas
      prisma.automationExecution.count({
        where: {
          rule: { organizationId },
          success: true
        }
      }),
      
      // Ejecuciones fallidas
      prisma.automationExecution.count({
        where: {
          rule: { organizationId },
          success: false
        }
      }),
      
      // Tiempo promedio de ejecución
      prisma.automationExecution.aggregate({
        where: {
          rule: { organizationId }
        },
        _avg: {
          executionTime: true
        }
      }),
      
      // Ejecuciones de hoy
      prisma.automationExecution.count({
        where: {
          rule: { organizationId },
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ])

    // Obtener top intenciones detectadas
    const topIntentionsData = await prisma.automationExecution.findMany({
      where: {
        rule: { organizationId },
        success: true
      },
      select: {
        detectedIntentions: true
      }
    })

    // Procesar intenciones
    const intentionCounts: Record<string, number> = {}
    topIntentionsData.forEach(execution => {
      execution.detectedIntentions.forEach(intention => {
        intentionCounts[intention] = (intentionCounts[intention] || 0) + 1
      })
    })

    const topIntentions = Object.entries(intentionCounts)
      .map(([intention, count]) => ({ intention: intention as any, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Obtener top acciones ejecutadas
    const topActionsData = await prisma.automationExecution.findMany({
      where: {
        rule: { organizationId },
        success: true
      },
      select: {
        actionsExecuted: true
      }
    })

    // Procesar acciones
    const actionCounts: Record<string, number> = {}
    topActionsData.forEach(execution => {
      if (Array.isArray(execution.actionsExecuted)) {
        execution.actionsExecuted.forEach((action: any) => {
          if (action.type) {
            actionCounts[action.type] = (actionCounts[action.type] || 0) + 1
          }
        })
      }
    })

    const topActions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action: action as any, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const stats: AutomationStats = {
      totalRules,
      activeRules,
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      avgExecutionTime: Math.round(avgExecutionTime._avg.executionTime || 0),
      executionsToday,
      topIntentions,
      topActions
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Error obteniendo estadísticas de automatización:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}
