
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Shield, 
  Users, 
  MessageSquare, 
  Bot, 
  Database, 
  Settings, 
  DollarSign, 
  Zap,
  Mail,
  CheckCircle,
  XCircle,
  Loader2,
  Send
} from 'lucide-react'
import { UserRole } from '@prisma/client'
import { getRolePermissions } from '@/lib/permissions'
import toast from 'react-hot-toast'

const roleDescriptions = {
  SUPER_ADMIN: {
    name: 'Super Admin',
    description: 'Acceso completo al sistema, gestión de proveedores de IA',
    icon: Shield,
    color: 'bg-red-100 text-red-800'
  },
  PROPIETARIO: {
    name: 'Propietario',
    description: 'Administrador completo de la organización',
    icon: Users,
    color: 'bg-purple-100 text-purple-800'
  },
  DISTRIBUIDOR: {
    name: 'Distribuidor',
    description: 'Socio que gestiona clientes y campañas',
    icon: Zap,
    color: 'bg-blue-100 text-blue-800'
  },
  AGENTE: {
    name: 'Agente',
    description: 'Empleado que atiende conversaciones',
    icon: MessageSquare,
    color: 'bg-green-100 text-green-800'
  }
}

const permissionCategories = {
  'Dashboard y CRM': ['VIEW_DASHBOARD', 'VIEW_CRM_INBOX', 'MANAGE_CRM_CONVERSATIONS', 'MANAGE_CRM_CONTACTS'],
  'WhatsApp': ['VIEW_WHATSAPP_CHANNELS', 'MANAGE_WHATSAPP_CHANNELS', 'CONNECT_WHATSAPP_QR'],
  'IA y Automatización': ['VIEW_AUTOMATIONS', 'MANAGE_AUTOMATIONS', 'VIEW_KNOWLEDGE_BASE', 'MANAGE_KNOWLEDGE_BASE'],
  'Equipo y Facturación': ['VIEW_TEAM_MEMBERS', 'INVITE_TEAM_MEMBERS', 'VIEW_BILLING', 'MANAGE_BILLING'],
  'Super Admin': ['MANAGE_AI_PROVIDERS', 'VIEW_SYSTEM_ANALYTICS', 'VIEW_ALL_ORGANIZATIONS']
}

export function UserRoleTester() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('AGENTE')
  const [testEmail, setTestEmail] = useState('')
  const [isTestingEmail, setIsTestingEmail] = useState(false)
  const [emailResults, setEmailResults] = useState<any>(null)

  const testEmailSystem = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      toast.error('Por favor ingresa un email válido')
      return
    }

    setIsTestingEmail(true)
    
    try {
      // Test welcome email
      const welcomeResponse = await fetch('/api/test/send-welcome-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: testEmail,
          name: 'Usuario de Prueba',
          organizationName: 'Organización Demo'
        })
      })
      
      const welcomeResult = await welcomeResponse.json()
      
      // Test password reset email
      const resetResponse = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail })
      })
      
      const resetResult = await resetResponse.json()

      setEmailResults({
        welcome: welcomeResult,
        reset: resetResult
      })

      if (welcomeResult.success && resetResult.success) {
        toast.success('¡Sistema de emails funcionando correctamente!')
      } else {
        toast.error('Algunos emails fallaron')
      }

    } catch (error) {
      toast.error('Error probando el sistema de emails')
      console.error(error)
    }
    
    setIsTestingEmail(false)
  }

  const permissions = getRolePermissions(selectedRole)
  const roleInfo = roleDescriptions[selectedRole]
  const IconComponent = roleInfo.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Verificador de Roles y Sistema de Emails</span>
          </CardTitle>
          <CardDescription>
            Prueba las funciones de cada tipo de usuario y el sistema de notificaciones por email
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roles">Prueba de Roles</TabsTrigger>
          <TabsTrigger value="emails">Sistema de Emails</TabsTrigger>
        </TabsList>

        {/* Tab de Roles */}
        <TabsContent value="roles" className="space-y-6">
          {/* Selector de Rol */}
          <Card>
            <CardHeader>
              <CardTitle>Seleccionar Rol a Probar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(roleDescriptions).map(([role, info]) => {
                  const Icon = info.icon
                  return (
                    <Button
                      key={role}
                      variant={selectedRole === role ? "default" : "outline"}
                      className="h-auto p-4 flex-col space-y-2"
                      onClick={() => setSelectedRole(role as UserRole)}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="font-medium">{info.name}</span>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Información del Rol Seleccionado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconComponent className="h-5 w-5" />
                <span>{roleInfo.name}</span>
                <Badge className={roleInfo.color}>{selectedRole}</Badge>
              </CardTitle>
              <CardDescription>{roleInfo.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-sm text-muted-foreground mb-2">
                    Total de permisos: {permissions.length}
                  </p>
                </div>

                {/* Permisos por Categoría */}
                <div className="space-y-4">
                  {Object.entries(permissionCategories).map(([category, categoryPermissions]) => {
                    const userHasPermissions = categoryPermissions.filter(p => 
                      permissions.some(permission => permission.toString() === p)
                    )
                    
                    if (userHasPermissions.length === 0) return null

                    return (
                      <div key={category} className="space-y-2">
                        <h4 className="font-medium text-sm flex items-center space-x-2">
                          <span>{category}</span>
                          <Badge variant="secondary">{userHasPermissions.length}</Badge>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {categoryPermissions.map(permission => {
                            const hasPermission = permissions.some(p => p.toString() === permission)
                            return (
                              <div 
                                key={permission}
                                className={`flex items-center space-x-2 p-2 rounded-md text-sm ${
                                  hasPermission 
                                    ? 'bg-green-50 text-green-800' 
                                    : 'bg-gray-50 text-gray-500'
                                }`}
                              >
                                {hasPermission ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-gray-400" />
                                )}
                                <span className={hasPermission ? 'font-medium' : 'line-through'}>
                                  {permission.replace(/_/g, ' ')}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Emails */}
        <TabsContent value="emails" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Prueba del Sistema de Emails</span>
              </CardTitle>
              <CardDescription>
                Envía emails de prueba para verificar la configuración SMTP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testEmail">Email de Prueba</Label>
                <Input
                  id="testEmail"
                  type="email"
                  placeholder="tu@email.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>

              <Button 
                onClick={testEmailSystem} 
                disabled={isTestingEmail || !testEmail}
                className="w-full"
              >
                {isTestingEmail ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando Emails de Prueba...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Probar Sistema de Emails
                  </>
                )}
              </Button>

              {emailResults && (
                <div className="space-y-4 mt-6">
                  <h4 className="font-medium">Resultados de la Prueba:</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center space-x-2">
                          {emailResults.welcome?.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span>Email de Bienvenida</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {emailResults.welcome?.message || 'Sin mensaje'}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center space-x-2">
                          {emailResults.reset?.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span>Email de Recuperación</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {emailResults.reset?.message || 'Sin mensaje'}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información de Configuración */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Configuración de Email</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-blue-900">Variables de Entorno Requeridas:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <code>SMTP_HOST</code> - Servidor SMTP</li>
                  <li>• <code>SMTP_PORT</code> - Puerto SMTP (587 recomendado)</li>
                  <li>• <code>SMTP_USER</code> - Usuario/email SMTP</li>
                  <li>• <code>SMTP_PASSWORD</code> - Contraseña de aplicación</li>
                  <li>• <code>SMTP_FROM_NAME</code> - Nombre del remitente</li>
                  <li>• <code>SMTP_FROM_EMAIL</code> - Email del remitente</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900">Nota para Gmail:</h4>
                <p className="text-sm text-yellow-800 mt-1">
                  Para usar Gmail, necesitas generar una "Contraseña de Aplicación" en tu cuenta de Google, 
                  no uses tu contraseña regular.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
