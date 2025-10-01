
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { AIProviderResponse } from '@/lib/ai-providers'

const formSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(50, 'Nombre muy largo'),
  displayName: z.string().min(1, 'Nombre para mostrar requerido').max(100, 'Nombre muy largo'),
  description: z.string().optional(),
  logoUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  apiUrl: z.string().url('URL de API inválida'),
  apiKeyName: z.string().optional(),
  apiKey: z.string().min(10, 'Clave API muy corta'),
  defaultModel: z.string().optional(),
  availableModels: z.string().optional(),
  inputPricePerToken: z.string().optional(),
  outputPricePerToken: z.string().optional(),
  currency: z.string().length(3, 'Código de moneda inválido').optional(),
  maxTokensPerRequest: z.string().optional(),
  rateLimitPerMinute: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface AIProviderFormProps {
  provider: AIProviderResponse | null
  onSaved: () => void
  onCancel: () => void
}

// Configuraciones predefinidas para proveedores populares
const PROVIDER_PRESETS = {
  openai: {
    name: 'openai',
    displayName: 'OpenAI',
    description: 'Proveedor de GPT-4, GPT-3.5, DALL-E y otros modelos de OpenAI',
    apiUrl: 'https://api.openai.com/v1',
    logoUrl: 'https://pbs.twimg.com/media/G1D1YRnWMAA1jTk.jpg:large',
    apiKeyName: 'API_KEY',
    defaultModel: 'gpt-4o-mini',
    availableModels: 'gpt-4o,gpt-4o-mini,gpt-3.5-turbo',
    inputPricePerToken: '0.00000150',
    outputPricePerToken: '0.00000600',
    currency: 'USD',
    maxTokensPerRequest: '4096',
    rateLimitPerMinute: '3500'
  },
  anthropic: {
    name: 'anthropic',
    displayName: 'Anthropic Claude',
    description: 'Proveedor de Claude 3.5 Sonnet, Claude 3 Haiku y otros modelos de Anthropic',
    apiUrl: 'https://api.anthropic.com/v1',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Anthropic_logo.svg/2560px-Anthropic_logo.svg.png',
    apiKeyName: 'API_KEY',
    defaultModel: 'claude-3-5-sonnet-20241022',
    availableModels: 'claude-3-5-sonnet-20241022,claude-3-haiku-20240307,claude-3-opus-20240229',
    inputPricePerToken: '0.00000300',
    outputPricePerToken: '0.00001500',
    currency: 'USD',
    maxTokensPerRequest: '4096',
    rateLimitPerMinute: '1000'
  },
  google: {
    name: 'google',
    displayName: 'Google AI (Gemini)',
    description: 'Proveedor de Gemini Pro, Gemini Flash y otros modelos de Google',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta',
    logoUrl: 'https://i.ytimg.com/vi/LI-14hLwHko/mqdefault.jpg',
    apiKeyName: 'API_KEY',
    defaultModel: 'gemini-1.5-flash',
    availableModels: 'gemini-1.5-flash,gemini-1.5-pro,gemini-pro',
    inputPricePerToken: '0.00000075',
    outputPricePerToken: '0.00000300',
    currency: 'USD',
    maxTokensPerRequest: '8192',
    rateLimitPerMinute: '1500'
  },
  cohere: {
    name: 'cohere',
    displayName: 'Cohere',
    description: 'Proveedor de Command R+, Command R y otros modelos de Cohere',
    apiUrl: 'https://api.cohere.ai/v1',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Cohere_Technologies_Logo.jpg/330px-Cohere_Technologies_Logo.jpg',
    apiKeyName: 'API_KEY',
    defaultModel: 'command-r-plus',
    availableModels: 'command-r-plus,command-r,command',
    inputPricePerToken: '0.00000300',
    outputPricePerToken: '0.00001500',
    currency: 'USD',
    maxTokensPerRequest: '4096',
    rateLimitPerMinute: '1000'
  }
}

export function AIProviderForm({ provider, onSaved, onCancel }: AIProviderFormProps) {
  const [loading, setLoading] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: provider?.name || '',
      displayName: provider?.displayName || '',
      description: provider?.description || '',
      logoUrl: provider?.logoUrl || '',
      apiUrl: provider?.apiUrl || '',
      apiKeyName: provider?.apiKeyName || 'API_KEY',
      apiKey: '', // Nunca pre-llenamos la clave por seguridad
      defaultModel: provider?.defaultModel || '',
      availableModels: provider?.availableModels ? (provider.availableModels as string[]).join(',') : '',
      inputPricePerToken: provider?.inputPricePerToken?.toString() || '',
      outputPricePerToken: provider?.outputPricePerToken?.toString() || '',
      currency: provider?.currency || 'USD',
      maxTokensPerRequest: provider?.maxTokensPerRequest?.toString() || '',
      rateLimitPerMinute: provider?.rateLimitPerMinute?.toString() || '',
    }
  })

  const applyPreset = (presetKey: string) => {
    const preset = PROVIDER_PRESETS[presetKey as keyof typeof PROVIDER_PRESETS]
    if (preset) {
      Object.keys(preset).forEach(key => {
        if (key !== 'apiKey') { // No aplicar la clave API
          form.setValue(key as keyof FormValues, preset[key as keyof typeof preset])
        }
      })
      setSelectedPreset(presetKey)
    }
  }

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true)

      // Convertir strings vacíos a undefined para campos opcionales
      const processedValues = {
        ...values,
        description: values.description || undefined,
        logoUrl: values.logoUrl || undefined,
        defaultModel: values.defaultModel || undefined,
        availableModels: values.availableModels 
          ? values.availableModels.split(',').map(s => s.trim()).filter(Boolean)
          : undefined,
        inputPricePerToken: values.inputPricePerToken 
          ? parseFloat(values.inputPricePerToken)
          : undefined,
        outputPricePerToken: values.outputPricePerToken 
          ? parseFloat(values.outputPricePerToken)
          : undefined,
        currency: values.currency || 'USD',
        maxTokensPerRequest: values.maxTokensPerRequest 
          ? parseInt(values.maxTokensPerRequest)
          : undefined,
        rateLimitPerMinute: values.rateLimitPerMinute 
          ? parseInt(values.rateLimitPerMinute)
          : undefined,
      }

      const url = provider 
        ? `/api/admin/ai-providers/${provider.id}`
        : '/api/admin/ai-providers'
      
      const method = provider ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedValues),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        onSaved()
      } else {
        throw new Error(data.error || 'Error al guardar proveedor')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error(error instanceof Error ? error.message : 'Error al guardar proveedor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Presets (solo para nuevos proveedores) */}
        {!provider && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuraciones Rápidas</CardTitle>
              <CardDescription>
                Utiliza una configuración predefinida para proveedores populares
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(PROVIDER_PRESETS).map(([key, preset]) => (
                  <Button
                    key={key}
                    type="button"
                    variant={selectedPreset === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => applyPreset(key)}
                    className="justify-start"
                  >
                    {preset.displayName}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información básica */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Información Básica</h4>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Interno</FormLabel>
                  <FormControl>
                    <Input placeholder="openai, anthropic, google..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Identificador único (sin espacios, solo letras y guiones)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre para Mostrar</FormLabel>
                  <FormControl>
                    <Input placeholder="OpenAI, Claude, Gemini..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Nombre que se mostrará en la interfaz
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descripción del proveedor y sus capacidades..."
                      className="resize-none"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL del Logo (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://i.pinimg.com/736x/19/63/c8/1963c80b8983da5f3be640ca7473b098.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Configuración técnica */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Configuración de API</h4>

            <FormField
              control={form.control}
              name="apiUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de la API</FormLabel>
                  <FormControl>
                    <Input placeholder="https://api.openai.com/v1" {...field} />
                  </FormControl>
                  <FormDescription>
                    URL base para las llamadas a la API
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apiKeyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Clave</FormLabel>
                  <FormControl>
                    <Input placeholder="API_KEY, ACCESS_TOKEN..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Nombre del header para la clave API
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Clave API 
                    {provider && <span className="text-amber-600 text-sm ml-2">(dejar vacío para mantener actual)</span>}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder={provider ? "••••••••••••" : "sk-..."} 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    La clave se almacenará cifrada de forma segura
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Configuración de modelos */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Modelos y Configuración</h4>

            <FormField
              control={form.control}
              name="defaultModel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo Por Defecto (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="gpt-4o-mini, claude-3-5-sonnet..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="availableModels"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelos Disponibles (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="modelo1,modelo2,modelo3" {...field} />
                  </FormControl>
                  <FormDescription>
                    Lista separada por comas de modelos disponibles
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxTokensPerRequest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Máx. Tokens por Request (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="4096" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rateLimitPerMinute"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Límite por Minuto (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1000" {...field} />
                  </FormControl>
                  <FormDescription>
                    Requests permitidos por minuto
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Configuración de precios */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Configuración de Precios</h4>

            <FormField
              control={form.control}
              name="inputPricePerToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio por Token de Entrada (Opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.00000001"
                      placeholder="0.00000150" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Precio en USD por token de entrada
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="outputPricePerToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio por Token de Salida (Opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.00000001"
                      placeholder="0.00000600" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Precio en USD por token de salida
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moneda (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="USD" maxLength={3} {...field} />
                  </FormControl>
                  <FormDescription>
                    Código de moneda de 3 letras (USD, EUR...)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {provider ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              provider ? 'Actualizar Proveedor' : 'Crear Proveedor'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
