

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Permission } from '@/lib/permissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Smartphone, 
  QrCode, 
  Settings, 
  Plus, 
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { QRConnectionComponent } from '@/components/channels/qr-connection'
import { APIConnectionComponent } from '@/components/channels/api-connection'
import { ChannelListComponent } from '@/components/channels/channel-list'
import { 
  WhatsAppChannelSummary,
  WHATSAPP_CONNECTION_STATUS_LABELS,
  WHATSAPP_CONNECTION_STATUS_COLORS,
  WHATSAPP_CONNECTION_TYPE_LABELS
} from '@/lib/types'

// Datos de prueba para los canales
const mockChannels: WhatsAppChannelSummary[] = [
  {
    id: '1',
    name: 'Soporte Principal',
    phone: '+52 55 1234 5678',
    connectionType: 'QR_CODE',
    status: 'CONNECTED',
    isActive: true,
    isDefault: true,
    messagesReceived: 1245,
    messagesSent: 987,
    lastActivity: new Date(Date.now() - 5 * 60 * 1000),
    connectedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: '2',
    name: 'Ventas',
    phone: '+52 55 8765 4321',
    connectionType: 'API_OFFICIAL',
    status: 'CONNECTED',
    isActive: true,
    isDefault: false,
    messagesReceived: 645,
    messagesSent: 523,
    lastActivity: new Date(Date.now() - 15 * 60 * 1000),
    connectedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    name: 'Servicio Técnico',
    phone: '+52 55 5555 0000',
    connectionType: 'QR_CODE',
    status: 'EXPIRED',
    isActive: false,
    isDefault: false,
    messagesReceived: 234,
    messagesSent: 198,
    lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    connectedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
  }
]

export default function ChannelsPage() {
  const { data: session } = useSession() || {}
  const [channels, setChannels] = useState<WhatsAppChannelSummary[]>(mockChannels)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedChannel, setSelectedChannel] = useState<WhatsAppChannelSummary | null>(null)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'CONNECTING':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'DISCONNECTED':
        return <WifiOff className="h-4 w-4 text-gray-400" />
      case 'ERROR':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'EXPIRED':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      default:
        return <WifiOff className="h-4 w-4 text-gray-400" />
    }
  }

  const handleChannelUpdate = (channelId: string, updates: Partial<WhatsAppChannelSummary>) => {
    setChannels(prev => prev.map(channel => 
      channel.id === channelId ? { ...channel, ...updates } : channel
    ))
  }

  const handleChannelCreate = (newChannel: WhatsAppChannelSummary) => {
    setChannels(prev => [...prev, newChannel])
  }

  const handleChannelDelete = (channelId: string) => {
    setChannels(prev => prev.filter(channel => channel.id !== channelId))
    if (selectedChannel?.id === channelId) {
      setSelectedChannel(null)
    }
  }

  const connectedChannels = channels.filter(c => c.status === 'CONNECTED' && c.isActive)
  const totalMessages = channels.reduce((sum, c) => sum + c.messagesReceived + c.messagesSent, 0)

  return (
    <ProtectedRoute permissions={[Permission.MANAGE_ORGANIZATION_SETTINGS]}>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Canales de WhatsApp</h1>
              <p className="text-gray-600 mt-1">
                Gestiona las conexiones de WhatsApp para tu organización
              </p>
            </div>
            <Button 
              onClick={() => setActiveTab('new-connection')} 
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Canal
            </Button>
          </div>
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Smartphone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{channels.length}</p>
                  <p className="text-sm text-gray-600">Canales Totales</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Wifi className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{connectedChannels.length}</p>
                  <p className="text-sm text-gray-600">Conectados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Settings className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalMessages.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Mensajes Totales</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {channels.find(c => c.isDefault)?.name || 'No definido'}
                  </p>
                  <p className="text-sm text-gray-600 truncate">Canal Predeterminado</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenido principal */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <Smartphone className="w-4 h-4 mr-2" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="channels">
              <Settings className="w-4 h-4 mr-2" />
              Canales
            </TabsTrigger>
            <TabsTrigger value="qr-connection">
              <QrCode className="w-4 h-4 mr-2" />
              Conexión QR
            </TabsTrigger>
            <TabsTrigger value="api-connection">
              <Wifi className="w-4 h-4 mr-2" />
              Conexión API
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Estado de Conexiones</CardTitle>
                <CardDescription>
                  Vista general de todos tus canales de WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {channels.map((channel) => (
                    <div
                      key={channel.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(channel.status)}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{channel.name}</span>
                              {channel.isDefault && (
                                <Badge variant="secondary" className="text-xs">
                                  Predeterminado
                                </Badge>
                              )}
                              {!channel.isActive && (
                                <Badge variant="outline" className="text-xs text-gray-500">
                                  Inactivo
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {channel.phone} • {WHATSAPP_CONNECTION_TYPE_LABELS[channel.connectionType]}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right text-sm">
                          <p className="text-gray-900">
                            {(channel.messagesReceived + channel.messagesSent).toLocaleString()} mensajes
                          </p>
                          <p className="text-gray-500">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${WHATSAPP_CONNECTION_STATUS_COLORS[channel.status] === 'green' ? 'border-green-200 text-green-700' : 
                                WHATSAPP_CONNECTION_STATUS_COLORS[channel.status] === 'yellow' ? 'border-yellow-200 text-yellow-700' :
                                WHATSAPP_CONNECTION_STATUS_COLORS[channel.status] === 'red' ? 'border-red-200 text-red-700' :
                                WHATSAPP_CONNECTION_STATUS_COLORS[channel.status] === 'orange' ? 'border-orange-200 text-orange-700' :
                                'border-gray-200 text-gray-700'}`}
                            >
                              {WHATSAPP_CONNECTION_STATUS_LABELS[channel.status]}
                            </Badge>
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedChannel(channel)
                            setActiveTab('channels')
                          }}
                        >
                          Configurar
                        </Button>
                      </div>
                    </div>
                  ))}

                  {channels.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <Smartphone className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No hay canales configurados
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Conecta tu primer canal de WhatsApp para comenzar
                      </p>
                      <Button onClick={() => setActiveTab('qr-connection')}>
                        Crear Primer Canal
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="channels">
            <ChannelListComponent
              channels={channels}
              selectedChannel={selectedChannel}
              onChannelSelect={setSelectedChannel}
              onChannelUpdate={handleChannelUpdate}
              onChannelDelete={handleChannelDelete}
            />
          </TabsContent>

          <TabsContent value="qr-connection">
            <QRConnectionComponent
              onChannelCreated={handleChannelCreate}
              onBack={() => setActiveTab('overview')}
            />
          </TabsContent>

          <TabsContent value="api-connection">
            <APIConnectionComponent
              onChannelCreated={handleChannelCreate}
              onBack={() => setActiveTab('overview')}
            />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
