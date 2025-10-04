
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// POST /api/crm/messages/simulate-incoming - Simular mensaje entrante para pruebas
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar permisos (solo PROPIETARIO puede simular mensajes para pruebas)
    if (session.user.role !== 'PROPIETARIO') {
      return NextResponse.json({ 
        error: 'Solo el propietario puede simular mensajes' 
      }, { status: 403 })
    }

    const { conversationId, content } = await request.json()

    if (!conversationId || !content?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'ID de conversación y contenido son requeridos'
      }, { status: 400 })
    }

    // Verificar que la conversación existe y pertenece a la organización
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        organizationId: session.user.organizationId
      },
      include: {
        contact: true
      }
    })

    if (!conversation) {
      return NextResponse.json({
        success: false,
        error: 'Conversación no encontrada'
      }, { status: 404 })
    }

    // Llamar a la API de mensajes entrantes
    const incomingResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/crm/messages/incoming`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organizationId: session.user.organizationId,
        conversationId: conversationId,
        content: content,
        whatsappMessageId: `sim_${Date.now()}`,
        whatsappChannelId: 'simulation'
      })
    })

    const result = await incomingResponse.json()

    if (!result.success) {
      throw new Error(result.error || 'Error simulando mensaje')
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Mensaje simulado exitosamente'
    })

  } catch (error) {
    console.error('Error simulando mensaje entrante:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}
