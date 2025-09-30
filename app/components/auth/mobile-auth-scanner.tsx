
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Smartphone, Lock, Mail, CheckCircle, AlertCircle } from 'lucide-react'

interface MobileAuthScannerProps {
  qrData?: string
}

export function MobileAuthScanner({ qrData }: MobileAuthScannerProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [sessionInfo, setSessionInfo] = useState<any>(null)

  // Parse QR data when component mounts or qrData changes
  useEffect(() => {
    if (qrData) {
      try {
        const parsed = JSON.parse(qrData)
        setSessionInfo(parsed)
      } catch (error) {
        setError('Código QR inválido')
      }
    }
  }, [qrData])

  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!sessionInfo) {
      setError('Información de sesión no válida')
      setIsLoading(false)
      return
    }

    if (!email || !password) {
      setError('Por favor completa todos los campos')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/qr/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: sessionInfo.token,
          sessionId: sessionInfo.sessionId,
          userEmail: email,
          userPassword: password
        })
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        setError('')
      } else {
        setError(result.error || 'Error en la autenticación')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Error de conexión. Inténtalo nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!sessionInfo) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Código QR inválido o expirado. Escanea un nuevo código desde la aplicación web.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2 text-green-600">
            <CheckCircle className="h-6 w-6" />
            <span>¡Autenticación Exitosa!</span>
          </CardTitle>
          <CardDescription>
            Ya puedes cerrar esta ventana. Tu sesión web está activa.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Smartphone className="h-5 w-5 text-blue-600" />
            <span>Confirmar Identidad</span>
          </CardTitle>
          <CardDescription>
            Ingresa tus credenciales para autorizar el inicio de sesión
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleAuthenticate} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Autenticando...
                </>
              ) : (
                'Autorizar Inicio de Sesión'
              )}
            </Button>
          </form>

          <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm text-gray-600">
            <div className="font-medium mb-1">Información de la sesión:</div>
            <div>Dominio: {sessionInfo.domain}</div>
            <div>Hora: {new Date(sessionInfo.timestamp).toLocaleString()}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
