
'use client'

import { Badge } from '@/components/ui/badge'
import { UserRole } from '@prisma/client'
import { Shield, Users, Building2, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RoleBadgeProps {
  role: UserRole
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

const roleConfig = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    icon: Shield,
    color: 'bg-red-100 text-red-800 border-red-200',
    description: 'Acceso total a la plataforma'
  },
  DISTRIBUIDOR: {
    label: 'Distribuidor',
    icon: Building2,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Gestiona múltiples organizaciones'
  },
  PROPIETARIO: {
    label: 'Propietario',
    icon: Users,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Administra su organización'
  },
  AGENTE: {
    label: 'Agente',
    icon: MessageCircle,
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'Atiende conversaciones asignadas'
  }
}

export function RoleBadge({ 
  role, 
  size = 'md', 
  showIcon = true,
  className 
}: RoleBadgeProps) {
  const config = roleConfig[role]
  const IconComponent = config.icon

  return (
    <Badge
      variant="outline"
      className={cn(
        config.color,
        {
          'text-xs px-2 py-1': size === 'sm',
          'text-sm px-2.5 py-1': size === 'md',
          'text-base px-3 py-1.5': size === 'lg'
        },
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        {showIcon && (
          <IconComponent className={cn(
            {
              'h-3 w-3': size === 'sm',
              'h-4 w-4': size === 'md',
              'h-5 w-5': size === 'lg'
            }
          )} />
        )}
        <span>{config.label}</span>
      </div>
    </Badge>
  )
}

export function RoleDescription({ role }: { role: UserRole }) {
  const config = roleConfig[role]
  
  return (
    <div className="flex items-start gap-3 p-3 border rounded-lg">
      <div className="p-2 rounded-full" style={{ backgroundColor: config.color.split(' ')[0].replace('bg-', '') + '20' }}>
        <config.icon className="h-5 w-5" style={{ color: config.color.split(' ')[1].replace('text-', '') }} />
      </div>
      <div>
        <h4 className="font-semibold text-sm">{config.label}</h4>
        <p className="text-sm text-gray-600">{config.description}</p>
      </div>
    </div>
  )
}
