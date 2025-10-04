
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { SubscriptionService } from './subscription-service';
import { SubscriptionPlan } from '@prisma/client';

// Rutas que requieren verificación de suscripción
const PROTECTED_ROUTES = [
  '/api/messages',
  '/api/integrations',
  '/api/analytics',
  '/api/automation',
  '/dashboard/analytics',
  '/dashboard/automation',
  '/dashboard/integrations'
];

// Funcionalidades que requieren planes específicos
const FEATURE_REQUIREMENTS = {
  '/api/analytics': [SubscriptionPlan.STARTER, SubscriptionPlan.PREMIUM, SubscriptionPlan.ENTERPRISE],
  '/api/automation': [SubscriptionPlan.PREMIUM, SubscriptionPlan.ENTERPRISE],
  '/dashboard/analytics': [SubscriptionPlan.STARTER, SubscriptionPlan.PREMIUM, SubscriptionPlan.ENTERPRISE],
  '/dashboard/automation': [SubscriptionPlan.PREMIUM, SubscriptionPlan.ENTERPRISE],
  '/dashboard/integrations': [SubscriptionPlan.STARTER, SubscriptionPlan.PREMIUM, SubscriptionPlan.ENTERPRISE]
};

export async function subscriptionMiddleware(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    
    if (!token?.organizationId) {
      return NextResponse.next();
    }

    const pathname = request.nextUrl.pathname;
    
    // Verificar si la ruta necesita validación de suscripción
    const needsValidation = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    
    if (!needsValidation) {
      return NextResponse.next();
    }

    // Validar acceso de suscripción
    const accessValidation = await SubscriptionService.validateSubscriptionAccess(token.organizationId);
    
    if (!accessValidation.hasAccess) {
      // Redirigir según el tipo de restricción
      if (accessValidation.reason === 'Usage limits exceeded') {
        return NextResponse.json(
          { 
            error: 'Usage limits exceeded', 
            message: 'Has excedido los límites de tu plan actual. Actualiza para continuar.',
            upgradeUrl: '/suscripcion'
          }, 
          { status: 429 }
        );
      } else if (accessValidation.reason === 'No active subscription' || accessValidation.reason === 'Subscription expired') {
        return NextResponse.json(
          { 
            error: 'Subscription required', 
            message: 'Necesitas una suscripción activa para acceder a esta funcionalidad.',
            upgradeUrl: '/suscripcion'
          }, 
          { status: 402 }
        );
      } else {
        return NextResponse.json(
          { 
            error: 'Access denied', 
            message: 'No tienes acceso a esta funcionalidad.' 
          }, 
          { status: 403 }
        );
      }
    }

    // Verificar si la funcionalidad específica está permitida en el plan actual
    const requiredPlans = FEATURE_REQUIREMENTS[pathname as keyof typeof FEATURE_REQUIREMENTS];
    
    if (requiredPlans) {
      const organization = await SubscriptionService.getSubscriptionDetails(token.organizationId);
      const currentPlan = organization.organization.currentPlan;
      
      if (!requiredPlans.includes(currentPlan as any)) {
        return NextResponse.json(
          { 
            error: 'Plan upgrade required', 
            message: `Esta funcionalidad requiere un plan ${requiredPlans[0]} o superior.`,
            currentPlan,
            requiredPlans,
            upgradeUrl: '/suscripcion'
          }, 
          { status: 402 }
        );
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Subscription middleware error:', error);
    return NextResponse.next();
  }
}

// Función para incrementar el uso de mensajes (para usar en APIs de mensajería)
export async function incrementMessageUsage(organizationId: string) {
  try {
    await SubscriptionService.incrementMessageUsage(organizationId, 1);
  } catch (error) {
    console.error('Error incrementing message usage:', error);
  }
}

// Función para verificar si una funcionalidad está disponible
export async function checkFeatureAvailability(organizationId: string, feature: string): Promise<boolean> {
  try {
    const subscriptionData = await SubscriptionService.getSubscriptionDetails(organizationId);
    const planConfig = subscriptionData.planConfig;
    
    switch (feature) {
      case 'analytics':
        return planConfig.features.hasAnalytics;
      case 'automation':
        return planConfig.features.hasAutomation;
      case 'api_access':
        return planConfig.features.hasAPIAccess;
      case 'advanced_features':
        return planConfig.features.hasAdvancedFeatures;
      default:
        return true;
    }
  } catch (error) {
    console.error('Error checking feature availability:', error);
    return false;
  }
}
