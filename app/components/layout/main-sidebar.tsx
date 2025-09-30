
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { 
  Home, 
  Inbox, 
  MessageSquare, 
  Users, 
  BarChart3, 
  BookOpen,
  Settings, 
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Building,
  Wallet,
  Bot,
  TestTube2,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home
  },
  {
    name: 'Bandeja de Entrada',
    href: '/inbox',
    icon: Inbox,
    description: 'CRM'
  },
  {
    name: 'Campañas',
    href: '/campaigns',
    icon: MessageSquare
  },
  {
    name: 'Entrenar IA',
    href: '/knowledge-base',
    icon: BookOpen
  },
  {
    name: 'Seguimientos',
    href: '/follow-ups',
    icon: Clock,
    description: 'Automáticos'
  },
  {
    name: 'Pruebas de IA',
    href: '/crm/ai-testing',
    icon: TestTube2,
    description: 'Resolutiva'
  },
  {
    name: 'Contactos',
    href: '/contacts',
    icon: Users
  },
  {
    name: 'Reportes',
    href: '/reports',
    icon: BarChart3
  }
]

interface MainSidebarProps {
  className?: string
}

export function MainSidebar({ className }: MainSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession() || {}

  // Persisir estado del sidebar en localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved !== null) {
      setCollapsed(JSON.parse(saved))
    }
  }, [])

  const toggleSidebar = () => {
    const newState = !collapsed
    setCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState))
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className={cn(
      "flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header con toggle */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">COMODÍN IA</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="p-1.5"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navegación Principal */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}>
                <Icon className={cn("h-5 w-5", collapsed && "h-8 w-8")} />
                {!collapsed && (
                  <div>
                    <div>{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-gray-500">{item.description}</div>
                    )}
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer con configuración y usuario */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        {/* Cartera Virtual */}
        {session?.user && (
          <Link href="/wallet">
            <div className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors",
              collapsed && "justify-center",
              pathname === '/wallet' && "bg-blue-100 text-blue-700"
            )}>
              <Wallet className={cn("h-5 w-5", collapsed && "h-8 w-8")} />
              {!collapsed && <span>Cartera Virtual</span>}
            </div>
          </Link>
        )}

        {/* Configuración */}
        <Link href="/settings">
          <div className={cn(
            "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors",
            collapsed && "justify-center",
            pathname === '/settings' && "bg-blue-100 text-blue-700"
          )}>
            <Settings className={cn("h-5 w-5", collapsed && "h-8 w-8")} />
            {!collapsed && <span>Configuración</span>}
          </div>
        </Link>

        {/* Theme Toggle */}
        <div className={cn(
          "flex items-center space-x-3 px-3 py-2",
          collapsed && "justify-center"
        )}>
          <ThemeToggle />
          {!collapsed && <span className="text-sm font-medium text-gray-700">Tema</span>}
        </div>

        {/* Perfil de Usuario */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={cn(
              "w-full justify-start px-3 py-2 h-auto",
              collapsed && "px-2 justify-center"
            )}>
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image || ''} />
                  <AvatarFallback>
                    {session?.user?.name ? getUserInitials(session.user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {session?.user?.name || 'Usuario'}
                    </span>
                    <span className="text-xs text-gray-500 truncate">
                      {(session?.user as any)?.role || 'AGENTE'}
                    </span>
                  </div>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/organization')}>
              <Building className="mr-2 h-4 w-4" />
              <span>Organización</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
