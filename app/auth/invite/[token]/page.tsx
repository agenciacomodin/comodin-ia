
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface InvitationData {
  id: string
  email: string
  role: string
  organizationName: string
  invitedByName: string
  firstName?: string | null
  lastName?: string | null
  message?: string | null
  expiresAt: string
}

export default function InvitePage({ params }: { params: { token: string } }) {
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    fullName: '',
    phone: '',
    country: '',
    password: '',
    confirmPassword: ''
  })
  const router = useRouter()

  useEffect(() => {
    validateInvitation()
  }, [params.token])

  const validateInvitation = async () => {
    try {
      const response = await fetch(`/api/invitations/token/validate?token=${params.token}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invitación no válida')
      }

      setInvitation(data.invitation)
      
      // Pre-llenar datos si están disponibles
      if (data.invitation.firstName || data.invitation.lastName) {
        const fullName = [data.invitation.firstName, data.invitation.lastName].filter(Boolean).join(' ')
        setFormData(prev => ({
          ...prev,
          name: data.invitation.firstName || '',
          fullName: fullName
        }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error validando invitación')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invitation) return

    setSubmitting(true)
    setError(null)

    try {
      // Validaciones del cliente
      if (!formData.name.trim()) {
        throw new Error('El nombre es requerido')
      }

      if (!formData.password) {
        throw new Error('La contraseña es requerida')
      }

      if (formData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres')
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden')
      }

      // Aceptar invitación
      const response = await fetch(`/api/invitations/token/accept?token=${params.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          fullName: formData.fullName.trim() || formData.name.trim(),
          phone: formData.phone.trim() || undefined,
          country: formData.country.trim() || undefined,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error procesando invitación')
      }

      toast.success('¡Cuenta creada exitosamente!')

      // Iniciar sesión automáticamente
      const signInResult = await signIn('credentials', {
        email: invitation.email,
        password: formData.password,
        redirect: false
      })

      if (signInResult?.error) {
        toast.error('Error al iniciar sesión. Intenta iniciar sesión manualmente.')
        router.push('/auth/login')
      } else {
        toast.success('¡Bienvenido al equipo!')
        router.push('/dashboard')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Validando invitación...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-red-500 text-5xl mb-4">❌</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Invitación no válida
                </h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => router.push('/auth/login')} className="w-full">
                  Ir al inicio de sesión
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">COMODÍN IA</h1>
          <p className="text-gray-600">Plataforma de Comunicación y Ventas</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">¡Has sido invitado!</CardTitle>
            <CardDescription className="text-center">
              <strong>{invitation?.invitedByName}</strong> te ha invitado a unirte a{' '}
              <strong>{invitation?.organizationName}</strong> como{' '}
              <strong>Agente de Ventas</strong>
            </CardDescription>
          </CardHeader>

          <CardContent>
            {invitation?.message && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800 italic">
                  "{invitation.message}"
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  - {invitation.invitedByName}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {invitation?.email}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nombre *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Tu nombre"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">
                  Nombre completo
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="Nombre y apellidos completos"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+52 555 123 4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-medium">
                  País
                </Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  placeholder="México"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Contraseña *
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirmar contraseña *
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Repite tu contraseña"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creando cuenta...
                  </>
                ) : (
                  'Crear mi cuenta y unirme al equipo'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Al crear tu cuenta, te unes automáticamente a <strong>{invitation?.organizationName}</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
