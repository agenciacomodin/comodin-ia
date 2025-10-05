
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { userHasPermission, Permission } from '@/lib/permissions'

// GET /api/contacts - Listar contactos
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!userHasPermission(session.user.role, Permission.VIEW_CONTACTS)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where = {
      organizationId: session.user.organizationId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as any } },
          { email: { contains: search, mode: 'insensitive' as any } },
          { phone: { contains: search, mode: 'insensitive' as any } }
        ]
      })
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        include: {
          tags: true,
          conversations: {
            take: 1,
            orderBy: { updatedAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.contact.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error al obtener contactos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/contacts - Crear contacto
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!userHasPermission(session.user.role, Permission.MANAGE_CONTACTS)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, phone, tags, ...otherData } = body

    // Validaciones
    if (!name) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }

    // Verificar duplicados
    if (email || phone) {
      const existing = await prisma.contact.findFirst({
        where: {
          organizationId: session.user.organizationId,
          OR: [
            ...(email ? [{ email }] : []),
            ...(phone ? [{ phone }] : [])
          ]
        }
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Ya existe un contacto con ese email o teléfono' },
          { status: 409 }
        )
      }
    }

    const contact = await prisma.contact.create({
      data: {
        organizationId: session.user.organizationId,
        name,
        email,
        phone,
        ...otherData
      },
      include: {
        tags: true
      }
    })

    // Crear tags si se proporcionaron
    if (tags && Array.isArray(tags) && tags.length > 0) {
      await Promise.all(
        tags.map((tagName: string) =>
          prisma.contactTag.create({
            data: {
              organizationId: session.user.organizationId,
              contactId: contact.id,
              name: tagName
            }
          })
        )
      )
    }

    return NextResponse.json({
      success: true,
      data: contact
    }, { status: 201 })
  } catch (error) {
    console.error('Error al crear contacto:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
