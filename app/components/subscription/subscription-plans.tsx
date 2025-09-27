
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAllPlans, getPlanPrice } from '@/lib/subscription-plans';
import { SubscriptionPlan } from '@prisma/client';

interface SubscriptionPlansProps {
  currentPlan?: SubscriptionPlan;
  currency?: 'usd' | 'mxn' | 'ars';
  onPlanSelect?: (plan: SubscriptionPlan, billingCycle: 'monthly' | 'yearly') => void;
  loading?: boolean;
}

export function SubscriptionPlans({ 
  currentPlan, 
  currency = 'usd', 
  onPlanSelect, 
  loading = false 
}: SubscriptionPlansProps) {
  const [isYearly, setIsYearly] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  
  const plans = getAllPlans();
  const billingCycle = isYearly ? 'yearly' : 'monthly';

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'usd': return '$';
      case 'mxn': return '$';
      case 'ars': return '$';
      default: return '$';
    }
  };

  const getCurrencyLabel = (curr: string) => {
    switch (curr) {
      case 'usd': return 'USD';
      case 'mxn': return 'MXN';
      case 'ars': return 'ARS';
      default: return 'USD';
    }
  };

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (loading || processingPlan === plan) return;
    
    setProcessingPlan(plan);
    try {
      await onPlanSelect?.(plan, billingCycle);
    } catch (error) {
      console.error('Error selecting plan:', error);
      toast.error('Error al seleccionar el plan');
    } finally {
      setProcessingPlan(null);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Elige el plan perfecto para tu negocio
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Comienza gratis y crece con planes que se adaptan a tus necesidades
        </p>
        
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
            <Badge variant="secondary" className="ml-2">Ahorra 17%</Badge>
          </Label>
        </div>
      </div>

      {/* Grid de planes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((planConfig) => {
          const price = getPlanPrice(planConfig.id, currency, billingCycle);
          const monthlyPrice = getPlanPrice(planConfig.id, currency, 'monthly');
          const isCurrentPlan = currentPlan === planConfig.id;
          const isProcessing = processingPlan === planConfig.id;
          
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
                    {getCurrencySymbol(currency)}{price.toLocaleString()}
                    <span className="text-lg text-gray-500 font-normal">
                      /{billingCycle === 'yearly' ? 'año' : 'mes'}
                    </span>
                  </div>
                  {isYearly && monthlyPrice > 0 && (
                    <div className="text-sm text-gray-500 line-through">
                      {getCurrencySymbol(currency)}{(monthlyPrice * 12).toLocaleString()} {getCurrencyLabel(currency)}/año
                    </div>
                  )}
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
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan ? 'Plan Actual' : 'Comenzar Gratis'}
                  </Button>
                ) : (
                  <Button 
                    variant={planConfig.popular ? "default" : "outline"}
                    className={`w-full ${planConfig.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    disabled={loading || isCurrentPlan || isProcessing}
                    onClick={() => handleSelectPlan(planConfig.id)}
                  >
                    {isProcessing ? 'Procesando...' : 
                     isCurrentPlan ? 'Plan Actual' : 
                     `Cambiar a ${planConfig.name}`}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="text-center mt-8 text-sm text-gray-500">
        <p>Todos los planes incluyen 7 días de prueba gratuita</p>
        <p>Puedes cancelar en cualquier momento sin cargos adicionales</p>
      </div>
    </div>
  );
}
