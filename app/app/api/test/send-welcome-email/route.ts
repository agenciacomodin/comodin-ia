
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, getWelcomeEmailTemplate } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, name, organizationName } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Email válido es requerido' },
        { status: 400 }
      )
    }

    // Enviar email de prueba
    const emailSent = await sendEmail({
      to: email,
      subject: `🎉 Email de Prueba - Bienvenido a ${organizationName || 'COMODÍN IA'}`,
      html: getWelcomeEmailTemplate(
        name || 'Usuario de Prueba', 
        organizationName || 'Organización Demo'
      )
    })

    return NextResponse.json({
      success: emailSent,
      message: emailSent 
        ? 'Email de bienvenida enviado correctamente'
        : 'Error al enviar el email de bienvenida'
    })

  } catch (error) {
    console.error('Error in send-welcome-email test:', error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
