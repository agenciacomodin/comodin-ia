
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Activity, Users, MessageSquare, CreditCard, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface SystemMetrics {
  activeUsers: number
  totalMessages: number
  totalRevenue: number
  systemHealth: 'healthy' | 'warning' | 'critical'
  services: {
    name: string
    status: 'up' | 'down' | 'degraded'
    responseTime: number
  }[]
  dailyStats: {
    date: string
    users: number
    messages: number
    revenue: number
  }[]
}

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/admin/system-metrics')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 30000) // 30 segundos
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up': case 'healthy': return 'text-green-500'
      case 'warning': case 'degraded': return 'text-yellow-500'
      case 'down': case 'critical': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'up': case 'healthy': return <CheckCircle className="w-4 h-4" />
      case 'warning': case 'degraded': return <AlertTriangle className="w-4 h-4" />
      case 'down': case 'critical': return <XCircle className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="text-center text-gray-500">
        Error cargando métricas del sistema
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Dashboard de Monitoreo</h2>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            Auto Refresh: {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button onClick={fetchMetrics} variant="outline">
            Actualizar
          </Button>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              En los últimos 30 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensajes Enviados</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalMessages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total del mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              MRR (Monthly Recurring Revenue)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado del Sistema</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold flex items-center gap-2 ${getStatusColor(metrics.systemHealth)}`}>
              {getStatusIcon(metrics.systemHealth)}
              {metrics.systemHealth.toUpperCase()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estado de Servicios */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Servicios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.services.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <span className={getStatusColor(service.status)}>
                    {getStatusIcon(service.status)}
                  </span>
                  <span className="font-medium">{service.name}</span>
                </div>
                <div className="text-right">
                  <Badge variant={service.status === 'up' ? 'default' : 'destructive'}>
                    {service.status.toUpperCase()}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    {service.responseTime}ms
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Tendencias */}
      <Card>
        <CardHeader>
          <CardTitle>Tendencias Diarias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.dailyStats.slice(-7).map((day, index) => (
              <div key={day.date} className="flex items-center justify-between">
                <span className="text-sm font-medium">{day.date}</span>
                <div className="flex gap-6 text-sm">
                  <span><Users className="w-4 h-4 inline mr-1" />{day.users}</span>
                  <span><MessageSquare className="w-4 h-4 inline mr-1" />{day.messages}</span>
                  <span><CreditCard className="w-4 h-4 inline mr-1" />${day.revenue}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
