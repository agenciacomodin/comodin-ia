
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { UserRole } from '@prisma/client'
import { Permission, hasPermission, userHasAnyPermission } from './permissions'
import { prisma } from './db'

/**
 * Extraer información de autenticación desde headers del middleware
 */
export function getAuthFromHeaders(request: NextRequest) {
  const organizationId = request.headers.get('x-organization-id')
  const userRole = request.headers.get('x-user-role') as UserRole
  const userId = request.headers.get('x-user-id')
  const userEmail = request.headers.get('x-user-email')

  return {
    organizationId,
    userRole,
    userId,
    userEmail
  }
}

/**
 * Verificar autenticación en API routes
 */
export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    throw new Error('No autenticado')
  }

  const { organizationId, userRole, userId, userEmail } = getAuthFromHeaders(request)
  
  if (!organizationId || !userRole || !userId) {
    throw new Error('Información de autenticación incompleta')
  }

  return {
    user: session.user,
    organizationId,
    userRole,
    userId,
    userEmail
  }
}

/**
 * Verificar permisos específicos en API routes
 */
export async function requirePermissions(
  request: NextRequest, 
  permissions: Permission[]
): Promise<{
  user: any
  organizationId: string
  userRole: UserRole
  userId: string
  userEmail: string | null
}> {
  const authData = await requireAuth(request)
  
  const hasRequiredPermissions = permissions.some(permission => 
    hasPermission(authData.userRole, permission)
  )
  
  if (!hasRequiredPermissions) {
    throw new Error('Permisos insuficientes')
  }

  return authData
}

/**
 * Verificar que el usuario pertenece a la organización especificada
 */
export async function validateOrganizationAccess(
  userId: string, 
  organizationId: string
): Promise<boolean> {
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
 * Wrapper para API routes con autenticación y permisos
 */
export function withAuth<T extends any[]>(
  handler: (request: NextRequest, authData: any, ...args: T) => Promise<Response>,
  permissions: Permission[] = []
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    try {
      const authData = permissions.length > 0 
        ? await requirePermissions(request, permissions)
        : await requireAuth(request)

      // Validar acceso a la organización
      const hasAccess = await validateOrganizationAccess(
        authData.userId, 
        authData.organizationId
      )

      if (!hasAccess) {
        return Response.json(
          { error: 'Acceso no autorizado a esta organización' },
          { status: 403 }
        )
      }

      return await handler(request, authData, ...args)
    } catch (error: any) {
      if (error.message === 'No autenticado') {
        return Response.json({ error: 'No autenticado' }, { status: 401 })
      }
      
      if (error.message === 'Permisos insuficientes') {
        return Response.json({ error: 'Permisos insuficientes' }, { status: 403 })
      }
      
      return Response.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      )
    }
  }
}

/**
 * Helper para respuestas JSON estandarizadas
 */
export const ApiResponse = {
  success: (data: any, status = 200) => {
    return Response.json({ success: true, data }, { status })
  },
  
  error: (message: string, status = 400, details?: any) => {
    return Response.json({ 
      success: false, 
      error: message, 
      ...(details && { details }) 
    }, { status })
  },
  
  unauthorized: (message = 'No autorizado') => {
    return Response.json({ success: false, error: message }, { status: 401 })
  },
  
  forbidden: (message = 'Acceso denegado') => {
    return Response.json({ success: false, error: message }, { status: 403 })
  },
  
  notFound: (message = 'Recurso no encontrado') => {
    return Response.json({ success: false, error: message }, { status: 404 })
  }
}

