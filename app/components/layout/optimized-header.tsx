
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, Search, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { OptimizedSidebar } from './optimized-sidebar'

interface OptimizedHeaderProps {
  className?: string
}

const pageInfo = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Resumen general de tu negocio' },
  '/inbox': { title: 'Bandeja de Entrada', subtitle: 'Centro de comunicaciones CRM' },
  '/campaigns': { title: 'Campañas', subtitle: 'Gestión de mensajería masiva' },
  '/knowledge-base': { title: 'Base de Conocimiento', subtitle: 'Entrena tu asistente IA' },
  '/integrations': { title: 'Integraciones', subtitle: 'Conecta servicios externos' },
  '/follow-ups': { title: 'Seguimientos', subtitle: 'Automatización de seguimientos' },
  '/ai-testing': { title: 'IA Resolutiva', subtitle: 'Pruebas y evaluación' },
  '/contacts': { title: 'Contactos', subtitle: 'Gestión de clientes' },
  '/reports': { title: 'Reportes', subtitle: 'Analytics y métricas' },
  '/payments': { title: 'Pagos', subtitle: 'Gestión de facturación' },
  '/pricing': { title: 'Planes', subtitle: 'Suscripciones y precios' },
  '/settings': { title: 'Configuración', subtitle: 'Ajustes de cuenta' },
  '/wallet': { title: 'Cartera Virtual', subtitle: 'Créditos de IA' },
  '/profile': { title: 'Mi Perfil', subtitle: 'Información personal' },
  '/organization': { title: 'Organización', subtitle: 'Configuración organizacional' },
  '/admin': { title: 'Admin Panel', subtitle: 'Panel de administración global' },
}

export function OptimizedHeader({ className }: OptimizedHeaderProps) {
  const { data: session } = useSession() || {}
  const pathname = usePathname()
  const router = useRouter()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Obtener información de la página
  const getCurrentPageInfo = () => {
    for (const [path, info] of Object.entries(pageInfo)) {
      if (pathname === path || pathname.startsWith(path + '/')) {
        return info
      }
    }
    return { title: 'COMODÍN IA', subtitle: '' }
  }
  
  const { title, subtitle } = getCurrentPageInfo()
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Determinar dónde buscar según la página actual
      let searchPath = '/contacts'
      
      if (pathname.includes('/inbox')) {
        searchPath = '/inbox'
      } else if (pathname.includes('/campaigns')) {
        searchPath = '/campaigns'
      } else if (pathname.includes('/knowledge-base')) {
        searchPath = '/knowledge-base'
      }
      
      const params = new URLSearchParams()
      params.set('search', searchQuery.trim())
      router.push(`${searchPath}?${params.toString()}`)
    }
  }

  return (
    <header className={cn(
      "sticky top-0 z-40 bg-background border-b border-border",
      className
    )}>
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Mobile Menu Button & Title */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Mobile Sidebar */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <OptimizedSidebar />
            </SheetContent>
          </Sheet>
          
          {/* Page Title */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg lg:text-2xl font-bold truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs lg:text-sm text-muted-foreground truncate hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Search, Notifications & User Info */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar..."
              className="pl-10 w-48 lg:w-64 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Mobile Search */}
          <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
            <Search className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Bell className="h-4 w-4" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-4">
                <h4 className="font-semibold mb-2">Notificaciones</h4>
                <div className="space-y-2">
                  <div className="p-2 rounded-lg bg-muted text-sm">
                    <p className="font-medium">Nueva conversación</p>
                    <p className="text-muted-foreground text-xs">Hace 5 minutos</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted text-sm">
                    <p className="font-medium">Campaña completada</p>
                    <p className="text-muted-foreground text-xs">Hace 1 hora</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted text-sm">
                    <p className="font-medium">Saldo bajo de IA</p>
                    <p className="text-muted-foreground text-xs">Hace 2 horas</p>
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Organization Info - Desktop Only */}
          {session?.user && (
            <div className="hidden xl:flex flex-col items-end">
              <span className="text-sm font-medium truncate max-w-[200px]">
                {(session.user as any)?.organizationName || 'Organización'}
              </span>
              <span className="text-xs text-muted-foreground">
                Plan: {(session.user as any)?.subscriptionPlan || 'Gratuito'}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
