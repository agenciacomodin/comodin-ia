
'use client'

import { useState, useEffect } from 'react'
import QRCode from 'react-qr-code'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, RefreshCw, Smartphone, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

interface QRCodeDisplayProps {
  onSwitchToCredentials?: () => void
}

interface QRSession {
  sessionId: string
  qrData: string
  expiresAt: string
  expiresIn: number
}

type QRStatus = 'PENDING' | 'SCANNED' | 'AUTHENTICATED' | 'EXPIRED' | 'CANCELLED'

export function QRCodeDisplay({ onSwitchToCredentials }: QRCodeDisplayProps) {
  const [qrSession, setQrSession] = useState<QRSession | null>(null)
  const [status, setStatus] = useState<QRStatus>('PENDING')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutos
  const [authToken, setAuthToken] = useState('')
  const router = useRouter()

  // Generar nuevo código QR
  const generateQR = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (result.success) {
        setQrSession(result.data)
        setStatus('PENDING')
        setTimeLeft(result.data.expiresIn)
      } else {
        setError(result.error || 'Error generando código QR')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Error de conexión. Inténtalo nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  // Verificar estado del código QR
  const checkStatus = async () => {
    if (!qrSession) return

    try {
      const response = await fetch(`/api/auth/qr/status/${qrSession.sessionId}`)
      const result = await response.json()

      if (result.success) {
        const newStatus = result.data.status as QRStatus
        setStatus(newStatus)

        if (newStatus === 'AUTHENTICATED') {
          // Si ya está autenticado, intentar completar el login
          await completeAuthentication()
        }
      }
    } catch (error) {
      console.error('Error verificando estado:', error)
    }
  }

  // Completar autenticación una vez que el QR es validado
  const completeAuthentication = async () => {
    if (!qrSession) return

    try {
      // Obtener el token de autenticación del estado QR
      const statusResponse = await fetch(`/api/auth/qr/status/${qrSession.sessionId}`)
      const statusResult = await statusResponse.json()

      if (statusResult.success && statusResult.data.authToken) {
        // Usar el provider QR de NextAuth
        const result = await signIn('qr-auth', {
          sessionId: qrSession.sessionId,
          authToken: statusResult.data.authToken,
          redirect: false,
        })

        if (result?.ok) {
          router.push('/dashboard')
          router.refresh()
        } else {
          setError('Error completando la autenticación')
        }
      } else {
        setError('No se pudo obtener el token de autenticación')
      }
    } catch (error) {
      console.error('Error completando autenticación:', error)
      setError('Error completando la autenticación')
    }
  }

  // Efecto para generar QR al montar
  useEffect(() => {
    generateQR()
  }, [])

  // Efecto para el polling del estado
  useEffect(() => {
    if (!qrSession || status === 'AUTHENTICATED' || status === 'EXPIRED') return

    const interval = setInterval(checkStatus, 2000) // Verificar cada 2 segundos
    return () => clearInterval(interval)
  }, [qrSession, status])

  // Efecto para el countdown
  useEffect(() => {
    if (timeLeft <= 0 || status === 'AUTHENTICATED' || status === 'EXPIRED') return

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1)
      
      if (timeLeft <= 1) {
        setStatus('EXPIRED')
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft, status])

  const getStatusIcon = () => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-blue-500" />
      case 'SCANNED':
        return <Loader2 className="h-5 w-5 text-orange-500 animate-spin" />
      case 'AUTHENTICATED':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'EXPIRED':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'PENDING':
        return 'Escanea el código QR con tu teléfono móvil'
      case 'SCANNED':
        return 'Código escaneado. Completa la autenticación en tu móvil'
      case 'AUTHENTICATED':
        return '¡Autenticación exitosa! Redirigiendo...'
      case 'EXPIRED':
        return 'El código QR ha expirado. Genera uno nuevo.'
      default:
        return ''
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Smartphone className="h-5 w-5" />
          <span>Iniciar con QR</span>
        </CardTitle>
        <CardDescription>
          Escanea el código con tu teléfono móvil para iniciar sesión
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          {getStatusIcon()}
          <span>{getStatusMessage()}</span>
        </div>

        {qrSession && status !== 'EXPIRED' && (
          <>
            <div className="flex justify-center">
              <div className="p-4 bg-white border rounded-lg">
                <QRCode 
                  value={qrSession.qrData}
                  size={200}
                  level="M"
                />
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-gray-700">
                {formatTime(timeLeft)}
              </div>
              <div className="text-xs text-gray-500">
                Tiempo restante
              </div>
            </div>
          </>
        )}

        {(status === 'EXPIRED' || error) && (
          <Button 
            onClick={generateQR}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Generar Nuevo Código
              </>
            )}
          </Button>
        )}

        <div className="pt-4 border-t space-y-2">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              ¿Estás en un dispositivo móvil?
            </p>
            <Button 
              variant="outline" 
              className="w-full text-sm mb-2"
              onClick={() => window.open('/auth/qr', '_blank')}
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Abrir escáner móvil
            </Button>
          </div>
          <Button 
            variant="ghost" 
            className="w-full text-sm"
            onClick={onSwitchToCredentials}
          >
            ¿Prefieres usar email y contraseña?
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
