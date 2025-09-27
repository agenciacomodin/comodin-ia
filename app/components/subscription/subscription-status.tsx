
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Users, MessageSquare, Zap, Calendar, CreditCard } from 'lucide-react';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { getPlanConfig } from '@/lib/subscription-plans';
import { format, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';

interface SubscriptionStatusProps {
  currentPlan: SubscriptionPlan;
  subscriptionStatus?: SubscriptionStatus;
  usage: {
    currentUsers: number;
    currentMessages: number;
    currentIntegrations: number;
    limitsExceeded: boolean;
    resetDate: Date | null;
  };
  subscription?: {
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    trialEnd?: Date | null;
  };
  onUpgrade?: () => void;
  onManageBilling?: () => void;
}

export function SubscriptionStatusComponent({ 
  currentPlan, 
  subscriptionStatus,
  usage, 
  subscription,
  onUpgrade,
  onManageBilling
}: SubscriptionStatusProps) {
  const planConfig = getPlanConfig(currentPlan);
  const isTrialing = subscriptionStatus === SubscriptionStatus.TRIALING;
  const isPastDue = subscriptionStatus === SubscriptionStatus.PAST_DUE;
  const isCanceled = subscriptionStatus === SubscriptionStatus.CANCELED;
  const isExpired = subscription?.currentPeriodEnd && isAfter(new Date(), subscription.currentPeriodEnd);

  const getStatusBadge = () => {
    if (isTrialing) {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Período de Prueba</Badge>;
    }
    if (isPastDue) {
      return <Badge variant="destructive">Pago Pendiente</Badge>;
    }
    if (isCanceled || isExpired) {
      return <Badge variant="outline" className="border-red-200 text-red-600">Cancelado</Badge>;
    }
    if (currentPlan === SubscriptionPlan.FREE) {
      return <Badge variant="secondary">Plan Gratuito</Badge>;
    }
    return <Badge variant="default" className="bg-green-100 text-green-800">Activo</Badge>;
  };

  const getUsersProgress = () => (usage.currentUsers / planConfig.features.maxUsers) * 100;
  const getMessagesProgress = () => (usage.currentMessages / planConfig.features.maxMessages) * 100;

  const shouldShowUpgradeAlert = () => {
    return usage.limitsExceeded || currentPlan === SubscriptionPlan.FREE || isPastDue || isExpired;
  };

  return (
    <div className="space-y-6">
      {/* Estado de Suscripción */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Plan Actual</CardTitle>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{planConfig.name}</h3>
              <p className="text-sm text-gray-600">{planConfig.description}</p>
            </div>
            {onUpgrade && currentPlan !== SubscriptionPlan.ENTERPRISE && (
              <Button onClick={onUpgrade} variant="outline">
                Actualizar Plan
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Información de fechas */}
            {subscription && (
              <div className="space-y-2">
                {isTrialing && subscription.trialEnd && (
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                    <span>Prueba termina: {format(subscription.trialEnd, 'dd MMM yyyy', { locale: es })}</span>
                  </div>
                )}
                {!isTrialing && (
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    <span>
                      {subscription.cancelAtPeriodEnd ? 'Termina' : 'Renueva'}: {' '}
                      {format(subscription.currentPeriodEnd, 'dd MMM yyyy', { locale: es })}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Botón de gestión */}
            {onManageBilling && currentPlan !== SubscriptionPlan.FREE && (
              <div className="flex justify-end">
                <Button onClick={onManageBilling} variant="ghost" size="sm">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Gestionar Facturación
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alertas */}
      {shouldShowUpgradeAlert() && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-amber-800">
                  {isPastDue ? 'Pago Pendiente' :
                   isExpired ? 'Suscripción Expirada' :
                   usage.limitsExceeded ? 'Límites Excedidos' :
                   'Actualiza tu Plan'}
                </h4>
                <p className="text-sm text-amber-700 mt-1">
                  {isPastDue ? 'Tu pago no pudo procesarse. Actualiza tu método de pago para evitar la interrupción del servicio.' :
                   isExpired ? 'Tu suscripción ha expirado. Reactívala para continuar usando todas las funcionalidades.' :
                   usage.limitsExceeded ? 'Has excedido los límites de tu plan actual. Considera actualizar para continuar sin restricciones.' :
                   'Obtén más usuarios, mensajes y funcionalidades avanzadas con un plan superior.'}
                </p>
                {onUpgrade && (
                  <Button onClick={onUpgrade} size="sm" className="mt-3">
                    {isPastDue || isExpired ? 'Reactivar Plan' : 'Ver Planes'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uso Actual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Uso Actual</CardTitle>
          {usage.resetDate && (
            <p className="text-sm text-gray-500">
              Los límites se reinician el {format(usage.resetDate, 'dd MMM yyyy', { locale: es })}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Usuarios */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium">Usuarios</span>
              </div>
              <span className="text-sm text-gray-600">
                {usage.currentUsers} / {planConfig.features.maxUsers}
              </span>
            </div>
            <Progress 
              value={getUsersProgress()} 
              className={`h-2 ${usage.currentUsers > planConfig.features.maxUsers ? 'bg-red-100' : ''}`}
            />
          </div>

          {/* Mensajes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium">Mensajes</span>
              </div>
              <span className="text-sm text-gray-600">
                {usage.currentMessages.toLocaleString()} / {planConfig.features.maxMessages.toLocaleString()}
              </span>
            </div>
            <Progress 
              value={getMessagesProgress()} 
              className={`h-2 ${usage.currentMessages > planConfig.features.maxMessages ? 'bg-red-100' : ''}`}
            />
          </div>

          {/* Integraciones */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium">Integraciones</span>
              </div>
              <span className="text-sm text-gray-600">
                {usage.currentIntegrations} / {planConfig.features.maxIntegrations}
              </span>
            </div>
            <Progress 
              value={(usage.currentIntegrations / planConfig.features.maxIntegrations) * 100} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
