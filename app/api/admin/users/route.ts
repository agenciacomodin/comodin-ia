
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')
    const plan = searchParams.get('plan')

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status && status !== 'all') {
      where.isActive = status === 'ACTIVE'
    }

    // Obtener usuarios con información relacionada
    const users = await prisma.user.findMany({
      where,
      include: {
        organization: {
          select: {
            name: true,
            currentPlan: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Formatear datos para el frontend
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name || '',
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.isActive ? 'ACTIVE' : 'INACTIVE',
      plan: user.organization?.currentPlan || 'FREE',
      createdAt: user.createdAt,
      lastActive: user.lastLogin,
      totalRevenue: 0, // Simplificado por ahora
      messagesSent: 0, // Simplificado por ahora
      organization: user.organization
    }))

    const total = await prisma.user.count({ where })

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
        hasNext: skip + limit < total,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
