

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OrganizationsTable } from './organizations-table'
import { HierarchyGuard } from '@/components/hierarchy/hierarchy-guard'
import { 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  Activity,
  Server
} from 'lucide-react'

export function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <HierarchyGuard allowedRoles={['SUPER_ADMIN']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header mejorado */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8">
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8" />
                <div>
                  <h1 className="text-3xl font-bold">
                    Panel de Super Administrador
                  </h1>
                  <p className="text-red-100 mt-2">
                    Control total de la plataforma COMODÍN IA
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="organizations">Organizaciones</TabsTrigger>
              <TabsTrigger value="users">Usuarios</TabsTrigger>
              <TabsTrigger value="system">Sistema</TabsTrigger>
              <TabsTrigger value="billing">Facturación</TabsTrigger>
              <TabsTrigger value="settings">Configuración</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards mejoradas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Organizaciones</CardTitle>
                    <Building2 className="h-5 w-5 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">1,234</div>
                    <div className="flex items-center text-xs text-muted-foreground mt-2">
                      <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                      +12% desde el mes pasado
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
                    <Users className="h-5 w-5 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">8,456</div>
                    <div className="flex items-center text-xs text-muted-foreground mt-2">
                      <Activity className="h-3 w-3 mr-1 text-green-500" />
                      +5% desde el mes pasado
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-yellow-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ingresos Mensuales</CardTitle>
                    <DollarSign className="h-5 w-5 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">$125,430</div>
                    <div className="flex items-center text-xs text-muted-foreground mt-2">
                      <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                      +18% desde el mes pasado
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Estado del Sistema</CardTitle>
                    <Server className="h-5 w-5 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">99.9%</div>
                    <div className="flex items-center text-xs text-muted-foreground mt-2">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                      Uptime este mes
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Distribución por planes */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Planes</CardTitle>
                  <CardDescription>
                    Organizaciones por tipo de suscripción
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-gray-600">2,456</div>
                      <div className="text-sm text-gray-500">Free</div>
                      <div className="text-xs text-gray-400 mt-1">68%</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">856</div>
                      <div className="text-sm text-gray-500">Starter</div>
                      <div className="text-xs text-gray-400 mt-1">24%</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">312</div>
                      <div className="text-sm text-gray-500">Growth</div>
                      <div className="text-xs text-gray-400 mt-1">9%</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">66</div>
                      <div className="text-sm text-gray-500">Enterprise</div>
                      <div className="text-xs text-gray-400 mt-1">2%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actividad reciente mejorada */}
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
                      { type: 'success', message: 'Nueva organización registrada: TechCorp México', time: 'Hace 2 min', user: 'Sistema' },
                      { type: 'warning', message: 'Organización suspendida: BadCompany Ltd por falta de pago', time: 'Hace 15 min', user: 'Admin Carlos' },
                      { type: 'info', message: 'Actualización del sistema v2.1.3 completada exitosamente', time: 'Hace 1 hora', user: 'Sistema' },
                      { type: 'success', message: 'Nuevo distribuidor aprobado: María González - ID: DIST-2024-001', time: 'Hace 2 horas', user: 'Admin Luis' },
                      { type: 'error', message: 'Error de conexión reportado en WhatsApp Business API', time: 'Hace 3 horas', user: 'Sistema' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {activity.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                          {activity.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                          {activity.type === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
                          {activity.type === 'info' && <Settings className="h-5 w-5 text-blue-500" />}
                          <div>
                            <span className="text-sm font-medium">{activity.message}</span>
                            <div className="text-xs text-gray-500 mt-1">
                              Por {activity.user} • {activity.time}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Organizations Tab con tabla mejorada */}
            <TabsContent value="organizations">
              <OrganizationsTable />
            </TabsContent>

            {/* Users Tab mejorado */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Usuarios</CardTitle>
                  <CardDescription>
                    Distribución y gestión de usuarios por rol en toda la plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Estadísticas por rol */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="p-4 border rounded-lg text-center bg-red-50 border-red-200">
                        <div className="flex items-center justify-center mb-2">
                          <Shield className="h-6 w-6 text-red-600" />
                        </div>
                        <h4 className="font-semibold text-lg text-red-700">Super Admins</h4>
                        <p className="text-3xl font-bold text-red-600">5</p>
                        <p className="text-xs text-red-500 mt-1">Control total</p>
                      </div>
                      <div className="p-4 border rounded-lg text-center bg-purple-50 border-purple-200">
                        <div className="flex items-center justify-center mb-2">
                          <Building2 className="h-6 w-6 text-purple-600" />
                        </div>
                        <h4 className="font-semibold text-lg text-purple-700">Distribuidores</h4>
                        <p className="text-3xl font-bold text-purple-600">123</p>
                        <p className="text-xs text-purple-500 mt-1">Multi-tenant</p>
                      </div>
                      <div className="p-4 border rounded-lg text-center bg-blue-50 border-blue-200">
                        <div className="flex items-center justify-center mb-2">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <h4 className="font-semibold text-lg text-blue-700">Propietarios</h4>
                        <p className="text-3xl font-bold text-blue-600">1,234</p>
                        <p className="text-xs text-blue-500 mt-1">Admin org.</p>
                      </div>
                      <div className="p-4 border rounded-lg text-center bg-green-50 border-green-200">
                        <div className="flex items-center justify-center mb-2">
                          <Settings className="h-6 w-6 text-green-600" />
                        </div>
                        <h4 className="font-semibold text-lg text-green-700">Agentes</h4>
                        <p className="text-3xl font-bold text-green-600">6,789</p>
                        <p className="text-xs text-green-500 mt-1">Operativo</p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3">Usuarios Recientes</h4>
                      <div className="space-y-2">
                        {[
                          { name: 'Carlos López', email: 'carlos@techcorp.mx', role: 'PROPIETARIO', org: 'TechCorp México', date: 'Hoy', status: 'active' },
                          { name: 'María García', email: 'maria@marketing.com', role: 'AGENTE', org: 'Marketing Pro', date: 'Ayer', status: 'active' },
                          { name: 'Luis Rodríguez', email: 'luis@distribucion.com', role: 'DISTRIBUIDOR', org: 'Mi Distribución', date: 'Hace 2 días', status: 'pending' }
                        ].map((user, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <p className="font-semibold">{user.name}</p>
                              <p className="text-sm text-gray-600">{user.email} • {user.org}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={user.role === 'SUPER_ADMIN' ? 'destructive' : user.role === 'DISTRIBUIDOR' ? 'secondary' : 'default'}>
                                {user.role}
                              </Badge>
                              <Badge variant={user.status === 'active' ? 'default' : 'outline'}>
                                {user.status === 'active' ? 'Activo' : 'Pendiente'}
                              </Badge>
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

            {/* System Tab nuevo */}
            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estado del Sistema</CardTitle>
                  <CardDescription>
                    Monitoreo de la salud y rendimiento de la plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">API Principal</span>
                        <Badge className="bg-green-100 text-green-800">Operativo</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        Uptime: 99.9% | Respuesta: 120ms
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Base de Datos</span>
                        <Badge className="bg-green-100 text-green-800">Saludable</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        Conexiones: 45/100 | Latencia: 8ms
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">WhatsApp API</span>
                        <Badge className="bg-yellow-100 text-yellow-800">Degradado</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        Rate limit: 80% | Última sincronización: 5min
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Resto de tabs existentes */}
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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </HierarchyGuard>
  )
}

