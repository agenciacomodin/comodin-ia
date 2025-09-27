
import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { SubscriptionManager } from '@/components/subscription/subscription-manager';
import { SubscriptionService } from '@/lib/subscription-service';

export default async function SubscriptionPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Solo los Propietarios pueden gestionar suscripciones
  if (session.user.role !== 'PROPIETARIO') {
    redirect('/dashboard');
  }

  // Cargar datos de suscripción
  let subscriptionData = null;
  try {
    subscriptionData = await SubscriptionService.getSubscriptionDetails(session.user.organizationId!);
  } catch (error) {
    console.error('Error loading subscription data:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SubscriptionManager initialData={subscriptionData} />
    </div>
  );
}
