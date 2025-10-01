
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { 
  CreateAutomationRuleRequest, 
  AutomationRuleSummary,
  AutomationFilters 
} from '@/lib/types'

const prisma = new PrismaClient()

// GET /api/automations/rules - Obtener reglas de automatización
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filters: AutomationFilters = {
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
      searchTerm: searchParams.get('search') || undefined
    }

    // Construir filtros de base de datos
    const where: any = {
      organizationId: session.user.organizationId
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    if (filters.searchTerm) {
      where.OR = [
        { name: { contains: filters.searchTerm, mode: 'insensitive' } },
        { description: { contains: filters.searchTerm, mode: 'insensitive' } }
      ]
    }

    // Obtener reglas con estadísticas
    const rules = await prisma.automationRule.findMany({
      where,
      include: {
        conditions: true,
        actions: true,
        _count: {
          select: {
            conditions: true,
            actions: true,
            executions: true
          }
        }
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    // Mapear a formato de respuesta
    const ruleSummaries: AutomationRuleSummary[] = rules.map(rule => ({
      id: rule.id,
      name: rule.name,
      description: rule.description || undefined,
      isActive: rule.isActive,
      priority: rule.priority,
      executionCount: rule.executionCount,
      lastExecutedAt: rule.lastExecutedAt || undefined,
      successCount: rule.successCount,
      errorCount: rule.errorCount,
      successRate: rule.executionCount > 0 
        ? Math.round((rule.successCount / rule.executionCount) * 100) / 100
        : 0,
      createdByName: rule.createdByName,
      createdAt: rule.createdAt,
      conditionsCount: rule._count.conditions,
      actionsCount: rule._count.actions
    }))

    return NextResponse.json({
      success: true,
      data: ruleSummaries,
      total: ruleSummaries.length
    })

  } catch (error) {
    console.error('Error obteniendo reglas de automatización:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

// POST /api/automations/rules - Crear nueva regla de automatización
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId || !session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar permisos (solo PROPIETARIO puede crear automatizaciones)
    if (session.user.role !== 'PROPIETARIO') {
      return NextResponse.json({ 
        error: 'Solo el propietario puede crear reglas de automatización' 
      }, { status: 403 })
    }

    const body: CreateAutomationRuleRequest = await request.json()

    // Validaciones básicas
    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'El nombre de la regla es requerido'
      }, { status: 400 })
    }

    if (!body.conditions || body.conditions.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Debe definir al menos una condición'
      }, { status: 400 })
    }

    if (!body.actions || body.actions.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Debe definir al menos una acción'
      }, { status: 400 })
    }

    // Crear la regla con sus condiciones y acciones
    const newRule = await prisma.automationRule.create({
      data: {
        organizationId: session.user.organizationId,
        name: body.name.trim(),
        description: body.description?.trim(),
        priority: body.priority || 100,
        isActive: body.isActive ?? true,
        createdBy: session.user.id,
        createdByName: session.user.name || session.user.email || 'Usuario',
        
        // Crear condiciones
        conditions: {
          create: body.conditions.map(condition => ({
            type: condition.type,
            logicalOperator: condition.logicalOperator || 'AND',
            intentionTypes: condition.intentionTypes || [],
            keywords: condition.keywords || [],
            keywordMatchType: condition.keywordMatchType,
            timeStart: condition.timeStart,
            timeEnd: condition.timeEnd,
            weekdays: condition.weekdays || [],
            timezone: condition.timezone,
            messageCountMin: condition.messageCountMin,
            messageCountMax: condition.messageCountMax,
            responseTimeMin: condition.responseTimeMin,
            responseTimeMax: condition.responseTimeMax,
            metadata: condition.metadata
          }))
        },
        
        // Crear acciones
        actions: {
          create: body.actions.map((action, index) => ({
            type: action.type,
            executionOrder: action.executionOrder || index + 1,
            tagName: action.tagName,
            tagColor: action.tagColor,
            agentId: action.agentId,
            priority: action.priority as any,
            replyMessage: action.replyMessage,
            replyDelay: action.replyDelay,
            targetAgentId: action.targetAgentId,
            transferReason: action.transferReason,
            taskTitle: action.taskTitle,
            taskDescription: action.taskDescription,
            taskDueDate: action.taskDueDate,
            notificationTitle: action.notificationTitle,
            notificationMessage: action.notificationMessage,
            notificationChannels: action.notificationChannels || [],
            metadata: action.metadata
          }))
        }
      },
      include: {
        conditions: true,
        actions: true
      }
    })

    return NextResponse.json({
      success: true,
      data: newRule,
      message: 'Regla de automatización creada exitosamente'
    })

  } catch (error) {
    console.error('Error creando regla de automatización:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}
