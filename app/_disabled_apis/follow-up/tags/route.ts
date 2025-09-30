
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { hasPermission } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!hasPermission(session.user.role, 'VIEW_FOLLOW_UPS')) {
      return NextResponse.json({ error: 'Sin permisos suficientes' }, { status: 403 })
    }

    // Obtener todas las etiquetas únicas con su conteo
    const tagsData = await prisma.contactTag.groupBy({
      by: ['name', 'color'],
      where: {
        organizationId: session.user.organizationId
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    const tags = tagsData.map((tag, index) => ({
      id: `tag_${index}`,
      name: tag.name,
      color: tag.color || '#6B7280',
      count: tag._count.id
    }))

    return NextResponse.json({ tags })
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
