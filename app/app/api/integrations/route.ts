
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentOrganization } from '@/lib/multi-tenant'
import { prisma } from '@/lib/db'
import { hasPermission, Permission } from '@/lib/permissions'

// GET /api/integrations - Obtener todas las integraciones disponibles
export async function GET(request: NextRequest) {
  try {
    const { user } = await getCurrentOrganization()
    
    if (!hasPermission(user.role, Permission.VIEW_INTEGRATIONS)) {
      return NextResponse.json(
        { error: 'No tienes permisos para ver las integraciones' },
        { status: 403 }
      )
    }

    // Obtener todas las integraciones activas
    const integrations = await prisma.integration.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { type: 'asc' },
        { displayName: 'asc' }
      ]
    })

    return NextResponse.json({
      integrations: integrations.map(integration => ({
        ...integration,
        // Parseamos los campos JSON
        authFields: typeof integration.authFields === 'string' 
          ? JSON.parse(integration.authFields) 
          : integration.authFields,
        supportedFeatures: typeof integration.supportedFeatures === 'string'
          ? JSON.parse(integration.supportedFeatures)
          : integration.supportedFeatures
      }))
    })
  } catch (error) {
    console.error('Error fetching integrations:', error)
    return NextResponse.json(
      { error: 'Error al cargar las integraciones' },
      { status: 500 }
    )
  }
}

// POST /api/integrations - Crear nueva integración (solo para admins)
export async function POST(request: NextRequest) {
  try {
    const { user } = await getCurrentOrganization()
    
    if (!hasPermission(user.role, Permission.PLATFORM_ADMINISTRATION)) {
      return NextResponse.json(
        { error: 'No tienes permisos para crear integraciones' },
        { status: 403 }
      )
    }

    const data = await request.json()
    const {
      name,
      displayName,
      description,
      type,
      platform,
      apiUrl,
      authType,
      authFields,
      supportedFeatures,
      iconUrl,
      brandColor,
      documentation
    } = data

    // Crear la nueva integración
    const integration = await prisma.integration.create({
      data: {
        name,
        displayName,
        description,
        type,
        platform,
        apiUrl,
        authType,
        authFields: JSON.stringify(authFields),
        supportedFeatures: JSON.stringify(supportedFeatures),
        iconUrl,
        brandColor,
        documentation
      }
    })

    return NextResponse.json({
      success: true,
      integration
    })
  } catch (error) {
    console.error('Error creating integration:', error)
    return NextResponse.json(
      { error: 'Error al crear la integración' },
      { status: 500 }
    )
  }
}
