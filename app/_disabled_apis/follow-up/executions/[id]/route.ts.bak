
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { hasPermission } from '@/lib/permissions'

export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!hasPermission(session.user.role, 'VIEW_FOLLOW_UPS')) {
      return NextResponse.json({ error: 'Sin permisos suficientes' }, { status: 403 })
    }

    const execution = await prisma.followUpExecution.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId
      },
      include: {
        sequence: true,
        conversation: {
          include: {
            contact: true
          }
        },
        stepExecutions: {
          include: {
            step: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!execution) {
      return NextResponse.json({ error: 'Ejecución no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ execution })
  } catch (error) {
    console.error('Error fetching follow-up execution:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!hasPermission(session.user.role, 'EXECUTE_FOLLOW_UPS')) {
      return NextResponse.json({ error: 'Sin permisos suficientes' }, { status: 403 })
    }

    const body = await request.json()
    const { action } = body

    const execution = await prisma.followUpExecution.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId
      }
    })

    if (!execution) {
      return NextResponse.json({ error: 'Ejecución no encontrada' }, { status: 404 })
    }

    let updateData: any = {}

    switch (action) {
      case 'pause':
        updateData.status = 'PAUSED'
        updateData.nextScheduled = null
        break
      
      case 'resume':
        updateData.status = 'ACTIVE'
        // Recalcular próxima programación
        updateData.nextScheduled = new Date(Date.now() + 60 * 60 * 1000) // En 1 hora
        break
      
      case 'cancel':
        updateData.status = 'CANCELLED'
        updateData.nextScheduled = null
        updateData.completedAt = new Date()
        break
      
      case 'complete':
        updateData.status = 'COMPLETED'
        updateData.nextScheduled = null
        updateData.completedAt = new Date()
        break
      
      default:
        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
    }

    const updatedExecution = await prisma.followUpExecution.update({
      where: {
        id: params.id
      },
      data: updateData
    })

    return NextResponse.json({ 
      message: `Ejecución ${action === 'pause' ? 'pausada' : 
                             action === 'resume' ? 'reanudada' :
                             action === 'cancel' ? 'cancelada' : 'completada'} exitosamente`,
      execution: updatedExecution
    })
  } catch (error) {
    console.error('Error updating follow-up execution:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!hasPermission(session.user.role, 'EXECUTE_FOLLOW_UPS')) {
      return NextResponse.json({ error: 'Sin permisos suficientes' }, { status: 403 })
    }

    const execution = await prisma.followUpExecution.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId
      }
    })

    if (!execution) {
      return NextResponse.json({ error: 'Ejecución no encontrada' }, { status: 404 })
    }

    await prisma.followUpExecution.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: 'Ejecución eliminada exitosamente' })
  } catch (error) {
    console.error('Error deleting follow-up execution:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
