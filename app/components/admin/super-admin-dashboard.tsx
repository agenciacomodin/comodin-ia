
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'

export function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Panel de Super Administrador
            </h1>
            <p className="text-gray-600 mt-2">
              Gestión completa de la plataforma COMODÍN IA
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="organizations">Organizaciones</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="billing">Facturación</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Organizaciones</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">
                    +12% desde el mes pasado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8,456</div>
                  <p className="text-xs text-muted-foreground">
                    +5% desde el mes pasado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos Mensuales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$125,430</div>
                  <p className="text-xs text-muted-foreground">
                    +18% desde el mes pasado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Crecimiento</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+25%</div>
                  <p className="text-xs text-muted-foreground">
                    Nuevas suscripciones
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente del Sistema</CardTitle>
                <CardDescription>
                  Últimos eventos importantes en la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'success', message: 'Nueva organización registrada: TechCorp', time: 'Hace 2 min' },
                    { type: 'warning', message: 'Organización suspendida: BadCompany Ltd', time: 'Hace 15 min' },
                    { type: 'info', message: 'Actualización del sistema completada', time: 'Hace 1 hora' },
                    { type: 'success', message: 'Nuevo distribuidor aprobado: María González', time: 'Hace 2 horas' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {activity.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {activity.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                        {activity.type === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
                        {activity.type === 'info' && <Settings className="h-5 w-5 text-blue-500" />}
                        <span className="text-sm">{activity.message}</span>
                      </div>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Organizations Tab */}
          <TabsContent value="organizations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Organizaciones</CardTitle>
                <CardDescription>
                  Administra todas las organizaciones en la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Organizaciones Activas</h3>
                    <Button>Nueva Organización</Button>
                  </div>
                  
                  {/* Lista de organizaciones */}
                  <div className="space-y-2">
                    {[
                      { name: 'TechCorp', users: 45, status: 'ACTIVE', plan: 'Growth' },
                      { name: 'Marketing Pro', users: 12, status: 'TRIAL', plan: 'Starter' },
                      { name: 'Retail Solutions', users: 8, status: 'ACTIVE', plan: 'Starter' }
                    ].map((org, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h4 className="font-semibold">{org.name}</h4>
                            <p className="text-sm text-gray-600">{org.users} usuarios</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={org.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {org.status}
                          </Badge>
                          <Badge variant="outline">{org.plan}</Badge>
                          <Button variant="outline" size="sm">Ver</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Usuarios</CardTitle>
                <CardDescription>
                  Administra todos los usuarios de la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Usuarios por Rol</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                      <h4 className="font-semibold text-lg">Propietarios</h4>
                      <p className="text-2xl font-bold text-blue-600">1,234</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <h4 className="font-semibold text-lg">Agentes</h4>
                      <p className="text-2xl font-bold text-green-600">6,789</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <h4 className="font-semibold text-lg">Distribuidores</h4>
                      <p className="text-2xl font-bold text-purple-600">123</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <h4 className="font-semibold text-lg">Super Admins</h4>
                      <p className="text-2xl font-bold text-red-600">5</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Usuarios Recientes</h4>
                    <div className="space-y-2">
                      {[
                        { name: 'Carlos López', email: 'carlos@empresa.com', role: 'PROPIETARIO', org: 'TechCorp', date: 'Hoy' },
                        { name: 'María García', email: 'maria@marketing.com', role: 'AGENTE', org: 'Marketing Pro', date: 'Ayer' },
                        { name: 'Luis Rodríguez', email: 'luis@distribucion.com', role: 'DISTRIBUIDOR', org: 'Mi Distribución', date: 'Hace 2 días' }
                      ].map((user, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email} • {user.org}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge>{user.role}</Badge>
                            <span className="text-sm text-gray-500">{user.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Facturación</CardTitle>
                <CardDescription>
                  Monitorea ingresos y suscripciones de la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                      <h4 className="font-semibold">Ingresos del Mes</h4>
                      <p className="text-3xl font-bold text-green-600">$125,430</p>
                      <p className="text-sm text-gray-500">+18% vs mes anterior</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <h4 className="font-semibold">Suscripciones Activas</h4>
                      <p className="text-3xl font-bold text-blue-600">1,234</p>
                      <p className="text-sm text-gray-500">+12% este mes</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <h4 className="font-semibold">Tasa de Renovación</h4>
                      <p className="text-3xl font-bold text-purple-600">94%</p>
                      <p className="text-sm text-gray-500">Muy saludable</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Distribución por Planes</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 border rounded text-center">
                        <p className="font-semibold">Free</p>
                        <p className="text-lg font-bold">2,456</p>
                      </div>
                      <div className="p-3 border rounded text-center">
                        <p className="font-semibold">Starter</p>
                        <p className="text-lg font-bold">856</p>
                      </div>
                      <div className="p-3 border rounded text-center">
                        <p className="font-semibold">Growth</p>
                        <p className="text-lg font-bold">312</p>
                      </div>
                      <div className="p-3 border rounded text-center">
                        <p className="font-semibold">Enterprise</p>
                        <p className="text-lg font-bold">66</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Sistema</CardTitle>
                <CardDescription>
                  Parámetros generales de la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Configuración General</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">Registro de Nuevas Organizaciones</p>
                          <p className="text-sm text-gray-600">Permitir que nuevas empresas se registren</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Activo</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">Período de Prueba</p>
                          <p className="text-sm text-gray-600">Duración del trial gratuito</p>
                        </div>
                        <Badge variant="outline">14 días</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">Mantenimiento Programado</p>
                          <p className="text-sm text-gray-600">Próxima ventana de mantenimiento</p>
                        </div>
                        <Badge variant="secondary">No programado</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Límites del Sistema</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 border rounded">
                        <p className="font-medium">Máx. Usuarios por Org</p>
                        <p className="text-lg font-bold">100</p>
                      </div>
                      <div className="p-3 border rounded">
                        <p className="font-medium">Máx. Conversaciones/día</p>
                        <p className="text-lg font-bold">10,000</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

