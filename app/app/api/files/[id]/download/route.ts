
/**
 * API para descargar archivos (Producción)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import StorageService from '@/lib/storage-service'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session?.user?.organizationId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const fileId = params.id

    // const file = await prisma.file.findFirst({
    //   where: {
    //     id: fileId,
    //     organizationId: session.user.organizationId,
    //     status: 'ACTIVE'
    //   }
    // })

    // if (!file) {
    //   return NextResponse.json(
    //     { success: false, error: 'Archivo no encontrado' },
    //     { status: 404 }
    //   )
    // }

    // Por ahora, retornar error ya que no hay modelo File
    return NextResponse.json(
      { success: false, error: 'Funcionalidad de archivos temporalmente deshabilitada' },
      { status: 501 }
    )

    // // Generar URL firmada
    // const signedUrl = await StorageService.getSignedUrl(file.path, 3600) // 1 hora

    // if (!signedUrl) {
    //   return NextResponse.json(
    //     { success: false, error: 'Error generando URL de descarga' },
    //     { status: 500 }
    //   )
    // }

    // return NextResponse.json({
    //   success: true,
    //   data: {
    //     downloadUrl: signedUrl,
    //     fileName: file.originalName,
    //     size: file.size,
    //     type: file.mimeType
    //   }
    // })
  } catch (error) {
    console.error('Error getting download URL:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
