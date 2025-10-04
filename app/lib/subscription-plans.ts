
import { SubscriptionPlan } from '@prisma/client';

export interface PlanFeatures {
  maxUsers: number;
  maxMessages: number;
  maxIntegrations: number;
  hasAdvancedFeatures: boolean;
  hasAnalytics: boolean;
  hasAutomation: boolean;
  hasAPIAccess: boolean;
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
}

export interface PlanPricing {
  monthly: {
    usd: number;
    mxn: number;
    ars: number;
  };
  yearly: {
    usd: number;
    mxn: number;
    ars: number;
  };
}

export interface SubscriptionPlanConfig {
  id: SubscriptionPlan;
  name: string;
  description: string;
  features: PlanFeatures;
  pricing: PlanPricing;
  popular?: boolean;
  stripePriceIds?: {
    monthly: Record<string, string>;
    yearly: Record<string, string>;
  };
  mercadoPagoPlanIds?: {
    monthly: Record<string, string>;
    yearly: Record<string, string>;
  };
}

// Configuración de los 4 planes de COMODÍN IA
export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, SubscriptionPlanConfig> = {
  [SubscriptionPlan.FREE]: {
    id: SubscriptionPlan.FREE,
    name: 'Gratuito',
    description: 'Para probar COMODÍN IA y comenzar a organizar tus comunicaciones',
    features: {
      maxUsers: 1,
      maxMessages: 100,
      maxIntegrations: 1,
      hasAdvancedFeatures: false,
      hasAnalytics: false,
      hasAutomation: false,
      hasAPIAccess: false,
      supportLevel: 'community'
    },
    pricing: {
      monthly: { usd: 0, mxn: 0, ars: 0 },
      yearly: { usd: 0, mxn: 0, ars: 0 }
    }
  },

  [SubscriptionPlan.STARTER]: {
    id: SubscriptionPlan.STARTER,
    name: 'Emprendedor',
    description: 'Perfecto para pequeños negocios que están comenzando',
    features: {
      maxUsers: 3,
      maxMessages: 1000,
      maxIntegrations: 3,
      hasAdvancedFeatures: true,
      hasAnalytics: true,
      hasAutomation: false,
      hasAPIAccess: false,
      supportLevel: 'email'
    },
    pricing: {
      monthly: { usd: 29, mxn: 499, ars: 8900 },
      yearly: { usd: 290, mxn: 4990, ars: 89000 }
    },
    popular: true
  },

  [SubscriptionPlan.PREMIUM]: {
    id: SubscriptionPlan.PREMIUM,
    name: 'Profesional',
    description: 'Para equipos que necesitan funcionalidades avanzadas y automatización',
    features: {
      maxUsers: 10,
      maxMessages: 5000,
      maxIntegrations: 10,
      hasAdvancedFeatures: true,
      hasAnalytics: true,
      hasAutomation: true,
      hasAPIAccess: true,
      supportLevel: 'priority'
    },
    pricing: {
      monthly: { usd: 79, mxn: 1399, ars: 24900 },
      yearly: { usd: 790, mxn: 13990, ars: 249000 }
    }
  },

  [SubscriptionPlan.ENTERPRISE]: {
    id: SubscriptionPlan.ENTERPRISE,
    name: 'Empresarial',
    description: 'Para organizaciones grandes con necesidades específicas y soporte dedicado',
    features: {
      maxUsers: 50,
      maxMessages: 20000,
      maxIntegrations: 50,
      hasAdvancedFeatures: true,
      hasAnalytics: true,
      hasAutomation: true,
      hasAPIAccess: true,
      supportLevel: 'dedicated'
    },
    pricing: {
      monthly: { usd: 199, mxn: 3499, ars: 62900 },
      yearly: { usd: 1990, mxn: 34990, ars: 629000 }
    }
  }
};

// Función para obtener el plan por ID
export function getPlanConfig(planId: SubscriptionPlan): SubscriptionPlanConfig {
  return SUBSCRIPTION_PLANS[planId];
}

// Función para obtener todos los planes ordenados por precio
export function getAllPlans(): SubscriptionPlanConfig[] {
  return Object.values(SUBSCRIPTION_PLANS).sort((a, b) => 
    a.pricing.monthly.usd - b.pricing.monthly.usd
  );
}

// Función para validar límites de uso
export function validateUsageLimits(
  plan: SubscriptionPlan, 
  currentUsers: number, 
  currentMessages: number, 
  currentIntegrations: number
): { 
  usersExceeded: boolean; 
  messagesExceeded: boolean; 
  integrationsExceeded: boolean; 
} {
  const config = getPlanConfig(plan);
  
  return {
    usersExceeded: currentUsers > config.features.maxUsers,
    messagesExceeded: currentMessages > config.features.maxMessages,
    integrationsExceeded: currentIntegrations > config.features.maxIntegrations
  };
}

// Función para calcular el precio por moneda y ciclo
export function getPlanPrice(
  plan: SubscriptionPlan, 
  currency: 'usd' | 'mxn' | 'ars', 
  billing: 'monthly' | 'yearly'
): number {
  const config = getPlanConfig(plan);
  return config.pricing[billing][currency];
}
