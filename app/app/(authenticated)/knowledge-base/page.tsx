
import { getCurrentOrganization } from '@/lib/multi-tenant'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Permission } from '@/lib/permissions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Plus, Search, FileText, Video, Image } from 'lucide-react'

export default async function KnowledgeBasePage() {
  const { organization, user } = await getCurrentOrganization()

  return (
    <ProtectedRoute permissions={[Permission.MANAGE_KNOWLEDGE_BASE]}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Base de Conocimiento</h1>
            <p className="text-gray-600 mt-1">Gestiona documentos, archivos y contenido para entrenar tu asistente IA</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Documento
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documentos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">147</div>
              <p className="text-xs text-muted-foreground">
                +12 este mes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorías</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                Organizados por tema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Archivos Multimedia</CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">
                Imágenes y videos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entrenamientos IA</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                Sesiones completadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Barra de búsqueda */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar en la base de conocimiento..."
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Documentos Recientes</CardTitle>
                <CardDescription>
                  Lista de documentos agregados recientemente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Manual de Productos 2024</h3>
                        <p className="text-sm text-gray-600">PDF • 2.3 MB</p>
                        <p className="text-xs text-gray-500">Actualizado hace 2 horas</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">Productos</Badge>
                      <Badge variant="outline">Activo</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Políticas de Atención al Cliente</h3>
                        <p className="text-sm text-gray-600">DOCX • 1.8 MB</p>
                        <p className="text-xs text-gray-500">Actualizado ayer</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">Atención</Badge>
                      <Badge variant="outline">Activo</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Video className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Tutorial de Uso - WhatsApp Business</h3>
                        <p className="text-sm text-gray-600">MP4 • 45 MB</p>
                        <p className="text-xs text-gray-500">Subido hace 3 días</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">Tutorial</Badge>
                      <Badge variant="outline">Procesando</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Image className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Catálogo de Imágenes</h3>
                        <p className="text-sm text-gray-600">ZIP • 12.4 MB</p>
                        <p className="text-xs text-gray-500">Subido hace 1 semana</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">Catálogo</Badge>
                      <Badge variant="outline">Activo</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Categorías</CardTitle>
                <CardDescription>
                  Organiza tu contenido por temas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Productos</span>
                    <Badge variant="secondary">45</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Atención al Cliente</span>
                    <Badge variant="secondary">32</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Políticas</span>
                    <Badge variant="secondary">28</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tutoriales</span>
                    <Badge variant="secondary">18</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Marketing</span>
                    <Badge variant="secondary">15</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Legal</span>
                    <Badge variant="secondary">9</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estado del Entrenamiento IA</CardTitle>
                <CardDescription>
                  Progreso del procesamiento de documentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Documentos Procesados</span>
                      <span className="text-sm text-gray-600">142/147</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '96%'}}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Calidad del Modelo</span>
                      <span className="text-sm text-gray-600">Excelente</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '94%'}}></div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button className="w-full" size="sm">
                      Actualizar Entrenamiento
                    </Button>
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
