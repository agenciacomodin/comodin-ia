
'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Smartphone, Wifi, WifiOff, RotateCcw } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'react-hot-toast'

interface WhatsAppQRProps {
  organizationId: string
}

interface ConnectionStatus {
  status: 'CONNECTING' | 'OPEN' | 'CLOSED' | 'PAIRING'
  qrCode?: string
  profileName?: string
  phone?: string
  profilePictureUrl?: string
}

export default function WhatsAppQR({ organizationId }: WhatsAppQRProps) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ status: 'CLOSED' })
  const [isLoading, setIsLoading] = useState(false)
  const [instanceName, setInstanceName] = useState('')

  useEffect(() => {
    // Generar nombre único para la instancia
    setInstanceName(`comodin_${organizationId}_${Date.now()}`)
  }, [organizationId])

  useEffect(() => {
    if (connectionStatus.status === 'CONNECTING' || connectionStatus.status === 'PAIRING') {
      // Polling para obtener el estado de la conexión
      const interval = setInterval(async () => {
        await checkConnectionStatus()
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [connectionStatus.status, instanceName])

  const createInstance = async () => {
    if (!instanceName) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/whatsapp/evolution/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instanceName,
          organizationId
        })
      })

      const data = await response.json()

      if (data.success) {
        setConnectionStatus({ status: 'CONNECTING' })
        toast.success('Instancia de WhatsApp creada')
        
        // Obtener código QR
        setTimeout(() => {
          getQRCode()
        }, 2000)
      } else {
        toast.error(data.error || 'Error al crear instancia')
      }
    } catch (error) {
      console.error('Error creating instance:', error)
      toast.error('Error al crear instancia de WhatsApp')
    } finally {
      setIsLoading(false)
    }
  }

  const getQRCode = async () => {
    if (!instanceName) return

    try {
      const response = await fetch(`/api/whatsapp/evolution/qrcode?instanceName=${instanceName}`)
      const data = await response.json()

      if (data.success && data.qrCode) {
        setConnectionStatus(prev => ({
          ...prev,
          status: 'PAIRING',
          qrCode: data.qrCode
        }))
      }
    } catch (error) {
      console.error('Error getting QR code:', error)
    }
  }

  const checkConnectionStatus = async () => {
    if (!instanceName) return

    try {
      const response = await fetch(`/api/whatsapp/evolution/status?instanceName=${instanceName}`)
      const data = await response.json()

      if (data.success) {
        setConnectionStatus({
          status: data.status,
          profileName: data.profileName,
          phone: data.phone,
          profilePictureUrl: data.profilePictureUrl
        })

        if (data.status === 'OPEN') {
          toast.success('WhatsApp conectado exitosamente!')
        }
      }
    } catch (error) {
      console.error('Error checking connection status:', error)
    }
  }

  const disconnectWhatsApp = async () => {
    if (!instanceName) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/whatsapp/evolution/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instanceName,
          organizationId
        })
      })

      const data = await response.json()

      if (data.success) {
        setConnectionStatus({ status: 'CLOSED' })
        toast.success('WhatsApp desconectado')
      } else {
        toast.error(data.error || 'Error al desconectar')
      }
    } catch (error) {
      console.error('Error disconnecting:', error)
      toast.error('Error al desconectar WhatsApp')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-green-500'
      case 'CONNECTING': return 'bg-yellow-500'
      case 'PAIRING': return 'bg-blue-500'
      case 'CLOSED': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Conectado'
      case 'CONNECTING': return 'Conectando...'
      case 'PAIRING': return 'Escaneando QR...'
      case 'CLOSED': return 'Desconectado'
      default: return 'Desconocido'
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-6 w-6" />
            WhatsApp Business
          </CardTitle>
          <CardDescription>
            Conecta tu WhatsApp Business para enviar y recibir mensajes
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Estado de conexión */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(connectionStatus.status)}`} />
              <span className="font-medium">{getStatusText(connectionStatus.status)}</span>
            </div>
            
            <Badge variant={connectionStatus.status === 'OPEN' ? 'default' : 'secondary'}>
              {connectionStatus.status === 'OPEN' ? (
                <Wifi className="w-4 h-4 mr-1" />
              ) : (
                <WifiOff className="w-4 h-4 mr-1" />
              )}
              {connectionStatus.status}
            </Badge>
          </div>

          {/* Información del perfil conectado */}
          {connectionStatus.status === 'OPEN' && connectionStatus.profileName && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                {connectionStatus.profilePictureUrl && (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={connectionStatus.profilePictureUrl}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-green-800">
                    {connectionStatus.profileName}
                  </p>
                  <p className="text-sm text-green-600">
                    {connectionStatus.phone}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Código QR */}
          {connectionStatus.status === 'PAIRING' && connectionStatus.qrCode && (
            <div className="text-center space-y-4">
              <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 inline-block">
                <Image
                  src={connectionStatus.qrCode}
                  alt="WhatsApp QR Code"
                  width={256}
                  height={256}
                  className="mx-auto"
                />
              </div>
              
              <div className="text-sm text-gray-600 space-y-2">
                <p className="font-semibold">Para conectar WhatsApp:</p>
                <ol className="list-decimal list-inside space-y-1 text-left max-w-md mx-auto">
                  <li>Abre WhatsApp en tu teléfono</li>
                  <li>Ve a Configuración → Dispositivos Conectados</li>
                  <li>Toca "Conectar un dispositivo"</li>
                  <li>Escanea este código QR</li>
                </ol>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3 justify-center">
            {connectionStatus.status === 'CLOSED' && (
              <Button
                onClick={createInstance}
                disabled={isLoading || !instanceName}
                className="min-w-[150px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Conectar WhatsApp'
                )}
              </Button>
            )}

            {connectionStatus.status === 'CONNECTING' && (
              <Button
                onClick={getQRCode}
                variant="outline"
                disabled={isLoading}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Generar QR
              </Button>
            )}

            {(connectionStatus.status === 'OPEN' || connectionStatus.status === 'PAIRING') && (
              <Button
                onClick={disconnectWhatsApp}
                variant="destructive"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Desconectando...
                  </>
                ) : (
                  'Desconectar'
                )}
              </Button>
            )}
          </div>

          {/* Información adicional */}
          {connectionStatus.status === 'CLOSED' && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Una vez conectado, podrás enviar y recibir mensajes de WhatsApp 
                directamente desde el panel de comunicaciones de COMODÍN IA.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
