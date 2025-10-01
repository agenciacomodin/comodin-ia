
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { 
  Plus, 
  Trash2, 
  Users, 
  Filter, 
  Eye, 
  CalendarIcon, 
  Tag, 
  MessageCircle, 
  Crown,
  Zap,
  RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import {
  AudienceFilter,
  AudienceFilterType,
  AudienceFilterOperator,
  AudiencePreview,
  ContactPreviewSample,
  AUDIENCE_FILTER_TYPE_LABELS
} from '@/lib/types'

interface AudienceBuilderProps {
  initialFilters?: AudienceFilter[]
  onFiltersChange?: (filters: AudienceFilter[]) => void
  onPreviewGenerated?: (preview: AudiencePreview) => void
  campaignId?: string
  className?: string
}

export default function AudienceBuilder({
  initialFilters = [],
  onFiltersChange,
  onPreviewGenerated,
  campaignId,
  className
}: AudienceBuilderProps) {
  const [filters, setFilters] = useState<AudienceFilter[]>(initialFilters)
  const [preview, setPreview] = useState<AudiencePreview | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [availableChannels, setAvailableChannels] = useState<Array<{ id: string; name: string }>>([])
  const { toast } = useToast()

  // Cargar datos iniciales
  useEffect(() => {
    loadAvailableData()
  }, [])

  // Notificar cambios en filtros
  useEffect(() => {
    onFiltersChange?.(filters)
  }, [filters, onFiltersChange])

  const loadAvailableData = async () => {
    try {
      // TODO: Implementar APIs para obtener tags y canales disponibles
      // Por ahora usamos datos mock
      setAvailableTags(['Cliente VIP', 'Lead Caliente', 'Prospecto', 'Cliente Frecuente', 'Nuevo Cliente'])
      setAvailableChannels([
        { id: 'channel1', name: 'WhatsApp Principal' },
        { id: 'channel2', name: 'WhatsApp Ventas' },
        { id: 'channel3', name: 'WhatsApp Soporte' }
      ])
    } catch (error) {
      console.error('Error loading available data:', error)
    }
  }

  const addFilter = () => {
    const newFilter: AudienceFilter = {
      type: 'INCLUDE_TAG',
      operator: 'AND',
      configuration: {}
    }
    setFilters([...filters, newFilter])
  }

  const updateFilter = (index: number, updatedFilter: AudienceFilter) => {
    const newFilters = [...filters]
    newFilters[index] = updatedFilter
    setFilters(newFilters)
  }

  const removeFilter = (index: number) => {
    if (filters.length > 1) {
      const newFilters = filters.filter((_, i) => i !== index)
      setFilters(newFilters)
    }
  }

  const generatePreview = async () => {
    if (filters.length === 0) {
      toast({
        title: 'Error',
        description: 'Agrega al menos un filtro para generar la vista previa',
        variant: 'destructive'
      })
      return
    }

    try {
      setIsPreviewLoading(true)
      
      const response = await fetch('/api/campaigns/audience-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters,
          campaignId
        })
      })

      const data = await response.json()

      if (data.success) {
        setPreview(data.data)
        onPreviewGenerated?.(data.data)
        toast({
          title: 'Vista previa generada',
          description: `Se encontraron ${data.data.totalContacts} contactos que coinciden con los criterios`
        })
      } else {
        throw new Error(data.error)
      }

    } catch (error) {
      console.error('Error generating preview:', error)
      toast({
        title: 'Error',
        description: 'Error al generar la vista previa de audiencia',
        variant: 'destructive'
      })
    } finally {
      setIsPreviewLoading(false)
    }
  }

  // Si no hay filtros, agregar uno por defecto
  if (filters.length === 0) {
    addFilter()
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Constructor de Audiencias Avanzado
          </h3>
          <p className="text-sm text-muted-foreground">
            Define tu público objetivo con precisión quirúrgica usando múltiples criterios
          </p>
        </div>
        <Button onClick={addFilter} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Añadir Filtro
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Criterios de Segmentación</CardTitle>
          <CardDescription>
            Los contactos deben cumplir con los criterios definidos a continuación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {filters.map((filter, index) => (
            <FilterBuilder
              key={index}
              filter={filter}
              index={index}
              availableTags={availableTags}
              availableChannels={availableChannels}
              canRemove={filters.length > 1}
              onChange={(updatedFilter) => updateFilter(index, updatedFilter)}
              onRemove={() => removeFilter(index)}
            />
          ))}
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Eye className="mr-2 h-4 w-4" />
            Vista Previa de Audiencia
          </CardTitle>
          <CardDescription>
            Genera una vista previa para ver qué contactos se incluirán en la campaña
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {preview ? (
                `Última actualización: ${format(new Date(preview.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}`
              ) : (
                'No se ha generado una vista previa aún'
              )}
            </div>
            <Button 
              onClick={generatePreview} 
              disabled={isPreviewLoading}
              size="sm"
            >
              {isPreviewLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Generar Vista Previa
                </>
              )}
            </Button>
          </div>

          {preview && (
            <div className="space-y-4">
              {/* Preview Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="font-medium">Total de Contactos</span>
                  </div>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {preview.totalContacts.toLocaleString()}
                  </p>
                </div>

                <div className="bg-yellow-500/10 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Crown className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium">Contactos VIP</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">
                    {preview.vipCount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {preview.totalContacts > 0 ? ((preview.vipCount / preview.totalContacts) * 100).toFixed(1) : 0}% del total
                  </p>
                </div>

                <div className="bg-blue-500/10 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Tiempo de Procesamiento</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {preview.processingTime}ms
                  </p>
                </div>
              </div>

              {/* Distribution Charts */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Channels Distribution */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Distribución por Canal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(preview.channelsDistribution || {}).map(([channel, count]) => (
                        <div key={channel} className="flex justify-between items-center">
                          <span className="text-sm">{channel}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ 
                                  width: `${preview.totalContacts > 0 ? (count as number / preview.totalContacts) * 100 : 0}%` 
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium w-8 text-right">{count as number}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Tags Distribution */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Distribución por Etiquetas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(preview.tagsDistribution || {}).slice(0, 5).map(([tag, count]) => (
                        <div key={tag} className="flex justify-between items-center">
                          <span className="text-sm">{tag}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ 
                                  width: `${preview.totalContacts > 0 ? (count as number / preview.totalContacts) * 100 : 0}%` 
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium w-8 text-right">{count as number}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sample Contacts */}
              {preview.sampleContacts && preview.sampleContacts.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Muestra de Contactos</CardTitle>
                    <CardDescription>
                      Primeros {preview.sampleContacts.length} contactos que coinciden con los criterios
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {preview.sampleContacts.map((contact: ContactPreviewSample, index) => (
                        <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {contact.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{contact.name}</span>
                                {contact.isVip && (
                                  <Crown className="h-4 w-4 text-yellow-500" />
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground">{contact.phone}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {contact.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {contact.lastContact && (
                              <span className="text-xs text-muted-foreground">
                                Último contacto: {format(new Date(contact.lastContact), 'dd/MM', { locale: es })}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Componente para construir filtros individuales
interface FilterBuilderProps {
  filter: AudienceFilter
  index: number
  availableTags: string[]
  availableChannels: Array<{ id: string; name: string }>
  canRemove: boolean
  onChange: (filter: AudienceFilter) => void
  onRemove: () => void
}

function FilterBuilder({
  filter,
  index,
  availableTags,
  availableChannels,
  canRemove,
  onChange,
  onRemove
}: FilterBuilderProps) {
  const updateFilter = (updates: Partial<AudienceFilter>) => {
    onChange({ ...filter, ...updates })
  }

  const updateConfiguration = (configUpdates: Record<string, any>) => {
    onChange({
      ...filter,
      configuration: { ...filter.configuration, ...configUpdates }
    })
  }

  return (
    <Card className="relative">
      <CardContent className="p-4">
        {/* Filter Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              Filtro {index + 1}
            </Badge>
            {index > 0 && (
              <Select 
                value={filter.operator} 
                onValueChange={(value: AudienceFilterOperator) => updateFilter({ operator: value })}
              >
                <SelectTrigger className="w-20 h-7">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AND">Y</SelectItem>
                  <SelectItem value="OR">O</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          {canRemove && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onRemove}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filter Type Selection */}
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Tipo de filtro</Label>
            <Select 
              value={filter.type} 
              onValueChange={(value: AudienceFilterType) => updateFilter({ type: value, configuration: {} })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo de filtro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCLUDE_TAG">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4" />
                    <span>Incluir etiqueta</span>
                  </div>
                </SelectItem>
                <SelectItem value="EXCLUDE_TAG">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4" />
                    <span>Excluir etiqueta</span>
                  </div>
                </SelectItem>
                <SelectItem value="CHANNEL">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>Canal de origen</span>
                  </div>
                </SelectItem>
                <SelectItem value="VIP_STATUS">
                  <div className="flex items-center space-x-2">
                    <Crown className="h-4 w-4" />
                    <span>Estado VIP</span>
                  </div>
                </SelectItem>
                <SelectItem value="LAST_CONTACT">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Último contacto</span>
                  </div>
                </SelectItem>
                <SelectItem value="CONVERSATION_STATUS">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>Estado de conversación</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Configuration based on type */}
          <FilterConfiguration 
            filterType={filter.type}
            configuration={filter.configuration}
            availableTags={availableTags}
            availableChannels={availableChannels}
            onChange={updateConfiguration}
          />
        </div>
      </CardContent>
    </Card>
  )
}

// Componente para configurar filtros específicos
interface FilterConfigurationProps {
  filterType: AudienceFilterType
  configuration: Record<string, any>
  availableTags: string[]
  availableChannels: Array<{ id: string; name: string }>
  onChange: (config: Record<string, any>) => void
}

function FilterConfiguration({
  filterType,
  configuration,
  availableTags,
  availableChannels,
  onChange
}: FilterConfigurationProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(configuration.tagNames || [])
  const [selectedChannels, setSelectedChannels] = useState<string[]>(configuration.channelIds || [])
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    configuration.lastContactAfter ? new Date(configuration.lastContactAfter) : undefined
  )
  const [dateTo, setDateTo] = useState<Date | undefined>(
    configuration.lastContactBefore ? new Date(configuration.lastContactBefore) : undefined
  )

  useEffect(() => {
    onChange({ 
      ...configuration, 
      tagNames: selectedTags,
      channelIds: selectedChannels,
      lastContactAfter: dateFrom?.toISOString(),
      lastContactBefore: dateTo?.toISOString()
    })
  }, [selectedTags, selectedChannels, dateFrom, dateTo])

  switch (filterType) {
    case 'INCLUDE_TAG':
    case 'EXCLUDE_TAG':
      return (
        <div className="grid gap-2">
          <Label>
            {filterType === 'INCLUDE_TAG' ? 'Los contactos DEBEN TENER estas etiquetas:' : 'Los contactos NO DEBEN TENER estas etiquetas:'}
          </Label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <div key={tag} className="flex items-center space-x-2">
                <Checkbox
                  id={`tag-${tag}`}
                  checked={selectedTags.includes(tag)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedTags([...selectedTags, tag])
                    } else {
                      setSelectedTags(selectedTags.filter(t => t !== tag))
                    }
                  }}
                />
                <Label htmlFor={`tag-${tag}`} className="text-sm font-normal">
                  {tag}
                </Label>
              </div>
            ))}
          </div>
          {selectedTags.length > 0 && (
            <div className="mt-2">
              <Label className="text-xs text-muted-foreground">Etiquetas seleccionadas:</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )

    case 'CHANNEL':
      return (
        <div className="grid gap-2">
          <Label>El canal DEBE SER:</Label>
          <div className="space-y-2">
            {availableChannels.map(channel => (
              <div key={channel.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`channel-${channel.id}`}
                  checked={selectedChannels.includes(channel.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedChannels([...selectedChannels, channel.id])
                    } else {
                      setSelectedChannels(selectedChannels.filter(c => c !== channel.id))
                    }
                  }}
                />
                <Label htmlFor={`channel-${channel.id}`} className="text-sm font-normal">
                  {channel.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )

    case 'VIP_STATUS':
      return (
        <div className="grid gap-2">
          <Label>Estado VIP:</Label>
          <Select 
            value={configuration.vipStatus === true ? 'vip' : configuration.vipStatus === false ? 'regular' : 'all'} 
            onValueChange={(value) => {
              const vipStatus = value === 'vip' ? true : value === 'regular' ? false : null
              onChange({ ...configuration, vipStatus })
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona estado VIP" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los contactos</SelectItem>
              <SelectItem value="vip">Solo contactos VIP</SelectItem>
              <SelectItem value="regular">Solo contactos regulares</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )

    case 'LAST_CONTACT':
      return (
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Último contacto desde:</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label>Último contacto hasta:</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateTo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )

    case 'CONVERSATION_STATUS':
      return (
        <div className="grid gap-2">
          <Label>Estado de conversación:</Label>
          <div className="space-y-2">
            {['OPEN', 'PENDING', 'RESOLVED', 'TRANSFERRED', 'ARCHIVED'].map(status => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status}`}
                  checked={(configuration.conversationStatuses || []).includes(status)}
                  onCheckedChange={(checked) => {
                    const currentStatuses = configuration.conversationStatuses || []
                    const newStatuses = checked
                      ? [...currentStatuses, status]
                      : currentStatuses.filter((s: string) => s !== status)
                    onChange({ ...configuration, conversationStatuses: newStatuses })
                  }}
                />
                <Label htmlFor={`status-${status}`} className="text-sm font-normal">
                  {status === 'OPEN' ? 'Abierta' :
                   status === 'PENDING' ? 'Pendiente' :
                   status === 'RESOLVED' ? 'Resuelta' :
                   status === 'TRANSFERRED' ? 'Transferida' :
                   status === 'ARCHIVED' ? 'Archivada' : status}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )

    default:
      return (
        <div className="text-center py-4 text-muted-foreground">
          Selecciona un tipo de filtro para configurar las opciones
        </div>
      )
  }
}
