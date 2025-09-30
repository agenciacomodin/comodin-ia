
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = params

    // Verificar que la integración pertenece a la organización
    const integration = await prisma.organizationIntegration.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId
      }
    })

    if (!integration) {
      return NextResponse.json(
        { success: false, error: 'Integración no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar la integración
    await prisma.organizationIntegration.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Integración eliminada correctamente'
    })

  } catch (error) {
    console.error('Error in delete organization integration API:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
