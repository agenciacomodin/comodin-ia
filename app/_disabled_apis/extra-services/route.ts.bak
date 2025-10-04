
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener servicios extras disponibles
    const services = await prisma.extraService.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        type: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: services
    })

  } catch (error) {
    console.error('Error in extra services API:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Solo SUPER_ADMIN puede crear servicios
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      displayName,
      description,
      type,
      price,
      currency,
      estimatedHours,
      deliveryDays,
      requirements,
      deliverables
    } = body

    const service = await prisma.extraService.create({
      data: {
        name,
        displayName,
        description,
        type,
        price,
        currency: currency || 'USD',
        estimatedHours,
        deliveryDays,
        requirements,
        deliverables
      }
    })

    return NextResponse.json({
      success: true,
      data: service
    })

  } catch (error) {
    console.error('Error creating extra service:', error)
    return NextResponse.json(
      { success: false, error: 'Error creando servicio' },
      { status: 500 }
    )
  }
}
