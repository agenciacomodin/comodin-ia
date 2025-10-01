
/**
 * API para subir archivos (Producción)
 * Usa Supabase Storage en lugar de mocks
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import StorageService from '@/lib/storage-service'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.organizationId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'general'
    const description = formData.get('description') as string || ''

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionó archivo' },
        { status: 400 }
      )
    }

    // Inicializar bucket si es necesario
    await StorageService.initializeBucket()

    // Subir archivo
    const uploadResult = await StorageService.uploadFile(file, {
      fileName: file.name,
      size: file.size,
      type: file.type,
      organizationId: session.user.organizationId,
      uploadedBy: session.user.id,
      folder
    })

    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, error: uploadResult.error },
        { status: 400 }
      )
    }

    // Guardar en base de datos
    const savedFile = await prisma.file.create({
      data: {
        name: file.name,
        originalName: file.name,
        path: uploadResult.path!,
        url: uploadResult.url!,
        size: file.size,
        mimeType: file.type,
        organizationId: session.user.organizationId,
        uploadedById: session.user.id,
        folder,
        description,
        status: 'ACTIVE'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: savedFile.id,
        name: savedFile.name,
        url: savedFile.url,
        size: savedFile.size,
        type: savedFile.mimeType,
        folder: savedFile.folder,
        uploadedAt: savedFile.createdAt
      }
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
