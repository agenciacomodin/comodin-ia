
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { generateUniqueSlug } from '@/lib/multi-tenant'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const signupSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  organizationName: z.string().min(2, 'El nombre de la organización debe tener al menos 2 caracteres').optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos de entrada
    const validatedData = signupSchema.parse(body)
    
    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 400 }
      )
    }

    // Generar nombre de organización si no se proporciona (para compatibilidad con tests)
    const organizationName = validatedData.organizationName || `${validatedData.fullName} Company`
    
    // Generar slug único para la organización
    const slug = await generateUniqueSlug(organizationName)
    
    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)
    
    // Transacción para crear organización y usuario propietario
    const result = await prisma.$transaction(async (tx) => {
      // Crear organización
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          slug,
          country: validatedData.country || 'México',
          status: 'TRIAL'
        }
      })
      
      // Crear usuario propietario
      const user = await tx.user.create({
        data: {
          email: validatedData.email,
          name: validatedData.fullName.split(' ')[0], // Primer nombre
          fullName: validatedData.fullName,
          phone: validatedData.phone,
          country: validatedData.country || 'México',
          organizationId: organization.id,
          role: 'PROPIETARIO'
        }
      })
      
      // Crear credenciales (usando refresh_token para almacenar hash de password)
      await tx.account.create({
        data: {
          userId: user.id,
          type: 'credentials',
          provider: 'credentials',
          providerAccountId: user.id,
          refresh_token: hashedPassword, // Almacenar hash aquí
        }
      })
      
      return { user, organization }
    })

    return NextResponse.json({
      message: 'Registro exitoso',
      user: {
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.fullName,
        organizationId: result.organization.id,
        organizationName: result.organization.name,
        role: result.user.role
      }
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error en registro:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
