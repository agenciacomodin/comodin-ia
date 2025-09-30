
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { MobileAuthScanner } from '@/components/auth/mobile-auth-scanner'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Smartphone } from 'lucide-react'

export default function QRAuthPage() {
  const searchParams = useSearchParams()
  const [qrData, setQrData] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    // Obtener datos del QR desde los parámetros de la URL
    const data = searchParams.get('data')
    const sessionId = searchParams.get('sessionId')
    const token = searchParams.get('token')
    const timestamp = searchParams.get('timestamp')
    const domain = searchParams.get('domain')

    if (data) {
      // Si viene data completa
      setQrData(data)
    } else if (sessionId && token && timestamp && domain) {
      // Si vienen parámetros individuales, reconstruir
      const reconstructedData = JSON.stringify({
        sessionId,
        token,
        timestamp: parseInt(timestamp),
        domain
      })
      setQrData(reconstructedData)
    } else {
      setError('Datos del código QR no válidos o incompletos')
    }
  }, [searchParams])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                <br />
                <br />
                Por favor, escanea un nuevo código QR desde la aplicación web.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!qrData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Smartphone className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <div className="text-lg font-medium">Cargando...</div>
            <div className="text-sm text-gray-600 mt-1">
              Procesando datos del código QR
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <MobileAuthScanner qrData={qrData} />
}
