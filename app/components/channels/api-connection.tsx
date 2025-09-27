

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  Key, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react'
import { WhatsAppChannelSummary } from '@/lib/types'
import { toast } from 'react-hot-toast'

interface APIConnectionComponentProps {
  onChannelCreated: (channel: WhatsAppChannelSummary) => void
  onBack: () => void
}

export function APIConnectionComponent({ onChannelCreated, onBack }: APIConnectionComponentProps) {
  // Estados del formulario
  const [channelName, setChannelName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  
  // Credenciales de la API de Meta
  const [accessToken, setAccessToken] = useState('')
  const [appId, setAppId] = useState('')
  const [appSecret, setAppSecret] = useState('')
  const [phoneNumberId, setPhoneNumberId] = useState('')
  const [businessAccountId, setBusinessAccountId] = useState('')
  const [webhookVerifyToken, setWebhookVerifyToken] = useState('')
  
  // Configuración adicional
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [autoReplyMessage, setAutoReplyMessage] = useState('')
  const [setAsDefault, setSetAsDefault] = useState(false)
  
  // Estados de UI
  const [showTokens, setShowTokens] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')

  // Generar token de webhook aleatorio
  const generateWebhookToken = () => {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    setWebhookVerifyToken(token)
    toast.success('Token de webhook generado')
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copiado al portapapeles`)
    } catch (err) {
      toast.error('Error al copiar')
    }
  }

  // Validar las credenciales
  const validateCredentials = async () => {
    if (!accessToken || !appId || !phoneNumberId) {
      toast.error('Por favor completa todos los campos requeridos')
      return false
    }

    setIsConnecting(true)
    setConnectionStatus('testing')

    try {
      // Simular validación de la API
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Simular respuesta exitosa (en producción haría llamada real a la API de Meta)
      const isValid = Math.random() > 0.3 // 70% de éxito para la demo
      
      if (isValid) {
        setConnectionStatus('success')
        return true
      } else {
        setConnectionStatus('error')
        toast.error('Las credenciales no son válidas')
        return false
      }
    } catch (error) {
      setConnectionStatus('error')
      toast.error('Error al validar las credenciales')
      return false
    } finally {
      setIsConnecting(false)
    }
  }

  // Crear el canal
  const createChannel = async () => {
    const isValid = await validateCredentials()
    if (!isValid || !channelName || !phoneNumber) return

    const newChannel: WhatsAppChannelSummary = {
      id: `channel_${Date.now()}`,
      name: channelName,
      phone: phoneNumber,
      connectionType: 'API_OFFICIAL',
      status: 'CONNECTED',
      isActive: true,
      isDefault: setAsDefault,
      messagesReceived: 0,
      messagesSent: 0,
      connectedAt: new Date()
    }

    onChannelCreated(newChannel)
    toast.success('Canal creado exitosamente')
    onBack()
  }

  const webhookUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://tudominio.com'}/api/webhooks/whatsapp`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Conexión Profesional (API)</h2>
          <p className="text-gray-600 mt-1">
            Conecta usando la API oficial de Meta para funcionalidades avanzadas
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          Volver
        </Button>
      </div>

      {/* Alert informativo */}
      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Conexión Profesional:</strong> Esta opción requiere una cuenta de Meta Business y 
          configuración avanzada. Ofrece mayor control, estadísticas detalladas y capacidad de automatización.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup">Configuración Inicial</TabsTrigger>
          <TabsTrigger value="credentials">Credenciales API</TabsTrigger>
          <TabsTrigger value="advanced">Configuración Avanzada</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Canal</CardTitle>
              <CardDescription>
                Configuración básica de tu canal profesional
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="api-channel-name">Nombre del Canal *</Label>
                  <Input
                    id="api-channel-name"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    placeholder="Ej: Ventas Profesional"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="api-phone-number">Número de Teléfono *</Label>
                  <Input
                    id="api-phone-number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+52 55 1234 5678"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <Label>Canal Predeterminado</Label>
                  <p className="text-sm text-gray-600">
                    Usar este canal como predeterminado para nuevas conversaciones
                  </p>
                </div>
                <Switch
                  checked={setAsDefault}
                  onCheckedChange={setSetAsDefault}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Guía de Configuración</CardTitle>
              <CardDescription>
                Pasos para obtener las credenciales de la API de Meta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold flex items-center justify-center">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Crear una App de Meta</p>
                    <p className="text-sm text-gray-600">
                      Ve a Meta for Developers y crea una nueva aplicación de tipo "Business"
                    </p>
                    <Button variant="outline" size="sm" className="mt-2" asChild>
                      <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Ir a Meta Developers
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold flex items-center justify-center">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Configurar WhatsApp Business API</p>
                    <p className="text-sm text-gray-600">
                      Agrega el producto "WhatsApp" a tu aplicación y configura tu número de teléfono
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold flex items-center justify-center">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Obtener Credenciales</p>
                    <p className="text-sm text-gray-600">
                      Copia el Access Token, App ID, y Phone Number ID desde el panel de Meta
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold flex items-center justify-center">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Configurar Webhook</p>
                    <p className="text-sm text-gray-600">
                      Configura el webhook para recibir mensajes entrantes
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credentials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>Credenciales de la API de Meta</span>
              </CardTitle>
              <CardDescription>
                Introduce las credenciales obtenidas de tu aplicación de Meta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="access-token">Access Token *</Label>
                <div className="flex space-x-2">
                  <Input
                    id="access-token"
                    type={showTokens ? "text" : "password"}
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder="EAAxxxxxxxxxxxxxxxxxxxx"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTokens(!showTokens)}
                  >
                    {showTokens ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Token de acceso de tu aplicación de Meta
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="app-id">App ID *</Label>
                  <Input
                    id="app-id"
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    placeholder="1234567890123456"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="app-secret">App Secret</Label>
                  <Input
                    id="app-secret"
                    type={showTokens ? "text" : "password"}
                    value={appSecret}
                    onChange={(e) => setAppSecret(e.target.value)}
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone-number-id">Phone Number ID *</Label>
                  <Input
                    id="phone-number-id"
                    value={phoneNumberId}
                    onChange={(e) => setPhoneNumberId(e.target.value)}
                    placeholder="1234567890123456"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="business-account-id">Business Account ID</Label>
                  <Input
                    id="business-account-id"
                    value={businessAccountId}
                    onChange={(e) => setBusinessAccountId(e.target.value)}
                    placeholder="1234567890123456"
                  />
                </div>
              </div>

              {/* Configuración de Webhook */}
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Configuración de Webhook</h4>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>URL de Webhook</Label>
                    <div className="flex space-x-2">
                      <Input
                        value={webhookUrl}
                        readOnly
                        className="bg-gray-50"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(webhookUrl, 'URL de webhook')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Configura esta URL en tu aplicación de Meta
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhook-token">Verify Token</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="webhook-token"
                        value={webhookVerifyToken}
                        onChange={(e) => setWebhookVerifyToken(e.target.value)}
                        placeholder="Token de verificación"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={generateWebhookToken}
                      >
                        Generar
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Token para verificar los webhooks
                    </p>
                  </div>
                </div>
              </div>

              {/* Estado de la conexión */}
              {connectionStatus !== 'idle' && (
                <div className="pt-4">
                  {connectionStatus === 'testing' && (
                    <Alert className="border-yellow-200 bg-yellow-50">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800">
                        Validando credenciales...
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {connectionStatus === 'success' && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        ¡Credenciales válidas! La conexión se estableció correctamente.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {connectionStatus === 'error' && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        Error al validar las credenciales. Verifica que sean correctas.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              <div className="pt-4">
                <Button 
                  onClick={validateCredentials}
                  disabled={isConnecting || !accessToken || !appId || !phoneNumberId}
                  className="w-full"
                >
                  {isConnecting ? 'Validando...' : 'Probar Conexión'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mensajes Automáticos</CardTitle>
              <CardDescription>
                Configura mensajes automáticos para mejorar la experiencia del cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-welcome-message">Mensaje de Bienvenida</Label>
                <Textarea
                  id="api-welcome-message"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  placeholder="¡Hola! Gracias por contactarnos. En breve uno de nuestros agentes te atenderá."
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  Mensaje automático enviado a nuevos contactos
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-auto-reply">Respuesta Automática</Label>
                <Textarea
                  id="api-auto-reply"
                  value={autoReplyMessage}
                  onChange={(e) => setAutoReplyMessage(e.target.value)}
                  placeholder="Gracias por tu mensaje. Actualmente estamos fuera del horario de atención. Te responderemos pronto."
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  Mensaje enviado fuera del horario de atención
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onBack}>
              Cancelar
            </Button>
            <Button 
              onClick={createChannel}
              disabled={!channelName || !phoneNumber || !accessToken || !appId || !phoneNumberId || isConnecting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isConnecting ? 'Creando Canal...' : 'Crear Canal'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
