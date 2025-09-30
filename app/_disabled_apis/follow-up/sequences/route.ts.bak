
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { userHasPermission, Permission } from '@/lib/permissions'
import { 
  CreateFollowUpSequenceRequest, 
  UpdateFollowUpSequenceRequest,
  FollowUpTriggerType,
  FollowUpChannel,
  TimeUnit
} from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!userHasPermission(session.user.role, Permission.VIEW_FOLLOW_UPS)) {
      return NextResponse.json({ error: 'Sin permisos suficientes' }, { status: 403 })
    }

    const sequences = await prisma.followUpSequence.findMany({
      where: {
        organizationId: session.user.organizationId
      },
      include: {
        steps: {
          orderBy: {
            stepOrder: 'asc'
          }
        },
        _count: {
          select: {
            executions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ sequences })
  } catch (error) {
    console.error('Error fetching follow-up sequences:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!userHasPermission(session.user.role, Permission.CREATE_FOLLOW_UP_SEQUENCES)) {
      return NextResponse.json({ error: 'Sin permisos suficientes' }, { status: 403 })
    }

    const body: CreateFollowUpSequenceRequest = await request.json()

    // Validaciones
    if (!body.name || body.steps.length === 0) {
      return NextResponse.json({ 
        error: 'Nombre y al menos un paso son requeridos' 
      }, { status: 400 })
    }

    // Crear secuencia con pasos
    const sequence = await prisma.followUpSequence.create({
      data: {
        organizationId: session.user.organizationId,
        name: body.name,
        description: body.description,
        triggerType: body.triggerType,
        triggerTags: body.triggerTags,
        triggerChannels: body.triggerChannels,
        noResponseTime: body.noResponseTime,
        noResponseUnit: body.noResponseUnit,
        maxAttempts: body.maxAttempts,
        stopOnReply: body.stopOnReply,
        createdBy: session.user.id,
        createdByName: session.user.name || 'Usuario',
        steps: {
          create: body.steps.map((step, index) => ({
            stepOrder: index + 1,
            waitTime: step.waitTime,
            waitUnit: step.waitUnit,
            messageContent: step.messageContent,
            channels: step.channels
          }))
        }
      },
      include: {
        steps: {
          orderBy: {
            stepOrder: 'asc'
          }
        }
      }
    })

    return NextResponse.json({ 
      message: 'Secuencia creada exitosamente',
      sequence 
    })
  } catch (error) {
    console.error('Error creating follow-up sequence:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!hasPermission(session.user.role, 'MANAGE_FOLLOW_UP_SEQUENCES')) {
      return NextResponse.json({ error: 'Sin permisos suficientes' }, { status: 403 })
    }

    const body: UpdateFollowUpSequenceRequest = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: 'ID de secuencia requerido' }, { status: 400 })
    }

    // Verificar que la secuencia pertenece a la organización
    const existingSequence = await prisma.followUpSequence.findFirst({
      where: {
        id: body.id,
        organizationId: session.user.organizationId
      }
    })

    if (!existingSequence) {
      return NextResponse.json({ error: 'Secuencia no encontrada' }, { status: 404 })
    }

    // Actualizar secuencia
    const updateData: any = {}
    
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.triggerType !== undefined) updateData.triggerType = body.triggerType
    if (body.triggerTags !== undefined) updateData.triggerTags = body.triggerTags
    if (body.triggerChannels !== undefined) updateData.triggerChannels = body.triggerChannels
    if (body.noResponseTime !== undefined) updateData.noResponseTime = body.noResponseTime
    if (body.noResponseUnit !== undefined) updateData.noResponseUnit = body.noResponseUnit
    if (body.maxAttempts !== undefined) updateData.maxAttempts = body.maxAttempts
    if (body.stopOnReply !== undefined) updateData.stopOnReply = body.stopOnReply

    const sequence = await prisma.followUpSequence.update({
      where: {
        id: body.id
      },
      data: updateData,
      include: {
        steps: {
          orderBy: {
            stepOrder: 'asc'
          }
        }
      }
    })

    return NextResponse.json({ 
      message: 'Secuencia actualizada exitosamente',
      sequence 
    })
  } catch (error) {
    console.error('Error updating follow-up sequence:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
