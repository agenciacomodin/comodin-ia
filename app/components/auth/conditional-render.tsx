
'use client'

import { ReactNode } from 'react'
import { usePermissions } from '@/hooks/use-permissions'
import { Permission } from '@/lib/permissions'
import { UserRole } from '@prisma/client'

interface ConditionalRenderProps {
  children: ReactNode
  permissions?: Permission[]
  roles?: UserRole[]
  requireAll?: boolean // Para permisos: si true, requiere TODOS; si false, requiere ALGUNO
  fallback?: ReactNode
}

/**
 * Componente para renderizar contenido condicionalmente basado en permisos o roles
 */
export function ConditionalRender({ 
  children, 
  permissions = [], 
  roles = [],
  requireAll = false,
  fallback = null
}: ConditionalRenderProps) {
  const { role, hasAnyPermission, hasAllPermissions } = usePermissions()

  // Verificar roles si se especificaron
  if (roles.length > 0 && !roles.includes(role as UserRole)) {
    return <>{fallback}</>
  }

  // Verificar permisos si se especificaron
  if (permissions.length > 0) {
    const hasRequiredPermissions = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)

    if (!hasRequiredPermissions) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}

/**
 * HOC para proteger componentes basado en permisos
 */
export function withPermissions<T extends object>(
  Component: React.ComponentType<T>,
  permissions: Permission[],
  requireAll = false
) {
  return function ProtectedComponent(props: T) {
    return (
      <ConditionalRender permissions={permissions} requireAll={requireAll}>
        <Component {...props} />
      </ConditionalRender>
    )
  }
}

/**
 * HOC para proteger componentes basado en roles
 */
export function withRoles<T extends object>(
  Component: React.ComponentType<T>,
  roles: UserRole[]
) {
  return function RoleProtectedComponent(props: T) {
    return (
      <ConditionalRender roles={roles}>
        <Component {...props} />
      </ConditionalRender>
    )
  }
}

