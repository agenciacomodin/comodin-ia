
// Configuración de navegación por rol
import { 
  Home, 
  Inbox, 
  MessageSquare, 
  Users, 
  BarChart3, 
  BookOpen,
  Settings, 
  Wallet,
  Clock,
  Plug,
  CreditCard,
  Smartphone,
  TestTube2,
  Building,
  Shield,
  Bot,
  UserCog,
  type LucideIcon
} from 'lucide-react'

export interface NavItem {
  name: string
  href: string
  icon: LucideIcon
  description?: string
  roles: ('SUPER_ADMIN' | 'PROPIETARIO' | 'DISTRIBUIDOR' | 'AGENTE')[]
  badge?: string
}

export interface NavSection {
  section: string
  items: NavItem[]
}

export const navigation: NavSection[] = [
  {
    section: 'Principal',
    items: [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: Home,
        roles: ['SUPER_ADMIN', 'PROPIETARIO', 'DISTRIBUIDOR', 'AGENTE']
      },
      {
        name: 'Bandeja de Entrada',
        href: '/inbox',
        icon: Inbox,
        description: 'CRM & Conversaciones',
        roles: ['SUPER_ADMIN', 'PROPIETARIO', 'DISTRIBUIDOR', 'AGENTE']
      },
      {
        name: 'Contactos',
        href: '/contacts',
        icon: Users,
        description: 'Gestión de clientes',
        roles: ['SUPER_ADMIN', 'PROPIETARIO', 'DISTRIBUIDOR', 'AGENTE']
      }
    ]
  },
  {
    section: 'Marketing & Ventas',
    items: [
      {
        name: 'Campañas',
        href: '/campaigns',
        icon: MessageSquare,
        description: 'Mensajería masiva',
        roles: ['SUPER_ADMIN', 'PROPIETARIO', 'DISTRIBUIDOR']
      },
      {
        name: 'Seguimientos',
        href: '/follow-ups',
        icon: Clock,
        description: 'Automáticos',
        roles: ['SUPER_ADMIN', 'PROPIETARIO', 'DISTRIBUIDOR']
      }
    ]
  },
  {
    section: 'Inteligencia Artificial',
    items: [
      {
        name: 'Base de Conocimiento',
        href: '/knowledge-base',
        icon: BookOpen,
        description: 'Entrenar IA',
        roles: ['SUPER_ADMIN', 'PROPIETARIO', 'DISTRIBUIDOR', 'AGENTE']
      },
      {
        name: 'IA Resolutiva',
        href: '/ai-testing',
        icon: TestTube2,
        description: 'Pruebas y evaluación',
        roles: ['SUPER_ADMIN', 'PROPIETARIO', 'DISTRIBUIDOR']
      },
      {
        name: 'Cartera Virtual',
        href: '/wallet',
        icon: Wallet,
        description: 'Créditos de IA',
        roles: ['SUPER_ADMIN', 'PROPIETARIO']
      }
    ]
  },
  {
    section: 'Integraciones',
    items: [
      {
        name: 'WhatsApp Business',
        href: '/settings/channels',
        icon: Smartphone,
        description: 'Evolution API',
        roles: ['SUPER_ADMIN', 'PROPIETARIO']
      },
      {
        name: 'Integraciones',
        href: '/integrations',
        icon: Plug,
        description: 'Conecta servicios',
        roles: ['SUPER_ADMIN', 'PROPIETARIO']
      }
    ]
  },
  {
    section: 'Reportes & Administración',
    items: [
      {
        name: 'Reportes',
        href: '/reports',
        icon: BarChart3,
        description: 'Analytics',
        roles: ['SUPER_ADMIN', 'PROPIETARIO', 'DISTRIBUIDOR']
      },
      {
        name: 'Pagos',
        href: '/payments',
        icon: CreditCard,
        description: 'Facturación',
        roles: ['SUPER_ADMIN', 'PROPIETARIO']
      },
      {
        name: 'Planes',
        href: '/pricing',
        icon: Bot,
        description: 'Suscripciones',
        roles: ['SUPER_ADMIN', 'PROPIETARIO']
      }
    ]
  },
  {
    section: 'Super Admin',
    items: [
      {
        name: 'Admin Panel',
        href: '/admin',
        icon: Shield,
        description: 'Panel global',
        roles: ['SUPER_ADMIN']
      },
      {
        name: 'Organizaciones',
        href: '/admin/organizations',
        icon: Building,
        description: 'Gestión global',
        roles: ['SUPER_ADMIN']
      },
      {
        name: 'Usuarios',
        href: '/admin/users',
        icon: UserCog,
        description: 'Gestión global',
        roles: ['SUPER_ADMIN']
      }
    ]
  }
]

// Filtrar navegación por rol
export function getNavigationForRole(role: string): NavSection[] {
  return navigation
    .map(section => ({
      ...section,
      items: section.items.filter(item => 
        item.roles.includes(role as any)
      )
    }))
    .filter(section => section.items.length > 0)
}
