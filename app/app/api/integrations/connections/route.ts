
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
        integration: true
      }
    })

    return NextResponse.json({
      success: true,
      data: connections
    })
  } catch (error) {
    console.error('Error getting connections:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener conexiones' },
      { status: 500 }
    )
  }
}
