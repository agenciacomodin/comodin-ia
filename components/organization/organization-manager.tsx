
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Building, 
  Users, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Shield, 
  Calendar,
  MoreHorizontal,
  Loader2,
  UserPlus,
  MapPin,
  Phone,
  Globe
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface OrganizationManagerProps {
  organization: any
  user: any
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'pending' | 'suspended'
  joinedAt: string
  avatar?: string
}

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Ana Martínez',
    email: 'ana.martinez@empresa.com',
    role: 'SUPER_ADMIN',
    status: 'active',
    joinedAt: '2024-01-15',
    avatar: ''
  },
  {
    id: '2',
    name: 'Luis García',
    email: 'luis.garcia@empresa.com',
    role: 'AGENTE',
    status: 'active',
    joinedAt: '2024-02-01',
    avatar: ''
  },
  {
    id: '3',
    name: 'Carmen López',
    email: 'carmen.lopez@empresa.com',
    role: 'AGENTE',
    status: 'pending',
    joinedAt: '2024-03-10',
    avatar: ''
  }
]

export function OrganizationManager({ organization, user }: OrganizationManagerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [teamMembers] = useState<TeamMember[]>(mockTeamMembers)

  const [organizationData, setOrganizationData] = useState({
    name: organization.name || '',
    description: organization.description || '',
    website: '',
    phone: '',
    address: '',
    city: '',
    country: 'Argentina'
  })

  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'AGENTE',
    message: ''
  })

  const { toast } = useToast()

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'PROPIETARIO': return 'Propietario'
      case 'SUPER_ADMIN': return 'Super Admin'
      case 'DISTRIBUIDOR': return 'Distribuidor'
      case 'AGENTE': return 'Agente'
      default: return 'Usuario'
    }
  }

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'pending': return 'bg-yellow-500'
      case 'suspended': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  const getStatusLabel = (status: TeamMember['status']) => {
    switch (status) {
      case 'active': return 'Activo'
      case 'pending': return 'Pendiente'
      case 'suspended': return 'Suspendido'
      default: return 'Desconocido'
    }
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleUpdateOrganization = async () => {
    setIsLoading(true)
    try {
      // Simular actualización
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: "Organización actualizada",
        description: "La información de la organización se ha actualizado correctamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la organización. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteUser = async () => {
    if (!inviteData.email) {
      toast({
        title: "Error",
        description: "El email es requerido.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      // Simular envío de invitación
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Invitación enviada",
        description: `Se ha enviado una invitación a ${inviteData.email}.`,
      })
      
      setInviteData({ email: '', role: 'AGENTE', message: '' })
      setIsInviteDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar la invitación. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveUser = (userId: string, userName: string) => {
    toast({
      title: "Usuario removido",
      description: `${userName} ha sido removido de la organización.`,
    })
  }

  const handleChangeUserRole = (userId: string, newRole: string, userName: string) => {
    toast({
      title: "Rol actualizado",
      description: `El rol de ${userName} ha sido cambiado a ${getRoleLabel(newRole)}.`,
    })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Configuración de Organización</h1>
        <p className="text-gray-600 mt-1">Gestiona la información y miembros de tu organización</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información de la organización */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="w-5 h-5" />
                <span>Información de la Empresa</span>
              </CardTitle>
              <CardDescription>
                Actualiza los datos básicos de tu organización
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="organizationName">Nombre de la organización</Label>
                <Input
                  id="organizationName"
                  value={organizationData.name}
                  onChange={(e) => setOrganizationData({...organizationData, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe tu organización..."
                  value={organizationData.description}
                  onChange={(e) => setOrganizationData({...organizationData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Sitio web</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="website"
                      placeholder="https://tu-empresa.com"
                      className="pl-10"
                      value={organizationData.website}
                      onChange={(e) => setOrganizationData({...organizationData, website: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      placeholder="+54 11 1234-5678"
                      className="pl-10"
                      value={organizationData.phone}
                      onChange={(e) => setOrganizationData({...organizationData, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="address"
                    placeholder="Dirección completa"
                    className="pl-10"
                    value={organizationData.address}
                    onChange={(e) => setOrganizationData({...organizationData, address: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    placeholder="Buenos Aires"
                    value={organizationData.city}
                    onChange={(e) => setOrganizationData({...organizationData, city: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Select value={organizationData.country} onValueChange={(value) => setOrganizationData({...organizationData, country: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Argentina">Argentina</SelectItem>
                      <SelectItem value="Mexico">México</SelectItem>
                      <SelectItem value="Colombia">Colombia</SelectItem>
                      <SelectItem value="Chile">Chile</SelectItem>
                      <SelectItem value="Peru">Perú</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleUpdateOrganization} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Gestión del equipo */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Equipo de Trabajo</span>
                  </CardTitle>
                  <CardDescription>
                    Gestiona los miembros de tu organización
                  </CardDescription>
                </div>
                <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invitar Usuario
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invitar Nuevo Usuario</DialogTitle>
                      <DialogDescription>
                        Envía una invitación para unirse a tu organización
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="inviteEmail">Email del usuario</Label>
                        <Input
                          id="inviteEmail"
                          type="email"
                          placeholder="usuario@empresa.com"
                          value={inviteData.email}
                          onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Rol</Label>
                        <Select value={inviteData.role} onValueChange={(value) => setInviteData({...inviteData, role: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AGENTE">Agente</SelectItem>
                            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                            <SelectItem value="DISTRIBUIDOR">Distribuidor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Mensaje personalizado (opcional)</Label>
                        <Textarea
                          id="message"
                          placeholder="Agrega un mensaje de bienvenida..."
                          value={inviteData.message}
                          onChange={(e) => setInviteData({...inviteData, message: e.target.value})}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleInviteUser} disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          'Enviar Invitación'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={member.avatar || ''} />
                        <AvatarFallback>
                          {getUserInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        <p className="text-xs text-gray-500">
                          Miembro desde {new Date(member.joinedAt).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary">
                        {getRoleLabel(member.role)}
                      </Badge>
                      <div 
                        className={`w-3 h-3 rounded-full ${getStatusColor(member.status)}`} 
                        title={getStatusLabel(member.status)}
                      ></div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleChangeUserRole(member.id, 'SUPER_ADMIN', member.name)}>
                            <Shield className="mr-2 h-4 w-4" />
                            Cambiar rol
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRemoveUser(member.id, member.name)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar con información */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de la Organización</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Building className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">{organization.name}</p>
                  <p className="text-sm text-gray-600">Organización</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">{teamMembers.length} miembros</p>
                  <p className="text-sm text-gray-600">Equipo activo</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Creada en</p>
                  <p className="text-sm text-gray-600">
                    {new Date(organization.createdAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estadísticas del Equipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Usuarios activos</span>
                  <span className="font-medium">
                    {teamMembers.filter(m => m.status === 'active').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Invitaciones pendientes</span>
                  <span className="font-medium">
                    {teamMembers.filter(m => m.status === 'pending').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Super Admins</span>
                  <span className="font-medium">
                    {teamMembers.filter(m => m.role === 'SUPER_ADMIN').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Agentes</span>
                  <span className="font-medium">
                    {teamMembers.filter(m => m.role === 'AGENTE').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuración Avanzada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar Integrations
                </Button>
                <Button variant="outline" className="w-full">
                  <Shield className="w-4 h-4 mr-2" />
                  Configurar Seguridad
                </Button>
                <Button variant="outline" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Configurar Notificaciones
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
