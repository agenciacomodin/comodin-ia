
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Bot,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Target,
  Activity
} from 'lucide-react'
import { AutomationStats, AI_INTENTION_LABELS, AUTOMATION_ACTION_LABELS } from '@/lib/types'

interface AutomationStatsWidgetProps {
  stats: AutomationStats
}

export function AutomationStatsWidget({ stats }: AutomationStatsWidgetProps) {
  const successRate = stats.totalExecutions > 0 
    ? Math.round((stats.successfulExecutions / stats.totalExecutions) * 100)
    : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Reglas Activas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reglas Activas</CardTitle>
          <Bot className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeRules}</div>
          <p className="text-xs text-muted-foreground">
            de {stats.totalRules} reglas totales
          </p>
          <Progress 
            value={stats.totalRules > 0 ? (stats.activeRules / stats.totalRules) * 100 : 0} 
            className="mt-2" 
          />
        </CardContent>
      </Card>

      {/* Ejecuciones de Hoy */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ejecuciones Hoy</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.executionsToday}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalExecutions} total
          </p>
        </CardContent>
      </Card>

      {/* Tasa de Éxito */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasa de Éxito</CardTitle>
          {successRate >= 90 ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : successRate >= 70 ? (
            <TrendingUp className="h-4 w-4 text-yellow-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{successRate}%</div>
          <p className="text-xs text-muted-foreground">
            {stats.successfulExecutions} exitosas, {stats.failedExecutions} fallidas
          </p>
          <Progress value={successRate} className="mt-2" />
        </CardContent>
      </Card>

      {/* Tiempo de Respuesta Promedio */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.avgExecutionTime < 1000 
              ? `${stats.avgExecutionTime}ms`
              : `${(stats.avgExecutionTime / 1000).toFixed(1)}s`
            }
          </div>
          <p className="text-xs text-muted-foreground">
            por ejecución
          </p>
        </CardContent>
      </Card>

      {/* Top Intenciones */}
      {stats.topIntentions.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Intenciones Más Detectadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topIntentions.slice(0, 5).map((item) => (
                <div key={item.intention} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {AI_INTENTION_LABELS[item.intention as keyof typeof AI_INTENTION_LABELS] || item.intention}
                    </Badge>
                  </div>
                  <div className="text-sm font-medium">{item.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Acciones */}
      {stats.topActions.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Acciones Más Ejecutadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topActions.slice(0, 5).map((item) => (
                <div key={item.action} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {AUTOMATION_ACTION_LABELS[item.action as keyof typeof AUTOMATION_ACTION_LABELS] || item.action}
                    </Badge>
                  </div>
                  <div className="text-sm font-medium">{item.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
