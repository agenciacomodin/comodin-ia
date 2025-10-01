
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { 
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Building,
  Settings,
  Zap
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
import { getNavigationForRole } from '@/lib/navigation-config'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface OptimizedSidebarProps {
  className?: string
}

export function OptimizedSidebar({ className }: OptimizedSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession() || {}

  // Obtener rol del usuario
  const userRole = (session?.user as any)?.role || 'AGENTE'

  // Filtrar navegación por rol
  const navigationSections = getNavigationForRole(userRole)

  // Persistir estado del sidebar en localStorage
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
    await signOut({ callbackUrl: '/auth/login' })
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      SUPER_ADMIN: 'bg-red-600',
      PROPIETARIO: 'bg-purple-600',
      DISTRIBUIDOR: 'bg-blue-600',
      AGENTE: 'bg-green-600'
    }
    return colors[role as keyof typeof colors] || 'bg-gray-600'
  }

  const getRoleLabel = (role: string) => {
    const labels = {
      SUPER_ADMIN: 'Super Admin',
      PROPIETARIO: 'Propietario',
      DISTRIBUIDOR: 'Distribuidor',
      AGENTE: 'Agente'
    }
    return labels[role as keyof typeof labels] || role
  }

  return (
    <aside className={cn(
      "flex flex-col h-screen bg-card border-r border-border transition-all duration-300 relative",
      collapsed ? "w-20" : "w-64",
      className
    )}>
      {/* Header con Logo y Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                COMODÍN
              </span>
              <span className="text-xs block text-muted-foreground -mt-1">
                IA Platform
              </span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg mx-auto">
            <Zap className="h-5 w-5 text-white" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            "h-8 w-8 absolute -right-4 top-4 bg-background border border-border shadow-md rounded-full z-10",
            collapsed && "left-16"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navegación Principal */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {navigationSections.map((section) => (
          <div key={section.section}>
            {!collapsed && (
              <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section.section}
              </h3>
            )}
            {collapsed && <Separator className="my-2" />}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                const Icon = item.icon

                return (
                  <Link key={item.href} href={item.href}>
                    <div className={cn(
                      "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
                      collapsed && "justify-center px-2"
                    )}>
                      <Icon className={cn(
                        "h-5 w-5 flex-shrink-0",
                        isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                      )} />
                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{item.name}</div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground truncate">
                              {item.description}
                            </div>
                          )}
                        </div>
                      )}
                      {!collapsed && item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer con Usuario */}
      <div className="p-3 border-t border-border space-y-2">
        {/* Configuración */}
        <Link href="/settings">
          <div className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            pathname === '/settings' && "bg-primary text-primary-foreground",
            collapsed && "justify-center px-2"
          )}>
            <Settings className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Configuración</span>}
          </div>
        </Link>

        {/* Theme Toggle */}
        {!collapsed && (
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm font-medium">Tema</span>
            <ThemeToggle />
          </div>
        )}

        {/* Perfil de Usuario */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={cn(
              "w-full justify-start px-2 py-2 h-auto hover:bg-accent",
              collapsed && "px-2 justify-center"
            )}>
              <div className="flex items-center gap-3 w-full">
                <Avatar className="h-9 w-9 flex-shrink-0">
                  <AvatarImage src={session?.user?.image || ''} />
                  <AvatarFallback className={getRoleBadgeColor(userRole)}>
                    {session?.user?.name ? getUserInitials(session.user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-sm font-medium truncate">
                      {session?.user?.name || 'Usuario'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className={cn(
                        "text-xs h-5 px-1.5",
                        getRoleBadgeColor(userRole),
                        "text-white border-0"
                      )}>
                        {getRoleLabel(userRole)}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <div className="font-semibold">{session?.user?.name || 'Usuario'}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {session?.user?.email || 'email@example.com'}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Mi Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/organization')}>
              <Building className="mr-2 h-4 w-4" />
              <span>Organización</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
