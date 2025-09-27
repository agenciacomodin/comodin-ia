
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react'
import { IntegrationWithDetails, ECOMMERCE_CONFIGS } from '@/lib/types'
import { toast } from 'react-hot-toast'

interface IntegrationConnectionDialogProps {
  integration: IntegrationWithDetails
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function IntegrationConnectionDialog({
  integration,
  open,
  onOpenChange,
  onSuccess
}: IntegrationConnectionDialogProps) {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'testing' | 'success'>('form')
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [testResults, setTestResults] = useState<any>(null)

  // Obtener configuración específica de la plataforma
  const getConfig = () => {
    if (integration.platform && integration.platform in ECOMMERCE_CONFIGS) {
      return ECOMMERCE_CONFIGS[integration.platform as keyof typeof ECOMMERCE_CONFIGS]
    }
    return null
  }

  const config = getConfig()

  // Manejar cambios en el formulario
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Manejar cambios en las funcionalidades
  const handleFeatureChange = (feature: string, checked: boolean) => {
    setSelectedFeatures(prev => 
      checked 
        ? [...prev, feature]
        : prev.filter(f => f !== feature)
    )
  }

  // Probar la conexión
  const testConnection = async () => {
    setLoading(true)
    setStep('testing')

    try {
      const response = await fetch('/api/integrations/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          integrationId: integration.id,
          credentials: formData,
          features: selectedFeatures
        })
      })

      const data = await response.json()
      setTestResults(data)

      if (response.ok && data.success) {
        // Si la prueba es exitosa, crear la conexión
        await createConnection()
      } else {
        throw new Error(data.error || 'Error al probar la conexión')
      }
    } catch (error) {
      console.error('Error testing connection:', error)
      toast.error('Error al probar la conexión')
      setStep('form')
    } finally {
      setLoading(false)
    }
  }

  // Crear la conexión
  const createConnection = async () => {
    try {
      const response = await fetch('/api/integrations/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          integrationId: integration.id,
          name: formData.name || integration.displayName,
          credentials: formData,
          features: selectedFeatures,
          config: {
            ...formData,
            testResults
          }
        })
      })

      if (response.ok) {
        setStep('success')
        toast.success('Integración conectada exitosamente')
        setTimeout(() => {
          onSuccess()
        }, 2000)
      } else {
        throw new Error('Error al crear la conexión')
      }
    } catch (error) {
      console.error('Error creating connection:', error)
      toast.error('Error al crear la conexión')
      setStep('form')
    }
  }

  // Renderizar campos del formulario según el tipo de autenticación
  const renderFormFields = () => {
    if (!config) return null

    return (
      <div className="space-y-4">
        {/* Nombre personalizado */}
        <div>
          <Label htmlFor="name">Nombre de la conexión (opcional)</Label>
          <Input
            id="name"
            placeholder={`Mi tienda ${integration.displayName}`}
            value={formData.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
        </div>

        {/* Campos específicos por plataforma */}
        {integration.platform === 'SHOPIFY' && (
          <>
            <div>
              <Label htmlFor="shop_domain">Dominio de la tienda *</Label>
              <Input
                id="shop_domain"
                placeholder="mi-tienda.myshopify.com"
                value={formData.shop_domain || ''}
                onChange={(e) => handleInputChange('shop_domain', e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Solo el dominio, ejemplo: mi-tienda.myshopify.com
              </p>
            </div>

            <div>
              <Label htmlFor="access_token">Token de acceso *</Label>
              <Input
                id="access_token"
                type="password"
                placeholder="shpat_..."
                value={formData.access_token || ''}
                onChange={(e) => handleInputChange('access_token', e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Token de acceso privado de tu aplicación Shopify
              </p>
            </div>
          </>
        )}

        {integration.platform === 'WOOCOMMERCE' && (
          <>
            <div>
              <Label htmlFor="site_url">URL del sitio *</Label>
              <Input
                id="site_url"
                placeholder="https://mi-tienda.com"
                value={formData.site_url || ''}
                onChange={(e) => handleInputChange('site_url', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="consumer_key">Consumer Key *</Label>
              <Input
                id="consumer_key"
                placeholder="ck_..."
                value={formData.consumer_key || ''}
                onChange={(e) => handleInputChange('consumer_key', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="consumer_secret">Consumer Secret *</Label>
              <Input
                id="consumer_secret"
                type="password"
                placeholder="cs_..."
                value={formData.consumer_secret || ''}
                onChange={(e) => handleInputChange('consumer_secret', e.target.value)}
                required
              />
            </div>
          </>
        )}

        {integration.platform === 'TIENDANUBE' && (
          <>
            <div>
              <Label htmlFor="store_id">ID de la tienda *</Label>
              <Input
                id="store_id"
                placeholder="123456"
                value={formData.store_id || ''}
                onChange={(e) => handleInputChange('store_id', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="access_token">Token de acceso *</Label>
              <Input
                id="access_token"
                type="password"
                placeholder="abc123..."
                value={formData.access_token || ''}
                onChange={(e) => handleInputChange('access_token', e.target.value)}
                required
              />
            </div>
          </>
        )}

        {/* Funcionalidades a habilitar */}
        {config.supportedFeatures && config.supportedFeatures.length > 0 && (
          <div>
            <Label>Funcionalidades a habilitar</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {config.supportedFeatures.map((feature) => (
                <div key={feature} className="flex items-center space-x-2">
                  <Checkbox
                    id={feature}
                    checked={selectedFeatures.includes(feature)}
                    onCheckedChange={(checked) => handleFeatureChange(feature, checked as boolean)}
                  />
                  <Label htmlFor={feature} className="text-sm capitalize">
                    {feature}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Renderizar paso de prueba
  const renderTestingStep = () => (
    <div className="text-center py-8">
      <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Probando conexión...</h3>
      <p className="text-gray-500">
        Verificando credenciales y configuración
      </p>
    </div>
  )

  // Renderizar paso de éxito
  const renderSuccessStep = () => (
    <div className="text-center py-8">
      <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">¡Conexión exitosa!</h3>
      <p className="text-gray-500 mb-4">
        {integration.displayName} se ha conectado correctamente
      </p>
      
      {testResults?.storeInfo && (
        <div className="bg-green-50 rounded-lg p-4 mt-4 text-left">
          <h4 className="font-medium text-green-900 mb-2">Información de la tienda:</h4>
          <div className="text-sm text-green-800 space-y-1">
            {testResults.storeInfo.name && <p>Nombre: {testResults.storeInfo.name}</p>}
            {testResults.storeInfo.url && <p>URL: {testResults.storeInfo.url}</p>}
            {testResults.storeInfo.productsCount && <p>Productos: {testResults.storeInfo.productsCount}</p>}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Conectar {integration.displayName}</span>
            {config?.documentation && (
              <Button variant="ghost" size="sm" asChild>
                <a href={config.documentation} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            {config?.description || integration.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Alerta informativa */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Las credenciales se almacenan de forma segura y encriptada. Solo se utilizan para consultas autorizadas a tu tienda.
            </AlertDescription>
          </Alert>

          {/* Contenido según el paso */}
          {step === 'form' && renderFormFields()}
          {step === 'testing' && renderTestingStep()}
          {step === 'success' && renderSuccessStep()}

          {/* Botones de acción */}
          {step === 'form' && (
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={testConnection} disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Probar y Conectar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
