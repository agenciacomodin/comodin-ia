

'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Camera, Upload, Loader2, CheckCircle, AlertCircle, Scan, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface QRData {
  sessionId: string
  token: string
  timestamp: number
  domain: string
}

export function MobileAuthScanner() {
  const [qrData, setQrData] = useState<QRData | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Procesar código QR escaneado o manual
  const processQRCode = (qrContent: string) => {
    try {
      const data = JSON.parse(qrContent) as QRData
      
      if (!data.sessionId || !data.token || !data.timestamp || !data.domain) {
        throw new Error('Código QR inválido')
      }

      // Verificar que el código no sea muy antiguo (más de 10 minutos)
      const now = Date.now()
      const qrAge = now - data.timestamp
      const maxAge = 10 * 60 * 1000 // 10 minutos
      
      if (qrAge > maxAge) {
        throw new Error('El código QR ha expirado')
      }

      setQrData(data)
      setError('')
      toast({
        title: "Código QR detectado",
        description: "Ahora ingresa tus credenciales para autenticarte",
      })
    } catch (error) {
      console.error('Error procesando QR:', error)
      setError(error instanceof Error ? error.message : 'Código QR inválido')
    }
  }

  // Manejar entrada manual de código
  const handleManualCode = () => {
    if (!manualCode.trim()) {
      setError('Ingresa el código QR')
      return
    }
    processQRCode(manualCode.trim())
  }

  // Manejar carga de imagen
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // En una implementación real, usarías una librería como jsQR para leer QR de imágenes
    // Por ahora, simulamos la lectura
    const reader = new FileReader()
    reader.onload = (e) => {
      // Simulación - en realidad necesitarías jsQR aquí
      toast({
        title: "Imagen cargada",
        description: "Por favor, usa el código manual o la cámara por ahora",
        variant: "destructive"
      })
    }
    reader.readAsDataURL(file)
  }

  // Autenticar con las credenciales
  const handleAuthentication = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!qrData) {
      setError('Primero escanea o ingresa el código QR')
      return
    }

    if (!email || !password) {
      setError('Completa todos los campos')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/qr/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: qrData.token,
          sessionId: qrData.sessionId,
          userEmail: email,
          userPassword: password
        })
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        toast({
          title: "¡Autenticación exitosa!",
          description: "Puedes cerrar esta ventana y volver al escritorio",
        })
        
        // Opcional: redirigir después de un momento
        setTimeout(() => {
          window.close() // Intentar cerrar si se abrió en nueva ventana/pestaña
        }, 3000)
      } else {
        setError(result.error || 'Error en la autenticación')
        toast({
          title: "Error de autenticación",
          description: result.error || 'Error en la autenticación',
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Auth error:', error)
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center p-8">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-green-800 mb-2">
          ¡Autenticación Exitosa!
        </h3>
        <p className="text-gray-600 mb-4">
          Ya puedes volver al escritorio y continuar usando la aplicación.
        </p>
        <p className="text-sm text-gray-500">
          Esta ventana se cerrará automáticamente en unos segundos.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!qrData ? (
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Código Manual</TabsTrigger>
            <TabsTrigger value="camera">Cámara/Imagen</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Código Manual</CardTitle>
                <CardDescription>
                  Copia el código del escritorio y pégalo aquí
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manual-code">Código QR</Label>
                  <textarea
                    id="manual-code"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Pega aquí el código JSON del QR..."
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm resize-none"
                  />
                </div>
                <Button 
                  onClick={handleManualCode}
                  disabled={!manualCode.trim()}
                  className="w-full"
                >
                  <Scan className="mr-2 h-4 w-4" />
                  Procesar Código
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="camera" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Escanear con Cámara</CardTitle>
                <CardDescription>
                  Usa la cámara o carga una imagen del código QR
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Función de cámara en desarrollo
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Subir Imagen del QR
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
              Código QR Detectado
            </CardTitle>
            <CardDescription>
              Ahora ingresa tus credenciales para completar la autenticación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuthentication} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile-email">Email</Label>
                <Input
                  id="mobile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu.email@empresa.com"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile-password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="mobile-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tu contraseña"
                    disabled={isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
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
                  'Autenticar'
                )}
              </Button>
            </form>

            <Button 
              variant="ghost" 
              onClick={() => {setQrData(null); setManualCode('')}}
              className="w-full mt-4 text-sm"
            >
              Cambiar código QR
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

