
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const integrations = await prisma.integration.findMany({
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
    console.error('Error getting integrations:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener integraciones' },
      { status: 500 }
    )
  }
}
