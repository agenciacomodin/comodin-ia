

'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Permission } from '@/lib/permissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Copy, 
  Hash, 
  Clock, 
  User,
  Tag,
  MessageSquare,
  BarChart3,
  Settings
} from 'lucide-react'
import { 
  QuickReplySummary,
  QuickReplyCreateRequest,
  QuickReplySearchFilters
} from '@/lib/types'
import { toast } from 'react-hot-toast'

// Datos de muestra para respuestas rápidas
const mockQuickReplies: QuickReplySummary[] = [
  {
    id: 'qr1',
    title: 'Saludo Inicial',
    shortcut: 'hola',
    content: '¡Hola! Gracias por contactarnos. ¿En qué podemos ayudarte hoy?',
    category: 'Saludos',
    tags: ['saludo', 'bienvenida', 'inicio'],
    usageCount: 156,
    lastUsedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    createdByName: 'Ana Martínez'
  },
  {
    id: 'qr2',
    title: 'Información de Precios',
    shortcut: 'precios',
    content: 'Te envío nuestra lista de precios actualizada. Si tienes alguna duda específica sobre algún producto o servicio, no dudes en consultarme.',
    category: 'Ventas',
    tags: ['precios', 'ventas', 'productos', 'servicios'],
    usageCount: 89,
    lastUsedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    createdByName: 'Carlos Rivera'
  },
  {
    id: 'qr3',
    title: 'Horarios de Atención',
    shortcut: 'horarios',
    content: 'Nuestros horarios de atención son:\n\n📅 Lunes a Viernes: 9:00 AM - 6:00 PM\n📅 Sábados: 9:00 AM - 2:00 PM\n📅 Domingos: Cerrado\n\nEstamos aquí para ayudarte durante estos horarios.',
    category: 'Información',
    tags: ['horarios', 'atencion', 'disponibilidad', 'tiempo'],
    usageCount: 124,
    lastUsedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    createdByName: 'María González'
  },
  {
    id: 'qr4',
    title: 'Agradecimiento y Cierre',
    shortcut: 'gracias',
    content: '¡Gracias por contactarnos! Ha sido un placer atenderte. Si tienes alguna otra consulta o necesitas ayuda adicional, estaremos aquí para ayudarte.',
    category: 'Despedida',
    tags: ['gracias', 'despedida', 'cierre', 'final'],
    usageCount: 203,
    lastUsedAt: new Date(Date.now() - 30 * 60 * 1000),
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    createdByName: 'Luis Herrera'
  },
  {
    id: 'qr5',
    title: 'Soporte Técnico',
    shortcut: 'soporte',
    content: 'Para brindarte el mejor soporte técnico posible, necesito algunos datos adicionales:\n\n• Modelo del producto\n• Descripción detallada del problema\n• Fotos del problema si es necesario\n\nCon esta información podré ayudarte de manera más efectiva.',
    category: 'Soporte',
    tags: ['soporte', 'tecnico', 'ayuda', 'problema'],
    usageCount: 67,
    lastUsedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    createdByName: 'Diego Morales'
  },
  {
    id: 'qr6',
    title: 'Información de Envíos',
    shortcut: 'envios',
    content: 'Información sobre envíos:\n\n📦 Envío gratis en compras mayores a $500\n🚚 Tiempo de entrega: 3-5 días hábiles\n📍 Cobertura nacional\n📋 Número de rastreo enviado por email',
    category: 'Logística',
    tags: ['envios', 'entrega', 'logistica', 'tiempo'],
    usageCount: 45,
    lastUsedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    createdByName: 'Sofia López'
  }
]

const categories = ['Saludos', 'Ventas', 'Información', 'Soporte', 'Despedida', 'Logística']

export default function QuickRepliesPage() {
  const { data: session } = useSession() || {}
  const [quickReplies, setQuickReplies] = useState<QuickReplySummary[]>(mockQuickReplies)
  const [selectedReplies, setSelectedReplies] = useState<string[]>([])
  
  // Estados para filtros y búsqueda
  const [filters, setFilters] = useState<QuickReplySearchFilters>({
    searchTerm: '',
    category: undefined,
    isActive: undefined
  })
  
  // Estados para formularios
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingReply, setEditingReply] = useState<QuickReplySummary | null>(null)
  const [newReply, setNewReply] = useState<QuickReplyCreateRequest>({
    title: '',
    shortcut: '',
    content: '',
    category: '',
    tags: [],
    isGlobal: false
  })

  // Filtrar respuestas rápidas
  const filteredReplies = quickReplies.filter(reply => {
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase()
      if (!reply.title.toLowerCase().includes(search) && 
          !reply.shortcut.toLowerCase().includes(search) &&
          !reply.content.toLowerCase().includes(search) &&
          !reply.tags.some(tag => tag.toLowerCase().includes(search))) {
        return false
      }
    }
    
    if (filters.category && reply.category !== filters.category) {
      return false
    }
    
    return true
  })

  // Estadísticas
  const totalReplies = quickReplies.length
  const totalUsage = quickReplies.reduce((sum, reply) => sum + reply.usageCount, 0)
  const activeReplies = quickReplies.length // Assuming all are active for demo
  const recentlyUsed = quickReplies.filter(r => 
    r.lastUsedAt && r.lastUsedAt > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length

  // Handlers
  const handleCreateReply = () => {
    if (!newReply.title || !newReply.shortcut || !newReply.content) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    // Verificar que el shortcut no exista
    if (quickReplies.some(r => r.shortcut === newReply.shortcut)) {
      toast.error('El atajo ya existe. Elige otro diferente.')
      return
    }

    const createdReply: QuickReplySummary = {
      id: `qr_${Date.now()}`,
      title: newReply.title,
      shortcut: newReply.shortcut,
      content: newReply.content,
      category: newReply.category,
      tags: newReply.tags || [],
      usageCount: 0,
      createdAt: new Date(),
      createdByName: session?.user?.name || 'Usuario Actual'
    }

    setQuickReplies(prev => [...prev, createdReply])
    toast.success('Respuesta rápida creada exitosamente')
    
    // Limpiar formulario
    setNewReply({
      title: '',
      shortcut: '',
      content: '',
      category: '',
      tags: [],
      isGlobal: false
    })
    setIsCreateDialogOpen(false)
  }

  const handleEditReply = (reply: QuickReplySummary) => {
    setEditingReply(reply)
    setNewReply({
      title: reply.title,
      shortcut: reply.shortcut,
      content: reply.content,
      category: reply.category || '',
      tags: reply.tags,
      isGlobal: false // This would come from the full data
    })
  }

  const handleUpdateReply = () => {
    if (!editingReply) return

    setQuickReplies(prev => prev.map(reply => 
      reply.id === editingReply.id 
        ? {
            ...reply,
            title: newReply.title,
            shortcut: newReply.shortcut,
            content: newReply.content,
            category: newReply.category,
            tags: newReply.tags || []
          }
        : reply
    ))
    
    toast.success('Respuesta rápida actualizada')
    setEditingReply(null)
    setNewReply({
      title: '',
      shortcut: '',
      content: '',
      category: '',
      tags: [],
      isGlobal: false
    })
  }

  const handleDeleteReply = (replyId: string) => {
    setQuickReplies(prev => prev.filter(reply => reply.id !== replyId))
    toast.success('Respuesta rápida eliminada')
  }

  const handleCopyShortcut = (shortcut: string) => {
    navigator.clipboard.writeText(`/${shortcut}`)
    toast.success('Atajo copiado al portapapeles')
  }

  const formatLastUsed = (date?: Date): string => {
    if (!date) return 'Nunca'
    
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (hours < 1) return 'Hace menos de 1 hora'
    if (hours < 24) return `Hace ${hours} horas`
    if (days < 7) return `Hace ${days} días`
    return date.toLocaleDateString('es-ES')
  }

  const handleTagInput = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag)
    setNewReply(prev => ({ ...prev, tags }))
  }

  return (
    <ProtectedRoute permissions={[Permission.MANAGE_ORGANIZATION_SETTINGS]}>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Respuestas Rápidas</h1>
              <p className="text-gray-600 mt-1">
                Gestiona plantillas de mensajes para responder más eficientemente
              </p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Respuesta
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalReplies}</p>
                  <p className="text-sm text-gray-600">Total Respuestas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalUsage}</p>
                  <p className="text-sm text-gray-600">Usos Totales</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Settings className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{activeReplies}</p>
                  <p className="text-sm text-gray-600">Activas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Clock className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{recentlyUsed}</p>
                  <p className="text-sm text-gray-600">Usadas Hoy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Gestión de Respuestas Rápidas</CardTitle>
            <CardDescription>
              Administra todas tus plantillas de mensajes desde aquí
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filtros */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por título, atajo o contenido..."
                    value={filters.searchTerm || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select 
                value={filters.category || 'all'}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  category: value === 'all' ? undefined : value 
                }))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lista de respuestas rápidas */}
            <div className="space-y-4">
              {filteredReplies.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {filters.searchTerm ? 'No se encontraron respuestas' : 'No hay respuestas rápidas'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {filters.searchTerm ? 
                      'Intenta con otros términos de búsqueda' : 
                      'Crea tu primera respuesta rápida para comenzar'
                    }
                  </p>
                  {!filters.searchTerm && (
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primera Respuesta
                    </Button>
                  )}
                </div>
              ) : (
                filteredReplies.map((reply) => (
                  <div
                    key={reply.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{reply.title}</h3>
                          <button
                            onClick={() => handleCopyShortcut(reply.shortcut)}
                            className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md hover:bg-blue-200 transition-colors"
                          >
                            <Hash className="h-3 w-3" />
                            <span>/{reply.shortcut}</span>
                            <Copy className="h-3 w-3" />
                          </button>
                          {reply.category && (
                            <Badge variant="secondary" className="text-xs">
                              {reply.category}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                          {reply.content}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          {reply.tags.map(tag => (
                            <span key={tag} className="inline-flex items-center space-x-1">
                              <Tag className="h-3 w-3" />
                              <span>{tag}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <div className="text-right text-sm">
                          <div className="flex items-center space-x-1 text-gray-600 mb-1">
                            <BarChart3 className="h-3 w-3" />
                            <span>{reply.usageCount} usos</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{formatLastUsed(reply.lastUsedAt)}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-500">
                            <User className="h-3 w-3" />
                            <span className="truncate max-w-20">{reply.createdByName}</span>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditReply(reply)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar respuesta rápida?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente 
                                  la respuesta rápida "{reply.title}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleDeleteReply(reply.id)}
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dialog para crear/editar respuesta rápida */}
        <Dialog 
          open={isCreateDialogOpen || !!editingReply} 
          onOpenChange={(open) => {
            if (!open) {
              setIsCreateDialogOpen(false)
              setEditingReply(null)
              setNewReply({
                title: '',
                shortcut: '',
                content: '',
                category: '',
                tags: [],
                isGlobal: false
              })
            }
          }}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingReply ? 'Editar Respuesta Rápida' : 'Nueva Respuesta Rápida'}
              </DialogTitle>
              <DialogDescription>
                {editingReply ? 
                  'Modifica los datos de la respuesta rápida' : 
                  'Crea una nueva plantilla de mensaje para usar en conversaciones'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reply-title">Título *</Label>
                  <Input
                    id="reply-title"
                    value={newReply.title}
                    onChange={(e) => setNewReply(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ej: Saludo Inicial"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reply-shortcut">Atajo *</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="reply-shortcut"
                      value={newReply.shortcut}
                      onChange={(e) => setNewReply(prev => ({ ...prev, shortcut: e.target.value }))}
                      placeholder="hola"
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Escribe /{newReply.shortcut || 'atajo'} en el chat para usar esta respuesta
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reply-content">Contenido del Mensaje *</Label>
                <Textarea
                  id="reply-content"
                  value={newReply.content}
                  onChange={(e) => setNewReply(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Escribe el contenido del mensaje aquí..."
                  rows={4}
                />
                <p className="text-xs text-gray-500">
                  {newReply.content.length} caracteres
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reply-category">Categoría</Label>
                  <Select 
                    value={newReply.category || ''}
                    onValueChange={(value) => setNewReply(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reply-tags">Tags</Label>
                  <Input
                    id="reply-tags"
                    value={newReply.tags?.join(', ') || ''}
                    onChange={(e) => handleTagInput(e.target.value)}
                    placeholder="tag1, tag2, tag3"
                  />
                  <p className="text-xs text-gray-500">
                    Separar por comas para facilitar la búsqueda
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <Label>Respuesta Global</Label>
                  <p className="text-sm text-gray-600">
                    Disponible para todos los agentes de la organización
                  </p>
                </div>
                <Switch
                  checked={newReply.isGlobal}
                  onCheckedChange={(checked) => setNewReply(prev => ({ ...prev, isGlobal: checked }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsCreateDialogOpen(false)
                setEditingReply(null)
              }}>
                Cancelar
              </Button>
              <Button onClick={editingReply ? handleUpdateReply : handleCreateReply}>
                {editingReply ? 'Actualizar' : 'Crear'} Respuesta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}
