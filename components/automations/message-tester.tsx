
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  TestTube, 
  Send, 
  Bot, 
  Target, 
  Hash, 
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { AI_INTENTION_LABELS, AI_INTENTION_COLORS } from '@/lib/types'

interface MessageTesterProps {
  onTestComplete?: () => void
}

interface TestResult {
  message: string
  analysis: {
    detectedIntentions: string[]
    confidenceScore: number
    sentiment: string
    keywordsExtracted: string[]
    aiProvider: string
    modelUsed: string
    processingTime: number
  }
  timestamp: string
}

export function MessageTester({ onTestComplete }: MessageTesterProps) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Ejemplos de mensajes para testing
  const exampleMessages = [
    "Hola, me interesa conocer los precios de sus productos",
    "Buenos días, tengo un problema con mi pedido anterior",
    "¿Podrían ayudarme con una consulta técnica?",
    "Quiero hacer una queja sobre el servicio recibido",
    "Me gustaría agendar una cita para mañana",
    "¿Cómo puedo realizar el pago de mi factura?",
    "Necesito más información sobre sus servicios",
    "Gracias por todo, que tengan buen día"
  ]

  const handleTest = async () => {
    if (!message.trim()) {
      setError('Por favor ingrese un mensaje para probar')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/automations/test-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message.trim() }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
        if (onTestComplete) {
          onTestComplete()
        }
      } else {
        setError(data.error || 'Error analizando mensaje')
      }
    } catch (error) {
      console.error('Error probando mensaje:', error)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const loadExample = (exampleMessage: string) => {
    setMessage(exampleMessage)
    setResult(null)
    setError(null)
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600'
      case 'negative': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getSentimentLabel = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'Positivo'
      case 'negative': return 'Negativo'
      default: return 'Neutral'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Probador de Análisis de IA
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Pruebe cómo el sistema de IA analizará diferentes tipos de mensajes
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input del mensaje */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Mensaje a analizar:
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escriba el mensaje que quiere probar..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Ejemplos rápidos */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Ejemplos rápidos:
            </label>
            <div className="flex flex-wrap gap-2">
              {exampleMessages.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => loadExample(example)}
                  className="text-xs h-auto py-1 px-2 whitespace-normal text-left"
                >
                  "{example.substring(0, 30)}..."
                </Button>
              ))}
            </div>
          </div>

          {/* Botón de test */}
          <Button 
            onClick={handleTest} 
            disabled={loading || !message.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Bot className="h-4 w-4 mr-2 animate-spin" />
                Analizando mensaje...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Probar Análisis
              </>
            )}
          </Button>

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Resultado del análisis */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Resultado del Análisis
            </CardTitle>
            <div className="text-xs text-muted-foreground">
              Analizando: "{result.message}"
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Intenciones detectadas */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4" />
                <span className="text-sm font-medium">Intenciones Detectadas</span>
                <Badge variant="outline">
                  Confianza: {Math.round(result.analysis.confidenceScore * 100)}%
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.analysis.detectedIntentions.map((intention) => (
                  <Badge
                    key={intention}
                    variant="default"
                    className={`bg-${AI_INTENTION_COLORS[intention as keyof typeof AI_INTENTION_COLORS]}-100 text-${AI_INTENTION_COLORS[intention as keyof typeof AI_INTENTION_COLORS]}-800`}
                  >
                    {AI_INTENTION_LABELS[intention as keyof typeof AI_INTENTION_LABELS] || intention}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Sentimiento */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm font-medium">Análisis de Sentimiento</span>
              </div>
              <Badge 
                variant="outline" 
                className={getSentimentColor(result.analysis.sentiment)}
              >
                {getSentimentLabel(result.analysis.sentiment)}
              </Badge>
            </div>

            <Separator />

            {/* Palabras clave */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Hash className="h-4 w-4" />
                <span className="text-sm font-medium">Palabras Clave Extraídas</span>
              </div>
              {result.analysis.keywordsExtracted.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {result.analysis.keywordsExtracted.map((keyword, index) => (
                    <Badge key={index} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No se encontraron palabras clave relevantes
                </p>
              )}
            </div>

            <Separator />

            {/* Metadatos técnicos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <div className="font-medium">Proveedor IA</div>
                <div className="text-muted-foreground">{result.analysis.aiProvider}</div>
              </div>
              <div>
                <div className="font-medium">Modelo</div>
                <div className="text-muted-foreground">{result.analysis.modelUsed}</div>
              </div>
              <div>
                <div className="font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Tiempo
                </div>
                <div className="text-muted-foreground">
                  {result.analysis.processingTime}ms
                </div>
              </div>
              <div>
                <div className="font-medium">Estado</div>
                <div className="text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Exitoso
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
