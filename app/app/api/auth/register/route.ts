
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendEmail, getWelcomeEmailTemplate } from '@/lib/email'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const { 
      email, 
      password, 
      name, 
      fullName,
      phone, 
      country,
      organizationName,
      role = 'AGENTE' 
    } = await request.json()

    // Validaciones básicas
    if (!email || !password || !organizationName) {
      return NextResponse.json(
        { success: false, message: 'Email, contraseña y nombre de organización son requeridos' },
        { status: 400 }
      )
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Email no válido' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Este email ya está registrado' },
        { status: 400 }
      )
    }

    // Crear organización si es el primer usuario (PROPIETARIO)
    let organization
    let userRole: UserRole = role as UserRole

    // Si es el primer registro, crear organización nueva
    const organizationSlug = organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .trim()

    organization = await prisma.organization.create({
      data: {
        name: organizationName,
        slug: organizationSlug + '-' + Date.now(),
        email: email.toLowerCase(),
        status: 'TRIAL',
        currentPlan: 'FREE',
        maxUsers: 5, // Plan gratuito permite 5 usuarios
        maxMessages: 1000,
        maxIntegrations: 2
      }
    })

    // El primer usuario es siempre PROPIETARIO de la organización
    userRole = 'PROPIETARIO'

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name || email.split('@')[0],
        fullName,
        phone,
        country,
        organizationId: organization.id,
        role: userRole,
        isActive: true
      }
    })

    // Crear account para credentials provider
    await prisma.account.create({
      data: {
        userId: user.id,
        type: 'credentials',
        provider: 'credentials',
        providerAccountId: user.id,
        refresh_token: hashedPassword // Guardamos el hash de la contraseña aquí
      }
    })

    // Crear billetera de IA para la organización
    await prisma.aIWallet.create({
      data: {
        organizationId: organization.id,
        balance: 10.00, // Balance inicial gratuito
        currency: 'USD'
      }
    })

    // Enviar email de bienvenida
    const emailSent = await sendEmail({
      to: user.email,
      subject: `🎉 ¡Bienvenido a ${organization.name}! - COMODÍN IA`,
      html: getWelcomeEmailTemplate(user.name || user.email, organization.name)
    })

    if (!emailSent) {
      console.error('Error sending welcome email to:', user.email)
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        userId: user.id,
        organizationId: organization.id,
        role: userRole,
        emailSent
      }
    })

  } catch (error) {
    console.error('Error in register:', error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
