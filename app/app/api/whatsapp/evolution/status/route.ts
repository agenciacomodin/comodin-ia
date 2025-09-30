
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import EvolutionAPI from '@/lib/evolution-api'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const instanceName = searchParams.get('instanceName')

    if (!instanceName) {
      return NextResponse.json({ 
        error: 'instanceName es requerido' 
      }, { status: 400 })
    }

    // Configurar Evolution API
    const evolutionUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080'
    const evolutionKey = process.env.EVOLUTION_API_KEY || 'comodin_ia_key'
    
    const evolutionAPI = new EvolutionAPI(evolutionUrl, evolutionKey)

    // Obtener estado de la conexión
    const connectionState = await evolutionAPI.getConnectionState(instanceName)
    const instance = await evolutionAPI.getInstance(instanceName)

    let status = 'CLOSED'
    if (connectionState.state === 'open') {
      status = 'OPEN'
    } else if (connectionState.state === 'connecting') {
      status = 'CONNECTING'
    } else if (connectionState.state === 'close') {
      status = 'CLOSED'
    }

    // Si está conectado, actualizar en la base de datos
    if (status === 'OPEN') {
      const profile = await evolutionAPI.getProfile(instanceName)
      
      // Actualizar estado en la base de datos
      await prisma.organizationIntegration.updateMany({
        where: {
          config: {
            path: ['instanceName'],
            equals: instanceName
          }
        },
        data: {
          status: 'CONNECTED',
          config: {
            instanceName,
            evolutionUrl,
            profileName: profile?.name || 'WhatsApp Business',
            phone: profile?.number || 'Número no disponible',
            profilePictureUrl: profile?.profilePictureUrl || null,
            connectedAt: new Date().toISOString()
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      status,
      profileName: instance.profileName,
      phone: instance.phone,
      profilePictureUrl: instance.profilePictureUrl,
      instanceName
    })

  } catch (error) {
    console.error('Error getting connection status:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al obtener estado de conexión'
    }, { status: 500 })
  }
}
