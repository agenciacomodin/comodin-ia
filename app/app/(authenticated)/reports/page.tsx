
import { getCurrentOrganization } from '@/lib/multi-tenant'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Permission } from '@/lib/permissions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  DollarSign, 
  Download,
  Calendar,
  Filter
} from 'lucide-react'

export default async function ReportsPage() {
  const { organization, user } = await getCurrentOrganization()

  return (
    <ProtectedRoute permissions={[Permission.VIEW_REPORTS]}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
            <p className="text-gray-600 mt-1">Analítica y métricas de rendimiento de tu negocio</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Período
            </Button>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversaciones</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3,247</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+18.2%</span> vs mes anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nuevos Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">428</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12.5%</span> vs mes anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa Conversión</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24.3%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-red-600">-2.1%</span> vs mes anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas Cerradas</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">104</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8.7%</span> vs mes anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$87.4k</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+15.3%</span> vs mes anterior
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Conversaciones por Día</CardTitle>
              <CardDescription>Volumen de conversaciones en los últimos 30 días</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-end justify-between px-4">
                {Array.from({ length: 30 }, (_, i) => {
                  const height = Math.random() * 250 + 50
                  return (
                    <div
                      key={i}
                      className="w-2 bg-blue-600 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
                      style={{ height: `${height}px` }}
                    />
                  )
                })}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Hace 30 días</span>
                <span>Hoy</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pipeline de Ventas</CardTitle>
              <CardDescription>Distribución de oportunidades por etapa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Prospecto</p>
                    <p className="text-sm text-gray-600">142 oportunidades</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$284.5k</p>
                    <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Calificado</p>
                    <p className="text-sm text-gray-600">89 oportunidades</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$156.2k</p>
                    <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '62%'}}></div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Propuesta</p>
                    <p className="text-sm text-gray-600">45 oportunidades</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$98.7k</p>
                    <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{width: '45%'}}></div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Cerrado Ganado</p>
                    <p className="text-sm text-gray-600">23 oportunidades</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$67.3k</p>
                    <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-emerald-600 h-2 rounded-full" style={{width: '30%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Agentes</CardTitle>
              <CardDescription>Rendimiento del equipo este mes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Ana Martínez</p>
                    <p className="text-sm text-gray-600">Agente Senior</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">87</p>
                    <p className="text-sm text-gray-600">conversaciones</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Luis García</p>
                    <p className="text-sm text-gray-600">Agente</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">73</p>
                    <p className="text-sm text-gray-600">conversaciones</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Carmen López</p>
                    <p className="text-sm text-gray-600">Agente</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">68</p>
                    <p className="text-sm text-gray-600">conversaciones</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Diego Ruiz</p>
                    <p className="text-sm text-gray-600">Agente Junior</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">52</p>
                    <p className="text-sm text-gray-600">conversaciones</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Canales de Comunicación</CardTitle>
              <CardDescription>Distribución de conversaciones por canal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">WhatsApp</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">2,847</p>
                    <p className="text-xs text-gray-600">87.6%</p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Email</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">289</p>
                    <p className="text-xs text-gray-600">8.9%</p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Teléfono</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">87</p>
                    <p className="text-xs text-gray-600">2.7%</p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Web Chat</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">24</p>
                    <p className="text-xs text-gray-600">0.8%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Horarios Pico</CardTitle>
              <CardDescription>Distribución de actividad por horas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.from({ length: 12 }, (_, i) => {
                  const hour = i + 9
                  const activity = Math.random() * 100
                  return (
                    <div key={i} className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600 w-8">
                        {hour}:00
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${activity}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-8">
                        {Math.round(activity)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
