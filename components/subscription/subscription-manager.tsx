
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { SubscriptionPlans } from './subscription-plans';
import { SubscriptionStatusComponent } from './subscription-status';
import { SubscriptionPlan, PaymentProvider } from '@prisma/client';

interface SubscriptionManagerProps {
  initialData?: any;
}

export function SubscriptionManager({ initialData }: SubscriptionManagerProps) {
  const [subscriptionData, setSubscriptionData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);

  // Cargar datos de suscripción
  useEffect(() => {
    if (!initialData) {
      fetchSubscriptionData();
    }
  }, [initialData]);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscriptions');
      if (!response.ok) throw new Error('Failed to fetch subscription data');
      const data = await response.json();
      setSubscriptionData(data);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast.error('Error al cargar datos de suscripción');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = async (plan: SubscriptionPlan, billingCycle: 'monthly' | 'yearly') => {
    if (plan === SubscriptionPlan.FREE) {
      toast('Ya tienes acceso al plan gratuito');
      return;
    }

    setPaymentLoading(true);
    try {
      // Si ya tiene una suscripción, actualizar el plan
      if (subscriptionData?.currentSubscription) {
        await updateSubscriptionPlan(plan, billingCycle);
      } else {
        // Crear nueva suscripción
        await createNewSubscription(plan, billingCycle);
      }
    } catch (error) {
      console.error('Error managing subscription:', error);
      toast.error('Error al procesar la suscripción');
    } finally {
      setPaymentLoading(false);
    }
  };

  const createNewSubscription = async (plan: SubscriptionPlan, billingCycle: 'monthly' | 'yearly') => {
    // Mostrar opciones de pago
    const paymentProvider = await selectPaymentProvider();
    if (!paymentProvider) return;

    if (paymentProvider === PaymentProvider.STRIPE) {
      // Redirigir a Stripe Checkout
      const response = await fetch('/api/payments/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, billingCycle, trialDays: 7 })
      });

      if (!response.ok) throw new Error('Failed to create Stripe checkout');
      
      const { checkoutUrl } = await response.json();
      window.location.href = checkoutUrl;
    } else if (paymentProvider === PaymentProvider.MERCADO_PAGO) {
      // Crear preferencia de MercadoPago
      const response = await fetch('/api/payments/mercadopago/preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, billingCycle, currency: 'ARS' })
      });

      if (!response.ok) throw new Error('Failed to create MercadoPago preference');
      
      const { preapprovalUrl } = await response.json();
      window.location.href = preapprovalUrl;
    }
  };

  const updateSubscriptionPlan = async (plan: SubscriptionPlan, billingCycle: 'monthly' | 'yearly') => {
    const response = await fetch('/api/subscriptions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, billingCycle })
    });

    if (!response.ok) throw new Error('Failed to update subscription');
    
    const updatedSubscription = await response.json();
    setSubscriptionData((prev: any) => ({
      ...prev,
      currentSubscription: updatedSubscription,
      organization: { ...prev.organization, currentPlan: plan }
    }));

    toast.success('Plan actualizado exitosamente');
    setShowPlansModal(false);
  };

  const selectPaymentProvider = (): Promise<PaymentProvider | null> => {
    return new Promise((resolve) => {
      // Aquí podrías mostrar un modal para seleccionar el proveedor de pago
      // Por simplicidad, vamos a usar Stripe por defecto para USD/MXN y MercadoPago para ARS
      const country = subscriptionData?.organization?.country || 'US';
      
      if (country === 'AR') {
        resolve(PaymentProvider.MERCADO_PAGO);
      } else {
        resolve(PaymentProvider.STRIPE);
      }
    });
  };

  const handleManageBilling = async () => {
    if (!subscriptionData?.currentSubscription) return;

    setPaymentLoading(true);
    try {
      if (subscriptionData.currentSubscription.paymentProvider === 'STRIPE') {
        const response = await fetch('/api/payments/stripe/billing-portal', {
          method: 'POST'
        });

        if (!response.ok) throw new Error('Failed to create billing portal');
        
        const { portalUrl } = await response.json();
        window.location.href = portalUrl;
      } else {
        toast('Gestión de facturación para MercadoPago estará disponible pronto');
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast.error('Error al abrir portal de facturación');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscriptionData?.currentSubscription) return;
    
    if (!confirm('¿Estás seguro de que quieres cancelar tu suscripción?')) return;

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to cancel subscription');
      
      toast.success('Suscripción cancelada. Seguirás teniendo acceso hasta el final del período actual.');
      await fetchSubscriptionData();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Error al cancelar suscripción');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!subscriptionData) {
    return (
      <Alert>
        <AlertDescription>
          No se pudieron cargar los datos de suscripción. Por favor, recarga la página.
        </AlertDescription>
      </Alert>
    );
  }

  const { organization, currentSubscription, planConfig, usage, recentPayments } = subscriptionData;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Suscripción</h1>
        <Dialog open={showPlansModal} onOpenChange={setShowPlansModal}>
          <DialogTrigger asChild>
            <Button>
              <TrendingUp className="w-4 h-4 mr-2" />
              Ver Planes
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Selecciona tu Plan</DialogTitle>
            </DialogHeader>
            <SubscriptionPlans
              currentPlan={organization.currentPlan}
              currency={organization.country === 'AR' ? 'ars' : organization.country === 'MX' ? 'mxn' : 'usd'}
              onPlanSelect={handlePlanSelect}
              loading={paymentLoading}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status">Estado</TabsTrigger>
          <TabsTrigger value="billing">Facturación</TabsTrigger>
          <TabsTrigger value="usage">Uso</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-6">
          <SubscriptionStatusComponent
            currentPlan={organization.currentPlan}
            subscriptionStatus={currentSubscription?.status}
            usage={usage}
            subscription={currentSubscription ? {
              currentPeriodEnd: new Date(currentSubscription.currentPeriodEnd),
              cancelAtPeriodEnd: currentSubscription.cancelAtPeriodEnd,
              trialEnd: currentSubscription.trialEnd ? new Date(currentSubscription.trialEnd) : null
            } : undefined}
            onUpgrade={() => setShowPlansModal(true)}
            onManageBilling={handleManageBilling}
          />
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Información de Facturación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentSubscription ? (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Plan:</span> {planConfig.name}
                    </div>
                    <div>
                      <span className="font-medium">Ciclo:</span> {currentSubscription.billingCycle === 'yearly' ? 'Anual' : 'Mensual'}
                    </div>
                    <div>
                      <span className="font-medium">Precio:</span> ${currentSubscription.pricePerMonth} {currentSubscription.currency}/mes
                    </div>
                    <div>
                      <span className="font-medium">Proveedor:</span> {currentSubscription.paymentProvider === 'STRIPE' ? 'Stripe' : 'MercadoPago'}
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <Button onClick={handleManageBilling} disabled={paymentLoading}>
                      {paymentLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
                      Gestionar Pagos
                    </Button>
                    
                    {!currentSubscription.cancelAtPeriodEnd && (
                      <Button variant="outline" onClick={handleCancelSubscription}>
                        Cancelar Suscripción
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No tienes una suscripción activa</p>
                  <Button onClick={() => setShowPlansModal(true)}>
                    Ver Planes Disponibles
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Uso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500">El historial detallado de uso estará disponible pronto</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
