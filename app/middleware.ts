
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { UserRole } from '@prisma/client'
import { canAccessRoute, getDashboardRoute } from './lib/permissions'

export default withAuth(
  function middleware(req: NextRequest & { nextauth: any }) {
    const token = req.nextauth?.token
    const pathname = req.nextUrl.pathname
    const userRole = token?.role as UserRole

    // Rutas públicas que no requieren autenticación
    const publicRoutes = ['/auth/login', '/auth/register', '/auth/organization-setup']
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
    
    // Permitir acceso a rutas públicas sin token
    if (isPublicRoute && !token) {
      return NextResponse.next()
    }

    // Redirigir usuarios no autenticados a login
    if (!token && !isPublicRoute) {
      const loginUrl = new URL('/auth/login', req.url)
      loginUrl.searchParams.set('callbackUrl', req.url)
      return NextResponse.redirect(loginUrl)
    }

    // Redirigir usuarios autenticados away de rutas de auth
    if (token && isPublicRoute) {
      // Redirigir al dashboard apropiado según el rol
      const dashboardRoute = userRole ? getDashboardRoute(userRole) : '/dashboard'
      return NextResponse.redirect(new URL(dashboardRoute, req.url))
    }

    // Validación de acceso basada en roles
    if (token && userRole) {
      const hasAccess = canAccessRoute(userRole, pathname)
      
      if (!hasAccess) {
        // Redirigir a la página apropiada según el rol
        const appropriateRoute = getDashboardRoute(userRole)
        return NextResponse.redirect(new URL(appropriateRoute, req.url))
      }

      // Redireccionamientos especiales para ciertos roles
      if (pathname === '/' || pathname === '/dashboard') {
        // Super Admin siempre va al panel de administración
        if (userRole === 'SUPER_ADMIN') {
          return NextResponse.redirect(new URL('/admin', req.url))
        }
        // Distribuidor va a su panel específico
        if (userRole === 'DISTRIBUIDOR') {
          return NextResponse.redirect(new URL('/distributor', req.url))
        }
      }
    }

    // CRITICAL: Middleware de seguridad multi-tenant
    // Agregar información del usuario y organización a los headers
    if (token?.organizationId) {
      const requestHeaders = new Headers(req.headers)
      requestHeaders.set('x-organization-id', token.organizationId)
      requestHeaders.set('x-user-role', token.role)
      requestHeaders.set('x-user-id', token.sub!)
      requestHeaders.set('x-user-email', token.email || '')

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        }
      })
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        
        // Permitir acceso a rutas públicas
        const isPublicRoute = ['/auth/login', '/auth/register', '/auth/organization-setup'].some(
          route => pathname.startsWith(route)
        )
        
        if (isPublicRoute) return true
        
        // Requerir autenticación para todas las demás rutas
        return !!token
      },
    },
  }
)

// Configurar las rutas que el middleware debe procesar
export const config = {
  matcher: [
    // Incluir todas las rutas excepto archivos estáticos
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
    // Incluir rutas API específicas (excepto NextAuth)
    '/api/((?!auth).*)'
  ]
}
