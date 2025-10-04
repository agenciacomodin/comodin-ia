
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'

const prisma = new PrismaClient()

// Configuración de S3
const s3Client = new S3Client({})
const bucketName = process.env.AWS_BUCKET_NAME || ''

// GET /api/knowledge/[id] - Obtener detalles de una fuente de conocimiento
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const organizationId = (session.user as any).organizationId
    const sourceId = params.id

    // Buscar la fuente con detalles completos
    const source = await prisma.knowledgeSource.findFirst({
      where: {
        id: sourceId,
        organizationId
      },
      include: {
        chunks: {
          take: 10, // Solo los primeros 10 chunks para no sobrecargar
          orderBy: { chunkIndex: 'asc' },
          select: {
            id: true,
            chunkIndex: true,
            content: true,
            wordCount: true,
            status: true,
            contentQuality: true,
            processingError: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            chunks: true
          }
        }
      }
    })

    if (!source) {
      return NextResponse.json(
        { error: 'Fuente de conocimiento no encontrada' },
        { status: 404 }
      )
    }

    // Formatear respuesta
    const sourceDetail = {
      id: source.id,
      organizationId: source.organizationId,
      name: source.name,
      type: source.type,
      status: source.status,
      originalFileName: source.originalFileName,
      sourceUrl: source.sourceUrl,
      fileSize: source.fileSize,
      fileMimeType: source.fileMimeType,
      textContent: source.textContent?.slice(0, 1000), // Solo primeros 1000 chars
      totalChunks: source.totalChunks,
      processedChunks: source.processedChunks,
      failedChunks: source.failedChunks,
      contentQuality: source.contentQuality?.toNumber(),
      usageCount: source.usageCount,
      lastUsedAt: source.lastUsedAt,
      tags: source.tags,
      metadata: source.metadata,
      chunkSize: source.chunkSize,
      chunkOverlap: source.chunkOverlap,
      lastError: source.lastError,
      retryCount: source.retryCount,
      maxRetries: source.maxRetries,
      createdBy: source.createdBy,
      createdByName: source.createdByName,
      createdAt: source.createdAt,
      updatedAt: source.updatedAt,
      processedAt: source.processedAt,
      processingProgress: source.totalChunks > 0 
        ? Math.round((source.processedChunks / source.totalChunks) * 100) 
        : 0,
      chunks: source.chunks.map(chunk => ({
        id: chunk.id,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content.slice(0, 200) + '...', // Contenido truncado
        wordCount: chunk.wordCount,
        status: chunk.status,
        contentQuality: chunk.contentQuality?.toNumber(),
        processingError: chunk.processingError,
        createdAt: chunk.createdAt
      })),
      totalChunksCount: source._count.chunks
    }

    return NextResponse.json({
      success: true,
      data: sourceDetail
    })

  } catch (error) {
    console.error('Error obteniendo detalles de fuente:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/knowledge/[id] - Actualizar fuente de conocimiento
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const organizationId = (session.user as any).organizationId
    const sourceId = params.id

    // Verificar que la fuente existe y pertenece a la organización
    const existingSource = await prisma.knowledgeSource.findFirst({
      where: {
        id: sourceId,
        organizationId
      }
    })

    if (!existingSource) {
      return NextResponse.json(
        { error: 'Fuente de conocimiento no encontrada' },
        { status: 404 }
      )
    }

    const { name, tags, metadata, status, chunkSize, chunkOverlap } = body

    // Actualizar fuente
    const updatedSource = await prisma.knowledgeSource.update({
      where: { id: sourceId },
      data: {
        ...(name && { name }),
        ...(tags && { tags }),
        ...(metadata && { metadata }),
        ...(status && { status }),
        ...(chunkSize && { chunkSize }),
        ...(chunkOverlap && { chunkOverlap }),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: { source: updatedSource }
    })

  } catch (error) {
    console.error('Error actualizando fuente:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/knowledge/[id] - Eliminar fuente de conocimiento
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const organizationId = (session.user as any).organizationId
    const sourceId = params.id

    // Buscar la fuente
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

    // Si tiene archivo en S3, eliminarlo
    if (source.fileUrl) {
      try {
        const fileKey = source.fileUrl.replace(`https://${bucketName}.s3.amazonaws.com/`, '')
        const deleteCommand = new DeleteObjectCommand({
          Bucket: bucketName,
          Key: fileKey
        })
        await s3Client.send(deleteCommand)
      } catch (s3Error) {
        console.error('Error eliminando archivo de S3:', s3Error)
        // Continuar con la eliminación aunque falle S3
      }
    }

    // Eliminar fuente (esto eliminará automáticamente chunks y embeddings por CASCADE)
    await prisma.knowledgeSource.delete({
      where: { id: sourceId }
    })

    return NextResponse.json({
      success: true,
      message: 'Fuente de conocimiento eliminada correctamente'
    })

  } catch (error) {
    console.error('Error eliminando fuente:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
