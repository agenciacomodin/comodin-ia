
export enum Permission {
  // Dashboard y navegación
  VIEW_DASHBOARD = 'VIEW_DASHBOARD',
  
  // Centro de Comunicación (CRM)
  VIEW_CRM_INBOX = 'VIEW_CRM_INBOX',
  MANAGE_CRM_CONVERSATIONS = 'MANAGE_CRM_CONVERSATIONS',
  MANAGE_CRM_CONTACTS = 'MANAGE_CRM_CONTACTS',
  VIEW_CRM_ANALYTICS = 'VIEW_CRM_ANALYTICS',
  EXPORT_CRM_DATA = 'EXPORT_CRM_DATA',
  VIEW_CONTACTS = 'VIEW_CONTACTS',
  MANAGE_CONTACTS = 'MANAGE_CONTACTS',
  
  // WhatsApp y Canales
  VIEW_WHATSAPP_CHANNELS = 'VIEW_WHATSAPP_CHANNELS',
  MANAGE_WHATSAPP_CHANNELS = 'MANAGE_WHATSAPP_CHANNELS',
  CONNECT_WHATSAPP_QR = 'CONNECT_WHATSAPP_QR',
  CONNECT_WHATSAPP_API = 'CONNECT_WHATSAPP_API',
  CONFIGURE_WHATSAPP_SETTINGS = 'CONFIGURE_WHATSAPP_SETTINGS',
  
  // Respuestas Rápidas
  VIEW_QUICK_REPLIES = 'VIEW_QUICK_REPLIES',
  MANAGE_QUICK_REPLIES = 'MANAGE_QUICK_REPLIES',
  MANAGE_GLOBAL_QUICK_REPLIES = 'MANAGE_GLOBAL_QUICK_REPLIES',
  
  // Automatizaciones (IA Activa)
  VIEW_AUTOMATIONS = 'VIEW_AUTOMATIONS',
  MANAGE_AUTOMATIONS = 'MANAGE_AUTOMATIONS',
  VIEW_AUTOMATION_ANALYTICS = 'VIEW_AUTOMATION_ANALYTICS',
  
  // Base de Conocimiento (Entrenar IA)
  VIEW_KNOWLEDGE_BASE = 'VIEW_KNOWLEDGE_BASE',
  MANAGE_KNOWLEDGE_BASE = 'MANAGE_KNOWLEDGE_BASE',
  UPLOAD_KNOWLEDGE_SOURCES = 'UPLOAD_KNOWLEDGE_SOURCES',
  MANAGE_KNOWLEDGE_SOURCES = 'MANAGE_KNOWLEDGE_SOURCES',
  DELETE_KNOWLEDGE_SOURCES = 'DELETE_KNOWLEDGE_SOURCES',
  
  // Sistema de Integraciones
  VIEW_INTEGRATIONS = 'VIEW_INTEGRATIONS',
  MANAGE_INTEGRATIONS = 'MANAGE_INTEGRATIONS',
  CONFIGURE_ECOMMERCE = 'CONFIGURE_ECOMMERCE',
  CONNECT_INTEGRATIONS = 'CONNECT_INTEGRATIONS',
  DISCONNECT_INTEGRATIONS = 'DISCONNECT_INTEGRATIONS',
  CONFIGURE_INTEGRATION_SETTINGS = 'CONFIGURE_INTEGRATION_SETTINGS',
  
  // La Máquina de Crecimiento (Campañas)
  VIEW_CAMPAIGNS = 'VIEW_CAMPAIGNS',
  MANAGE_CAMPAIGNS = 'MANAGE_CAMPAIGNS',
  CREATE_CAMPAIGNS = 'CREATE_CAMPAIGNS',
  EXECUTE_CAMPAIGNS = 'EXECUTE_CAMPAIGNS',
  PAUSE_CAMPAIGNS = 'PAUSE_CAMPAIGNS',
  SEND_BULK_MESSAGES = 'SEND_BULK_MESSAGES',
  VIEW_CAMPAIGN_ANALYTICS = 'VIEW_CAMPAIGN_ANALYTICS',
  USE_AUDIENCE_BUILDER = 'USE_AUDIENCE_BUILDER',
  
  // Templates de Mensajes
  VIEW_MESSAGE_TEMPLATES = 'VIEW_MESSAGE_TEMPLATES',
  CREATE_MESSAGE_TEMPLATES = 'CREATE_MESSAGE_TEMPLATES',
  MANAGE_MESSAGE_TEMPLATES = 'MANAGE_MESSAGE_TEMPLATES',
  SYNC_META_TEMPLATES = 'SYNC_META_TEMPLATES',
  DELETE_MESSAGE_TEMPLATES = 'DELETE_MESSAGE_TEMPLATES',
  
  // Reportes y Analytics
  VIEW_REPORTS = 'VIEW_REPORTS',
  EXPORT_REPORTS = 'EXPORT_REPORTS',
  VIEW_ADVANCED_ANALYTICS = 'VIEW_ADVANCED_ANALYTICS',
  
  // Gestión de Equipo
  VIEW_TEAM_MEMBERS = 'VIEW_TEAM_MEMBERS',
  INVITE_TEAM_MEMBERS = 'INVITE_TEAM_MEMBERS',
  MANAGE_TEAM_ROLES = 'MANAGE_TEAM_ROLES',
  REMOVE_TEAM_MEMBERS = 'REMOVE_TEAM_MEMBERS',
  VIEW_ALL_USERS = 'VIEW_ALL_USERS',
  INVITE_USERS = 'INVITE_USERS',
  MANAGE_USERS = 'MANAGE_USERS',
  
  // Facturación y Suscripciones
  VIEW_BILLING = 'VIEW_BILLING',
  MANAGE_BILLING = 'MANAGE_BILLING',
  VIEW_USAGE_ANALYTICS = 'VIEW_USAGE_ANALYTICS',
  MANAGE_AI_WALLET = 'MANAGE_AI_WALLET',
  MANAGE_WALLET = 'MANAGE_WALLET',
  VIEW_TRANSACTIONS = 'VIEW_TRANSACTIONS',
  RECHARGE_WALLET = 'RECHARGE_WALLET',
  
  // Configuración de Organización
  VIEW_ORGANIZATION_SETTINGS = 'VIEW_ORGANIZATION_SETTINGS',
  MANAGE_ORGANIZATION_SETTINGS = 'MANAGE_ORGANIZATION_SETTINGS',
  EXPORT_ORGANIZATION_DATA = 'EXPORT_ORGANIZATION_DATA',
  MANAGE_ORGANIZATION = 'MANAGE_ORGANIZATION',
  CREATE_CLIENT_ACCOUNTS = 'CREATE_CLIENT_ACCOUNTS',
  
  // Super Admin (Solo para COMODÍN IA)
  MANAGE_AI_PROVIDERS = 'MANAGE_AI_PROVIDERS',
  VIEW_SYSTEM_ANALYTICS = 'VIEW_SYSTEM_ANALYTICS',
  MANAGE_SYSTEM_SETTINGS = 'MANAGE_SYSTEM_SETTINGS',
  VIEW_ALL_ORGANIZATIONS = 'VIEW_ALL_ORGANIZATIONS',
  SUSPEND_ORGANIZATIONS = 'SUSPEND_ORGANIZATIONS',
  PLATFORM_ADMINISTRATION = 'PLATFORM_ADMINISTRATION',
  
  // Permisos adicionales faltantes
  DELETE_CAMPAIGNS = 'DELETE_CAMPAIGNS',
  VIEW_AUDIENCE_PREVIEW = 'VIEW_AUDIENCE_PREVIEW',
  VIEW_ASSIGNED_CONVERSATIONS = 'VIEW_ASSIGNED_CONVERSATIONS',
  VIEW_ALL_CONVERSATIONS = 'VIEW_ALL_CONVERSATIONS',
  MANAGE_CLIENT_ORGANIZATIONS = 'MANAGE_CLIENT_ORGANIZATIONS',
  MANAGE_WHATSAPP_CONFIG = 'MANAGE_WHATSAPP_CONFIG',
  CONFIGURE_AI = 'CONFIGURE_AI',
}

export function getRolePermissions(role: string): Permission[] {
  switch (role) {
    case 'SUPER_ADMIN':
      const propietarioPermissions = [
        // Dashboard y navegación
        Permission.VIEW_DASHBOARD,
        
        // Centro de Comunicación - Acceso completo
        Permission.VIEW_CRM_INBOX,
        Permission.MANAGE_CRM_CONVERSATIONS,
        Permission.MANAGE_CRM_CONTACTS,
        Permission.VIEW_CRM_ANALYTICS,
        Permission.EXPORT_CRM_DATA,
        Permission.VIEW_CONTACTS,
        Permission.MANAGE_CONTACTS,
        
        // WhatsApp - Acceso completo
        Permission.VIEW_WHATSAPP_CHANNELS,
        Permission.MANAGE_WHATSAPP_CHANNELS,
        Permission.CONNECT_WHATSAPP_QR,
        Permission.CONNECT_WHATSAPP_API,
        Permission.CONFIGURE_WHATSAPP_SETTINGS,
        
        // Respuestas Rápidas - Acceso completo
        Permission.VIEW_QUICK_REPLIES,
        Permission.MANAGE_QUICK_REPLIES,
        Permission.MANAGE_GLOBAL_QUICK_REPLIES,
        
        // Automatizaciones - Acceso completo
        Permission.VIEW_AUTOMATIONS,
        Permission.MANAGE_AUTOMATIONS,
        Permission.VIEW_AUTOMATION_ANALYTICS,
        
        // Base de Conocimiento - Acceso completo
        Permission.VIEW_KNOWLEDGE_BASE,
        Permission.MANAGE_KNOWLEDGE_BASE,
        Permission.UPLOAD_KNOWLEDGE_SOURCES,
        Permission.MANAGE_KNOWLEDGE_SOURCES,
        Permission.DELETE_KNOWLEDGE_SOURCES,
        
        // Integraciones - Acceso completo
        Permission.VIEW_INTEGRATIONS,
        Permission.MANAGE_INTEGRATIONS,
        Permission.CONFIGURE_ECOMMERCE,
        Permission.CONNECT_INTEGRATIONS,
        Permission.DISCONNECT_INTEGRATIONS,
        Permission.CONFIGURE_INTEGRATION_SETTINGS,
        
        // Campañas - Acceso completo
        Permission.VIEW_CAMPAIGNS,
        Permission.MANAGE_CAMPAIGNS,
        Permission.CREATE_CAMPAIGNS,
        Permission.EXECUTE_CAMPAIGNS,
        Permission.PAUSE_CAMPAIGNS,
        Permission.SEND_BULK_MESSAGES,
        Permission.VIEW_CAMPAIGN_ANALYTICS,
        Permission.USE_AUDIENCE_BUILDER,
        
        // Templates - Acceso completo
        Permission.VIEW_MESSAGE_TEMPLATES,
        Permission.CREATE_MESSAGE_TEMPLATES,
        Permission.MANAGE_MESSAGE_TEMPLATES,
        Permission.SYNC_META_TEMPLATES,
        Permission.DELETE_MESSAGE_TEMPLATES,
        
        // Reportes - Acceso completo
        Permission.VIEW_REPORTS,
        Permission.EXPORT_REPORTS,
        Permission.VIEW_ADVANCED_ANALYTICS,
        
        // Gestión de Equipo - Acceso completo
        Permission.VIEW_TEAM_MEMBERS,
        Permission.INVITE_TEAM_MEMBERS,
        Permission.MANAGE_TEAM_ROLES,
        Permission.REMOVE_TEAM_MEMBERS,
        Permission.VIEW_ALL_USERS,
        Permission.INVITE_USERS,
        Permission.MANAGE_USERS,
        
        // Facturación - Acceso completo
        Permission.VIEW_BILLING,
        Permission.MANAGE_BILLING,
        Permission.VIEW_USAGE_ANALYTICS,
        Permission.MANAGE_AI_WALLET,
        Permission.MANAGE_WALLET,
        Permission.VIEW_TRANSACTIONS,
        Permission.RECHARGE_WALLET,
        
        // Configuración - Acceso completo
        Permission.VIEW_ORGANIZATION_SETTINGS,
        Permission.MANAGE_ORGANIZATION_SETTINGS,
        Permission.EXPORT_ORGANIZATION_DATA,
        Permission.MANAGE_ORGANIZATION,
        Permission.CREATE_CLIENT_ACCOUNTS,
      ]
      
      return [
        // Permisos específicos de Super Admin
        Permission.MANAGE_AI_PROVIDERS,
        Permission.VIEW_SYSTEM_ANALYTICS,
        Permission.MANAGE_SYSTEM_SETTINGS,
        Permission.VIEW_ALL_ORGANIZATIONS,
        Permission.SUSPEND_ORGANIZATIONS,
        Permission.PLATFORM_ADMINISTRATION,
        Permission.VIEW_ALL_CONVERSATIONS,
        Permission.MANAGE_CLIENT_ORGANIZATIONS,
        
        // Todos los permisos de propietario
        ...propietarioPermissions
      ]

    case 'PROPIETARIO':
      return [
        // Dashboard y navegación
        Permission.VIEW_DASHBOARD,
        
        // Centro de Comunicación - Acceso completo
        Permission.VIEW_CRM_INBOX,
        Permission.MANAGE_CRM_CONVERSATIONS,
        Permission.MANAGE_CRM_CONTACTS,
        Permission.VIEW_CRM_ANALYTICS,
        Permission.EXPORT_CRM_DATA,
        Permission.VIEW_CONTACTS,
        Permission.MANAGE_CONTACTS,
        
        // WhatsApp - Acceso completo
        Permission.VIEW_WHATSAPP_CHANNELS,
        Permission.MANAGE_WHATSAPP_CHANNELS,
        Permission.CONNECT_WHATSAPP_QR,
        Permission.CONNECT_WHATSAPP_API,
        Permission.CONFIGURE_WHATSAPP_SETTINGS,
        
        // Respuestas Rápidas - Acceso completo
        Permission.VIEW_QUICK_REPLIES,
        Permission.MANAGE_QUICK_REPLIES,
        Permission.MANAGE_GLOBAL_QUICK_REPLIES,
        
        // Automatizaciones - Acceso completo
        Permission.VIEW_AUTOMATIONS,
        Permission.MANAGE_AUTOMATIONS,
        Permission.VIEW_AUTOMATION_ANALYTICS,
        
        // Base de Conocimiento - Acceso completo
        Permission.VIEW_KNOWLEDGE_BASE,
        Permission.MANAGE_KNOWLEDGE_BASE,
        Permission.UPLOAD_KNOWLEDGE_SOURCES,
        Permission.MANAGE_KNOWLEDGE_SOURCES,
        Permission.DELETE_KNOWLEDGE_SOURCES,
        
        // Integraciones - Acceso completo
        Permission.VIEW_INTEGRATIONS,
        Permission.MANAGE_INTEGRATIONS,
        Permission.CONFIGURE_ECOMMERCE,
        Permission.CONNECT_INTEGRATIONS,
        Permission.DISCONNECT_INTEGRATIONS,
        Permission.CONFIGURE_INTEGRATION_SETTINGS,
        
        // Campañas - Acceso completo
        Permission.VIEW_CAMPAIGNS,
        Permission.MANAGE_CAMPAIGNS,
        Permission.CREATE_CAMPAIGNS,
        Permission.EXECUTE_CAMPAIGNS,
        Permission.PAUSE_CAMPAIGNS,
        Permission.SEND_BULK_MESSAGES,
        Permission.VIEW_CAMPAIGN_ANALYTICS,
        Permission.USE_AUDIENCE_BUILDER,
        
        // Templates - Acceso completo
        Permission.VIEW_MESSAGE_TEMPLATES,
        Permission.CREATE_MESSAGE_TEMPLATES,
        Permission.MANAGE_MESSAGE_TEMPLATES,
        Permission.SYNC_META_TEMPLATES,
        Permission.DELETE_MESSAGE_TEMPLATES,
        
        // Reportes - Acceso completo
        Permission.VIEW_REPORTS,
        Permission.EXPORT_REPORTS,
        Permission.VIEW_ADVANCED_ANALYTICS,
        
        // Gestión de Equipo - Acceso completo
        Permission.VIEW_TEAM_MEMBERS,
        Permission.INVITE_TEAM_MEMBERS,
        Permission.MANAGE_TEAM_ROLES,
        Permission.REMOVE_TEAM_MEMBERS,
        Permission.VIEW_ALL_USERS,
        Permission.INVITE_USERS,
        Permission.MANAGE_USERS,
        
        // Facturación - Acceso completo
        Permission.VIEW_BILLING,
        Permission.MANAGE_BILLING,
        Permission.VIEW_USAGE_ANALYTICS,
        Permission.MANAGE_AI_WALLET,
        Permission.MANAGE_WALLET,
        Permission.VIEW_TRANSACTIONS,
        Permission.RECHARGE_WALLET,
        
        // Configuración - Acceso completo
        Permission.VIEW_ORGANIZATION_SETTINGS,
        Permission.MANAGE_ORGANIZATION_SETTINGS,
        Permission.EXPORT_ORGANIZATION_DATA,
        Permission.MANAGE_ORGANIZATION,
        Permission.CREATE_CLIENT_ACCOUNTS,
        
        // Permisos adicionales para propietario
        Permission.DELETE_CAMPAIGNS,
        Permission.VIEW_AUDIENCE_PREVIEW,
        Permission.VIEW_ASSIGNED_CONVERSATIONS,
        Permission.VIEW_ALL_CONVERSATIONS,
        Permission.MANAGE_WHATSAPP_CONFIG,
        Permission.CONFIGURE_AI,
      ]

    case 'DISTRIBUIDOR':
      return [
        // Dashboard
        Permission.VIEW_DASHBOARD,
        
        // Centro de Comunicación - Acceso amplio
        Permission.VIEW_CRM_INBOX,
        Permission.MANAGE_CRM_CONVERSATIONS,
        Permission.MANAGE_CRM_CONTACTS,
        Permission.VIEW_CRM_ANALYTICS,
        Permission.EXPORT_CRM_DATA,
        Permission.VIEW_CONTACTS,
        Permission.MANAGE_CONTACTS,
        
        // WhatsApp - Puede ver y conectar QR
        Permission.VIEW_WHATSAPP_CHANNELS,
        Permission.CONNECT_WHATSAPP_QR,
        Permission.CONFIGURE_WHATSAPP_SETTINGS,
        
        // Respuestas Rápidas - Puede crear y gestionar
        Permission.VIEW_QUICK_REPLIES,
        Permission.MANAGE_QUICK_REPLIES,
        
        // Automatizaciones - Solo ver
        Permission.VIEW_AUTOMATIONS,
        Permission.VIEW_AUTOMATION_ANALYTICS,
        
        // Base de Conocimiento - Puede subir contenido
        Permission.VIEW_KNOWLEDGE_BASE,
        Permission.UPLOAD_KNOWLEDGE_SOURCES,
        Permission.MANAGE_KNOWLEDGE_SOURCES,
        
        // Integraciones - Ver y conectar básico
        Permission.VIEW_INTEGRATIONS,
        Permission.CONNECT_INTEGRATIONS,
        
        // Campañas - Acceso amplio
        Permission.VIEW_CAMPAIGNS,
        Permission.MANAGE_CAMPAIGNS,
        Permission.CREATE_CAMPAIGNS,
        Permission.EXECUTE_CAMPAIGNS,
        Permission.SEND_BULK_MESSAGES,
        Permission.VIEW_CAMPAIGN_ANALYTICS,
        Permission.USE_AUDIENCE_BUILDER,
        
        // Templates - Acceso básico
        Permission.VIEW_MESSAGE_TEMPLATES,
        Permission.CREATE_MESSAGE_TEMPLATES,
        Permission.MANAGE_MESSAGE_TEMPLATES,
        
        // Reportes - Ver reportes
        Permission.VIEW_REPORTS,
        Permission.EXPORT_REPORTS,
        
        // Equipo - Solo ver
        Permission.VIEW_TEAM_MEMBERS,
        Permission.VIEW_ALL_USERS,
        
        // Facturación - Solo ver
        Permission.VIEW_BILLING,
        Permission.VIEW_USAGE_ANALYTICS,
        Permission.VIEW_TRANSACTIONS,
        
        // Configuración - Solo ver
        Permission.VIEW_ORGANIZATION_SETTINGS,
        
        // Permisos adicionales para distribuidor
        Permission.VIEW_AUDIENCE_PREVIEW,
        Permission.VIEW_ASSIGNED_CONVERSATIONS,
        Permission.MANAGE_CLIENT_ORGANIZATIONS,
      ]

    case 'AGENTE':
    default:
      return [
        // Dashboard básico
        Permission.VIEW_DASHBOARD,
        
        // Centro de Comunicación - Acceso básico
        Permission.VIEW_CRM_INBOX,
        Permission.MANAGE_CRM_CONVERSATIONS,
        Permission.VIEW_CRM_ANALYTICS,
        Permission.VIEW_CONTACTS,
        
        // WhatsApp - Solo ver
        Permission.VIEW_WHATSAPP_CHANNELS,
        
        // Respuestas Rápidas - Solo sus propias respuestas
        Permission.VIEW_QUICK_REPLIES,
        Permission.MANAGE_QUICK_REPLIES,
        
        // Automatizaciones - Solo ver
        Permission.VIEW_AUTOMATIONS,
        
        // Base de Conocimiento - Solo ver
        Permission.VIEW_KNOWLEDGE_BASE,
        
        // Campañas - Solo ver
        Permission.VIEW_CAMPAIGNS,
        Permission.VIEW_CAMPAIGN_ANALYTICS,
        
        // Templates - Solo ver
        Permission.VIEW_MESSAGE_TEMPLATES,
        
        // Reportes - Ver básico
        Permission.VIEW_REPORTS,
        
        // Configuración personal limitada
        Permission.VIEW_ORGANIZATION_SETTINGS,
        Permission.VIEW_BILLING,
        Permission.VIEW_USAGE_ANALYTICS,
        
        // Permisos adicionales para agente
        Permission.VIEW_ASSIGNED_CONVERSATIONS,
      ]
  }
}

export function hasPermission(userPermissions: string[], requiredPermission: Permission): boolean {
  return userPermissions.includes(requiredPermission.toString())
}

export function hasAnyPermission(userPermissions: string[], requiredPermissions: Permission[]): boolean {
  return requiredPermissions.some(permission => userPermissions.includes(permission.toString()))
}

export function hasAllPermissions(userPermissions: string[], requiredPermissions: Permission[]): boolean {
  return requiredPermissions.every(permission => userPermissions.includes(permission.toString()))
}

export function canAccessRoute(userPermissions: string[], route: string): boolean {
  // Mapeo básico de rutas a permisos
  const routePermissions: Record<string, Permission[]> = {
    '/dashboard': [Permission.VIEW_DASHBOARD],
    '/campaigns': [Permission.VIEW_CAMPAIGNS],
    '/campaigns/create': [Permission.CREATE_CAMPAIGNS],
    '/campaigns/templates': [Permission.VIEW_MESSAGE_TEMPLATES],
    '/contacts': [Permission.VIEW_CONTACTS],
    '/reports': [Permission.VIEW_REPORTS],
    '/integrations': [Permission.VIEW_INTEGRATIONS],
    '/knowledge': [Permission.VIEW_KNOWLEDGE_BASE],
    '/automations': [Permission.VIEW_AUTOMATIONS],
    '/team': [Permission.VIEW_TEAM_MEMBERS],
    '/billing': [Permission.VIEW_BILLING],
    '/settings': [Permission.VIEW_ORGANIZATION_SETTINGS],
    '/whatsapp': [Permission.VIEW_WHATSAPP_CHANNELS],
  }

  const requiredPermissions = routePermissions[route]
  if (!requiredPermissions) {
    return true // Permitir acceso si no hay restricciones específicas
  }

  return hasAnyPermission(userPermissions, requiredPermissions)
}

export function getDashboardRoute(userRole: string): string {
  switch (userRole) {
    case 'SUPER_ADMIN':
      return '/dashboard'
    case 'PROPIETARIO':
      return '/dashboard'
    case 'DISTRIBUIDOR':
      return '/distributor'
    case 'AGENTE':
    default:
      return '/dashboard'
  }
}

// Helper function for checking permissions by role
export function userHasPermission(userRole: string, requiredPermission: Permission): boolean {
  const userPermissions = getRolePermissions(userRole).map(p => p.toString())
  return hasPermission(userPermissions, requiredPermission)
}

// Helper function for checking multiple permissions by role
export function userHasAnyPermission(userRole: string, requiredPermissions: Permission[]): boolean {
  const userPermissions = getRolePermissions(userRole).map(p => p.toString())
  return hasAnyPermission(userPermissions, requiredPermissions)
}

// Compatibility function: detects if first argument is a role string or permissions array
export function checkPermission(roleOrPermissions: string | string[], requiredPermission: Permission): boolean {
  if (typeof roleOrPermissions === 'string') {
    // It's a role, convert to permissions
    return userHasPermission(roleOrPermissions, requiredPermission)
  } else {
    // It's already a permissions array
    return hasPermission(roleOrPermissions, requiredPermission)
  }
}
