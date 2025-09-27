
'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, X, FileText, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { 
  KNOWLEDGE_FILE_TYPES,
  MAX_KNOWLEDGE_FILE_SIZE,
  KnowledgeSourceSummary
} from '@/lib/types'

interface KnowledgeUploaderProps {
  onUploadSuccess?: (source: KnowledgeSourceSummary) => void
  onCancel?: () => void
}

interface FileWithPreview extends File {
  preview?: string
}

export function KnowledgeUploader({ onUploadSuccess, onCancel }: KnowledgeUploaderProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    tags: '',
    chunkSize: 1000,
    chunkOverlap: 100
  })

  // Tipos de archivos permitidos
  const allowedTypes = [
    ...KNOWLEDGE_FILE_TYPES.pdf,
    ...KNOWLEDGE_FILE_TYPES.document,
    ...KNOWLEDGE_FILE_TYPES.text,
    ...KNOWLEDGE_FILE_TYPES.web
  ]

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type as any)) {
      return `Tipo de archivo no soportado: ${file.type}`
    }

    if (file.size > MAX_KNOWLEDGE_FILE_SIZE) {
      return `Archivo demasiado grande. Máximo ${MAX_KNOWLEDGE_FILE_SIZE / 1024 / 1024}MB`
    }

    return null
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [])

  const handleFiles = (files: File[]) => {
    const validFiles: FileWithPreview[] = []
    const errors: string[] = []

    files.forEach(file => {
      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
      } else {
        validFiles.push(file as FileWithPreview)
      }
    })

    if (errors.length > 0) {
      toast({
        title: 'Algunos archivos no se pudieron agregar',
        description: errors.join(', '),
        variant: 'destructive'
      })
    }

    setSelectedFiles(prev => [...prev, ...validFiles])
    
    // Generar nombre automático si está vacío
    if (validFiles.length > 0 && !formData.name) {
      setFormData(prev => ({
        ...prev,
        name: validFiles[0].name.replace(/\.[^/.]+$/, '') // Remover extensión
      }))
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleUpload = async () => {
    if (!selectedFiles.length || !formData.name) {
      toast({
        title: 'Error',
        description: 'Selecciona al menos un archivo y proporciona un nombre',
        variant: 'destructive'
      })
      return
    }

    try {
      setUploading(true)
      setUploadProgress(0)

      // Por ahora solo subimos el primer archivo
      // En el futuro se podría implementar subida múltiple
      const file = selectedFiles[0]
      
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('name', formData.name)
      uploadFormData.append('tags', JSON.stringify(formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)))
      uploadFormData.append('chunkSize', formData.chunkSize.toString())
      uploadFormData.append('chunkOverlap', formData.chunkOverlap.toString())

      // Simular progreso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 20
        })
      }, 500)

      const response = await fetch('/api/knowledge/upload', {
        method: 'POST',
        body: uploadFormData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Éxito',
          description: 'Archivo subido correctamente. El procesamiento comenzará en breve.',
        })
        
        if (onUploadSuccess) {
          onUploadSuccess(result.data.source)
        }

        // Resetear formulario
        setSelectedFiles([])
        setFormData({ name: '', tags: '', chunkSize: 1000, chunkOverlap: 100 })
        setUploadProgress(0)
      } else {
        throw new Error(result.error || 'Error subiendo archivo')
      }

    } catch (error) {
      console.error('Error uploading file:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error subiendo archivo',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Área de drag & drop */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-8">
          <div className="text-center">
            <Upload className={`mx-auto h-12 w-12 ${
              dragActive ? 'text-blue-500' : 'text-gray-400'
            }`} />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Sube tus documentos
            </h3>
            <p className="mt-2 text-gray-600">
              Arrastra y suelta archivos aquí, o haz clic para seleccionar
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              Seleccionar archivos
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={allowedTypes.join(',')}
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {/* Tipos de archivos soportados */}
          <div className="mt-6">
            <p className="text-sm text-gray-500 text-center">
              Archivos soportados: PDF, DOC, DOCX, TXT, MD, CSV, HTML
            </p>
            <p className="text-xs text-gray-400 text-center mt-1">
              Tamaño máximo: {MAX_KNOWLEDGE_FILE_SIZE / 1024 / 1024}MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Archivos seleccionados */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Archivos seleccionados:</h4>
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="font-medium text-sm">{file.name}</div>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(file.size)} • {file.type}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Formulario de configuración */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="source-name">Nombre de la fuente *</Label>
          <Input
            id="source-name"
            placeholder="Mi documento de conocimiento"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            disabled={uploading}
          />
        </div>

        <div>
          <Label htmlFor="source-tags">Etiquetas (opcional)</Label>
          <Input
            id="source-tags"
            placeholder="manual, guía, procedimientos"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            disabled={uploading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Separa las etiquetas con comas
          </p>
        </div>

        {/* Configuración avanzada */}
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
            Configuración avanzada
          </summary>
          <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-100">
            <div>
              <Label htmlFor="chunk-size">Tamaño de fragmento</Label>
              <Input
                id="chunk-size"
                type="number"
                min={100}
                max={5000}
                value={formData.chunkSize}
                onChange={(e) => setFormData(prev => ({ ...prev, chunkSize: parseInt(e.target.value) || 1000 }))}
                disabled={uploading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Número de caracteres por fragmento (100-5000)
              </p>
            </div>
            
            <div>
              <Label htmlFor="chunk-overlap">Superposición</Label>
              <Input
                id="chunk-overlap"
                type="number"
                min={0}
                max={500}
                value={formData.chunkOverlap}
                onChange={(e) => setFormData(prev => ({ ...prev, chunkOverlap: parseInt(e.target.value) || 100 }))}
                disabled={uploading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Caracteres de superposición entre fragmentos (0-500)
              </p>
            </div>
          </div>
        </details>
      </div>

      {/* Progreso de subida */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subiendo archivo...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={uploading}
          >
            Cancelar
          </Button>
        )}
        <Button
          onClick={handleUpload}
          disabled={!selectedFiles.length || !formData.name || uploading}
        >
          {uploading ? 'Subiendo...' : 'Subir y Procesar'}
        </Button>
      </div>

      {/* Aviso sobre procesamiento */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Una vez subido, el archivo será procesado automáticamente. 
          Esto puede tomar unos minutos dependiendo del tamaño del documento.
        </AlertDescription>
      </Alert>
    </div>
  )
}
