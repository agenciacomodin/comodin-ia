
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email es requerido' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Por seguridad, no revelamos si el usuario existe o no
      return NextResponse.json({
        success: true,
        message: 'Si el email existe, se ha enviado un enlace de recuperación'
      })
    }

    // Generar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

    await prisma.passwordResetToken.create({
      data: {
        email,
        token: resetToken,
        expiresAt: resetTokenExpiry
      }
    })

    // Aquí normalmente se enviaría el email
    // Por ahora solo simulamos el envío
    console.log(`Reset token for ${email}: ${resetToken}`)

    return NextResponse.json({
      success: true,
      message: 'Si el email existe, se ha enviado un enlace de recuperación'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
