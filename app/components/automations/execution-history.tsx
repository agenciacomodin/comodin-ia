
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Activity,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { AutomationExecutionSummary, AI_INTENTION_LABELS } from '@/lib/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function ExecutionHistory() {
  const [executions, setExecutions] = useState<AutomationExecutionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [availableRules, setAvailableRules] = useState([])
  const [selectedRule, setSelectedRule] = useState<string>('all')

  const limit = 25

  useEffect(() => {
    loadExecutions()
    loadAvailableRules()
  }, [currentPage, statusFilter, selectedRule])

  const loadExecutions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString()
      })

      if (statusFilter !== 'all') {
        params.append('success', (statusFilter === 'success').toString())
      }

      if (selectedRule !== 'all') {
        params.append('ruleId', selectedRule)
      }

      const response = await fetch(`/api/automations/executions?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setExecutions(data.data)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error cargando historial:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableRules = async () => {
    try {
      const response = await fetch('/api/automations/rules')
      const data = await response.json()
      
      if (data.success) {
        setAvailableRules(data.data)
      }
    } catch (error) {
      console.error('Error cargando reglas:', error)
    }
  }

  // Filtrar por término de búsqueda (lado cliente)
  const filteredExecutions = executions.filter(execution =>
    execution.ruleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    execution.contactName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatExecutionTime = (timeMs: number) => {
    if (timeMs < 1000) {
      return `${timeMs}ms`
    }
    return `${(timeMs / 1000).toFixed(1)}s`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Historial de Ejecuciones
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Registro detallado de todas las automatizaciones ejecutadas
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por regla o contacto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={selectedRule}
            onValueChange={(value) => {
              setSelectedRule(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las reglas</SelectItem>
              {availableRules.map((rule: any) => (
                <SelectItem key={rule.id} value={rule.id}>
                  {rule.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value as 'all' | 'success' | 'failed')
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="success">Exitosas</SelectItem>
              <SelectItem value="failed">Fallidas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabla de ejecuciones */}
        {loading ? (
          <div className="text-center py-8">Cargando historial...</div>
        ) : filteredExecutions.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay ejecuciones</h3>
            <p className="text-muted-foreground">
              Las ejecuciones de automatizaciones aparecerán aquí
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Regla</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Intenciones</TableHead>
                  <TableHead>Confianza</TableHead>
                  <TableHead>Tiempo</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExecutions.map((execution) => (
                  <TableRow key={execution.id}>
                    <TableCell>
                      <div className="font-medium">{execution.ruleName}</div>
                    </TableCell>
                    <TableCell>
                      {execution.contactName ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {execution.contactName}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={execution.success ? "default" : "destructive"}
                        className="flex items-center gap-1 w-fit"
                      >
                        {execution.success ? (
                          <><CheckCircle2 className="h-3 w-3" />Exitosa</>
                        ) : (
                          <><XCircle className="h-3 w-3" />Fallida</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {execution.detectedIntentions.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {execution.detectedIntentions.slice(0, 2).map((intention) => (
                            <Badge key={intention} variant="secondary" className="text-xs">
                              {AI_INTENTION_LABELS[intention as keyof typeof AI_INTENTION_LABELS] || intention}
                            </Badge>
                          ))}
                          {execution.detectedIntentions.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{execution.detectedIntentions.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {execution.confidenceScore ? (
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {Math.round(execution.confidenceScore * 100)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {formatExecutionTime(execution.executionTime)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(execution.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
