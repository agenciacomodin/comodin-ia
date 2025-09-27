
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserPlus, Settings, MessageSquare, BarChart3, Users } from 'lucide-react'
import { UserRole } from '@prisma/client'

interface QuickActionsProps {
  userRole: UserRole
}

export function QuickActions({ userRole }: QuickActionsProps) {
  const getActionsForRole = (role: UserRole) => {
    const baseActions = [
      {
        title: 'Configurar WhatsApp',
        description: 'Conectar números de WhatsApp',
        icon: MessageSquare,
        action: () => alert('Próximamente: Integración WhatsApp'),
        variant: 'default' as const,
        disabled: true
      },
    ]

    if (role === 'PROPIETARIO' || role === 'SUPER_ADMIN') {
      return [
        {
          title: 'Invitar Usuario',
          description: 'Agregar nuevo miembro al equipo',
          icon: UserPlus,
          action: () => alert('Próximamente: Gestión de usuarios'),
          variant: 'default' as const,
          disabled: true
        },
        {
          title: 'Ver Reportes',
          description: 'Analytics y métricas',
          icon: BarChart3,
          action: () => alert('Próximamente: Sistema de reportes'),
          variant: 'outline' as const,
          disabled: true
        },
        ...baseActions,
        {
          title: 'Configuración',
          description: 'Ajustes de la organización',
          icon: Settings,
          action: () => alert('Próximamente: Configuración avanzada'),
          variant: 'outline' as const,
          disabled: true
        },
      ]
    }

    if (role === 'DISTRIBUIDOR') {
      return [
        {
          title: 'Gestionar Clientes',
          description: 'Ver y administrar tu cartera',
          icon: Users,
          action: () => alert('Próximamente: CRM de clientes'),
          variant: 'default' as const,
          disabled: true
        },
        ...baseActions,
      ]
    }

    return baseActions
  }

  const actions = getActionsForRole(userRole)

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
        <CardDescription>
          Herramientas disponibles para tu rol
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant}
            className="w-full justify-start h-auto p-4"
            onClick={action.action}
            disabled={action.disabled}
          >
            <div className="flex items-center space-x-3 w-full">
              <action.icon className="h-5 w-5 flex-shrink-0" />
              <div className="text-left flex-1">
                <div className="font-medium text-sm">
                  {action.title}
                </div>
                <div className="text-xs opacity-70">
                  {action.description}
                </div>
              </div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
