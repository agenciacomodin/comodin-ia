

'use client'

import { Suspense } from 'react'
import { MobileAuthScanner } from '@/components/auth/mobile-auth-scanner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Smartphone, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function QRAuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4">
            <Smartphone className="h-8 w-8" />
            <span className="text-2xl font-bold">COMODÍN IA</span>
          </div>
          <p className="text-gray-600">Autenticación con código QR</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center space-x-2">
              <Smartphone className="h-6 w-6" />
              <span>Escanear Código</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Usa tu teléfono móvil para escanear el código QR del escritorio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Suspense fallback={
              <div className="text-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Cargando escáner...</p>
              </div>
            }>
              <MobileAuthScanner />
            </Suspense>
            
            <div className="pt-4 border-t">
              <Link href="/auth/login">
                <Button variant="ghost" className="w-full text-sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

