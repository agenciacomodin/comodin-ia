

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Clock, 
  MessageSquare, 
  User, 
  Calendar,
  Settings,
  Play,
  Pause,
  Trash2,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

// Tipos para los seguimientos
interface FollowUp {
  id: string
  conversationId: string
  contactId: string
  contactName: string
  contactPhone: string
  contactAvatar?: string
  status: 'SCHEDULED' | 'SENT' | 'COMPLETED' | 'CANCELLED'
  followUpType: 'MANUAL' | 'AUTO_REMINDER' | 'AUTO_FOLLOW_UP'
  message: string
  scheduledFor: Date
  intervalHours: number
  maxFollowUps: number
  currentAttempt: number
  createdBy: string
  createdByName: string
  lastSentAt?: Date
  completedAt?: Date
  createdAt: Date
}

interface CreateFollowUpRequest {
  conversationId: string
  message: string
  scheduledFor: Date
  intervalHours: number
  maxFollowUps: number
  followUpType: 'MANUAL' | 'AUTO_REMINDER' | 'AUTO_FOLLOW_UP'
}

// Mock data para desarrollo
const mockFollowUps: FollowUp[] = [
  {
    id: '1',
    conversationId: 'conv1',
    contactId: 'contact1',
    contactName: 'María González',
    contactPhone: '+54 11 2345-6789',
    status: 'SCHEDULED',
    followUpType: 'AUTO_REMINDER',
    message: 'Hola María! Te escribo para hacer seguimiento de tu consulta sobre nuestros productos. ¿Hay algo más en lo que te pueda ayudar?',
    scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000), // En 2 horas
    intervalHours: 24,
    maxFollowUps: 3,
    currentAttempt: 1,
    createdBy: 'user1',
    createdByName: 'Juan Pérez',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    conversationId: 'conv2',
    contactId: 'contact2',
    contactName: 'Carlos Rivera',
    contactPhone: '+54 11 3456-7890',
    status: 'SENT',
    followUpType: 'MANUAL',
    message: 'Estimado Carlos, quería consultar si ya tuviste oportunidad de revisar la propuesta que te enviamos.',
    scheduledFor: new Date(Date.now() - 30 * 60 * 1000), // Hace 30 min
    intervalHours: 48,
    maxFollowUps: 1,
    currentAttempt: 1,
    createdBy: 'user2',
    createdByName: 'Ana Martínez',
    lastSentAt: new Date(Date.now() - 30 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    conversationId: 'conv3',
    contactId: 'contact3',
    contactName: 'Luis Herrera',
    contactPhone: '+54 11 4567-8901',
    status: 'COMPLETED',
    followUpType: 'AUTO_FOLLOW_UP',
    message: 'Hola Luis! Gracias por tu interés. ¿Te gustaría agendar una llamada para conversar más detalles?',
    scheduledFor: new Date(Date.now() - 24 * 60 * 60 * 1000),
    intervalHours: 72,
    maxFollowUps: 2,
    currentAttempt: 2,
    createdBy: 'user1',
    createdByName: 'Juan Pérez',
    lastSentAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
]

export function FollowUpSystem() {
  const { data: session } = useSession() || {}
  const [followUps, setFollowUps] = useState<FollowUp[]>(mockFollowUps)
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedTab, setSelectedTab] = useState('active')
  const [stats, setStats] = useState({
    scheduled: 0,
    sent: 0,
    completed: 0,
    totalToday: 0
  })

  // Formulario para crear seguimiento
  const [newFollowUp, setNewFollowUp] = useState<Partial<CreateFollowUpRequest>>({
    message: '',
    scheduledFor: new Date(Date.now() + 60 * 60 * 1000), // En 1 hora por defecto
    intervalHours: 24,
    maxFollowUps: 3,
    followUpType: 'AUTO_REMINDER'
  })

  const [selectedConversation, setSelectedConversation] = useState('')

  useEffect(() => {
    calculateStats()
  }, [followUps])

  const calculateStats = () => {
    const scheduled = followUps.filter(f => f.status === 'SCHEDULED').length
    const sent = followUps.filter(f => f.status === 'SENT').length
    const completed = followUps.filter(f => f.status === 'COMPLETED').length
    const today = new Date()
    const totalToday = followUps.filter(f => {
      const schedDate = new Date(f.scheduledFor)
      return schedDate.toDateString() === today.toDateString()
    }).length

    setStats({ scheduled, sent, completed, totalToday })
  }

  const getStatusColor = (status: FollowUp['status']) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'SENT':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: FollowUp['status']) => {
    switch (status) {
      case 'SCHEDULED':
        return <Clock className="h-3 w-3" />
      case 'SENT':
        return <MessageSquare className="h-3 w-3" />
      case 'COMPLETED':
        return <CheckCircle className="h-3 w-3" />
      case 'CANCELLED':
        return <AlertCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const getTypeLabel = (type: FollowUp['followUpType']) => {
    switch (type) {
      case 'MANUAL':
        return 'Manual'
      case 'AUTO_REMINDER':
        return 'Recordatorio'
      case 'AUTO_FOLLOW_UP':
        return 'Seguimiento'
      default:
        return type
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const hours = Math.round(diff / (1000 * 60 * 60))
    
    if (Math.abs(hours) < 1) {
      const minutes = Math.round(diff / (1000 * 60))
      if (minutes > 0) {
        return `En ${minutes} min`
      } else {
        return `Hace ${Math.abs(minutes)} min`
      }
    } else if (hours > 0) {
      return hours < 24 ? `En ${hours}h` : `En ${Math.ceil(hours/24)} días`
    } else {
      return Math.abs(hours) < 24 ? `Hace ${Math.abs(hours)}h` : `Hace ${Math.ceil(Math.abs(hours)/24)} días`
    }
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleCreateFollowUp = async () => {
    if (!selectedConversation || !newFollowUp.message || !newFollowUp.scheduledFor) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    setIsLoading(true)
    try {
      // Simular creación de seguimiento
      const mockNewFollowUp: FollowUp = {
        id: `new_${Date.now()}`,
        conversationId: selectedConversation,
        contactId: `contact_${Date.now()}`,
        contactName: 'Nuevo Contacto',
        contactPhone: '+54 11 0000-0000',
        status: 'SCHEDULED',
        followUpType: newFollowUp.followUpType || 'AUTO_REMINDER',
        message: newFollowUp.message,
        scheduledFor: newFollowUp.scheduledFor,
        intervalHours: newFollowUp.intervalHours || 24,
        maxFollowUps: newFollowUp.maxFollowUps || 3,
        currentAttempt: 1,
        createdBy: session?.user?.id || 'current_user',
        createdByName: session?.user?.name || 'Usuario Actual',
        createdAt: new Date(),
      }

      setFollowUps(prev => [mockNewFollowUp, ...prev])
      setShowCreateDialog(false)
      toast.success('Seguimiento programado exitosamente')
      
      // Reset form
      setNewFollowUp({
        message: '',
        scheduledFor: new Date(Date.now() + 60 * 60 * 1000),
        intervalHours: 24,
        maxFollowUps: 3,
        followUpType: 'AUTO_REMINDER'
      })
      setSelectedConversation('')
    } catch (error) {
      console.error('Error creating follow-up:', error)
      toast.error('Error al programar el seguimiento')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelFollowUp = async (id: string) => {
    try {
      setFollowUps(prev => 
        prev.map(f => 
          f.id === id 
            ? { ...f, status: 'CANCELLED' as const }
            : f
        )
      )
      toast.success('Seguimiento cancelado')
    } catch (error) {
      console.error('Error canceling follow-up:', error)
      toast.error('Error al cancelar el seguimiento')
    }
  }

  const filteredFollowUps = followUps.filter(followUp => {
    switch (selectedTab) {
      case 'active':
        return ['SCHEDULED', 'SENT'].includes(followUp.status)
      case 'scheduled':
        return followUp.status === 'SCHEDULED'
      case 'sent':
        return followUp.status === 'SENT'
      case 'completed':
        return followUp.status === 'COMPLETED'
      case 'cancelled':
        return followUp.status === 'CANCELLED'
      default:
        return true
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Seguimientos</h2>
          <p className="text-gray-600">
            Gestiona el seguimiento automático de conversaciones abiertas
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Seguimiento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Programar Seguimiento</DialogTitle>
              <DialogDescription>
                Configura un seguimiento automático para retomar conversaciones abiertas
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="conversation">Conversación</Label>
                <Select value={selectedConversation} onValueChange={setSelectedConversation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una conversación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conv1">María González - Consulta productos</SelectItem>
                    <SelectItem value="conv2">Carlos Rivera - Propuesta pendiente</SelectItem>
                    <SelectItem value="conv3">Ana López - Información precios</SelectItem>
                    <SelectItem value="conv4">Diego Morales - Soporte técnico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type">Tipo de Seguimiento</Label>
                <Select 
                  value={newFollowUp.followUpType} 
                  onValueChange={(value: any) => setNewFollowUp(prev => ({ ...prev, followUpType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MANUAL">Manual - Una sola vez</SelectItem>
                    <SelectItem value="AUTO_REMINDER">Recordatorio - Repetir si no responde</SelectItem>
                    <SelectItem value="AUTO_FOLLOW_UP">Seguimiento - Serie automática</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message">Mensaje de Seguimiento</Label>
                <Textarea
                  id="message"
                  value={newFollowUp.message}
                  onChange={(e) => setNewFollowUp(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Escribe el mensaje que se enviará en el seguimiento..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduledFor">Programar para</Label>
                  <Input
                    id="scheduledFor"
                    type="datetime-local"
                    value={newFollowUp.scheduledFor?.toISOString().slice(0, 16)}
                    onChange={(e) => setNewFollowUp(prev => ({ 
                      ...prev, 
                      scheduledFor: new Date(e.target.value) 
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="interval">Intervalo (horas)</Label>
                  <Select 
                    value={newFollowUp.intervalHours?.toString()} 
                    onValueChange={(value) => setNewFollowUp(prev => ({ 
                      ...prev, 
                      intervalHours: parseInt(value) 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hora</SelectItem>
                      <SelectItem value="4">4 horas</SelectItem>
                      <SelectItem value="12">12 horas</SelectItem>
                      <SelectItem value="24">24 horas (1 día)</SelectItem>
                      <SelectItem value="48">48 horas (2 días)</SelectItem>
                      <SelectItem value="72">72 horas (3 días)</SelectItem>
                      <SelectItem value="168">168 horas (1 semana)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="maxFollowUps">Máximo de intentos</Label>
                <Select 
                  value={newFollowUp.maxFollowUps?.toString()} 
                  onValueChange={(value) => setNewFollowUp(prev => ({ 
                    ...prev, 
                    maxFollowUps: parseInt(value) 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 intento</SelectItem>
                    <SelectItem value="2">2 intentos</SelectItem>
                    <SelectItem value="3">3 intentos</SelectItem>
                    <SelectItem value="5">5 intentos</SelectItem>
                    <SelectItem value="10">10 intentos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateFollowUp} disabled={isLoading}>
                {isLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                Programar Seguimiento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programados</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
            <p className="text-xs text-gray-600">
              Pendientes de envío
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enviados</CardTitle>
            <MessageSquare className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.sent}</div>
            <p className="text-xs text-gray-600">
              Esperando respuesta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-gray-600">
              Con respuesta exitosa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalToday}</div>
            <p className="text-xs text-gray-600">
              Programados para hoy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de seguimientos */}
      <Card>
        <CardHeader>
          <CardTitle>Seguimientos Activos</CardTitle>
          <CardDescription>
            Lista de todos los seguimientos programados y su estado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="active">Activos</TabsTrigger>
              <TabsTrigger value="scheduled">Programados</TabsTrigger>
              <TabsTrigger value="sent">Enviados</TabsTrigger>
              <TabsTrigger value="completed">Completados</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelados</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="space-y-4">
              {filteredFollowUps.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No hay seguimientos en esta categoría.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {filteredFollowUps.map((followUp) => (
                    <Card key={followUp.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={followUp.contactAvatar} />
                              <AvatarFallback>
                                {getUserInitials(followUp.contactName)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center space-x-3">
                                <h3 className="font-semibold text-gray-900">
                                  {followUp.contactName}
                                </h3>
                                <Badge className={cn("text-xs", getStatusColor(followUp.status))}>
                                  {getStatusIcon(followUp.status)}
                                  <span className="ml-1">{followUp.status}</span>
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {getTypeLabel(followUp.followUpType)}
                                </Badge>
                              </div>

                              <div className="text-sm text-gray-600">
                                <p className="mb-1">{followUp.contactPhone}</p>
                                <p className="italic">{followUp.message}</p>
                              </div>

                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatDate(followUp.scheduledFor)}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <RefreshCw className="h-3 w-3" />
                                  <span>
                                    {followUp.currentAttempt} / {followUp.maxFollowUps} intentos
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <User className="h-3 w-3" />
                                  <span>por {followUp.createdByName}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {followUp.status === 'SCHEDULED' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleCancelFollowUp(followUp.id)}
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <Button size="sm" variant="outline" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
