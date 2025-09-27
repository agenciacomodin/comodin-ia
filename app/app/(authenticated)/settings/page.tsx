
import { getCurrentOrganization } from '@/lib/multi-tenant'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Permission } from '@/lib/permissions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  MessageSquare,
  CreditCard
} from 'lucide-react'

export default async function SettingsPage() {
  const { organization, user } = await getCurrentOrganization()

  return (
    <ProtectedRoute permissions={[Permission.MANAGE_ORGANIZATION_SETTINGS]}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600 mt-1">Gestiona la configuración de tu cuenta y organización</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="general">
              <Settings className="w-4 h-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="channels">
              <MessageSquare className="w-4 h-4 mr-2" />
              Canales
            </TabsTrigger>
            <TabsTrigger value="quick-replies">
              <MessageSquare className="w-4 h-4 mr-2" />
              Respuestas
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notificaciones
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="w-4 h-4 mr-2" />
              Seguridad
            </TabsTrigger>
            <TabsTrigger value="billing">
              <CreditCard className="w-4 h-4 mr-2" />
              Facturación
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información de la Organización</CardTitle>
                <CardDescription>
                  Configuración básica de tu empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Nombre de la Empresa</Label>
                    <Input id="company-name" defaultValue={organization.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industria</Label>
                    <Input id="industry" placeholder="Ej: Retail, Servicios, etc." />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Input id="description" placeholder="Breve descripción de tu negocio" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono Principal</Label>
                    <Input id="phone" placeholder="+54 9 11 1234-5678" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Sitio Web</Label>
                    <Input id="website" placeholder="https://miempresa.com" />
                  </div>
                </div>

                <Button>Guardar Cambios</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preferencias del Sistema</CardTitle>
                <CardDescription>
                  Configuración general de la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Modo Oscuro</Label>
                    <p className="text-sm text-gray-600">Cambiar apariencia de la interfaz</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-asignación de Conversaciones</Label>
                    <p className="text-sm text-gray-600">Asignar automáticamente nuevas conversaciones</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Respuestas Sugeridas</Label>
                    <p className="text-sm text-gray-600">Mostrar sugerencias de respuesta con IA</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>
                  Actualiza tu información personal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">Nombre</Label>
                    <Input id="first-name" defaultValue={user.name?.split(' ')[0] || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Apellido</Label>
                    <Input id="last-name" defaultValue={user.name?.split(' ').slice(1).join(' ') || ''} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" type="email" defaultValue={user.email} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone-personal">Teléfono Personal</Label>
                    <Input id="phone-personal" placeholder="+54 9 11 1234-5678" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Cargo</Label>
                    <Input id="position" defaultValue={user.role} disabled />
                  </div>
                </div>

                <Button>Actualizar Perfil</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="channels" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Canales de WhatsApp</CardTitle>
                <CardDescription>
                  Gestiona las conexiones de WhatsApp de tu organización
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg bg-blue-50">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-blue-900">Configuración Avanzada</h3>
                      <p className="text-blue-700 text-sm mt-1">
                        Administra canales, conexiones QR y API profesional
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center pt-4">
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <a href="/settings/channels">
                      Ir a Gestión de Canales
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quick-replies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Respuestas Rápidas</CardTitle>
                <CardDescription>
                  Gestiona plantillas de mensajes para responder más eficientemente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg bg-green-50">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="font-medium text-green-900">Plantillas de Mensajes</h3>
                      <p className="text-green-700 text-sm mt-1">
                        Crea y administra respuestas rápidas con atajos
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Cómo usar respuestas rápidas:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Escribe <code className="bg-gray-200 px-1 rounded">/</code> en cualquier conversación</li>
                      <li>• Selecciona una respuesta de la lista o escribe su atajo</li>
                      <li>• El mensaje se insertará automáticamente</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex justify-center pt-4">
                  <Button asChild className="bg-green-600 hover:bg-green-700">
                    <a href="/settings/quick-replies">
                      Gestionar Respuestas Rápidas
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notificaciones por Email</CardTitle>
                <CardDescription>
                  Controla qué notificaciones recibes por correo electrónico
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Nuevos Mensajes</Label>
                    <p className="text-sm text-gray-600">Recibir email cuando llegue un mensaje nuevo</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Resúmenes Diarios</Label>
                    <p className="text-sm text-gray-600">Reporte diario de actividad</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Alertas de Sistema</Label>
                    <p className="text-sm text-gray-600">Notificaciones importantes del sistema</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notificaciones Push</CardTitle>
                <CardDescription>
                  Configuración de notificaciones en tiempo real
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mensajes Urgentes</Label>
                    <p className="text-sm text-gray-600">Notificaciones inmediatas para mensajes importantes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Menciones</Label>
                    <p className="text-sm text-gray-600">Cuando te mencionen en una conversación</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de WhatsApp</CardTitle>
                <CardDescription>
                  Conecta y configura tus números de WhatsApp Business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg bg-green-50">
                  <p className="font-medium text-green-800">Números Conectados</p>
                  <p className="text-sm text-green-600 mt-1">+54 9 11 1234-5678 • Activo</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Respuestas Automáticas</Label>
                    <p className="text-sm text-gray-600">Activar respuestas automáticas fuera del horario de atención</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mensaje de Bienvenida</Label>
                    <p className="text-sm text-gray-600">Enviar mensaje automático a nuevos contactos</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Button>Conectar Nuevo Número</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Seguridad de la Cuenta</CardTitle>
                <CardDescription>
                  Configuración de seguridad y privacidad
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Contraseña Actual</Label>
                  <Input id="current-password" type="password" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nueva Contraseña</Label>
                  <Input id="new-password" type="password" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                  <Input id="confirm-password" type="password" />
                </div>

                <Button>Cambiar Contraseña</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Plan Actual</CardTitle>
                <CardDescription>
                  Información sobre tu suscripción
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold">Plan Profesional</h3>
                      <p className="text-sm text-gray-600">Facturado mensualmente</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">$49.99</p>
                      <p className="text-sm text-gray-600">por mes</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button>Cambiar Plan</Button>
                    <Button variant="outline">Ver Historial</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
