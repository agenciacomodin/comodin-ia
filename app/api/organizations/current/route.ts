
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener el usuario con su organización
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            status: true
          }
        }
      }
    })

    if (!user?.organization) {
      return NextResponse.json({ 
        error: 'No se encontró organización para el usuario' 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      organization: {
        ...user.organization,
        logoUrl: user.organization.logo
      }
    })

  } catch (error) {
    console.error('Error getting current organization:', error)
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}
