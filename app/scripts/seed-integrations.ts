
import { PrismaClient, IntegrationType, EcommercePlatform } from '@prisma/client'
import * as dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

const prisma = new PrismaClient()

const integrations = [
  {
    name: 'shopify',
    displayName: 'Shopify',
    description: 'Conecta tu tienda Shopify para consultar productos, pedidos e inventario en tiempo real',
    type: IntegrationType.ECOMMERCE,
    platform: EcommercePlatform.SHOPIFY,
    apiUrl: 'https://{{shop_domain}}/admin/api/2023-10',
    authType: 'oauth',
    authFields: ['shop_domain', 'access_token'],
    supportedFeatures: ['products', 'orders', 'customers', 'inventory'],
    iconUrl: '/integrations/shopify.svg',
    brandColor: '#7AB55C',
    documentation: 'https://docs.shopify.com/api',
    isActive: true,
    version: '1.0'
  },
  {
    name: 'woocommerce',
    displayName: 'WooCommerce',
    description: 'Conecta tu tienda WooCommerce para gestionar productos y pedidos',
    type: 'ECOMMERCE',
    platform: 'WOOCOMMERCE',
    apiUrl: '{{site_url}}/wp-json/wc/v3',
    authType: 'api_key',
    authFields: ['site_url', 'consumer_key', 'consumer_secret'],
    supportedFeatures: ['products', 'orders', 'customers'],
    iconUrl: '/integrations/woocommerce.svg',
    brandColor: '#7F54B3',
    documentation: 'https://woocommerce.github.io/woocommerce-rest-api-docs/',
    isActive: true,
    version: '1.0'
  },
  {
    name: 'tiendanube',
    displayName: 'TiendaNube',
    description: 'Conecta tu tienda TiendaNube para sincronizar catálogo y pedidos',
    type: 'ECOMMERCE',
    platform: 'TIENDANUBE',
    apiUrl: 'https://api.tiendanube.com/v1/{{store_id}}',
    authType: 'oauth',
    authFields: ['store_id', 'access_token'],
    supportedFeatures: ['products', 'orders', 'customers'],
    iconUrl: '/integrations/tiendanube.svg',
    brandColor: '#FF6900',
    documentation: 'https://developers.tiendanube.com/',
    isActive: true,
    version: '1.0'
  },
  {
    name: 'magento',
    displayName: 'Magento',
    description: 'Conecta tu tienda Magento para gestionar catálogo y ventas',
    type: 'ECOMMERCE',
    platform: 'MAGENTO',
    apiUrl: '{{site_url}}/rest/V1',
    authType: 'api_key',
    authFields: ['site_url', 'access_token'],
    supportedFeatures: ['products', 'orders', 'customers'],
    iconUrl: '/integrations/magento.svg',
    brandColor: '#EE672F',
    documentation: 'https://devdocs.magento.com/guides/v2.4/rest/bk-rest.html',
    isActive: true,
    version: '1.0'
  },
  {
    name: 'prestashop',
    displayName: 'PrestaShop',
    description: 'Conecta tu tienda PrestaShop para consultas de productos y pedidos',
    type: 'ECOMMERCE',
    platform: 'PRESTASHOP',
    apiUrl: '{{site_url}}/api',
    authType: 'api_key',
    authFields: ['site_url', 'api_key'],
    supportedFeatures: ['products', 'orders', 'customers'],
    iconUrl: '/integrations/prestashop.svg',
    brandColor: '#DF0067',
    documentation: 'https://devdocs.prestashop.com/1.7/webservice/',
    isActive: true,
    version: '1.0'
  },
  // Placeholder para futuras integraciones CRM
  {
    name: 'hubspot',
    displayName: 'HubSpot',
    description: 'Integra con HubSpot CRM para sincronizar contactos y oportunidades',
    type: 'CRM',
    platform: null,
    apiUrl: 'https://api.hubapi.com',
    authType: 'oauth',
    authFields: ['access_token'],
    supportedFeatures: ['contacts', 'deals', 'companies'],
    iconUrl: '/integrations/hubspot.svg',
    brandColor: '#FF5C35',
    documentation: 'https://developers.hubspot.com/docs/api/overview',
    isActive: false, // Desactivado por ahora
    version: '1.0'
  },
  // Placeholder para futuras integraciones Analytics
  {
    name: 'google_analytics',
    displayName: 'Google Analytics',
    description: 'Conecta con Google Analytics para obtener métricas de tu sitio web',
    type: 'ANALYTICS',
    platform: null,
    apiUrl: 'https://analyticsreporting.googleapis.com/v4',
    authType: 'oauth',
    authFields: ['client_id', 'client_secret', 'refresh_token'],
    supportedFeatures: ['website_traffic', 'conversions', 'user_behavior'],
    iconUrl: '/integrations/google-analytics.svg',
    brandColor: '#4285F4',
    documentation: 'https://developers.google.com/analytics',
    isActive: false, // Desactivado por ahora
    version: '1.0'
  }
]

async function seedIntegrations() {
  console.log('🌱 Iniciando seeding de integraciones...')
  
  try {
    for (const integration of integrations) {
      // Verificar si la integración ya existe
      const existing = await prisma.integration.findFirst({
        where: { name: integration.name }
      })

      if (existing) {
        console.log(`⏭️  Integración ${integration.displayName} ya existe, saltando...`)
        continue
      }

      // Crear la integración
      await prisma.integration.create({
        data: {
          ...integration,
          authFields: JSON.stringify(integration.authFields),
          supportedFeatures: JSON.stringify(integration.supportedFeatures)
        }
      })

      console.log(`✅ Creada integración: ${integration.displayName}`)
    }

    console.log('🎉 Seeding de integraciones completado exitosamente!')
  } catch (error) {
    console.error('❌ Error durante el seeding de integraciones:', error)
    throw error
  }
}

async function main() {
  try {
    await seedIntegrations()
  } catch (error) {
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main()
}

export { seedIntegrations }
