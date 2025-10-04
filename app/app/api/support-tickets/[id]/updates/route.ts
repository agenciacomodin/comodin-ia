
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
    const { message, type, isInternal, attachments } = body

    const update = await prisma.supportTicketUpdate.create({
      data: {
        ticketId: params.id,
        message,
        type: type || 'comment',
        isInternal: isInternal || false,
        authorType: 'technician',
        authorName: session.user.name || 'Técnico',
        authorEmail: session.user.email,
        attachments
      }
    })

    return NextResponse.json({
      success: true,
      data: update
    })

  } catch (error) {
    console.error('Error creating update:', error)
    return NextResponse.json(
      { success: false, error: 'Error creando actualización' },
      { status: 500 }
    )
  }
}
