
'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Smartphone, MessageSquare, Settings, Zap } from 'lucide-react'
import WhatsAppQR from '@/components/whatsapp/WhatsAppQR'
import { useOrganization } from '@/hooks/use-organization'

export default function WhatsAppConfigPage() {
  const { organization } = useOrganization()

  if (!organization) {
    return <div>Cargando...</div>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">WhatsApp Business</h1>
          <p className="text-gray-600 mt-2">
            Configura y gestiona tu integración con WhatsApp Business
          </p>
        </div>
        
        <Badge variant="outline" className="px-3 py-1">
          <Zap className="w-4 h-4 mr-1" />
          Evolution API
        </Badge>
      </div>

      <Tabs defaultValue="connection" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="connection" className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Conexión
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Mensajes
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Automatización
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configuración
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conexión con WhatsApp</CardTitle>
              <CardDescription>
                Conecta tu número de WhatsApp Business usando código QR
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WhatsAppQR organizationId={organization.id} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>¿Cómo funciona?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-700">✅ Ventajas de Evolution API</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Conexión fácil y rápida con código QR</li>
                    <li>• No requiere API oficial de Meta (más simple)</li>
                    <li>• Soporte para multimedia (imágenes, documentos, audio)</li>
                    <li>• Webhooks en tiempo real para mensajes</li>
                    <li>• Gestión automática de sesiones</li>
                    <li>• Integración completa con COMODÍN IA</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-700">📱 Requisitos</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Número de WhatsApp Business activo</li>
                    <li>• Smartphone con WhatsApp instalado</li>
                    <li>• Acceso a internet estable</li>
                    <li>• Permisos de administrador en COMODÍN IA</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plantillas de Mensajes</CardTitle>
              <CardDescription>
                Gestiona plantillas predefinidas para respuestas automáticas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Próximamente:</strong> Editor de plantillas de mensajes con variables dinámicas, 
                  respuestas automáticas y secuencias de follow-up.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial de Mensajes</CardTitle>
              <CardDescription>
                Visualiza el historial completo de conversaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  <strong>✅ Disponible:</strong> Todos los mensajes se guardan automáticamente en el 
                  Centro de Comunicación y están disponibles para análisis y seguimiento.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automatización con IA</CardTitle>
              <CardDescription>
                Configura respuestas automáticas inteligentes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">🤖 IA Resolutiva</h4>
                <p className="text-sm text-purple-700">
                  La IA de COMODÍN puede responder automáticamente a consultas comunes de WhatsApp 
                  usando la base de conocimiento de tu organización.
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">⏰ Seguimientos Automáticos</h4>
                <p className="text-sm text-yellow-700">
                  Configura secuencias automáticas de follow-up para leads de WhatsApp, 
                  integrándose perfectamente con el CRM.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración Avanzada</CardTitle>
              <CardDescription>
                Ajustes técnicos de la integración con Evolution API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">URL Evolution API</label>
                  <div className="bg-gray-50 p-2 rounded text-sm font-mono">
                    {process.env.NEXT_PUBLIC_EVOLUTION_API_URL || 'http://localhost:8080'}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Webhook URL</label>
                  <div className="bg-gray-50 p-2 rounded text-sm font-mono">
                    {process.env.NEXTAUTH_URL}/api/whatsapp/evolution/webhook
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-800 mb-2">⚠️ Importante</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Mantén Evolution API funcionando 24/7 para recibir mensajes</li>
                  <li>• El webhook debe ser accesible públicamente</li>
                  <li>• Revisa los logs si hay problemas de conexión</li>
                  <li>• Solo se puede conectar un número por organización</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
