
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendEmail, getPasswordResetTemplate } from '@/lib/email'
import { v4 as uuidv4 } from 'uuid'
import { addHours } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Email válido es requerido' },
        { status: 400 }
      )
    }

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { organization: true }
    })

    // Siempre devolver éxito por seguridad (no revelar si existe el email)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Si el email existe, recibirás un enlace de recuperación'
      })
    }

    // Verificar que la organización esté activa
    if (user.organization.status === 'SUSPENDED' || user.organization.status === 'INACTIVE') {
      return NextResponse.json({
        success: true,
        message: 'Si el email existe, recibirás un enlace de recuperación'
      })
    }

    // Generar token único
    const resetToken = uuidv4()
    const expiresAt = addHours(new Date(), 1) // Expira en 1 hora

    // Invalidar tokens anteriores del mismo email
    await prisma.passwordResetToken.updateMany({
      where: { 
        email: email.toLowerCase(),
        used: false,
        expiresAt: { gt: new Date() }
      },
      data: { used: true }
    })

    // Crear nuevo token
    await prisma.passwordResetToken.create({
      data: {
        email: email.toLowerCase(),
        token: resetToken,
        expiresAt
      }
    })

    // Enviar email de recuperación
    const emailSent = await sendEmail({
      to: user.email,
      subject: '🔐 Restablecer contraseña - COMODÍN IA',
      html: getPasswordResetTemplate(user.name || user.email, resetToken)
    })

    if (!emailSent) {
      console.error('Error sending password reset email to:', user.email)
    }

    return NextResponse.json({
      success: true,
      message: 'Si el email existe, recibirás un enlace de recuperación'
    })

  } catch (error) {
    console.error('Error in forgot-password:', error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
