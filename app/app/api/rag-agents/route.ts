
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const agents = await prisma.rAGAgent.findMany({
      where: {
        organizationId: session.user.organizationId
      },
      orderBy: [
        { isCoordinator: 'desc' },
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: agents
    })

  } catch (error) {
    console.error('Error in RAG agents API:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      type,
      aiProvider,
      aiModel,
      systemPrompt,
      isCoordinator,
      priority,
      knowledgeSourceIds
    } = body

    // Validar que no haya otro coordinador si este es coordinador
    if (isCoordinator) {
      const existingCoordinator = await prisma.rAGAgent.findFirst({
        where: {
          organizationId: session.user.organizationId,
          isCoordinator: true
        }
      })

      if (existingCoordinator) {
        return NextResponse.json(
          { success: false, error: 'Ya existe un agente coordinador. Solo puede haber uno por organización.' },
          { status: 400 }
        )
      }
    }

    // Crear el agente
    const agent = await prisma.rAGAgent.create({
      data: {
        organizationId: session.user.organizationId,
        name,
        description,
        type,
        aiProvider,
        aiModel,
        systemPrompt,
        isCoordinator: isCoordinator || false,
        priority: priority || 1,
        status: 'ACTIVE'
      }
    })

    // Si se proporcionaron fuentes de conocimiento, crear las relaciones
    if (knowledgeSourceIds && knowledgeSourceIds.length > 0) {
      const knowledgeRelations = knowledgeSourceIds.map((sourceId: string) => ({
        agentId: agent.id,
        knowledgeSourceId: sourceId
      }))

      await prisma.rAGAgentKnowledgeBase.createMany({
        data: knowledgeRelations
      })
    }

    return NextResponse.json({
      success: true,
      data: agent
    })

  } catch (error) {
    console.error('Error creating RAG agent:', error)
    return NextResponse.json(
      { success: false, error: 'Error creando agente' },
      { status: 500 }
    )
  }
}
