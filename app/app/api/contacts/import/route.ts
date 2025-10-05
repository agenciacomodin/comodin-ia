
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { userHasPermission, Permission } from '@/lib/permissions'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!userHasPermission(session.user.role, Permission.MANAGE_CONTACTS)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
    }

    const body = await request.json()
    const { contacts } = body

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json({ error: 'Debe proporcionar un array de contactos' }, { status: 400 })
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[]
    }

    for (const contactData of contacts) {
      try {
        const { name, email, phone, ...otherData } = contactData

        if (!name) {
          results.failed++
          results.errors.push({ contact: contactData, error: 'Nombre requerido' })
          continue
        }

        // Verificar duplicados
        if (email || phone) {
          const existing = await prisma.contact.findFirst({
            where: {
              organizationId: session.user.organizationId,
              OR: [
                ...(email ? [{ email }] : []),
                ...(phone ? [{ phone }] : [])
              ]
            }
          })

          if (existing) {
            results.failed++
            results.errors.push({ contact: contactData, error: 'Contacto duplicado' })
            continue
          }
        }

        await prisma.contact.create({
          data: {
            organizationId: session.user.organizationId,
            name,
            email,
            phone,
            ...otherData
          }
        })

        results.success++
      } catch (error) {
        results.failed++
        results.errors.push({ contact: contactData, error: String(error) })
      }
    }

    return NextResponse.json({
      success: true,
      data: results
    })
  } catch (error) {
    console.error('Error al importar contactos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
