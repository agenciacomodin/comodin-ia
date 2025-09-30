
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendEmail, getPasswordChangeConfirmationTemplate } from '@/lib/email'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Token y nueva contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Validar que la contraseña tenga al menos 8 caracteres
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    // Buscar token válido
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    })

    if (!resetToken) {
      return NextResponse.json(
        { success: false, message: 'Token de recuperación no válido' },
        { status: 400 }
      )
    }

    // Verificar que el token no haya expirado
    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, message: 'El token de recuperación ha expirado' },
        { status: 400 }
      )
    }

    // Verificar que el token no haya sido usado
    if (resetToken.used) {
      return NextResponse.json(
        { success: false, message: 'Este token ya ha sido utilizado' },
        { status: 400 }
      )
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
      include: { organization: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 400 }
      )
    }

    // Verificar que la organización esté activa
    if (user.organization.status === 'SUSPENDED' || user.organization.status === 'INACTIVE') {
      return NextResponse.json(
        { success: false, message: 'Cuenta suspendida' },
        { status: 400 }
      )
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Actualizar la contraseña en la tabla Account
    await prisma.account.updateMany({
      where: { 
        userId: user.id,
        provider: 'credentials'
      },
      data: { refresh_token: hashedPassword }
    })

    // Marcar token como usado
    await prisma.passwordResetToken.update({
      where: { token },
      data: { used: true }
    })

    // Enviar email de confirmación
    const emailSent = await sendEmail({
      to: user.email,
      subject: '✅ Contraseña cambiada exitosamente - COMODÍN IA',
      html: getPasswordChangeConfirmationTemplate(user.name || user.email)
    })

    if (!emailSent) {
      console.error('Error sending password change confirmation to:', user.email)
    }

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    })

  } catch (error) {
    console.error('Error in reset-password:', error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Validar token sin cambiarlo (para mostrar formulario)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token requerido' },
        { status: 400 }
      )
    }

    // Buscar token válido
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    })

    if (!resetToken) {
      return NextResponse.json(
        { success: false, message: 'Token no válido' },
        { status: 400 }
      )
    }

    // Verificar que no haya expirado y no haya sido usado
    if (resetToken.expiresAt < new Date() || resetToken.used) {
      return NextResponse.json(
        { success: false, message: 'Token expirado o ya utilizado' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      email: resetToken.email
    })

  } catch (error) {
    console.error('Error validating token:', error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
