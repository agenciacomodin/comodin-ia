
/**
 * 🔌 ÍNDICE DE SERVICIOS DE INTEGRACIÓN
 * 
 * Exportación centralizada de todos los servicios de integración
 */

export * from './shopify-service'
export * from './woocommerce-service'
export * from './mailchimp-service'
export * from './google-analytics-service'

// Re-exportar tipos comunes
export interface SyncResult {
  synced: number
  errors: number
  message?: string
}

export interface TestConnectionResult {
  success: boolean
  message?: string
  error?: string
}
