
import { NextRequest } from 'next/server'
import { withAuth, ApiResponse } from '@/lib/api-auth'
import { Permission } from '@/lib/permissions'
import { prisma } from '@/lib/db'

/**
 * GET /api/users - Obtener usuarios de la organización
 * Requiere permisos: VIEW_ALL_USERS
 */
export const GET = withAuth(async (request: NextRequest, authData) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        organizationId: authData.organizationId
      },
      select: {
        id: true,
        email: true,
        name: true,
        fullName: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return ApiResponse.success(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return ApiResponse.error('Error al obtener usuarios', 500)
  }
}, [Permission.VIEW_ALL_USERS])

/**
 * POST /api/users - Crear nuevo usuario (invitación)
 * Requiere permisos: MANAGE_USERS
 */
export const POST = withAuth(async (request: NextRequest, authData) => {
  try {
    const body = await request.json()
    const { email, name, fullName, role } = body

    // Validaciones básicas
    if (!email || !name || !role) {
      return ApiResponse.error('Campos requeridos: email, name, role')
    }

    // Verificar que el usuario no existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return ApiResponse.error('El usuario ya existe')
    }

    // Crear el usuario
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        fullName,
        role,
        organizationId: authData.organizationId,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })

    return ApiResponse.success(newUser, 201)
  } catch (error) {
    console.error('Error creating user:', error)
    return ApiResponse.error('Error al crear usuario', 500)
  }
}, [Permission.MANAGE_USERS])

