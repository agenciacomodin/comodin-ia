
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
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

    // Desconectar y eliminar instancia
    await evolutionAPI.logoutInstance(instanceName)
    await evolutionAPI.deleteInstance(instanceName)

    // Actualizar estado en la base de datos
    await prisma.organizationIntegration.updateMany({
      where: {
        organizationId,
        config: {
          path: ['instanceName'],
          equals: instanceName
        }
      },
      data: {
        status: 'DISCONNECTED',
        config: {
          instanceName,
          disconnectedAt: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'WhatsApp desconectado exitosamente'
    })

  } catch (error) {
    console.error('Error disconnecting WhatsApp:', error)
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}
