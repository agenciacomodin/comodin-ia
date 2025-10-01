'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Inbox, 
  Users, 
  Building2, 
  Brain, 
  Zap, 
  Send, 
  CreditCard, 
  Settings 
} from 'lucide-react';

const navigationByRole = {
  AGENTE: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Bandeja de entrada', href: '/inbox', icon: Inbox },
    { name: 'Contactos', href: '/contacts', icon: Users },
  ],
  PROPIETARIO: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Bandeja de entrada', href: '/inbox', icon: Inbox },
    { name: 'Contactos', href: '/contacts', icon: Users },
    { name: 'Organizaciones', href: '/organizations', icon: Building2 },
    { name: 'Entrenar IA', href: '/knowledge-base', icon: Brain },
    { name: 'Integraciones', href: '/integrations', icon: Zap },
    { name: 'Campañas', href: '/campaigns', icon: Send },
    { name: 'Facturación', href: '/billing', icon: CreditCard },
    { name: 'Configuración', href: '/settings', icon: Settings },
  ],
  SUPER_ADMIN: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Bandeja de entrada', href: '/inbox', icon: Inbox },
    { name: 'Contactos', href: '/contacts', icon: Users },
    { name: 'Organizaciones', href: '/organizations', icon: Building2 },
    { name: 'Entrenar IA', href: '/knowledge-base', icon: Brain },
    { name: 'Integraciones', href: '/integrations', icon: Zap },
    { name: 'Campañas', href: '/campaigns', icon: Send },
    { name: 'Facturación', href: '/billing', icon: CreditCard },
    { name: 'Configuración', href: '/settings', icon: Settings },
  ],
  DISTRIBUIDOR: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Contactos', href: '/contacts', icon: Users },
    { name: 'Campañas', href: '/campaigns', icon: Send },
  ],
};

export default function RoleBasedNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userRole = session?.user?.role || 'AGENTE';
  const navigation = navigationByRole[userRole as keyof typeof navigationByRole] || navigationByRole.AGENTE;

  return (
    <nav className="space-y-1 px-2">
      {navigation.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              isActive 
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
