
import { getCurrentOrganization } from '@/lib/multi-tenant'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Permission } from '@/lib/permissions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, Plus, Search, Phone, Mail, MessageSquare } from 'lucide-react'

export default async function ContactsPage() {
  const { organization, user } = await getCurrentOrganization()

  return (
    <ProtectedRoute permissions={[Permission.VIEW_CONTACTS, Permission.MANAGE_CONTACTS]}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contactos</h1>
            <p className="text-gray-600 mt-1">Gestiona tu base de clientes y leads</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              Importar
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Contacto
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contactos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,847</div>
              <p className="text-xs text-muted-foreground">
                +12% desde el mes pasado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nuevos Esta Semana</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">
                +23% vs semana anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos WhatsApp</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,156</div>
              <p className="text-xs text-muted-foreground">
                76% del total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversiones</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18.7%</div>
              <p className="text-xs text-muted-foreground">
                Tasa lead-to-customer
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar contactos..."
              className="pl-10"
            />
          </div>
          <Button variant="outline">Filtros</Button>
          <Button variant="outline">Exportar</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Lista de Contactos</CardTitle>
              <CardDescription>
                Todos tus contactos organizados y actualizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback>JP</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">Juan Pérez</h3>
                      <p className="text-sm text-gray-600">+54 9 11 1234-5678</p>
                      <p className="text-xs text-gray-500">juan.perez@email.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Cliente</Badge>
                    <Badge variant="outline">WhatsApp</Badge>
                    <div className="w-3 h-3 bg-green-500 rounded-full" title="Activo"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback>MG</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">María García</h3>
                      <p className="text-sm text-gray-600">+54 9 11 9876-5432</p>
                      <p className="text-xs text-gray-500">maria.garcia@email.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">Lead</Badge>
                    <Badge variant="outline">WhatsApp</Badge>
                    <div className="w-3 h-3 bg-orange-500 rounded-full" title="Pendiente"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback>CR</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">Carlos Rodríguez</h3>
                      <p className="text-sm text-gray-600">+54 9 11 5555-6666</p>
                      <p className="text-xs text-gray-500">carlos.rodriguez@empresa.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Prospecto</Badge>
                    <Badge variant="outline">Email</Badge>
                    <div className="w-3 h-3 bg-gray-400 rounded-full" title="Inactivo"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback>AS</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">Ana Silva</h3>
                      <p className="text-sm text-gray-600">+54 9 11 7777-8888</p>
                      <p className="text-xs text-gray-500">ana.silva@tienda.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Cliente VIP</Badge>
                    <Badge variant="outline">WhatsApp</Badge>
                    <div className="w-3 h-3 bg-blue-500 rounded-full" title="Premium"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Segmentación</CardTitle>
                <CardDescription>
                  Distribución de contactos por categoría
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Clientes Activos</span>
                    <Badge variant="secondary">1,254</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Leads Calificados</span>
                    <Badge variant="secondary">687</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Prospectos</span>
                    <Badge variant="secondary">543</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Clientes VIP</span>
                    <Badge variant="secondary">89</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Inactivos</span>
                    <Badge variant="secondary">274</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>
                  Últimas interacciones con contactos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Juan Pérez</p>
                      <p className="text-xs text-gray-500">Respondió mensaje</p>
                    </div>
                    <span className="text-xs text-gray-500">5m</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">María García</p>
                      <p className="text-xs text-gray-500">Email abierto</p>
                    </div>
                    <span className="text-xs text-gray-500">15m</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Phone className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Carlos Rodríguez</p>
                      <p className="text-xs text-gray-500">Llamada realizada</p>
                    </div>
                    <span className="text-xs text-gray-500">1h</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
