
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Search, Filter, FileText, CheckCircle, XCircle, Clock, Archive } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  MessageTemplateSummary,
  CreateMessageTemplateRequest,
  TEMPLATE_STATUS_LABELS,
  TEMPLATE_STATUS_COLORS
} from '@/lib/types'

interface TemplateManagerProps {
  canCreateTemplates: boolean
  canManageTemplates: boolean
  canSyncMeta: boolean
}

export default function TemplateManager({
  canCreateTemplates,
  canManageTemplates,
  canSyncMeta
}: TemplateManagerProps) {
  const [templates, setTemplates] = useState<MessageTemplateSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const { toast } = useToast()

  // Form state for new template
  const [formData, setFormData] = useState<Partial<CreateMessageTemplateRequest>>({
    name: '',
    category: 'MARKETING',
    language: 'es',
    bodyContent: '',
    headerType: 'NONE',
    hasButtons: false
  })

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/campaigns/templates')
      const data = await response.json()

      if (data.success) {
        setTemplates(data.data || [])
      } else {
        throw new Error(data.error)
      }

    } catch (error) {
      console.error('Error loading templates:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las plantillas',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = async () => {
    try {
      if (!formData.name || !formData.bodyContent || !formData.category) {
        toast({
          title: 'Error',
          description: 'Por favor completa todos los campos requeridos',
          variant: 'destructive'
        })
        return
      }

      const response = await fetch('/api/campaigns/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Éxito',
          description: 'Plantilla creada exitosamente'
        })
        setShowCreateDialog(false)
        setFormData({
          name: '',
          category: 'MARKETING',
          language: 'es',
          bodyContent: '',
          headerType: 'NONE',
          hasButtons: false
        })
        loadTemplates()
      } else {
        throw new Error(data.error)
      }

    } catch (error) {
      console.error('Error creating template:', error)
      toast({
        title: 'Error',
        description: 'Error al crear la plantilla',
        variant: 'destructive'
      })
    }
  }

  const handleSyncWithMeta = async () => {
    try {
      setSyncing(true)
      // TODO: Implement Meta sync functionality
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      
      toast({
        title: 'Éxito',
        description: 'Sincronización con Meta completada'
      })
      loadTemplates()

    } catch (error) {
      console.error('Error syncing with Meta:', error)
      toast({
        title: 'Error',
        description: 'Error al sincronizar con Meta Business',
        variant: 'destructive'
      })
    } finally {
      setSyncing(false)
    }
  }

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.bodyContent.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || template.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const categories = [...new Set(templates.map(t => t.category))]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Gestor de Plantillas</h2>
            <p className="text-muted-foreground">Gestiona plantillas de mensajes pre-aprobadas por Meta</p>
          </div>
        </div>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'ARCHIVED':
        return <Archive className="h-4 w-4 text-gray-600" />
      default:
        return <FileText className="h-4 w-4 text-blue-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestor de Plantillas</h2>
          <p className="text-muted-foreground">Gestiona plantillas de mensajes pre-aprobadas por Meta</p>
        </div>
        <div className="flex space-x-2">
          {canSyncMeta && (
            <Button 
              variant="outline" 
              onClick={handleSyncWithMeta}
              disabled={syncing}
            >
              {syncing ? 'Sincronizando...' : 'Sincronizar con Meta'}
            </Button>
          )}
          {canCreateTemplates && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Plantilla
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Nueva Plantilla</DialogTitle>
                  <DialogDescription>
                    Crea una nueva plantilla de mensaje para tus campañas
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nombre de la plantilla *</Label>
                    <Input
                      id="name"
                      placeholder="Ej: Bienvenida nuevos clientes"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category">Categoría *</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => setFormData({...formData, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MARKETING">Marketing</SelectItem>
                          <SelectItem value="UTILITY">Utilidad</SelectItem>
                          <SelectItem value="AUTHENTICATION">Autenticación</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="language">Idioma</Label>
                      <Select 
                        value={formData.language} 
                        onValueChange={(value) => setFormData({...formData, language: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona idioma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="en">Inglés</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="headerType">Tipo de encabezado</Label>
                    <Select 
                      value={formData.headerType} 
                      onValueChange={(value) => setFormData({...formData, headerType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">Sin encabezado</SelectItem>
                        <SelectItem value="TEXT">Texto</SelectItem>
                        <SelectItem value="IMAGE">Imagen</SelectItem>
                        <SelectItem value="VIDEO">Video</SelectItem>
                        <SelectItem value="DOCUMENT">Documento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.headerType === 'TEXT' && (
                    <div className="grid gap-2">
                      <Label htmlFor="headerContent">Contenido del encabezado</Label>
                      <Input
                        id="headerContent"
                        placeholder="Texto del encabezado"
                        value={formData.headerContent || ''}
                        onChange={(e) => setFormData({...formData, headerContent: e.target.value})}
                      />
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="bodyContent">Contenido del mensaje *</Label>
                    <Textarea
                      id="bodyContent"
                      placeholder="Hola {{1}}, bienvenido a nuestra plataforma..."
                      value={formData.bodyContent || ''}
                      onChange={(e) => setFormData({...formData, bodyContent: e.target.value})}
                      rows={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      Usa {`{{1}}, {{2}}, etc.`} para variables dinámicas
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="footerContent">Pie de mensaje (opcional)</Label>
                    <Input
                      id="footerContent"
                      placeholder="Ej: Responde STOP para darte de baja"
                      value={formData.footerContent || ''}
                      onChange={(e) => setFormData({...formData, footerContent: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateTemplate}>
                    Crear Plantilla
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Buscar plantillas</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Buscar por nombre o contenido..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-48">
              <Label htmlFor="statusFilter">Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="APPROVED">Aprobadas</SelectItem>
                  <SelectItem value="PENDING">Pendientes</SelectItem>
                  <SelectItem value="REJECTED">Rechazadas</SelectItem>
                  <SelectItem value="PAUSED">Pausadas</SelectItem>
                  <SelectItem value="ARCHIVED">Archivadas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-48">
              <Label htmlFor="categoryFilter">Categoría</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates List */}
      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay plantillas</h3>
            <p className="mt-1 text-sm text-gray-500">
              {templates.length === 0 ? 'Comienza creando tu primera plantilla' : 'No se encontraron plantillas con los filtros aplicados'}
            </p>
            {canCreateTemplates && templates.length === 0 && (
              <div className="mt-6">
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Plantilla
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(template.status)}
                      <h3 className="font-semibold">{template.name}</h3>
                      <Badge 
                        variant="outline"
                        className={`text-xs ${
                          TEMPLATE_STATUS_COLORS[template.status] === 'green' ? 'bg-green-50 text-green-700 border-green-200' :
                          TEMPLATE_STATUS_COLORS[template.status] === 'yellow' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          TEMPLATE_STATUS_COLORS[template.status] === 'red' ? 'bg-red-50 text-red-700 border-red-200' :
                          TEMPLATE_STATUS_COLORS[template.status] === 'orange' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {TEMPLATE_STATUS_LABELS[template.status]}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {template.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {template.language.toUpperCase()}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.bodyContent}
                    </p>

                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>Usado {template.usageCount} veces</span>
                      {template.successfulSends > 0 && (
                        <>
                          <span>•</span>
                          <span>{template.successfulSends} envíos exitosos</span>
                        </>
                      )}
                      {template.lastUsedAt && (
                        <>
                          <span>•</span>
                          <span>Último uso: {new Date(template.lastUsedAt).toLocaleDateString()}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>Creado por {template.createdByName}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = `/campaigns/templates/${template.id}`}
                    >
                      Ver detalles
                    </Button>
                    {canManageTemplates && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.location.href = `/campaigns/templates/${template.id}/edit`}
                      >
                        Editar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
