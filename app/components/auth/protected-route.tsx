
'use client'

import { ReactNode } from 'react'
import { usePermissions } from '@/hooks/use-permissions'
import { Permission } from '@/lib/permissions'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface ProtectedRouteProps {
  children: ReactNode
  permissions?: Permission[]
  requireAll?: boolean // Si true, requiere TODOS los permisos; si false, requiere ALGUNO
  fallback?: ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  permissions = [], 
  requireAll = false,
  fallback,
  redirectTo
}: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, hasAnyPermission, hasAllPermissions, getDashboardRoute } = usePermissions()
  const router = useRouter()

  // Mostrar loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Verificar autenticación
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Alert className="max-w-md">
          <Lock className="h-4 w-4" />
          <AlertTitle>Acceso Denegado</AlertTitle>
          <AlertDescription>
            Debes iniciar sesión para acceder a esta página.
          </AlertDescription>
          <Button 
            onClick={() => router.push('/auth/login')} 
            className="mt-3 w-full"
          >
            Iniciar Sesión
          </Button>
        </Alert>
      </div>
    )
  }

  // Verificar permisos si se especificaron
  if (permissions.length > 0) {
    const hasRequiredPermissions = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)

    if (!hasRequiredPermissions) {
      if (fallback) {
        return <>{fallback}</>
      }

      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <Alert className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Sin Permisos</AlertTitle>
            <AlertDescription>
              No tienes los permisos necesarios para acceder a esta funcionalidad.
            </AlertDescription>
            <Button 
              onClick={() => router.push(redirectTo || getDashboardRoute())} 
              className="mt-3 w-full"
            >
              Volver al Dashboard
            </Button>
          </Alert>
        </div>
      )
    }
  }

  // Renderizar contenido si pasa todas las validaciones
  return <>{children}</>
}

