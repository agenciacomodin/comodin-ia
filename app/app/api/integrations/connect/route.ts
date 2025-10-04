
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.organizationId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { integrationId, authData, config } = body

    if (!integrationId || !authData) {
      return NextResponse.json(
        { success: false, error: 'Datos de integración incompletos' },
        { status: 400 }
      )
    }

    // Verificar que la integración existe y está activa
    const integration = await prisma.integration.findFirst({
      where: {
        id: integrationId,
        isActive: true
      }
    })

    if (!integration) {
      return NextResponse.json(
        { success: false, error: 'Integración no encontrada' },
        { status: 404 }
      )
    }

    // Crear o actualizar la conexión
    const connection = await prisma.organizationIntegration.upsert({
      where: {
        organizationId_integrationId: {
          organizationId: session.user.organizationId,
          integrationId: integrationId
        }
      },
      update: {
        config,
        status: 'CONNECTED',
        lastSyncAt: new Date()
      },
      create: {
        organizationId: session.user.organizationId,
        integrationId,
        config,
        status: 'CONNECTED',
        lastSyncAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: connection
    })
  } catch (error) {
    console.error('Error connecting integration:', error)
    return NextResponse.json(
      { success: false, error: 'Error al conectar la integración' },
      { status: 500 }
    )
  }
}
