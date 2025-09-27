
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Organization } from '@prisma/client'
import { ExtendedUser } from '@/lib/auth'
import { ConditionalRender } from '@/components/auth/conditional-render'
import { Permission } from '@/lib/permissions'
import { 
  MessageCircle, 
  Users, 
  DollarSign, 
  Settings,
  MessageSquare,
  Bot,
  TrendingUp,
  UserPlus,
  Zap
} from 'lucide-react'

interface OwnerDashboardProps {
  organization: Organization
  user: ExtendedUser
}

export function OwnerDashboard({ organization, user }: OwnerDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          ¡Hola {user.fullName || user.name}! 👋
        </h1>
        <p className="text-gray-600">
          Panel de control de <span className="font-semibold">{organization.name}</span>
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="conversations">Conversaciones</TabsTrigger>
          <TabsTrigger value="team">Equipo</TabsTrigger>
          <TabsTrigger value="automation">Automatización</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversaciones Activas</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">47</div>
                <p className="text-xs text-muted-foreground">
                  +12% desde ayer
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Miembros del Equipo</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  2 agentes activos
                </p>
              </CardContent>
            </Card>

            <ConditionalRender permissions={[Permission.VIEW_BILLING]}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Plan Actual</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Growth</div>
                  <p className="text-xs text-muted-foreground">
                    $49/mes • Renovación: 15 días
                  </p>
                </CardContent>
              </Card>
            </ConditionalRender>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Respuesta Promedio</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.3m</div>
                <p className="text-xs text-muted-foreground">
                  -30s desde la semana pasada
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>
                Accede rápidamente a las funciones más importantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ConditionalRender permissions={[Permission.MANAGE_WHATSAPP_CONFIG]}>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                    <MessageSquare className="h-6 w-6 text-green-600" />
                    <span className="text-sm">Configurar WhatsApp</span>
                  </Button>
                </ConditionalRender>
                
                <ConditionalRender permissions={[Permission.INVITE_USERS]}>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                    <UserPlus className="h-6 w-6 text-blue-600" />
                    <span className="text-sm">Invitar Agente</span>
                  </Button>
                </ConditionalRender>
                
                <ConditionalRender permissions={[Permission.CONFIGURE_AI]}>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                    <Bot className="h-6 w-6 text-purple-600" />
                    <span className="text-sm">Configurar IA</span>
                  </Button>
                </ConditionalRender>
                
                <ConditionalRender permissions={[Permission.MANAGE_ORGANIZATION]}>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                    <Settings className="h-6 w-6 text-gray-600" />
                    <span className="text-sm">Configuración</span>
                  </Button>
                </ConditionalRender>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversaciones Recientes</CardTitle>
                <CardDescription>
                  Últimas interacciones con clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { customer: 'María González', message: 'Consulta sobre productos', agent: 'Ana', time: 'Hace 5 min', status: 'active' },
                    { customer: 'Carlos López', message: 'Solicitud de cotización', agent: 'Luis', time: 'Hace 12 min', status: 'pending' },
                    { customer: 'Sofía Martínez', message: 'Seguimiento de pedido', agent: 'Ana', time: 'Hace 25 min', status: 'resolved' }
                  ].map((conversation, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold text-sm">{conversation.customer}</p>
                        <p className="text-sm text-gray-600">{conversation.message}</p>
                        <p className="text-xs text-gray-500">Agente: {conversation.agent} • {conversation.time}</p>
                      </div>
                      <Badge variant={
                        conversation.status === 'active' ? 'default' : 
                        conversation.status === 'pending' ? 'secondary' : 'outline'
                      }>
                        {conversation.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estado del Sistema</CardTitle>
                <CardDescription>
                  Conexiones y configuraciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">WhatsApp Business</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Conectado</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bot className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium">Asistente IA</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Activo</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Zap className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm font-medium">Automatización</span>
                    </div>
                    <Badge variant="secondary">3 reglas activas</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Otros tabs para desarrollo futuro */}
        <TabsContent value="conversations">
          <Card>
            <CardHeader>
              <CardTitle>Centro de Conversaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Módulo de conversaciones en desarrollo...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Equipo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Gestión de equipo en desarrollo...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle>Automatización e IA</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Configuración de automatización en desarrollo...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Panel de configuración en desarrollo...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}

