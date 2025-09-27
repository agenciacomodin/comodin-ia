
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { KnowledgeSearcher } from '@/lib/knowledge-processor'

const prisma = new PrismaClient()

// POST /api/knowledge/search - Búsqueda semántica en la base de conocimiento
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      query, 
      maxResults = 10, 
      minSimilarity = 0.7,
      sourceTypes,
      sourceTags,
      conversationId,
      userId: requestUserId 
    } = body

    const organizationId = (session.user as any).organizationId
    const userId = requestUserId || (session.user as any).id
    const userName = (session.user as any).name || 'Usuario'

    // Validaciones
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Consulta requerida' },
        { status: 400 }
      )
    }

    // Crear searcher y realizar búsqueda
    const searcher = new KnowledgeSearcher(organizationId)
    const searchResult = await searcher.searchKnowledge(query, {
      maxResults,
      minSimilarity,
      sourceTypes,
      sourceTags
    })

    // Registrar uso en la base de datos
    await prisma.knowledgeUsage.create({
      data: {
        organizationId,
        userId,
        userName,
        conversationId,
        query,
        queryType: 'similarity',
        resultsFound: searchResult.totalResults,
        resultsUsed: searchResult.results.length,
        avgSimilarity: searchResult.results.length > 0 
          ? searchResult.results.reduce((sum, r) => sum + r.similarity, 0) / searchResult.results.length 
          : 0,
        sourcesConsulted: [...new Set(searchResult.results.map(r => r.sourceId))],
        chunksRetrieved: searchResult.results.map(r => r.chunkId),
        processingTime: searchResult.processingTime,
        responseGenerated: false
      }
    })

    // Actualizar estadísticas de uso de las fuentes
    const sourceIds = [...new Set(searchResult.results.map(r => r.sourceId))]
    if (sourceIds.length > 0) {
      await prisma.knowledgeSource.updateMany({
        where: { id: { in: sourceIds } },
        data: { 
          usageCount: { increment: 1 },
          lastUsedAt: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        results: searchResult.results,
        totalResults: searchResult.totalResults,
        processingTime: searchResult.processingTime,
        query,
        filters: {
          maxResults,
          minSimilarity,
          sourceTypes,
          sourceTags
        }
      }
    })

  } catch (error) {
    console.error('Error en búsqueda semántica:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
