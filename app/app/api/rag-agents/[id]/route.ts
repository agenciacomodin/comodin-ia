
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()
    const {
      name,
      description,
      type,
      aiProvider,
      aiModel,
      systemPrompt,
      isCoordinator,
      priority
    } = body

    // Verificar que el agente pertenece a la organización
    const existingAgent = await prisma.rAGAgent.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId
      }
    })

    if (!existingAgent) {
      return NextResponse.json(
        { success: false, error: 'Agente no encontrado' },
        { status: 404 }
      )
    }

    // Validar coordinador si es necesario
    if (isCoordinator && !existingAgent.isCoordinator) {
      const existingCoordinator = await prisma.rAGAgent.findFirst({
        where: {
          organizationId: session.user.organizationId,
          isCoordinator: true,
          id: { not: id }
        }
      })

      if (existingCoordinator) {
        return NextResponse.json(
          { success: false, error: 'Ya existe un agente coordinador' },
          { status: 400 }
        )
      }
    }

    // Actualizar el agente
    const updatedAgent = await prisma.rAGAgent.update({
      where: { id },
      data: {
        name,
        description,
        type,
        aiProvider,
        aiModel,
        systemPrompt,
        isCoordinator: isCoordinator || false,
        priority: priority || 1
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedAgent
    })

  } catch (error) {
    console.error('Error updating RAG agent:', error)
    return NextResponse.json(
      { success: false, error: 'Error actualizando agente' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = params

    // Verificar que el agente pertenece a la organización
    const agent = await prisma.rAGAgent.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId
      }
    })

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agente no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar el agente (las relaciones se eliminan en cascada)
    await prisma.rAGAgent.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Agente eliminado correctamente'
    })

  } catch (error) {
    console.error('Error deleting RAG agent:', error)
    return NextResponse.json(
      { success: false, error: 'Error eliminando agente' },
      { status: 500 }
    )
  }
}
