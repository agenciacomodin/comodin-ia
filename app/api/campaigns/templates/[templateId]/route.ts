
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { hasPermission, userHasPermission, Permission } from '@/lib/permissions'

interface RouteParams {
  params: {
    templateId: string
  }
}

// GET /api/campaigns/templates/[templateId] - Obtener plantilla específica
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!userHasPermission(session.user.role, Permission.VIEW_MESSAGE_TEMPLATES)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
    }

    const template = await prisma.messageTemplate.findFirst({
      where: {
        id: params.templateId,
        organizationId: session.user.organizationId
      }
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Plantilla no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: template
    })

  } catch (error) {
    console.error('Error al obtener plantilla:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/campaigns/templates/[templateId] - Actualizar plantilla
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!userHasPermission(session.user.role, Permission.MANAGE_MESSAGE_TEMPLATES)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
    }

    const template = await prisma.messageTemplate.findFirst({
      where: {
        id: params.templateId,
        organizationId: session.user.organizationId
      }
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Plantilla no encontrada' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      name,
      status,
      statusMessage,
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
      isActive
    } = body

    const updatedTemplate = await prisma.messageTemplate.update({
      where: { id: params.templateId },
      data: {
        ...(name && { name }),
        ...(status && { status }),
        ...(statusMessage !== undefined && { statusMessage }),
        ...(category && { category }),
        ...(language && { language }),
        ...(headerType !== undefined && { headerType }),
        ...(headerContent !== undefined && { headerContent }),
        ...(bodyContent && { bodyContent }),
        ...(footerContent !== undefined && { footerContent }),
        ...(hasButtons !== undefined && { hasButtons }),
        ...(buttonsConfig !== undefined && { buttonsConfig }),
        ...(variables !== undefined && { variables }),
        ...(sampleValues !== undefined && { sampleValues }),
        ...(allowedChannels && { allowedChannels }),
        ...(usageLimit !== undefined && { usageLimit }),
        ...(isActive !== undefined && { isActive }),
        ...(status === 'APPROVED' && { approvedAt: new Date() })
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedTemplate,
      message: 'Plantilla actualizada exitosamente'
    })

  } catch (error) {
    console.error('Error al actualizar plantilla:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/campaigns/templates/[templateId] - Eliminar plantilla
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!userHasPermission(session.user.role, Permission.DELETE_MESSAGE_TEMPLATES)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
    }

    const template = await prisma.messageTemplate.findFirst({
      where: {
        id: params.templateId,
        organizationId: session.user.organizationId
      },
      include: {
        campaigns: {
          where: {
            status: {
              in: ['DRAFT', 'SCHEDULED', 'SENDING']
            }
          }
        }
      }
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Plantilla no encontrada' },
        { status: 404 }
      )
    }

    // No permitir eliminar si hay campañas activas usando esta plantilla
    if (template.campaigns.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar la plantilla porque tiene campañas activas asociadas' },
        { status: 400 }
      )
    }

    await prisma.messageTemplate.delete({
      where: { id: params.templateId }
    })

    return NextResponse.json({
      success: true,
      message: 'Plantilla eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error al eliminar plantilla:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
