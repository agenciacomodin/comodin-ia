
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Plus, 
  Settings, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  ShoppingCart,
  Users,
  BarChart3,
  Puzzle,
  ExternalLink,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  IntegrationWithDetails,
  OrganizationIntegrationDetails,
  IntegrationsStats,
  INTEGRATION_TYPE_LABELS,
  INTEGRATION_STATUS_LABELS,
  INTEGRATION_STATUS_COLORS,
  ECOMMERCE_CONFIGS
} from '@/lib/types'
import { IntegrationConnectionDialog } from './integration-connection-dialog'
import { toast } from 'react-hot-toast'

interface IntegrationsManagerProps {
  organizationId: string
}

export function IntegrationsManager({ organizationId }: IntegrationsManagerProps) {
  const [integrations, setIntegrations] = useState<IntegrationWithDetails[]>([])
  const [connections, setConnections] = useState<OrganizationIntegrationDetails[]>([])
  const [stats, setStats] = useState<IntegrationsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationWithDetails | null>(null)

  // Cargar datos iniciales
  useEffect(() => {
    loadIntegrations()
    loadConnections()
    loadStats()
  }, [organizationId])

  const loadIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations')
      if (response.ok) {
        const data = await response.json()
        setIntegrations(data.integrations || [])
      }
    } catch (error) {
      console.error('Error loading integrations:', error)
      toast.error('Error al cargar integraciones')
    }
  }

  const loadConnections = async () => {
    try {
      const response = await fetch(`/api/integrations/connections`)
      if (response.ok) {
        const data = await response.json()
        setConnections(data.connections || [])
      }
    } catch (error) {
      console.error('Error loading connections:', error)
      toast.error('Error al cargar conexiones')
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch(`/api/integrations/stats`)
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar integraciones
  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || integration.type === selectedType
    return matchesSearch && matchesType
  })

  // Obtener estado de conexión
  const getConnectionStatus = (integrationId: string) => {
    const connection = connections.find(c => c.integrationId === integrationId)
    return connection?.status || 'AVAILABLE'
  }

  // Obtener ID de conexión
  const getConnectionId = (integrationId: string) => {
    const connection = connections.find(c => c.integrationId === integrationId)
    return connection?.id
  }

  // Manejar conexión
  const handleConnect = (integration: IntegrationWithDetails) => {
    setSelectedIntegration(integration)
    setConnectionDialogOpen(true)
  }

  // Manejar desconexión
  const handleDisconnect = async (integrationId: string, connectionId: string) => {
    if (!confirm('¿Estás seguro de que deseas desconectar esta integración?')) return

    try {
      const response = await fetch(`/api/integrations/connections/${connectionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadConnections()
        await loadStats()
        toast.success('Integración desconectada exitosamente')
      } else {
        throw new Error('Error al desconectar')
      }
    } catch (error) {
      console.error('Error disconnecting:', error)
      toast.error('Error al desconectar la integración')
    }
  }

  // Renderizar ícono de tipo
  const renderTypeIcon = (type: string) => {
    switch (type) {
      case 'ECOMMERCE':
        return <ShoppingCart className="w-5 h-5" />
      case 'CRM':
        return <Users className="w-5 h-5" />
      case 'ANALYTICS':
        return <BarChart3 className="w-5 h-5" />
      default:
        return <Puzzle className="w-5 h-5" />
    }
  }

  // Renderizar ícono de estado
  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'ERROR':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'PENDING':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'DISCONNECTED':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <Settings className="w-4 h-4 text-gray-400" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Disponibles</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Puzzle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conectadas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.connected}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Con Errores</p>
                  <p className="text-2xl font-bold text-red-600">{stats.error}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">E-commerce</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.byType.ECOMMERCE || 0}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Disponibles</TabsTrigger>
          <TabsTrigger value="connected">Conectadas</TabsTrigger>
          <TabsTrigger value="activity">Actividad</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-6">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar integraciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los tipos</option>
              <option value="ECOMMERCE">E-commerce</option>
              <option value="CRM">CRM</option>
              <option value="ERP">ERP</option>
              <option value="ANALYTICS">Análisis</option>
              <option value="MARKETING">Marketing</option>
            </select>
          </div>

          {/* Grid de integraciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => {
              const status = getConnectionStatus(integration.id)
              const connectionId = getConnectionId(integration.id)
              const isConnected = status === 'CONNECTED'

              return (
                <Card key={integration.id} className="relative overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "w-12 h-12 rounded-lg flex items-center justify-center",
                          integration.brandColor ? `bg-[${integration.brandColor}]` : "bg-gray-100"
                        )}>
                          {renderTypeIcon(integration.type)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{integration.displayName}</CardTitle>
                          <p className="text-sm text-gray-500">
                            {INTEGRATION_TYPE_LABELS[integration.type]}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {renderStatusIcon(status)}
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs",
                            status === 'CONNECTED' && "bg-green-100 text-green-800",
                            status === 'ERROR' && "bg-red-100 text-red-800",
                            status === 'PENDING' && "bg-blue-100 text-blue-800"
                          )}
                        >
                          {INTEGRATION_STATUS_LABELS[status]}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-4">
                    <CardDescription className="mb-4">
                      {integration.description}
                    </CardDescription>

                    <div className="space-y-3">
                      {/* Funcionalidades */}
                      {integration.supportedFeatures && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Funcionalidades:</p>
                          <div className="flex flex-wrap gap-1">
                            {integration.supportedFeatures.map((feature: string) => (
                              <Badge key={feature} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Botones de acción */}
                      <div className="flex gap-2 pt-2">
                        {isConnected ? (
                          <>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Settings className="w-4 h-4 mr-2" />
                              Configurar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => connectionId && handleDisconnect(integration.id, connectionId)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() => handleConnect(integration)}
                            size="sm"
                            className="flex-1"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Conectar
                          </Button>
                        )}
                        
                        {integration.documentation && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={integration.documentation} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredIntegrations.length === 0 && (
            <div className="text-center py-12">
              <Puzzle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron integraciones</h3>
              <p className="text-gray-500">
                Intenta ajustar los filtros de búsqueda
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="connected" className="space-y-6">
          {connections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {connections.map((connection) => (
                <Card key={connection.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          {renderTypeIcon(connection.integration.type)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {connection.name || connection.integration.displayName}
                          </CardTitle>
                          <p className="text-sm text-gray-500">
                            {connection.storeName || connection.integration.description}
                          </p>
                        </div>
                      </div>
                      {renderStatusIcon(connection.status)}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {connection.storeUrl && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">URL de la tienda:</p>
                          <p className="text-sm text-blue-600">{connection.storeUrl}</p>
                        </div>
                      )}
                      
                      {connection.lastSyncAt && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Última sincronización:</p>
                          <p className="text-sm text-gray-600">
                            {new Date(connection.lastSyncAt).toLocaleString('es-ES')}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Settings className="w-4 h-4 mr-2" />
                          Configurar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Activity className="w-4 h-4 mr-2" />
                          Sincronizar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnect(connection.integrationId, connection.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay integraciones conectadas</h3>
              <p className="text-gray-500">
                Conecta tu primera integración desde la pestaña "Disponibles"
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>
                Historial de eventos de sincronización y conexiones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <Activity className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.integrationName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={activity.status === 'success' ? 'default' : 'destructive'}
                          className="text-xs mb-1"
                        >
                          {activity.status}
                        </Badge>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString('es-ES')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-500">No hay actividad reciente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para conectar integraciones */}
      {selectedIntegration && (
        <IntegrationConnectionDialog
          integration={selectedIntegration}
          open={connectionDialogOpen}
          onOpenChange={setConnectionDialogOpen}
          onSuccess={() => {
            loadConnections()
            loadStats()
            setConnectionDialogOpen(false)
            setSelectedIntegration(null)
          }}
        />
      )}
    </div>
  )
}
