
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

    // Obtener estadísticas de agentes RAG
    const [
      totalAgents,
      activeAgents,
      totalConversations,
      totalMessages,
      averageRating
    ] = await Promise.all([
      prisma.rAGAgent.count({
        where: { organizationId: session.user.organizationId }
      }),
      prisma.rAGAgent.count({
        where: { 
          organizationId: session.user.organizationId,
          status: 'ACTIVE'
        }
      }),
      prisma.rAGAgentConversation.count({
        where: { organizationId: session.user.organizationId }
      }),
      prisma.rAGAgentMessage.count({
        where: { organizationId: session.user.organizationId }
      }),
      prisma.rAGAgentConversation.aggregate({
        where: { 
          organizationId: session.user.organizationId,
          rating: { not: null }
        },
        _avg: {
          rating: true
        }
      })
    ])

    const stats = {
      totalAgents,
      activeAgents,
      totalConversations,
      totalMessages,
      averageRating: averageRating._avg.rating
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Error in RAG agents stats API:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
