
import { UserRole } from '@prisma/client'

// Definición de permisos granulares del sistema
export enum Permission {
  // Gestión de organización
  MANAGE_ORGANIZATION = 'MANAGE_ORGANIZATION',
  VIEW_ORGANIZATION_SETTINGS = 'VIEW_ORGANIZATION_SETTINGS',
  
  // Gestión de usuarios
  MANAGE_USERS = 'MANAGE_USERS',
  INVITE_USERS = 'INVITE_USERS',
  VIEW_ALL_USERS = 'VIEW_ALL_USERS',
  
  // Gestión de conversaciones
  VIEW_ALL_CONVERSATIONS = 'VIEW_ALL_CONVERSATIONS',
  VIEW_ASSIGNED_CONVERSATIONS = 'VIEW_ASSIGNED_CONVERSATIONS',
  MANAGE_CONVERSATIONS = 'MANAGE_CONVERSATIONS',
  ASSIGN_CONVERSATIONS = 'ASSIGN_CONVERSATIONS',
  
  // Configuraciones de WhatsApp
  MANAGE_WHATSAPP_CONFIG = 'MANAGE_WHATSAPP_CONFIG',
  VIEW_WHATSAPP_SETTINGS = 'VIEW_WHATSAPP_SETTINGS',
  
  // Facturación y suscripciones
  MANAGE_BILLING = 'MANAGE_BILLING',
  VIEW_BILLING = 'VIEW_BILLING',
  
  // IA y automatización
  CONFIGURE_AI = 'CONFIGURE_AI',
  USE_AI_FEATURES = 'USE_AI_FEATURES',
  VIEW_AI_USAGE = 'VIEW_AI_USAGE',
  USE_AI_BROKER = 'USE_AI_BROKER',
  VIEW_AI_BROKER_STATS = 'VIEW_AI_BROKER_STATS',
  
  // Reportes y analíticas
  VIEW_REPORTS = 'VIEW_REPORTS',
  VIEW_ADVANCED_ANALYTICS = 'VIEW_ADVANCED_ANALYTICS',
  
  // Gestión básica de campañas (legacy)
  // MANAGE_CAMPAIGNS = 'MANAGE_CAMPAIGNS', // Movido abajo
  // VIEW_CAMPAIGNS = 'VIEW_CAMPAIGNS', // Movido abajo
  
  // Gestión de contactos
  VIEW_CONTACTS = 'VIEW_CONTACTS',
  MANAGE_CONTACTS = 'MANAGE_CONTACTS',
  CREATE_CONTACTS = 'CREATE_CONTACTS',
  DELETE_CONTACTS = 'DELETE_CONTACTS',
  
  // Centro de comunicación (CRM)
  VIEW_CRM_INBOX = 'VIEW_CRM_INBOX',
  MANAGE_CRM_CONVERSATIONS = 'MANAGE_CRM_CONVERSATIONS',
  SEND_MESSAGES = 'SEND_MESSAGES',
  VIEW_ALL_CRM_CONVERSATIONS = 'VIEW_ALL_CRM_CONVERSATIONS',
  ASSIGN_CRM_CONVERSATIONS = 'ASSIGN_CRM_CONVERSATIONS',
  MANAGE_CONTACT_TAGS = 'MANAGE_CONTACT_TAGS',
  VIEW_CONTACT_NOTES = 'VIEW_CONTACT_NOTES',
  MANAGE_CONTACT_NOTES = 'MANAGE_CONTACT_NOTES',
  TRANSFER_CONVERSATIONS = 'TRANSFER_CONVERSATIONS',
  
  // Canales de WhatsApp
  MANAGE_WHATSAPP_CHANNELS = 'MANAGE_WHATSAPP_CHANNELS',
  VIEW_WHATSAPP_CHANNELS = 'VIEW_WHATSAPP_CHANNELS',
  CREATE_WHATSAPP_CHANNELS = 'CREATE_WHATSAPP_CHANNELS',
  DELETE_WHATSAPP_CHANNELS = 'DELETE_WHATSAPP_CHANNELS',
  CONFIGURE_QR_CONNECTION = 'CONFIGURE_QR_CONNECTION',
  CONFIGURE_API_CONNECTION = 'CONFIGURE_API_CONNECTION',
  
  // Respuestas Rápidas
  MANAGE_QUICK_REPLIES = 'MANAGE_QUICK_REPLIES',
  VIEW_QUICK_REPLIES = 'VIEW_QUICK_REPLIES',
  CREATE_QUICK_REPLIES = 'CREATE_QUICK_REPLIES',
  DELETE_QUICK_REPLIES = 'DELETE_QUICK_REPLIES',
  USE_QUICK_REPLIES = 'USE_QUICK_REPLIES',
  VIEW_ALL_QUICK_REPLIES = 'VIEW_ALL_QUICK_REPLIES',
  
  // Base de conocimiento
  MANAGE_KNOWLEDGE_BASE = 'MANAGE_KNOWLEDGE_BASE',
  VIEW_KNOWLEDGE_BASE = 'VIEW_KNOWLEDGE_BASE',
  
  // Configuraciones de organización
  MANAGE_ORGANIZATION_SETTINGS = 'MANAGE_ORGANIZATION_SETTINGS',
  
  // Distribuidores
  MANAGE_CLIENT_ORGANIZATIONS = 'MANAGE_CLIENT_ORGANIZATIONS',
  VIEW_COMMISSIONS = 'VIEW_COMMISSIONS',
  CREATE_CLIENT_ACCOUNTS = 'CREATE_CLIENT_ACCOUNTS',
  
  // Super Admin
  PLATFORM_ADMINISTRATION = 'PLATFORM_ADMINISTRATION',
  VIEW_ALL_ORGANIZATIONS = 'VIEW_ALL_ORGANIZATIONS',
  MANAGE_SYSTEM_SETTINGS = 'MANAGE_SYSTEM_SETTINGS',
  MANAGE_AI_PROVIDERS = 'MANAGE_AI_PROVIDERS',
  
  // Sistema de Integraciones
  VIEW_INTEGRATIONS = 'VIEW_INTEGRATIONS',
  MANAGE_INTEGRATIONS = 'MANAGE_INTEGRATIONS',
  CONNECT_INTEGRATIONS = 'CONNECT_INTEGRATIONS',
  DISCONNECT_INTEGRATIONS = 'DISCONNECT_INTEGRATIONS',
  VIEW_INTEGRATION_LOGS = 'VIEW_INTEGRATION_LOGS',
  CONFIGURE_INTEGRATION_SETTINGS = 'CONFIGURE_INTEGRATION_SETTINGS',
  
  // Sistema de Campañas Profesionales (La Máquina de Crecimiento)
  VIEW_CAMPAIGNS = 'VIEW_CAMPAIGNS',
  MANAGE_CAMPAIGNS = 'MANAGE_CAMPAIGNS',
  CREATE_CAMPAIGNS = 'CREATE_CAMPAIGNS',
  DELETE_CAMPAIGNS = 'DELETE_CAMPAIGNS',
  EXECUTE_CAMPAIGNS = 'EXECUTE_CAMPAIGNS',
  PAUSE_CAMPAIGNS = 'PAUSE_CAMPAIGNS',
  VIEW_CAMPAIGN_ANALYTICS = 'VIEW_CAMPAIGN_ANALYTICS',
  
  // Gestión de Plantillas de Mensajes
  VIEW_MESSAGE_TEMPLATES = 'VIEW_MESSAGE_TEMPLATES',
  MANAGE_MESSAGE_TEMPLATES = 'MANAGE_MESSAGE_TEMPLATES',
  CREATE_MESSAGE_TEMPLATES = 'CREATE_MESSAGE_TEMPLATES',
  DELETE_MESSAGE_TEMPLATES = 'DELETE_MESSAGE_TEMPLATES',
  SYNC_META_TEMPLATES = 'SYNC_META_TEMPLATES',
  
  // Constructor de Audiencias
  USE_AUDIENCE_BUILDER = 'USE_AUDIENCE_BUILDER',
  VIEW_AUDIENCE_PREVIEW = 'VIEW_AUDIENCE_PREVIEW',
  MANAGE_AUDIENCE_FILTERS = 'MANAGE_AUDIENCE_FILTERS',
  
  // Motor de Envío
  VIEW_SENDING_QUEUE = 'VIEW_SENDING_QUEUE',
  MANAGE_SENDING_SETTINGS = 'MANAGE_SENDING_SETTINGS'
}

// Matriz de permisos por rol
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    // Super Admin tiene TODOS los permisos
    ...Object.values(Permission)
  ],
  
  DISTRIBUIDOR: [
    // Gestión de clientes y comisiones
    Permission.MANAGE_CLIENT_ORGANIZATIONS,
    Permission.VIEW_COMMISSIONS,
    Permission.CREATE_CLIENT_ACCOUNTS,
    
    // Vista básica de configuraciones
    Permission.VIEW_ORGANIZATION_SETTINGS,
    Permission.VIEW_BILLING,
    Permission.VIEW_REPORTS,
    
    // Uso básico de IA
    Permission.USE_AI_FEATURES,
    Permission.VIEW_AI_USAGE,
    Permission.USE_AI_BROKER,
    
    // Conversaciones de sus clientes
    Permission.VIEW_ALL_CONVERSATIONS,
    Permission.MANAGE_CONVERSATIONS
  ],
  
  PROPIETARIO: [
    // Gestión completa de su organización
    Permission.MANAGE_ORGANIZATION,
    Permission.VIEW_ORGANIZATION_SETTINGS,
    Permission.MANAGE_ORGANIZATION_SETTINGS,
    
    // Gestión completa de usuarios
    Permission.MANAGE_USERS,
    Permission.INVITE_USERS,
    Permission.VIEW_ALL_USERS,
    
    // Gestión completa de conversaciones
    Permission.VIEW_ALL_CONVERSATIONS,
    Permission.MANAGE_CONVERSATIONS,
    Permission.ASSIGN_CONVERSATIONS,
    
    // Configuraciones de WhatsApp
    Permission.MANAGE_WHATSAPP_CONFIG,
    Permission.VIEW_WHATSAPP_SETTINGS,
    
    // Facturación y suscripciones
    Permission.MANAGE_BILLING,
    Permission.VIEW_BILLING,
    
    // IA y automatización
    Permission.CONFIGURE_AI,
    Permission.USE_AI_FEATURES,
    Permission.VIEW_AI_USAGE,
    Permission.USE_AI_BROKER,
    Permission.VIEW_AI_BROKER_STATS,
    
    // Reportes y analíticas
    Permission.VIEW_REPORTS,
    Permission.VIEW_ADVANCED_ANALYTICS,
    
    // Campañas
    Permission.MANAGE_CAMPAIGNS,
    Permission.VIEW_CAMPAIGNS,
    
    // Contactos
    Permission.VIEW_CONTACTS,
    Permission.MANAGE_CONTACTS,
    Permission.CREATE_CONTACTS,
    Permission.DELETE_CONTACTS,
    
    // Centro de comunicación (CRM)
    Permission.VIEW_CRM_INBOX,
    Permission.MANAGE_CRM_CONVERSATIONS,
    Permission.SEND_MESSAGES,
    Permission.VIEW_ALL_CRM_CONVERSATIONS,
    Permission.ASSIGN_CRM_CONVERSATIONS,
    Permission.MANAGE_CONTACT_TAGS,
    Permission.VIEW_CONTACT_NOTES,
    Permission.MANAGE_CONTACT_NOTES,
    Permission.TRANSFER_CONVERSATIONS,
    
    // Canales de WhatsApp
    Permission.MANAGE_WHATSAPP_CHANNELS,
    Permission.VIEW_WHATSAPP_CHANNELS,
    Permission.CREATE_WHATSAPP_CHANNELS,
    Permission.DELETE_WHATSAPP_CHANNELS,
    Permission.CONFIGURE_QR_CONNECTION,
    Permission.CONFIGURE_API_CONNECTION,
    
    // Respuestas Rápidas
    Permission.MANAGE_QUICK_REPLIES,
    Permission.VIEW_QUICK_REPLIES,
    Permission.CREATE_QUICK_REPLIES,
    Permission.DELETE_QUICK_REPLIES,
    Permission.USE_QUICK_REPLIES,
    Permission.VIEW_ALL_QUICK_REPLIES,
    
    // Base de conocimiento
    Permission.MANAGE_KNOWLEDGE_BASE,
    Permission.VIEW_KNOWLEDGE_BASE,
    
    // Sistema de Integraciones
    Permission.VIEW_INTEGRATIONS,
    Permission.MANAGE_INTEGRATIONS,
    Permission.CONNECT_INTEGRATIONS,
    Permission.DISCONNECT_INTEGRATIONS,
    Permission.VIEW_INTEGRATION_LOGS,
    Permission.CONFIGURE_INTEGRATION_SETTINGS,
    
    // Sistema de Campañas Profesionales (La Máquina de Crecimiento)
    Permission.VIEW_CAMPAIGNS,
    Permission.MANAGE_CAMPAIGNS,
    Permission.CREATE_CAMPAIGNS,
    Permission.DELETE_CAMPAIGNS,
    Permission.EXECUTE_CAMPAIGNS,
    Permission.PAUSE_CAMPAIGNS,
    Permission.VIEW_CAMPAIGN_ANALYTICS,
    
    // Gestión de Plantillas de Mensajes
    Permission.VIEW_MESSAGE_TEMPLATES,
    Permission.MANAGE_MESSAGE_TEMPLATES,
    Permission.CREATE_MESSAGE_TEMPLATES,
    Permission.DELETE_MESSAGE_TEMPLATES,
    Permission.SYNC_META_TEMPLATES,
    
    // Constructor de Audiencias
    Permission.USE_AUDIENCE_BUILDER,
    Permission.VIEW_AUDIENCE_PREVIEW,
    Permission.MANAGE_AUDIENCE_FILTERS,
    
    // Motor de Envío
    Permission.VIEW_SENDING_QUEUE,
    Permission.MANAGE_SENDING_SETTINGS
  ],
  
  AGENTE: [
    // Solo conversaciones asignadas
    Permission.VIEW_ASSIGNED_CONVERSATIONS,
    
    // Uso básico de IA
    Permission.USE_AI_FEATURES,
    Permission.USE_AI_BROKER,
    
    // Vista limitada de configuraciones
    Permission.VIEW_WHATSAPP_SETTINGS,
    
    // Vista básica de contactos
    Permission.VIEW_CONTACTS,
    
    // Vista básica de base de conocimiento
    Permission.VIEW_KNOWLEDGE_BASE,
    
    // Vista básica de campañas
    Permission.VIEW_CAMPAIGNS,
    
    // CRM básico - solo conversaciones asignadas
    Permission.VIEW_CRM_INBOX,
    Permission.SEND_MESSAGES,
    Permission.VIEW_CONTACT_NOTES,
    Permission.MANAGE_CONTACT_NOTES,
    
    // Respuestas rápidas - solo usar
    Permission.USE_QUICK_REPLIES,
    Permission.VIEW_QUICK_REPLIES,
    
    // Campañas - solo visualización básica
    Permission.VIEW_CAMPAIGNS,
    Permission.VIEW_MESSAGE_TEMPLATES
  ]
}

/**
 * Verificar si un rol tiene un permiso específico
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

/**
 * Verificar si un rol tiene ALGUNO de los permisos especificados
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role]
  return permissions.some(permission => rolePermissions.includes(permission))
}

/**
 * Verificar si un rol tiene TODOS los permisos especificados
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role]
  return permissions.every(permission => rolePermissions.includes(permission))
}

/**
 * Obtener todos los permisos de un rol
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role]
}

/**
 * Verificar si un rol puede acceder a una ruta específica
 */
export function canAccessRoute(role: UserRole, route: string): boolean {
  const routePermissions: Record<string, Permission[]> = {
    '/dashboard': [Permission.VIEW_ASSIGNED_CONVERSATIONS, Permission.VIEW_ALL_CONVERSATIONS],
    '/inbox': [Permission.VIEW_CRM_INBOX],
    '/conversations': [Permission.VIEW_ASSIGNED_CONVERSATIONS, Permission.VIEW_ALL_CONVERSATIONS],
    '/contacts': [Permission.VIEW_CONTACTS],
    '/settings': [Permission.VIEW_ORGANIZATION_SETTINGS],
    '/settings/organization': [Permission.MANAGE_ORGANIZATION],
    '/settings/users': [Permission.MANAGE_USERS],
    '/settings/whatsapp': [Permission.MANAGE_WHATSAPP_CONFIG],
    '/settings/billing': [Permission.VIEW_BILLING],
    '/settings/ai': [Permission.CONFIGURE_AI],
    '/reports': [Permission.VIEW_REPORTS],
    '/admin': [Permission.PLATFORM_ADMINISTRATION],
    '/admin/ai-providers': [Permission.MANAGE_AI_PROVIDERS],
    '/admin/ai-broker': [Permission.PLATFORM_ADMINISTRATION],
    '/distributor': [Permission.MANAGE_CLIENT_ORGANIZATIONS],
    
    // Rutas de campañas
    '/campaigns': [Permission.VIEW_CAMPAIGNS],
    '/campaigns/create': [Permission.CREATE_CAMPAIGNS],
    '/campaigns/templates': [Permission.VIEW_MESSAGE_TEMPLATES],
    '/campaigns/templates/create': [Permission.CREATE_MESSAGE_TEMPLATES],
    '/campaigns/analytics': [Permission.VIEW_CAMPAIGN_ANALYTICS],
    '/campaigns/audience-builder': [Permission.USE_AUDIENCE_BUILDER]
  }

  const requiredPermissions = routePermissions[route]
  if (!requiredPermissions) {
    // Si la ruta no tiene permisos específicos, permitir acceso
    return true
  }

  return hasAnyPermission(role, requiredPermissions)
}

/**
 * Obtener el dashboard apropiado para un rol
 */
export function getDashboardRoute(role: UserRole): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/admin'
    case 'DISTRIBUIDOR':
      return '/distributor'
    case 'PROPIETARIO':
    case 'AGENTE':
    default:
      return '/dashboard'
  }
}

