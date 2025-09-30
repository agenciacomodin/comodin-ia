
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, TrendingDown, Users, DollarSign, 
  MessageSquare, Target, Calendar, BarChart3 
} from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

interface BusinessMetrics {
  growth: {
    userGrowth: number
    revenueGrowth: number
    messageGrowth: number
    retentionRate: number
  }
  kpis: {
    mrr: number
    arpu: number
    churnRate: number
    ltv: number
    cac: number
  }
  trends: {
    daily: any[]
    weekly: any[]
    monthly: any[]
  }
  userSegmentation: any[]
  topFeatures: any[]
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1']

export default function BusinessAnalytics() {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('7d')

  useEffect(() => {
    fetchBusinessMetrics()
  }, [timeframe])

  const fetchBusinessMetrics = async () => {
    try {
      const response = await fetch(`/api/admin/business-analytics?timeframe=${timeframe}`)
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error('Error fetching business metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!metrics) {
    return <div className="text-center text-gray-500">Error cargando analíticas</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Analíticas de Negocio</h2>
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map((period) => (
            <Button
              key={period}
              variant={timeframe === period ? "default" : "outline"}
              onClick={() => setTimeframe(period)}
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">MRR</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.kpis.mrr)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              {metrics.growth.revenueGrowth > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm ${metrics.growth.revenueGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatPercentage(Math.abs(metrics.growth.revenueGrowth))}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ARPU</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.kpis.arpu)}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Churn Rate</p>
                <p className="text-2xl font-bold">{formatPercentage(metrics.kpis.churnRate)}</p>
              </div>
              <Users className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">LTV</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.kpis.ltv)}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CAC</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.kpis.cac)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Tendencias */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Ingresos</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="segments">Segmentos</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Ingresos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={metrics.trends.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Crecimiento de Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={metrics.trends.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="newUsers" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="activeUsers" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Retención de Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500">
                      {formatPercentage(metrics.growth.retentionRate)}
                    </div>
                    <p className="text-sm text-muted-foreground">Tasa de Retención</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-semibold">85%</div>
                      <p className="text-xs text-muted-foreground">Día 1</p>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">68%</div>
                      <p className="text-xs text-muted-foreground">Día 7</p>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">45%</div>
                      <p className="text-xs text-muted-foreground">Día 30</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Mensajes por Día</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={metrics.trends.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="messages" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Features Más Utilizadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.topFeatures.map((feature, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{feature.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{width: `${feature.usage}%`}}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{feature.usage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="segments">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Segmentación de Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={metrics.userSegmentation}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {metrics.userSegmentation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas por Segmento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.userSegmentation.map((segment, index) => (
                    <div key={index} className="border rounded p-3">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{segment.name}</h4>
                        <Badge variant="outline">{segment.value} usuarios</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">ARPU:</span>
                          <div className="font-semibold">{formatCurrency(segment.arpu)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Retención:</span>
                          <div className="font-semibold">{formatPercentage(segment.retention)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Engagement:</span>
                          <div className="font-semibold">{segment.engagement}/10</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
