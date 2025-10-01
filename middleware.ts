import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Definir rutas permitidas por rol
const roleRoutes: Record<string, string[]> = {
  AGENTE: [
    '/dashboard',
    '/inbox',
    '/contacts',
    '/api/contacts',
    '/api/conversations',
    '/api/messages',
  ],
  PROPIETARIO: [
    '/dashboard',
    '/inbox',
    '/contacts',
    '/organizations',
    '/knowledge-base',
    '/integrations',
    '/campaigns',
    '/billing',
    '/settings',
    '/api/*',
  ],
  SUPER_ADMIN: [
    '/*', // Acceso total
  ],
  DISTRIBUIDOR: [
    '/dashboard',
    '/contacts',
    '/campaigns',
    '/api/contacts',
    '/api/campaigns',
  ],
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Excluir rutas de autenticación del middleware
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  const userRole = token.role as string;

  // SUPER_ADMIN tiene acceso total
  if (userRole === 'SUPER_ADMIN') {
    return NextResponse.next();
  }

  // Verificar si el usuario tiene acceso a la ruta
  const allowedRoutes = roleRoutes[userRole] || [];
  const hasAccess = allowedRoutes.some(route => {
    if (route.endsWith('/*')) {
      return pathname.startsWith(route.slice(0, -2));
    }
    return pathname === route || pathname.startsWith(route + '/');
  });

  if (!hasAccess) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/inbox/:path*',
    '/contacts/:path*',
    '/organizations/:path*',
    '/knowledge-base/:path*',
    '/integrations/:path*',
    '/campaigns/:path*',
    '/billing/:path*',
    '/settings/:path*',
    '/api/contacts/:path*',
    '/api/conversations/:path*',
    '/api/messages/:path*',
    '/api/campaigns/:path*',
    '/api/organization/:path*',
    '/api/automations/:path*',
    '/api/whatsapp/:path*',
  ],
};
