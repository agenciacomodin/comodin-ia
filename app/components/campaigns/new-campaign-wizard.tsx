
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Send,
  MessageSquare,
  Tags,
  Settings,
  BarChart3,
  AlertCircle,
  Zap,
  Calendar,
  Mail,
  Phone,
  MessageCircle,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface CampaignWizardProps {
  onCampaignCreated?: (campaignId: string) => void
}

// Tipos de canal disponibles
const CHANNEL_TYPES = [
  {
    id: 'whatsapp_api',
    name: 'WhatsApp API',
    description: 'Envío ilimitado con plantillas verificadas de Meta',
    icon: MessageCircle,
    color: 'green',
    features: ['Ilimitado', 'Plantillas verificadas', 'Alta velocidad'],
    requiresTemplate: true,
    maxMessagesPerMinute: 50
  },
  {
    id: 'whatsapp_business',
    name: 'WhatsApp Business',
    description: 'Mensajes personalizados con límite de 40 por día',
    icon: MessageCircle,
    color: 'blue',
    features: ['40 mensajes/día', 'Mensajes personalizados', 'Sin plantillas'],
    requiresTemplate: false,
    maxMessagesPerMinute: 2
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Campañas de email marketing masivas',
    icon: Mail,
    color: 'purple',
    features: ['Ilimitado', 'HTML personalizado', 'Tracking avanzado'],
    requiresTemplate: false,
    maxMessagesPerMinute: 100
  },
  {
    id: 'sms',
    name: 'SMS',
    description: 'Mensajes de texto directos',
    icon: Phone,
    color: 'orange',
    features: ['Alta entrega', '160 caracteres', 'Tracking básico'],
    requiresTemplate: false,
    maxMessagesPerMinute: 30
  }
]

export default function NewCampaignWizard({ onCampaignCreated }: CampaignWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Estado del formulario
  const [campaignData, setCampaignData] = useState({
    // Información básica
    name: '',
    description: '',
    
    // Paso 1: Canal
    channelType: '',
    
    // Paso 2: Etiquetas
    selectedTags: [] as string[],
    
    // Paso 3: Mensaje
    templateId: '',
    customMessage: '',
    messageVariables: {} as Record<string, string>,
    
    // Paso 4: Programación
    messagesPerMinute: 10,
    campaignDurationDays: 1,
    messagesPerDay: 100,
    scheduledFor: '',
    timezone: 'America/Mexico_City',
    
    // Estadísticas calculadas
    estimatedReach: 0,
    estimatedCost: 0
  })

  const [availableTags, setAvailableTags] = useState<any[]>([])
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([])
  const [audiencePreview, setAudiencePreview] = useState<any>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})

  const steps = [
    {
      id: 'channel',
      title: '1. Seleccionar Canal',
      description: 'Elige el canal de comunicación',
      icon: MessageSquare,
      isCompleted: !!campaignData.channelType
    },
    {
      id: 'tags',
      title: '2. Etiquetas de Clientes',
      description: 'Selecciona tu audiencia',
      icon: Tags,
      isCompleted: campaignData.selectedTags.length > 0
    },
    {
      id: 'message',
      title: '3. Contenido del Mensaje',
      description: 'Configura el mensaje a enviar',
      icon: MessageCircle,
      isCompleted: getSelectedChannel()?.requiresTemplate ? !!campaignData.templateId : !!campaignData.customMessage
    },
    {
      id: 'schedule',
      title: '4. Programación',
      description: 'Configura cuándo y cómo enviar',
      icon: Calendar,
      isCompleted: campaignData.messagesPerMinute > 0 && campaignData.campaignDurationDays > 0
    },
    {
      id: 'stats',
      title: '5. Estadísticas',
      description: 'Revisa y confirma',
      icon: BarChart3,
      isCompleted: false
    }
  ]

  // Cargar datos iniciales
  useEffect(() => {
    loadTags()
  }, [])

  useEffect(() => {
    if (campaignData.channelType) {
      const channel = getSelectedChannel()
      if (channel?.requiresTemplate) {
        loadTemplates()
      }
    }
  }, [campaignData.channelType])

  useEffect(() => {
    if (campaignData.selectedTags.length > 0) {
      loadAudiencePreview()
    }
  }, [campaignData.selectedTags])

  function getSelectedChannel() {
    return CHANNEL_TYPES.find(c => c.id === campaignData.channelType)
  }

  const loadTags = async () => {
    try {
      const response = await fetch('/api/contacts/tags')
      const data = await response.json()
      if (data.success) {
        setAvailableTags(data.data || [])
      }
    } catch (error) {
      console.error('Error loading tags:', error)
    }
  }

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/campaigns/templates?status=APPROVED&isActive=true')
      const data = await response.json()
      if (data.success) {
        setAvailableTemplates(data.data || [])
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

  const loadAudiencePreview = async () => {
    try {
      const filters = campaignData.selectedTags.map(tag => ({
        filterType: 'INCLUDE_TAG',
        tagNames: [tag]
      }))

      const response = await fetch('/api/campaigns/audience-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters })
      })

      const data = await response.json()
      if (data.success) {
        setAudiencePreview(data.data)
        setCampaignData(prev => ({
          ...prev,
          estimatedReach: data.data?.totalContacts || 0
        }))
      }
    } catch (error) {
      console.error('Error loading audience preview:', error)
    }
  }

  const validateStep = (stepIndex: number): boolean => {
    const errors: Record<string, string[]> = {}

    switch (stepIndex) {
      case 0: // Canal
        if (!campaignData.channelType) {
          errors.channel = ['Debes seleccionar un canal']
        }
        if (!campaignData.name) {
          errors.name = ['El nombre de la campaña es requerido']
        }
        break

      case 1: // Etiquetas
        if (campaignData.selectedTags.length === 0) {
          errors.tags = ['Debes seleccionar al menos una etiqueta']
        }
        break

      case 2: // Mensaje
        const channel = getSelectedChannel()
        if (channel?.requiresTemplate && !campaignData.templateId) {
          errors.message = ['Debes seleccionar una plantilla verificada']
        }
        if (!channel?.requiresTemplate && !campaignData.customMessage) {
          errors.message = ['Debes escribir un mensaje personalizado']
        }
        break

      case 3: // Programación
        if (campaignData.messagesPerMinute < 1) {
          errors.schedule = ['Los mensajes por minuto deben ser al menos 1']
        }
        if (campaignData.campaignDurationDays < 1) {
          errors.schedule = ['La duración debe ser al menos 1 día']
        }
        if (campaignData.messagesPerDay < 1) {
          errors.schedule = ['Los mensajes por día deben ser al menos 1']
        }
        break
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const createCampaign = async () => {
    try {
      setLoading(true)

      const channel = getSelectedChannel()
      
      const campaignRequest = {
        name: campaignData.name,
        description: campaignData.description,
        channelType: campaignData.channelType,
        type: campaignData.scheduledFor ? 'SCHEDULED' : 'IMMEDIATE',
        
        // Template o mensaje personalizado
        templateId: campaignData.templateId || undefined,
        customMessage: campaignData.customMessage || undefined,
        messageVariables: campaignData.messageVariables,
        enableCustomMessage: !channel?.requiresTemplate,
        
        // Audiencia
        audienceFilters: campaignData.selectedTags.map(tag => ({
          filterType: 'INCLUDE_TAG',
          tagNames: [tag]
        })),
        
        // Programación extendida
        sendRate: campaignData.messagesPerMinute,
        campaignDurationDays: campaignData.campaignDurationDays,
        messagesPerDay: campaignData.messagesPerDay,
        scheduledFor: campaignData.scheduledFor ? new Date(campaignData.scheduledFor) : undefined,
        timezone: campaignData.timezone,
        
        // Límites
        maxRecipients: campaignData.messagesPerDay * campaignData.campaignDurationDays
      }

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignRequest)
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Éxito',
          description: 'Campaña creada exitosamente'
        })
        
        onCampaignCreated?.(data.data.id)
        router.push(`/campaigns/${data.data.id}`)
      } else {
        throw new Error(data.error)
      }

    } catch (error) {
      console.error('Error creating campaign:', error)
      toast({
        title: 'Error',
        description: 'Error al crear la campaña',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <ChannelSelectionStep 
          data={campaignData}
          onChange={setCampaignData}
          errors={validationErrors}
        />

      case 1:
        return <TagsSelectionStep 
          data={campaignData}
          onChange={setCampaignData}
          availableTags={availableTags}
          audiencePreview={audiencePreview}
          errors={validationErrors}
        />

      case 2:
        return <MessageConfigurationStep 
          data={campaignData}
          onChange={setCampaignData}
          channel={getSelectedChannel()}
          availableTemplates={availableTemplates}
          loading={loading}
          errors={validationErrors}
        />

      case 3:
        return <ScheduleConfigurationStep 
          data={campaignData}
          onChange={setCampaignData}
          channel={getSelectedChannel()}
          errors={validationErrors}
        />

      case 4:
        return <StatisticsReviewStep 
          data={campaignData}
          channel={getSelectedChannel()}
          audiencePreview={audiencePreview}
          onCreateCampaign={createCampaign}
          creating={loading}
        />

      default:
        return null
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Crear Nueva Campaña
        </h1>
        <p className="text-muted-foreground text-lg">
          Sistema profesional de campañas con segmentación avanzada
        </p>
        <Progress value={progress} className="max-w-md mx-auto h-2" />
      </div>

      {/* Steps Navigation */}
      <Card className="border-2">
        <CardContent className="p-6">
          <div className="grid grid-cols-5 gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isCompleted = step.isCompleted
              const isPast = index < currentStep

              return (
                <div 
                  key={step.id} 
                  className={`flex flex-col items-center space-y-2 p-4 rounded-lg transition-all ${
                    isActive ? 'bg-primary/10 border-2 border-primary' : ''
                  }`}
                >
                  <div className={`
                    relative flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all
                    ${isActive ? 'border-primary bg-primary text-primary-foreground scale-110' :
                      isCompleted || isPast ? 'border-green-500 bg-green-500 text-white' :
                      'border-gray-300 text-gray-400'}
                  `}>
                    {isCompleted || isPast ? (
                      <CheckCircle className="h-7 w-7" />
                    ) : (
                      <Icon className="h-7 w-7" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-semibold ${isActive ? 'text-primary' : 'text-gray-600'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card className="border-2">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardTitle className="flex items-center space-x-3">
            {React.createElement(steps[currentStep].icon, { className: "h-6 w-6 text-primary" })}
            <span>{steps[currentStep].title}</span>
          </CardTitle>
          <CardDescription className="text-base">
            {steps[currentStep].description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={prevStep}
          disabled={currentStep === 0}
          size="lg"
        >
          <ChevronLeft className="mr-2 h-5 w-5" />
          Anterior
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button onClick={nextStep} size="lg">
            Siguiente
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        ) : (
          <Button 
            onClick={createCampaign}
            disabled={loading}
            size="lg"
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            {loading ? (
              <>
                <Clock className="mr-2 h-5 w-5 animate-spin" />
                Creando Campaña...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-5 w-5" />
                Crear y Activar Campaña
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

// PASO 1: Selección de Canal
function ChannelSelectionStep({ data, onChange, errors }: any) {
  return (
    <div className="space-y-6">
      {errors.channel && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.channel[0]}</AlertDescription>
        </Alert>
      )}

      {errors.name && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.name[0]}</AlertDescription>
        </Alert>
      )}

      {/* Nombre de campaña */}
      <div className="space-y-2">
        <Label htmlFor="campaign-name" className="text-base font-semibold">
          Nombre de la Campaña *
        </Label>
        <Input
          id="campaign-name"
          placeholder="Ej: Promoción Black Friday 2024"
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          className={`h-12 text-lg ${errors.name ? 'border-red-500' : ''}`}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="campaign-description" className="text-base font-semibold">
          Descripción (opcional)
        </Label>
        <Textarea
          id="campaign-description"
          placeholder="Describe el objetivo de esta campaña..."
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          rows={3}
          className="text-base"
        />
      </div>

      {/* Selector de canal */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Selecciona el Canal de Comunicación *</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CHANNEL_TYPES.map((channel) => {
            const Icon = channel.icon
            const isSelected = data.channelType === channel.id

            return (
              <Card 
                key={channel.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isSelected 
                    ? 'border-2 border-primary shadow-lg ring-2 ring-primary/20' 
                    : 'border hover:border-primary/50'
                }`}
                onClick={() => onChange({ ...data, channelType: channel.id })}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg bg-${channel.color}-100`}>
                      <Icon className={`h-8 w-8 text-${channel.color}-600`} />
                    </div>
                    {isSelected && (
                      <CheckCircle className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-lg">{channel.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {channel.description}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    {channel.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Badge variant={isSelected ? "default" : "secondary"} className="w-full justify-center">
                    {channel.requiresTemplate ? 'Plantillas Verificadas' : 'Mensajes Personalizados'}
                  </Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// PASO 2: Selección de Etiquetas
interface TagsSelectionStepProps {
  data: any
  onChange: (data: any) => void
  availableTags: any[]
  audiencePreview: any
  errors: Record<string, string[]>
}

function TagsSelectionStep({ data, onChange, availableTags, audiencePreview, errors }: TagsSelectionStepProps) {
  const toggleTag = (tagName: string) => {
    const newTags = data.selectedTags.includes(tagName)
      ? data.selectedTags.filter((t: string) => t !== tagName)
      : [...data.selectedTags, tagName]
    
    onChange({ ...data, selectedTags: newTags })
  }

  return (
    <div className="space-y-6">
      {errors.tags && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.tags[0]}</AlertDescription>
        </Alert>
      )}

      <Alert>
        <Users className="h-4 w-4" />
        <AlertDescription>
          Selecciona las etiquetas de los clientes a los que quieres enviar la campaña. 
          Los contactos que tengan al menos una de estas etiquetas recibirán el mensaje.
        </AlertDescription>
      </Alert>

      {/* Etiquetas disponibles */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Etiquetas de Audiencia *</Label>
        
        {availableTags.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No hay etiquetas disponibles. Crea etiquetas en la sección de Contactos primero.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableTags.map((tag) => {
              const isSelected = data.selectedTags.includes(tag.name)
              
              return (
                <Card
                  key={tag.id}
                  className={`cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-2 border-primary bg-primary/5' 
                      : 'border hover:border-primary/50'
                  }`}
                  onClick={() => toggleTag(tag.name)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: tag.color || '#gray' }}
                      />
                      {isSelected && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <p className="font-medium">{tag.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tag._count?.contacts || 0} contactos
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Preview de audiencia */}
      {audiencePreview && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Vista Previa de Audiencia</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-3xl font-bold text-primary">
                  {audiencePreview.totalContacts}
                </p>
                <p className="text-sm text-muted-foreground">Total Contactos</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-3xl font-bold text-green-600">
                  {audiencePreview.vipCount}
                </p>
                <p className="text-sm text-muted-foreground">VIP</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-3xl font-bold text-blue-600">
                  {audiencePreview.activeConversations}
                </p>
                <p className="text-sm text-muted-foreground">Conversaciones Activas</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-3xl font-bold text-purple-600">
                  {audiencePreview.validPhoneNumbers}
                </p>
                <p className="text-sm text-muted-foreground">Números Válidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// PASO 3: Configuración de Mensaje
function MessageConfigurationStep({ data, onChange, channel, availableTemplates, loading, errors }: any) {
  if (!channel) return null

  return (
    <div className="space-y-6">
      {errors.message && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.message[0]}</AlertDescription>
        </Alert>
      )}

      <Alert className={`border-2 ${channel.requiresTemplate ? 'border-blue-500 bg-blue-50' : 'border-green-500 bg-green-50'}`}>
        <MessageCircle className="h-4 w-4" />
        <AlertDescription>
          {channel.requiresTemplate ? (
            <>
              <strong>WhatsApp API:</strong> Debes usar plantillas verificadas por Meta. 
              Estas plantillas han sido pre-aprobadas y garantizan alta entregabilidad.
            </>
          ) : (
            <>
              <strong>Mensajes Personalizados:</strong> Puedes crear mensajes completamente personalizados 
              sin necesidad de plantillas pre-aprobadas.
            </>
          )}
        </AlertDescription>
      </Alert>

      {channel.requiresTemplate ? (
        // Selector de plantillas de Meta
        <div className="space-y-4">
          <Label className="text-base font-semibold">Selecciona una Plantilla Verificada *</Label>
          
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse h-24 bg-gray-200 rounded-lg" />
              ))}
            </div>
          ) : availableTemplates.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No hay plantillas verificadas disponibles. Debes crear y aprobar plantillas en WhatsApp Business Manager primero.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4">
              {availableTemplates.map((template: any) => {
                const isSelected = data.templateId === template.id

                return (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-2 border-primary bg-primary/5 shadow-lg' 
                        : 'border hover:border-primary/50'
                    }`}
                    onClick={() => onChange({ ...data, templateId: template.id })}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-bold text-lg">{template.name}</h3>
                            <Badge variant="secondary">{template.category}</Badge>
                            <Badge variant="outline">{template.language.toUpperCase()}</Badge>
                            {isSelected && (
                              <CheckCircle className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          
                          <div className="p-4 bg-gray-50 rounded-lg border">
                            <p className="text-sm whitespace-pre-wrap">{template.bodyContent}</p>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>✓ Verificada por Meta</span>
                            <span>•</span>
                            <span>Usado {template.usageCount} veces</span>
                            {template.successfulSends > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-green-600">
                                  {template.successfulSends} envíos exitosos
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        // Editor de mensaje personalizado
        <div className="space-y-4">
          <Label htmlFor="custom-message" className="text-base font-semibold">
            Escribe tu Mensaje Personalizado *
          </Label>
          <Textarea
            id="custom-message"
            placeholder="Escribe aquí el mensaje que quieres enviar a tus clientes..."
            value={data.customMessage}
            onChange={(e) => onChange({ ...data, customMessage: e.target.value })}
            rows={10}
            className="text-base font-mono"
          />
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>{data.customMessage?.length || 0} caracteres</span>
            {channel.id === 'sms' && (
              <span className={data.customMessage?.length > 160 ? 'text-red-500' : ''}>
                Máximo 160 caracteres para SMS
              </span>
            )}
          </div>
          
          {/* Preview del mensaje */}
          {data.customMessage && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-sm">Vista Previa del Mensaje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="whitespace-pre-wrap">{data.customMessage}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

// PASO 4: Configuración de Programación
function ScheduleConfigurationStep({ data, onChange, channel, errors }: any) {
  if (!channel) return null

  // Calcular estimaciones
  const totalMessages = data.messagesPerDay * data.campaignDurationDays
  const estimatedCost = totalMessages * 0.05 // $0.05 por mensaje aproximado
  const messagesPerMinute = Math.min(data.messagesPerMinute, channel.maxMessagesPerMinute)
  const minutesPerDay = data.messagesPerDay / messagesPerMinute

  return (
    <div className="space-y-6">
      {errors.schedule && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.schedule[0]}</AlertDescription>
        </Alert>
      )}

      <Alert className="border-blue-500 bg-blue-50">
        <Settings className="h-4 w-4" />
        <AlertDescription>
          <strong>Configuración Avanzada:</strong> Configura la duración de la campaña y la velocidad de envío 
          para optimizar la entregabilidad y el alcance.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Velocidad de envío */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Velocidad de Envío</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="messages-per-minute">
                Mensajes por Minuto * (Máx: {channel.maxMessagesPerMinute})
              </Label>
              <Input
                id="messages-per-minute"
                type="number"
                value={data.messagesPerMinute}
                onChange={(e) => onChange({ 
                  ...data, 
                  messagesPerMinute: Math.min(parseInt(e.target.value) || 1, channel.maxMessagesPerMinute)
                })}
                min="1"
                max={channel.maxMessagesPerMinute}
                className="text-lg font-semibold"
              />
              <p className="text-xs text-muted-foreground">
                Controla la velocidad para evitar bloqueos y optimizar la entrega
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Duración de campaña */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Duración de Campaña</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="duration-days">
                Por Cuántos Días Estará Activa *
              </Label>
              <Input
                id="duration-days"
                type="number"
                value={data.campaignDurationDays}
                onChange={(e) => onChange({ 
                  ...data, 
                  campaignDurationDays: parseInt(e.target.value) || 1
                })}
                min="1"
                max="365"
                className="text-lg font-semibold"
              />
              <p className="text-xs text-muted-foreground">
                Campañas más largas permiten mayor alcance con límites diarios
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mensajes por día */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <span>Límite Diario</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="messages-per-day">
                Mensajes por Día *
              </Label>
              <Input
                id="messages-per-day"
                type="number"
                value={data.messagesPerDay}
                onChange={(e) => onChange({ 
                  ...data, 
                  messagesPerDay: parseInt(e.target.value) || 1
                })}
                min="1"
                max="10000"
                className="text-lg font-semibold"
              />
              <p className="text-xs text-muted-foreground">
                {channel.id === 'whatsapp_business' 
                  ? 'WhatsApp Business tiene un límite de 40 mensajes/día' 
                  : 'Define cuántos mensajes enviar cada día'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Programación opcional */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Inicio Programado (Opcional)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled-for">
                Fecha y Hora de Inicio
              </Label>
              <Input
                id="scheduled-for"
                type="datetime-local"
                value={data.scheduledFor}
                onChange={(e) => onChange({ 
                  ...data, 
                  scheduledFor: e.target.value
                })}
                min={new Date().toISOString().slice(0, 16)}
              />
              <p className="text-xs text-muted-foreground">
                Deja en blanco para iniciar inmediatamente
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen de estimaciones */}
      <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-2 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Estimaciones de la Campaña</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <p className="text-3xl font-bold text-blue-600">
                {totalMessages.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Total Mensajes
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <p className="text-3xl font-bold text-green-600">
                ${estimatedCost.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Costo Estimado
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <p className="text-3xl font-bold text-purple-600">
                {Math.ceil(minutesPerDay)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Minutos por Día
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <p className="text-3xl font-bold text-orange-600">
                {data.campaignDurationDays}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Días de Duración
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// PASO 5: Estadísticas y Revisión
function StatisticsReviewStep({ data, channel, audiencePreview, onCreateCampaign, creating }: any) {
  if (!channel) return null

  const totalMessages = data.messagesPerDay * data.campaignDurationDays
  const estimatedCost = totalMessages * 0.05

  return (
    <div className="space-y-6">
      <Alert className="border-green-500 bg-green-50">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>¡Todo Listo!</strong> Revisa los detalles de tu campaña antes de crearla. 
          Una vez creada, algunos parámetros no podrán modificarse.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {/* Información General */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">📋 Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nombre:</p>
                <p className="font-semibold">{data.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Canal:</p>
                <Badge variant="default" className="text-sm">
                  {channel.name}
                </Badge>
              </div>
            </div>
            {data.description && (
              <div>
                <p className="text-sm text-muted-foreground">Descripción:</p>
                <p className="text-sm">{data.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audiencia */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">👥 Audiencia Objetivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {audiencePreview?.totalContacts || 0}
                </p>
                <p className="text-xs text-muted-foreground">Total Contactos</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {audiencePreview?.vipCount || 0}
                </p>
                <p className="text-xs text-muted-foreground">VIP</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {audiencePreview?.validPhoneNumbers || 0}
                </p>
                <p className="text-xs text-muted-foreground">Números Válidos</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">
                  {data.selectedTags.length}
                </p>
                <p className="text-xs text-muted-foreground">Etiquetas</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.selectedTags.map((tag: string) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mensaje */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">💬 Contenido del Mensaje</CardTitle>
          </CardHeader>
          <CardContent>
            {channel.requiresTemplate ? (
              <div className="p-4 bg-gray-50 rounded-lg border">
                <Badge variant="outline" className="mb-2">Plantilla Verificada</Badge>
                <p className="text-sm">Template ID: {data.templateId}</p>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg border">
                <Badge variant="outline" className="mb-2">Mensaje Personalizado</Badge>
                <p className="text-sm whitespace-pre-wrap">{data.customMessage}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Programación */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">⏰ Programación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Mensajes/minuto:</p>
                <p className="font-semibold text-lg">{data.messagesPerMinute}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Duración:</p>
                <p className="font-semibold text-lg">{data.campaignDurationDays} días</p>
              </div>
              <div>
                <p className="text-muted-foreground">Mensajes/día:</p>
                <p className="font-semibold text-lg">{data.messagesPerDay}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total mensajes:</p>
                <p className="font-semibold text-lg">{totalMessages.toLocaleString()}</p>
              </div>
            </div>
            {data.scheduledFor && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm">
                  <strong>Inicio programado:</strong> {new Date(data.scheduledFor).toLocaleString('es-ES')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estimaciones Finales */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-500">
          <CardHeader>
            <CardTitle className="text-base">📊 Estimaciones Finales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <p className="text-3xl font-bold text-green-600">
                  ${estimatedCost.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Costo Total</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <p className="text-3xl font-bold text-blue-600">
                  {totalMessages.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Mensajes</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <p className="text-3xl font-bold text-purple-600">
                  85-95%
                </p>
                <p className="text-sm text-muted-foreground">Entrega Est.</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <p className="text-3xl font-bold text-orange-600">
                  {Math.ceil((totalMessages / data.messagesPerMinute) / 60)}h
                </p>
                <p className="text-sm text-muted-foreground">Duración Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botón de creación */}
      <div className="flex justify-center pt-6">
        <Button 
          onClick={onCreateCampaign}
          disabled={creating}
          size="lg"
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-12 py-6 text-lg"
        >
          {creating ? (
            <>
              <Clock className="mr-2 h-6 w-6 animate-spin" />
              Creando Campaña...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-6 w-6" />
              Crear y Activar Campaña
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
