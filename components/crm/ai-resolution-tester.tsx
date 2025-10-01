

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bot, 
  Search, 
  FileText, 
  Clock, 
  Target, 
  CheckCircle, 
  AlertCircle,
  Download,
  Zap
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ResolutionResult {
  responseText: string
  filesToSend: Array<{
    sourceId: string
    sourceName: string
    fileName: string
    reason: string
  }>
  knowledgeUsed: Array<{
    sourceId: string
    sourceName: string
    content: string
    similarity: number
  }>
  confidence: number
  processingTime: number
}

interface TestResult {
  query: string
  resolution: ResolutionResult
  summary: {
    hasResponse: boolean
    confidence: number
    knowledgeSourcesFound: number
    filesWouldBeSent: number
    processingTimeMs: number
    wouldAutoRespond: boolean
  }
}

export function AIResolutionTester() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)
  const [stats, setStats] = useState<any>(null)

  const testResolution = async () => {
    if (!query.trim()) {
      toast.error('Por favor ingresa una consulta para probar')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/crm/ai-resolution/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query.trim(),
          options: {
            responseStyle: 'professional'
          }
        })
      })

      if (!response.ok) {
        throw new Error('Error en la prueba')
      }

      const data = await response.json()
      setResult(data.data)
      toast.success('Prueba completada')

    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al probar la resolución')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/crm/ai-resolution/test')
      if (response.ok) {
        const data = await response.json()
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500'
    if (confidence >= 0.6) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'Alta'
    if (confidence >= 0.6) return 'Media'
    return 'Baja'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Probador de IA Resolutiva</h2>
          <p className="text-gray-600">
            Prueba cómo la IA responde a consultas de clientes usando el entrenamiento de IA
          </p>
        </div>
        <Button onClick={loadStats} variant="outline" size="sm">
          <Target className="h-4 w-4 mr-2" />
          Ver Estadísticas
        </Button>
      </div>

      <Tabs defaultValue="tester" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tester" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Probador
          </TabsTrigger>
          {stats && (
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Estadísticas
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="tester" className="space-y-6">
          {/* Formulario de prueba */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Consulta de Prueba
              </CardTitle>
              <CardDescription>
                Simula una pregunta de cliente para ver cómo responde la IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Ejemplo: ¿Cuáles son sus horarios de atención? o ¿Tienen catálogo de productos?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={3}
                className="w-full"
              />
              <Button 
                onClick={testResolution} 
                disabled={loading || !query.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-pulse" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4 mr-2" />
                    Probar Resolución
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Resultados */}
          {result && (
            <div className="space-y-4">
              {/* Resumen */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Resumen de Resultados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getConfidenceColor(result.summary.confidence)}`} />
                        <span className="text-sm font-medium">Confianza</span>
                      </div>
                      <div className="text-2xl font-bold">
                        {Math.round(result.summary.confidence * 100)}%
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {getConfidenceLabel(result.summary.confidence)}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Fuentes</span>
                      </div>
                      <div className="text-2xl font-bold">
                        {result.summary.knowledgeSourcesFound}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Encontradas
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Archivos</span>
                      </div>
                      <div className="text-2xl font-bold">
                        {result.summary.filesWouldBeSent}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Se enviarían
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">Tiempo</span>
                      </div>
                      <div className="text-2xl font-bold">
                        {result.summary.processingTimeMs}ms
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Procesamiento
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2">
                      {result.summary.wouldAutoRespond ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="font-medium text-green-700">
                            La IA respondería automáticamente
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                          <span className="font-medium text-yellow-700">
                            La IA no respondería automáticamente (confianza insuficiente)
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Respuesta generada */}
              <Card>
                <CardHeader>
                  <CardTitle>Respuesta Generada</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {result.resolution.responseText}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Archivos que se enviarían */}
              {result.resolution.filesToSend.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      Archivos que se Enviarían Automáticamente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.resolution.filesToSend.map((file, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-blue-500" />
                              <span className="font-medium">{file.fileName}</span>
                            </div>
                            <Badge variant="outline">{file.sourceName}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{file.reason}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Fuentes de conocimiento utilizadas */}
              {result.resolution.knowledgeUsed.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Fuentes de Conocimiento Utilizadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.resolution.knowledgeUsed.map((source, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{source.sourceName}</span>
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={source.similarity * 100} 
                                className="w-20 h-2"
                              />
                              <Badge variant="outline" className="text-xs">
                                {Math.round(source.similarity * 100)}%
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            {source.content.substring(0, 200)}...
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats">
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas de Resolución ({stats.period})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Total Resoluciones</span>
                    <div className="text-2xl font-bold">{stats.statistics.totalResolutions}</div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Confianza Promedio</span>
                    <div className="text-2xl font-bold">
                      {Math.round(stats.statistics.avgConfidence * 100)}%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Tiempo Promedio</span>
                    <div className="text-2xl font-bold">
                      {Math.round(stats.statistics.avgProcessingTime)}ms
                    </div>
                  </div>
                </div>

                {stats.recentQueries.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Consultas Recientes</h4>
                    <div className="space-y-2">
                      {stats.recentQueries.map((q: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{q.query}</span>
                          <Badge variant="outline">
                            {Math.round(q.confidence * 100)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
