
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  Plus, 
  Trash2, 
  Settings, 
  Zap, 
  Target,
  Clock,
  MessageSquare,
  Star,
  Users,
  Calendar,
  Hash,
  Timer
} from 'lucide-react'
import {
  AIIntentionType,
  AutomationConditionType,
  AutomationActionType,
  CreateAutomationRuleRequest,
  AI_INTENTION_LABELS,
  AUTOMATION_CONDITION_LABELS,
  AUTOMATION_ACTION_LABELS,
  CONVERSATION_PRIORITY_LABELS
} from '@/lib/types'

interface RuleBuilderProps {
  ruleId?: string | null
  onSave: () => void
  onCancel: () => void
}

interface ConditionItem {
  id: string
  type: AutomationConditionType
  logicalOperator: 'AND' | 'OR'
  configuration: any
}

interface ActionItem {
  id: string
  type: AutomationActionType
  executionOrder: number
  configuration: any
}

export function RuleBuilder({ ruleId, onSave, onCancel }: RuleBuilderProps) {
  const [loading, setLoading] = useState(false)
  const [ruleName, setRuleName] = useState('')
  const [ruleDescription, setRuleDescription] = useState('')
  const [priority, setPriority] = useState(100)
  const [isActive, setIsActive] = useState(true)
  const [conditions, setConditions] = useState<ConditionItem[]>([])
  const [actions, setActions] = useState<ActionItem[]>([])
  const [availableAgents, setAvailableAgents] = useState([])

  // Cargar datos si estamos editando
  useEffect(() => {
    if (ruleId) {
      loadRule()
    }
    loadAvailableAgents()
  }, [ruleId])

  const loadRule = async () => {
    try {
      const response = await fetch(`/api/automations/rules/${ruleId}`)
      const data = await response.json()
      
      if (data.success) {
        const rule = data.data
        setRuleName(rule.name)
        setRuleDescription(rule.description || '')
        setPriority(rule.priority)
        setIsActive(rule.isActive)
        
        // Mapear condiciones
        setConditions(rule.conditions.map((condition: any) => ({
          id: condition.id,
          type: condition.type,
          logicalOperator: condition.logicalOperator || 'AND',
          configuration: {
            intentionTypes: condition.intentionTypes || [],
            keywords: condition.keywords || [],
            keywordMatchType: condition.keywordMatchType || 'ANY',
            timeStart: condition.timeStart,
            timeEnd: condition.timeEnd,
            weekdays: condition.weekdays || [],
            messageCountMin: condition.messageCountMin,
            messageCountMax: condition.messageCountMax,
            responseTimeMin: condition.responseTimeMin,
            responseTimeMax: condition.responseTimeMax
          }
        })))
        
        // Mapear acciones
        setActions(rule.actions.map((action: any) => ({
          id: action.id,
          type: action.type,
          executionOrder: action.executionOrder,
          configuration: {
            tagName: action.tagName,
            tagColor: action.tagColor,
            agentId: action.agentId,
            priority: action.priority,
            replyMessage: action.replyMessage,
            replyDelay: action.replyDelay || 0
          }
        })))
      }
    } catch (error) {
      console.error('Error cargando regla:', error)
    }
  }

  const loadAvailableAgents = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      
      if (data.success) {
        setAvailableAgents(data.data.filter((user: any) => user.role === 'AGENTE'))
      }
    } catch (error) {
      console.error('Error cargando agentes:', error)
    }
  }

  const addCondition = () => {
    const newCondition: ConditionItem = {
      id: `condition_${Date.now()}`,
      type: AutomationConditionType.INTENTION_DETECTED,
      logicalOperator: 'AND',
      configuration: {
        intentionTypes: [],
        keywords: [],
        keywordMatchType: 'ANY'
      }
    }
    setConditions([...conditions, newCondition])
  }

  const removeCondition = (conditionId: string) => {
    setConditions(conditions.filter(c => c.id !== conditionId))
  }

  const updateCondition = (conditionId: string, updates: Partial<ConditionItem>) => {
    setConditions(conditions.map(c => 
      c.id === conditionId ? { ...c, ...updates } : c
    ))
  }

  const addAction = () => {
    const newAction: ActionItem = {
      id: `action_${Date.now()}`,
      type: AutomationActionType.ADD_TAG,
      executionOrder: actions.length + 1,
      configuration: {
        tagName: '',
        tagColor: '#3B82F6'
      }
    }
    setActions([...actions, newAction])
  }

  const removeAction = (actionId: string) => {
    setActions(actions.filter(a => a.id !== actionId))
  }

  const updateAction = (actionId: string, updates: Partial<ActionItem>) => {
    setActions(actions.map(a => 
      a.id === actionId ? { ...a, ...updates } : a
    ))
  }

  const handleSave = async () => {
    if (!ruleName.trim()) {
      alert('El nombre de la regla es requerido')
      return
    }

    if (conditions.length === 0) {
      alert('Debe definir al menos una condición')
      return
    }

    if (actions.length === 0) {
      alert('Debe definir al menos una acción')
      return
    }

    setLoading(true)

    try {
      const ruleData: CreateAutomationRuleRequest = {
        name: ruleName.trim(),
        description: ruleDescription.trim() || undefined,
        priority,
        isActive,
        conditions: conditions.map(condition => ({
          type: condition.type,
          logicalOperator: condition.logicalOperator,
          ...condition.configuration
        })),
        actions: actions.map((action, index) => ({
          type: action.type,
          executionOrder: index + 1,
          ...action.configuration
        }))
      }

      const url = ruleId 
        ? `/api/automations/rules/${ruleId}`
        : '/api/automations/rules'
      
      const method = ruleId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ruleData),
      })

      const data = await response.json()

      if (data.success) {
        onSave()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error guardando regla:', error)
      alert('Error guardando regla')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Información básica */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="rule-name">Nombre de la Regla *</Label>
          <Input
            id="rule-name"
            value={ruleName}
            onChange={(e) => setRuleName(e.target.value)}
            placeholder="Ej: Clasificar consultas de ventas"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="rule-description">Descripción</Label>
          <Textarea
            id="rule-description"
            value={ruleDescription}
            onChange={(e) => setRuleDescription(e.target.value)}
            placeholder="Descripción opcional de lo que hace esta regla"
            className="mt-1"
          />
        </div>

        <div className="flex items-center gap-4">
          <div>
            <Label htmlFor="priority">Prioridad</Label>
            <Input
              id="priority"
              type="number"
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value) || 100)}
              min="1"
              max="1000"
              className="mt-1 w-24"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Menor número = mayor prioridad
            </p>
          </div>

          <div className="flex items-center space-x-2 mt-6">
            <Switch
              id="is-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="is-active">Regla activa</Label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Condiciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Condiciones
          </CardTitle>
          <CardDescription>
            Define cuándo debe ejecutarse esta regla. Todas las condiciones deben cumplirse.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {conditions.map((condition, index) => (
            <ConditionBuilder
              key={condition.id}
              condition={condition}
              isFirst={index === 0}
              onUpdate={(updates) => updateCondition(condition.id, updates)}
              onRemove={() => removeCondition(condition.id)}
            />
          ))}

          <Button variant="outline" onClick={addCondition}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Condición
          </Button>
        </CardContent>
      </Card>

      {/* Acciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Acciones
          </CardTitle>
          <CardDescription>
            Define qué debe hacer el sistema cuando se cumplan las condiciones.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {actions.map((action, index) => (
            <ActionBuilder
              key={action.id}
              action={action}
              orderNumber={index + 1}
              availableAgents={availableAgents}
              onUpdate={(updates) => updateAction(action.id, updates)}
              onRemove={() => removeAction(action.id)}
            />
          ))}

          <Button variant="outline" onClick={addAction}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Acción
          </Button>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Guardando...' : ruleId ? 'Actualizar Regla' : 'Crear Regla'}
        </Button>
      </div>
    </div>
  )
}

// Componente para construir una condición específica
function ConditionBuilder({ 
  condition, 
  isFirst, 
  onUpdate, 
  onRemove 
}: { 
  condition: ConditionItem
  isFirst: boolean
  onUpdate: (updates: Partial<ConditionItem>) => void
  onRemove: () => void 
}) {
  const getConditionIcon = (type: AutomationConditionType) => {
    switch (type) {
      case AutomationConditionType.INTENTION_DETECTED:
        return <Target className="h-4 w-4" />
      case AutomationConditionType.KEYWORDS_CONTAINS:
        return <MessageSquare className="h-4 w-4" />
      case AutomationConditionType.SENDER_IS_VIP:
        return <Star className="h-4 w-4" />
      case AutomationConditionType.TIME_RANGE:
        return <Clock className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start gap-4">
          {/* Operador lógico */}
          {!isFirst && (
            <div className="mt-2">
              <Select
                value={condition.logicalOperator}
                onValueChange={(value) => onUpdate({ logicalOperator: value as 'AND' | 'OR' })}
              >
                <SelectTrigger className="w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AND">Y</SelectItem>
                  <SelectItem value="OR">O</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Configuración de la condición */}
          <div className="flex-1 space-y-3">
            {/* Tipo de condición */}
            <div className="flex items-center gap-2">
              {getConditionIcon(condition.type)}
              <Select
                value={condition.type}
                onValueChange={(value) => onUpdate({ 
                  type: value as AutomationConditionType,
                  configuration: {} // Reset configuration when type changes
                })}
              >
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(AUTOMATION_CONDITION_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Configuración específica por tipo */}
            {condition.type === AutomationConditionType.INTENTION_DETECTED && (
              <div>
                <Label>Intenciones a detectar:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(AI_INTENTION_LABELS).map(([key, label]) => (
                    <Badge
                      key={key}
                      variant={condition.configuration.intentionTypes?.includes(key) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const current = condition.configuration.intentionTypes || []
                        const updated = current.includes(key)
                          ? current.filter((i: string) => i !== key)
                          : [...current, key]
                        onUpdate({
                          configuration: {
                            ...condition.configuration,
                            intentionTypes: updated
                          }
                        })
                      }}
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {condition.type === AutomationConditionType.KEYWORDS_CONTAINS && (
              <div className="space-y-2">
                <Label>Palabras clave:</Label>
                <Input
                  placeholder="Separar con comas: precio, costo, cotización"
                  value={condition.configuration.keywords?.join(', ') || ''}
                  onChange={(e) => {
                    const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k)
                    onUpdate({
                      configuration: {
                        ...condition.configuration,
                        keywords
                      }
                    })
                  }}
                />
                <Select
                  value={condition.configuration.keywordMatchType || 'ANY'}
                  onValueChange={(value) => onUpdate({
                    configuration: {
                      ...condition.configuration,
                      keywordMatchType: value
                    }
                  })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ANY">Cualquier palabra</SelectItem>
                    <SelectItem value="ALL">Todas las palabras</SelectItem>
                    <SelectItem value="EXACT">Coincidencia exacta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {condition.type === AutomationConditionType.TIME_RANGE && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Hora inicio:</Label>
                  <Input
                    type="time"
                    value={condition.configuration.timeStart || ''}
                    onChange={(e) => onUpdate({
                      configuration: {
                        ...condition.configuration,
                        timeStart: e.target.value
                      }
                    })}
                  />
                </div>
                <div>
                  <Label>Hora fin:</Label>
                  <Input
                    type="time"
                    value={condition.configuration.timeEnd || ''}
                    onChange={(e) => onUpdate({
                      configuration: {
                        ...condition.configuration,
                        timeEnd: e.target.value
                      }
                    })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Botón eliminar */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente para construir una acción específica
function ActionBuilder({ 
  action, 
  orderNumber, 
  availableAgents,
  onUpdate, 
  onRemove 
}: { 
  action: ActionItem
  orderNumber: number
  availableAgents: any[]
  onUpdate: (updates: Partial<ActionItem>) => void
  onRemove: () => void 
}) {
  const getActionIcon = (type: AutomationActionType) => {
    switch (type) {
      case AutomationActionType.ADD_TAG:
        return <Hash className="h-4 w-4" />
      case AutomationActionType.ASSIGN_AGENT:
        return <Users className="h-4 w-4" />
      case AutomationActionType.AUTO_REPLY:
        return <MessageSquare className="h-4 w-4" />
      case AutomationActionType.MARK_VIP:
        return <Star className="h-4 w-4" />
      default:
        return <Zap className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start gap-4">
          {/* Orden */}
          <div className="mt-2">
            <Badge variant="outline">{orderNumber}</Badge>
          </div>

          {/* Configuración de la acción */}
          <div className="flex-1 space-y-3">
            {/* Tipo de acción */}
            <div className="flex items-center gap-2">
              {getActionIcon(action.type)}
              <Select
                value={action.type}
                onValueChange={(value) => onUpdate({ 
                  type: value as AutomationActionType,
                  configuration: {} // Reset configuration when type changes
                })}
              >
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(AUTOMATION_ACTION_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Configuración específica por tipo */}
            {action.type === AutomationActionType.ADD_TAG && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nombre de la etiqueta:</Label>
                  <Input
                    value={action.configuration.tagName || ''}
                    onChange={(e) => onUpdate({
                      configuration: {
                        ...action.configuration,
                        tagName: e.target.value
                      }
                    })}
                    placeholder="Cliente Potencial"
                  />
                </div>
                <div>
                  <Label>Color:</Label>
                  <Input
                    type="color"
                    value={action.configuration.tagColor || '#3B82F6'}
                    onChange={(e) => onUpdate({
                      configuration: {
                        ...action.configuration,
                        tagColor: e.target.value
                      }
                    })}
                  />
                </div>
              </div>
            )}

            {action.type === AutomationActionType.ASSIGN_AGENT && (
              <div>
                <Label>Asignar a agente:</Label>
                <Select
                  value={action.configuration.agentId || ''}
                  onValueChange={(value) => onUpdate({
                    configuration: {
                      ...action.configuration,
                      agentId: value
                    }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar agente" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAgents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name || agent.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {action.type === AutomationActionType.SET_PRIORITY && (
              <div>
                <Label>Prioridad:</Label>
                <Select
                  value={action.configuration.priority || ''}
                  onValueChange={(value) => onUpdate({
                    configuration: {
                      ...action.configuration,
                      priority: value
                    }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CONVERSATION_PRIORITY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {action.type === AutomationActionType.AUTO_REPLY && (
              <div className="space-y-2">
                <div>
                  <Label>Mensaje de respuesta:</Label>
                  <Textarea
                    value={action.configuration.replyMessage || ''}
                    onChange={(e) => onUpdate({
                      configuration: {
                        ...action.configuration,
                        replyMessage: e.target.value
                      }
                    })}
                    placeholder="Gracias por tu mensaje. Un agente te contactará pronto."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Delay (segundos):</Label>
                  <Input
                    type="number"
                    min="0"
                    max="300"
                    value={action.configuration.replyDelay || 0}
                    onChange={(e) => onUpdate({
                      configuration: {
                        ...action.configuration,
                        replyDelay: parseInt(e.target.value) || 0
                      }
                    })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Botón eliminar */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
