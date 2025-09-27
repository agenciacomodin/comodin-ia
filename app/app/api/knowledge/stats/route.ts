
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { KnowledgeSourceStatus } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/knowledge/stats - Obtener estadísticas de la base de conocimiento
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const organizationId = (session.user as any).organizationId

    // Consultar estadísticas básicas
    const [
      totalSources,
      activeSources,
      processingSources,
      errorSources,
      totalChunks,
      processedChunks,
      failedChunks,
      totalUsage,
      usageThisMonth,
      topSources,
      recentActivity
    ] = await Promise.all([
      // Total de fuentes
      prisma.knowledgeSource.count({
        where: { organizationId }
      }),
      
      // Fuentes activas
      prisma.knowledgeSource.count({
        where: { 
          organizationId,
          status: KnowledgeSourceStatus.ACTIVE
        }
      }),
      
      // Fuentes procesando
      prisma.knowledgeSource.count({
        where: { 
          organizationId,
          status: { 
            in: [
              KnowledgeSourceStatus.PROCESSING,
              KnowledgeSourceStatus.CHUNKING,
              KnowledgeSourceStatus.EMBEDDING
            ]
          }
        }
      }),
      
      // Fuentes con error
      prisma.knowledgeSource.count({
        where: { 
          organizationId,
          status: KnowledgeSourceStatus.ERROR
        }
      }),
      
      // Total de chunks
      prisma.knowledgeSource.aggregate({
        where: { organizationId },
        _sum: { totalChunks: true }
      }).then(result => result._sum.totalChunks || 0),
      
      // Chunks procesados
      prisma.knowledgeSource.aggregate({
        where: { organizationId },
        _sum: { processedChunks: true }
      }).then(result => result._sum.processedChunks || 0),
      
      // Chunks fallidos
      prisma.knowledgeSource.aggregate({
        where: { organizationId },
        _sum: { failedChunks: true }
      }).then(result => result._sum.failedChunks || 0),
      
      // Uso total
      prisma.knowledgeUsage.count({
        where: { organizationId }
      }),
      
      // Uso este mes
      prisma.knowledgeUsage.count({
        where: { 
          organizationId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      
      // Top fuentes más usadas
      prisma.knowledgeSource.findMany({
        where: { 
          organizationId,
          status: KnowledgeSourceStatus.ACTIVE
        },
        select: {
          id: true,
          name: true,
          usageCount: true,
          contentQuality: true
        },
        orderBy: { usageCount: 'desc' },
        take: 5
      }),
      
      // Actividad reciente
      prisma.knowledgeSource.findMany({
        where: { organizationId },
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { updatedAt: 'desc' },
        take: 10
      })
    ])

    // Calcular calidad promedio
    const qualityResult = await prisma.knowledgeSource.aggregate({
      where: { 
        organizationId,
        contentQuality: { not: null }
      },
      _avg: { contentQuality: true }
    })
    
    const avgQuality = qualityResult._avg.contentQuality?.toNumber() || 0

    // Formatear fuentes top
    const formattedTopSources = topSources.map(source => ({
      id: source.id,
      name: source.name,
      usageCount: source.usageCount,
      quality: source.contentQuality?.toNumber()
    }))

    // Formatear actividad reciente
    const formattedRecentActivity = recentActivity.map(source => ({
      id: source.id,
      action: source.createdAt.getTime() === source.updatedAt.getTime() ? 'created' : 'updated',
      sourceName: source.name,
      timestamp: source.updatedAt,
      status: source.status
    }))

    const stats = {
      totalSources,
      activeSources,
      processingSources,
      errorSources,
      totalChunks,
      processedChunks,
      failedChunks,
      totalUsage,
      usageThisMonth,
      avgQuality,
      topSources: formattedTopSources,
      recentActivity: formattedRecentActivity
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Error obteniendo estadísticas de conocimiento:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
