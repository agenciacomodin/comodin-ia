

'use client'

import { useState } from 'react'
import { Phone, Mail, Building, MapPin, Tag, Plus, Edit2, Star, Clock, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ContactDetail } from '@/lib/types'

interface ContactDetailsPanelProps {
  contact: ContactDetail | null
  onAddNote: (content: string, isImportant?: boolean) => void
  onAddTag: (name: string, color?: string) => void
  onRemoveTag: (tagId: string) => void
  onUpdateContact: (updates: Partial<ContactDetail>) => void
}

export function ContactDetailsPanel({
  contact,
  onAddNote,
  onAddTag,
  onRemoveTag,
  onUpdateContact
}: ContactDetailsPanelProps) {
  const [newNote, setNewNote] = useState('')
  const [newTag, setNewTag] = useState('')
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [isAddingTag, setIsAddingTag] = useState(false)
  
  // Estados para paneles desplegables
  const [isInfoExpanded, setIsInfoExpanded] = useState(true)
  const [isTagsExpanded, setIsTagsExpanded] = useState(true)
  const [isStatsExpanded, setIsStatsExpanded] = useState(true)
  const [isNotesExpanded, setIsNotesExpanded] = useState(true)

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(newNote.trim())
      setNewNote('')
      setIsAddingNote(false)
    }
  }

  const handleAddTag = () => {
    if (newTag.trim()) {
      const colors = ['blue', 'green', 'yellow', 'red', 'purple', 'pink']
      const randomColor = colors[Math.floor(Math.random() * colors.length)]
      onAddTag(newTag.trim(), randomColor)
      setNewTag('')
      setIsAddingTag(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!contact) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <Phone className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500">
            Selecciona una conversación para ver los detalles del contacto
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full overflow-y-auto">
      {/* Header del contacto */}
      <div className="p-6 border-b border-gray-200">
        <div className="text-center">
          <div className="relative inline-block mb-3">
            <Avatar className="h-20 w-20">
              <AvatarImage src={contact.avatar} />
              <AvatarFallback className="text-xl bg-gray-100 text-gray-600">
                {getInitials(contact.name)}
              </AvatarFallback>
            </Avatar>
            {contact.isVip && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <Star className="w-3 h-3 text-white fill-current" />
              </div>
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {contact.name}
          </h3>
          
          <div className="flex items-center justify-center text-sm text-gray-500 mb-2">
            <Phone className="w-4 h-4 mr-1" />
            {contact.phone}
          </div>

          {contact.email && (
            <div className="flex items-center justify-center text-sm text-gray-500 mb-3">
              <Mail className="w-4 h-4 mr-1" />
              {contact.email}
            </div>
          )}

          <Badge 
            variant={contact.status === 'ACTIVE' ? 'default' : 'secondary'}
            className="mb-4"
          >
            {contact.status === 'ACTIVE' ? 'Activo' : contact.status}
          </Badge>
        </div>
      </div>

      {/* Información adicional */}
      <div className="p-4 space-y-4">
        {/* Información de contacto */}
        <Card>
          <CardHeader className="pb-3 cursor-pointer" onClick={() => setIsInfoExpanded(!isInfoExpanded)}>
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center">
                <Building className="w-4 h-4 mr-2" />
                Información
              </div>
              {isInfoExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </CardTitle>
          </CardHeader>
          {isInfoExpanded && (
            <CardContent className="pt-0 space-y-2">
            {contact.company && (
              <div>
                <p className="text-xs text-gray-500">Empresa</p>
                <p className="text-sm">{contact.company}</p>
              </div>
            )}
            
            {contact.jobTitle && (
              <div>
                <p className="text-xs text-gray-500">Cargo</p>
                <p className="text-sm">{contact.jobTitle}</p>
              </div>
            )}
            
            {(contact.city || contact.country) && (
              <div>
                <p className="text-xs text-gray-500">Ubicación</p>
                <div className="flex items-center text-sm">
                  <MapPin className="w-3 h-3 mr-1" />
                  {[contact.city, contact.country].filter(Boolean).join(', ')}
                </div>
              </div>
            )}
            
            {contact.source && (
              <div>
                <p className="text-xs text-gray-500">Origen</p>
                <p className="text-sm">{contact.source}</p>
              </div>
            )}
            </CardContent>
          )}
        </Card>

        {/* Etiquetas */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsTagsExpanded(!isTagsExpanded)}>
              <CardTitle className="text-sm flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                Etiquetas
                {isTagsExpanded ? (
                  <ChevronDown className="w-4 h-4 ml-auto text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 ml-auto text-gray-500" />
                )}
              </CardTitle>
              {isTagsExpanded && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsAddingTag(true)
                  }}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              )}
            </div>
          </CardHeader>
          {isTagsExpanded && (
            <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2 mb-3">
              {contact.tags.map((tag) => (
                <Badge 
                  key={tag.id} 
                  variant="outline"
                  className={cn(
                    "text-xs cursor-pointer hover:bg-red-50 hover:border-red-200",
                    tag.color === 'blue' && "border-blue-200 text-blue-700 bg-blue-50",
                    tag.color === 'green' && "border-green-200 text-green-700 bg-green-50",
                    tag.color === 'yellow' && "border-yellow-200 text-yellow-700 bg-yellow-50",
                    tag.color === 'red' && "border-red-200 text-red-700 bg-red-50",
                    tag.color === 'purple' && "border-purple-200 text-purple-700 bg-purple-50",
                    tag.color === 'pink' && "border-pink-200 text-pink-700 bg-pink-50"
                  )}
                  onClick={() => onRemoveTag(tag.id)}
                >
                  {tag.name} ×
                </Badge>
              ))}
            </div>
            
            {isAddingTag && (
              <div className="flex space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Nueva etiqueta"
                  className="text-xs"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button size="sm" onClick={handleAddTag}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            )}
            </CardContent>
          )}
        </Card>

        {/* Estadísticas */}
        <Card>
          <CardHeader className="pb-3 cursor-pointer" onClick={() => setIsStatsExpanded(!isStatsExpanded)}>
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Actividad
              </div>
              {isStatsExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </CardTitle>
          </CardHeader>
          {isStatsExpanded && (
            <CardContent className="pt-0 space-y-3">
            {contact.firstContact && (
              <div>
                <p className="text-xs text-gray-500">Primer contacto</p>
                <p className="text-sm">{formatDateTime(contact.firstContact)}</p>
              </div>
            )}
            
            {contact.lastContact && (
              <div>
                <p className="text-xs text-gray-500">Último contacto</p>
                <p className="text-sm">{formatDateTime(contact.lastContact)}</p>
              </div>
            )}
            
            <div>
              <p className="text-xs text-gray-500">Mensajes no leídos</p>
              <p className="text-sm font-medium text-blue-600">
                {contact.unreadCount}
              </p>
            </div>

            {contact.leadScore !== undefined && (
              <div>
                <p className="text-xs text-gray-500">Puntaje de lead</p>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${contact.leadScore}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{contact.leadScore}/100</span>
                </div>
              </div>
            )}
            </CardContent>
          )}
        </Card>

        {/* Notas internas */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsNotesExpanded(!isNotesExpanded)}>
              <div>
                <CardTitle className="text-sm flex items-center">
                  Notas Internas
                  {isNotesExpanded ? (
                    <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 ml-2 text-gray-500" />
                  )}
                </CardTitle>
                <CardDescription className="text-xs">
                  Solo visibles para tu equipo
                </CardDescription>
              </div>
              {isNotesExpanded && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsAddingNote(true)
                  }}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              )}
            </div>
          </CardHeader>
          {isNotesExpanded && (
            <CardContent className="pt-0">
            {/* Agregar nueva nota */}
            {isAddingNote && (
              <div className="mb-4 p-3 border rounded-lg bg-gray-50">
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Escribe una nota interna..."
                  className="text-sm mb-2"
                  rows={3}
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setIsAddingNote(false)
                      setNewNote('')
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleAddNote}>
                    Guardar
                  </Button>
                </div>
              </div>
            )}

            {/* Lista de notas */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {contact.notes.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">
                  No hay notas internas
                </p>
              ) : (
                contact.notes.map((note) => (
                  <div key={note.id} className="p-3 border rounded-lg bg-gray-50">
                    <p className="text-sm mb-2">{note.content}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{note.createdByName}</span>
                      <span>{formatDateTime(note.createdAt)}</span>
                    </div>
                    {note.isImportant && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        Importante
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
