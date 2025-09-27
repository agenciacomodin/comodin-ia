
import { NextRequest, NextResponse } from 'next/server'
import { InvitationService } from '@/lib/invitations'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token requerido' },
        { status: 400 }
      )
    }
    const invitation = await InvitationService.getInvitationByToken(token)

    // Retornar datos seguros de la invitación
    return NextResponse.json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        organizationName: invitation.organization.name,
        invitedByName: invitation.invitedByName,
        firstName: invitation.firstName,
        lastName: invitation.lastName,
        message: invitation.message,
        expiresAt: invitation.expiresAt,
      }
    })

  } catch (error) {
    console.error('❌ Error validando invitación:', error)
    
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
