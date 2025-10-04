
'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, Search, Menu, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'

interface MainHeaderProps {
  onMenuClick?: () => void
}

const getPageInfo = (pathname: string) => {
  const routes = {
    '/dashboard': { title: 'Dashboard', subtitle: 'Resumen general de tu negocio' },
    '/inbox': { title: 'Bandeja de Entrada', subtitle: 'Centro unificado de comunicaciones y CRM' },
    '/campaigns': { title: 'Campañas', subtitle: 'Gestiona tus campañas de WhatsApp y mensajería masiva' },
    '/knowledge-base': { title: 'Entrenar IA', subtitle: 'Gestiona documentos, archivos y contenido para entrenar tu asistente IA' },
    '/integrations': { title: 'Integraciones', subtitle: 'Conecta tus herramientas y servicios favoritos' },
    '/follow-ups': { title: 'Seguimientos', subtitle: 'Gestiona el seguimiento automático de conversaciones abiertas para retomar charlas' },
    '/ai-testing': { title: 'Pruebas de IA', subtitle: 'Prueba y evalúa el rendimiento de la IA resolutiva con Knowledge Base' },
    '/contacts': { title: 'Contactos', subtitle: 'Gestiona tu base de clientes y leads' },
    '/reports': { title: 'Reportes', subtitle: 'Analítica y métricas de rendimiento de tu negocio' },
    '/payments': { title: 'Pagos', subtitle: 'Gestiona tus pagos y facturación' },
    '/pricing': { title: 'Planes', subtitle: 'Elige el plan perfecto para tu negocio' },
    '/settings': { title: 'Configuración', subtitle: 'Gestiona la configuración de tu cuenta y organización' },
    '/wallet': { title: 'Cartera Virtual', subtitle: 'Gestiona tu saldo y transacciones de IA' },
    '/profile': { title: 'Mi Perfil', subtitle: 'Gestiona tu información personal y configuración de cuenta' },
    '/organization': { title: 'Organización', subtitle: 'Gestiona la configuración y miembros de tu organización' },
  }
  
  return routes[pathname as keyof typeof routes] || { title: 'COMODÍN IA', subtitle: '' }
}

export function MainHeader({ onMenuClick }: MainHeaderProps) {
  const { data: session } = useSession() || {}
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const { title, subtitle } = getPageInfo(pathname)
  
  const [searchQuery, setSearchQuery] = useState('')
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Determinar dónde buscar según la página actual
      let searchPath = '/contacts'
      let searchParams = new URLSearchParams()
      searchParams.set('search', searchQuery.trim())
      
      if (pathname.includes('/inbox')) {
        searchPath = '/inbox'
      } else if (pathname.includes('/campaigns')) {
        searchPath = '/campaigns'
      } else if (pathname.includes('/knowledge-base')) {
        searchPath = '/knowledge-base'
      } else if (pathname.includes('/reports')) {
        searchPath = '/reports'
      }
      
      router.push(`${searchPath}?${searchParams.toString()}`)
      toast({
        title: "Búsqueda realizada",
        description: `Buscando "${searchQuery}" en ${title}`,
      })
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Barra de búsqueda */}
          <form onSubmit={handleSearch} className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar..."
              className="pl-10 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Notificaciones */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </Button>

          {/* Botón de cerrar sesión rápido */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" title="Cerrar Sesión">
                <LogOut className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Información de organización */}
          {session?.user && (
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-sm font-medium text-gray-900">
                {(session.user as any)?.organizationName || 'Organización'}
              </span>
              <span className="text-xs text-gray-500">
                Plan: {(session.user as any)?.subscriptionPlan || 'Gratuito'}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
