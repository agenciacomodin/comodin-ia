
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/agents/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const agent = await prisma.rAGAgent.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId
      },
      include: {
        knowledgeBases: {
          include: {
            knowledgeSource: true
          }
        },
        conversations: {
          orderBy: { updatedAt: 'desc' },
          take: 10,
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 5
            }
          }
        }
      }
    })

    if (!agent) {
      return NextResponse.json({ error: 'Agente no encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: agent
    })
  } catch (error) {
    console.error('Error al obtener agente:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/agents/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { knowledgeSourceIds, ...updateData } = body

    const agent = await prisma.rAGAgent.update({
      where: { id: params.id },
      data: {
        ...updateData,
        ...(knowledgeSourceIds && {
          knowledgeBases: {
            deleteMany: {},
            create: knowledgeSourceIds.map((sourceId: string) => ({
              knowledgeSource: {
                connect: { id: sourceId }
              }
            }))
          }
        })
      },
      include: {
        knowledgeBases: {
          include: {
            knowledgeSource: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: agent
    })
  } catch (error) {
    console.error('Error al actualizar agente:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/agents/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await prisma.rAGAgent.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Agente eliminado correctamente'
    })
  } catch (error) {
    console.error('Error al eliminar agente:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
