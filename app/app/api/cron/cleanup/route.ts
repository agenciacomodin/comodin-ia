
import { NextRequest, NextResponse } from 'next/server'
import { cleanupExpiredTokens } from '@/scripts/cleanup-expired-tokens'

export async function POST(request: NextRequest) {
  try {
    // Verificar el token de autorización para el cron job
    const authHeader = request.headers.get('authorization')
    const expectedToken = `Bearer ${process.env.CRON_SECRET}`

    if (authHeader !== expectedToken) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    // Ejecutar la limpieza
    const result = await cleanupExpiredTokens()

    return NextResponse.json({
      success: true,
      message: 'Limpieza ejecutada correctamente',
      data: result
    })

  } catch (error) {
    console.error('Error in cleanup cron:', error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
