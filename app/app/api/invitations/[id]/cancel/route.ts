
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { InvitationService } from '@/lib/invitations'
import { UserRole } from '@prisma/client'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo PROPIETARIO puede cancelar invitaciones
    if (session.user.role !== UserRole.PROPIETARIO) {
      return NextResponse.json({ error: 'Sin permisos suficientes' }, { status: 403 })
    }

    const { id } = params
    const result = await InvitationService.cancelInvitation(id, session.user.id)

    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ Error cancelando invitación:', error)
    
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
