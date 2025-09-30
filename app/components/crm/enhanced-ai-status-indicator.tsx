

'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Bot, 
  Brain, 
  FileSearch, 
  Zap, 
  Target,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Activity
} from 'lucide-react'

interface AIStatusProps {
  conversationId?: string
  className?: string
}

export function EnhancedAIStatusIndicator({ conversationId, className }: AIStatusProps) {
  const [isActive, setIsActive] = useState(true)
  const [knowledgeBaseSize, setKnowledgeBaseSize] = useState(0)
  const [recentResolutions, setRecentResolutions] = useState(0)

  useEffect(() => {
    // Simular carga de estadísticas
    loadAIStats()
  }, [])

  const loadAIStats = async () => {
    try {
      // En una implementación real, esto vendría de una API
      setKnowledgeBaseSize(42) // Fuentes de conocimiento activas
      setRecentResolutions(15) // Resoluciones exitosas recientes
    } catch (error) {
      console.error('Error cargando estadísticas de IA:', error)
    }
  }

  const getStatusColor = () => {
    return isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'
  }

  const getStatusIcon = () => {
    return isActive ? (
      <CheckCircle className="h-3 w-3" />
    ) : (
      <AlertTriangle className="h-3 w-3" />
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Badge 
          variant="outline" 
          className={`${getStatusColor()} cursor-pointer hover:shadow-md transition-shadow ${className}`}
        >
          <div className="flex items-center gap-1.5">
            {getStatusIcon()}
            <Brain className="h-3 w-3" />
            <span className="font-medium">IA Resolutiva {isActive ? 'Activa' : 'Inactiva'}</span>
          </div>
        </Badge>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-500" />
            Estado del Sistema de IA Resolutiva
          </DialogTitle>
          <DialogDescription>
            Sistema inteligente que responde automáticamente usando el entrenamiento de IA
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado principal */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {isActive ? (
                      <Zap className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      Sistema {isActive ? 'Operativo' : 'Inactivo'}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {isActive 
                        ? 'La IA está respondiendo automáticamente a consultas de clientes'
                        : 'La IA no está procesando mensajes automáticamente'
                      }
                    </p>
                  </div>
                </div>
                <Button 
                  variant={isActive ? "destructive" : "default"}
                  size="sm"
                  onClick={() => setIsActive(!isActive)}
                >
                  {isActive ? 'Desactivar' : 'Activar'} IA
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Capacidades */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileSearch className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-sm">Búsqueda Semántica</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{knowledgeBaseSize}</div>
                <p className="text-xs text-gray-600">Fuentes activas</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-sm">Resoluciones</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{recentResolutions}</div>
                <p className="text-xs text-gray-600">Últimos 7 días</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-purple-500" />
                  <span className="font-medium text-sm">Precisión</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">87%</div>
                <p className="text-xs text-gray-600">Confianza promedio</p>
              </CardContent>
            </Card>
          </div>

          {/* Características */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">¿Cómo Funciona?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Análisis Inteligente</p>
                    <p className="text-xs text-gray-600">
                      La IA analiza cada mensaje entrante para detectar intenciones y necesidades
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-xs font-bold">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Búsqueda en Knowledge Base</p>
                    <p className="text-xs text-gray-600">
                      Busca información relevante en documentos, manuales y catálogos subidos
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 text-xs font-bold">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Respuesta + Archivos</p>
                    <p className="text-xs text-gray-600">
                      Genera respuesta contextual y envía automáticamente los archivos relevantes
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuraciones rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configuración Rápida</CardTitle>
              <CardDescription>
                Ajusta el comportamiento de la IA para este chat específico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Enviar archivos automáticamente</span>
                </div>
                <Badge variant="secondary">Activo</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Respuesta inmediata (sin delay)</span>
                </div>
                <Badge variant="secondary">Activo</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Confianza mínima para responder</span>
                </div>
                <Badge variant="outline">70%</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
