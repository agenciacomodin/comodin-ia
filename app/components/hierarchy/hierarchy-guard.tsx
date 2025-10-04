
'use client'

import { useSession } from 'next-auth/react'
import { ReactNode } from 'react'
import { UserRole } from '@prisma/client'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, AlertTriangle } from 'lucide-react'
import { canManageRole, canAccessOrganization } from '@/lib/hierarchy'
import { ExtendedUser } from '@/lib/auth'

interface HierarchyGuardProps {
  children: ReactNode
  allowedRoles?: UserRole[]
  requiredRole?: UserRole
  targetOrganizationId?: string
  targetUserRole?: UserRole
  fallback?: ReactNode
  showError?: boolean
}

/**
 * Componente que protege contenido basado en la jerarquía de roles
 */
export function HierarchyGuard({
  children,
  allowedRoles,
  requiredRole,
  targetOrganizationId,
  targetUserRole,
  fallback,
  showError = true
}: HierarchyGuardProps) {
  const { data: session } = useSession() || {}
  const user = session?.user as ExtendedUser | undefined

  if (!user) {
    if (showError) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Usuario no autenticado
          </AlertDescription>
        </Alert>
      )
    }
    return fallback || null
  }

  // Verificar roles permitidos
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (showError) {
      return (
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos para ver este contenido. Rol requerido: {allowedRoles.join(', ')}
          </AlertDescription>
        </Alert>
      )
    }
    return fallback || null
  }

  // Verificar rol mínimo requerido
  if (requiredRole && !canManageRole(user.role, requiredRole)) {
    if (showError) {
      return (
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Permisos insuficientes. Se requiere rol: {requiredRole}
          </AlertDescription>
        </Alert>
      )
    }
    return fallback || null
  }

  // Verificar acceso a organización específica
  if (targetOrganizationId && !canAccessOrganization(user, targetOrganizationId)) {
    if (showError) {
      return (
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            No tienes acceso a esta organización
          </AlertDescription>
        </Alert>
      )
    }
    return fallback || null
  }

  // Verificar capacidad de gestionar rol objetivo
  if (targetUserRole && !canManageRole(user.role, targetUserRole)) {
    if (showError) {
      return (
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            No puedes gestionar usuarios con rol: {targetUserRole}
          </AlertDescription>
        </Alert>
      )
    }
    return fallback || null
  }

  return <>{children}</>
}

/**
 * Hook para verificar permisos de jerarquía
 */
export function useHierarchyCheck() {
  const { data: session } = useSession() || {}
  const user = session?.user as ExtendedUser | undefined

  return {
    user,
    canManage: (targetRole: UserRole) => 
      user ? canManageRole(user.role, targetRole) : false,
    canAccess: (organizationId: string) => 
      user ? canAccessOrganization(user, organizationId) : false,
    hasRole: (roles: UserRole[]) => 
      user ? roles.includes(user.role) : false
  }
}
