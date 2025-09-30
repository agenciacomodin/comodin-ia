
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Clock, 
  Send,
  FileText,
  Users,
  Settings,
  Calendar,
  DollarSign,
  AlertCircle,
  Zap
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CampaignType } from '@prisma/client'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import {
  MessageTemplateSummary,
  CreateCampaignRequest,
  AudienceFilter,
  AudiencePreview,
  CAMPAIGN_TYPE_LABELS,
  CAMPAIGN_TYPE_DESCRIPTIONS,
  DEFAULT_CAMPAIGN_CONFIG,
  WHATSAPP_CAMPAIGN_CONFIG,
  AUDIENCE_FILTER_TYPE_LABELS
} from '@/lib/types'
import AudienceBuilder from './audience-builder'
import { WhatsAppCampaignSelector } from './whatsapp-campaign-selector'

interface CampaignWizardProps {
  onCampaignCreated?: (campaignId: string) => void
}

export default function CampaignWizard({ onCampaignCreated }: CampaignWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [templates, setTemplates] = useState<MessageTemplateSummary[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Form data
  const [campaignData, setCampaignData] = useState<Partial<CreateCampaignRequest>>({
    type: 'IMMEDIATE',
    sendRate: DEFAULT_CAMPAIGN_CONFIG.SEND_RATE,
    batchSize: DEFAULT_CAMPAIGN_CONFIG.BATCH_SIZE,
    timezone: 'America/Mexico_City'
  })
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplateSummary | null>(null)
  const [audienceFilters, setAudienceFilters] = useState<AudienceFilter[]>([])
  const [audiencePreview, setAudiencePreview] = useState<AudiencePreview | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})

  const steps = [
    {
      id: 'template',
      title: 'Seleccionar Plantilla',
      description: 'Elige la plantilla de mensaje pre-aprobada',
      icon: FileText,
      isCompleted: !!selectedTemplate
    },
    {
      id: 'basic',
      title: 'Información Básica',
      description: 'Configura los detalles básicos de la campaña',
      icon: Settings,
      isCompleted: !!campaignData.name && !!campaignData.type
    },
    {
      id: 'audience',
      title: 'Constructor de Audiencias',
      description: 'Define tu público objetivo con precisión',
      icon: Users,
      isCompleted: audienceFilters.length > 0 && !!audiencePreview
    },
    {
      id: 'schedule',
      title: 'Programación y Envío',
      description: 'Configura cuándo y cómo enviar la campaña',
      icon: Calendar,
      isCompleted: campaignData.type === 'IMMEDIATE' || !!campaignData.scheduledFor
    },
    {
      id: 'review',
      title: 'Revisión y Confirmación',
      description: 'Revisa todos los detalles antes de crear',
      icon: CheckCircle,
      isCompleted: false
    }
  ]

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/campaigns/templates?status=APPROVED&isActive=true')
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
      setLoadingTemplates(false)
    }
  }

  const validateStep = (stepIndex: number): boolean => {
    const errors: Record<string, string[]> = {}

    switch (stepIndex) {
      case 0: // Template selection
        if (!selectedTemplate) {
          errors.template = ['Debes seleccionar una plantilla']
        }
        break

      case 1: // Basic info
        if (!campaignData.name) {
          errors.name = ['El nombre de la campaña es requerido']
        }
        if (!campaignData.type) {
          errors.type = ['El tipo de campaña es requerido']
        }
        break

      case 2: // Audience
        if (audienceFilters.length === 0) {
          errors.audience = ['Debes definir al menos un filtro de audiencia']
        }
        if (!audiencePreview) {
          errors.preview = ['Debes generar una vista previa de la audiencia']
        }
        break

      case 3: // Schedule
        if (campaignData.type === 'SCHEDULED' && !campaignData.scheduledFor) {
          errors.schedule = ['Debes seleccionar una fecha y hora para la campaña programada']
        }
        if (campaignData.sendRate && (campaignData.sendRate < 1 || campaignData.sendRate > 60)) {
          errors.sendRate = ['La velocidad de envío debe estar entre 1 y 60 mensajes por minuto']
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
    if (!selectedTemplate || !audiencePreview) return

    try {
      setCreating(true)

      // Aplicar configuraciones específicas de WhatsApp
      let sendRate = campaignData.sendRate || DEFAULT_CAMPAIGN_CONFIG.SEND_RATE
      let batchSize = campaignData.batchSize || DEFAULT_CAMPAIGN_CONFIG.BATCH_SIZE
      let maxRecipients = campaignData.maxRecipients

      if (campaignData.type === CampaignType.WHATSAPP_BUSINESS) {
        sendRate = WHATSAPP_CAMPAIGN_CONFIG.BUSINESS.SEND_RATE
        batchSize = WHATSAPP_CAMPAIGN_CONFIG.BUSINESS.BATCH_SIZE
        // Aplicar límite de 40 mensajes diarios si no se especifica uno menor
        if (!maxRecipients || maxRecipients > WHATSAPP_CAMPAIGN_CONFIG.BUSINESS.MAX_DAILY_MESSAGES) {
          maxRecipients = WHATSAPP_CAMPAIGN_CONFIG.BUSINESS.MAX_DAILY_MESSAGES
        }
      } else if (campaignData.type === CampaignType.WHATSAPP_API) {
        sendRate = WHATSAPP_CAMPAIGN_CONFIG.API.SEND_RATE
        batchSize = WHATSAPP_CAMPAIGN_CONFIG.API.BATCH_SIZE
      }

      const campaignRequest: CreateCampaignRequest = {
        name: campaignData.name!,
        description: campaignData.description,
        type: campaignData.type!,
        templateId: selectedTemplate.id,
        messageVariables: campaignData.messageVariables || {},
        audienceFilters,
        maxRecipients,
        scheduledFor: campaignData.scheduledFor ? new Date(campaignData.scheduledFor) : undefined,
        timezone: campaignData.timezone || 'America/Mexico_City',
        sendRate,
        batchSize,
        budgetLimit: campaignData.budgetLimit
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
      setCreating(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <TemplateSelectionStep 
          templates={templates}
          loading={loadingTemplates}
          selectedTemplate={selectedTemplate}
          onSelectTemplate={setSelectedTemplate}
          errors={validationErrors}
        />

      case 1:
        return <BasicInfoStep 
          data={campaignData}
          onChange={setCampaignData}
          errors={validationErrors}
        />

      case 2:
        return <AudienceStep 
          filters={audienceFilters}
          preview={audiencePreview}
          onFiltersChange={setAudienceFilters}
          onPreviewChange={setAudiencePreview}
          errors={validationErrors}
        />

      case 3:
        return <ScheduleStep 
          data={campaignData}
          onChange={setCampaignData}
          audienceSize={audiencePreview?.totalContacts || 0}
          errors={validationErrors}
        />

      case 4:
        return <ReviewStep 
          campaignData={campaignData}
          selectedTemplate={selectedTemplate}
          audiencePreview={audiencePreview}
          audienceFilters={audienceFilters}
          onCreateCampaign={createCampaign}
          creating={creating}
        />

      default:
        return null
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Crear Nueva Campaña</h1>
        <p className="text-muted-foreground">
          Asistente paso a paso para crear campañas profesionales con segmentación avanzada
        </p>
        <Progress value={progress} className="max-w-md mx-auto" />
      </div>

      {/* Steps Navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isCompleted = step.isCompleted
              const isPast = index < currentStep

              return (
                <div key={step.id} className="flex flex-col items-center space-y-2">
                  <div className={`
                    relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors
                    ${isActive ? 'border-primary bg-primary text-primary-foreground' :
                      isCompleted || isPast ? 'border-green-500 bg-green-500 text-white' :
                      'border-muted-foreground/30 text-muted-foreground'}
                  `}>
                    {isCompleted || isPast ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground hidden sm:block">
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {React.createElement(steps[currentStep].icon, { className: "h-5 w-5" })}
            <span>{steps[currentStep].title}</span>
          </CardTitle>
          <CardDescription>
            {steps[currentStep].description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button onClick={nextStep}>
            Siguiente
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={createCampaign}
            disabled={creating || !validateStep(currentStep)}
            className="bg-green-600 hover:bg-green-700"
          >
            {creating ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Crear Campaña
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

// Step Components
interface TemplateSelectionStepProps {
  templates: MessageTemplateSummary[]
  loading: boolean
  selectedTemplate: MessageTemplateSummary | null
  onSelectTemplate: (template: MessageTemplateSummary) => void
  errors: Record<string, string[]>
}

function TemplateSelectionStep({ 
  templates, 
  loading, 
  selectedTemplate, 
  onSelectTemplate,
  errors 
}: TemplateSelectionStepProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No hay plantillas aprobadas disponibles. Necesitas crear y aprobar plantillas antes de crear campañas.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {errors.template && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.template[0]}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card 
            key={template.id}
            className={`cursor-pointer transition-colors ${
              selectedTemplate?.id === template.id 
                ? 'border-primary bg-primary/5' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => onSelectTemplate(template)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{template.name}</h3>
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
                  </div>
                </div>
                
                {selectedTemplate?.id === template.id && (
                  <div className="ml-4">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

interface BasicInfoStepProps {
  data: Partial<CreateCampaignRequest>
  onChange: (data: Partial<CreateCampaignRequest>) => void
  errors: Record<string, string[]>
}

function BasicInfoStep({ data, onChange, errors }: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      {(errors.name || errors.type) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errors.name?.[0] || errors.type?.[0]}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="campaign-name">Nombre de la campaña *</Label>
          <Input
            id="campaign-name"
            placeholder="Ej: Promoción Black Friday 2024"
            value={data.name || ''}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            className={errors.name ? 'border-red-500' : ''}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="campaign-description">Descripción (opcional)</Label>
          <Textarea
            id="campaign-description"
            placeholder="Describe el objetivo y detalles de la campaña..."
            value={data.description || ''}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="campaign-type">Tipo de campaña *</Label>
          <Select 
            value={data.type} 
            onValueChange={(value: CampaignType) => onChange({ ...data, type: value })}
          >
            <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
              <SelectValue placeholder="Selecciona el tipo de campaña" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IMMEDIATE">
                <div className="space-y-1">
                  <div className="font-medium">{CAMPAIGN_TYPE_LABELS.IMMEDIATE}</div>
                  <div className="text-xs text-muted-foreground">
                    Envío inmediato una vez confirmada
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="SCHEDULED">
                <div className="space-y-1">
                  <div className="font-medium">{CAMPAIGN_TYPE_LABELS.SCHEDULED}</div>
                  <div className="text-xs text-muted-foreground">
                    Programar para una fecha y hora específica
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="DRIP">
                <div className="space-y-1">
                  <div className="font-medium">{CAMPAIGN_TYPE_LABELS.DRIP}</div>
                  <div className="text-xs text-muted-foreground">
                    Campaña secuencial con múltiples mensajes
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="AB_TEST">
                <div className="space-y-1">
                  <div className="font-medium">{CAMPAIGN_TYPE_LABELS.AB_TEST}</div>
                  <div className="text-xs text-muted-foreground">
                    Prueba A/B para optimizar mensajes
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="WHATSAPP_BUSINESS">
                <div className="space-y-1">
                  <div className="font-medium">{CAMPAIGN_TYPE_LABELS.WHATSAPP_BUSINESS}</div>
                  <div className="text-xs text-muted-foreground">
                    Máximo 40 mensajes/día, cualquier contenido
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="WHATSAPP_API">
                <div className="space-y-1">
                  <div className="font-medium">{CAMPAIGN_TYPE_LABELS.WHATSAPP_API}</div>
                  <div className="text-xs text-muted-foreground">
                    Envío ilimitado, solo plantillas verificadas
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Información específica para WhatsApp */}
        {(data.type === CampaignType.WHATSAPP_BUSINESS || data.type === CampaignType.WHATSAPP_API) && (
          <div className="rounded-lg border bg-gradient-to-r from-green-50 to-blue-50 p-4">
            <h4 className="font-medium text-gray-900 mb-2">
              {data.type === CampaignType.WHATSAPP_BUSINESS ? 'WhatsApp Business' : 'WhatsApp API'} - Características
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Límite diario:</span>
                  <Badge variant={data.type === 'WHATSAPP_BUSINESS' ? 'destructive' : 'default'}>
                    {data.type === 'WHATSAPP_BUSINESS' ? '40 mensajes' : 'Ilimitado'}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Plantillas:</span>
                  <Badge variant={data.type === 'WHATSAPP_BUSINESS' ? 'default' : 'outline'}>
                    {data.type === 'WHATSAPP_BUSINESS' ? 'No requeridas' : 'Solo verificadas'}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Velocidad:</span>
                  <span className="text-gray-600">
                    {data.type === 'WHATSAPP_BUSINESS' ? '2 msg/min' : '50 msg/min'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Multimedia:</span>
                  <span className="text-green-600">✓ Soportado</span>
                </div>
              </div>
            </div>
            
            <div className="mt-3 p-3 bg-white/50 rounded border border-gray-200">
              <p className="text-xs text-gray-600">
                <strong>Recomendación:</strong> {CAMPAIGN_TYPE_DESCRIPTIONS[data.type as keyof typeof CAMPAIGN_TYPE_DESCRIPTIONS]}
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="max-recipients">Límite máximo de destinatarios (opcional)</Label>
          <Input
            id="max-recipients"
            type="number"
            placeholder="Ej: 5000"
            value={data.maxRecipients || ''}
            onChange={(e) => onChange({ ...data, maxRecipients: e.target.value ? parseInt(e.target.value) : undefined })}
            min="1"
            max="50000"
          />
          <p className="text-xs text-muted-foreground">
            Útil para pruebas A/B o envíos graduales. Deja en blanco para enviar a toda la audiencia.
          </p>
        </div>
      </div>
    </div>
  )
}

interface AudienceStepProps {
  filters: AudienceFilter[]
  preview: AudiencePreview | null
  onFiltersChange: (filters: AudienceFilter[]) => void
  onPreviewChange: (preview: AudiencePreview | null) => void
  errors: Record<string, string[]>
}

function AudienceStep({ filters, preview, onFiltersChange, onPreviewChange, errors }: AudienceStepProps) {
  return (
    <div className="space-y-4">
      {(errors.audience || errors.preview) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errors.audience?.[0] || errors.preview?.[0]}
          </AlertDescription>
        </Alert>
      )}

      <AudienceBuilder
        initialFilters={filters}
        onFiltersChange={onFiltersChange}
        onPreviewGenerated={onPreviewChange}
      />
    </div>
  )
}

interface ScheduleStepProps {
  data: Partial<CreateCampaignRequest>
  onChange: (data: Partial<CreateCampaignRequest>) => void
  audienceSize: number
  errors: Record<string, string[]>
}

function ScheduleStep({ data, onChange, audienceSize, errors }: ScheduleStepProps) {
  const estimatedDuration = audienceSize && data.sendRate ? 
    Math.ceil(audienceSize / data.sendRate) : 0

  return (
    <div className="space-y-6">
      {(errors.schedule || errors.sendRate) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errors.schedule?.[0] || errors.sendRate?.[0]}
          </AlertDescription>
        </Alert>
      )}

      {data.type === 'SCHEDULED' && (
        <div className="grid gap-2">
          <Label htmlFor="scheduled-for">Fecha y hora de envío *</Label>
          <Input
            id="scheduled-for"
            type="datetime-local"
            value={data.scheduledFor ? (typeof data.scheduledFor === 'string' ? data.scheduledFor : data.scheduledFor.toISOString().slice(0, 16)) : ''}
            onChange={(e) => onChange({ ...data, scheduledFor: e.target.value ? new Date(e.target.value) : undefined })}
            className={errors.schedule ? 'border-red-500' : ''}
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="send-rate">Velocidad de envío (mensajes/minuto)</Label>
          <Input
            id="send-rate"
            type="number"
            value={data.sendRate || DEFAULT_CAMPAIGN_CONFIG.SEND_RATE}
            onChange={(e) => onChange({ ...data, sendRate: parseInt(e.target.value) })}
            min="1"
            max="60"
            className={errors.sendRate ? 'border-red-500' : ''}
          />
          <p className="text-xs text-muted-foreground">
            Controla la velocidad para evitar saturar los servidores
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="batch-size">Tamaño de lote</Label>
          <Input
            id="batch-size"
            type="number"
            value={data.batchSize || DEFAULT_CAMPAIGN_CONFIG.BATCH_SIZE}
            onChange={(e) => onChange({ ...data, batchSize: parseInt(e.target.value) })}
            min="10"
            max="1000"
          />
          <p className="text-xs text-muted-foreground">
            Número de mensajes procesados en cada lote
          </p>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="budget-limit">Límite de presupuesto (USD, opcional)</Label>
        <Input
          id="budget-limit"
          type="number"
          step="0.01"
          placeholder="Ej: 100.00"
          value={data.budgetLimit || ''}
          onChange={(e) => onChange({ ...data, budgetLimit: e.target.value ? parseFloat(e.target.value) : undefined })}
          min="0"
        />
        <p className="text-xs text-muted-foreground">
          La campaña se pausará automáticamente si se alcanza este límite
        </p>
      </div>

      {/* Estimation Card */}
      {audienceSize > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-blue-900 mb-2">Estimación de Campaña</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Audiencia:</span>
                <p className="font-medium">{audienceSize.toLocaleString()} contactos</p>
              </div>
              <div>
                <span className="text-blue-700">Duración estimada:</span>
                <p className="font-medium">{estimatedDuration} minutos</p>
              </div>
              <div>
                <span className="text-blue-700">Costo estimado:</span>
                <p className="font-medium">$0.05 - $0.15 USD</p>
              </div>
              <div>
                <span className="text-blue-700">Entrega estimada:</span>
                <p className="font-medium">85% - 95%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface ReviewStepProps {
  campaignData: Partial<CreateCampaignRequest>
  selectedTemplate: MessageTemplateSummary | null
  audiencePreview: AudiencePreview | null
  audienceFilters: AudienceFilter[]
  onCreateCampaign: () => void
  creating: boolean
}

function ReviewStep({ 
  campaignData, 
  selectedTemplate, 
  audiencePreview, 
  audienceFilters,
  onCreateCampaign, 
  creating 
}: ReviewStepProps) {
  return (
    <div className="space-y-6">
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Revisa cuidadosamente todos los detalles antes de crear la campaña. Una vez creada, algunos elementos no podrán modificarse.
        </AlertDescription>
      </Alert>

      {/* Campaign Summary */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información de la Campaña</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nombre:</span>
              <span className="font-medium">{campaignData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo:</span>
              <Badge variant="secondary">
                {CAMPAIGN_TYPE_LABELS[campaignData.type as CampaignType]}
              </Badge>
            </div>
            {campaignData.description && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Descripción:</span>
                <span className="font-medium text-right max-w-xs">{campaignData.description}</span>
              </div>
            )}
            {campaignData.scheduledFor && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Programada para:</span>
                <span className="font-medium">
                  {format(new Date(campaignData.scheduledFor), 'dd/MM/yyyy HH:mm', { locale: es })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plantilla Seleccionada</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTemplate && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{selectedTemplate.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {selectedTemplate.category}
                  </Badge>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">{selectedTemplate.bodyContent}</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  Usado {selectedTemplate.usageCount} veces • {selectedTemplate.successfulSends} envíos exitosos
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Audiencia Objetivo</CardTitle>
          </CardHeader>
          <CardContent>
            {audiencePreview && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-lg">{audiencePreview.totalContacts.toLocaleString()} contactos</span>
                  <Badge variant="outline">
                    {audiencePreview.vipCount} VIP
                  </Badge>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Filtros aplicados: {audienceFilters.length} criterio{audienceFilters.length !== 1 ? 's' : ''}
                </div>

                {/* Quick preview of filters */}
                <div className="space-y-1">
                  {audienceFilters.slice(0, 3).map((filter, index) => (
                    <div key={index} className="text-xs text-muted-foreground">
                      • {AUDIENCE_FILTER_TYPE_LABELS[filter.type]}
                    </div>
                  ))}
                  {audienceFilters.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      ... y {audienceFilters.length - 3} filtro{audienceFilters.length - 3 !== 1 ? 's' : ''} más
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configuración de Envío</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Velocidad:</span>
              <span className="font-medium">{campaignData.sendRate} mensajes/minuto</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tamaño de lote:</span>
              <span className="font-medium">{campaignData.batchSize} mensajes</span>
            </div>
            {campaignData.maxRecipients && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Límite máximo:</span>
                <span className="font-medium">{campaignData.maxRecipients.toLocaleString()} contactos</span>
              </div>
            )}
            {campaignData.budgetLimit && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Límite de presupuesto:</span>
                <span className="font-medium">${campaignData.budgetLimit} USD</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Final Action */}
      <div className="flex justify-center pt-4">
        <Button 
          onClick={onCreateCampaign}
          disabled={creating}
          size="lg"
          className="bg-green-600 hover:bg-green-700 min-w-[200px]"
        >
          {creating ? (
            <>
              <Clock className="mr-2 h-5 w-5 animate-spin" />
              Creando Campaña...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Crear Campaña
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
