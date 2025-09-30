

'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { Loader2, Mail, Lock, AlertCircle, Smartphone, User } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('credentials')
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!email || !password) {
      setError('Por favor completa todos los campos')
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
        toast({
          title: "Error de autenticación",
          description: result.error,
          variant: "destructive",
        })
      } else if (result?.ok) {
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión correctamente",
        })
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Error inesperado. Inténtalo nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      {/* Manual Tab Navigation */}
      <div className="flex bg-muted p-1 rounded-md">
        <button
          type="button"
          onClick={() => setActiveTab('credentials')}
          className={cn(
            "flex items-center justify-center space-x-2 flex-1 py-2 px-3 text-sm font-medium rounded-sm transition-colors",
            activeTab === 'credentials' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <User className="h-4 w-4" />
          <span>Credenciales</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('qr')}
          className={cn(
            "flex items-center justify-center space-x-2 flex-1 py-2 px-3 text-sm font-medium rounded-sm transition-colors",
            activeTab === 'qr' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Smartphone className="h-4 w-4" />
          <span>Código QR</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'credentials' && (
        <div className="space-y-4 mt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Empresarial</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
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
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>
        </div>
      )}

      {activeTab === 'qr' && (
        <div className="mt-6 text-center p-8">
          <div className="text-lg font-medium mb-4">Código QR (En desarrollo)</div>
          <p className="text-gray-600 mb-4">Esta funcionalidad estará disponible próximamente.</p>
          <Button 
            variant="outline" 
            onClick={() => setActiveTab('credentials')}
          >
            Usar credenciales por ahora
          </Button>
        </div>
      )}
    </div>
  )
}

