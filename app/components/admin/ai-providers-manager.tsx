
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { AIProviderForm } from './ai-provider-form'
import { AIProviderResponse } from '@/lib/ai-providers'

export function AIProvidersManager() {
  const [providers, setProviders] = useState<AIProviderResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProvider, setEditingProvider] = useState<AIProviderResponse | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    loadProviders()
  }, [])

  const loadProviders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/ai-providers')
      const data = await response.json()
      
      if (data.success) {
        setProviders(data.data)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast.error('Error al cargar los proveedores de IA')
      console.error('Error loading providers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProviderSaved = () => {
    loadProviders()
    setIsDialogOpen(false)
    setEditingProvider(null)
  }

  const toggleProviderStatus = async (providerId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/ai-providers/${providerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'toggle-status',
          isActive: !currentStatus,
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message)
        loadProviders()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast.error('Error al cambiar el estado del proveedor')
      console.error('Error toggling provider status:', error)
    }
  }

  const setDefaultProvider = async (providerId: string) => {
    try {
      const response = await fetch(`/api/admin/ai-providers/${providerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'set-default',
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message)
        loadProviders()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast.error('Error al establecer proveedor por defecto')
      console.error('Error setting default provider:', error)
    }
  }

  const deleteProvider = async (providerId: string, providerName: string) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el proveedor "${providerName}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/ai-providers/${providerId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message)
        loadProviders()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast.error('Error al eliminar el proveedor')
      console.error('Error deleting provider:', error)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Gestor Central de IA</h3>
            <p className="text-sm text-gray-600 mt-1">
              Configura y gestiona las claves API de los proveedores de IA
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-red-600 hover:bg-red-700"
                onClick={() => setEditingProvider(null)}
              >
                + Añadir Proveedor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProvider ? 'Editar Proveedor de IA' : 'Añadir Nuevo Proveedor de IA'}
                </DialogTitle>
                <DialogDescription>
                  {editingProvider 
                    ? 'Modifica la configuración del proveedor de IA existente.'
                    : 'Configura un nuevo proveedor de IA para la plataforma.'
                  }
                </DialogDescription>
              </DialogHeader>
              <AIProviderForm
                provider={editingProvider}
                onSaved={handleProviderSaved}
                onCancel={() => {
                  setIsDialogOpen(false)
                  setEditingProvider(null)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lista de proveedores */}
      <div className="p-6">
        {providers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No hay proveedores configurados</h4>
            <p className="text-gray-600 mb-6">Añade tu primer proveedor de IA para comenzar.</p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => setEditingProvider(null)}
                >
                  + Añadir Primer Proveedor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Añadir Nuevo Proveedor de IA</DialogTitle>
                  <DialogDescription>
                    Configura tu primer proveedor de IA para la plataforma.
                  </DialogDescription>
                </DialogHeader>
                <AIProviderForm
                  provider={null}
                  onSaved={handleProviderSaved}
                  onCancel={() => {
                    setIsDialogOpen(false)
                    setEditingProvider(null)
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="grid gap-6">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2">
                        {provider.logoUrl && (
                          <img
                            src={provider.logoUrl}
                            alt={provider.displayName}
                            className="w-8 h-8 rounded"
                          />
                        )}
                        <h4 className="text-xl font-semibold text-gray-900">{provider.displayName}</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        {provider.isDefault && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Por Defecto
                          </Badge>
                        )}
                        <Badge 
                          variant={provider.isActive ? "default" : "secondary"}
                          className={provider.isActive 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                          }
                        >
                          {provider.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p><span className="font-medium">Nombre interno:</span> {provider.name}</p>
                        <p><span className="font-medium">URL API:</span> {provider.apiUrl}</p>
                        <p><span className="font-medium">Clave API:</span> {provider.maskedApiKey}</p>
                      </div>
                      <div>
                        {provider.defaultModel && (
                          <p><span className="font-medium">Modelo por defecto:</span> {provider.defaultModel}</p>
                        )}
                        {provider.inputPricePerToken && (
                          <p><span className="font-medium">Precio entrada:</span> ${provider.inputPricePerToken.toString()} por token</p>
                        )}
                        {provider.outputPricePerToken && (
                          <p><span className="font-medium">Precio salida:</span> ${provider.outputPricePerToken.toString()} por token</p>
                        )}
                      </div>
                    </div>

                    {provider.description && (
                      <p className="text-gray-600 mt-3">{provider.description}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingProvider(provider)
                        setIsDialogOpen(true)
                      }}
                    >
                      Editar
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleProviderStatus(provider.id, provider.isActive)}
                    >
                      {provider.isActive ? 'Desactivar' : 'Activar'}
                    </Button>

                    {!provider.isDefault && provider.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDefaultProvider(provider.id)}
                      >
                        Hacer Default
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteProvider(provider.id, provider.displayName)}
                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
