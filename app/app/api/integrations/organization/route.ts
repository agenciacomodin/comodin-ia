
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.organizationId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const connections = await prisma.organizationIntegration.findMany({
      where: {
        organizationId: session.user.organizationId
      },
      include: {
        integration: {
          select: {
            id: true,
            name: true,
            displayName: true,
            description: true,
            type: true,
            platform: true,
            brandColor: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: connections
    })
  } catch (error) {
    console.error('Error getting organization integrations:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener integraciones de la organización' },
      { status: 500 }
    )
  }
}
