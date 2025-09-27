
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getOrganizationStats } from '@/lib/multi-tenant'
import { Users, MessageSquare, TrendingUp, Zap } from 'lucide-react'

interface DashboardStatsProps {
  organizationId: string
}

export async function DashboardStats({ organizationId }: DashboardStatsProps) {
  const stats = await getOrganizationStats(organizationId)

  const statsData = [
    {
      title: 'Usuarios Totales',
      value: stats.totalUsers,
      description: `${stats.activeUsers} activos`,
      icon: Users,
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Conversaciones',
      value: '0',
      description: 'WhatsApp integrado próximamente',
      icon: MessageSquare,
      trend: 'Próximo',
      trendUp: null
    },
    {
      title: 'Leads Generados',
      value: '0',
      description: 'CRM en desarrollo',
      icon: TrendingUp,
      trend: 'Próximo',
      trendUp: null
    },
    {
      title: 'Automatizaciones',
      value: '0',
      description: 'IA en desarrollo',
      icon: Zap,
      trend: 'Próximo',
      trendUp: null
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Resumen General</h2>
        <Badge variant="secondary">Micro-Iteración 1</Badge>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {statsData.map((stat, index) => (
          <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <CardDescription className="text-sm text-gray-600">
                {stat.description}
              </CardDescription>
              <div className="mt-2">
                <Badge 
                  variant={stat.trendUp === true ? 'default' : stat.trendUp === false ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {stat.trend}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
