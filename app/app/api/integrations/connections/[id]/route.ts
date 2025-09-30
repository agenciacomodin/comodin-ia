
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentOrganization } from '@/lib/multi-tenant'
import { prisma } from '@/lib/db'
import { hasPermission, userHasPermission, Permission } from '@/lib/permissions'

interface Context {
  params: {
    id: string
  }
}

// GET /api/integrations/connections/[id] - Obtener detalles de una conexión
export async function GET(request: NextRequest, { params }: Context) {
  try {
    const { organization, user } = await getCurrentOrganization()
    
    if (!userHasPermission(user.role, Permission.VIEW_INTEGRATIONS)) {
      return NextResponse.json(
        { error: 'No tienes permisos para ver las integraciones' },
        { status: 403 }
      )
    }

    const connection = await prisma.organizationIntegration.findFirst({
      where: {
        id: params.id,
        organizationId: organization.id
      },
      include: {
        integration: true,
        configuredUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!connection) {
      return NextResponse.json(
        { error: 'Conexión no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      connection: {
        ...connection,
        // Parseamos campos JSON pero no exponemos credenciales
        config: typeof connection.config === 'string' 
          ? JSON.parse(connection.config) 
          : connection.config,
        syncStats: connection.syncStats 
          ? (typeof connection.syncStats === 'string' 
              ? JSON.parse(connection.syncStats) 
              : connection.syncStats)
          : null,
        credentials: undefined,
        accessToken: undefined,
        refreshToken: undefined
      }
    })
  } catch (error) {
    console.error('Error fetching connection:', error)
    return NextResponse.json(
      { error: 'Error al cargar la conexión' },
      { status: 500 }
    )
  }
}

// PUT /api/integrations/connections/[id] - Actualizar configuración de conexión
export async function PUT(request: NextRequest, { params }: Context) {
  try {
    const { organization, user } = await getCurrentOrganization()
    
    if (!userHasPermission(user.role, Permission.CONFIGURE_INTEGRATION_SETTINGS)) {
      return NextResponse.json(
        { error: 'No tienes permisos para configurar integraciones' },
        { status: 403 }
      )
    }

    const data = await request.json()
    const { name, features, config } = data

    // Verificar que la conexión pertenece a la organización
    const existingConnection = await prisma.organizationIntegration.findFirst({
      where: {
        id: params.id,
        organizationId: organization.id
      }
    })

    if (!existingConnection) {
      return NextResponse.json(
        { error: 'Conexión no encontrada' },
        { status: 404 }
      )
    }

    // Actualizar la conexión
    const updatedConnection = await prisma.organizationIntegration.update({
      where: {
        id: params.id
      },
      data: {
        name: name || existingConnection.name,
        features: features ? JSON.stringify(features) : (existingConnection.features as any),
        config: config ? JSON.stringify({
          ...(typeof existingConnection.config === 'string' ? JSON.parse(existingConnection.config) : existingConnection.config),
          ...config,
          updatedAt: new Date().toISOString()
        }) : (existingConnection.config as any),
        updatedAt: new Date()
      },
      include: {
        integration: true,
        configuredUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Registrar el evento
    await prisma.integrationLog.create({
      data: {
        organizationIntegrationId: params.id,
        eventType: 'connection_updated',
        eventData: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          changes: { name, features, config }
        }),
        success: true,
        userId: user.id
      }
    })

    return NextResponse.json({
      success: true,
      connection: {
        ...updatedConnection,
        credentials: undefined
      }
    })
  } catch (error) {
    console.error('Error updating connection:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la conexión' },
      { status: 500 }
    )
  }
}

// DELETE /api/integrations/connections/[id] - Eliminar conexión
export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    const { organization, user } = await getCurrentOrganization()
    
    if (!userHasPermission(user.role, Permission.DISCONNECT_INTEGRATIONS)) {
      return NextResponse.json(
        { error: 'No tienes permisos para desconectar integraciones' },
        { status: 403 }
      )
    }

    // Verificar que la conexión pertenece a la organización
    const connection = await prisma.organizationIntegration.findFirst({
      where: {
        id: params.id,
        organizationId: organization.id
      },
      include: {
        integration: true
      }
    })

    if (!connection) {
      return NextResponse.json(
        { error: 'Conexión no encontrada' },
        { status: 404 }
      )
    }

    // Registrar el evento antes de eliminar
    await prisma.integrationLog.create({
      data: {
        organizationIntegrationId: params.id,
        eventType: 'connection_deleted',
        eventData: JSON.stringify({
          integrationName: connection.integration.displayName,
          userId: user.id,
          userEmail: user.email
        }),
        success: true,
        userId: user.id
      }
    })

    // Eliminar la conexión (esto también eliminará los logs por cascade)
    await prisma.organizationIntegration.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Conexión eliminada exitosamente'
    })
  } catch (error) {
    console.error('Error deleting connection:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la conexión' },
      { status: 500 }
    )
  }
}
