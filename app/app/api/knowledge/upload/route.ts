
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { KnowledgeSourceType, KnowledgeSourceStatus } from '@prisma/client'
import { KNOWLEDGE_FILE_TYPES, MAX_KNOWLEDGE_FILE_SIZE } from '@/lib/types'

const prisma = new PrismaClient()

// Configuración de S3
const s3Client = new S3Client({})
const bucketName = process.env.AWS_BUCKET_NAME || ''
const folderPrefix = process.env.AWS_FOLDER_PREFIX || ''

// POST /api/knowledge/upload - Subir archivo para base de conocimiento
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const organizationId = (session.user as any).organizationId
    const userId = (session.user as any).id
    const userName = (session.user as any).name || 'Usuario'

    // Obtener datos del formulario
    const formData = await request.formData()
    const file = formData.get('file') as File
    const name = formData.get('name') as string
    const tags = JSON.parse(formData.get('tags') as string || '[]')
    const chunkSize = parseInt(formData.get('chunkSize') as string || '1000')
    const chunkOverlap = parseInt(formData.get('chunkOverlap') as string || '100')

    // Validaciones
    if (!file) {
      return NextResponse.json(
        { error: 'Archivo requerido' },
        { status: 400 }
      )
    }

    if (file.size > MAX_KNOWLEDGE_FILE_SIZE) {
      return NextResponse.json(
        { error: `Archivo demasiado grande. Máximo ${MAX_KNOWLEDGE_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    const allowedTypes = [
      ...KNOWLEDGE_FILE_TYPES.pdf,
      ...KNOWLEDGE_FILE_TYPES.document,
      ...KNOWLEDGE_FILE_TYPES.text,
      ...KNOWLEDGE_FILE_TYPES.web
    ]

    if (!allowedTypes.includes(file.type as any)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no soportado' },
        { status: 400 }
      )
    }

    // Generar clave S3
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const s3Key = `${folderPrefix}knowledge/${organizationId}/${timestamp}-${sanitizedFileName}`

    // Subir archivo a S3
    const buffer = Buffer.from(await file.arrayBuffer())
    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: buffer,
      ContentType: file.type
    })

    await s3Client.send(uploadCommand)

    // URL del archivo en S3
    const fileUrl = `https://${bucketName}.s3.amazonaws.com/${s3Key}`

    // Crear fuente de conocimiento en la base de datos
    const source = await prisma.knowledgeSource.create({
      data: {
        organizationId,
        name: name || file.name,
        type: KnowledgeSourceType.FILE,
        status: KnowledgeSourceStatus.PROCESSING,
        originalFileName: file.name,
        fileUrl,
        fileMimeType: file.type,
        fileSize: file.size,
        tags,
        chunkSize,
        chunkOverlap,
        createdBy: userId,
        createdByName: userName,
        metadata: {
          uploadedAt: new Date().toISOString(),
          originalSize: file.size,
          mimeType: file.type
        }
      }
    })

    // Procesar archivo en background
    import('@/lib/knowledge-processor').then(async ({ KnowledgeProcessor }) => {
      const processor = new KnowledgeProcessor(organizationId, userId, userName)
      await processor.processKnowledgeSource(source.id)
    }).catch(error => {
      console.error('Error procesando archivo:', error)
    })

    return NextResponse.json({
      success: true,
      data: { 
        source: {
          id: source.id,
          name: source.name,
          status: source.status,
          type: source.type,
          originalFileName: source.originalFileName,
          fileSize: source.fileSize,
          createdAt: source.createdAt
        }
      }
    })

  } catch (error) {
    console.error('Error subiendo archivo:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
