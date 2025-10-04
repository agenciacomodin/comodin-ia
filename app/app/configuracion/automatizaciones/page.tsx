
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Bot,
  Plus,
  Search,
  Settings,
  Play,
  Pause,
  Edit,
  Trash2,
  BarChart3,
  TestTube,
  Zap,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  Activity
} from 'lucide-react'
import { AutomationRuleSummary, AutomationStats } from '@/lib/types'
import { RuleBuilder } from '@/components/automations/rule-builder'
import { AutomationStatsWidget } from '@/components/automations/automation-stats-widget'
import { MessageTester } from '@/components/automations/message-tester'
import { ExecutionHistory } from '@/components/automations/execution-history'

export default function AutomatizacionesPage() {
  const { data: session } = useSession()
  const [rules, setRules] = useState<AutomationRuleSummary[]>([])
  const [stats, setStats] = useState<AutomationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [isRuleBuilderOpen, setIsRuleBuilderOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<string | null>(null)

  // Verificar permisos
  if (session?.user?.role !== 'PROPIETARIO') {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-40">
            <div className="text-center">
              <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Acceso Restringido</h3>
              <p className="text-sm text-muted-foreground">
                Solo el propietario puede configurar automatizaciones
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Cargar datos iniciales
  useEffect(() => {
    loadRules()
    loadStats()
  }, [])

  const loadRules = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/automations/rules')
      const data = await response.json()
      
      if (data.success) {
        setRules(data.data)
      }
    } catch (error) {
      console.error('Error cargando reglas:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/automations/stats')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
    }
  }

  const toggleRuleStatus = async (ruleId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/automations/rules/${ruleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (response.ok) {
        loadRules()
        loadStats()
      }
    } catch (error) {
      console.error('Error actualizando regla:', error)
    }
  }

  const deleteRule = async (ruleId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta regla?')) {
      return
    }

    try {
      const response = await fetch(`/api/automations/rules/${ruleId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        loadRules()
        loadStats()
      }
    } catch (error) {
      console.error('Error eliminando regla:', error)
    }
  }

  // Filtrar reglas
  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = !showActiveOnly || rule.isActive
    
    return matchesSearch && matchesFilter
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary" />
            Etiquetado Inteligente
          </h1>
          <p className="text-muted-foreground">
            Configure reglas automáticas para clasificar y responder conversaciones
          </p>
        </div>
        
        <Dialog open={isRuleBuilderOpen} onOpenChange={setIsRuleBuilderOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Regla
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Constructor de Reglas</DialogTitle>
              <DialogDescription>
                Cree reglas personalizadas para automatizar la clasificación de conversaciones
              </DialogDescription>
            </DialogHeader>
            <RuleBuilder
              ruleId={editingRule}
              onSave={() => {
                setIsRuleBuilderOpen(false)
                setEditingRule(null)
                loadRules()
                loadStats()
              }}
              onCancel={() => {
                setIsRuleBuilderOpen(false)
                setEditingRule(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      {stats && <AutomationStatsWidget stats={stats} />}

      {/* Tabs principales */}
      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Reglas
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Historial
          </TabsTrigger>
          <TabsTrigger value="tester" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Probador
          </TabsTrigger>
        </TabsList>

        {/* Panel de Reglas */}
        <TabsContent value="rules" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reglas de Automatización</CardTitle>
              <CardDescription>
                Gestione las reglas que determinan cómo se procesan los mensajes entrantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar reglas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="active-only"
                    checked={showActiveOnly}
                    onCheckedChange={setShowActiveOnly}
                  />
                  <label htmlFor="active-only" className="text-sm">
                    Solo activas
                  </label>
                </div>
              </div>

              {/* Tabla de reglas */}
              {loading ? (
                <div className="text-center py-8">Cargando reglas...</div>
              ) : filteredRules.length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay reglas configuradas</h3>
                  <p className="text-muted-foreground mb-4">
                    Crea tu primera regla para activar la inteligencia artificial
                  </p>
                  <Button onClick={() => setIsRuleBuilderOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Regla
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Regla</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Prioridad</TableHead>
                      <TableHead>Condiciones</TableHead>
                      <TableHead>Acciones</TableHead>
                      <TableHead>Estadísticas</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{rule.name}</div>
                            {rule.description && (
                              <div className="text-sm text-muted-foreground">
                                {rule.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                            {rule.isActive ? (
                              <><CheckCircle2 className="h-3 w-3 mr-1" />Activa</>
                            ) : (
                              <><Pause className="h-3 w-3 mr-1" />Pausada</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            <Target className="h-3 w-3 mr-1" />
                            {rule.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {rule.conditionsCount} condición{rule.conditionsCount !== 1 ? 'es' : ''}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {rule.actionsCount} acción{rule.actionsCount !== 1 ? 'es' : ''}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              {rule.executionCount} ejecuciones
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <BarChart3 className="h-3 w-3" />
                              {Math.round(rule.successRate * 100)}% éxito
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRuleStatus(rule.id, rule.isActive)}
                            >
                              {rule.isActive ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingRule(rule.id)
                                setIsRuleBuilderOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteRule(rule.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Panel de Historial */}
        <TabsContent value="history">
          <ExecutionHistory />
        </TabsContent>

        {/* Panel de Probador */}
        <TabsContent value="tester">
          <MessageTester onTestComplete={loadStats} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
