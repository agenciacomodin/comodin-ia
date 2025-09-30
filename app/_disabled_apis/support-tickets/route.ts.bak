
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const priority = searchParams.get('priority')

    const tickets = await prisma.supportTicket.findMany({
      where: {
        organizationId: session.user.organizationId,
        ...(status && { status: status as any }),
        ...(type && { type: type as any }),
        ...(priority && { priority: priority as any })
      },
      include: {
        service: true,
        updates: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: tickets
    })

  } catch (error) {
    console.error('Error in support tickets API:', error)
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

    const body = await request.json()
    const {
      title,
      description,
      type,
      priority,
      serviceId,
      clientName,
      clientEmail,
      clientPhone,
      clientCompany,
      technicalDetails
    } = body

    const ticket = await prisma.supportTicket.create({
      data: {
        organizationId: session.user.organizationId,
        title,
        description,
        type,
        priority: priority || 'MEDIUM',
        serviceId,
        clientName,
        clientEmail,
        clientPhone,
        clientCompany,
        technicalDetails,
        status: 'OPEN'
      },
      include: {
        service: true
      }
    })

    // Crear actualización inicial
    await prisma.supportTicketUpdate.create({
      data: {
        ticketId: ticket.id,
        message: `Ticket creado: ${description}`,
        type: 'created',
        authorType: 'client',
        authorName: clientName,
        authorEmail: clientEmail
      }
    })

    return NextResponse.json({
      success: true,
      data: ticket
    })

  } catch (error) {
    console.error('Error creating support ticket:', error)
    return NextResponse.json(
      { success: false, error: 'Error creando ticket' },
      { status: 500 }
    )
  }
}
