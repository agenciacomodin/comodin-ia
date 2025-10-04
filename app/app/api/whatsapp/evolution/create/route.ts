
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import EvolutionAPI from '@/lib/evolution-api'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { instanceName, organizationId } = await request.json()

    if (!instanceName || !organizationId) {
      return NextResponse.json({ 
        error: 'instanceName y organizationId son requeridos' 
      }, { status: 400 })
    }

    // Verificar que el usuario tiene acceso a la organización
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      }
    })

    if (!user || user.organizationId !== organizationId) {
      return NextResponse.json({ error: 'Sin acceso a la organización' }, { status: 403 })
    }

    // Configurar Evolution API
    const evolutionUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080'
    const evolutionKey = process.env.EVOLUTION_API_KEY || 'comodin_ia_key'
    
    const evolutionAPI = new EvolutionAPI(evolutionUrl, evolutionKey)

    // Crear instancia en Evolution API
    const instance = await evolutionAPI.createInstance(instanceName)

    // Configurar webhook
    const webhookUrl = `${process.env.NEXTAUTH_URL}/api/whatsapp/evolution/webhook`
    await evolutionAPI.setWebhook(instanceName, webhookUrl)

    // Guardar configuración en la base de datos
    await prisma.organizationIntegration.upsert({
      where: {
        organizationId_integrationId: {
          organizationId,
          integrationId: 'whatsapp-evolution'
        }
      },
      update: {
        status: 'PENDING',
        config: {
          instanceName,
          evolutionUrl,
          webhookUrl,
          createdAt: new Date().toISOString()
        }
      },
      create: {
        organizationId,
        integrationId: 'whatsapp-evolution',
        status: 'PENDING',
        config: {
          instanceName,
          evolutionUrl,
          webhookUrl,
          createdAt: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({
      success: true,
      instanceName,
      instance
    })

  } catch (error) {
    console.error('Error creating WhatsApp instance:', error)
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}
