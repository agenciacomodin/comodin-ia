
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Plug, 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock,
  Plus,
  ShoppingCart,
  CreditCard,
  BarChart3,
  Mail,
  Users,
  ExternalLink,
  Eye,
  Trash2,
  Power,
  PowerOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { 
  IntegrationType, 
  IntegrationStatus, 
  EcommercePlatform 
} from '@/lib/types'

interface Integration {
  id: string
  name: string
  displayName: string
  description: string
  type: IntegrationType
  platform?: EcommercePlatform
  iconUrl?: string
  brandColor?: string
  isActive: boolean
  authType: string
  authFields: any
  supportedFeatures: any
  documentation?: string
}

interface OrganizationIntegration {
  id: string
  integration: Integration
  status: IntegrationStatus
  name?: string
  config: any
  storeUrl?: string
  storeName?: string
  lastSyncAt?: string
  syncErrors?: any
  features?: any
}

const STATUS_COLORS = {
  AVAILABLE: 'bg-gray-100 text-gray-800',
  CONNECTED: 'bg-green-100 text-green-800',
  DISCONNECTED: 'bg-red-100 text-red-800',
  ERROR: 'bg-red-100 text-red-800',
  PENDING: 'bg-yellow-100 text-yellow-800'
}

const STATUS_ICONS = {
  AVAILABLE: Clock,
  CONNECTED: CheckCircle,
  DISCONNECTED: XCircle,
  ERROR: AlertCircle,
  PENDING: Clock
}

const TYPE_ICONS = {
  ECOMMERCE: ShoppingCart,
  PAYMENT: CreditCard,
  ANALYTICS: BarChart3,
  EMAIL: Mail,
  CRM: Users
}

export default function IntegrationsPage() {
  const { data: session } = useSession() || {}
  const { toast } = useToast()

  // Estados principales
  const [availableIntegrations, setAvailableIntegrations] = useState<Integration[]>([])
  const [organizationIntegrations, setOrganizationIntegrations] = useState<OrganizationIntegration[]>([])
  const [loading, setLoading] = useState(true)

  // Estados para modales
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [connectForm, setConnectForm] = useState<any>({})
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    loadIntegrations()
  }, [])

  const loadIntegrations = async () => {
    try {
      setLoading(true)
      
      // Cargar integraciones disponibles
      const availableResponse = await fetch('/api/integrations/available')
      const availableResult = await availableResponse.json()
      
      // Cargar integraciones conectadas
      const connectedResponse = await fetch('/api/integrations/organization')
      const connectedResult = await connectedResponse.json()
      
      if (availableResult.success) {
        setAvailableIntegrations(availableResult.data)
      }
      
      if (connectedResult.success) {
        setOrganizationIntegrations(connectedResult.data)
      }
      
    } catch (error) {
      console.error('Error loading integrations:', error)
      toast({
        title: 'Error',
        description: 'Error cargando integraciones',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (integration: Integration) => {
    setSelectedIntegration(integration)
    setConnectForm({})
    setShowConnectModal(true)
  }

  const handleConnectSubmit = async () => {
    if (!selectedIntegration) return

    try {
      setConnecting(true)
      
      const response = await fetch('/api/integrations/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          integrationId: selectedIntegration.id,
          config: connectForm
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Éxito',
          description: 'Integración conectada correctamente'
        })
        setShowConnectModal(false)
        loadIntegrations()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Error conectando integración',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error de conexión',
        variant: 'destructive'
      })
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async (integrationId: string) => {
    if (!confirm('¿Estás seguro de que quieres desconectar esta integración?')) {
      return
    }

    try {
      const response = await fetch(`/api/integrations/organization/${integrationId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Éxito',
          description: 'Integración desconectada'
        })
        loadIntegrations()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Error desconectando integración',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error de conexión',
        variant: 'destructive'
      })
    }
  }

  const renderAuthFields = (integration: Integration) => {
    const fields = integration.authFields || {}
    
    return Object.entries(fields).map(([field, config]: [string, any]) => (
      <div key={field}>
        <Label htmlFor={field}>{config.label || field} {config.required && '*'}</Label>
        {config.type === 'textarea' ? (
          <Textarea
            id={field}
            placeholder={config.placeholder}
            value={connectForm[field] || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setConnectForm((prev: any) => ({ ...prev, [field]: e.target.value }))}
          />
        ) : config.type === 'select' ? (
          <Select 
            value={connectForm[field] || ''} 
            onValueChange={(value: string) => setConnectForm((prev: any) => ({ ...prev, [field]: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder={config.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {config.options?.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id={field}
            type={config.type || 'text'}
            placeholder={config.placeholder}
            value={connectForm[field] || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setConnectForm((prev: any) => ({ ...prev, [field]: e.target.value }))}
          />
        )}
        {config.description && (
          <p className="text-sm text-gray-500 mt-1">{config.description}</p>
        )}
      </div>
    ))
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integraciones</h1>
          <p className="text-gray-600 mt-1">
            Conecta COMODÍN IA con tus herramientas favoritas para potenciar tu negocio
          </p>
        </div>
        
        <Button onClick={loadIntegrations}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList>
          <TabsTrigger value="available">Disponibles</TabsTrigger>
          <TabsTrigger value="connected">Conectadas</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableIntegrations.map((integration) => {
              const TypeIcon = TYPE_ICONS[integration.type as keyof typeof TYPE_ICONS] || Plug
              const isConnected = organizationIntegrations.some(
                oi => oi.integration.id === integration.id && oi.status === 'CONNECTED'
              )
              
              return (
                <Card key={integration.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: integration.brandColor || '#f3f4f6' }}
                        >
                          <TypeIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{integration.displayName}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {integration.type.toLowerCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {integration.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {integration.supportedFeatures && Object.keys(integration.supportedFeatures).slice(0, 3).map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex space-x-2">
                      {isConnected ? (
                        <Button variant="outline" disabled className="flex-1">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Conectada
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleConnect(integration)}
                          className="flex-1"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Conectar
                        </Button>
                      )}
                      
                      {integration.documentation && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(integration.documentation, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                  
                  {isConnected && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Activa
                      </Badge>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="connected" className="space-y-6">
          {organizationIntegrations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Plug className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay integraciones conectadas
                </h3>
                <p className="text-gray-600 mb-4">
                  Conecta herramientas para potenciar tu flujo de trabajo
                </p>
                <Button onClick={() => (document.querySelector('[value="available"]') as HTMLElement)?.click()}>
                  Ver integraciones disponibles
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {organizationIntegrations.map((orgIntegration) => {
                const StatusIcon = STATUS_ICONS[orgIntegration.status]
                const TypeIcon = TYPE_ICONS[orgIntegration.integration.type as keyof typeof TYPE_ICONS] || Plug
                
                return (
                  <Card key={orgIntegration.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div 
                            className="p-3 rounded-lg"
                            style={{ backgroundColor: orgIntegration.integration.brandColor || '#f3f4f6' }}
                          >
                            <TypeIcon className="h-6 w-6 text-white" />
                          </div>
                          
                          <div>
                            <h3 className="font-medium text-lg">
                              {orgIntegration.name || orgIntegration.integration.displayName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {orgIntegration.integration.description}
                            </p>
                            {orgIntegration.storeUrl && (
                              <p className="text-sm text-blue-600 mt-1">
                                {orgIntegration.storeUrl}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <Badge className={STATUS_COLORS[orgIntegration.status]}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {orgIntegration.status}
                          </Badge>
                          
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDisconnect(orgIntegration.id)}
                            >
                              <PowerOff className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {orgIntegration.lastSyncAt && (
                        <div className="mt-4 text-sm text-gray-500">
                          Última sincronización: {new Date(orgIntegration.lastSyncAt).toLocaleString()}
                        </div>
                      )}
                      
                      {orgIntegration.syncErrors && (
                        <div className="mt-4 p-3 bg-red-50 rounded-lg">
                          <p className="text-sm text-red-600">
                            Error en la última sincronización
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal para conectar integración */}
      <Dialog open={showConnectModal} onOpenChange={setShowConnectModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Conectar {selectedIntegration?.displayName}
            </DialogTitle>
            <DialogDescription>
              {selectedIntegration?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedIntegration && (
            <div className="space-y-4 py-4">
              {renderAuthFields(selectedIntegration)}
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowConnectModal(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConnectSubmit} 
              disabled={connecting}
            >
              {connecting ? 'Conectando...' : 'Conectar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
