
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
  Eye,
  Edit3,
  Send,
  Target,
  TrendingUp,
  Users,
  MessageCircle,
  BarChart3,
  Timer,
  Tag,
  Zap,
  ArrowRight,
  Copy,
  Save,
  X
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
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  FollowUpSequenceData,
  FollowUpStepData,
  FollowUpExecutionData,
  FollowUpMetrics,
  FollowUpChannelOption,
  TimeUnitOption,
  TagOption,
  FollowUpTriggerType,
  FollowUpChannel,
  FollowUpStatus,
  TimeUnit
} from '@/lib/types'

// Configuraciones y opciones
const CHANNEL_OPTIONS: FollowUpChannelOption[] = [
  {
    value: 'WHATSAPP_QR' as FollowUpChannel,
    label: 'WhatsApp Business',
    description: 'Máximo 40 mensajes/día, sin plantillas verificadas',
    icon: 'message-circle',
    available: true,
    limitations: '40 mensajes/día'
  },
  {
    value: 'WHATSAPP_API' as FollowUpChannel,
    label: 'WhatsApp API',
    description: 'Mensajes ilimitados con plantillas verificadas',
    icon: 'message-square',
    available: true,
    limitations: 'Solo plantillas verificadas'
  },
  {
    value: 'INSTAGRAM' as FollowUpChannel,
    label: 'Instagram',
    description: 'Mensajes directos de Instagram',
    icon: 'instagram',
    available: false,
    limitations: 'Próximamente'
  },
  {
    value: 'SMS' as FollowUpChannel,
    label: 'SMS',
    description: 'Mensajes de texto SMS',
    icon: 'message-circle',
    available: false,
    limitations: 'Próximamente'
  },
  {
    value: 'EMAIL' as FollowUpChannel,
    label: 'Email',
    description: 'Correos electrónicos',
    icon: 'mail',
    available: false,
    limitations: 'Próximamente'
  }
]

const TIME_UNIT_OPTIONS: TimeUnitOption[] = [
  {
    value: 'MINUTES' as TimeUnit,
    label: 'Minutos',
    multiplier: 1
  },
  {
    value: 'HOURS' as TimeUnit,
    label: 'Horas', 
    multiplier: 60
  },
  {
    value: 'DAYS' as TimeUnit,
    label: 'Días',
    multiplier: 1440
  }
]

// Mock data para desarrollo
const mockTags: TagOption[] = [
  { id: '1', name: 'Cliente VIP', color: '#FFD700', count: 45 },
  { id: '2', name: 'Lead Caliente', color: '#FF6B6B', count: 23 },
  { id: '3', name: 'Prospecto', color: '#4ECDC4', count: 67 },
  { id: '4', name: 'Cliente Perdido', color: '#95A5A6', count: 12 },
  { id: '5', name: 'Seguimiento Pendiente', color: '#FFA726', count: 34 }
]

const mockSequences: FollowUpSequenceData[] = [
  {
    id: '1',
    name: 'Recuperación de Leads Fríos',
    description: 'Secuencia para reactivar leads que no han respondido en 3 días',
    isActive: true,
    triggerType: 'TAG_BASED' as FollowUpTriggerType,
    triggerTags: ['Lead Caliente', 'Prospecto'],
    triggerChannels: ['WHATSAPP_QR', 'WHATSAPP_API'] as FollowUpChannel[],
    noResponseTime: 3,
    noResponseUnit: 'DAYS' as TimeUnit,
    maxAttempts: 3,
    stopOnReply: true,
    steps: [
      {
        stepOrder: 1,
        waitTime: 3,
        waitUnit: 'DAYS' as TimeUnit,
        messageContent: 'Hola {{nombre_contacto}}! 👋 Noté que estuviste interesado en nuestros productos. ¿Hay alguna duda que pueda resolver?',
        channels: ['WHATSAPP_QR'] as FollowUpChannel[],
        isActive: true
      },
      {
        stepOrder: 2,
        waitTime: 2,
        waitUnit: 'DAYS' as TimeUnit,
        messageContent: 'Hola {{nombre_contacto}}, ¿te gustaría que te envíe más información sobre nuestros planes especiales? Tenemos descuentos disponibles.',
        channels: ['WHATSAPP_QR'] as FollowUpChannel[],
        isActive: true
      }
    ]
  }
]

const mockMetrics: FollowUpMetrics = {
  activeSequences: 3,
  totalExecutions: 156,
  completedToday: 12,
  scheduledToday: 8,
  totalMessagesSent: 423,
  totalRepliesReceived: 189,
  averageResponseTime: 4.2,
  conversionRate: 44.7
}

const mockActiveExecutions: FollowUpExecutionData[] = [
  {
    id: '1',
    sequenceId: '1',
    sequenceName: 'Recuperación de Leads Fríos',
    conversationId: 'conv1',
    contactName: 'María González',
    contactPhone: '+54 11 2345-6789',
    status: 'ACTIVE' as FollowUpStatus,
    currentStep: 1,
    totalSteps: 2,
    lastMessageSent: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    nextScheduled: new Date(Date.now() + 6 * 60 * 60 * 1000),
    messagesSent: 1,
    repliesReceived: 0,
    createdBy: 'user1',
    createdByName: 'Juan Pérez',
    startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    stepExecutions: []
  }
]

export function AdvancedFollowUpSystem() {
  const { data: session } = useSession() || {}
  const [selectedTab, setSelectedTab] = useState('dashboard')
  const [sequences, setSequences] = useState<FollowUpSequenceData[]>(mockSequences)
  const [metrics, setMetrics] = useState<FollowUpMetrics>(mockMetrics)
  const [activeExecutions, setActiveExecutions] = useState<FollowUpExecutionData[]>(mockActiveExecutions)
  const [isLoading, setIsLoading] = useState(false)

  // Estados para el creador de secuencias
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingSequence, setEditingSequence] = useState<FollowUpSequenceData | null>(null)
  const [newSequence, setNewSequence] = useState<FollowUpSequenceData>({
    name: '',
    description: '',
    isActive: true,
    triggerType: 'MANUAL' as FollowUpTriggerType,
    triggerTags: [],
    triggerChannels: ['WHATSAPP_QR'] as FollowUpChannel[],
    noResponseTime: 24,
    noResponseUnit: 'HOURS' as TimeUnit,
    maxAttempts: 3,
    stopOnReply: true,
    steps: [
      {
        stepOrder: 1,
        waitTime: 24,
        waitUnit: 'HOURS' as TimeUnit,
        messageContent: '',
        channels: ['WHATSAPP_QR'] as FollowUpChannel[],
        isActive: true
      }
    ]
  })

  const getStatusColor = (status: FollowUpStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'EXPIRED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: FollowUpStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <Play className="h-3 w-3" />
      case 'PAUSED':
        return <Pause className="h-3 w-3" />
      case 'COMPLETED':
        return <CheckCircle className="h-3 w-3" />
      case 'CANCELLED':
        return <X className="h-3 w-3" />
      case 'EXPIRED':
        return <AlertCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const formatTimeUnit = (time: number, unit: TimeUnit) => {
    if (time === 1) {
      switch (unit) {
        case 'MINUTES': return `${time} minuto`
        case 'HOURS': return `${time} hora`
        case 'DAYS': return `${time} día`
      }
    }
    switch (unit) {
      case 'MINUTES': return `${time} minutos`
      case 'HOURS': return `${time} horas`
      case 'DAYS': return `${time} días`
    }
  }

  const addStep = () => {
    const newStep: FollowUpStepData = {
      stepOrder: newSequence.steps.length + 1,
      waitTime: 24,
      waitUnit: 'HOURS' as TimeUnit,
      messageContent: '',
      channels: ['WHATSAPP_QR'] as FollowUpChannel[],
      isActive: true
    }
    setNewSequence(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }))
  }

  const removeStep = (stepIndex: number) => {
    if (newSequence.steps.length > 1) {
      setNewSequence(prev => ({
        ...prev,
        steps: prev.steps.filter((_, index) => index !== stepIndex)
          .map((step, index) => ({ ...step, stepOrder: index + 1 }))
      }))
    }
  }

  const updateStep = (stepIndex: number, field: keyof FollowUpStepData, value: any) => {
    setNewSequence(prev => ({
      ...prev,
      steps: prev.steps.map((step, index) => 
        index === stepIndex ? { ...step, [field]: value } : step
      )
    }))
  }

  const handleCreateSequence = async () => {
    if (!newSequence.name || !newSequence.steps[0]?.messageContent) {
      toast.error('Por favor completa el nombre y al menos un mensaje de seguimiento')
      return
    }

    setIsLoading(true)
    try {
      // Aquí iría la llamada a la API
      const createdSequence = {
        ...newSequence,
        id: `seq_${Date.now()}`,
        createdBy: session?.user?.id || 'current_user',
        createdByName: session?.user?.name || 'Usuario Actual'
      }

      setSequences(prev => [createdSequence, ...prev])
      setShowCreateDialog(false)
      setEditingSequence(null)
      toast.success('Secuencia de seguimiento creada exitosamente')
      
      // Reset form
      setNewSequence({
        name: '',
        description: '',
        isActive: true,
        triggerType: 'MANUAL' as FollowUpTriggerType,
        triggerTags: [],
        triggerChannels: ['WHATSAPP_QR'] as FollowUpChannel[],
        noResponseTime: 24,
        noResponseUnit: 'HOURS' as TimeUnit,
        maxAttempts: 3,
        stopOnReply: true,
        steps: [
          {
            stepOrder: 1,
            waitTime: 24,
            waitUnit: 'HOURS' as TimeUnit,
            messageContent: '',
            channels: ['WHATSAPP_QR'] as FollowUpChannel[],
            isActive: true
          }
        ]
      })
    } catch (error) {
      console.error('Error creating sequence:', error)
      toast.error('Error al crear la secuencia de seguimiento')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSequenceStatus = async (sequenceId: string, isActive: boolean) => {
    try {
      setSequences(prev => 
        prev.map(seq => 
          seq.id === sequenceId 
            ? { ...seq, isActive }
            : seq
        )
      )
      toast.success(`Secuencia ${isActive ? 'activada' : 'desactivada'} correctamente`)
    } catch (error) {
      console.error('Error updating sequence:', error)
      toast.error('Error al actualizar la secuencia')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Seguimientos Automáticos</h2>
          <p className="text-gray-600">
            Sistema granular de seguimientos para recuperar ventas perdidas y automatizar la persistencia con clientes
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Secuencia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSequence ? 'Editar Secuencia' : 'Crear Secuencia de Seguimiento'}
              </DialogTitle>
              <DialogDescription>
                Configura una secuencia compleja de seguimientos automatizados para recuperar conversaciones abandonadas
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Información Básica */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Información Básica</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre de la Secuencia *</Label>
                    <Input
                      id="name"
                      value={newSequence.name}
                      onChange={(e) => setNewSequence(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="ej. Recuperación de Leads Fríos"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={newSequence.description}
                      onChange={(e) => setNewSequence(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe el objetivo de esta secuencia..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Configuración de Disparadores */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Disparadores de Activación</h4>
                
                <div>
                  <Label>Tipo de Disparador</Label>
                  <Select 
                    value={newSequence.triggerType} 
                    onValueChange={(value: FollowUpTriggerType) => 
                      setNewSequence(prev => ({ ...prev, triggerType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MANUAL">Manual - Activación manual por conversación</SelectItem>
                      <SelectItem value="TAG_BASED">Por Etiquetas - Se activa automáticamente</SelectItem>
                      <SelectItem value="NO_RESPONSE">Sin Respuesta - Por tiempo de inactividad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newSequence.triggerType === 'TAG_BASED' && (
                  <div>
                    <Label>Etiquetas que Activan la Secuencia</Label>
                    <p className="text-sm text-gray-600 mb-2">
                      Los contactos con estas etiquetas activarán automáticamente esta secuencia
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {mockTags.map((tag) => (
                        <div key={tag.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tag-${tag.id}`}
                            checked={newSequence.triggerTags.includes(tag.name)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewSequence(prev => ({
                                  ...prev,
                                  triggerTags: [...prev.triggerTags, tag.name]
                                }))
                              } else {
                                setNewSequence(prev => ({
                                  ...prev,
                                  triggerTags: prev.triggerTags.filter(t => t !== tag.name)
                                }))
                              }
                            }}
                          />
                          <label htmlFor={`tag-${tag.id}`} className="text-sm flex items-center space-x-1">
                            <span 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: tag.color }}
                            />
                            <span>{tag.name}</span>
                            <span className="text-gray-500">({tag.count})</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Condición de Tiempo</Label>
                    <p className="text-sm text-gray-600 mb-2">
                      Si no hay respuesta después de...
                    </p>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        min="1"
                        value={newSequence.noResponseTime}
                        onChange={(e) => setNewSequence(prev => ({ 
                          ...prev, 
                          noResponseTime: parseInt(e.target.value) || 1 
                        }))}
                        className="w-20"
                      />
                      <Select 
                        value={newSequence.noResponseUnit} 
                        onValueChange={(value: TimeUnit) => 
                          setNewSequence(prev => ({ ...prev, noResponseUnit: value }))
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_UNIT_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Máximo de Intentos</Label>
                    <Select 
                      value={newSequence.maxAttempts.toString()} 
                      onValueChange={(value) => setNewSequence(prev => ({ 
                        ...prev, 
                        maxAttempts: parseInt(value) 
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
              </div>

              <Separator />

              {/* Selección de Canales */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Canales de Envío</h4>
                <p className="text-sm text-gray-600">
                  Selecciona por qué canales se enviarán los mensajes de seguimiento
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {CHANNEL_OPTIONS.map((channel) => (
                    <div 
                      key={channel.value} 
                      className={cn(
                        "border rounded-lg p-3",
                        channel.available ? "border-gray-200" : "border-gray-100 bg-gray-50"
                      )}
                    >
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id={`channel-${channel.value}`}
                          checked={newSequence.triggerChannels.includes(channel.value)}
                          disabled={!channel.available}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewSequence(prev => ({
                                ...prev,
                                triggerChannels: [...prev.triggerChannels, channel.value]
                              }))
                            } else {
                              setNewSequence(prev => ({
                                ...prev,
                                triggerChannels: prev.triggerChannels.filter(c => c !== channel.value)
                              }))
                            }
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h5 className="font-medium">{channel.label}</h5>
                            {!channel.available && (
                              <Badge variant="outline" className="text-xs">
                                Próximamente
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{channel.description}</p>
                          {channel.limitations && (
                            <p className="text-xs text-orange-600 mt-1">
                              Limitación: {channel.limitations}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Configuración de Pasos */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">Secuencia de Mensajes</h4>
                  <Button variant="outline" onClick={addStep} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir Seguimiento
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {newSequence.steps.map((step, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            Seguimiento {step.stepOrder}
                          </CardTitle>
                          {newSequence.steps.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeStep(index)}
                              className="text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Esperar antes de enviar</Label>
                          <div className="flex space-x-2 mt-1">
                            <Input
                              type="number"
                              min="1"
                              value={step.waitTime}
                              onChange={(e) => updateStep(index, 'waitTime', parseInt(e.target.value) || 1)}
                              className="w-20"
                            />
                            <Select 
                              value={step.waitUnit} 
                              onValueChange={(value: TimeUnit) => updateStep(index, 'waitUnit', value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TIME_UNIT_OPTIONS.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label>Mensaje de Seguimiento *</Label>
                          <Textarea
                            value={step.messageContent}
                            onChange={(e) => updateStep(index, 'messageContent', e.target.value)}
                            placeholder="Escribe el mensaje que se enviará. Puedes usar variables como {{nombre_contacto}}"
                            rows={3}
                            className="mt-1"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Variables disponibles: {{nombre_contacto}}, {{empresa}}, {{telefono}}
                          </p>
                        </div>

                        <div>
                          <Label>Canales para este paso</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {CHANNEL_OPTIONS.filter(c => c.available).map((channel) => (
                              <div key={channel.value} className="flex items-center space-x-1">
                                <Checkbox
                                  id={`step-${index}-channel-${channel.value}`}
                                  checked={step.channels.includes(channel.value)}
                                  onCheckedChange={(checked) => {
                                    const newChannels = checked 
                                      ? [...step.channels, channel.value]
                                      : step.channels.filter(c => c !== channel.value)
                                    updateStep(index, 'channels', newChannels)
                                  }}
                                />
                                <label 
                                  htmlFor={`step-${index}-channel-${channel.value}`} 
                                  className="text-sm"
                                >
                                  {channel.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="stopOnReply"
                  checked={newSequence.stopOnReply}
                  onCheckedChange={(checked) => setNewSequence(prev => ({ ...prev, stopOnReply: checked }))}
                />
                <Label htmlFor="stopOnReply" className="text-sm">
                  Detener secuencia si el contacto responde
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateSequence} disabled={isLoading}>
                {isLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                {editingSequence ? 'Actualizar' : 'Crear'} Secuencia
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Panel de Control</span>
          </TabsTrigger>
          <TabsTrigger value="sequences" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Secuencias</span>
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center space-x-2">
            <Play className="h-4 w-4" />
            <span>Activos</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Análisis</span>
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Métricas Principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Seguimientos Activos</CardTitle>
                <Target className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{metrics.activeSequences}</div>
                <p className="text-xs text-gray-600">
                  Secuencias en ejecución
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Realizados Hoy</CardTitle>
                <Send className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{metrics.completedToday}</div>
                <p className="text-xs text-gray-600">
                  Mensajes enviados hoy
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Seguimientos</CardTitle>
                <MessageCircle className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{metrics.totalExecutions}</div>
                <p className="text-xs text-gray-600">
                  Conversaciones con seguimiento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{metrics.conversionRate}%</div>
                <p className="text-xs text-gray-600">
                  Respuestas obtenidas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Seguimientos Programados para Hoy */}
          <Card>
            <CardHeader>
              <CardTitle>Próximos Seguimientos</CardTitle>
              <CardDescription>
                Lista de seguimientos programados para las próximas horas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeExecutions.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No hay seguimientos programados para hoy.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {activeExecutions.slice(0, 5).map((execution) => (
                    <div key={execution.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={execution.contactAvatar} />
                          <AvatarFallback>
                            {execution.contactName.split(' ').map(n => n.charAt(0)).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{execution.contactName}</h4>
                          <p className="text-sm text-gray-600">{execution.sequenceName}</p>
                          <p className="text-xs text-gray-500">
                            Paso {execution.currentStep} de {execution.totalSteps}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {execution.nextScheduled ? 
                            new Date(execution.nextScheduled).toLocaleString('es-ES', {
                              day: '2-digit',
                              month: '2-digit', 
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                            : 'Pendiente'
                          }
                        </p>
                        <Badge className={cn("text-xs", getStatusColor(execution.status))}>
                          {getStatusIcon(execution.status)}
                          <span className="ml-1">{execution.status}</span>
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sequences Tab */}
        <TabsContent value="sequences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Secuencias de Seguimiento</CardTitle>
              <CardDescription>
                Gestiona tus secuencias automatizadas de seguimiento
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sequences.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No tienes secuencias de seguimiento creadas. Crea tu primera secuencia para comenzar.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {sequences.map((sequence) => (
                    <Card key={sequence.id} className={cn(
                      "border-l-4",
                      sequence.isActive ? "border-l-green-500" : "border-l-gray-400"
                    )}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-lg">{sequence.name}</h3>
                              <Badge variant={sequence.isActive ? "default" : "secondary"}>
                                {sequence.isActive ? 'Activa' : 'Inactiva'}
                              </Badge>
                              <Badge variant="outline">
                                {sequence.triggerType === 'MANUAL' ? 'Manual' : 
                                 sequence.triggerType === 'TAG_BASED' ? 'Por Etiquetas' : 
                                 'Sin Respuesta'}
                              </Badge>
                            </div>
                            
                            {sequence.description && (
                              <p className="text-gray-600 mb-3">{sequence.description}</p>
                            )}

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Condición:</span> Sin respuesta por{' '}
                                {formatTimeUnit(sequence.noResponseTime, sequence.noResponseUnit)}
                              </div>
                              <div>
                                <span className="font-medium">Pasos:</span> {sequence.steps.length} mensajes
                              </div>
                              <div>
                                <span className="font-medium">Máx. intentos:</span> {sequence.maxAttempts}
                              </div>
                              <div>
                                <span className="font-medium">Canales:</span>{' '}
                                {sequence.triggerChannels.map(c => 
                                  CHANNEL_OPTIONS.find(opt => opt.value === c)?.label
                                ).join(', ')}
                              </div>
                            </div>

                            {sequence.triggerTags.length > 0 && (
                              <div className="mt-3">
                                <span className="text-sm font-medium">Etiquetas disparadoras:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {sequence.triggerTags.map((tag, index) => {
                                    const tagData = mockTags.find(t => t.name === tag)
                                    return (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        <span 
                                          className="w-2 h-2 rounded-full mr-1" 
                                          style={{ backgroundColor: tagData?.color || '#gray' }}
                                        />
                                        {tag}
                                      </Badge>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={sequence.isActive}
                              onCheckedChange={(checked) => toggleSequenceStatus(sequence.id!, checked)}
                            />
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Tab */}
        <TabsContent value="active" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Secuencias Activas</CardTitle>
              <CardDescription>
                Conversaciones que están siendo seguidas automáticamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeExecutions.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No hay seguimientos activos en este momento.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {activeExecutions.map((execution) => (
                    <Card key={execution.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={execution.contactAvatar} />
                              <AvatarFallback>
                                {execution.contactName.split(' ').map(n => n.charAt(0)).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-semibold text-gray-900">
                                  {execution.contactName}
                                </h3>
                                <Badge className={cn("text-xs", getStatusColor(execution.status))}>
                                  {getStatusIcon(execution.status)}
                                  <span className="ml-1">{execution.status}</span>
                                </Badge>
                              </div>

                              <div className="text-sm text-gray-600 space-y-1">
                                <p><strong>Secuencia:</strong> {execution.sequenceName}</p>
                                <p><strong>Teléfono:</strong> {execution.contactPhone}</p>
                                <p><strong>Progreso:</strong> Paso {execution.currentStep} de {execution.totalSteps}</p>
                                <p><strong>Próximo envío:</strong>{' '}
                                  {execution.nextScheduled ? 
                                    new Date(execution.nextScheduled).toLocaleString('es-ES', {
                                      day: '2-digit',
                                      month: '2-digit', 
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                    : 'No programado'
                                  }
                                </p>
                              </div>

                              <div className="mt-3">
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <div className="flex items-center space-x-1">
                                    <Send className="h-3 w-3" />
                                    <span>{execution.messagesSent} enviados</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <MessageCircle className="h-3 w-3" />
                                    <span>{execution.repliesReceived} respuestas</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <User className="h-3 w-3" />
                                    <span>por {execution.createdByName}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-2">
                                <Progress 
                                  value={(execution.currentStep / execution.totalSteps) * 100} 
                                  className="h-2" 
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {execution.status === 'ACTIVE' && (
                              <Button size="sm" variant="outline">
                                <Pause className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <Button size="sm" variant="outline" className="text-red-600">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento General</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total de Mensajes Enviados</span>
                    <span className="font-semibold">{metrics.totalMessagesSent}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Respuestas Recibidas</span>
                    <span className="font-semibold">{metrics.totalRepliesReceived}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tiempo Promedio de Respuesta</span>
                    <span className="font-semibold">{metrics.averageResponseTime}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tasa de Conversión</span>
                    <span className="font-semibold text-green-600">{metrics.conversionRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actividad de Hoy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Seguimientos Realizados</span>
                    <span className="font-semibold">{metrics.completedToday}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Programados para Hoy</span>
                    <span className="font-semibold">{metrics.scheduledToday}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Secuencias Activas</span>
                    <span className="font-semibold">{metrics.activeSequences}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Conversaciones en Seguimiento</span>
                    <span className="font-semibold">{metrics.totalExecutions}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
