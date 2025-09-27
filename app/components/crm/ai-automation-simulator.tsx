
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Bot, 
  Send, 
  Sparkles, 
  Target, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  User
} from 'lucide-react'
import { AI_INTENTION_LABELS } from '@/lib/types'

interface AIAutomationSimulatorProps {
  conversationId: string
  contactName: string
}

interface SimulationResult {
  messageId: string
  contactName: string
  aiProcessing: {
    analysis: {
      detectedIntentions: string[]
      confidenceScore: number
      sentiment: string
      keywordsExtracted: string[]
      processingTime: number
    }
    automationsExecuted: number
    automationsSkipped: number
  }
}

export function AIAutomationSimulator({ conversationId, contactName }: AIAutomationSimulatorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Mensajes de ejemplo para pruebas rápidas
  const quickTestMessages = [
    "Hola, me interesa conocer más sobre sus productos y precios",
    "Tengo un problema con mi pedido, necesito ayuda urgente",
    "Buenos días, quisiera hacer una queja sobre el servicio",
    "¿Podrían ayudarme a agendar una cita para mañana?",
    "¿Cómo puedo realizar el pago de mi factura pendiente?",
    "Muchas gracias por su atención, que tengan buen día"
  ]

  const handleSimulate = async () => {
    if (!message.trim()) {
      setError('Por favor ingrese un mensaje para simular')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/crm/messages/simulate-incoming', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          content: message.trim()
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
        // Limpiar mensaje después de simulación exitosa
        setMessage('')
      } else {
        setError(data.error || 'Error simulando mensaje')
      }
    } catch (error) {
      console.error('Error simulando mensaje:', error)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const loadQuickMessage = (quickMessage: string) => {
    setMessage(quickMessage)
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <Bot className="h-4 w-4 mr-2" />
          Probar IA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Simulador de IA Activa
          </DialogTitle>
          <DialogDescription>
            Simule un mensaje entrante de {contactName} para probar cómo responderán las automatizaciones
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Input del mensaje */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Mensaje simulado:
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escriba el mensaje que el contacto enviaría..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Mensajes rápidos */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Mensajes de prueba rápida:
            </label>
            <div className="grid grid-cols-1 gap-2">
              {quickTestMessages.map((quickMsg, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => loadQuickMessage(quickMsg)}
                  className="text-xs h-auto py-2 px-3 whitespace-normal text-left justify-start"
                >
                  <Send className="h-3 w-3 mr-2 flex-shrink-0" />
                  {quickMsg}
                </Button>
              ))}
            </div>
          </div>

          {/* Botón de simulación */}
          <Button 
            onClick={handleSimulate} 
            disabled={loading || !message.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Bot className="h-4 w-4 mr-2 animate-spin" />
                Simulando y procesando con IA...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Simular Mensaje Entrante
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

          {/* Resultado de la simulación */}
          {result && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  ✅ Mensaje simulado exitosamente. El mensaje aparecerá en la conversación y se procesó con IA.
                </AlertDescription>
              </Alert>

              {/* Información del análisis de IA */}
              {result.aiProcessing && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      Resultado del Análisis de IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Intenciones detectadas */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4" />
                        <span className="text-sm font-medium">Intenciones Detectadas</span>
                        <Badge variant="outline">
                          Confianza: {Math.round(result.aiProcessing.analysis.confidenceScore * 100)}%
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.aiProcessing.analysis.detectedIntentions.map((intention) => (
                          <Badge key={intention} variant="default">
                            {AI_INTENTION_LABELS[intention as keyof typeof AI_INTENTION_LABELS] || intention}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Automatizaciones ejecutadas */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4" />
                        <span className="text-sm font-medium">Automatizaciones</span>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>{result.aiProcessing.automationsExecuted} ejecutadas</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{result.aiProcessing.automationsSkipped} omitidas</span>
                        </div>
                      </div>
                    </div>

                    {/* Palabras clave */}
                    {result.aiProcessing.analysis.keywordsExtracted.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium">Palabras Clave</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.aiProcessing.analysis.keywordsExtracted.map((keyword, index) => (
                            <Badge key={index} variant="secondary">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Metadatos */}
                    <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t">
                      <div>
                        <div className="font-medium">Sentimiento</div>
                        <div className={getSentimentColor(result.aiProcessing.analysis.sentiment)}>
                          {result.aiProcessing.analysis.sentiment === 'positive' ? 'Positivo' : 
                           result.aiProcessing.analysis.sentiment === 'negative' ? 'Negativo' : 'Neutral'}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Tiempo de Procesamiento</div>
                        <div className="text-muted-foreground">
                          {result.aiProcessing.analysis.processingTime}ms
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Acción recomendada */}
              <Alert>
                <User className="h-4 w-4" />
                <AlertDescription>
                  💡 <strong>Tip:</strong> Revise la conversación para ver el mensaje simulado y cualquier acción automática que se haya ejecutado (etiquetas, asignaciones, respuestas automáticas, etc.).
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Botón para cerrar */}
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
