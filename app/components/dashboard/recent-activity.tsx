
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/db'
import { UserPlus, Building, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface RecentActivityProps {
  organizationId: string
}

export async function RecentActivity({ organizationId }: RecentActivityProps) {
  // Obtener actividad reciente de la organización
  const recentUsers = await prisma.user.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      fullName: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      lastLogin: true
    }
  })

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      createdAt: true,
      name: true
    }
  })

  // Simular actividades para mostrar el diseño
  const activities = [
    {
      type: 'organization',
      title: `Organización "${organization?.name}" creada`,
      description: 'Se estableció la cuenta multi-tenant',
      timestamp: organization?.createdAt || new Date(),
      icon: Building,
      badge: 'Sistema'
    },
    ...recentUsers.map(user => ({
      type: 'user',
      title: `Usuario ${user.fullName || user.name} registrado`,
      description: `Rol: ${user.role} - ${user.email}`,
      timestamp: user.createdAt,
      icon: UserPlus,
      badge: user.role
    }))
  ]

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">Actividad Reciente</CardTitle>
        <CardDescription>
          Últimos eventos en tu organización
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No hay actividad reciente</p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex-shrink-0 mt-1">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <activity.icon className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {activity.badge}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mb-1">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(activity.timestamp, { 
                    addSuffix: true, 
                    locale: es 
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
