
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    // Limpiar sesiones QR expiradas
    await prisma.qRSession.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        },
        status: {
          in: ['PENDING', 'EXPIRED']
        }
      }
    })

    // Obtener información del cliente
    const userAgent = request.headers.get('user-agent') || ''
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown'

    // Generar tokens únicos
    const qrCode = uuidv4()
    const token = uuidv4()
    
    // Crear sesión QR que expira en 5 minutos
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)
    
    const qrSession = await prisma.qRSession.create({
      data: {
        qrCode,
        token,
        userAgent,
        ipAddress,
        expiresAt,
        status: 'PENDING'
      }
    })

    // Crear datos para el código QR (JSON con información de sesión)
    const qrData = JSON.stringify({
      sessionId: qrSession.id,
      token: qrSession.token,
      timestamp: Date.now(),
      domain: request.headers.get('host') || process.env.NEXTAUTH_URL || 'localhost:3000'
    })

    return NextResponse.json({
      success: true,
      data: {
        sessionId: qrSession.id,
        qrData,
        expiresAt: qrSession.expiresAt,
        expiresIn: 300 // 5 minutos en segundos
      }
    })

  } catch (error) {
    console.error('Error generando código QR:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor'
      },
      { status: 500 }
    )
  }
}
