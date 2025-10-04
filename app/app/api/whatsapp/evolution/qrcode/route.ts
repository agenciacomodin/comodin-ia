
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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

    // Obtener código QR
    const qrData = await evolutionAPI.getQRCode(instanceName)

    return NextResponse.json({
      success: true,
      qrCode: qrData.base64,
      instanceName
    })

  } catch (error) {
    console.error('Error getting QR code:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al obtener código QR'
    }, { status: 500 })
  }
}
