
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const integrations = await prisma.integration.findMany({
      select: {
        id: true,
        name: true,
        displayName: true,
        description: true,
        type: true,
        platform: true,
        authType: true,
        authFields: true,
        supportedFeatures: true,
        brandColor: true,
        documentation: true,
        isActive: true,
        createdAt: true
      },
      where: {
        isActive: true
      },
      orderBy: {
        displayName: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: integrations
    })
  } catch (error) {
    console.error('Error getting available integrations:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener integraciones disponibles' },
      { status: 500 }
    )
  }
}
