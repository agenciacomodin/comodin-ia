
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Users, Plus, Search, Phone, Mail, MessageSquare, Filter, Download, Upload, MoreHorizontal, Edit, Trash2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Contact {
  id: string
  name: string
  phone: string
  email: string
  status: 'active' | 'inactive' | 'pending' | 'vip'
  type: 'client' | 'lead' | 'prospect'
  channel: 'whatsapp' | 'email' | 'phone' | 'web'
  lastActivity: string
}

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    phone: '+54 9 11 1234-5678',
    email: 'juan.perez@email.com',
    status: 'active',
    type: 'client',
    channel: 'whatsapp',
    lastActivity: '5m'
  },
  {
    id: '2',
    name: 'María García',
    phone: '+54 9 11 9876-5432',
    email: 'maria.garcia@email.com',
    status: 'pending',
    type: 'lead',
    channel: 'whatsapp',
    lastActivity: '15m'
  },
  {
    id: '3',
    name: 'Carlos Rodríguez',
    phone: '+54 9 11 5555-6666',
    email: 'carlos.rodriguez@empresa.com',
    status: 'inactive',
    type: 'prospect',
    channel: 'email',
    lastActivity: '1h'
  },
  {
    id: '4',
    name: 'Ana Silva',
    phone: '+54 9 11 7777-8888',
    email: 'ana.silva@tienda.com',
    status: 'vip',
    type: 'client',
    channel: 'whatsapp',
    lastActivity: '2h'
  }
]

export function ContactsManager() {
  const [contacts] = useState<Contact[]>(mockContacts)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    type: 'lead' as Contact['type'],
    channel: 'whatsapp' as Contact['channel']
  })

  const { toast } = useToast()

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.phone.includes(searchTerm) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || contact.status === filterStatus
    const matchesType = filterType === 'all' || contact.type === filterType
    
    return matchesSearch && matchesStatus && matchesType
  })

  const handleAddContact = () => {
    // Simular agregar contacto
    toast({
      title: "Contacto agregado",
      description: `${newContact.name} ha sido agregado a tu lista de contactos.`,
    })
    setIsAddDialogOpen(false)
    setNewContact({
      name: '',
      phone: '',
      email: '',
      type: 'lead',
      channel: 'whatsapp'
    })
  }

  const handleExport = () => {
    // Simular exportación
    const csvContent = [
      ['Nombre', 'Teléfono', 'Email', 'Tipo', 'Estado', 'Canal'],
      ...filteredContacts.map(contact => [
        contact.name,
        contact.phone,
        contact.email,
        contact.type,
        contact.status,
        contact.channel
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contactos.csv'
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Exportación completada",
      description: `Se han exportado ${filteredContacts.length} contactos.`,
    })
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      toast({
        title: "Importación iniciada",
        description: `Procesando archivo: ${file.name}`,
      })
      setIsImportDialogOpen(false)
    }
  }

  const getStatusBadgeVariant = (status: Contact['status']) => {
    switch (status) {
      case 'active': return 'default'
      case 'vip': return 'secondary'
      case 'pending': return 'outline'
      case 'inactive': return 'secondary'
      default: return 'outline'
    }
  }

  const getStatusColor = (status: Contact['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'vip': return 'bg-blue-500'
      case 'pending': return 'bg-orange-500'
      case 'inactive': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const getStatusLabel = (status: Contact['status']) => {
    switch (status) {
      case 'active': return 'Activo'
      case 'vip': return 'VIP'
      case 'pending': return 'Pendiente'
      case 'inactive': return 'Inactivo'
      default: return 'Desconocido'
    }
  }

  const getTypeLabel = (type: Contact['type']) => {
    switch (type) {
      case 'client': return 'Cliente'
      case 'lead': return 'Lead'
      case 'prospect': return 'Prospecto'
      default: return 'Desconocido'
    }
  }

  const getChannelLabel = (channel: Contact['channel']) => {
    switch (channel) {
      case 'whatsapp': return 'WhatsApp'
      case 'email': return 'Email'
      case 'phone': return 'Teléfono'
      case 'web': return 'Web Chat'
      default: return 'Desconocido'
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contactos</h1>
          <p className="text-gray-600 mt-1">Gestiona tu base de clientes y leads</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importar Contactos</DialogTitle>
                <DialogDescription>
                  Sube un archivo CSV con tus contactos. El archivo debe incluir las columnas: Nombre, Teléfono, Email.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file">Seleccionar archivo CSV</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".csv"
                    onChange={handleImport}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Contacto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Contacto</DialogTitle>
                <DialogDescription>
                  Completa la información del nuevo contacto.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input
                    id="name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                    placeholder="+54 9 11 1234-5678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de contacto</Label>
                  <Select value={newContact.type} onValueChange={(value: Contact['type']) => setNewContact({...newContact, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="prospect">Prospecto</SelectItem>
                      <SelectItem value="client">Cliente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="channel">Canal preferido</Label>
                  <Select value={newContact.channel} onValueChange={(value: Contact['channel']) => setNewContact({...newContact, channel: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Teléfono</SelectItem>
                      <SelectItem value="web">Web Chat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddContact}>Agregar Contacto</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contactos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contacts.length}</div>
            <p className="text-xs text-muted-foreground">
              +12% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevos Esta Semana</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +23% vs semana anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos WhatsApp</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contacts.filter(c => c.channel === 'whatsapp' && c.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((contacts.filter(c => c.channel === 'whatsapp').length / contacts.length) * 100)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa Conversión</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18.7%</div>
            <p className="text-xs text-muted-foreground">
              Lead-to-customer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar contactos..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="client">Clientes</SelectItem>
            <SelectItem value="lead">Leads</SelectItem>
            <SelectItem value="prospect">Prospectos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de contactos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Lista de Contactos ({filteredContacts.length})</CardTitle>
            <CardDescription>
              Todos tus contactos organizados y actualizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{contact.name}</h3>
                      <p className="text-sm text-gray-600">{contact.phone}</p>
                      <p className="text-xs text-gray-500">{contact.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusBadgeVariant(contact.status)}>
                      {getTypeLabel(contact.type)}
                    </Badge>
                    <Badge variant="outline">
                      {getChannelLabel(contact.channel)}
                    </Badge>
                    <div 
                      className={`w-3 h-3 rounded-full ${getStatusColor(contact.status)}`} 
                      title={getStatusLabel(contact.status)}
                    ></div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
              
              {filteredContacts.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No se encontraron contactos</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Segmentación</CardTitle>
              <CardDescription>
                Distribución de contactos por tipo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Clientes Activos</span>
                  <Badge variant="secondary">
                    {contacts.filter(c => c.type === 'client' && c.status === 'active').length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Leads Calificados</span>
                  <Badge variant="secondary">
                    {contacts.filter(c => c.type === 'lead').length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Prospectos</span>
                  <Badge variant="secondary">
                    {contacts.filter(c => c.type === 'prospect').length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Clientes VIP</span>
                  <Badge variant="secondary">
                    {contacts.filter(c => c.status === 'vip').length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>
                Últimas interacciones con contactos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contacts.slice(0, 3).map((contact) => (
                  <div key={contact.id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{contact.name}</p>
                      <p className="text-xs text-gray-500">Última actividad</p>
                    </div>
                    <span className="text-xs text-gray-500">{contact.lastActivity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
