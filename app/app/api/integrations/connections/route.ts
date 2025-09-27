
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentOrganization } from '@/lib/multi-tenant'
import { prisma } from '@/lib/db'
import { hasPermission, Permission } from '@/lib/permissions'

// GET /api/integrations/connections - Obtener conexiones de la organización
export async function GET(request: NextRequest) {
  try {
    const { organization, user } = await getCurrentOrganization()
    
    if (!hasPermission(user.role, Permission.VIEW_INTEGRATIONS)) {
      return NextResponse.json(
        { error: 'No tienes permisos para ver las integraciones' },
        { status: 403 }
      )
    }

    // Obtener todas las conexiones de la organización
    const connections = await prisma.organizationIntegration.findMany({
      where: {
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      connections: connections.map(connection => ({
        ...connection,
        // Parseamos los campos JSON pero no exponemos credenciales sensibles
        config: typeof connection.config === 'string' 
          ? JSON.parse(connection.config) 
          : connection.config,
        syncStats: connection.syncStats 
          ? (typeof connection.syncStats === 'string' 
              ? JSON.parse(connection.syncStats) 
              : connection.syncStats)
          : null,
        syncErrors: connection.syncErrors 
          ? (typeof connection.syncErrors === 'string' 
              ? JSON.parse(connection.syncErrors) 
              : connection.syncErrors)
          : null,
        features: connection.features 
          ? (typeof connection.features === 'string' 
              ? JSON.parse(connection.features) 
              : connection.features)
          : null,
        // No exponemos las credenciales por seguridad
        credentials: undefined,
        accessToken: undefined,
        refreshToken: undefined
      }))
    })
  } catch (error) {
    console.error('Error fetching connections:', error)
    return NextResponse.json(
      { error: 'Error al cargar las conexiones' },
      { status: 500 }
    )
  }
}

// POST /api/integrations/connections - Crear nueva conexión
export async function POST(request: NextRequest) {
  try {
    const { organization, user } = await getCurrentOrganization()
    
    if (!hasPermission(user.role, Permission.CONNECT_INTEGRATIONS)) {
      return NextResponse.json(
        { error: 'No tienes permisos para conectar integraciones' },
        { status: 403 }
      )
    }

    const data = await request.json()
    const {
      integrationId,
      name,
      credentials,
      config = {},
      features = []
    } = data

    // Verificar que la integración existe
    const integration = await prisma.integration.findUnique({
      where: { id: integrationId }
    })

    if (!integration) {
      return NextResponse.json(
        { error: 'Integración no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si ya existe una conexión para esta integración
    const existingConnection = await prisma.organizationIntegration.findUnique({
      where: {
        organizationId_integrationId: {
          organizationId: organization.id,
          integrationId: integrationId
        }
      }
    })

    if (existingConnection) {
      return NextResponse.json(
        { error: 'Ya existe una conexión para esta integración' },
        { status: 409 }
      )
    }

    // Extraer información adicional según la plataforma
    let storeUrl = null
    let storeName = null
    let storeId = null

    if (integration.platform === 'SHOPIFY' && credentials.shop_domain) {
      storeUrl = `https://${credentials.shop_domain}`
      storeName = credentials.shop_domain.split('.')[0]
    } else if (integration.platform === 'WOOCOMMERCE' && credentials.site_url) {
      storeUrl = credentials.site_url
      storeName = new URL(credentials.site_url).hostname
    } else if (integration.platform === 'TIENDANUBE' && credentials.store_id) {
      storeId = credentials.store_id
      storeUrl = `https://${credentials.store_id}.mitiendanube.com`
    }

    // TODO: Aquí debería encriptar las credenciales antes de guardarlas
    // Por ahora las guardamos como JSON (en producción usar encriptación)
    
    // Crear la conexión
    const connection = await prisma.organizationIntegration.create({
      data: {
        organizationId: organization.id,
        integrationId: integrationId,
        name: name || integration.displayName,
        status: 'CONNECTED',
        config: JSON.stringify({
          ...config,
          connectedAt: new Date().toISOString()
        }),
        credentials: JSON.stringify(credentials),
        storeUrl,
        storeName,
        storeId,
        features: JSON.stringify(features),
        configuredBy: user.id,
        lastSyncAt: new Date()
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

    // Registrar el evento en los logs
    await prisma.integrationLog.create({
      data: {
        organizationIntegrationId: connection.id,
        eventType: 'connection_created',
        eventData: JSON.stringify({
          integrationName: integration.displayName,
          userId: user.id,
          userEmail: user.email
        }),
        success: true,
        userId: user.id
      }
    })

    return NextResponse.json({
      success: true,
      connection: {
        ...connection,
        // No exponemos credenciales en la respuesta
        credentials: undefined
      }
    })
  } catch (error) {
    console.error('Error creating connection:', error)
    return NextResponse.json(
      { error: 'Error al crear la conexión' },
      { status: 500 }
    )
  }
}
