
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { userHasPermission, Permission } from '@/lib/permissions'

// GET /api/contacts/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const contact = await prisma.contact.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId
      },
      include: {
        tags: true,
        conversations: {
          orderBy: { updatedAt: 'desc' },
          take: 10
        },
        notes: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!contact) {
      return NextResponse.json({ error: 'Contacto no encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: contact
    })
  } catch (error) {
    console.error('Error al obtener contacto:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/contacts/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!userHasPermission(session.user.role, Permission.MANAGE_CONTACTS)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
    }

    const body = await request.json()
    const { tags, ...updateData } = body

    // Verificar que el contacto pertenece a la organización
    const existing = await prisma.contact.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId
      }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Contacto no encontrado' }, { status: 404 })
    }

    const contact = await prisma.contact.update({
      where: { id: params.id },
      data: updateData,
      include: {
        tags: true
      }
    })

    // Actualizar tags si se proporcionaron
    if (tags && Array.isArray(tags)) {
      // Eliminar tags existentes
      await prisma.contactTag.deleteMany({
        where: {
          contactId: params.id
        }
      })

      // Crear nuevos tags
      if (tags.length > 0) {
        await Promise.all(
          tags.map((tagName: string) =>
            prisma.contactTag.create({
              data: {
                organizationId: session.user.organizationId,
                contactId: params.id,
                name: tagName
              }
            })
          )
        )
      }
    }

    return NextResponse.json({
      success: true,
      data: contact
    })
  } catch (error) {
    console.error('Error al actualizar contacto:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/contacts/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!userHasPermission(session.user.role, Permission.MANAGE_CONTACTS)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
    }

    // Verificar que el contacto pertenece a la organización
    const existing = await prisma.contact.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId
      }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Contacto no encontrado' }, { status: 404 })
    }

    await prisma.contact.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Contacto eliminado correctamente'
    })
  } catch (error) {
    console.error('Error al eliminar contacto:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
