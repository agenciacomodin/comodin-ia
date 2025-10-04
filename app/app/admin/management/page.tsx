
'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, Users, AlertTriangle, Settings, 
  TrendingUp, Activity, Shield, Database 
} from 'lucide-react'

// Import components
import MonitoringDashboard from '@/components/admin/monitoring-dashboard'
import AlertsPanel from '@/components/admin/alerts-panel'
import BusinessAnalytics from '@/components/admin/business-analytics'
import UserManagement from '@/components/admin/user-management'

export default function AdminManagementPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Centro de Gestión COMODÍN IA</h1>
          <p className="text-muted-foreground mt-2">
            Panel integral de administración, monitoreo y crecimiento
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-green-600">
            <Activity className="w-4 h-4 mr-1" />
            Sistema Saludable
          </Badge>
          <Badge variant="secondary">
            Última actualización: {new Date().toLocaleTimeString()}
          </Badge>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estado del Sistema</p>
                <p className="text-2xl font-bold text-green-600">Óptimo</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usuarios Activos</p>
                <p className="text-2xl font-bold">1,247</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ingresos Hoy</p>
                <p className="text-2xl font-bold">$2,845</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alertas Activas</p>
                <p className="text-2xl font-bold text-yellow-600">3</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Vista General
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Monitoreo
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Alertas
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analíticas
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configuración
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewDashboard />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <MonitoringDashboard />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <AlertsPanel />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <BusinessAnalytics />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Overview Dashboard Component
function OverviewDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sistema de Gestión Actual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Estado Actual del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Aplicación Principal</span>
              <Badge className="bg-green-500">Funcionando</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Base de Datos</span>
              <Badge className="bg-green-500">Conectada</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>WhatsApp API</span>
              <Badge className="bg-green-500">Activa</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Servicios de Pago</span>
              <Badge className="bg-green-500">Operativos</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>IA Integration</span>
              <Badge className="bg-yellow-500">Monitoreando</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Acciones Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas de Gestión</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Activity className="w-4 h-4 mr-2" />
              Ejecutar Diagnóstico Completo
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Database className="w-4 h-4 mr-2" />
              Backup Manual de Emergencia
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Generar Reporte de Usuarios
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              Exportar Métricas de Negocio
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Shield className="w-4 h-4 mr-2" />
              Verificar Seguridad del Sistema
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Plan de Crecimiento */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Plan de Crecimiento COMODÍN IA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-600">📊 FASE 1: Optimización (Semana 1-2)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✅ Dashboard de monitoreo implementado</li>
                <li>✅ Sistema de alertas automáticas</li>
                <li>✅ Scripts de mantenimiento</li>
                <li>🔄 Optimización de performance</li>
                <li>🔄 Análisis de métricas</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-purple-600">🎯 FASE 2: Crecimiento (Semana 3-4)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>🔄 Estrategias de adquisición</li>
                <li>📱 Marketing automation</li>
                <li>🤖 Mejoras de IA</li>
                <li>🔗 Nuevas integraciones</li>
                <li>📈 Análisis de conversión</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-green-600">🌟 FASE 3: Escalabilidad (Mes 2+)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>⚡ Auto-scaling infrastructure</li>
                <li>🌍 Expansión regional</li>
                <li>🎨 Nuevas funcionalidades</li>
                <li>🤝 Partnerships estratégicos</li>
                <li>💼 Enterprise features</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// System Settings Component
function SystemSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Configuraciones de Servidor</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Modo de Producción</span>
                  <Badge className="bg-green-500">Activado</Badge>
                </div>
                <div className="flex justify-between">
                  <span>HTTPS/SSL</span>
                  <Badge className="bg-green-500">Configurado</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Backup Automático</span>
                  <Badge className="bg-green-500">Habilitado</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Monitoreo 24/7</span>
                  <Badge className="bg-green-500">Activo</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Integraciones Externas</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Stripe</span>
                  <Badge className="bg-green-500">Conectado</Badge>
                </div>
                <div className="flex justify-between">
                  <span>MercadoPago</span>
                  <Badge className="bg-green-500">Conectado</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Evolution API</span>
                  <Badge className="bg-green-500">Funcionando</Badge>
                </div>
                <div className="flex justify-between">
                  <span>AWS S3</span>
                  <Badge className="bg-green-500">Configurado</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Herramientas de Administración</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Database className="w-6 h-6 mb-2" />
              Gestión BD
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Activity className="w-6 h-6 mb-2" />
              Logs Sistema
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Shield className="w-6 h-6 mb-2" />
              Seguridad
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Settings className="w-6 h-6 mb-2" />
              Configurar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
