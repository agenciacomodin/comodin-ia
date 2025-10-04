
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/agents
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const agents = await prisma.rAGAgent.findMany({
      where: {
        organizationId: session.user.organizationId
      },
      include: {
        knowledgeBases: {
          include: {
            knowledgeSource: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        },
        _count: {
          select: {
            conversations: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: agents
    })
  } catch (error) {
    console.error('Error al obtener agentes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/agents
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      systemPrompt,
      aiModel = 'gpt-4o-mini',
      aiProvider = 'OPENAI',
      type = 'CUSTOMER_SUPPORT',
      temperature = 0.7,
      knowledgeSourceIds = []
    } = body

    if (!name) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }

    const agent = await prisma.rAGAgent.create({
      data: {
        organizationId: session.user.organizationId,
        name,
        description,
        systemPrompt,
        aiModel,
        aiProvider,
        type,
        temperature,
        status: 'ACTIVE',
        knowledgeBases: {
          create: knowledgeSourceIds.map((sourceId: string) => ({
            knowledgeSource: {
              connect: { id: sourceId }
            }
          }))
        }
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
    }, { status: 201 })
  } catch (error) {
    console.error('Error al crear agente:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
