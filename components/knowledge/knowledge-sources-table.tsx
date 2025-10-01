
'use client'

import { useState } from 'react'
import { 
  FileText, 
  Globe, 
  Type, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle,
  Eye,
  Trash2,
  RefreshCw,
  MoreHorizontal,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  KnowledgeSourceSummary, 
  KnowledgeSourceType, 
  KnowledgeSourceStatus,
  KNOWLEDGE_SOURCE_TYPE_LABELS,
  KNOWLEDGE_SOURCE_STATUS_LABELS,
  KNOWLEDGE_SOURCE_STATUS_COLORS
} from '@/lib/types'

interface KnowledgeSourcesTableProps {
  sources: KnowledgeSourceSummary[]
  loading?: boolean
  onDelete?: (sourceId: string) => void
  onReprocess?: (sourceId: string) => void
  onView?: (source: KnowledgeSourceSummary) => void
  onRefresh?: () => void
}

export function KnowledgeSourcesTable({ 
  sources, 
  loading = false, 
  onDelete,
  onReprocess,
  onView,
  onRefresh
}: KnowledgeSourcesTableProps) {
  
  const getTypeIcon = (type: KnowledgeSourceType) => {
    switch (type) {
      case KnowledgeSourceType.FILE:
        return <FileText className="h-4 w-4" />
      case KnowledgeSourceType.URL:
        return <Globe className="h-4 w-4" />
      case KnowledgeSourceType.TEXT:
        return <Type className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: KnowledgeSourceStatus) => {
    switch (status) {
      case KnowledgeSourceStatus.ACTIVE:
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case KnowledgeSourceStatus.PROCESSING:
      case KnowledgeSourceStatus.CHUNKING:
      case KnowledgeSourceStatus.EMBEDDING:
        return <Clock className="h-4 w-4 text-yellow-500" />
      case KnowledgeSourceStatus.ERROR:
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case KnowledgeSourceStatus.DISABLED:
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadgeVariant = (status: KnowledgeSourceStatus) => {
    switch (status) {
      case KnowledgeSourceStatus.ACTIVE:
        return 'default'
      case KnowledgeSourceStatus.ERROR:
        return 'destructive'
      case KnowledgeSourceStatus.PROCESSING:
      case KnowledgeSourceStatus.CHUNKING:
      case KnowledgeSourceStatus.EMBEDDING:
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!sources.length) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No hay fuentes de conocimiento</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comienza agregando documentos, URLs o contenido de texto.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Botón de refresh */}
      {onRefresh && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      )}

      {/* Tabla */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Tipo</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-center">Fragmentos</TableHead>
              <TableHead className="text-center">Calidad</TableHead>
              <TableHead className="text-center">Uso</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sources.map((source) => (
              <TableRow key={source.id}>
                {/* Tipo */}
                <TableCell>
                  <div className="flex items-center justify-center">
                    {getTypeIcon(source.type)}
                  </div>
                </TableCell>

                {/* Nombre y detalles */}
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium text-sm">{source.name}</div>
                    <div className="text-xs text-gray-500">
                      {source.type === KnowledgeSourceType.FILE && source.originalFileName && (
                        <span>{source.originalFileName} • {formatFileSize(source.fileSize)}</span>
                      )}
                      {source.type === KnowledgeSourceType.URL && source.sourceUrl && (
                        <span className="truncate max-w-[200px] inline-block">{source.sourceUrl}</span>
                      )}
                      {source.type === KnowledgeSourceType.TEXT && (
                        <span>Contenido de texto manual</span>
                      )}
                    </div>
                    {/* Tags */}
                    {source.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {source.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                            {tag}
                          </Badge>
                        ))}
                        {source.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            +{source.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Estado */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(source.status)}
                    <Badge variant={getStatusBadgeVariant(source.status)} className="text-xs">
                      {KNOWLEDGE_SOURCE_STATUS_LABELS[source.status]}
                    </Badge>
                  </div>
                  {/* Error message */}
                  {source.status === KnowledgeSourceStatus.ERROR && source.lastError && (
                    <div className="text-xs text-red-500 mt-1 truncate max-w-[150px]" title={source.lastError}>
                      {source.lastError}
                    </div>
                  )}
                  {/* Progress para estados de procesamiento */}
                  {(source.status === KnowledgeSourceStatus.PROCESSING ||
                    source.status === KnowledgeSourceStatus.CHUNKING ||
                    source.status === KnowledgeSourceStatus.EMBEDDING) && (
                    <div className="mt-1">
                      <Progress value={source.processingProgress} className="h-1 w-20" />
                      <div className="text-xs text-gray-500 mt-1">{source.processingProgress}%</div>
                    </div>
                  )}
                </TableCell>

                {/* Fragmentos */}
                <TableCell className="text-center">
                  <div className="text-sm">
                    <div className="font-medium">{source.processedChunks}</div>
                    <div className="text-xs text-gray-500">de {source.totalChunks}</div>
                    {source.failedChunks > 0 && (
                      <div className="text-xs text-red-500">{source.failedChunks} fallaron</div>
                    )}
                  </div>
                </TableCell>

                {/* Calidad */}
                <TableCell className="text-center">
                  {source.contentQuality ? (
                    <div className="text-sm">
                      <div className="font-medium">{Math.round(source.contentQuality * 100)}%</div>
                      <div className={`w-12 h-1 mx-auto rounded-full ${
                        source.contentQuality > 0.8 ? 'bg-green-500' :
                        source.contentQuality > 0.6 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </TableCell>

                {/* Uso */}
                <TableCell className="text-center">
                  <div className="text-sm">
                    <div className="font-medium">{source.usageCount}</div>
                    {source.lastUsedAt && (
                      <div className="text-xs text-gray-500">
                        {formatDate(source.lastUsedAt)}
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Fecha */}
                <TableCell>
                  <div className="text-sm">
                    <div>{formatDate(source.createdAt)}</div>
                    <div className="text-xs text-gray-500">por {source.createdByName}</div>
                  </div>
                </TableCell>

                {/* Acciones */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(source)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                      )}
                      {onReprocess && source.status !== KnowledgeSourceStatus.PROCESSING && (
                        <DropdownMenuItem onClick={() => onReprocess(source.id)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Reprocesar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {onDelete && (
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => onDelete(source.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
