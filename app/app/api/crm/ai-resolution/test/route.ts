

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { resolveCustomerQuery } from '@/lib/ai-knowledge-resolver'

// POST /api/crm/ai-resolution/test - Probar resolución de IA sin enviar mensajes
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      query,
      conversationId = 'test-conversation',
      options = {}
    } = body

    const organizationId = (session.user as any).organizationId
    const userId = (session.user as any).id
    const userName = (session.user as any).name

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query requerido para la prueba' },
        { status: 400 }
      )
    }

    console.log('🧪 Probando resolución de IA para:', query)
    
    // Ejecutar resolución
    const resolutionResult = await resolveCustomerQuery(
      organizationId,
      userId,
      userName,
      query,
      conversationId,
      {
        maxResults: 5,
        minSimilarity: 0.70,
        includeFilesInResponse: true,
        responseStyle: 'professional',
        ...options
      }
    )

    return NextResponse.json({
      success: true,
      data: {
        query,
        resolution: resolutionResult,
        summary: {
          hasResponse: resolutionResult.responseText.length > 0,
          confidence: resolutionResult.confidence,
          knowledgeSourcesFound: resolutionResult.knowledgeUsed.length,
          filesWouldBeSent: resolutionResult.filesToSend.length,
          processingTimeMs: resolutionResult.processingTime,
          wouldAutoRespond: resolutionResult.confidence >= 0.7
        }
      }
    })

  } catch (error) {
    console.error('Error en prueba de resolución:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// GET /api/crm/ai-resolution/test - Obtener estadísticas de resolución
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const organizationId = (session.user as any).organizationId
    
    // Obtener estadísticas recientes de Knowledge Usage
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    
    const recentResolutions = await prisma.knowledgeUsage.findMany({
      where: {
        organizationId,
        queryType: 'ai_resolution',
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 días
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    const stats = {
      totalResolutions: recentResolutions.length,
      avgConfidence: recentResolutions.length > 0 
        ? recentResolutions.reduce((sum: number, r: any) => sum + (r.avgSimilarity?.toNumber() || 0), 0) / recentResolutions.length
        : 0,
      responseGenerated: recentResolutions.filter((r: any) => r.responseGenerated).length,
      avgProcessingTime: recentResolutions.length > 0
        ? recentResolutions.reduce((sum: number, r: any) => sum + r.processingTime, 0) / recentResolutions.length
        : 0,
      sourcesUsed: new Set(recentResolutions.flatMap((r: any) => r.sourcesConsulted || [])).size,
      fileAttachments: recentResolutions.reduce((sum: number, r: any) => {
        const metadata = r.metadata as any
        return sum + (metadata?.filesAttached || 0)
      }, 0)
    }

    return NextResponse.json({
      success: true,
      data: {
        period: 'Últimos 7 días',
        statistics: stats,
        recentQueries: recentResolutions.slice(0, 10).map((r: any) => ({
          query: r.query,
          confidence: r.avgSimilarity?.toNumber() || 0,
          sourcesUsed: r.sourcesConsulted?.length || 0,
          responseGenerated: r.responseGenerated,
          timestamp: r.createdAt
        }))
      }
    })

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
