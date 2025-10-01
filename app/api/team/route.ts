
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getDataFilter, canAccessOrganization } from '@/lib/hierarchy'
import { Permission } from '@/lib/permissions'
import { ExtendedUser } from '@/lib/auth'

/**
 * GET /api/team
 * Obtiene los miembros del equipo según los permisos del usuario
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = session.user as ExtendedUser
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId') || user.organizationId
    
    // Verificar acceso a la organización
    if (!canAccessOrganization(user, organizationId)) {
      return NextResponse.json(
        { error: 'No tienes acceso a esta organización' },
        { status: 403 }
      )
    }

    const dataFilter = getDataFilter(user)
    
    let teamMembers

    if (user.role === 'SUPER_ADMIN') {
      // Super Admin puede ver todos los usuarios
      teamMembers = await prisma.user.findMany({
        where: organizationId === 'all' ? {} : {
          organizationId: organizationId
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true
            }
          }
        },
        orderBy: [
          { role: 'desc' },
          { name: 'asc' }
        ]
      })
    } else if (user.role === 'DISTRIBUIDOR') {
      // Distribuidor puede ver usuarios de sus organizaciones cliente
      teamMembers = await prisma.user.findMany({
        where: {
          organizationId: {
            in: dataFilter.organizationIds as string[]
          }
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true
            }
          }
        },
        orderBy: [
          { role: 'desc' },
          { name: 'asc' }
        ]
      })
    } else if (user.role === 'PROPIETARIO') {
      // Propietario puede ver todos los usuarios de su organización
      teamMembers = await prisma.user.findMany({
        where: {
          organizationId: user.organizationId
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true
            }
          }
        },
        orderBy: [
          { role: 'desc' },
          { name: 'asc' }
        ]
      })
    } else {
      // Agentes solo pueden verse a sí mismos
      teamMembers = await prisma.user.findMany({
        where: {
          id: user.id
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true
            }
          }
        }
      })
    }

    // Filtrar información sensible según permisos
    const filteredMembers = teamMembers.map(member => {
      const canViewAllUsers = user.permissions?.includes(Permission.VIEW_ALL_USERS) ?? false
      const canViewDetails = canViewAllUsers || member.id === user.id

      return {
        id: member.id,
        name: member.name,
        fullName: member.fullName,
        email: member.email,
        role: member.role,
        isActive: member.isActive,
        lastLogin: member.lastLogin,
        createdAt: member.createdAt,
        organizationId: member.organizationId,
        organizationName: member.organization.name,
        organizationStatus: member.organization.status,
        ...(canViewDetails && {
          phone: member.phone,
          country: member.country,
          timezone: member.timezone,
          language: member.language,
          image: member.image
        })
      }
    })

    // Estadísticas del equipo
    const stats = {
      total: filteredMembers.length,
      active: filteredMembers.filter(m => m.isActive).length,
      byRole: filteredMembers.reduce((acc, member) => {
        acc[member.role] = (acc[member.role] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      recentLogins: filteredMembers.filter(m => 
        m.lastLogin && 
        new Date(m.lastLogin).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
      ).length
    }

    return NextResponse.json({
      members: filteredMembers,
      stats,
      organization: teamMembers[0]?.organization || null,
      userPermissions: {
        canInviteUsers: user.permissions?.includes(Permission.INVITE_USERS) ?? false,
        canManageUsers: user.permissions?.includes(Permission.MANAGE_USERS) ?? false,
        canViewAllUsers: user.permissions?.includes(Permission.VIEW_ALL_USERS) ?? false
      }
    })

  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/team
 * Invita un nuevo miembro al equipo
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = session.user as ExtendedUser
    
    // Verificar permisos para invitar usuarios
    if (!user.permissions?.includes(Permission.INVITE_USERS)) {
      return NextResponse.json(
        { error: 'No tienes permisos para invitar usuarios' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, name, fullName, role, organizationId } = body

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email y rol son requeridos' },
        { status: 400 }
      )
    }

    const targetOrgId = organizationId || user.organizationId

    // Verificar acceso a la organización
    if (!canAccessOrganization(user, targetOrgId)) {
      return NextResponse.json(
        { error: 'No tienes acceso a esta organización' },
        { status: 403 }
      )
    }

    // Verificar que puede asignar este rol
    const canManageRole = (managerRole: string, targetRole: string): boolean => {
      const hierarchy = {
        SUPER_ADMIN: 4,
        DISTRIBUIDOR: 3,
        PROPIETARIO: 2,
        AGENTE: 1
      }
      return hierarchy[managerRole as keyof typeof hierarchy] >= hierarchy[targetRole as keyof typeof hierarchy]
    }

    if (!canManageRole(user.role, role)) {
      return NextResponse.json(
        { error: `No puedes asignar el rol ${role}` },
        { status: 403 }
      )
    }

    // Verificar que el email no esté ya registrado
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con este email' },
        { status: 400 }
      )
    }

    // Crear el nuevo usuario
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        fullName,
        role,
        organizationId: targetOrgId,
        isActive: true
      },
      include: {
        organization: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Usuario invitado exitosamente',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        organizationName: newUser.organization.name
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error inviting user:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
