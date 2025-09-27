
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default withAuth(
  function middleware(req: NextRequest & { nextauth: any }) {
    const token = req.nextauth?.token
    const pathname = req.nextUrl.pathname

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
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // CRITICAL: Middleware de seguridad multi-tenant
    // Agregar organizationId al header para uso en API routes
    if (token?.organizationId) {
      const requestHeaders = new Headers(req.headers)
      requestHeaders.set('x-organization-id', token.organizationId)
      requestHeaders.set('x-user-role', token.role)
      requestHeaders.set('x-user-id', token.sub!)

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
        // Permitir acceso si hay token o si es ruta pública
        const isPublicRoute = ['/auth/login', '/auth/register', '/auth/organization-setup'].some(
          route => req.nextUrl.pathname.startsWith(route)
        )
        return !!token || isPublicRoute
      },
    },
  }
)

// Configurar las rutas que el middleware debe procesar
export const config = {
  matcher: [
    // Excluir archivos estáticos y API de NextAuth
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
    // Incluir rutas API específicas
    '/api/((?!auth).*)'
  ]
}
