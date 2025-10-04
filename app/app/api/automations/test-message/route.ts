
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createAIBroker } from '@/lib/ai-broker'

// POST /api/automations/test-message - Probar análisis de mensaje
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar permisos (solo PROPIETARIO puede probar automatizaciones)
    if (session.user.role !== 'PROPIETARIO') {
      return NextResponse.json({ 
        error: 'Solo el propietario puede probar automatizaciones' 
      }, { status: 403 })
    }

    const { message } = await request.json()

    if (!message || message.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'El mensaje es requerido'
      }, { status: 400 })
    }

    // Crear instancia del AI Broker
    const broker = createAIBroker(session.user.organizationId)

    // Analizar el mensaje
    const analysis = await broker.analyzeMessage(message, false) // Sin cache para pruebas

    return NextResponse.json({
      success: true,
      data: {
        message: message,
        analysis,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error probando análisis de mensaje:', error)
    return NextResponse.json({
      success: false,
      error: 'Error analizando mensaje: ' + (error instanceof Error ? error.message : 'Error desconocido')
    }, { status: 500 })
  }
}
