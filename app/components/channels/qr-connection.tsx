

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { QrCode, RefreshCw, CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import { WhatsAppChannelSummary, QRCodeConnectionData } from '@/lib/types'

interface QRConnectionComponentProps {
  onChannelCreated: (channel: WhatsAppChannelSummary) => void
  onBack: () => void
}

export function QRConnectionComponent({ onChannelCreated, onBack }: QRConnectionComponentProps) {
  const [connectionData, setConnectionData] = useState<QRCodeConnectionData | null>(null)
  const [channelName, setChannelName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [autoReplyMessage, setAutoReplyMessage] = useState('')
  const [setAsDefault, setSetAsDefault] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Simular la generación de código QR
  const generateQRCode = async () => {
    if (!channelName || !phoneNumber) {
      return
    }

    setIsGenerating(true)
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // QR Code simulado (base64)
      const mockQR = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZiIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkNvZGlnbyBRUjwvdGV4dD48L3N2Zz4="
      
      setConnectionData({
        qrCode: mockQR,
        expiration: new Date(Date.now() + 5 * 60 * 1000), // 5 minutos
        status: 'WAITING',
        connectionId: `qr_${Date.now()}`
      })
      
      // Simular el polling del estado
      setTimeout(() => {
        setConnectionData(prev => prev ? { ...prev, status: 'SCANNING' } : null)
      }, 3000)
      
      setTimeout(() => {
        setConnectionData(prev => prev ? { ...prev, status: 'SUCCESS' } : null)
      }, 8000)
      
    } catch (error) {
      console.error('Error generando QR:', error)
      setConnectionData(prev => prev ? { ...prev, status: 'ERROR' } : null)
    } finally {
      setIsGenerating(false)
    }
  }

  // Finalizar la configuración del canal
  const completeConnection = () => {
    if (!connectionData || connectionData.status !== 'SUCCESS') return

    const newChannel: WhatsAppChannelSummary = {
      id: `channel_${Date.now()}`,
      name: channelName,
      phone: phoneNumber,
      connectionType: 'QR_CODE',
      status: 'CONNECTED',
      isActive: true,
      isDefault: setAsDefault,
      messagesReceived: 0,
      messagesSent: 0,
      connectedAt: new Date()
    }

    onChannelCreated(newChannel)
    onBack()
  }

  const resetConnection = () => {
    setConnectionData(null)
    setChannelName('')
    setPhoneNumber('')
    setWelcomeMessage('')
    setAutoReplyMessage('')
    setSetAsDefault(false)
  }

  const getStatusIcon = () => {
    if (!connectionData) return null
    
    switch (connectionData.status) {
      case 'WAITING':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'SCANNING':
        return <RefreshCw className="h-4 w-4 text-yellow-600 animate-spin" />
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'ERROR':
      case 'EXPIRED':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusText = () => {
    if (!connectionData) return ''
    
    switch (connectionData.status) {
      case 'WAITING':
        return 'Esperando escaneo...'
      case 'SCANNING':
        return 'Conectando con WhatsApp...'
      case 'SUCCESS':
        return '¡Conectado exitosamente!'
      case 'ERROR':
        return 'Error en la conexión'
      case 'EXPIRED':
        return 'El código QR ha expirado'
      default:
        return ''
    }
  }

  const getStatusColor = () => {
    if (!connectionData) return 'gray'
    
    switch (connectionData.status) {
      case 'WAITING':
        return 'blue'
      case 'SCANNING':
        return 'yellow'
      case 'SUCCESS':
        return 'green'
      case 'ERROR':
      case 'EXPIRED':
        return 'red'
      default:
        return 'gray'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Conexión Rápida (QR)</h2>
          <p className="text-gray-600 mt-1">
            La forma más fácil de conectar WhatsApp a tu plataforma
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          Volver
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de configuración */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración del Canal</CardTitle>
            <CardDescription>
              Configura los detalles de tu nuevo canal de WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="channel-name">Nombre del Canal</Label>
              <Input
                id="channel-name"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="Ej: Soporte Principal"
                disabled={connectionData?.status === 'SUCCESS'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone-number">Número de Teléfono</Label>
              <Input
                id="phone-number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+52 55 1234 5678"
                disabled={connectionData?.status === 'SUCCESS'}
              />
              <p className="text-xs text-gray-500">
                Número que aparecerá asociado a este canal
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="welcome-message">Mensaje de Bienvenida (Opcional)</Label>
              <Textarea
                id="welcome-message"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                placeholder="Mensaje automático para nuevos contactos"
                rows={3}
                disabled={connectionData?.status === 'SUCCESS'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="auto-reply">Respuesta Automática (Opcional)</Label>
              <Textarea
                id="auto-reply"
                value={autoReplyMessage}
                onChange={(e) => setAutoReplyMessage(e.target.value)}
                placeholder="Mensaje fuera del horario de atención"
                rows={3}
                disabled={connectionData?.status === 'SUCCESS'}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Canal Predeterminado</Label>
                <p className="text-sm text-gray-600">
                  Usar este canal como predeterminado para nuevas conversaciones
                </p>
              </div>
              <Switch
                checked={setAsDefault}
                onCheckedChange={setSetAsDefault}
                disabled={connectionData?.status === 'SUCCESS'}
              />
            </div>

            <div className="pt-4">
              {!connectionData ? (
                <Button 
                  onClick={generateQRCode}
                  disabled={!channelName || !phoneNumber || isGenerating}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generando QR...
                    </>
                  ) : (
                    <>
                      <QrCode className="h-4 w-4 mr-2" />
                      Generar Código QR
                    </>
                  )}
                </Button>
              ) : connectionData.status === 'SUCCESS' ? (
                <Button 
                  onClick={completeConnection}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completar Configuración
                </Button>
              ) : (
                <Button 
                  onClick={resetConnection}
                  variant="outline"
                  className="w-full"
                >
                  Reintentar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Código QR y estado */}
        <Card>
          <CardHeader>
            <CardTitle>Código QR</CardTitle>
            <CardDescription>
              Escanea este código desde WhatsApp en tu teléfono
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!connectionData ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-500">
                  Completa la configuración para generar el código QR
                </p>
              </div>
            ) : (
              <div className="text-center space-y-4">
                {/* Estado de la conexión */}
                <div className="flex items-center justify-center space-x-2 mb-4">
                  {getStatusIcon()}
                  <Badge 
                    variant={getStatusColor() === 'green' ? 'default' : 'outline'}
                    className={`${
                      getStatusColor() === 'green' ? 'bg-green-100 text-green-800' :
                      getStatusColor() === 'blue' ? 'bg-blue-100 text-blue-800' :
                      getStatusColor() === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                      getStatusColor() === 'red' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {getStatusText()}
                  </Badge>
                </div>

                {/* Código QR */}
                {(connectionData.status === 'WAITING' || connectionData.status === 'SCANNING') && (
                  <div className="bg-white p-4 border-2 border-gray-200 rounded-lg inline-block">
                    <img 
                      src={connectionData.qrCode} 
                      alt="Código QR de WhatsApp"
                      className="w-48 h-48"
                    />
                  </div>
                )}

                {/* Instrucciones */}
                {connectionData.status === 'WAITING' && (
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>1. Abre WhatsApp en tu teléfono</p>
                    <p>2. Ve a Configuración → Dispositivos vinculados</p>
                    <p>3. Toca "Vincular un dispositivo"</p>
                    <p>4. Escanea este código QR</p>
                  </div>
                )}

                {connectionData.status === 'SUCCESS' && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-green-800 font-medium">
                      ¡WhatsApp conectado exitosamente!
                    </p>
                    <p className="text-green-600 text-sm mt-1">
                      Tu canal está listo para recibir mensajes
                    </p>
                  </div>
                )}

                {(connectionData.status === 'ERROR' || connectionData.status === 'EXPIRED') && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <p className="text-red-800 font-medium">
                      {connectionData.status === 'EXPIRED' ? 
                        'El código QR ha expirado' : 
                        'Error en la conexión'
                      }
                    </p>
                    <p className="text-red-600 text-sm mt-1">
                      Intenta generar un nuevo código
                    </p>
                  </div>
                )}

                {/* Tiempo restante */}
                {connectionData.status === 'WAITING' && (
                  <p className="text-xs text-gray-500">
                    El código expira en 5 minutos
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
