'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft,
  Clock,
  User,
  Mail,
  Phone,
  Building2,
  MessageSquare,
  CheckCircle2,
  Send
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface TicketUpdate {
  id: string
  message: string
  type: string
  authorType: string
  authorName: string
  authorEmail: string | null
  isInternal: boolean
  createdAt: string
  metadata?: any
}

interface SupportTicket {
  id: string
  title: string
  description: string
  type: string
  status: string
  priority: string
  clientName: string
  clientEmail: string
  clientPhone: string | null
  clientCompany: string | null
  resolvedAt: string | null
  hoursWorked: number | null
  finalPrice: number | null
  createdAt: string
  updates: TicketUpdate[]
}

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [resolving, setResolving] = useState(false)
  
  // Form states
  const [newMessage, setNewMessage] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [solution, setSolution] = useState('')
  const [hoursWorked, setHoursWorked] = useState('')
  const [showResolveForm, setShowResolveForm] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchTicket()
    }
  }, [params.id])

  const fetchTicket = async () => {
    try {
      const response = await fetch(`/api/support-tickets/${params.id}`)
      const data = await response.json()
      if (data.success) {
        setTicket(data.data)
        setNewStatus(data.data.status)
      }
    } catch (error) {
      console.error('Error fetching ticket:', error)
      toast({
        title: 'Error',
        description: 'No se pudo cargar el ticket',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddUpdate = async () => {
    if (!newMessage.trim()) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/support-tickets/${params.id}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage,
          type: 'comment'
        })
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: 'Actualización agregada',
          description: 'La actualización se agregó correctamente'
        })
        setNewMessage('')
        fetchTicket()
      }
    } catch (error) {
      console.error('Error adding update:', error)
      toast({
        title: 'Error',
        description: 'No se pudo agregar la actualización',
        variant: 'destructive'
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (newStatus === ticket?.status) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/support-tickets/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: 'Estado actualizado',
          description: 'El estado del ticket se actualizó correctamente'
        })
        fetchTicket()
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado',
        variant: 'destructive'
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleResolve = async () => {
    if (!solution.trim()) {
      toast({
        title: 'Error',
        description: 'Debes proporcionar una solución',
        variant: 'destructive'
      })
      return
    }

    setResolving(true)
    try {
      const response = await fetch(`/api/support-tickets/${params.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          solution,
          hoursWorked: parseFloat(hoursWorked) || 0
        })
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: 'Ticket resuelto',
          description: data.message || 'El ticket se resolvió correctamente'
        })
        router.push('/support')
      }
    } catch (error) {
      console.error('Error resolving ticket:', error)
      toast({
        title: 'Error',
        description: 'No se pudo resolver el ticket',
        variant: 'destructive'
      })
    } finally {
      setResolving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <p className="text-muted-foreground">Ticket no encontrado</p>
          <Link href="/support">
            <Button className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a tickets
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/support">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{ticket.title}</h1>
          <p className="text-muted-foreground">Ticket #{ticket.id.slice(0, 8)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del Ticket */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Descripción</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {ticket.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant={ticket.status === 'RESOLVED' ? 'default' : 'secondary'}>
                  {ticket.status}
                </Badge>
                <Badge variant="outline">{ticket.priority}</Badge>
                <Badge variant="outline">{ticket.type}</Badge>
              </div>

              {ticket.status === 'RESOLVED' && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-900 dark:text-green-100">Ticket Resuelto</h4>
                  </div>
                  {(() => {
                    const resolutionUpdate = ticket.updates.find(u => u.type === 'resolution')
                    const solutionText = resolutionUpdate?.metadata?.solution
                    return solutionText && (
                      <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                        {solutionText}
                      </p>
                    )
                  })()}
                  {ticket.resolvedAt && (
                    <div className="mt-2 text-xs text-green-700 dark:text-green-300">
                      Resuelto el {new Date(ticket.resolvedAt).toLocaleString()}
                    </div>
                  )}
                  {ticket.hoursWorked && ticket.hoursWorked > 0 && (
                    <div className="text-xs text-green-700 dark:text-green-300">
                      Tiempo invertido: {ticket.hoursWorked}h
                    </div>
                  )}
                  {ticket.finalPrice && (
                    <div className="text-sm font-bold text-green-900 dark:text-green-100 mt-2">
                      Costo: ${ticket.finalPrice}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actualizaciones */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de Actualizaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.updates.map((update) => (
                <div key={update.id} className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{update.authorName}</span>
                      <Badge variant="outline" className="text-xs">
                        {update.authorType}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(update.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{update.message}</p>
                  </div>
                </div>
              ))}

              {ticket.updates.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay actualizaciones todavía
                </p>
              )}
            </CardContent>
          </Card>

          {/* Agregar Actualización */}
          {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
            <Card>
              <CardHeader>
                <CardTitle>Agregar Actualización</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Escribe una actualización..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={4}
                />
                <Button 
                  onClick={handleAddUpdate} 
                  disabled={updating || !newMessage.trim()}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Actualización
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Formulario de Resolución */}
          {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && showResolveForm && (
            <Card className="border-green-200 dark:border-green-900">
              <CardHeader>
                <CardTitle className="text-green-900 dark:text-green-100">
                  Resolver Ticket
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="solution">Solución</Label>
                  <Textarea
                    id="solution"
                    placeholder="Describe la solución aplicada..."
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="hoursWorked">Tiempo Invertido (horas)</Label>
                  <Input
                    id="hoursWorked"
                    type="number"
                    step="0.5"
                    placeholder="Ej: 2.5"
                    value={hoursWorked}
                    onChange={(e) => setHoursWorked(e.target.value)}
                  />
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-900 dark:text-yellow-100">
                    ⚠️ Al resolver este ticket se cobrará <strong>${ticket.finalPrice || 20}</strong> de la cartera de la organización.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleResolve} 
                    disabled={resolving || !solution.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Resolver Ticket
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowResolveForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Información del Cliente y Acciones */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{ticket.clientName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{ticket.clientEmail}</span>
              </div>
              {ticket.clientPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{ticket.clientPhone}</span>
                </div>
              )}
              {ticket.clientCompany && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{ticket.clientCompany}</span>
                </div>
              )}
              <Separator />
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  Creado: {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
            <Card>
              <CardHeader>
                <CardTitle>Gestionar Ticket</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Estado</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Abierto</SelectItem>
                      <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                      <SelectItem value="PENDING_CLIENT">Esperando Cliente</SelectItem>
                      <SelectItem value="RESOLVED">Resuelto</SelectItem>
                      <SelectItem value="CLOSED">Cerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleUpdateStatus}
                  disabled={updating || newStatus === ticket.status}
                  className="w-full"
                >
                  Actualizar Estado
                </Button>

                <Separator />

                {!showResolveForm && (
                  <Button 
                    onClick={() => setShowResolveForm(true)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Resolver Ticket
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
