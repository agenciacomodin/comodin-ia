
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { UpdateAutomationRuleRequest } from '@/lib/types'

const prisma = new PrismaClient()

// GET /api/automations/rules/[id] - Obtener regla específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const rule = await prisma.automationRule.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId
      },
      include: {
        conditions: true,
        actions: {
          orderBy: { executionOrder: 'asc' }
        },
        executions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            rule: { select: { name: true } }
          }
        }
      }
    })

    if (!rule) {
      return NextResponse.json({
        success: false,
        error: 'Regla no encontrada'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: rule
    })

  } catch (error) {
    console.error('Error obteniendo regla de automatización:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

// PUT /api/automations/rules/[id] - Actualizar regla
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId || !session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar permisos
    if (session.user.role !== 'PROPIETARIO') {
      return NextResponse.json({ 
        error: 'Solo el propietario puede modificar reglas de automatización' 
      }, { status: 403 })
    }

    const body: UpdateAutomationRuleRequest = await request.json()

    // Verificar que la regla existe y pertenece a la organización
    const existingRule = await prisma.automationRule.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId
      }
    })

    if (!existingRule) {
      return NextResponse.json({
        success: false,
        error: 'Regla no encontrada'
      }, { status: 404 })
    }

    // Actualizar regla usando transacción
    const updatedRule = await prisma.$transaction(async (tx) => {
      // Eliminar condiciones y acciones existentes si se proporcionan nuevas
      if (body.conditions) {
        await tx.automationCondition.deleteMany({
          where: { ruleId: params.id }
        })
      }

      if (body.actions) {
        await tx.automationAction.deleteMany({
          where: { ruleId: params.id }
        })
      }

      // Actualizar la regla principal
      const rule = await tx.automationRule.update({
        where: { id: params.id },
        data: {
          name: body.name?.trim(),
          description: body.description?.trim(),
          priority: body.priority,
          isActive: body.isActive,
          modifiedBy: session.user.id,
          modifiedByName: session.user.name || session.user.email || 'Usuario',
          
          // Crear nuevas condiciones si se proporcionan
          ...(body.conditions && {
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
            }
          }),
          
          // Crear nuevas acciones si se proporcionan
          ...(body.actions && {
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
          })
        },
        include: {
          conditions: true,
          actions: true
        }
      })

      return rule
    })

    return NextResponse.json({
      success: true,
      data: updatedRule,
      message: 'Regla actualizada exitosamente'
    })

  } catch (error) {
    console.error('Error actualizando regla de automatización:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

// DELETE /api/automations/rules/[id] - Eliminar regla
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar permisos
    if (session.user.role !== 'PROPIETARIO') {
      return NextResponse.json({ 
        error: 'Solo el propietario puede eliminar reglas de automatización' 
      }, { status: 403 })
    }

    // Verificar que la regla existe y pertenece a la organización
    const existingRule = await prisma.automationRule.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId
      }
    })

    if (!existingRule) {
      return NextResponse.json({
        success: false,
        error: 'Regla no encontrada'
      }, { status: 404 })
    }

    // Eliminar regla (las condiciones y acciones se eliminan por CASCADE)
    await prisma.automationRule.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Regla eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error eliminando regla de automatización:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

// PATCH /api/automations/rules/[id] - Activar/Desactivar regla
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar permisos
    if (session.user.role !== 'PROPIETARIO') {
      return NextResponse.json({ 
        error: 'Solo el propietario puede modificar reglas de automatización' 
      }, { status: 403 })
    }

    const { isActive } = await request.json()

    // Verificar que la regla existe y pertenece a la organización
    const existingRule = await prisma.automationRule.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId
      }
    })

    if (!existingRule) {
      return NextResponse.json({
        success: false,
        error: 'Regla no encontrada'
      }, { status: 404 })
    }

    // Actualizar estado activo
    const updatedRule = await prisma.automationRule.update({
      where: { id: params.id },
      data: { 
        isActive,
        modifiedBy: session.user.id,
        modifiedByName: session.user.name || session.user.email || 'Usuario'
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedRule,
      message: `Regla ${isActive ? 'activada' : 'desactivada'} exitosamente`
    })

  } catch (error) {
    console.error('Error actualizando estado de regla:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}
