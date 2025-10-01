
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { AIBrokerService } from '@/lib/ai-broker-service'

/**
 * API para gestión del caché inteligente de IA (SUPER ADMIN ONLY)
 */

// GET /api/admin/ai-cache - Obtener estadísticas del caché
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Acceso no autorizado. Solo Super Admins.' },
        { status: 403 }
      )
    }

    const cacheStats = await AIBrokerService.getCacheStats()

    return NextResponse.json({
      success: true,
      stats: cacheStats
    })

  } catch (error) {
    console.error('Error obteniendo estadísticas de caché:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/ai-cache - Purgar caché de IA
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Acceso no autorizado. Solo Super Admins.' },
        { status: 403 }
      )
    }

    // Obtener parámetros de la solicitud
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

    // Purgar caché
    const result = await AIBrokerService.purgeAICache(organizationId || undefined)

    return NextResponse.json({
      success: true,
      message: `Caché de IA purgado exitosamente. ${result.deletedCount} entradas eliminadas.`,
      deletedCount: result.deletedCount
    })

  } catch (error: any) {
    console.error('Error purgando caché de IA:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error interno del servidor' 
      },
      { status: 500 }
    )
  }
}
