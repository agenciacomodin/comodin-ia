
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(
  request: Request,
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

    const connection = await prisma.organizationIntegration.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId
      },
      include: {
        integration: true
      }
    })

    if (!connection) {
      return NextResponse.json(
        { success: false, error: 'Conexión no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: connection
    })
  } catch (error) {
    console.error('Error getting connection:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener conexión' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
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

    await prisma.organizationIntegration.delete({
      where: {
        id: params.id,
        organizationId: session.user.organizationId
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Conexión eliminada correctamente'
    })
  } catch (error) {
    console.error('Error deleting connection:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar conexión' },
      { status: 500 }
    )
  }
}
