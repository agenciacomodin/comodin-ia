
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
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
    const { solution, hoursWorked } = body

    // Obtener el ticket
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId
      },
      include: {
        service: true
      }
    })

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: 'Ticket no encontrado' },
        { status: 404 }
      )
    }

    // Calcular precio basado en el servicio o por defecto $20
    const finalPrice = ticket.service?.price || 20

    // Actualizar ticket como resuelto
    const updatedTicket = await prisma.supportTicket.update({
      where: { id: params.id },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        hoursWorked: hoursWorked || 0,
        finalPrice,
        invoiced: true,
        paid: true
      }
    })

    // Crear actualización de resolución
    await prisma.supportTicketUpdate.create({
      data: {
        ticketId: ticket.id,
        message: `Ticket resuelto. Solución: ${solution}`,
        type: 'resolution',
        authorType: 'technician',
        authorName: session.user.name || 'Técnico',
        authorEmail: session.user.email,
        metadata: {
          solution,
          hoursWorked,
          finalPrice
        }
      }
    })

    // Registrar transacción financiera del ticket de soporte
    await prisma.financialTransaction.create({
      data: {
        organizationId: session.user.organizationId,
        type: 'ADJUSTMENT', // Tipo de ajuste manual
        amount: finalPrice,
        currency: 'USD',
        description: `Cobro por ticket de soporte: ${ticket.title}`,
        reference: ticket.id,
        balanceBefore: 0, // No estamos manejando balance directo
        balanceAfter: 0,
        userId: session.user.id,
        userName: session.user.name || undefined,
        metadata: {
          ticketId: ticket.id,
          ticketTitle: ticket.title,
          serviceType: ticket.type,
          hoursWorked,
          category: 'SUPPORT_TICKET'
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedTicket,
      message: `Ticket resuelto. Se ha cobrado $${finalPrice} de su cartera.`
    })

  } catch (error) {
    console.error('Error resolving ticket:', error)
    return NextResponse.json(
      { success: false, error: 'Error resolviendo ticket' },
      { status: 500 }
    )
  }
}
