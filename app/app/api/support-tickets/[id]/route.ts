
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId
      },
      include: {
        service: true,
        updates: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: 'Ticket no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: ticket
    })

  } catch (error) {
    console.error('Error fetching ticket:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      status,
      priority,
      assignedTo,
      estimatedHours
    } = body

    const ticket = await prisma.supportTicket.update({
      where: {
        id: params.id
      },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assignedTo !== undefined && { 
          assignedTo,
          assignedAt: assignedTo ? new Date() : null
        }),
        ...(estimatedHours !== undefined && { estimatedHours })
      },
      include: {
        service: true
      }
    })

    // Crear actualización
    if (status) {
      await prisma.supportTicketUpdate.create({
        data: {
          ticketId: ticket.id,
          message: `Estado cambiado a: ${status}`,
          type: 'status_change',
          authorType: 'technician',
          authorName: session.user.name || 'Sistema',
          authorEmail: session.user.email
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: ticket
    })

  } catch (error) {
    console.error('Error updating ticket:', error)
    return NextResponse.json(
      { success: false, error: 'Error actualizando ticket' },
      { status: 500 }
    )
  }
}
