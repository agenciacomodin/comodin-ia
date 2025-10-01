

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { 
  Send, 
  Paperclip, 
  Mic, 
  MicOff, 
  Image, 
  File, 
  Video, 
  X, 
  Play, 
  Pause, 
  Square,
  Search,
  Hash,
  Clock,
  FileText,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  MessageComposerState,
  MessageComposerFile,
  AudioRecordingState,
  QuickReplySummary,
  SendMessageOptions,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZES
} from '@/lib/types'
import { MessageType } from '@prisma/client'
import { toast } from 'react-hot-toast'

// Mock data para respuestas rápidas
const mockQuickReplies: QuickReplySummary[] = [
  {
    id: 'qr1',
    title: 'Saludo Inicial',
    shortcut: 'hola',
    content: '¡Hola! Gracias por contactarnos. ¿En qué podemos ayudarte hoy?',
    category: 'Saludos',
    tags: ['saludo', 'bienvenida'],
    usageCount: 156,
    lastUsedAt: new Date(),
    createdAt: new Date(),
    createdByName: 'Ana Martínez'
  },
  {
    id: 'qr2',
    title: 'Información de Precios',
    shortcut: 'precios',
    content: 'Te envío nuestra lista de precios actualizada. Si tienes alguna duda específica, no dudes en consultarme.',
    category: 'Ventas',
    tags: ['precios', 'ventas', 'productos'],
    usageCount: 89,
    lastUsedAt: new Date(),
    createdAt: new Date(),
    createdByName: 'Carlos Rivera'
  },
  {
    id: 'qr3',
    title: 'Horarios de Atención',
    shortcut: 'horarios',
    content: 'Nuestros horarios de atención son:\n\n📅 Lunes a Viernes: 9:00 AM - 6:00 PM\n📅 Sábados: 9:00 AM - 2:00 PM\n📅 Domingos: Cerrado',
    category: 'Información',
    tags: ['horarios', 'atencion', 'disponibilidad'],
    usageCount: 124,
    lastUsedAt: new Date(),
    createdAt: new Date(),
    createdByName: 'María González'
  },
  {
    id: 'qr4',
    title: 'Agradecimiento',
    shortcut: 'gracias',
    content: '¡Gracias por contactarnos! Ha sido un placer atenderte. Si tienes alguna otra consulta, estaremos aquí para ayudarte.',
    category: 'Despedida',
    tags: ['gracias', 'despedida', 'cierre'],
    usageCount: 203,
    lastUsedAt: new Date(),
    createdAt: new Date(),
    createdByName: 'Luis Herrera'
  },
  {
    id: 'qr5',
    title: 'Soporte Técnico',
    shortcut: 'soporte',
    content: 'Para brindarte el mejor soporte técnico, necesito algunos datos adicionales:\n\n• Modelo del producto\n• Descripción del problema\n• Fotos si es necesario',
    category: 'Soporte',
    tags: ['soporte', 'tecnico', 'ayuda'],
    usageCount: 67,
    lastUsedAt: new Date(),
    createdAt: new Date(),
    createdByName: 'Diego Morales'
  }
]

interface EnhancedMessageComposerProps {
  conversationId: string
  onSendMessage: (options: SendMessageOptions) => void
  disabled?: boolean
  placeholder?: string
}

export function EnhancedMessageComposer({
  conversationId,
  onSendMessage,
  disabled = false,
  placeholder = "Escribe tu mensaje..."
}: EnhancedMessageComposerProps) {
  const { data: session } = useSession() || {}
  
  // Estados principales
  const [composerState, setComposerState] = useState<MessageComposerState>({
    content: '',
    files: [],
    showQuickReplies: false,
    quickReplySearch: ''
  })
  
  const [audioRecording, setAudioRecording] = useState<AudioRecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0
  })

  // Referencias
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-resize del textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [composerState.content])

  // Cleanup de recursos de audio
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  // Función para detectar tipo de archivo
  const getFileType = (file: File): 'image' | 'document' | 'video' | 'audio' => {
    if ((ALLOWED_FILE_TYPES.image as readonly string[]).includes(file.type)) return 'image'
    if ((ALLOWED_FILE_TYPES.video as readonly string[]).includes(file.type)) return 'video'
    if ((ALLOWED_FILE_TYPES.audio as readonly string[]).includes(file.type)) return 'audio'
    return 'document'
  }

  // Validar archivo
  const validateFile = (file: File): string | null => {
    const fileType = getFileType(file)
    const maxSize = MAX_FILE_SIZES[fileType]
    
    if (file.size > maxSize) {
      return `El archivo es muy grande. Máximo ${Math.round(maxSize / (1024 * 1024))}MB para ${fileType}`
    }
    
    return null
  }

  // Manejar selección de archivos
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    files.forEach(file => {
      const error = validateFile(file)
      if (error) {
        toast.error(error)
        return
      }

      const newFile: MessageComposerFile = {
        id: `file_${Date.now()}_${Math.random()}`,
        file,
        type: getFileType(file),
        uploadProgress: 0
      }

      // Crear preview para imágenes
      if (newFile.type === 'image') {
        const reader = new FileReader()
        reader.onload = (e) => {
          setComposerState(prev => ({
            ...prev,
            files: prev.files.map(f => 
              f.id === newFile.id ? { ...f, preview: e.target?.result as string } : f
            )
          }))
        }
        reader.readAsDataURL(file)
      }

      setComposerState(prev => ({
        ...prev,
        files: [...prev.files, newFile]
      }))

      // Simular upload
      simulateUpload(newFile.id)
    })

    // Limpiar input
    event.target.value = ''
  }

  // Simular proceso de upload
  const simulateUpload = (fileId: string) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
      }

      setComposerState(prev => ({
        ...prev,
        files: prev.files.map(f => 
          f.id === fileId ? { ...f, uploadProgress: progress } : f
        )
      }))
    }, 200)
  }

  // Eliminar archivo
  const removeFile = (fileId: string) => {
    setComposerState(prev => ({
      ...prev,
      files: prev.files.filter(f => f.id !== fileId)
    }))
  }

  // Iniciar grabación de audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const audioUrl = URL.createObjectURL(audioBlob)
        
        setAudioRecording(prev => ({
          ...prev,
          audioBlob,
          audioUrl,
          isRecording: false
        }))

        // Detener el stream
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setAudioRecording(prev => ({ ...prev, isRecording: true, duration: 0 }))

      // Contador de duración
      recordingIntervalRef.current = setInterval(() => {
        setAudioRecording(prev => ({ ...prev, duration: prev.duration + 1 }))
      }, 1000)

    } catch (error) {
      toast.error('No se pudo acceder al micrófono')
      console.error('Error al acceder al micrófono:', error)
    }
  }

  // Detener grabación
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
      recordingIntervalRef.current = null
    }
  }

  // Cancelar grabación
  const cancelRecording = () => {
    stopRecording()
    setAudioRecording({
      isRecording: false,
      isPaused: false,
      duration: 0
    })
  }

  // Formatear duración de audio
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Manejar detección de respuestas rápidas
  const handleContentChange = (value: string) => {
    setComposerState(prev => {
      const newState = { ...prev, content: value }
      
      // Detectar si se escribió "/"
      if (value.endsWith('/')) {
        return {
          ...newState,
          showQuickReplies: true,
          quickReplySearch: ''
        }
      } else if (prev.showQuickReplies) {
        // Extraer término de búsqueda después de "/"
        const lastSlash = value.lastIndexOf('/')
        if (lastSlash !== -1) {
          const searchTerm = value.substring(lastSlash + 1)
          return { ...newState, quickReplySearch: searchTerm }
        }
      }
      
      return newState
    })
  }

  // Filtrar respuestas rápidas
  const filteredQuickReplies = mockQuickReplies.filter(reply => {
    if (!composerState.quickReplySearch) return true
    
    const search = composerState.quickReplySearch.toLowerCase()
    return (
      reply.shortcut.toLowerCase().includes(search) ||
      reply.title.toLowerCase().includes(search) ||
      reply.content.toLowerCase().includes(search) ||
      reply.tags.some(tag => tag.toLowerCase().includes(search))
    )
  })

  // Seleccionar respuesta rápida
  const selectQuickReply = (reply: QuickReplySummary) => {
    const lastSlash = composerState.content.lastIndexOf('/')
    const beforeSlash = lastSlash > 0 ? composerState.content.substring(0, lastSlash) : ''
    const newContent = beforeSlash + reply.content
    
    setComposerState(prev => ({
      ...prev,
      content: newContent,
      showQuickReplies: false,
      quickReplySearch: '',
      selectedQuickReply: reply
    }))
    
    textareaRef.current?.focus()
  }

  // Enviar mensaje
  const handleSendMessage = () => {
    if (disabled) return

    const hasContent = composerState.content.trim()
    const hasFiles = composerState.files.length > 0
    const hasAudio = audioRecording.audioBlob

    if (!hasContent && !hasFiles && !hasAudio) {
      textareaRef.current?.focus()
      return
    }

    // Determinar tipo de mensaje
    let messageType: MessageType = 'TEXT'
    if (hasAudio) messageType = 'AUDIO'
    else if (hasFiles) {
      const firstFile = composerState.files[0]
      if (firstFile.type === 'image') messageType = 'IMAGE'
      else if (firstFile.type === 'video') messageType = 'VIDEO'
      else messageType = 'DOCUMENT'
    }

    const sendOptions: SendMessageOptions = {
      content: composerState.content.trim(),
      type: messageType,
      files: composerState.files.map(f => f.file),
      audioBlob: audioRecording.audioBlob,
      quickReplyId: composerState.selectedQuickReply?.id
    }

    onSendMessage(sendOptions)

    // Limpiar compositor
    setComposerState({
      content: '',
      files: [],
      showQuickReplies: false,
      quickReplySearch: ''
    })
    setAudioRecording({
      isRecording: false,
      isPaused: false,
      duration: 0
    })

    textareaRef.current?.focus()
  }

  // Manejar teclas especiales
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
    
    if (e.key === 'Escape' && composerState.showQuickReplies) {
      setComposerState(prev => ({ ...prev, showQuickReplies: false }))
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      case 'audio': return <Mic className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const isReadyToSend = composerState.content.trim() || composerState.files.length > 0 || audioRecording.audioBlob

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* Archivos adjuntos */}
      {composerState.files.length > 0 && (
        <div className="p-3 border-b border-gray-100">
          <div className="flex flex-wrap gap-2">
            {composerState.files.map((file) => (
              <Card key={file.id} className="relative w-20 h-20">
                <CardContent className="p-2 h-full">
                  {file.preview ? (
                    <img 
                      src={file.preview} 
                      alt={file.file.name}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded">
                      {getFileIcon(file.type)}
                      <span className="text-xs mt-1 text-center truncate w-full">
                        {file.file.name.split('.').pop()?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  {file.uploadProgress !== undefined && file.uploadProgress < 100 && (
                    <div className="absolute bottom-1 left-1 right-1">
                      <Progress value={file.uploadProgress} className="h-1" />
                    </div>
                  )}

                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Audio grabado */}
      {audioRecording.audioBlob && (
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center space-x-3 bg-blue-50 p-3 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-full">
              <Mic className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Audio grabado</p>
              <p className="text-xs text-blue-600">{formatDuration(audioRecording.duration)}</p>
            </div>
            {audioRecording.audioUrl && (
              <audio controls className="w-32">
                <source src={audioRecording.audioUrl} type="audio/wav" />
              </audio>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={cancelRecording}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Respuestas rápidas */}
      {composerState.showQuickReplies && (
        <div className="p-3 border-b border-gray-100 max-h-60 overflow-y-auto">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
              <Hash className="h-4 w-4" />
              <span>Respuestas rápidas</span>
              {composerState.quickReplySearch && (
                <span className="text-blue-600">"{composerState.quickReplySearch}"</span>
              )}
            </div>
            
            {filteredQuickReplies.length > 0 ? (
              <div className="space-y-1">
                {filteredQuickReplies.slice(0, 5).map((reply) => (
                  <button
                    key={reply.id}
                    onClick={() => selectQuickReply(reply)}
                    className="w-full text-left p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm text-gray-900">
                            /{reply.shortcut}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {reply.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {reply.content}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 ml-2">
                        <Clock className="h-3 w-3" />
                        <span>{reply.usageCount}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-2">
                No se encontraron respuestas rápidas
              </p>
            )}
          </div>
        </div>
      )}

      {/* Área de composición principal */}
      <div className="p-4">
        <div className="flex items-end space-x-2">
          {/* Botón de adjuntar */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={Object.values(ALLOWED_FILE_TYPES).flat().join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          
          {/* Área de texto */}
          <div className="flex-1 min-w-0">
            <Textarea
              ref={textareaRef}
              value={composerState.content}
              onChange={(e) => handleContentChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={audioRecording.isRecording ? "Grabando audio..." : placeholder}
              disabled={disabled || audioRecording.isRecording}
              className="resize-none min-h-[40px] max-h-[120px] border-0 focus-visible:ring-0 p-3"
              rows={1}
            />
          </div>
          
          {/* Botón de audio */}
          <div className="relative">
            {audioRecording.isRecording ? (
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={stopRecording}
                  className="text-red-600 hover:text-red-700"
                >
                  <Square className="h-5 w-5 fill-current" />
                </Button>
                <div className="flex items-center space-x-2 px-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-red-600 font-mono">
                    {formatDuration(audioRecording.duration)}
                  </span>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500"
                onMouseDown={startRecording}
                disabled={disabled}
                title="Mantén presionado para grabar"
              >
                <Mic className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          {/* Botón de enviar */}
          <Button 
            onClick={handleSendMessage}
            disabled={disabled || !isReadyToSend}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Indicador de respuestas rápidas */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Escribe / para respuestas rápidas</span>
            {composerState.selectedQuickReply && (
              <Badge variant="outline" className="text-xs">
                Usaste: {composerState.selectedQuickReply.shortcut}
              </Badge>
            )}
          </div>
          {audioRecording.isRecording && (
            <span className="text-red-600">
              Presiona el botón cuadrado para detener
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
