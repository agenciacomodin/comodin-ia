
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, User, Mail, Lock, Building, Phone, Globe, AlertCircle, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { signIn } from 'next-auth/react'

const LATIN_AMERICAN_COUNTRIES = [
  'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica',
  'Cuba', 'Ecuador', 'El Salvador', 'Guatemala', 'Honduras', 'México',
  'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 'República Dominicana',
  'Uruguay', 'Venezuela'
]

export function RegisterForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    organizationName: '',
    phone: '',
    country: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.fullName || !formData.organizationName) {
      return 'Por favor completa todos los campos obligatorios'
    }
    
    if (formData.password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres'
    }
    
    if (formData.password !== formData.confirmPassword) {
      return 'Las contraseñas no coinciden'
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Por favor ingresa un email válido'
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          organizationName: formData.organizationName,
          phone: formData.phone,
          country: formData.country
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error en el registro')
      }

      setSuccess(true)
      toast({
        title: "¡Registro exitoso!",
        description: `Bienvenido ${data.user.fullName}. Iniciando sesión...`,
      })

      // Automáticamente iniciar sesión después del registro
      setTimeout(async () => {
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (result?.ok) {
          router.push('/dashboard')
        }
      }, 1500)

    } catch (error) {
      console.error('Registration error:', error)
      setError(error instanceof Error ? error.message : 'Error inesperado en el registro')
      toast({
        title: "Error en el registro",
        description: error instanceof Error ? error.message : 'Error inesperado',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          ¡Registro Completado!
        </h3>
        <p className="text-gray-600">
          Tu empresa ha sido registrada exitosamente. Iniciando sesión automáticamente...
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Información Personal */}
      <div className="space-y-2">
        <Label htmlFor="fullName">Nombre Completo *</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="fullName"
            type="text"
            placeholder="Juan Pérez"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            className="pl-10"
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Empresarial *</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="juan@miempresa.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="pl-10"
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña *</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="pl-10"
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar *</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repetir contraseña"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className="pl-10"
              disabled={isLoading}
              required
            />
          </div>
        </div>
      </div>

      {/* Información de la Empresa */}
      <div className="space-y-2">
        <Label htmlFor="organizationName">Nombre de la Empresa *</Label>
        <div className="relative">
          <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="organizationName"
            type="text"
            placeholder="Mi Empresa SRL"
            value={formData.organizationName}
            onChange={(e) => handleChange('organizationName', e.target.value)}
            className="pl-10"
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="phone"
              type="tel"
              placeholder="+52 555 123 4567"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">País</Label>
          <div className="relative">
            <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
            <Select 
              value={formData.country} 
              onValueChange={(value) => handleChange('country', value)}
              disabled={isLoading}
            >
              <SelectTrigger className="pl-10">
                <SelectValue placeholder="Seleccionar país" />
              </SelectTrigger>
              <SelectContent>
                {LATIN_AMERICAN_COUNTRIES.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-blue-600 hover:bg-blue-700" 
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creando cuenta...
          </>
        ) : (
          'Registrar Empresa'
        )}
      </Button>

      <p className="text-xs text-gray-600 text-center">
        Al registrarte, aceptas nuestros términos de servicio y política de privacidad
      </p>
    </form>
  )
}
