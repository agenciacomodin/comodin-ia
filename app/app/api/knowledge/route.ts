
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { KnowledgeSourceType, KnowledgeSourceStatus } from '@prisma/client'
import { KnowledgeFilters, KnowledgeSourceSummary } from '@/lib/types'

const prisma = new PrismaClient()

// GET /api/knowledge - Listar fuentes de conocimiento
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const organizationId = (session.user as any).organizationId

    // Filtros de búsqueda
    const status = searchParams.get('status')?.split(',') as KnowledgeSourceStatus[] | undefined
    const type = searchParams.get('type')?.split(',') as KnowledgeSourceType[] | undefined
    const searchTerm = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {
      organizationId
    }

    if (status?.length) {
      where.status = { in: status }
    }

    if (type?.length) {
      where.type = { in: type }
    }

    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { originalFileName: { contains: searchTerm, mode: 'insensitive' } },
        { sourceUrl: { contains: searchTerm, mode: 'insensitive' } }
      ]
    }

    // Consultar fuentes
    const [sources, totalCount] = await Promise.all([
      prisma.knowledgeSource.findMany({
        where,
        select: {
          id: true,
          name: true,
          type: true,
          status: true,
          originalFileName: true,
          sourceUrl: true,
          fileSize: true,
          fileMimeType: true,
          totalChunks: true,
          processedChunks: true,
          failedChunks: true,
          contentQuality: true,
          usageCount: true,
          lastUsedAt: true,
          tags: true,
          lastError: true,
          createdByName: true,
          createdAt: true,
          processedAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.knowledgeSource.count({ where })
    ])

    // Mapear resultados
    const sourcesWithProgress: KnowledgeSourceSummary[] = sources.map(source => ({
      id: source.id,
      name: source.name,
      type: source.type,
      status: source.status,
      originalFileName: source.originalFileName || undefined,
      sourceUrl: source.sourceUrl || undefined,
      fileSize: source.fileSize || undefined,
      fileMimeType: source.fileMimeType || undefined,
      totalChunks: source.totalChunks,
      processedChunks: source.processedChunks,
      failedChunks: source.failedChunks,
      contentQuality: source.contentQuality?.toNumber(),
      usageCount: source.usageCount,
      lastUsedAt: source.lastUsedAt || undefined,
      tags: source.tags,
      lastError: source.lastError || undefined,
      createdByName: source.createdByName,
      createdAt: source.createdAt,
      processedAt: source.processedAt || undefined,
      processingProgress: source.totalChunks > 0 
        ? Math.round((source.processedChunks / source.totalChunks) * 100) 
        : 0
    }))

    return NextResponse.json({
      success: true,
      data: {
        sources: sourcesWithProgress,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    })

  } catch (error) {
    console.error('Error obteniendo fuentes de conocimiento:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/knowledge - Crear nueva fuente de conocimiento
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, sourceUrl, textContent, tags = [], metadata = {}, chunkSize = 1000, chunkOverlap = 100 } = body
    const organizationId = (session.user as any).organizationId
    const userId = (session.user as any).id
    const userName = (session.user as any).name || 'Usuario'

    // Validaciones básicas
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Nombre y tipo son requeridos' },
        { status: 400 }
      )
    }

    if (type === KnowledgeSourceType.URL && !sourceUrl) {
      return NextResponse.json(
        { error: 'URL es requerida para fuentes de tipo URL' },
        { status: 400 }
      )
    }

    if (type === KnowledgeSourceType.TEXT && !textContent) {
      return NextResponse.json(
        { error: 'Contenido de texto es requerido para fuentes de tipo TEXT' },
        { status: 400 }
      )
    }

    // Crear fuente de conocimiento
    const source = await prisma.knowledgeSource.create({
      data: {
        organizationId,
        name,
        type,
        status: KnowledgeSourceStatus.PROCESSING,
        sourceUrl: type === KnowledgeSourceType.URL ? sourceUrl : undefined,
        textContent: type === KnowledgeSourceType.TEXT ? textContent : undefined,
        tags,
        metadata,
        chunkSize,
        chunkOverlap,
        createdBy: userId,
        createdByName: userName
      }
    })

    // Si es de tipo TEXT o URL, comenzar procesamiento inmediato
    if (type !== KnowledgeSourceType.FILE) {
      // Importar y usar el procesador (se ejecuta en background)
      import('@/lib/knowledge-processor').then(async ({ KnowledgeProcessor }) => {
        const processor = new KnowledgeProcessor(organizationId, userId, userName)
        await processor.processKnowledgeSource(source.id)
      }).catch(error => {
        console.error('Error procesando fuente:', error)
      })
    }

    return NextResponse.json({
      success: true,
      data: { source }
    })

  } catch (error) {
    console.error('Error creando fuente de conocimiento:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
