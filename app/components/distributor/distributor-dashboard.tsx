
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Organization } from '@prisma/client'
import { ExtendedUser } from '@/lib/auth'
import { 
  Users, 
  DollarSign, 
  Building2, 
  TrendingUp,
  Plus,
  Eye,
  Settings
} from 'lucide-react'

interface DistributorDashboardProps {
  organization: Organization
  user: ExtendedUser
}

export function DistributorDashboard({ organization, user }: DistributorDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Panel de Distribuidor
            </h1>
            <p className="text-gray-600 mt-2">
              ¡Hola {user.fullName || user.name}! Gestiona tus clientes y comisiones
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="clients">Mis Clientes</TabsTrigger>
            <TabsTrigger value="commissions">Comisiones</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    +2 este mes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-muted-foreground">
                    En todas tus organizaciones
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Comisiones del Mes</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$2,840</div>
                  <p className="text-xs text-muted-foreground">
                    +15% vs mes anterior
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Crecimiento</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+18%</div>
                  <p className="text-xs text-muted-foreground">
                    Nuevas suscripciones
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
                <CardDescription>
                  Gestiona tus clientes de manera eficiente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-24 flex flex-col items-center justify-center space-y-2">
                    <Plus className="h-6 w-6" />
                    <span>Crear Nueva Organización</span>
                  </Button>
                  
                  <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
                    <Eye className="h-6 w-6" />
                    <span>Ver Reportes</span>
                  </Button>
                  
                  <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
                    <Settings className="h-6 w-6" />
                    <span>Configurar Comisiones</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Clients */}
            <Card>
              <CardHeader>
                <CardTitle>Clientes Recientes</CardTitle>
                <CardDescription>
                  Organizaciones creadas recientemente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Panadería La Esperanza', plan: 'Starter', status: 'TRIAL', users: 3, created: 'Hace 2 días' },
                    { name: 'Consultora Marketing', plan: 'Growth', status: 'ACTIVE', users: 8, created: 'Hace 1 semana' },
                    { name: 'Taller Mecánico San José', plan: 'Starter', status: 'ACTIVE', users: 2, created: 'Hace 2 semanas' }
                  ].map((client, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-semibold">{client.name}</h4>
                        <p className="text-sm text-gray-600">{client.users} usuarios • {client.created}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={client.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {client.status}
                        </Badge>
                        <Badge variant="outline">{client.plan}</Badge>
                        <Button variant="outline" size="sm">Ver</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mis Organizaciones Cliente</CardTitle>
                <CardDescription>
                  Administra todas las organizaciones que has creado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-4">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Organización
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600">Lista detallada de clientes en desarrollo...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commissions Tab */}
          <TabsContent value="commissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mis Comisiones</CardTitle>
                <CardDescription>
                  Seguimiento detallado de tus ganancias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Panel de comisiones en desarrollo...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Distribuidor</CardTitle>
                <CardDescription>
                  Configura tu perfil y preferencias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Configuración en desarrollo...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

