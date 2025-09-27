
'use client'

import { useSession } from 'next-auth/react'
import { UserRole } from '@prisma/client'
import { 
  Permission, 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions,
  canAccessRoute,
  getDashboardRoute,
  getRolePermissions 
} from '@/lib/permissions'

/**
 * Hook para gestión de permisos en el frontend
 */
export function usePermissions() {
  const { data: session, status } = useSession()
  
  const user = session?.user
  const role = user?.role as UserRole
  const organizationId = user?.organizationId

  return {
    // Estado de la sesión
    isAuthenticated: !!session,
    isLoading: status === 'loading',
    user,
    role,
    organizationId,
    
    // Funciones de permisos
    hasPermission: (permission: Permission) => {
      if (!role) return false
      return hasPermission(role, permission)
    },
    
    hasAnyPermission: (permissions: Permission[]) => {
      if (!role) return false
      return hasAnyPermission(role, permissions)
    },
    
    hasAllPermissions: (permissions: Permission[]) => {
      if (!role) return false
      return hasAllPermissions(role, permissions)
    },
    
    canAccessRoute: (route: string) => {
      if (!role) return false
      return canAccessRoute(role, route)
    },
    
    getDashboardRoute: () => {
      if (!role) return '/dashboard'
      return getDashboardRoute(role)
    },
    
    getAllPermissions: () => {
      if (!role) return []
      return getRolePermissions(role)
    },
    
    // Helpers para roles específicos
    isSuperAdmin: role === 'SUPER_ADMIN',
    isDistributor: role === 'DISTRIBUIDOR',
    isOwner: role === 'PROPIETARIO',
    isAgent: role === 'AGENTE',
    
    // Helpers para capacidades específicas
    canManageUsers: role === 'SUPER_ADMIN' || role === 'PROPIETARIO',
    canManageOrganization: role === 'SUPER_ADMIN' || role === 'PROPIETARIO',
    canViewAllConversations: role !== 'AGENTE',
    canManageWhatsApp: role === 'SUPER_ADMIN' || role === 'PROPIETARIO',
    canManageBilling: role === 'SUPER_ADMIN' || role === 'PROPIETARIO',
    canConfigureAI: role === 'SUPER_ADMIN' || role === 'PROPIETARIO',
    canViewReports: role !== 'AGENTE',
    canManageClients: role === 'DISTRIBUIDOR' || role === 'SUPER_ADMIN'
  }
}

/**
 * Hook para verificar un permiso específico
 */
export function usePermission(permission: Permission) {
  const { hasPermission } = usePermissions()
  return hasPermission(permission)
}

/**
 * Hook para verificar múltiples permisos
 */
export function useAnyPermission(permissions: Permission[]) {
  const { hasAnyPermission } = usePermissions()
  return hasAnyPermission(permissions)
}

/**
 * Hook para verificar acceso a rutas
 */
export function useRouteAccess(route: string) {
  const { canAccessRoute } = usePermissions()
  return canAccessRoute(route)
}

