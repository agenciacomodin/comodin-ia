
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { hasPermission } from '@/lib/permissions'
import { ActivateFollowUpRequest } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!hasPermission(session.user.role, 'VIEW_FOLLOW_UPS')) {
      return NextResponse.json({ error: 'Sin permisos suficientes' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {
      organizationId: session.user.organizationId
    }

    if (status && status !== 'all') {
      where.status = status
    }

    const executions = await prisma.followUpExecution.findMany({
      where,
      include: {
        sequence: {
          select: {
            name: true,
            isActive: true
          }
        },
        conversation: {
          include: {
            contact: {
              select: {
                name: true,
                phone: true,
                avatar: true
              }
            }
          }
        },
        stepExecutions: {
          include: {
            step: {
              select: {
                stepOrder: true,
                messageContent: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: [
        { nextScheduled: 'asc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      skip: offset
    })

    const total = await prisma.followUpExecution.count({ where })

    return NextResponse.json({ 
      executions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Error fetching follow-up executions:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!hasPermission(session.user.role, 'EXECUTE_FOLLOW_UPS')) {
      return NextResponse.json({ error: 'Sin permisos suficientes' }, { status: 403 })
    }

    const body: ActivateFollowUpRequest = await request.json()

    // Validar que la conversación existe y pertenece a la organización
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: body.conversationId,
        organizationId: session.user.organizationId
      },
      include: {
        contact: {
          select: {
            name: true,
            phone: true
          }
        },
        messages: {
          orderBy: {
            sentAt: 'desc'
          },
          take: 1,
          select: {
            sentAt: true,
            direction: true
          }
        }
      }
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 })
    }

    // Validar que la secuencia existe y pertenece a la organización
    const sequence = await prisma.followUpSequence.findFirst({
      where: {
        id: body.sequenceId,
        organizationId: session.user.organizationId,
        isActive: true
      },
      include: {
        steps: {
          orderBy: {
            stepOrder: 'asc'
          }
        }
      }
    })

    if (!sequence) {
      return NextResponse.json({ error: 'Secuencia no encontrada o inactiva' }, { status: 404 })
    }

    // Verificar si ya existe una ejecución activa para esta conversación
    const existingExecution = await prisma.followUpExecution.findFirst({
      where: {
        conversationId: body.conversationId,
        status: {
          in: ['ACTIVE', 'PAUSED']
        }
      }
    })

    if (existingExecution) {
      return NextResponse.json({ 
        error: 'Ya existe un seguimiento activo para esta conversación' 
      }, { status: 400 })
    }

    // Calcular cuándo programar el primer paso
    const lastMessage = conversation.messages[0]
    const now = new Date()
    let nextScheduled = now

    if (lastMessage && lastMessage.direction === 'OUTGOING') {
      // Si el último mensaje fue nuestro, calcular basado en el tiempo de no respuesta
      const waitMinutes = sequence.noResponseTime * (sequence.noResponseUnit === 'DAYS' ? 1440 : 
                                                    sequence.noResponseUnit === 'HOURS' ? 60 : 1)
      const timeSinceLastMessage = now.getTime() - lastMessage.sentAt.getTime()
      const waitTime = (waitMinutes * 60 * 1000) - timeSinceLastMessage

      if (waitTime > 0) {
        nextScheduled = new Date(now.getTime() + waitTime)
      }
    }

    // Crear la ejecución
    const execution = await prisma.followUpExecution.create({
      data: {
        organizationId: session.user.organizationId,
        sequenceId: body.sequenceId,
        conversationId: body.conversationId,
        totalSteps: sequence.steps.length,
        lastMessageSent: lastMessage?.direction === 'OUTGOING' ? lastMessage.sentAt : null,
        lastReplyReceived: lastMessage?.direction === 'INCOMING' ? lastMessage.sentAt : null,
        nextScheduled,
        createdBy: session.user.id,
        createdByName: session.user.name || 'Usuario'
      }
    })

    return NextResponse.json({ 
      message: 'Seguimiento activado exitosamente',
      execution
    })
  } catch (error) {
    console.error('Error activating follow-up:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
