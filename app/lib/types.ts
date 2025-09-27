

import { 
  UserRole, 
  OrganizationStatus, 
  ContactStatus, 
  ConversationStatus, 
  ConversationPriority,
  MessageType,
  MessageDirection
} from '@prisma/client'

export type Expense = {
  id: string
  amount: number
  category: string
  description: string
  date: Date
}

export type ExpenseFormData = Omit<Expense, 'id' | 'date'> & {
  date: string
}

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Other'
] as const

export type DateRange = {
  from: Date | undefined
  to: Date | undefined
}

// Tipos de jerarquía de roles
export interface RoleHierarchy {
  level: number
  label: string
  description: string
  color: string
  permissions: string[]
}

export const ROLE_HIERARCHY_CONFIG: Record<UserRole, RoleHierarchy> = {
  SUPER_ADMIN: {
    level: 4,
    label: 'Super Administrador',
    description: 'Acceso total a la plataforma - Gestiona todas las organizaciones',
    color: 'red',
    permissions: ['*'] // Todos los permisos
  },
  DISTRIBUIDOR: {
    level: 3,
    label: 'Distribuidor',
    description: 'Gestiona múltiples organizaciones cliente - Maneja comisiones',
    color: 'purple',
    permissions: ['manage_client_organizations', 'view_commissions', 'create_accounts']
  },
  PROPIETARIO: {
    level: 2,
    label: 'Propietario',
    description: 'Administra completamente su organización - Gestiona equipo',
    color: 'blue',
    permissions: ['manage_organization', 'manage_users', 'configure_all', 'use_ai_broker']
  },
  AGENTE: {
    level: 1,
    label: 'Agente',
    description: 'Atiende conversaciones asignadas - Acceso limitado',
    color: 'green',
    permissions: ['view_assigned_conversations', 'use_basic_features', 'use_ai_broker']
  }
}

// Tipos para gestión de organizaciones
export interface OrganizationSummary {
  id: string
  name: string
  slug: string
  status: OrganizationStatus
  userCount: number
  activeUsers: number
  plan: string
  createdAt: Date
  lastActivity?: Date
}

export interface UserSummary {
  id: string
  name: string
  email: string
  role: UserRole
  organizationId: string
  organizationName: string
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
}

// Tipos para dashboard
export interface DashboardStats {
  totalOrganizations?: number
  activeOrganizations?: number
  totalUsers?: number
  activeUsers?: number
  monthlyRevenue?: number
  growth?: number
  conversationsToday?: number
  responseTime?: string
}

export interface ConversationSummary {
  id: string
  customerName: string
  customerPhone: string
  lastMessage: string
  assignedAgent?: string
  status: 'active' | 'pending' | 'resolved'
  priority: 'high' | 'medium' | 'low'
  unreadCount: number
  updatedAt: Date
}

// Tipos para filtros de datos según jerarquía
export interface HierarchyFilter {
  organizationIds?: string[] | 'ALL'
  userIds?: string[]
  roles?: UserRole[]
  includeSubordinates: boolean
}

export interface AccessScope {
  canViewAllOrganizations: boolean
  canManageUsers: boolean
  canCreateOrganizations: boolean
  canViewBilling: boolean
  canConfigureSystem: boolean
  canUseAIBroker: boolean
  canManageAIProviders: boolean
  availableOrganizations: string[]
  managableRoles: UserRole[]
}

// Tipos para API responses
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Contexto de operaciones
export interface OperationContext {
  userId: string
  organizationId: string
  role: UserRole
  permissions: string[]
  accessScope: AccessScope
}

// Nuevos tipos para AI Broker
export interface AIBrokerStats {
  totalRequests: number
  totalCost: number
  averageResponseTime: number
  topProviders: Array<{ name: string; usage: number }>
  requestsToday: number
  costToday: number
  successRate: number
  failureRate: number
}

export interface AIProviderStats {
  id: string
  name: string
  displayName: string
  totalRequests: number
  totalCost: number
  averageResponseTime: number
  successRate: number
  lastUsed?: Date
  isActive: boolean
  isDefault: boolean
}

export interface WalletSummary {
  organizationId: string
  organizationName: string
  balance: number
  totalSpent: number
  totalRecharged: number
  transactionCount: number
  lowBalanceAlert: boolean
  currency: string
  lastTransaction?: Date
}

// Enum para errores específicos del AI Broker
export enum AIBrokerErrorType {
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  NO_PROVIDER_AVAILABLE = 'NO_PROVIDER_AVAILABLE',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

// Tipos para monitoreo y logging
export interface AIBrokerLogEntry {
  id: string
  organizationId: string
  userId?: string
  timestamp: Date
  requestType: string
  provider: string
  model: string
  inputTokens: number
  outputTokens: number
  cost: number
  processingTime: number
  success: boolean
  error?: string
  metadata?: Record<string, any>
}

export interface SystemHealthCheck {
  timestamp: Date
  services: {
    database: { status: 'healthy' | 'degraded' | 'down'; responseTime: number }
    aiBroker: { status: 'healthy' | 'degraded' | 'down'; activeProviders: number }
    wallet: { status: 'healthy' | 'degraded' | 'down'; totalBalance: number }
  }
  metrics: {
    requestsPerMinute: number
    averageResponseTime: number
    errorRate: number
  }
}

// ===========================================
// CENTRO DE COMUNICACIÓN (CRM) - TIPOS
// ===========================================

// Tipos para el CRM
export interface ContactSummary {
  id: string
  name: string
  phone: string
  email?: string
  avatar?: string
  status: ContactStatus
  isVip: boolean
  lastContact?: Date
  unreadCount: number
  tags: Array<{
    id: string
    name: string
    color?: string
  }>
  lastConversation?: {
    id: string
    lastMessageText?: string
    lastMessageAt?: Date
    status: ConversationStatus
  }
}

export interface ConversationSummary2 {
  id: string
  contact: {
    id: string
    name: string
    phone: string
    avatar?: string
    isVip: boolean
  }
  status: ConversationStatus
  priority: ConversationPriority
  assignedAgent?: {
    id: string
    name: string
  }
  messageCount: number
  unreadCount: number
  lastMessageAt?: Date
  lastMessageText?: string
  lastMessageFrom?: MessageDirection
}

export interface MessageSummary {
  id: string
  conversationId: string
  direction: MessageDirection
  type: MessageType
  content: string
  attachmentUrl?: string
  attachmentType?: string
  attachmentName?: string
  sentBy?: string
  sentByName?: string
  isRead: boolean
  readAt?: Date
  sentAt: Date
  replyTo?: {
    id: string
    content: string
    sentByName?: string
  }
}

export interface ContactDetail extends ContactSummary {
  firstName?: string
  lastName?: string
  company?: string
  jobTitle?: string
  address?: string
  city?: string
  country?: string
  source?: string
  leadScore?: number
  lifetimeValue?: number
  firstContact?: Date
  notes: Array<{
    id: string
    content: string
    isImportant: boolean
    createdBy: string
    createdByName: string
    createdAt: Date
  }>
}

export interface ConversationDetail {
  id: string
  contact: ContactSummary
  status: ConversationStatus
  priority: ConversationPriority
  assignedAgent?: {
    id: string
    name: string
  }
  title?: string
  summary?: string
  messageCount: number
  unreadCount: number
  messages: MessageSummary[]
  createdAt: Date
  updatedAt: Date
  closedAt?: Date
}

// Tipos para filtros del CRM
export interface CRMFilters {
  status?: ConversationStatus[]
  priority?: ConversationPriority[]
  assignedAgent?: string
  contactStatus?: ContactStatus[]
  tags?: string[]
  dateRange?: {
    from: Date
    to: Date
  }
  searchTerm?: string
}

// Tipos para estadísticas del CRM
export interface CRMStats {
  totalContacts: number
  activeConversations: number
  pendingConversations: number
  resolvedConversations: number
  unreadMessages: number
  averageResponseTime: number
  conversationsToday: number
  newContactsThisWeek: number
  vipContacts: number
}

// Tipos para acciones del CRM
export interface SendMessageRequest {
  conversationId: string
  content: string
  type: MessageType
  attachmentUrl?: string
  attachmentType?: string
  attachmentName?: string
  replyToId?: string
}

export interface CreateContactRequest {
  name: string
  phone: string
  email?: string
  firstName?: string
  lastName?: string
  company?: string
  source?: string
  tags?: string[]
}

export interface CreateConversationRequest {
  contactId: string
  initialMessage?: string
  priority?: ConversationPriority
  assignedAgentId?: string
}

export interface UpdateConversationRequest {
  status?: ConversationStatus
  priority?: ConversationPriority
  assignedAgentId?: string | null
  title?: string
  summary?: string
}

export interface AddContactNoteRequest {
  contactId: string
  content: string
  isImportant?: boolean
}

export interface AddContactTagRequest {
  contactId: string
  name: string
  color?: string
}

// Enums para el frontend
export const CONVERSATION_STATUS_LABELS = {
  OPEN: 'Abierta',
  PENDING: 'Pendiente',
  RESOLVED: 'Resuelta',
  TRANSFERRED: 'Transferida',
  ARCHIVED: 'Archivada'
} as const

export const CONVERSATION_PRIORITY_LABELS = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Urgente'
} as const

export const CONVERSATION_PRIORITY_COLORS = {
  LOW: 'gray',
  MEDIUM: 'blue',
  HIGH: 'orange',
  URGENT: 'red'
} as const

export const MESSAGE_TYPE_LABELS = {
  TEXT: 'Texto',
  IMAGE: 'Imagen',
  DOCUMENT: 'Documento',
  AUDIO: 'Audio',
  VIDEO: 'Video',
  LOCATION: 'Ubicación',
  CONTACT: 'Contacto',
  SYSTEM: 'Sistema'
} as const

