

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { 
  Settings, 
  Trash2, 
  Edit, 
  MoreVertical, 
  Smartphone, 
  CheckCircle,
  Clock,
  WifiOff,
  AlertTriangle,
  Star,
  BarChart3
} from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  WhatsAppChannelSummary,
  WHATSAPP_CONNECTION_STATUS_LABELS,
  WHATSAPP_CONNECTION_STATUS_COLORS,
  WHATSAPP_CONNECTION_TYPE_LABELS
} from '@/lib/types'
import { toast } from 'react-hot-toast'

interface ChannelListComponentProps {
  channels: WhatsAppChannelSummary[]
  selectedChannel: WhatsAppChannelSummary | null
  onChannelSelect: (channel: WhatsAppChannelSummary | null) => void
  onChannelUpdate: (channelId: string, updates: Partial<WhatsAppChannelSummary>) => void
  onChannelDelete: (channelId: string) => void
}

export function ChannelListComponent({
  channels,
  selectedChannel,
  onChannelSelect,
  onChannelUpdate,
  onChannelDelete
}: ChannelListComponentProps) {
  const [editingChannel, setEditingChannel] = useState<WhatsAppChannelSummary | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    welcomeMessage: '',
    autoReplyMessage: '',
    isActive: true,
    isDefault: false
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'CONNECTING':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'DISCONNECTED':
        return <WifiOff className="h-4 w-4 text-gray-400" />
      case 'ERROR':
      case 'EXPIRED':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <WifiOff className="h-4 w-4 text-gray-400" />
    }
  }

  const openEditDialog = (channel: WhatsAppChannelSummary) => {
    setEditingChannel(channel)
    setEditForm({
      name: channel.name,
      phone: channel.phone,
      welcomeMessage: '', // Estos datos vendrían del backend
      autoReplyMessage: '',
      isActive: channel.isActive,
      isDefault: channel.isDefault
    })
  }

  const handleSaveChanges = () => {
    if (!editingChannel) return

    onChannelUpdate(editingChannel.id, {
      name: editForm.name,
      phone: editForm.phone,
      isActive: editForm.isActive,
      isDefault: editForm.isDefault
    })

    // Si se marca como predeterminado, desmarcar otros
    if (editForm.isDefault) {
      channels.forEach(channel => {
        if (channel.id !== editingChannel.id && channel.isDefault) {
          onChannelUpdate(channel.id, { isDefault: false })
        }
      })
    }

    toast.success('Canal actualizado exitosamente')
    setEditingChannel(null)
  }

  const handleDelete = (channel: WhatsAppChannelSummary) => {
    onChannelDelete(channel.id)
    toast.success('Canal eliminado exitosamente')
  }

  const handleToggleStatus = (channel: WhatsAppChannelSummary) => {
    const newStatus = channel.isActive ? false : true
    onChannelUpdate(channel.id, { isActive: newStatus })
    toast.success(`Canal ${newStatus ? 'activado' : 'desactivado'}`)
  }

  const formatLastActivity = (date?: Date) => {
    if (!date) return 'Nunca'
    
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'Ahora'
    if (minutes < 60) return `Hace ${minutes} min`
    if (hours < 24) return `Hace ${hours}h`
    return `Hace ${days} días`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Canales</CardTitle>
          <CardDescription>
            Administra todos tus canales de WhatsApp conectados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {channels.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay canales configurados
              </h3>
              <p className="text-gray-500 mb-4">
                Crea tu primer canal para comenzar a usar WhatsApp
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className={`p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${
                    selectedChannel?.id === channel.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => onChannelSelect(channel)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(channel.status)}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {channel.name}
                          </h3>
                          
                          {channel.isDefault && (
                            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 mr-1" />
                              Predeterminado
                            </Badge>
                          )}
                          
                          {!channel.isActive && (
                            <Badge variant="outline" className="text-xs text-gray-500">
                              Inactivo
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{channel.phone}</span>
                          <span>•</span>
                          <span>{WHATSAPP_CONNECTION_TYPE_LABELS[channel.connectionType]}</span>
                          <span>•</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              WHATSAPP_CONNECTION_STATUS_COLORS[channel.status] === 'green' ? 'border-green-200 text-green-700' : 
                              WHATSAPP_CONNECTION_STATUS_COLORS[channel.status] === 'yellow' ? 'border-yellow-200 text-yellow-700' :
                              WHATSAPP_CONNECTION_STATUS_COLORS[channel.status] === 'red' ? 'border-red-200 text-red-700' :
                              WHATSAPP_CONNECTION_STATUS_COLORS[channel.status] === 'orange' ? 'border-orange-200 text-orange-700' :
                              'border-gray-200 text-gray-700'
                            }`}
                          >
                            {WHATSAPP_CONNECTION_STATUS_LABELS[channel.status]}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Estadísticas rápidas */}
                      <div className="hidden md:flex items-center space-x-4 text-sm">
                        <div className="text-center">
                          <p className="font-medium text-gray-900">
                            {(channel.messagesReceived + channel.messagesSent).toLocaleString()}
                          </p>
                          <p className="text-gray-500">Mensajes</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-gray-900">
                            {formatLastActivity(channel.lastActivity)}
                          </p>
                          <p className="text-gray-500">Actividad</p>
                        </div>
                      </div>

                      {/* Menú de acciones */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            openEditDialog(channel)
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            handleToggleStatus(channel)
                          }}>
                            <Settings className="h-4 w-4 mr-2" />
                            {channel.isActive ? 'Desactivar' : 'Activar'}
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente el canal "{channel.name}" 
                                  y se perderá toda la configuración asociada.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleDelete(channel)}
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detalles del canal seleccionado */}
      {selectedChannel && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Detalles de {selectedChannel.name}</span>
            </CardTitle>
            <CardDescription>
              Estadísticas y configuración detallada del canal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Información General</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        WHATSAPP_CONNECTION_STATUS_COLORS[selectedChannel.status] === 'green' ? 'border-green-200 text-green-700' : 
                        WHATSAPP_CONNECTION_STATUS_COLORS[selectedChannel.status] === 'yellow' ? 'border-yellow-200 text-yellow-700' :
                        WHATSAPP_CONNECTION_STATUS_COLORS[selectedChannel.status] === 'red' ? 'border-red-200 text-red-700' :
                        WHATSAPP_CONNECTION_STATUS_COLORS[selectedChannel.status] === 'orange' ? 'border-orange-200 text-orange-700' :
                        'border-gray-200 text-gray-700'
                      }`}
                    >
                      {WHATSAPP_CONNECTION_STATUS_LABELS[selectedChannel.status]}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo:</span>
                    <span className="font-medium">{WHATSAPP_CONNECTION_TYPE_LABELS[selectedChannel.connectionType]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Conectado:</span>
                    <span className="font-medium">
                      {selectedChannel.connectedAt ? 
                        selectedChannel.connectedAt.toLocaleDateString('es-ES') : 
                        'No conectado'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Última actividad:</span>
                    <span className="font-medium">{formatLastActivity(selectedChannel.lastActivity)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Estadísticas</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recibidos:</span>
                    <span className="font-medium text-blue-600">
                      {selectedChannel.messagesReceived.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Enviados:</span>
                    <span className="font-medium text-green-600">
                      {selectedChannel.messagesSent.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">
                      {(selectedChannel.messagesReceived + selectedChannel.messagesSent).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Acciones</h4>
                <div className="space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => openEditDialog(selectedChannel)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Configuración
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleToggleStatus(selectedChannel)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {selectedChannel.isActive ? 'Desactivar Canal' : 'Activar Canal'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog de edición */}
      <Dialog open={!!editingChannel} onOpenChange={() => setEditingChannel(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Canal</DialogTitle>
            <DialogDescription>
              Modifica la configuración del canal de WhatsApp
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre del Canal</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone">Número de Teléfono</Label>
              <Input
                id="edit-phone"
                value={editForm.phone}
                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-welcome">Mensaje de Bienvenida</Label>
              <Textarea
                id="edit-welcome"
                value={editForm.welcomeMessage}
                onChange={(e) => setEditForm(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                rows={3}
                placeholder="Mensaje automático para nuevos contactos"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-auto-reply">Respuesta Automática</Label>
              <Textarea
                id="edit-auto-reply"
                value={editForm.autoReplyMessage}
                onChange={(e) => setEditForm(prev => ({ ...prev, autoReplyMessage: e.target.value }))}
                rows={3}
                placeholder="Mensaje fuera del horario de atención"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Canal Activo</Label>
                <p className="text-sm text-gray-600">
                  Activar o desactivar este canal
                </p>
              </div>
              <Switch
                checked={editForm.isActive}
                onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isActive: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Canal Predeterminado</Label>
                <p className="text-sm text-gray-600">
                  Usar como canal principal para nuevas conversaciones
                </p>
              </div>
              <Switch
                checked={editForm.isDefault}
                onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isDefault: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingChannel(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveChanges}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
