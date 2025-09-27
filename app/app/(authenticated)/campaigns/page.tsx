
import { getCurrentOrganization } from '@/lib/multi-tenant'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Permission } from '@/lib/permissions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Plus, Send, Users, TrendingUp } from 'lucide-react'

export default async function CampaignsPage() {
  const { organization, user } = await getCurrentOrganization()

  return (
    <ProtectedRoute permissions={[Permission.MANAGE_CAMPAIGNS]}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campañas</h1>
            <p className="text-gray-600 mt-1">Gestiona tus campañas de WhatsApp y mensajería masiva</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Campaña
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campañas Activas</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                2 programadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mensajes Enviados</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">
                +180% desde el mes pasado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Apertura</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89.2%</div>
              <p className="text-xs text-muted-foreground">
                +2.1% desde ayer
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Respuestas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">324</div>
              <p className="text-xs text-muted-foreground">
                26% tasa de respuesta
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Campañas Recientes</CardTitle>
              <CardDescription>
                Lista de tus campañas más recientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">Promoción Black Friday</h3>
                      <Badge variant="secondary">Activa</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">450 contactos • 89% entregado</p>
                    <p className="text-xs text-gray-500 mt-1">Iniciada hace 2 horas</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">89.2%</p>
                    <p className="text-xs text-gray-500">Tasa apertura</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">Seguimiento Carritos Abandonados</h3>
                      <Badge variant="outline">Programada</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">127 contactos • Inicia en 30 min</p>
                    <p className="text-xs text-gray-500 mt-1">Programada para hoy 15:00</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">--</p>
                    <p className="text-xs text-gray-500">Pendiente</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">Newsletter Semanal</h3>
                      <Badge variant="default">Completada</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">823 contactos • 100% entregado</p>
                    <p className="text-xs text-gray-500 mt-1">Completada ayer</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">92.1%</p>
                    <p className="text-xs text-gray-500">Tasa apertura</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rendimiento por Tipo</CardTitle>
              <CardDescription>
                Comparativa de performance por categoría de campaña
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Promociones</span>
                    <span className="text-sm text-gray-600">91.2% apertura</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '91%'}}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Seguimiento</span>
                    <span className="text-sm text-gray-600">76.5% apertura</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '76%'}}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Informativo</span>
                    <span className="text-sm text-gray-600">84.3% apertura</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{width: '84%'}}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Recordatorios</span>
                    <span className="text-sm text-gray-600">68.9% apertura</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{width: '69%'}}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
