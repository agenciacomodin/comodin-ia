
import { PrismaClient, IntegrationType, EcommercePlatform, SupportServiceType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Sembrando integraciones y servicios extras...')

  // Crear integraciones predeterminadas
  const integrations = [
    {
      name: 'shopify',
      displayName: 'Shopify',
      description: 'Conecta tu tienda Shopify para sincronizar productos, pedidos y clientes automáticamente con COMODÍN IA',
      type: IntegrationType.ECOMMERCE,
      platform: EcommercePlatform.SHOPIFY,
      authType: 'api_key',
      authFields: {
        shop_domain: {
          label: 'Dominio de la tienda',
          type: 'text',
          placeholder: 'mi-tienda.myshopify.com',
          required: true,
          description: 'Introduce el dominio de tu tienda Shopify'
        },
        access_token: {
          label: 'Token de acceso',
          type: 'password',
          placeholder: 'shpat_xxxxx',
          required: true,
          description: 'Token de acceso privado de Shopify'
        }
      },
      supportedFeatures: {
        sync_products: 'Sincronización de productos',
        sync_orders: 'Sincronización de pedidos',
        sync_customers: 'Sincronización de clientes',
        webhooks: 'Notificaciones en tiempo real',
        inventory: 'Control de inventario'
      },
      brandColor: '#96BF48',
      documentation: 'https://help.shopify.com/en/api'
    },
    {
      name: 'woocommerce',
      displayName: 'WooCommerce',
      description: 'Integra tu tienda WooCommerce para gestionar productos y pedidos directamente desde WhatsApp',
      type: IntegrationType.ECOMMERCE,
      platform: EcommercePlatform.WOOCOMMERCE,
      authType: 'api_key',
      authFields: {
        site_url: {
          label: 'URL del sitio',
          type: 'text',
          placeholder: 'https://mi-tienda.com',
          required: true,
          description: 'URL completa de tu sitio WooCommerce'
        },
        consumer_key: {
          label: 'Consumer Key',
          type: 'text',
          placeholder: 'ck_xxxxx',
          required: true,
          description: 'Consumer Key de la API de WooCommerce'
        },
        consumer_secret: {
          label: 'Consumer Secret',
          type: 'password',
          placeholder: 'cs_xxxxx',
          required: true,
          description: 'Consumer Secret de la API de WooCommerce'
        }
      },
      supportedFeatures: {
        sync_products: 'Sincronización de productos',
        sync_orders: 'Sincronización de pedidos',
        sync_customers: 'Sincronización de clientes',
        inventory: 'Control de inventario',
        categories: 'Gestión de categorías'
      },
      brandColor: '#96588A',
      documentation: 'https://woocommerce.github.io/woocommerce-rest-api-docs/'
    },
    {
      name: 'stripe',
      displayName: 'Stripe',
      description: 'Procesa pagos seguros y gestiona suscripciones directamente desde WhatsApp con total seguridad',
      type: IntegrationType.PAYMENT,
      authType: 'api_key',
      authFields: {
        publishable_key: {
          label: 'Clave pública',
          type: 'text',
          placeholder: 'pk_live_xxxxx',
          required: true,
          description: 'Clave pública de Stripe'
        },
        secret_key: {
          label: 'Clave secreta',
          type: 'password',
          placeholder: 'sk_live_xxxxx',
          required: true,
          description: 'Clave secreta de Stripe'
        },
        webhook_secret: {
          label: 'Webhook Secret',
          type: 'password',
          placeholder: 'whsec_xxxxx',
          required: false,
          description: 'Secret para validar webhooks de Stripe'
        }
      },
      supportedFeatures: {
        payments: 'Procesamiento de pagos',
        subscriptions: 'Gestión de suscripciones',
        invoices: 'Facturación automática',
        webhooks: 'Notificaciones de eventos',
        refunds: 'Gestión de reembolsos'
      },
      brandColor: '#635BFF',
      documentation: 'https://stripe.com/docs/api'
    },
    {
      name: 'google_analytics',
      displayName: 'Google Analytics',
      description: 'Rastrea conversiones y analiza el comportamiento de tus clientes desde WhatsApp con métricas avanzadas',
      type: 'ANALYTICS',
      authType: 'oauth',
      authFields: {
        measurement_id: {
          label: 'Measurement ID',
          type: 'text',
          placeholder: 'G-XXXXXXXXXX',
          required: true,
          description: 'ID de medición de Google Analytics 4'
        },
        api_secret: {
          label: 'API Secret',
          type: 'password',
          placeholder: 'xxxxx',
          required: true,
          description: 'API Secret para enviar eventos'
        }
      },
      supportedFeatures: {
        events: 'Seguimiento de eventos',
        conversions: 'Seguimiento de conversiones',
        ecommerce: 'Ecommerce tracking',
        custom_dimensions: 'Dimensiones personalizadas',
        goals: 'Configuración de objetivos'
      },
      brandColor: '#FF6F00',
      documentation: 'https://developers.google.com/analytics/devguides/collection/ga4'
    },
    {
      name: 'mailchimp',
      displayName: 'Mailchimp',
      description: 'Sincroniza contactos y automatiza campañas de email marketing basadas en conversaciones de WhatsApp',
      type: 'EMAIL',
      authType: 'api_key',
      authFields: {
        api_key: {
          label: 'API Key',
          type: 'password',
          placeholder: 'xxxxx-us1',
          required: true,
          description: 'API Key de Mailchimp'
        },
        server: {
          label: 'Servidor',
          type: 'text',
          placeholder: 'us1',
          required: true,
          description: 'Prefijo del servidor (ej: us1, us2, etc.)'
        }
      },
      supportedFeatures: {
        sync_contacts: 'Sincronización de contactos',
        campaigns: 'Gestión de campañas',
        automation: 'Automatización de marketing',
        segmentation: 'Segmentación de audiencias',
        templates: 'Plantillas de email'
      },
      brandColor: '#FFE01B',
      documentation: 'https://mailchimp.com/developer/marketing/'
    }
  ]

  for (const integration of integrations) {
    await prisma.integration.upsert({
      where: { name: integration.name },
      update: integration,
      create: integration
    })
  }

  console.log(`✅ ${integrations.length} integraciones creadas/actualizadas`)

  // Crear servicios extras
  const extraServices = [
    {
      name: 'integration_support',
      displayName: 'Tickets de Soporte para Integraciones',
      description: 'Soporte técnico especializado para configuración y resolución de problemas con integraciones de terceros',
      type: SupportServiceType.INTEGRATION_SUPPORT,
      price: 20.0,
      currency: 'USD',
      estimatedHours: 2,
      deliveryDays: 1,
      requirements: {
        'access_credentials': 'Credenciales de acceso a las plataformas',
        'error_details': 'Detalles específicos del error o problema',
        'integration_type': 'Tipo de integración (Shopify, WooCommerce, etc.)',
        'expected_behavior': 'Comportamiento esperado'
      },
      deliverables: {
        'integration_fixed': 'Integración funcionando correctamente',
        'documentation': 'Documentación del problema y solución',
        'testing_report': 'Reporte de pruebas realizadas',
        'configuration_backup': 'Respaldo de configuración'
      },
      tags: ['soporte', 'integraciones', 'técnico'],
      skillsRequired: ['API Integration', 'Troubleshooting', 'E-commerce Platforms']
    },
    {
      name: 'technical_solution',
      displayName: 'Solución Técnica Personalizada',
      description: 'Desarrollo de soluciones técnicas personalizadas para casos específicos o funcionalidades avanzadas',
      type: 'TECHNICAL_SOLUTION',
      price: 50.0,
      currency: 'USD',
      estimatedHours: 4,
      deliveryDays: 3,
      requirements: {
        'requirements_document': 'Documento detallado de requerimientos',
        'system_access': 'Acceso al sistema si es necesario',
        'mockups_wireframes': 'Mockups o wireframes si aplica',
        'deadline': 'Fecha límite esperada'
      },
      deliverables: {
        'custom_solution': 'Solución técnica implementada',
        'source_code': 'Código fuente documentado',
        'user_manual': 'Manual de usuario',
        'maintenance_guide': 'Guía de mantenimiento'
      },
      tags: ['desarrollo', 'personalización', 'solución técnica'],
      skillsRequired: ['Full Stack Development', 'System Architecture', 'Custom Solutions']
    },
    {
      name: 'configuration_help',
      displayName: 'Ayuda con Configuración Avanzada',
      description: 'Asistencia especializada para configurar funcionalidades avanzadas del sistema COMODÍN IA',
      type: 'CONFIGURATION_HELP',
      price: 15.0,
      currency: 'USD',
      estimatedHours: 1,
      deliveryDays: 1,
      requirements: {
        'current_setup': 'Configuración actual del sistema',
        'desired_outcome': 'Resultado deseado',
        'business_context': 'Contexto del negocio',
        'user_level': 'Nivel técnico del usuario'
      },
      deliverables: {
        'system_configured': 'Sistema configurado según requerimientos',
        'configuration_guide': 'Guía de configuración paso a paso',
        'best_practices': 'Mejores prácticas recomendadas',
        'follow_up_support': 'Soporte de seguimiento por 7 días'
      },
      tags: ['configuración', 'setup', 'optimización'],
      skillsRequired: ['System Configuration', 'User Training', 'Best Practices']
    },
    {
      name: 'training_session',
      displayName: 'Sesión de Entrenamiento Personalizado',
      description: 'Sesiones de entrenamiento uno-a-uno para maximizar el uso de COMODÍN IA en tu negocio',
      type: 'TRAINING',
      price: 30.0,
      currency: 'USD',
      estimatedHours: 2,
      deliveryDays: 1,
      requirements: {
        'team_size': 'Número de participantes',
        'current_knowledge': 'Nivel actual de conocimiento',
        'focus_areas': 'Áreas específicas de interés',
        'preferred_schedule': 'Horario preferido para la sesión'
      },
      deliverables: {
        'training_session': 'Sesión de entrenamiento personalizada',
        'training_materials': 'Materiales de capacitación',
        'action_plan': 'Plan de acción personalizado',
        'qa_session': 'Sesión de preguntas y respuestas'
      },
      tags: ['entrenamiento', 'capacitación', 'onboarding'],
      skillsRequired: ['Training', 'Communication', 'Business Analysis']
    },
    {
      name: 'custom_development',
      displayName: 'Desarrollo Personalizado Avanzado',
      description: 'Desarrollo de funcionalidades completamente personalizadas según las necesidades específicas del negocio',
      type: 'CUSTOM_DEVELOPMENT',
      price: 100.0,
      currency: 'USD',
      estimatedHours: 8,
      deliveryDays: 7,
      requirements: {
        'detailed_specifications': 'Especificaciones detalladas del proyecto',
        'mockups_designs': 'Mockups y diseños aprobados',
        'integration_requirements': 'Requerimientos de integración',
        'testing_criteria': 'Criterios de aceptación y testing'
      },
      deliverables: {
        'custom_feature': 'Funcionalidad personalizada desarrollada',
        'documentation': 'Documentación técnica completa',
        'testing_suite': 'Suite de pruebas automatizadas',
        'deployment_guide': 'Guía de despliegue',
        'maintenance_support': 'Soporte de mantenimiento por 30 días'
      },
      tags: ['desarrollo', 'personalización', 'feature custom'],
      skillsRequired: ['Advanced Development', 'System Architecture', 'Project Management']
    }
  ]

  for (const service of extraServices) {
    await prisma.extraService.upsert({
      where: { name: service.name },
      update: service,
      create: service
    })
  }

  console.log(`✅ ${extraServices.length} servicios extras creados/actualizados`)

  console.log('🎉 Semilla completada exitosamente!')
}

main()
  .catch((e) => {
    console.error('❌ Error al sembrar:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
