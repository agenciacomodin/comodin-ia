
/**
 * Servicio para manejar consultas a plataformas de e-commerce
 * Este servicio será usado por el AI Broker para responder preguntas sobre productos, pedidos, etc.
 */

import { prisma } from '@/lib/db'
import { EcommerceProduct, EcommerceOrder, EcommerceCustomer, EcommerceQuery } from '@/lib/types'

export class EcommerceService {
  /**
   * Ejecutar una consulta de e-commerce basada en la intención del usuario
   */
  static async executeQuery(
    organizationId: string,
    query: EcommerceQuery
  ): Promise<any> {
    // Obtener conexiones activas de e-commerce para la organización
    const connections = await prisma.organizationIntegration.findMany({
      where: {
        organizationId,
        integration: {
          type: 'ECOMMERCE'
        },
        status: 'CONNECTED'
      },
      include: {
        integration: true
      }
    })

    if (connections.length === 0) {
      throw new Error('No hay tiendas conectadas')
    }

    // Por ahora, usar la primera conexión activa
    // En el futuro, podríamos permitir al usuario especificar qué tienda
    const connection = connections[0]
    
    switch (query.type) {
      case 'product':
        return await this.queryProducts(connection, query.params)
      case 'order':
        return await this.queryOrders(connection, query.params)
      case 'customer':
        return await this.queryCustomers(connection, query.params)
      case 'inventory':
        return await this.queryInventory(connection, query.params)
      default:
        throw new Error('Tipo de consulta no soportado')
    }
  }

  /**
   * Buscar productos en la tienda
   */
  private static async queryProducts(
    connection: any, 
    params: any
  ): Promise<EcommerceProduct[]> {
    const credentials = JSON.parse(connection.credentials)
    const platform = connection.integration.platform

    switch (platform) {
      case 'SHOPIFY':
        return await this.queryShopifyProducts(credentials, params)
      case 'WOOCOMMERCE':
        return await this.queryWooCommerceProducts(credentials, params)
      case 'TIENDANUBE':
        return await this.queryTiendaNubeProducts(credentials, params)
      default:
        throw new Error('Plataforma no soportada')
    }
  }

  /**
   * Buscar pedidos en la tienda
   */
  private static async queryOrders(
    connection: any,
    params: any
  ): Promise<EcommerceOrder[]> {
    const credentials = JSON.parse(connection.credentials)
    const platform = connection.integration.platform

    switch (platform) {
      case 'SHOPIFY':
        return await this.queryShopifyOrders(credentials, params)
      case 'WOOCOMMERCE':
        return await this.queryWooCommerceOrders(credentials, params)
      case 'TIENDANUBE':
        return await this.queryTiendaNubeOrders(credentials, params)
      default:
        throw new Error('Plataforma no soportada')
    }
  }

  /**
   * Buscar clientes en la tienda
   */
  private static async queryCustomers(
    connection: any,
    params: any
  ): Promise<EcommerceCustomer[]> {
    const credentials = JSON.parse(connection.credentials)
    const platform = connection.integration.platform

    switch (platform) {
      case 'SHOPIFY':
        return await this.queryShopifyCustomers(credentials, params)
      case 'WOOCOMMERCE':
        return await this.queryWooCommerceCustomers(credentials, params)
      case 'TIENDANUBE':
        return await this.queryTiendaNubeCustomers(credentials, params)
      default:
        throw new Error('Plataforma no soportada')
    }
  }

  /**
   * Consultar inventario
   */
  private static async queryInventory(
    connection: any,
    params: any
  ): Promise<any> {
    const credentials = JSON.parse(connection.credentials)
    const platform = connection.integration.platform

    // Similar implementación para inventario
    switch (platform) {
      case 'SHOPIFY':
        return await this.queryShopifyInventory(credentials, params)
      default:
        throw new Error('Consulta de inventario no soportada para esta plataforma')
    }
  }

  // =============================================================================
  // IMPLEMENTACIONES ESPECÍFICAS POR PLATAFORMA
  // =============================================================================

  /**
   * Consultar productos en Shopify
   */
  private static async queryShopifyProducts(
    credentials: any,
    params: any
  ): Promise<EcommerceProduct[]> {
    const { shop_domain, access_token } = credentials
    
    // Construir parámetros de búsqueda
    const searchParams = new URLSearchParams()
    if (params.search) {
      searchParams.append('title', params.search)
    }
    if (params.status) {
      searchParams.append('status', params.status)
    }
    searchParams.append('limit', params.limit || '10')

    const url = `https://${shop_domain}/admin/api/2023-10/products.json?${searchParams}`
    
    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': access_token,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Error consultando productos de Shopify: ${response.statusText}`)
    }

    const data = await response.json()
    
    return data.products.map((product: any) => ({
      id: product.id.toString(),
      name: product.title,
      description: product.body_html,
      price: product.variants?.[0]?.price ? parseFloat(product.variants[0].price) : 0,
      currency: 'USD', // Shopify maneja esto por separado
      stock: product.variants?.[0]?.inventory_quantity || 0,
      sku: product.variants?.[0]?.sku,
      images: product.images?.map((img: any) => img.src) || [],
      categories: product.product_type ? [product.product_type] : [],
      status: product.status === 'active' ? 'active' : 'inactive',
      url: `https://${shop_domain.split('.')[0]}.com/products/${product.handle}`
    }))
  }

  /**
   * Consultar pedidos en Shopify
   */
  private static async queryShopifyOrders(
    credentials: any,
    params: any
  ): Promise<EcommerceOrder[]> {
    const { shop_domain, access_token } = credentials
    
    const searchParams = new URLSearchParams()
    if (params.status) {
      searchParams.append('status', params.status)
    }
    if (params.customer_email) {
      searchParams.append('email', params.customer_email)
    }
    if (params.order_number) {
      searchParams.append('name', params.order_number)
    }
    searchParams.append('limit', params.limit || '10')

    const url = `https://${shop_domain}/admin/api/2023-10/orders.json?${searchParams}`
    
    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': access_token,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Error consultando pedidos de Shopify: ${response.statusText}`)
    }

    const data = await response.json()
    
    return data.orders.map((order: any) => ({
      id: order.id.toString(),
      orderNumber: order.name,
      status: order.financial_status,
      total: parseFloat(order.total_price),
      currency: order.currency,
      customerEmail: order.email,
      customerName: order.customer?.first_name && order.customer?.last_name 
        ? `${order.customer.first_name} ${order.customer.last_name}`
        : order.customer?.email,
      items: order.line_items?.map((item: any) => ({
        productId: item.product_id?.toString(),
        productName: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price)
      })) || [],
      shippingAddress: order.shipping_address,
      createdAt: new Date(order.created_at),
      updatedAt: new Date(order.updated_at)
    }))
  }

  /**
   * Consultar clientes en Shopify
   */
  private static async queryShopifyCustomers(
    credentials: any,
    params: any
  ): Promise<EcommerceCustomer[]> {
    const { shop_domain, access_token } = credentials
    
    const searchParams = new URLSearchParams()
    if (params.email) {
      searchParams.append('email', params.email)
    }
    if (params.search) {
      searchParams.append('query', params.search)
    }
    searchParams.append('limit', params.limit || '10')

    const url = `https://${shop_domain}/admin/api/2023-10/customers.json?${searchParams}`
    
    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': access_token,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Error consultando clientes de Shopify: ${response.statusText}`)
    }

    const data = await response.json()
    
    return data.customers.map((customer: any) => ({
      id: customer.id.toString(),
      email: customer.email,
      name: customer.first_name && customer.last_name 
        ? `${customer.first_name} ${customer.last_name}`
        : undefined,
      phone: customer.phone,
      totalOrders: customer.orders_count,
      totalSpent: customer.total_spent ? parseFloat(customer.total_spent) : undefined,
      createdAt: new Date(customer.created_at),
      lastOrderAt: customer.last_order_date ? new Date(customer.last_order_date) : undefined
    }))
  }

  /**
   * Consultar inventario en Shopify
   */
  private static async queryShopifyInventory(
    credentials: any,
    params: any
  ): Promise<any> {
    const { shop_domain, access_token } = credentials
    
    // Para inventario necesitamos consultar inventory_levels
    const url = `https://${shop_domain}/admin/api/2023-10/inventory_levels.json`
    
    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': access_token,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Error consultando inventario de Shopify: ${response.statusText}`)
    }

    const data = await response.json()
    return data.inventory_levels
  }

  /**
   * Implementaciones similares para WooCommerce y TiendaNube
   * Por brevedad, incluyo solo las firmas - la implementación seguiría el mismo patrón
   */
  private static async queryWooCommerceProducts(credentials: any, params: any): Promise<EcommerceProduct[]> {
    // Implementación para WooCommerce
    throw new Error('WooCommerce products query no implementada aún')
  }

  private static async queryWooCommerceOrders(credentials: any, params: any): Promise<EcommerceOrder[]> {
    // Implementación para WooCommerce
    throw new Error('WooCommerce orders query no implementada aún')
  }

  private static async queryWooCommerceCustomers(credentials: any, params: any): Promise<EcommerceCustomer[]> {
    // Implementación para WooCommerce
    throw new Error('WooCommerce customers query no implementada aún')
  }

  private static async queryTiendaNubeProducts(credentials: any, params: any): Promise<EcommerceProduct[]> {
    // Implementación para TiendaNube
    throw new Error('TiendaNube products query no implementada aún')
  }

  private static async queryTiendaNubeOrders(credentials: any, params: any): Promise<EcommerceOrder[]> {
    // Implementación para TiendaNube
    throw new Error('TiendaNube orders query no implementada aún')
  }

  private static async queryTiendaNubeCustomers(credentials: any, params: any): Promise<EcommerceCustomer[]> {
    // Implementación para TiendaNube
    throw new Error('TiendaNube customers query no implementada aún')
  }

  /**
   * Determinar si una pregunta del usuario requiere consultas de e-commerce
   */
  static detectEcommerceIntent(message: string): { needsEcommerce: boolean; queryType?: string; params?: any } {
    const lowerMessage = message.toLowerCase()

    // Patrones para productos
    if (lowerMessage.includes('producto') || lowerMessage.includes('stock') || 
        lowerMessage.includes('precio') || lowerMessage.includes('disponible') ||
        lowerMessage.includes('catálogo')) {
      return {
        needsEcommerce: true,
        queryType: 'product',
        params: {
          search: this.extractProductName(message),
          limit: 5
        }
      }
    }

    // Patrones para pedidos
    if (lowerMessage.includes('pedido') || lowerMessage.includes('orden') ||
        lowerMessage.includes('compra') || lowerMessage.includes('#')) {
      return {
        needsEcommerce: true,
        queryType: 'order',
        params: {
          order_number: this.extractOrderNumber(message),
          limit: 5
        }
      }
    }

    // Patrones para clientes
    if (lowerMessage.includes('cliente') || lowerMessage.includes('comprador') ||
        lowerMessage.includes('historial de compras')) {
      return {
        needsEcommerce: true,
        queryType: 'customer',
        params: {
          search: message,
          limit: 5
        }
      }
    }

    return { needsEcommerce: false }
  }

  /**
   * Extraer nombre de producto de un mensaje
   */
  private static extractProductName(message: string): string {
    // Implementación básica - en producción usaríamos NLP más avanzado
    const words = message.split(' ')
    const productKeywords = ['producto', 'item', 'artículo']
    
    for (let i = 0; i < words.length; i++) {
      if (productKeywords.some(keyword => words[i].toLowerCase().includes(keyword))) {
        // Devolver las siguientes palabras como nombre del producto
        return words.slice(i + 1).join(' ')
      }
    }
    
    return message
  }

  /**
   * Extraer número de pedido de un mensaje
   */
  private static extractOrderNumber(message: string): string | undefined {
    // Buscar patrones como #1234, orden 1234, pedido 1234
    const orderPattern = /#(\w+)|(?:orden|pedido)\s+(\w+)/i
    const match = message.match(orderPattern)
    return match ? (match[1] || match[2]) : undefined
  }
}
