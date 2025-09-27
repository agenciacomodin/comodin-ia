
import { getCurrentOrganization } from '@/lib/multi-tenant'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Permission } from '@/lib/permissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Inbox, MessageSquare, Users, Clock } from 'lucide-react'

export default async function InboxPage() {
  const { organization, user } = await getCurrentOrganization()

  return (
    <ProtectedRoute permissions={[Permission.VIEW_ASSIGNED_CONVERSATIONS, Permission.VIEW_ALL_CONVERSATIONS]}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Bandeja de Entrada</h1>
          <p className="text-gray-600 mt-1">Centro unificado de comunicaciones y CRM</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversaciones Activas</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                +12% desde ayer
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                Requieren respuesta
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nuevos Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                +3 desde ayer
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
              <Inbox className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4m</div>
              <p className="text-xs text-muted-foreground">
                Tiempo de respuesta
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Conversaciones Recientes</CardTitle>
              <CardDescription>
                Lista de conversaciones más recientes de WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Juan Pérez</p>
                    <p className="text-sm text-gray-600">¿Tienen disponibilidad para esta semana?</p>
                    <p className="text-xs text-gray-500">Hace 5 minutos</p>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>

                <div className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">María García</p>
                    <p className="text-sm text-gray-600">Excelente servicio, muy recomendado</p>
                    <p className="text-xs text-gray-500">Hace 15 minutos</p>
                  </div>
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                </div>

                <div className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Carlos Rodriguez</p>
                    <p className="text-sm text-gray-600">Necesito más información sobre los precios</p>
                    <p className="text-xs text-gray-500">Hace 1 hora</p>
                  </div>
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pipeline de Ventas</CardTitle>
              <CardDescription>
                Estado actual de oportunidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Prospecto</span>
                  <span className="text-sm font-medium">15</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '60%'}}></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Calificado</span>
                  <span className="text-sm font-medium">8</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{width: '40%'}}></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Propuesta</span>
                  <span className="text-sm font-medium">5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{width: '25%'}}></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Cerrado</span>
                  <span className="text-sm font-medium">3</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '15%'}}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
