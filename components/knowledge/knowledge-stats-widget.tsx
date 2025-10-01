
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Zap,
  BarChart3,
  Activity
} from 'lucide-react'
import { KnowledgeStats } from '@/lib/types'

interface KnowledgeStatsWidgetProps {
  stats: KnowledgeStats
}

export function KnowledgeStatsWidget({ stats }: KnowledgeStatsWidgetProps) {
  const processingRate = stats.totalChunks > 0 
    ? Math.round((stats.processedChunks / stats.totalChunks) * 100) 
    : 0

  const errorRate = stats.totalSources > 0
    ? Math.round((stats.errorSources / stats.totalSources) * 100)
    : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Fuentes de Conocimiento */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Fuentes de Conocimiento
          </CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSources}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              {stats.activeSources} activas
            </Badge>
            {stats.processingSources > 0 && (
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {stats.processingSources} procesando
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fragmentos de Contenido */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Fragmentos de Contenido
          </CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalChunks.toLocaleString()}</div>
          <div className="space-y-2 mt-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Procesados: {stats.processedChunks}</span>
              <span>{processingRate}%</span>
            </div>
            <Progress value={processingRate} className="h-2" />
            {stats.failedChunks > 0 && (
              <div className="text-xs text-red-500">
                {stats.failedChunks} fragmentos fallaron
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Uso y Actividad */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Uso del Conocimiento
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsage}</div>
          <p className="text-xs text-muted-foreground">
            {stats.usageThisMonth} consultas este mes
          </p>
          <div className="mt-2">
            {stats.usageThisMonth > 0 && stats.totalUsage > 0 && (
              <Badge variant="outline" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                {Math.round((stats.usageThisMonth / stats.totalUsage) * 100)}% este mes
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Calidad del Contenido */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Calidad del Contenido
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round(stats.avgQuality * 100)}%
          </div>
          <div className="space-y-2 mt-2">
            <Progress value={stats.avgQuality * 100} className="h-2" />
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Calidad promedio</span>
              {stats.errorSources > 0 && (
                <span className="text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errorRate}% con errores
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fuentes Más Utilizadas (si hay datos) */}
      {stats.topSources.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Fuentes Más Utilizadas</CardTitle>
            <CardDescription>
              Fuentes de conocimiento que más han ayudado a tu IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topSources.slice(0, 3).map((source, index) => (
                <div key={source.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{source.name}</div>
                      <div className="text-xs text-gray-500">
                        {source.usageCount} usos
                        {source.quality && (
                          <span className="ml-2">
                            • Calidad: {Math.round(source.quality * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {source.usageCount}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actividad Reciente */}
      {stats.recentActivity.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Actividad Reciente</CardTitle>
            <CardDescription>
              Últimas actualizaciones en el entrenamiento de tu IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.slice(0, 5).map((activity, index) => (
                <div key={`${activity.id}-${index}`} className="flex items-center gap-3 p-2">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'ACTIVE' ? 'bg-green-500' :
                    activity.status === 'ERROR' ? 'bg-red-500' :
                    activity.status === 'PROCESSING' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {activity.sourceName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {activity.action === 'created' ? 'Fuente creada' : 'Actualizada'} • {' '}
                      {new Date(activity.timestamp).toLocaleDateString('es-ES', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <Badge 
                    variant={
                      activity.status === 'ACTIVE' ? 'default' :
                      activity.status === 'ERROR' ? 'destructive' :
                      activity.status === 'PROCESSING' ? 'secondary' :
                      'outline'
                    }
                    className="text-xs"
                  >
                    {activity.status.toLowerCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
