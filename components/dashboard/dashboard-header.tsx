
'use client'

import { signOut } from 'next-auth/react'
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
import { Badge } from '@/components/ui/badge'
import { MessageSquare, LogOut, Settings, User, Building } from 'lucide-react'
import { ExtendedUser } from '@/lib/auth'
import { Organization } from '@prisma/client'

interface DashboardHeaderProps {
  organization: Organization
  user: ExtendedUser
}

export function DashboardHeader({ organization, user }: DashboardHeaderProps) {
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'destructive'
      case 'PROPIETARIO':
        return 'default'
      case 'DISTRIBUIDOR':
        return 'secondary'
      case 'AGENTE':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Super Admin'
      case 'PROPIETARIO':
        return 'Propietario'
      case 'DISTRIBUIDOR':
        return 'Distribuidor'
      case 'AGENTE':
        return 'Agente'
      default:
        return role
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y nombre de la organización */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">COMODÍN IA</span>
            </div>
            <div className="hidden sm:block h-6 w-px bg-gray-300" />
            <div className="hidden sm:flex items-center space-x-2">
              <Building className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {organization.name}
              </span>
              <Badge 
                variant={organization.status === 'ACTIVE' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {organization.status}
              </Badge>
            </div>
          </div>

          {/* Usuario y opciones */}
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 hover:bg-gray-50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image || ''} alt={user.name || ''} />
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-700">
                      {user.fullName || user.name}
                    </span>
                    <Badge 
                      variant={getRoleBadgeVariant(user.role)} 
                      className="text-xs"
                    >
                      {getRoleDisplayName(user.role)}
                    </Badge>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={() => signOut({ callbackUrl: '/auth/login' })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
