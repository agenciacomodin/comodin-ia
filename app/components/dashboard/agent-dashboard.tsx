
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Organization } from '@prisma/client'
import { ExtendedUser } from '@/lib/auth'
import { 
  MessageCircle, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Bot,
  Star
} from 'lucide-react'

interface AgentDashboardProps {
  organization: Organization
  user: ExtendedUser
}

export function AgentDashboard({ organization, user }: AgentDashboardProps) {
  const [activeTab, setActiveTab] = useState('conversations')

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          ¡Hola {user.fullName || user.name}! 👋
        </h1>
        <p className="text-gray-600">
          Agente de <span className="font-semibold">{organization.name}</span>
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="conversations">Mis Conversaciones</TabsTrigger>
          <TabsTrigger value="performance">Mi Rendimiento</TabsTrigger>
          <TabsTrigger value="tools">Herramientas IA</TabsTrigger>
        </TabsList>

        {/* Conversations Tab */}
        <TabsContent value="conversations" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Asignadas</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  Conversaciones activas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">
                  Requieren respuesta
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resueltas Hoy</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  +3 vs ayer
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tiempo Respuesta</CardTitle>
                <AlertCircle className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1.2m</div>
                <p className="text-xs text-muted-foreground">
                  Promedio hoy
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Active Conversations */}
          <Card>
            <CardHeader>
              <CardTitle>Conversaciones Activas</CardTitle>
              <CardDescription>
                Tus conversaciones asignadas que requieren atención
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { 
                    customer: 'María González', 
                    phone: '+52 555 123 4567',
                    lastMessage: 'Hola, tengo una pregunta sobre el producto', 
                    time: 'Hace 2 min', 
                    priority: 'high',
                    unread: 2
                  },
                  { 
                    customer: 'Carlos López', 
                    phone: '+52 555 987 6543',
                    lastMessage: '¿Pueden ayudarme con mi pedido?', 
                    time: 'Hace 15 min', 
                    priority: 'medium',
                    unread: 1
                  },
                  { 
                    customer: 'Ana Martínez', 
                    phone: '+52 555 456 7890',
                    lastMessage: 'Muchas gracias por la información', 
                    time: 'Hace 1h', 
                    priority: 'low',
                    unread: 0
                  }
                ].map((conversation, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-sm">{conversation.customer}</p>
                        <Badge variant={
                          conversation.priority === 'high' ? 'destructive' : 
                          conversation.priority === 'medium' ? 'default' : 'outline'
                        }>
                          {conversation.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{conversation.phone}</p>
                      <p className="text-sm text-gray-700">{conversation.lastMessage}</p>
                      <p className="text-xs text-gray-500">{conversation.time}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {conversation.unread > 0 && (
                        <Badge variant="default" className="bg-red-500">
                          {conversation.unread}
                        </Badge>
                      )}
                      <Button size="sm">Responder</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {/* Performance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversaciones Esta Semana</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">43</div>
                <p className="text-xs text-muted-foreground">
                  +8% vs semana pasada
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Satisfacción Cliente</CardTitle>
                <Star className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.8</div>
                <p className="text-xs text-muted-foreground">
                  ⭐⭐⭐⭐⭐ (24 reseñas)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1.8m</div>
                <p className="text-xs text-muted-foreground">
                  Por respuesta
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Details */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Rendimiento</CardTitle>
              <CardDescription>
                Tu desempeño en las últimas semanas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Gráficos de rendimiento en desarrollo...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Herramientas de IA</CardTitle>
              <CardDescription>
                Funciones inteligentes para mejorar tu productividad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <Bot className="h-6 w-6 text-purple-600" />
                    <h3 className="font-semibold">Respuestas Sugeridas</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    La IA analiza el mensaje y sugiere respuestas apropiadas
                  </p>
                  <Badge className="bg-green-100 text-green-800">Activo</Badge>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <Star className="h-6 w-6 text-yellow-600" />
                    <h3 className="font-semibold">Auto-Etiquetado</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Clasifica automáticamente las conversaciones por tipo
                  </p>
                  <Badge className="bg-green-100 text-green-800">Activo</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}

