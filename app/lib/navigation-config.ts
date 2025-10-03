
// Configuración de navegación por rol - Actualizada según matriz de permisos P0
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
  Activity,
  AlertCircle,
  DollarSign,
  User,
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

/**
 * Configuración de navegación según la matriz de permisos P0:
 * 
 * SUPER_ADMIN: Solo panel de administración global (salud del sistema, clientes activos, 
 *              facturación global, alertas, logs). NO ve UX de cliente.
 * 
 * PROPIETARIO/ADMIN: Panel organizacional completo (bandeja entrada, contactos, campañas, 
 *                    billetera, informes, configuraciones).
 * 
 * DISTRIBUIDOR: Igual a Propietario pero SIN acceso a facturación y NO puede invitar usuarios.
 * 
 * AGENTE: Vistas operativas mínimas (bandeja entrada asignada, contactos, buscar conocimientos, 
 *         perfil). NO ve facturación, planes ni configuraciones críticas.
 */
export const navigation: NavSection[] = [
  // ========== NAVEGACIÓN PARA SUPER_ADMIN ==========
  {
    section: 'Administración Global',
    items: [
      {
        name: 'Panel Global',
        href: '/admin',
        icon: Shield,
        description: 'Dashboard de supervisión',
        roles: ['SUPER_ADMIN']
      },
      {
        name: 'Organizaciones',
        href: '/admin/organizations',
        icon: Building,
        description: 'Clientes activos',
        roles: ['SUPER_ADMIN']
      },
      {
        name: 'Usuarios Globales',
        href: '/admin/users',
        icon: UserCog,
        description: 'Gestión de usuarios',
        roles: ['SUPER_ADMIN']
      },
      {
        name: 'Facturación Global',
        href: '/admin/billing',
        icon: DollarSign,
        description: 'Ingresos y pagos',
        roles: ['SUPER_ADMIN']
      },
      {
        name: 'Salud del Sistema',
        href: '/admin/health',
        icon: Activity,
        description: 'Monitoreo y métricas',
        roles: ['SUPER_ADMIN']
      },
      {
        name: 'Alertas y Logs',
        href: '/admin/logs',
        icon: AlertCircle,
        description: 'Sistema de alertas',
        roles: ['SUPER_ADMIN']
      }
    ]
  },

  // ========== NAVEGACIÓN PARA PROPIETARIO/ADMIN Y DISTRIBUIDOR ==========
  {
    section: 'Principal',
    items: [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: Home,
        roles: ['PROPIETARIO', 'DISTRIBUIDOR', 'AGENTE']
      },
      {
        name: 'Bandeja de Entrada',
        href: '/inbox',
        icon: Inbox,
        description: 'CRM & Conversaciones',
        roles: ['PROPIETARIO', 'DISTRIBUIDOR', 'AGENTE']
      },
      {
        name: 'Contactos',
        href: '/contacts',
        icon: Users,
        description: 'Gestión de clientes',
        roles: ['PROPIETARIO', 'DISTRIBUIDOR', 'AGENTE']
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
        roles: ['PROPIETARIO', 'DISTRIBUIDOR']
      },
      {
        name: 'Seguimientos',
        href: '/follow-ups',
        icon: Clock,
        description: 'Automáticos',
        roles: ['PROPIETARIO', 'DISTRIBUIDOR']
      }
    ]
  },
  {
    section: 'Inteligencia Artificial',
    items: [
      {
        name: 'Entrenar IA',
        href: '/knowledge-base',
        icon: BookOpen,
        description: 'Base de conocimiento',
        roles: ['PROPIETARIO', 'DISTRIBUIDOR', 'AGENTE']
      },
      {
        name: 'IA Resolutiva',
        href: '/ai-testing',
        icon: TestTube2,
        description: 'Pruebas y evaluación',
        roles: ['PROPIETARIO', 'DISTRIBUIDOR']
      },
      {
        name: 'Cartera Virtual',
        href: '/wallet',
        icon: Wallet,
        description: 'Créditos de IA',
        roles: ['PROPIETARIO'] // Solo propietario, NO distribuidor
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
        roles: ['PROPIETARIO', 'DISTRIBUIDOR']
      },
      {
        name: 'Integraciones',
        href: '/integrations',
        icon: Plug,
        description: 'Conecta servicios',
        roles: ['PROPIETARIO', 'DISTRIBUIDOR']
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
        roles: ['PROPIETARIO', 'DISTRIBUIDOR']
      },
      {
        name: 'Facturación',
        href: '/payments',
        icon: CreditCard,
        description: 'Pagos y suscripciones',
        roles: ['PROPIETARIO'] // Solo propietario, NO distribuidor
      },
      {
        name: 'Planes',
        href: '/pricing',
        icon: Bot,
        description: 'Suscripciones',
        roles: ['PROPIETARIO'] // Solo propietario, NO distribuidor
      },
      {
        name: 'Equipo',
        href: '/team',
        icon: Users,
        description: 'Gestión de usuarios',
        roles: ['PROPIETARIO'] // Solo propietario puede invitar usuarios
      }
    ]
  },
  {
    section: 'Configuración',
    items: [
      {
        name: 'Configuración',
        href: '/settings',
        icon: Settings,
        description: 'Ajustes',
        roles: ['PROPIETARIO'] // Configuración completa solo para propietario
      },
      {
        name: 'Perfil',
        href: '/profile',
        icon: User,
        description: 'Mi perfil',
        roles: ['PROPIETARIO', 'DISTRIBUIDOR', 'AGENTE']
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

/**
 * Obtiene la ruta del dashboard principal según el rol
 */
export function getDashboardRouteForRole(role: string): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/admin' // Dashboard global
    case 'PROPIETARIO':
      return '/dashboard' // Dashboard organizacional
    case 'DISTRIBUIDOR':
      return '/dashboard' // Mismo dashboard que propietario
    case 'AGENTE':
    default:
      return '/inbox' // Agentes van directo a bandeja de entrada
  }
}

/**
 * Verifica si un rol tiene acceso a una ruta específica
 */
export function canRoleAccessRoute(role: string, route: string): boolean {
  const sections = getNavigationForRole(role)
  const allItems = sections.flatMap(section => section.items)
  
  // Verificar coincidencia exacta o si la ruta es un subrutas
  return allItems.some(item => 
    route === item.href || route.startsWith(item.href + '/')
  )
}
