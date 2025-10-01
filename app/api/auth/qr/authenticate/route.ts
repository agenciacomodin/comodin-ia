
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'
import { getRolePermissions } from '@/lib/permissions'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, sessionId, userEmail, userPassword } = body

    if (!token || !sessionId || !userEmail || !userPassword) {
      return NextResponse.json(
        { success: false, error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // Buscar la sesión QR
    const qrSession = await prisma.qRSession.findUnique({
      where: { id: sessionId, token }
    })

    if (!qrSession) {
      return NextResponse.json(
        { success: false, error: 'Sesión no válida' },
        { status: 404 }
      )
    }

    // Verificar si la sesión ha expirado
    if (qrSession.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: 'La sesión QR ha expirado' },
        { status: 400 }
      )
    }

    // Verificar credenciales del usuario
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { organization: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 401 }
      )
    }

    if (!user.isActive || user.organization.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Usuario o organización inactiva' },
        { status: 401 }
      )
    }

    // Verificar contraseña
    const account = await prisma.account.findFirst({
      where: { 
        userId: user.id, 
        provider: 'credentials' 
      }
    })

    if (!account?.refresh_token) {
      return NextResponse.json(
        { success: false, error: 'Método de autenticación no válido' },
        { status: 401 }
      )
    }

    const bcrypt = require('bcryptjs')
    const isValidPassword = await bcrypt.compare(userPassword, account.refresh_token)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Contraseña incorrecta' },
        { status: 401 }
      )
    }

    // Marcar sesión QR como escaneada primero
    await prisma.qRSession.update({
      where: { id: sessionId },
      data: {
        status: 'SCANNED',
        userId: user.id,
        scannedAt: new Date()
      }
    })

    // Generar token de autenticación
    const authToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        organizationId: user.organizationId,
        role: user.role,
        sessionId: sessionId
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret',
      { expiresIn: '1h' }
    )

    // Marcar como autenticado
    await prisma.qRSession.update({
      where: { id: sessionId },
      data: {
        status: 'AUTHENTICATED',
        authenticatedAt: new Date()
      }
    })

    // Actualizar último login del usuario
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })

    return NextResponse.json({
      success: true,
      data: {
        authToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          fullName: user.fullName,
          role: user.role,
          organizationId: user.organizationId,
          permissions: getRolePermissions(user.role).map(p => p.toString())
        }
      }
    })

  } catch (error) {
    console.error('Error en autenticación QR:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor'
      },
      { status: 500 }
    )
  }
}
