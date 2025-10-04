
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Check, Star, CreditCard, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getAllPlans, getPlanPrice, type SubscriptionPlanConfig } from '@/lib/subscription-plans'
import { SubscriptionPlan } from '@prisma/client'

interface PricingManagerProps {
  currentPlan?: SubscriptionPlan
  currentCurrency?: 'usd' | 'mxn' | 'ars'
}

export function PricingManager({ 
  currentPlan = SubscriptionPlan.FREE,
  currentCurrency = 'usd'
}: PricingManagerProps) {
  const [isYearly, setIsYearly] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<'usd' | 'mxn' | 'ars'>(currentCurrency)
  const [processingPlan, setProcessingPlan] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanConfig | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  
  const { toast } = useToast()
  const plans = getAllPlans()
  const billingCycle = isYearly ? 'yearly' : 'monthly'

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'usd': return '$'
      case 'mxn': return '$'
      case 'ars': return '$'
      default: return '$'
    }
  }

  const getCurrencyLabel = (curr: string) => {
    switch (curr) {
      case 'usd': return 'USD'
      case 'mxn': return 'MXN'
      case 'ars': return 'ARS'
      default: return 'USD'
    }
  }

  const getPaymentProvider = (currency: string) => {
    switch (currency) {
      case 'usd':
      case 'mxn':
        return 'Stripe'
      case 'ars':
        return 'Mercado Pago'
      default:
        return 'Stripe'
    }
  }

  const handleSelectPlan = (planConfig: SubscriptionPlanConfig) => {
    if (planConfig.id === SubscriptionPlan.FREE) {
      // Plan gratuito se puede activar directamente
      handleConfirmPlan(planConfig)
    } else {
      // Otros planes requieren confirmación
      setSelectedPlan(planConfig)
      setShowConfirmDialog(true)
    }
  }

  const handleConfirmPlan = async (planConfig: SubscriptionPlanConfig) => {
    setProcessingPlan(planConfig.id)
    setShowConfirmDialog(false)
    
    try {
      // Simular proceso de cambio de plan
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const price = getPlanPrice(planConfig.id, selectedCurrency, billingCycle)
      const provider = getPaymentProvider(selectedCurrency)
      
      if (planConfig.id === SubscriptionPlan.FREE) {
        toast({
          title: "¡Plan activado!",
          description: `Has cambiado al plan ${planConfig.name}. Los cambios son efectivos inmediatamente.`,
        })
      } else {
        toast({
          title: "¡Plan seleccionado!",
          description: `Has cambiado al plan ${planConfig.name} por ${getCurrencySymbol(selectedCurrency)}${price.toLocaleString()} ${getCurrencyLabel(selectedCurrency)}/${billingCycle === 'yearly' ? 'año' : 'mes'} via ${provider}.`,
        })
      }
      
      // Aquí se redirigiría a la página de pago o se actualizaría el plan
      
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cambiar el plan. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setProcessingPlan(null)
      setSelectedPlan(null)
    }
  }

  return (
    <div className="p-6">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Elige el plan perfecto para tu negocio
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Comienza gratis y crece con planes que se adaptan a tus necesidades
          </p>
          
          {/* Selector de moneda */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Label htmlFor="currency-select" className="text-sm font-medium">
              Moneda:
            </Label>
            <Select value={selectedCurrency} onValueChange={(value: 'usd' | 'mxn' | 'ars') => setSelectedCurrency(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usd">🇺🇸 USD - Dólares (Stripe)</SelectItem>
                <SelectItem value="mxn">🇲🇽 MXN - Pesos Mexicanos (Stripe)</SelectItem>
                <SelectItem value="ars">🇦🇷 ARS - Pesos Argentinos (Mercado Pago)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Toggle de facturación */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <Label htmlFor="billing-toggle" className={`text-sm font-medium ${!isYearly ? 'text-blue-600' : 'text-gray-500'}`}>
              Mensual
            </Label>
            <Switch 
              id="billing-toggle"
              checked={isYearly}
              onCheckedChange={setIsYearly}
            />
            <Label htmlFor="billing-toggle" className={`text-sm font-medium ${isYearly ? 'text-blue-600' : 'text-gray-500'}`}>
              Anual
              <Badge variant="secondary" className="ml-2">Ahorra hasta 17%</Badge>
            </Label>
          </div>
        </div>

        {/* Grid de planes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {plans.map((planConfig) => {
            const price = getPlanPrice(planConfig.id, selectedCurrency, billingCycle)
            const monthlyPrice = getPlanPrice(planConfig.id, selectedCurrency, 'monthly')
            const isCurrentPlan = currentPlan === planConfig.id
            const isProcessing = processingPlan === planConfig.id
            
            return (
              <Card 
                key={planConfig.id} 
                className={`relative transition-all duration-200 hover:shadow-lg ${
                  planConfig.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                } ${isCurrentPlan ? 'bg-blue-50 border-blue-200' : ''}`}
              >
                {planConfig.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-3 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Más Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {planConfig.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    {planConfig.description}
                  </CardDescription>
                  
                  <div className="mt-4">
                    <div className="text-4xl font-bold text-gray-900">
                      {getCurrencySymbol(selectedCurrency)}{price.toLocaleString()}
                      <span className="text-lg text-gray-500 font-normal">
                        /{billingCycle === 'yearly' ? 'año' : 'mes'}
                      </span>
                    </div>
                    {isYearly && monthlyPrice > 0 && (
                      <div className="text-sm text-gray-500 line-through">
                        {getCurrencySymbol(selectedCurrency)}{(monthlyPrice * 12).toLocaleString()} {getCurrencyLabel(selectedCurrency)}/año
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      via {getPaymentProvider(selectedCurrency)}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-6 pb-4">
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{planConfig.features.maxUsers} usuario{planConfig.features.maxUsers > 1 ? 's' : ''}</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{planConfig.features.maxMessages.toLocaleString()} mensajes/mes</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{planConfig.features.maxIntegrations} integración{planConfig.features.maxIntegrations > 1 ? 'es' : ''}</span>
                    </li>
                    {planConfig.features.hasAnalytics && (
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>Análisis avanzados</span>
                      </li>
                    )}
                    {planConfig.features.hasAutomation && (
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>Automatización</span>
                      </li>
                    )}
                    {planConfig.features.hasAPIAccess && (
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>Acceso API</span>
                      </li>
                    )}
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>Soporte {
                        planConfig.features.supportLevel === 'community' ? 'comunitario' :
                        planConfig.features.supportLevel === 'email' ? 'por email' :
                        planConfig.features.supportLevel === 'priority' ? 'prioritario' :
                        'dedicado'
                      }</span>
                    </li>
                  </ul>
                </CardContent>

                <CardFooter className="px-6 pt-2">
                  {planConfig.id === SubscriptionPlan.FREE ? (
                    <Button 
                      variant={isCurrentPlan ? "secondary" : "outline"}
                      className="w-full"
                      disabled={isCurrentPlan || isProcessing}
                      onClick={() => handleSelectPlan(planConfig)}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        isCurrentPlan ? 'Plan Actual' : 'Comenzar Gratis'
                      )}
                    </Button>
                  ) : (
                    <Button 
                      variant={planConfig.popular ? "default" : "outline"}
                      className={`w-full ${planConfig.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                      disabled={isCurrentPlan || isProcessing}
                      onClick={() => handleSelectPlan(planConfig)}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          {isCurrentPlan ? 'Plan Actual' : 
                           <>
                             <CreditCard className="mr-2 h-4 w-4" />
                             Seleccionar {planConfig.name}
                           </>
                          }
                        </>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* Información adicional */}
        <div className="text-center space-y-4 text-sm text-gray-500">
          <p>✓ Todos los planes incluyen 7 días de prueba gratuita</p>
          <p>✓ Puedes cancelar en cualquier momento sin cargos adicionales</p>
          <p>✓ Soporte técnico incluido en todos los planes</p>
        </div>

        {/* Comparación de características */}
        <div className="mt-12">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Comparación Detallada de Planes</CardTitle>
              <CardDescription>
                Todas las características disponibles en cada plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-2">Característica</th>
                      {plans.map((plan) => (
                        <th key={plan.id} className="pb-2 text-center">
                          {plan.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    <tr className="border-b">
                      <td className="py-2">Usuarios incluidos</td>
                      {plans.map((plan) => (
                        <td key={plan.id} className="py-2 text-center">
                          {plan.features.maxUsers}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Mensajes por mes</td>
                      {plans.map((plan) => (
                        <td key={plan.id} className="py-2 text-center">
                          {plan.features.maxMessages.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Integraciones</td>
                      {plans.map((plan) => (
                        <td key={plan.id} className="py-2 text-center">
                          {plan.features.maxIntegrations}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Análisis avanzados</td>
                      {plans.map((plan) => (
                        <td key={plan.id} className="py-2 text-center">
                          {plan.features.hasAnalytics ? '✓' : '✗'}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Automatización</td>
                      {plans.map((plan) => (
                        <td key={plan.id} className="py-2 text-center">
                          {plan.features.hasAutomation ? '✓' : '✗'}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Acceso API</td>
                      {plans.map((plan) => (
                        <td key={plan.id} className="py-2 text-center">
                          {plan.features.hasAPIAccess ? '✓' : '✗'}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de confirmación */}
      {selectedPlan && (
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Cambio de Plan</DialogTitle>
              <DialogDescription>
                ¿Estás seguro que quieres cambiar al plan {selectedPlan.name}?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Resumen del plan:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Plan: {selectedPlan.name}</li>
                  <li>• Precio: {getCurrencySymbol(selectedCurrency)}{getPlanPrice(selectedPlan.id, selectedCurrency, billingCycle).toLocaleString()} {getCurrencyLabel(selectedCurrency)}/{billingCycle === 'yearly' ? 'año' : 'mes'}</li>
                  <li>• Procesador: {getPaymentProvider(selectedCurrency)}</li>
                  <li>• Facturación: {isYearly ? 'Anual' : 'Mensual'}</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={() => handleConfirmPlan(selectedPlan)}>
                Confirmar Cambio
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
