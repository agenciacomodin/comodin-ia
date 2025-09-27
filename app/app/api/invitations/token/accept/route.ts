
import { NextRequest, NextResponse } from 'next/server'
import { InvitationService } from '@/lib/invitations'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token requerido' },
        { status: 400 }
      )
    }
    const body = await request.json()
    
    const { name, fullName, phone, country, password, confirmPassword } = body

    if (!name || !password) {
      return NextResponse.json(
        { error: 'Nombre y contraseña son requeridos' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Las contraseñas no coinciden' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    const result = await InvitationService.acceptInvitation({
      token,
      userData: {
        name,
        fullName,
        phone,
        country,
        password
      }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        organizationId: result.user.organizationId
      }
    })

  } catch (error) {
    console.error('❌ Error aceptando invitación:', error)
    
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
