
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Users, Search, Filter, UserPlus, UserMinus, 
  Mail, Phone, Calendar, CreditCard, 
  AlertTriangle, CheckCircle, Clock 
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  status: string
  plan: string
  createdAt: string
  lastActive?: string
  totalRevenue: number
  messagesSent: number
  organization?: {
    name: string
  }
}

interface UserStats {
  totalUsers: number
  activeUsers: number
  newThisMonth: number
  churnedUsers: number
  avgRevenue: number
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionType, setActionType] = useState<'suspend' | 'activate' | 'upgrade' | 'message' | null>(null)

  useEffect(() => {
    fetchUsers()
    fetchStats()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/users/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: string, data?: any) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data })
      })

      if (response.ok) {
        toast.success(`Acción ${action} ejecutada exitosamente`)
        fetchUsers()
        setSelectedUser(null)
        setActionType(null)
      } else {
        toast.error('Error ejecutando la acción')
      }
    } catch (error) {
      toast.error('Error de conexión')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    const matchesPlan = planFilter === 'all' || user.plan === planFilter
    
    return matchesSearch && matchesStatus && matchesPlan
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Activo</Badge>
      case 'SUSPENDED':
        return <Badge variant="destructive"><UserMinus className="w-3 h-3 mr-1" />Suspendido</Badge>
      case 'PENDING':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPlanBadge = (plan: string) => {
    const colors: Record<string, string> = {
      'FREE': 'bg-gray-500',
      'STARTER': 'bg-blue-500',
      'PREMIUM': 'bg-purple-500',
      'ENTERPRISE': 'bg-yellow-500'
    }
    return <Badge className={colors[plan] || 'bg-gray-500'}>{plan}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Gestión de Usuarios</h2>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Crear Usuario
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Usuarios</p>
                  <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Usuarios Activos</p>
                  <p className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nuevos Este Mes</p>
                  <p className="text-2xl font-bold">{stats.newThisMonth.toLocaleString()}</p>
                </div>
                <UserPlus className="h-8 w-8 text-cyan-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Churn Este Mes</p>
                  <p className="text-2xl font-bold">{stats.churnedUsers.toLocaleString()}</p>
                </div>
                <UserMinus className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ARPU</p>
                  <p className="text-2xl font-bold">${stats.avgRevenue.toFixed(0)}</p>
                </div>
                <CreditCard className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">Lista de Usuarios</TabsTrigger>
          <TabsTrigger value="segments">Segmentos</TabsTrigger>
          <TabsTrigger value="bulk">Acciones Masivas</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios Registrados</CardTitle>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar usuarios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="ACTIVE">Activos</SelectItem>
                    <SelectItem value="SUSPENDED">Suspendidos</SelectItem>
                    <SelectItem value="PENDING">Pendientes</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="FREE">Free</SelectItem>
                    <SelectItem value="BASIC">Basic</SelectItem>
                    <SelectItem value="PRO">Pro</SelectItem>
                    <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Organización</TableHead>
                    <TableHead>Ingresos</TableHead>
                    <TableHead>Última Actividad</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          {user.phone && (
                            <div className="text-sm text-muted-foreground">{user.phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>{getPlanBadge(user.plan)}</TableCell>
                      <TableCell>{user.organization?.name || 'N/A'}</TableCell>
                      <TableCell>${user.totalRevenue.toFixed(2)}</TableCell>
                      <TableCell>
                        {user.lastActive 
                          ? new Date(user.lastActive).toLocaleDateString()
                          : 'Nunca'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedUser(user)}
                              >
                                Ver
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Detalles del Usuario</DialogTitle>
                              </DialogHeader>
                              {selectedUser && <UserDetailsModal user={selectedUser} />}
                            </DialogContent>
                          </Dialog>
                          
                          <Select onValueChange={(value) => {
                            setActionType(value as any)
                            setSelectedUser(user)
                          }}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Acción" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="suspend">Suspender</SelectItem>
                              <SelectItem value="activate">Activar</SelectItem>
                              <SelectItem value="upgrade">Upgrade</SelectItem>
                              <SelectItem value="message">Mensaje</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments">
          <UserSegments />
        </TabsContent>

        <TabsContent value="bulk">
          <BulkActions />
        </TabsContent>
      </Tabs>

      {/* Action Modals */}
      {selectedUser && actionType && (
        <ActionModal
          user={selectedUser}
          action={actionType}
          onAction={handleUserAction}
          onClose={() => {
            setSelectedUser(null)
            setActionType(null)
          }}
        />
      )}
    </div>
  )
}

// Componentes auxiliares
function UserDetailsModal({ user }: { user: User }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Nombre</label>
          <p className="text-lg">{user.name}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <p>{user.email}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Teléfono</label>
          <p>{user.phone || 'No proporcionado'}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Rol</label>
          <p>{user.role}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Estado</label>
          <p>{user.status}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Plan</label>
          <p>{user.plan}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Registro</label>
          <p>{new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Última Actividad</label>
          <p>{user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Nunca'}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Ingresos Totales</label>
          <p className="text-lg font-bold text-green-600">${user.totalRevenue.toFixed(2)}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Mensajes Enviados</label>
          <p>{user.messagesSent.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}

function ActionModal({ 
  user, 
  action, 
  onAction, 
  onClose 
}: { 
  user: User
  action: string
  onAction: (userId: string, action: string, data?: any) => void
  onClose: () => void 
}) {
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = () => {
    const data = action === 'message' ? { message } : { reason }
    onAction(user.id, action, data)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {action === 'suspend' && 'Suspender Usuario'}
            {action === 'activate' && 'Activar Usuario'}
            {action === 'upgrade' && 'Upgrade de Plan'}
            {action === 'message' && 'Enviar Mensaje'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Usuario: <strong>{user.name}</strong></p>
          {action === 'message' ? (
            <Textarea
              placeholder="Escribe tu mensaje..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          ) : (
            <Textarea
              placeholder="Razón para esta acción..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          )}
          <div className="flex gap-2">
            <Button onClick={handleSubmit}>Confirmar</Button>
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function UserSegments() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Segmentación de Usuarios</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Funcionalidad de segmentación en desarrollo...</p>
      </CardContent>
    </Card>
  )
}

function BulkActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones Masivas</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Funcionalidad de acciones masivas en desarrollo...</p>
      </CardContent>
    </Card>
  )
}
