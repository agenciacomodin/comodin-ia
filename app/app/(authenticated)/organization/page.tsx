
import { getCurrentOrganization } from '@/lib/multi-tenant'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Permission } from '@/lib/permissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Building, 
  Users, 
  Settings, 
  CreditCard, 
  Calendar,
  Mail,
  Plus,
  Shield
} from 'lucide-react'

export default async function OrganizationPage() {
  const { organization, user } = await getCurrentOrganization()

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <ProtectedRoute permissions={[Permission.MANAGE_ORGANIZATION_SETTINGS]}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Organización</h1>
          <p className="text-gray-600 mt-1">Gestiona la configuración y miembros de tu organización</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información de la Organización</CardTitle>
                <CardDescription>
                  Configura los datos básicos de tu empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Nombre de la Organización</Label>
                  <Input
                    id="orgName"
                    defaultValue={organization.name}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industria</Label>
                    <Input
                      id="industry"
                      placeholder="Ej: Retail, Servicios, Tecnología"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">Tamaño de la Empresa</Label>
                    <Input
                      id="size"
                      placeholder="Ej: 1-10, 11-50, 51-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    placeholder="Breve descripción de tu negocio"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono Principal</Label>
                    <Input
                      id="phone"
                      placeholder="+54 9 11 1234-5678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Sitio Web</Label>
                    <Input
                      id="website"
                      placeholder="https://miempresa.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    placeholder="Dirección completa de la empresa"
                  />
                </div>

                <div className="pt-4">
                  <Button>Guardar Cambios</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Miembros del Equipo</CardTitle>
                    <CardDescription>
                      Gestiona los usuarios de tu organización
                    </CardDescription>
                  </div>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Invitar Usuario
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={user.image || ''} />
                        <AvatarFallback>
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name || 'Sin nombre'}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">
                          Miembro desde {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {user.role === 'PROPIETARIO' ? 'Propietario' : 
                         user.role === 'DISTRIBUIDOR' ? 'Distribuidor' : 
                         user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Agente'}
                      </Badge>
                      <div className="w-3 h-3 bg-green-500 rounded-full" title="Activo"></div>
                    </div>
                  </div>

                  {/* Usuarios de ejemplo */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>AM</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Ana Martínez</p>
                        <p className="text-sm text-gray-600">ana.martinez@empresa.com</p>
                        <p className="text-xs text-gray-500">
                          Miembro desde octubre 2024
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Agente</Badge>
                      <div className="w-3 h-3 bg-green-500 rounded-full" title="Activo"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>LG</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Luis García</p>
                        <p className="text-sm text-gray-600">luis.garcia@empresa.com</p>
                        <p className="text-xs text-gray-500">
                          Miembro desde noviembre 2024
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Agente</Badge>
                      <div className="w-3 h-3 bg-orange-500 rounded-full" title="Ausente"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{organization.name}</p>
                    <p className="text-sm text-gray-600">Organización</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Creada el</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(organization.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Miembros activos</p>
                    <p className="text-sm text-gray-600">3 usuarios</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Plan actual</p>
                    <p className="text-sm text-gray-600">Profesional</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uso y Límites</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Usuarios</span>
                      <span className="text-sm text-gray-600">3/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '30%'}}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Conversaciones</span>
                      <span className="text-sm text-gray-600">1,247/5,000</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '25%'}}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Almacenamiento</span>
                      <span className="text-sm text-gray-600">2.4/10 GB</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{width: '24%'}}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Invitar Usuarios
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Configuración
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Facturación
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Shield className="w-4 h-4 mr-2" />
                  Seguridad
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
