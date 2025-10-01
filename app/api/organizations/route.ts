
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'

import { prisma } from '@/lib/db'

import { getDataFilter } from '@/lib/hierarchy'

import { Permission } from '@/lib/permissions'

import { ExtendedUser } from '@/lib/auth'


/**
 * GET /api/organizations
 * Obtiene organizaciones según el nivel de acceso del usuario
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = session.user as ExtendedUser
    const dataFilter = getDataFilter(user)
    
    let organizations

    if (user.role === 'SUPER_ADMIN') {
      // Super Admin puede ver todas las organizaciones
      organizations = await prisma.organization.findMany({
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true,
              lastLogin: true
            }
          },
          _count: {
            select: {
              users: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else if (user.role === 'DISTRIBUIDOR') {
      // Distribuidor puede ver sus organizaciones cliente
      // TODO: Implementar tabla de relaciones distribuidor-cliente
      organizations = await prisma.organization.findMany({
        where: {
          id: {
            in: dataFilter.organizationIds as string[]
          }
        },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true,
              lastLogin: true
            }
          },
          _count: {
            select: {
              users: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      // Propietarios y Agentes solo ven su organización
      organizations = await prisma.organization.findMany({
        where: {
          id: user.organizationId
        },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true,
              lastLogin: true
            }
          },
          _count: {
            select: {
              users: true
            }
          }
        }
      })
    }

    // Filtrar información según permisos
    const filteredOrganizations = organizations.map(org => {
      const canViewAllUsers = user.permissions?.includes(Permission.VIEW_ALL_USERS) ?? false
      const canViewOrgSettings = user.permissions?.includes(Permission.VIEW_ORGANIZATION_SETTINGS) ?? false

      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        status: org.status,
        createdAt: org.createdAt,
        ...(canViewOrgSettings && {
          description: org.description,
          email: org.email,
          phone: org.phone,
          website: org.website,
          country: org.country,
          timezone: org.timezone,
          currency: org.currency,
          language: org.language
        }),
        userCount: org._count.users,
        ...(canViewAllUsers && {
          users: org.users
        })
      }
    })

    return NextResponse.json({
      organizations: filteredOrganizations,
      total: filteredOrganizations.length,
      userRole: user.role
    })

  } catch (error) {
    console.error('Error fetching organizations:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/organizations
 * Crea una nueva organización (Solo Super Admin y Distribuidores)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = session.user as ExtendedUser
    
    // Verificar permisos para crear organizaciones
    if (!user.permissions?.includes(Permission.CREATE_CLIENT_ACCOUNTS)) {
      return NextResponse.json(
        { error: 'No tienes permisos para crear organizaciones' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, email, phone, country, ownerData } = body

    if (!name || !ownerData) {
      return NextResponse.json(
        { error: 'Nombre de organización y datos del propietario son requeridos' },
        { status: 400 }
      )
    }

    // Generar slug único
    const baseSlug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    
    let slug = baseSlug
    let counter = 1
    
    while (await prisma.organization.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Crear organización y propietario en una transacción
    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name,
          slug,
          description,
          email,
          phone,
          country,
          status: 'TRIAL'
        }
      })

      const owner = await tx.user.create({
        data: {
          email: ownerData.email,
          name: ownerData.name,
          fullName: ownerData.fullName,
          phone: ownerData.phone,
          country: ownerData.country,
          organizationId: organization.id,
          role: 'PROPIETARIO',
          isActive: true
        }
      })

      return { organization, owner }
    })

    return NextResponse.json({
      message: 'Organización creada exitosamente',
      organization: result.organization,
      owner: result.owner
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating organization:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
