
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { KnowledgeProcessor } from '@/lib/knowledge-processor'
import { KnowledgeSourceStatus } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/knowledge/[id]/process - Procesar o reprocesar fuente de conocimiento
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { forceReprocess = false, chunkSize, chunkOverlap } = body
    
    const organizationId = (session.user as any).organizationId
    const userId = (session.user as any).id
    const userName = (session.user as any).name || 'Usuario'
    const sourceId = params.id

    // Verificar que la fuente existe
    const source = await prisma.knowledgeSource.findFirst({
      where: {
        id: sourceId,
        organizationId
      }
    })

    if (!source) {
      return NextResponse.json(
        { error: 'Fuente de conocimiento no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si ya está procesando
    if (source.status === KnowledgeSourceStatus.PROCESSING ||
        source.status === KnowledgeSourceStatus.CHUNKING ||
        source.status === KnowledgeSourceStatus.EMBEDDING) {
      return NextResponse.json(
        { error: 'La fuente ya está siendo procesada' },
        { status: 400 }
      )
    }

    // Si se solicita reprocesamiento forzado, limpiar datos existentes
    if (forceReprocess) {
      // Eliminar chunks y embeddings existentes
      await prisma.knowledgeChunk.deleteMany({
        where: { sourceId }
      })

      // Actualizar contadores
      await prisma.knowledgeSource.update({
        where: { id: sourceId },
        data: {
          totalChunks: 0,
          processedChunks: 0,
          failedChunks: 0,
          processedAt: null,
          lastError: null,
          ...(chunkSize && { chunkSize }),
          ...(chunkOverlap && { chunkOverlap })
        }
      })
    }

    // Marcar como procesando
    await prisma.knowledgeSource.update({
      where: { id: sourceId },
      data: { 
        status: KnowledgeSourceStatus.PROCESSING,
        lastError: null
      }
    })

    // Iniciar procesamiento en background
    const processor = new KnowledgeProcessor(organizationId, userId, userName)
    
    // Ejecutar procesamiento de manera asíncrona
    setImmediate(async () => {
      try {
        const result = await processor.processKnowledgeSource(sourceId)
        console.log(`Procesamiento completado para fuente ${sourceId}:`, result)
      } catch (error) {
        console.error(`Error procesando fuente ${sourceId}:`, error)
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Procesamiento iniciado',
      data: {
        sourceId,
        status: KnowledgeSourceStatus.PROCESSING,
        forceReprocess,
        estimatedTime: '2-5 minutos' // Estimación aproximada
      }
    })

  } catch (error) {
    console.error('Error iniciando procesamiento:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
