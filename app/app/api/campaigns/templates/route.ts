
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { hasPermission, Permission } from '@/lib/permissions'
import { TemplateStatus } from '@prisma/client'

// GET /api/campaigns/templates - Obtener plantillas de mensajes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!hasPermission(session.user.role, Permission.VIEW_MESSAGE_TEMPLATES)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as TemplateStatus | null
    const category = searchParams.get('category')
    const isActive = searchParams.get('isActive')

    const templates = await prisma.messageTemplate.findMany({
      where: {
        organizationId: session.user.organizationId,
        ...(status && { status }),
        ...(category && { category }),
        ...(isActive !== null && { isActive: isActive === 'true' })
      },
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        name: true,
        metaTemplateId: true,
        metaTemplateName: true,
        status: true,
        statusMessage: true,
        category: true,
        language: true,
        bodyContent: true,
        hasButtons: true,
        variables: true,
        isActive: true,
        usageCount: true,
        successfulSends: true,
        failedSends: true,
        lastUsedAt: true,
        createdByName: true,
        createdAt: true,
        approvedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: templates
    })

  } catch (error) {
    console.error('Error al obtener plantillas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/campaigns/templates - Crear nueva plantilla
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!hasPermission(session.user.role, Permission.CREATE_MESSAGE_TEMPLATES)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      metaTemplateId,
      metaTemplateName,
      category,
      language = 'es',
      headerType,
      headerContent,
      bodyContent,
      footerContent,
      hasButtons = false,
      buttonsConfig,
      variables,
      sampleValues,
      allowedChannels = [],
      usageLimit
    } = body

    // Validaciones básicas
    if (!name || !bodyContent || !category) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: name, bodyContent, category' },
        { status: 400 }
      )
    }

    // Verificar si ya existe una plantilla con el mismo metaTemplateId
    if (metaTemplateId) {
      const existingTemplate = await prisma.messageTemplate.findUnique({
        where: {
          organizationId_metaTemplateId: {
            organizationId: session.user.organizationId,
            metaTemplateId
          }
        }
      })

      if (existingTemplate) {
        return NextResponse.json(
          { error: 'Ya existe una plantilla con ese Meta Template ID' },
          { status: 409 }
        )
      }
    }

    const template = await prisma.messageTemplate.create({
      data: {
        organizationId: session.user.organizationId,
        name,
        metaTemplateId,
        metaTemplateName,
        category,
        language,
        headerType,
        headerContent,
        bodyContent,
        footerContent,
        hasButtons,
        buttonsConfig,
        variables,
        sampleValues,
        allowedChannels,
        usageLimit,
        createdBy: session.user.id,
        createdByName: session.user.name || 'Usuario'
      }
    })

    return NextResponse.json({
      success: true,
      data: template,
      message: 'Plantilla creada exitosamente'
    }, { status: 201 })

  } catch (error) {
    console.error('Error al crear plantilla:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
