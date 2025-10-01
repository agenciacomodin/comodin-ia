
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/automations/executions - Obtener historial de ejecuciones
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '25'), 100)
    const ruleId = searchParams.get('ruleId')
    const success = searchParams.get('success')
    
    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {
      rule: {
        organizationId: session.user.organizationId
      }
    }

    if (ruleId) {
      where.ruleId = ruleId
    }

    if (success !== null) {
      where.success = success === 'true'
    }

    // Obtener ejecuciones con información relacionada
    const [executions, total] = await Promise.all([
      prisma.automationExecution.findMany({
        where,
        include: {
          rule: {
            select: {
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.automationExecution.count({ where })
    ])

    // Obtener información adicional de contactos
    const executionsWithContactInfo = await Promise.all(
      executions.map(async (execution) => {
        let contactName = null
        if (execution.contactId) {
          const contact = await prisma.contact.findUnique({
            where: { id: execution.contactId },
            select: { name: true }
          })
          contactName = contact?.name || null
        }

        return {
          id: execution.id,
          ruleId: execution.ruleId,
          ruleName: execution.rule.name,
          messageId: execution.messageId,
          conversationId: execution.conversationId,
          contactId: execution.contactId,
          contactName,
          success: execution.success,
          error: execution.error,
          executionTime: execution.executionTime,
          detectedIntentions: execution.detectedIntentions,
          confidenceScore: execution.confidenceScore?.toNumber(),
          keywordsFound: execution.keywordsFound,
          actionsExecuted: execution.actionsExecuted,
          actionsSkipped: execution.actionsSkipped,
          createdAt: execution.createdAt
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: executionsWithContactInfo,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error obteniendo historial de ejecuciones:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}
