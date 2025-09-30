
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, authToken } = body

    if (!sessionId || !authToken) {
      return NextResponse.json(
        { success: false, error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // Verificar el token JWT
    const decoded = jwt.verify(
      authToken, 
      process.env.NEXTAUTH_SECRET || 'fallback-secret'
    ) as any

    if (decoded.sessionId !== sessionId) {
      return NextResponse.json(
        { success: false, error: 'Token no válido para esta sesión' },
        { status: 401 }
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
            organizationId: true,
            organization: {
              select: {
                name: true,
                status: true
              }
            }
          }
        }
      }
    })

    if (!qrSession || qrSession.status !== 'AUTHENTICATED') {
      return NextResponse.json(
        { success: false, error: 'Sesión no válida o no autenticada' },
        { status: 404 }
      )
    }

    if (!qrSession.user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado en la sesión' },
        { status: 404 }
      )
    }

    // Limpiar sesión QR usada (opcional, por seguridad)
    await prisma.qRSession.delete({
      where: { id: sessionId }
    })

    return NextResponse.json({
      success: true,
      data: {
        user: qrSession.user,
        message: 'Autenticación QR exitosa'
      }
    })

  } catch (error) {
    console.error('Error validando token QR:', error)
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { success: false, error: 'Token JWT inválido' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor'
      },
      { status: 500 }
    )
  }
}
