
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { userHasPermission, Permission } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!userHasPermission(session.user.role, Permission.VIEW_CONTACTS)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
    }

    const contacts = await prisma.contact.findMany({
      where: {
        organizationId: session.user.organizationId
      },
      include: {
        tags: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Convertir a formato CSV
    const csvHeaders = 'ID,Nombre,Email,Teléfono,Tags,Fecha Creación\n'
    const csvRows = contacts.map(contact => {
      const tags = contact.tags.map(t => t.name).join(';')
      return `${contact.id},"${contact.name}","${contact.email || ''}","${contact.phone || ''}","${tags}","${contact.createdAt}"`
    }).join('\n')

    const csvContent = csvHeaders + csvRows

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="contactos_${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Error al exportar contactos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
