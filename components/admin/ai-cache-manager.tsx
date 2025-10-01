
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Trash2, BarChart3, Clock, DollarSign, Database } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface CacheStats {
  totalEntries: number
  totalHits: number
  averageHitRate: number
  totalSavings: number
  topCachedQueries: Array<{
    promptHash: string
    hitCount: number
    response: string
  }>
}

export function AICacheManager() {
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPurging, setIsPurging] = useState(false)

  const loadCacheStats = async () => {
    try {
      const response = await fetch('/api/admin/ai-cache')
      const data = await response.json()

      if (data.success) {
        setCacheStats(data.stats)
      } else {
        toast.error('Error cargando estadísticas del caché')
      }
    } catch (error) {
      console.error('Error loading cache stats:', error)
      toast.error('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  const purgeCache = async () => {
    if (!confirm('¿Estás seguro de que quieres purgar todo el caché de IA? Esta acción no se puede deshacer.')) {
      return
    }

    setIsPurging(true)

    try {
      const response = await fetch('/api/admin/ai-cache', {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`✅ ${data.message}`)
        // Recargar estadísticas
        await loadCacheStats()
      } else {
        toast.error(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error purging cache:', error)
      toast.error('❌ Error de conexión al purgar caché')
    } finally {
      setIsPurging(false)
    }
  }

  useEffect(() => {
    loadCacheStats()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Caché Inteligente de IA
          </CardTitle>
          <CardDescription>Cargando estadísticas del caché...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header del Caché */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-600" />
                Caché Inteligente de IA
              </CardTitle>
              <CardDescription>
                Sistema de optimización de costos mediante cache de respuestas repetitivas
              </CardDescription>
            </div>
            <Button
              onClick={purgeCache}
              disabled={isPurging}
              variant="destructive"
              size="sm"
              className="flex items-center gap-2"
            >
              {isPurging ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Purgar Caché
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="border-purple-200 bg-purple-50">
            <Database className="w-4 h-4 text-purple-600" />
            <AlertDescription className="text-purple-700">
              <strong>Optimización Activa:</strong> El sistema almacena respuestas de IA comunes 
              y las sirve con una tarifa simbólica (10% del costo original), reduciendo 
              drásticamente los gastos operativos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Estadísticas del Caché */}
      {cacheStats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total de Entradas */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Entradas en Caché</p>
                    <p className="text-2xl font-bold text-gray-900">{cacheStats.totalEntries.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Database className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total de Hits */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Usos del Caché</p>
                    <p className="text-2xl font-bold text-gray-900">{cacheStats.totalHits.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tasa de Hit Promedio */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tasa de Hit</p>
                    <p className="text-2xl font-bold text-gray-900">{cacheStats.averageHitRate.toFixed(1)}x</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ahorro Total */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ahorro Total</p>
                    <p className="text-2xl font-bold text-green-600">${cacheStats.totalSavings.toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Consultas en Caché */}
          {cacheStats.topCachedQueries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Consultas Más Cachadas</CardTitle>
                <CardDescription>
                  Las consultas que más se han reutilizado desde el caché
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cacheStats.topCachedQueries.map((query, index) => (
                    <div key={query.promptHash} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">#{index + 1}</Badge>
                          <Badge variant="outline">
                            {query.hitCount} uso{query.hitCount !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {query.response}
                        </p>
                        <p className="text-xs text-gray-400 mt-2 font-mono">
                          Hash: {query.promptHash.substring(0, 16)}...
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información del Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Tarifa de Caché:</p>
                  <p className="text-gray-600">10% del costo original de la IA</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Expiración:</p>
                  <p className="text-gray-600">30 días por defecto</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Algoritmo de Hash:</p>
                  <p className="text-gray-600">MD5 normalizado</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Ahorro Promedio:</p>
                  <p className="text-gray-600">90% del costo original por hit</p>
                </div>
              </div>

              <Separator />

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Funcionamiento del Sistema</h4>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Se genera un hash normalizado del prompt del usuario</li>
                  <li>Se busca una respuesta existente en el caché de la organización</li>
                  <li>Si existe: se devuelve la respuesta y se cobra tarifa simbólica (10%)</li>
                  <li>Si no existe: se procesa normalmente y se guarda en caché</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Acciones */}
      <div className="flex justify-end">
        <Button 
          onClick={loadCacheStats} 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          Actualizar Estadísticas
        </Button>
      </div>
    </div>
  )
}
