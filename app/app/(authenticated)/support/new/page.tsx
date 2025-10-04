
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Send } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

export default function NewTicketPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    priority: 'MEDIUM',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientCompany: '',
    technicalDetails: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.type || !formData.clientName || !formData.clientEmail) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos requeridos',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/support-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: 'Ticket creado',
          description: 'Tu ticket de soporte ha sido creado exitosamente'
        })
        router.push(`/support/${data.data.id}`)
      } else {
        throw new Error(data.error || 'Error creando ticket')
      }
    } catch (error: any) {
      console.error('Error creating ticket:', error)
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear el ticket',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
          <h1 className="text-3xl font-bold">Nuevo Ticket de Soporte</h1>
          <p className="text-muted-foreground">
            Crea un nuevo ticket para recibir soporte técnico especializado
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Ticket</CardTitle>
          <CardDescription>
            Completa la información para ayudarnos a resolver tu solicitud de manera más eficiente.
            Los tickets resueltos tienen un costo de $20 USD.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="font-semibold">Información Básica</h3>
              
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  placeholder="Resume tu problema en una línea"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción Detallada *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe tu problema con el mayor detalle posible..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Tipo de Servicio *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TECHNICAL">Soporte Técnico</SelectItem>
                      <SelectItem value="CONFIGURATION">Configuración</SelectItem>
                      <SelectItem value="INTEGRATION">Integración</SelectItem>
                      <SelectItem value="BUG">Reporte de Error</SelectItem>
                      <SelectItem value="FEATURE">Nueva Funcionalidad</SelectItem>
                      <SelectItem value="TRAINING">Capacitación</SelectItem>
                      <SelectItem value="OTHER">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Prioridad *</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Baja - No urgente</SelectItem>
                      <SelectItem value="MEDIUM">Media - Normal</SelectItem>
                      <SelectItem value="HIGH">Alta - Requiere atención</SelectItem>
                      <SelectItem value="URGENT">Urgente - Crítico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Información del Cliente */}
            <div className="space-y-4">
              <h3 className="font-semibold">Información de Contacto</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName">Nombre Completo *</Label>
                  <Input
                    id="clientName"
                    placeholder="Ej: Juan Pérez"
                    value={formData.clientName}
                    onChange={(e) => handleChange('clientName', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="clientEmail">Email *</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    placeholder="Ej: juan@empresa.com"
                    value={formData.clientEmail}
                    onChange={(e) => handleChange('clientEmail', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientPhone">Teléfono</Label>
                  <Input
                    id="clientPhone"
                    placeholder="Ej: +54 11 1234-5678"
                    value={formData.clientPhone}
                    onChange={(e) => handleChange('clientPhone', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="clientCompany">Empresa</Label>
                  <Input
                    id="clientCompany"
                    placeholder="Ej: Empresa S.A."
                    value={formData.clientCompany}
                    onChange={(e) => handleChange('clientCompany', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Detalles Técnicos */}
            <div className="space-y-4">
              <h3 className="font-semibold">Detalles Técnicos (Opcional)</h3>
              
              <div>
                <Label htmlFor="technicalDetails">Información Técnica Adicional</Label>
                <Textarea
                  id="technicalDetails"
                  placeholder="Incluye información como navegador, sistema operativo, mensajes de error, etc."
                  value={formData.technicalDetails}
                  onChange={(e) => handleChange('technicalDetails', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Información de Cobro */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">💰 Información de Cobro</h3>
              <p className="text-sm text-muted-foreground">
                Los tickets de soporte tienen un costo de <strong>$20 USD</strong> por cada ticket resuelto.
                El cobro se realizará automáticamente desde tu cartera cuando el ticket sea marcado como resuelto.
                No se realizará ningún cobro si el ticket es cerrado sin resolución.
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-2 justify-end">
              <Link href="/support">
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                <Send className="w-4 h-4 mr-2" />
                {loading ? 'Creando...' : 'Crear Ticket'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
