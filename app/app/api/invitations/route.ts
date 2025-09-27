
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { InvitationService } from '@/lib/invitations'
import { UserRole } from '@prisma/client'

// GET /api/invitations - Listar invitaciones de la organización
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo PROPIETARIO puede ver invitaciones
    if (session.user.role !== UserRole.PROPIETARIO) {
      return NextResponse.json({ error: 'Sin permisos suficientes' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const invitations = await InvitationService.getOrganizationInvitations(
      session.user.organizationId,
      status as any
    )

    return NextResponse.json({ invitations })

  } catch (error) {
    console.error('❌ Error obteniendo invitaciones:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/invitations - Crear nueva invitación
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo PROPIETARIO puede enviar invitaciones
    if (session.user.role !== UserRole.PROPIETARIO) {
      return NextResponse.json({ error: 'Sin permisos suficientes' }, { status: 403 })
    }

    const body = await request.json()
    const { email, role, firstName, lastName, message } = body

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email y rol son requeridos' },
        { status: 400 }
      )
    }

    // Validar que el rol sea válido para invitación
    if (![UserRole.AGENTE].includes(role)) {
      return NextResponse.json(
        { error: 'Solo se pueden invitar Agentes' },
        { status: 400 }
      )
    }

    const result = await InvitationService.createInvitation({
      email,
      role,
      organizationId: session.user.organizationId,
      invitedBy: session.user.id,
      invitedByName: session.user.fullName || session.user.name || 'Usuario',
      firstName,
      lastName,
      message
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ Error creando invitación:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
