
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'ID de sesión requerido' },
        { status: 400 }
      )
    }

    // Buscar la sesión QR
    const qrSession = await prisma.qRSession.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            fullName: true,
            role: true,
            organizationId: true
          }
        }
      }
    })

    if (!qrSession) {
      return NextResponse.json(
        { success: false, error: 'Sesión no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si la sesión ha expirado
    if (qrSession.expiresAt < new Date()) {
      await prisma.qRSession.update({
        where: { id: sessionId },
        data: { status: 'EXPIRED' }
      })

      return NextResponse.json({
        success: true,
        data: {
          status: 'EXPIRED',
          message: 'El código QR ha expirado'
        }
      })
    }

    // Si está autenticado, generar token temporal para completar login en el browser
    let authToken = null
    if (qrSession.status === 'AUTHENTICATED' && qrSession.user) {
      const jwt = require('jsonwebtoken')
      authToken = jwt.sign(
        {
          userId: qrSession.user.id,
          email: qrSession.user.email,
          organizationId: qrSession.user.organizationId,
          role: qrSession.user.role,
          sessionId: qrSession.id
        },
        process.env.NEXTAUTH_SECRET || 'fallback-secret',
        { expiresIn: '5m' } // Token temporal de 5 minutos
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        status: qrSession.status,
        scannedAt: qrSession.scannedAt,
        authenticatedAt: qrSession.authenticatedAt,
        authToken: authToken,
        user: qrSession.user ? {
          email: qrSession.user.email,
          name: qrSession.user.name || qrSession.user.fullName
        } : null
      }
    })

  } catch (error) {
    console.error('Error verificando estado del QR:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor'
      },
      { status: 500 }
    )
  }
}
