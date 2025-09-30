
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Brain, 
  Plus, 
  Settings, 
  Users, 
  MessageSquare, 
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Bot,
  Zap,
  Target,
  Cpu,
  Globe,
  RefreshCw,
  Edit,
  Trash2,
  Play,
  Pause
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { 
  AIProviderType, 
  RAGAgentType, 
  RAGAgentStatus 
} from '@/lib/types'

interface RAGAgent {
  id: string
  name: string
  description?: string
  type: RAGAgentType
  status: RAGAgentStatus
  aiProvider: AIProviderType
  aiModel: string
  systemPrompt?: string
  isCoordinator: boolean
  priority: number
  totalConversations: number
  totalMessages: number
  averageRating?: number
  lastUsedAt?: string
  createdAt: string
}

interface KnowledgeSource {
  id: string
  name: string
  type: string
  status: string
  totalChunks: number
}

const STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  TRAINING: 'bg-yellow-100 text-yellow-800',
  ERROR: 'bg-red-100 text-red-800'
}

const STATUS_ICONS = {
  ACTIVE: CheckCircle,
  INACTIVE: XCircle,
  TRAINING: Clock,
  ERROR: AlertCircle
}

const TYPE_ICONS = {
  COORDINATOR: Globe,
  SALES: Target,
  SUPPORT: Users,
  TECHNICAL: Cpu,
  MARKETING: Zap,
  GENERAL: Bot,
  CUSTOM: Settings
}

const AI_PROVIDERS = [
  { value: 'OPENAI', label: 'OpenAI (GPT)' },
  { value: 'ANTHROPIC', label: 'Anthropic (Claude)' },
  { value: 'GOOGLE', label: 'Google (Gemini)' },
  { value: 'COHERE', label: 'Cohere' },
  { value: 'HUGGING_FACE', label: 'Hugging Face' },
  { value: 'LOCAL', label: 'Modelo Local' },
  { value: 'CUSTOM', label: 'API Personalizada' }
]

const AGENT_TYPES = [
  { value: 'COORDINATOR', label: 'Coordinador', description: 'Agente principal que deriva conversaciones' },
  { value: 'SALES', label: 'Ventas', description: 'Especializado en ventas y conversiones' },
  { value: 'SUPPORT', label: 'Soporte', description: 'Especializado en atención al cliente' },
  { value: 'TECHNICAL', label: 'Técnico', description: 'Especializado en soporte técnico' },
  { value: 'MARKETING', label: 'Marketing', description: 'Especializado en marketing y promociones' },
  { value: 'GENERAL', label: 'General', description: 'Propósito general' },
  { value: 'CUSTOM', label: 'Personalizado', description: 'Agente personalizado' }
]

export function RAGAgentsManager() {
  const { data: session } = useSession() || {}
  const { toast } = useToast()

  // Estados principales
  const [agents, setAgents] = useState<RAGAgent[]>([])
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)

  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<RAGAgent | null>(null)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)

  // Estados para formularios
  const [agentForm, setAgentForm] = useState({
    name: '',
    description: '',
    type: 'GENERAL' as RAGAgentType,
    aiProvider: 'OPENAI' as AIProviderType,
    aiModel: 'gpt-4',
    systemPrompt: '',
    isCoordinator: false,
    priority: 1,
    knowledgeSourceIds: [] as string[]
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Cargar agentes RAG
      const agentsResponse = await fetch('/api/rag-agents')
      const agentsResult = await agentsResponse.json()
      
      // Cargar fuentes de conocimiento
      const sourcesResponse = await fetch('/api/knowledge')
      const sourcesResult = await sourcesResponse.json()
      
      // Cargar estadísticas
      const statsResponse = await fetch('/api/rag-agents/stats')
      const statsResult = await statsResponse.json()
      
      if (agentsResult.success) {
        setAgents(agentsResult.data)
      }
      
      if (sourcesResult.success) {
        setKnowledgeSources(sourcesResult.data.sources || [])
      }
      
      if (statsResult.success) {
        setStats(statsResult.data)
      }
      
    } catch (error) {
      console.error('Error loading RAG agents data:', error)
      toast({
        title: 'Error',
        description: 'Error cargando datos',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAgent = async () => {
    try {
      setCreating(true)
      
      const response = await fetch('/api/rag-agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(agentForm)
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Éxito',
          description: 'Agente RAG creado correctamente'
        })
        setShowCreateModal(false)
        setAgentForm({
          name: '',
          description: '',
          type: 'GENERAL',
          aiProvider: 'OPENAI',
          aiModel: 'gpt-4',
          systemPrompt: '',
          isCoordinator: false,
          priority: 1,
          knowledgeSourceIds: []
        })
        loadData()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Error creando agente',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error de conexión',
        variant: 'destructive'
      })
    } finally {
      setCreating(false)
    }
  }

  const handleEditAgent = (agent: RAGAgent) => {
    setSelectedAgent(agent)
    setAgentForm({
      name: agent.name,
      description: agent.description || '',
      type: agent.type,
      aiProvider: agent.aiProvider,
      aiModel: agent.aiModel,
      systemPrompt: agent.systemPrompt || '',
      isCoordinator: agent.isCoordinator,
      priority: agent.priority,
      knowledgeSourceIds: []
    })
    setShowEditModal(true)
  }

  const handleUpdateAgent = async () => {
    if (!selectedAgent) return

    try {
      setUpdating(true)
      
      const response = await fetch(`/api/rag-agents/${selectedAgent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(agentForm)
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Éxito',
          description: 'Agente actualizado correctamente'
        })
        setShowEditModal(false)
        setSelectedAgent(null)
        loadData()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Error actualizando agente',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error de conexión',
        variant: 'destructive'
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleToggleAgent = async (agentId: string, currentStatus: RAGAgentStatus) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      
      const response = await fetch(`/api/rag-agents/${agentId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Éxito',
          description: `Agente ${newStatus === 'ACTIVE' ? 'activado' : 'desactivado'}`
        })
        loadData()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Error cambiando estado',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error de conexión',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este agente? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const response = await fetch(`/api/rag-agents/${agentId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Éxito',
          description: 'Agente eliminado correctamente'
        })
        loadData()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Error eliminando agente',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error de conexión',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const coordinatorAgent = agents.find(agent => agent.isCoordinator)

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Agentes RAG Inteligentes</h2>
          <p className="text-gray-600">
            Sistema avanzado de múltiples agentes especializados con IA
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Agente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Agente RAG</DialogTitle>
                <DialogDescription>
                  Configura un nuevo agente especializado con IA específica
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Nombre del Agente *</Label>
                  <Input
                    id="name"
                    placeholder="Agente de Ventas"
                    value={agentForm.name}
                    onChange={(e) => setAgentForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    placeholder="Descripción del agente..."
                    value={agentForm.description}
                    onChange={(e) => setAgentForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">Tipo de Agente *</Label>
                  <Select 
                    value={agentForm.type} 
                    onValueChange={(value) => setAgentForm(prev => ({ ...prev, type: value as RAGAgentType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AGENT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex flex-col">
                            <span>{type.label}</span>
                            <span className="text-xs text-gray-500">{type.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="aiProvider">Proveedor de IA *</Label>
                    <Select 
                      value={agentForm.aiProvider} 
                      onValueChange={(value) => setAgentForm(prev => ({ ...prev, aiProvider: value as AIProviderType }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AI_PROVIDERS.map(provider => (
                          <SelectItem key={provider.value} value={provider.value}>
                            {provider.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="aiModel">Modelo de IA *</Label>
                    <Input
                      id="aiModel"
                      placeholder="gpt-4, claude-3, etc."
                      value={agentForm.aiModel}
                      onChange={(e) => setAgentForm(prev => ({ ...prev, aiModel: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="systemPrompt">Prompt del Sistema</Label>
                  <Textarea
                    id="systemPrompt"
                    placeholder="Eres un agente especializado en..."
                    rows={3}
                    value={agentForm.systemPrompt}
                    onChange={(e) => setAgentForm(prev => ({ ...prev, systemPrompt: e.target.value }))}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isCoordinator"
                    checked={agentForm.isCoordinator}
                    onCheckedChange={(checked) => setAgentForm(prev => ({ ...prev, isCoordinator: checked }))}
                  />
                  <Label htmlFor="isCoordinator">Agente Coordinador Principal</Label>
                </div>
                
                <div>
                  <Label htmlFor="priority">Prioridad (1-10)</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    max="10"
                    value={agentForm.priority}
                    onChange={(e) => setAgentForm(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateAgent} disabled={creating}>
                  {creating ? 'Creando...' : 'Crear Agente'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estadísticas generales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Agentes Activos</p>
                <p className="text-2xl font-bold">{stats.activeAgents || 0}</p>
              </div>
              <Bot className="h-8 w-8 text-blue-500" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversaciones</p>
                <p className="text-2xl font-bold">{stats.totalConversations || 0}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-500" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Mensajes</p>
                <p className="text-2xl font-bold">{stats.totalMessages || 0}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Rating Promedio</p>
                <p className="text-2xl font-bold">{stats.averageRating ? stats.averageRating.toFixed(1) : '—'}</p>
              </div>
              <Target className="h-8 w-8 text-yellow-500" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Agente Coordinador destacado */}
      {coordinatorAgent && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-blue-900">Agente Coordinador Principal</CardTitle>
                  <CardDescription className="text-blue-700">
                    {coordinatorAgent.name} - {coordinatorAgent.description}
                  </CardDescription>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                Coordinador
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-blue-600">Proveedor:</p>
                  <p className="font-medium">{coordinatorAgent.aiProvider}</p>
                </div>
                <div>
                  <p className="text-blue-600">Modelo:</p>
                  <p className="font-medium">{coordinatorAgent.aiModel}</p>
                </div>
                <div>
                  <p className="text-blue-600">Conversaciones:</p>
                  <p className="font-medium">{coordinatorAgent.totalConversations}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditAgent(coordinatorAgent)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleToggleAgent(coordinatorAgent.id, coordinatorAgent.status)}
                >
                  {coordinatorAgent.status === 'ACTIVE' ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de agentes especializados */}
      <Card>
        <CardHeader>
          <CardTitle>Agentes Especializados</CardTitle>
          <CardDescription>
            Agentes especializados para diferentes funciones de tu negocio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agents.filter(agent => !agent.isCoordinator).length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay agentes especializados configurados</p>
              <Button 
                className="mt-4"
                onClick={() => setShowCreateModal(true)}
              >
                Crear Primer Agente
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {agents.filter(agent => !agent.isCoordinator).map((agent) => {
                const StatusIcon = STATUS_ICONS[agent.status]
                const TypeIcon = TYPE_ICONS[agent.type] || Bot
                
                return (
                  <div 
                    key={agent.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <TypeIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{agent.name}</h3>
                          <Badge className={STATUS_COLORS[agent.status]}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {agent.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {agent.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {agent.description || 'Sin descripción'}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                          <span>{agent.aiProvider} • {agent.aiModel}</span>
                          <span>{agent.totalConversations} conversaciones</span>
                          <span>{agent.totalMessages} mensajes</span>
                          {agent.averageRating && (
                            <span>★ {agent.averageRating.toFixed(1)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditAgent(agent)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleAgent(agent.id, agent.status)}
                      >
                        {agent.status === 'ACTIVE' ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteAgent(agent.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de edición */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Agente RAG</DialogTitle>
            <DialogDescription>
              Modifica la configuración del agente
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Nombre del Agente *</Label>
              <Input
                id="edit-name"
                value={agentForm.name}
                onChange={(e) => setAgentForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                value={agentForm.description}
                onChange={(e) => setAgentForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-type">Tipo de Agente *</Label>
              <Select 
                value={agentForm.type} 
                onValueChange={(value) => setAgentForm(prev => ({ ...prev, type: value as RAGAgentType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AGENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-aiProvider">Proveedor de IA *</Label>
                <Select 
                  value={agentForm.aiProvider} 
                  onValueChange={(value) => setAgentForm(prev => ({ ...prev, aiProvider: value as AIProviderType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_PROVIDERS.map(provider => (
                      <SelectItem key={provider.value} value={provider.value}>
                        {provider.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-aiModel">Modelo de IA *</Label>
                <Input
                  id="edit-aiModel"
                  value={agentForm.aiModel}
                  onChange={(e) => setAgentForm(prev => ({ ...prev, aiModel: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-systemPrompt">Prompt del Sistema</Label>
              <Textarea
                id="edit-systemPrompt"
                rows={3}
                value={agentForm.systemPrompt}
                onChange={(e) => setAgentForm(prev => ({ ...prev, systemPrompt: e.target.value }))}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isCoordinator"
                checked={agentForm.isCoordinator}
                onCheckedChange={(checked) => setAgentForm(prev => ({ ...prev, isCoordinator: checked }))}
              />
              <Label htmlFor="edit-isCoordinator">Agente Coordinador Principal</Label>
            </div>
            
            <div>
              <Label htmlFor="edit-priority">Prioridad (1-10)</Label>
              <Input
                id="edit-priority"
                type="number"
                min="1"
                max="10"
                value={agentForm.priority}
                onChange={(e) => setAgentForm(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateAgent} disabled={updating}>
              {updating ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
