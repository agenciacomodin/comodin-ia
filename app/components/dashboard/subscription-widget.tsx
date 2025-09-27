
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingUp, Users, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { SubscriptionPlan } from '@prisma/client';

interface SubscriptionWidgetProps {
  organizationId: string;
  userRole: string;
}

interface SubscriptionWidgetData {
  currentPlan: SubscriptionPlan;
  planName: string;
  usage: {
    currentUsers: number;
    maxUsers: number;
    currentMessages: number;
    maxMessages: number;
    limitsExceeded: boolean;
  };
  needsAttention: boolean;
}

export function SubscriptionWidget({ organizationId, userRole }: SubscriptionWidgetProps) {
  const [data, setData] = useState<SubscriptionWidgetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionData();
  }, [organizationId]);

  const fetchSubscriptionData = async () => {
    try {
      const [subscriptionResponse, usageResponse] = await Promise.all([
        fetch('/api/subscriptions'),
        fetch('/api/subscriptions/usage')
      ]);

      if (subscriptionResponse.ok && usageResponse.ok) {
        const subscriptionData = await subscriptionResponse.json();
        const usageData = await usageResponse.json();

        const planConfig = subscriptionData.planConfig;
        
        setData({
          currentPlan: subscriptionData.organization.currentPlan,
          planName: planConfig.name,
          usage: {
            currentUsers: usageData.currentUsers,
            maxUsers: planConfig.features.maxUsers,
            currentMessages: usageData.currentMessages,
            maxMessages: planConfig.features.maxMessages,
            limitsExceeded: usageData.limitsExceeded
          },
          needsAttention: usageData.limitsExceeded || subscriptionData.organization.currentPlan === 'FREE'
        });
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium">Suscripción</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium">Suscripción</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Error al cargar datos de suscripción</p>
        </CardContent>
      </Card>
    );
  }

  const getPlanBadgeVariant = (plan: SubscriptionPlan) => {
    switch (plan) {
      case 'FREE': return 'secondary';
      case 'STARTER': return 'default';
      case 'PREMIUM': return 'default';
      case 'ENTERPRISE': return 'default';
      default: return 'secondary';
    }
  };

  const getUsersProgress = () => (data.usage.currentUsers / data.usage.maxUsers) * 100;
  const getMessagesProgress = () => (data.usage.currentMessages / data.usage.maxMessages) * 100;

  return (
    <Card className={data.needsAttention ? 'border-amber-200 bg-amber-50' : ''}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Plan Actual</CardTitle>
          <Badge variant={getPlanBadgeVariant(data.currentPlan)}>
            {data.planName}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {data.needsAttention && (
          <div className="flex items-center space-x-2 text-amber-700 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>
              {data.usage.limitsExceeded ? 'Límites excedidos' : 'Considera actualizar tu plan'}
            </span>
          </div>
        )}

        <div className="space-y-3">
          {/* Usuarios */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center text-xs text-gray-600">
                <Users className="w-3 h-3 mr-1" />
                Usuarios
              </div>
              <span className="text-xs text-gray-500">
                {data.usage.currentUsers}/{data.usage.maxUsers}
              </span>
            </div>
            <Progress 
              value={getUsersProgress()} 
              className={`h-1 ${data.usage.currentUsers > data.usage.maxUsers ? 'bg-red-100' : ''}`}
            />
          </div>

          {/* Mensajes */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center text-xs text-gray-600">
                <MessageSquare className="w-3 h-3 mr-1" />
                Mensajes
              </div>
              <span className="text-xs text-gray-500">
                {data.usage.currentMessages.toLocaleString()}/{data.usage.maxMessages.toLocaleString()}
              </span>
            </div>
            <Progress 
              value={getMessagesProgress()} 
              className={`h-1 ${data.usage.currentMessages > data.usage.maxMessages ? 'bg-red-100' : ''}`}
            />
          </div>
        </div>

        {/* Solo mostrar botón a Propietarios */}
        {userRole === 'PROPIETARIO' && (
          <div className="pt-2">
            <Link href="/suscripcion">
              <Button size="sm" variant="outline" className="w-full">
                <TrendingUp className="w-3 h-3 mr-1" />
                Gestionar Plan
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
