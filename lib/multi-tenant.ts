
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { prisma } from './db'
import { UserRole } from '@prisma/client'

/**
 * Hook para obtener la organización del usuario autenticado de forma segura
 */
export async function getCurrentOrganization() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.organizationId) {
    throw new Error('Usuario no autenticado o sin organización')
  }

  const organization = await prisma.organization.findUnique({
    where: { 
      id: session.user.organizationId,
      status: { not: 'SUSPENDED' }
    },
    include: {
      users: true
    }
  })

  if (!organization) {
    throw new Error('Organización no encontrada o suspendida')
  }

  return { organization, user: session.user }
}

/**
 * Verificar si el usuario tiene los permisos necesarios
 */
export function hasPermission(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  // SUPER_ADMIN tiene acceso a todo
  if (userRole === 'SUPER_ADMIN') {
    return true
  }

  // PROPIETARIO tiene acceso a todo dentro de su organización
  if (userRole === 'PROPIETARIO' && !requiredRoles.includes('SUPER_ADMIN')) {
    return true
  }

  return requiredRoles.includes(userRole)
}

/**
 * Wrapper para queries que garantiza aislamiento por organización
 */
export async function withOrganizationContext<T>(
  callback: (organizationId: string, userRole: UserRole) => Promise<T>
): Promise<T> {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.organizationId) {
    throw new Error('Acceso no autorizado: sesión inválida')
  }

  // Verificar que la organización esté activa
  const organization = await prisma.organization.findFirst({
    where: { 
      id: session.user.organizationId,
      status: { in: ['ACTIVE', 'TRIAL'] }
    }
  })

  if (!organization) {
    throw new Error('Organización no encontrada o inactiva')
  }

  return await callback(session.user.organizationId, session.user.role)
}

/**
 * Generar slug único para organización
 */
export async function generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Remover múltiples guiones consecutivos
    .trim()

  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await prisma.organization.findUnique({
      where: { slug }
    })

    if (!existing) {
      return slug
    }

    slug = `${baseSlug}-${counter}`
    counter++
  }
}

/**
 * Validar que un usuario pertenece a la organización especificada
 */
export async function validateUserOrganization(userId: string, organizationId: string): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      organizationId: organizationId,
      isActive: true
    }
  })

  return !!user
}

/**
 * Obtener estadísticas básicas de la organización
 */
export async function getOrganizationStats(organizationId: string) {
  const [totalUsers, activeUsers] = await Promise.all([
    prisma.user.count({
      where: { organizationId }
    }),
    prisma.user.count({
      where: { 
        organizationId, 
        isActive: true 
      }
    })
  ])

  return {
    totalUsers,
    activeUsers,
    inactiveUsers: totalUsers - activeUsers
  }
}
