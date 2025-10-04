
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
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
    const { status } = body

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

    // Actualizar el estado
    const updatedAgent = await prisma.rAGAgent.update({
      where: { id },
      data: { status }
    })

    return NextResponse.json({
      success: true,
      data: updatedAgent
    })

  } catch (error) {
    console.error('Error toggling RAG agent:', error)
    return NextResponse.json(
      { success: false, error: 'Error cambiando estado del agente' },
      { status: 500 }
    )
  }
}
