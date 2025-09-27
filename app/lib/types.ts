

import { 
  UserRole, 
  OrganizationStatus, 
  ContactStatus, 
  ConversationStatus, 
  ConversationPriority,
  MessageType,
  MessageDirection,
  WhatsAppConnectionType,
  WhatsAppConnectionStatus,
  KnowledgeSourceType,
  KnowledgeSourceStatus,
  ChunkProcessingStatus,
  IntegrationType,
  IntegrationStatus,
  EcommercePlatform
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

// =====================================
// CANALES DE WHATSAPP
// =====================================

export interface WhatsAppChannelSummary {
  id: string
  name: string
  phone: string
  connectionType: WhatsAppConnectionType
  status: WhatsAppConnectionStatus
  isActive: boolean
  isDefault: boolean
  messagesReceived: number
  messagesSent: number
  lastActivity?: Date
  connectedAt?: Date
}

export interface WhatsAppChannelDetail extends WhatsAppChannelSummary {
  organizationId: string
  qrCode?: string
  qrExpiration?: Date
  accessToken?: string
  appId?: string
  appSecret?: string
  webhookVerifyToken?: string
  phoneNumberId?: string
  businessAccountId?: string
  welcomeMessage?: string
  autoReplyMessage?: string
  workingHours?: {
    start: string
    end: string
    timezone?: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface WhatsAppChannelCreateRequest {
  name: string
  phone: string
  connectionType: WhatsAppConnectionType
  // Para conexión QR
  qrCode?: string
  // Para conexión API
  accessToken?: string
  appId?: string
  appSecret?: string
  webhookVerifyToken?: string
  phoneNumberId?: string
  businessAccountId?: string
  // Configuración
  welcomeMessage?: string
  autoReplyMessage?: string
  workingHours?: {
    start: string
    end: string
    timezone?: string
  }
  isDefault?: boolean
}

export interface QRCodeConnectionData {
  qrCode: string
  expiration: Date
  status: 'WAITING' | 'SCANNING' | 'SUCCESS' | 'EXPIRED' | 'ERROR'
  connectionId?: string
}

// Labels para los tipos de conexión
export const WHATSAPP_CONNECTION_TYPE_LABELS = {
  QR_CODE: 'Conexión Rápida (QR)',
  API_OFFICIAL: 'Conexión Profesional (API)'
} as const

export const WHATSAPP_CONNECTION_STATUS_LABELS = {
  DISCONNECTED: 'Desconectado',
  CONNECTING: 'Conectando',
  CONNECTED: 'Conectado',
  ERROR: 'Error',
  EXPIRED: 'Expirado'
} as const

export const WHATSAPP_CONNECTION_STATUS_COLORS = {
  DISCONNECTED: 'gray',
  CONNECTING: 'yellow',
  CONNECTED: 'green',
  ERROR: 'red',
  EXPIRED: 'orange'
} as const

// =====================================
// RESPUESTAS RÁPIDAS
// =====================================

export interface QuickReplySummary {
  id: string
  title: string
  shortcut: string
  content: string
  category?: string
  tags: string[]
  usageCount: number
  lastUsedAt?: Date
  createdAt: Date
  createdByName: string
}

export interface QuickReplyDetail extends QuickReplySummary {
  organizationId: string
  variables?: Record<string, string>
  isActive: boolean
  isGlobal: boolean
  createdBy: string
  modifiedBy?: string
  modifiedByName?: string
  updatedAt: Date
}

export interface QuickReplyCreateRequest {
  title: string
  shortcut: string
  content: string
  category?: string
  tags?: string[]
  variables?: Record<string, string>
  isGlobal?: boolean
}

export interface QuickReplyUpdateRequest extends Partial<QuickReplyCreateRequest> {
  isActive?: boolean
}

export interface QuickReplySearchFilters {
  category?: string
  tags?: string[]
  isActive?: boolean
  isGlobal?: boolean
  searchTerm?: string
}

// =====================================
// COMPOSITOR MEJORADO
// =====================================

export interface MessageComposerFile {
  id: string
  file: File
  preview?: string
  type: 'image' | 'document' | 'video' | 'audio'
  uploadProgress?: number
  error?: string
}

export interface AudioRecordingState {
  isRecording: boolean
  isPaused: boolean
  duration: number
  audioBlob?: Blob
  audioUrl?: string
  error?: string
}

export interface MessageComposerState {
  content: string
  files: MessageComposerFile[]
  audioRecording?: AudioRecordingState
  showQuickReplies: boolean
  quickReplySearch: string
  selectedQuickReply?: QuickReplySummary
  replyingTo?: MessageSummary
}

export interface SendMessageOptions {
  content: string
  type: MessageType
  files?: File[]
  audioBlob?: Blob
  replyToId?: string
  quickReplyId?: string
}

// Configuración de archivos permitidos
export const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
  video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
  audio: ['audio/mp3', 'audio/wav', 'audio/aac', 'audio/ogg']
} as const

export const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024, // 10MB
  document: 50 * 1024 * 1024, // 50MB
  video: 100 * 1024 * 1024, // 100MB
  audio: 20 * 1024 * 1024 // 20MB
} as const

// =====================================
// SISTEMA DE AUTOMATIZACIONES (IA ACTIVA)
// =====================================

import {
  AIIntentionType,
  AutomationConditionType,
  AutomationActionType
} from '@prisma/client'

export {
  AIIntentionType,
  AutomationConditionType,
  AutomationActionType
}

// Tipos para la configuración de automatizaciones
export interface AutomationRuleSummary {
  id: string
  name: string
  description?: string
  isActive: boolean
  priority: number
  executionCount: number
  lastExecutedAt?: Date
  successCount: number
  errorCount: number
  successRate: number
  createdByName: string
  createdAt: Date
  conditionsCount: number
  actionsCount: number
}

export interface AutomationRuleDetail extends AutomationRuleSummary {
  organizationId: string
  createdBy: string
  modifiedBy?: string
  modifiedByName?: string
  updatedAt: Date
  conditions: AutomationConditionDetail[]
  actions: AutomationActionDetail[]
}

export interface AutomationConditionDetail {
  id: string
  type: AutomationConditionType
  logicalOperator: string
  // Datos específicos según tipo
  intentionTypes: AIIntentionType[]
  keywords: string[]
  keywordMatchType?: string
  timeStart?: string
  timeEnd?: string
  weekdays: number[]
  timezone?: string
  messageCountMin?: number
  messageCountMax?: number
  responseTimeMin?: number
  responseTimeMax?: number
  metadata?: any
}

export interface AutomationActionDetail {
  id: string
  type: AutomationActionType
  executionOrder: number
  // Datos específicos según tipo
  tagName?: string
  tagColor?: string
  agentId?: string
  agentName?: string
  priority?: string
  replyMessage?: string
  replyDelay?: number
  targetAgentId?: string
  transferReason?: string
  taskTitle?: string
  taskDescription?: string
  taskDueDate?: Date
  notificationTitle?: string
  notificationMessage?: string
  notificationChannels: string[]
  metadata?: any
}

export interface AutomationExecutionSummary {
  id: string
  ruleId: string
  ruleName: string
  messageId?: string
  conversationId?: string
  contactId?: string
  contactName?: string
  success: boolean
  error?: string
  executionTime: number
  detectedIntentions: AIIntentionType[]
  confidenceScore?: number
  keywordsFound: string[]
  actionsExecuted: any
  actionsSkipped: any
  createdAt: Date
}

export interface AIAnalysisResult {
  detectedIntentions: AIIntentionType[]
  confidenceScore: number
  sentiment: 'positive' | 'negative' | 'neutral'
  keywordsExtracted: string[]
  aiProvider: string
  modelUsed: string
  processingTime: number
  analysisVersion: string
}

// Tipos para creación y actualización de reglas
export interface CreateAutomationRuleRequest {
  name: string
  description?: string
  priority?: number
  conditions: CreateAutomationConditionRequest[]
  actions: CreateAutomationActionRequest[]
  isActive?: boolean
}

export interface CreateAutomationConditionRequest {
  type: AutomationConditionType
  logicalOperator?: string
  intentionTypes?: AIIntentionType[]
  keywords?: string[]
  keywordMatchType?: string
  timeStart?: string
  timeEnd?: string
  weekdays?: number[]
  timezone?: string
  messageCountMin?: number
  messageCountMax?: number
  responseTimeMin?: number
  responseTimeMax?: number
  metadata?: any
}

export interface CreateAutomationActionRequest {
  type: AutomationActionType
  executionOrder?: number
  tagName?: string
  tagColor?: string
  agentId?: string
  priority?: string
  replyMessage?: string
  replyDelay?: number
  targetAgentId?: string
  transferReason?: string
  taskTitle?: string
  taskDescription?: string
  taskDueDate?: Date
  notificationTitle?: string
  notificationMessage?: string
  notificationChannels?: string[]
  metadata?: any
}

export interface UpdateAutomationRuleRequest extends Partial<CreateAutomationRuleRequest> {
  id: string
}

// Labels para el frontend
export const AI_INTENTION_LABELS = {
  SALES: 'Ventas',
  SUPPORT: 'Soporte',
  QUESTION: 'Pregunta',
  COMPLAINT: 'Queja',
  BOOKING: 'Reserva',
  PAYMENT: 'Pago',
  INFORMATION: 'Información',
  GREETING: 'Saludo',
  FAREWELL: 'Despedida',
  OTHER: 'Otro'
} as const

export const AI_INTENTION_COLORS = {
  SALES: 'green',
  SUPPORT: 'blue',
  QUESTION: 'yellow',
  COMPLAINT: 'red',
  BOOKING: 'purple',
  PAYMENT: 'orange',
  INFORMATION: 'cyan',
  GREETING: 'teal',
  FAREWELL: 'gray',
  OTHER: 'slate'
} as const

export const AUTOMATION_CONDITION_LABELS = {
  INTENTION_DETECTED: 'Intención detectada',
  KEYWORDS_CONTAINS: 'Contiene palabras clave',
  SENDER_IS_VIP: 'Remitente es VIP',
  TIME_RANGE: 'Horario específico',
  FIRST_MESSAGE: 'Primer mensaje',
  MESSAGE_COUNT: 'Número de mensajes',
  RESPONSE_TIME: 'Tiempo de respuesta'
} as const

export const AUTOMATION_ACTION_LABELS = {
  ADD_TAG: 'Agregar etiqueta',
  ASSIGN_AGENT: 'Asignar agente',
  SET_PRIORITY: 'Establecer prioridad',
  AUTO_REPLY: 'Respuesta automática',
  MARK_VIP: 'Marcar como VIP',
  TRANSFER_CONVERSATION: 'Transferir conversación',
  CREATE_TASK: 'Crear tarea',
  SEND_NOTIFICATION: 'Enviar notificación'
} as const

// Filtros para automatizaciones
export interface AutomationFilters {
  isActive?: boolean
  priority?: number[]
  intentions?: AIIntentionType[]
  conditionTypes?: AutomationConditionType[]
  actionTypes?: AutomationActionType[]
  dateRange?: {
    from: Date
    to: Date
  }
  searchTerm?: string
}

export interface AutomationStats {
  totalRules: number
  activeRules: number
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  avgExecutionTime: number
  executionsToday: number
  topIntentions: Array<{
    intention: AIIntentionType
    count: number
  }>
  topActions: Array<{
    action: AutomationActionType
    count: number
  }>
}

// Constructor visual de reglas
export interface RuleBuilderState {
  ruleName: string
  ruleDescription: string
  priority: number
  conditions: ConditionBuilderItem[]
  actions: ActionBuilderItem[]
  isActive: boolean
}

export interface ConditionBuilderItem {
  id: string
  type: AutomationConditionType
  logicalOperator: 'AND' | 'OR'
  configuration: any
  isValid: boolean
}

export interface ActionBuilderItem {
  id: string
  type: AutomationActionType
  executionOrder: number
  configuration: any
  isValid: boolean
}

// =====================================
// BASE DE CONOCIMIENTO (KNOWLEDGE BASE)
// =====================================

export {
  KnowledgeSourceType,
  KnowledgeSourceStatus,
  ChunkProcessingStatus
}

// Tipos para la base de conocimiento
export interface KnowledgeSourceSummary {
  id: string
  name: string
  type: KnowledgeSourceType
  status: KnowledgeSourceStatus
  originalFileName?: string
  sourceUrl?: string
  fileSize?: number
  fileMimeType?: string
  totalChunks: number
  processedChunks: number
  failedChunks: number
  contentQuality?: number
  usageCount: number
  lastUsedAt?: Date
  tags: string[]
  createdByName: string
  createdAt: Date
  processedAt?: Date
  lastError?: string
  processingProgress: number
}

export interface KnowledgeSourceDetail extends KnowledgeSourceSummary {
  organizationId: string
  textContent?: string
  chunkSize: number
  chunkOverlap: number
  metadata?: any
  retryCount: number
  maxRetries: number
  createdBy: string
  updatedAt: Date
  chunks?: KnowledgeChunkSummary[]
}

export interface KnowledgeChunkSummary {
  id: string
  sourceId: string
  content: string
  chunkIndex: number
  status: ChunkProcessingStatus
  wordCount: number
  characterCount: number
  language?: string
  title?: string
  section?: string
  pageNumber?: number
  contentQuality?: number
  usageCount: number
  lastUsedAt?: Date
  createdAt: Date
  processedAt?: Date
  processingError?: string
}

export interface KnowledgeEmbeddingSummary {
  id: string
  chunkId: string
  modelUsed: string
  embeddingVersion: string
  dimensions: number
  quality?: number
  confidence?: number
  searchCount: number
  avgSimilarity?: number
  lastSearchAt?: Date
  processingTime: number
  providerUsed: string
  costIncurred?: number
  createdAt: Date
}

export interface KnowledgeUsageSummary {
  id: string
  organizationId: string
  userId?: string
  userName?: string
  conversationId?: string
  query: string
  queryType: string
  resultsFound: number
  resultsUsed: number
  avgSimilarity?: number
  satisfactionScore?: number
  responseGenerated: boolean
  responseQuality?: number
  processingTime: number
  createdAt: Date
}

// Tipos para acciones de la base de conocimiento
export interface CreateKnowledgeSourceRequest {
  name: string
  type: KnowledgeSourceType
  // Para archivos
  file?: File
  // Para URLs
  sourceUrl?: string
  crawlDepth?: number
  // Para texto manual
  textContent?: string
  // Configuración
  chunkSize?: number
  chunkOverlap?: number
  tags?: string[]
  metadata?: any
}

export interface UpdateKnowledgeSourceRequest {
  id: string
  name?: string
  status?: KnowledgeSourceStatus
  tags?: string[]
  metadata?: any
  chunkSize?: number
  chunkOverlap?: number
}

export interface ProcessKnowledgeSourceRequest {
  sourceId: string
  forceReprocess?: boolean
  chunkSize?: number
  chunkOverlap?: number
}

export interface SearchKnowledgeRequest {
  query: string
  organizationId: string
  maxResults?: number
  minSimilarity?: number
  sourceTypes?: KnowledgeSourceType[]
  sourceTags?: string[]
  includeDisabled?: boolean
  conversationId?: string
  userId?: string
}

export interface SearchKnowledgeResult {
  chunks: Array<{
    id: string
    sourceId: string
    sourceName: string
    content: string
    similarity: number
    title?: string
    section?: string
    pageNumber?: number
    metadata?: any
  }>
  totalResults: number
  avgSimilarity: number
  processingTime: number
  sourcesConsulted: string[]
}

export interface KnowledgeStats {
  totalSources: number
  activeSources: number
  processingSources: number
  errorSources: number
  totalChunks: number
  processedChunks: number
  failedChunks: number
  totalUsage: number
  usageThisMonth: number
  avgQuality: number
  topSources: Array<{
    id: string
    name: string
    usageCount: number
    quality?: number
  }>
  recentActivity: Array<{
    id: string
    action: string
    sourceName: string
    timestamp: Date
    status: string
  }>
}

// Filtros para la base de conocimiento
export interface KnowledgeFilters {
  status?: KnowledgeSourceStatus[]
  type?: KnowledgeSourceType[]
  tags?: string[]
  quality?: {
    min?: number
    max?: number
  }
  usage?: {
    min?: number
    max?: number
  }
  dateRange?: {
    from: Date
    to: Date
  }
  searchTerm?: string
}

// Configuración de archivos permitidos para conocimiento
export const KNOWLEDGE_FILE_TYPES = {
  pdf: ['application/pdf'],
  document: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  text: ['text/plain', 'text/markdown', 'text/csv'],
  web: ['text/html']
} as const

export const MAX_KNOWLEDGE_FILE_SIZE = 50 * 1024 * 1024 // 50MB

// Labels para el frontend
export const KNOWLEDGE_SOURCE_TYPE_LABELS = {
  FILE: 'Archivo',
  URL: 'Página Web',
  TEXT: 'Texto Manual'
} as const

export const KNOWLEDGE_SOURCE_STATUS_LABELS = {
  UPLOADING: 'Subiendo',
  PROCESSING: 'Procesando',
  CHUNKING: 'Fragmentando',
  EMBEDDING: 'Generando Embeddings',
  ACTIVE: 'Activo',
  ERROR: 'Error',
  DISABLED: 'Deshabilitado'
} as const

export const KNOWLEDGE_SOURCE_STATUS_COLORS = {
  UPLOADING: 'blue',
  PROCESSING: 'yellow',
  CHUNKING: 'orange',
  EMBEDDING: 'purple',
  ACTIVE: 'green',
  ERROR: 'red',
  DISABLED: 'gray'
} as const

export const CHUNK_PROCESSING_STATUS_LABELS = {
  PENDING: 'Pendiente',
  PROCESSING: 'Procesando',
  COMPLETED: 'Completado',
  FAILED: 'Fallido'
} as const

// Configuración de procesamiento por defecto
export const DEFAULT_CHUNK_SIZE = 1000
export const DEFAULT_CHUNK_OVERLAP = 100
export const DEFAULT_MAX_CHUNKS_PER_SOURCE = 1000
export const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-small'
export const DEFAULT_EMBEDDING_DIMENSIONS = 1536

// Tipos para el procesamiento de contenido
export interface ContentProcessor {
  extractText(file: File): Promise<string>
  extractMetadata(file: File): Promise<any>
  splitIntoChunks(content: string, chunkSize: number, overlap: number): string[]
  detectLanguage(content: string): string
  calculateQuality(content: string): number
}

export interface EmbeddingProvider {
  generateEmbedding(text: string): Promise<number[]>
  calculateSimilarity(embedding1: number[], embedding2: number[]): number
  getDimensions(): number
  getModelName(): string
  getCost(tokenCount: number): number
}

// =============================================================================
// TIPOS PARA EL SISTEMA DE INTEGRACIONES
// =============================================================================

// Integración base con información completa
export interface IntegrationWithDetails {
  id: string
  name: string
  displayName: string
  description?: string
  type: IntegrationType
  platform?: EcommercePlatform
  iconUrl?: string
  brandColor?: string
  isActive: boolean
  version: string
  documentation?: string
  authType: string
  authFields: any
  supportedFeatures: any
  connectionStatus?: IntegrationStatus
  connectionId?: string
  createdAt: Date
  updatedAt: Date
}

// Conexión de organización con integración
export interface OrganizationIntegrationDetails {
  id: string
  organizationId: string
  integrationId: string
  integration: IntegrationWithDetails
  status: IntegrationStatus
  config: any
  name?: string
  storeUrl?: string
  storeName?: string
  storeId?: string
  lastSyncAt?: Date
  syncErrors?: any
  syncStats?: any
  features?: any
  createdAt: Date
  updatedAt: Date
  configuredBy?: string
  configuredUser?: {
    id: string
    name?: string
    email: string
  }
}

// Datos para conectar una nueva integración
export interface IntegrationConnectionData {
  integrationId: string
  name?: string
  credentials: Record<string, string>
  config?: Record<string, any>
  features?: string[]
}

// Estadísticas de integraciones
export interface IntegrationsStats {
  total: number
  connected: number
  disconnected: number
  error: number
  byType: Record<IntegrationType, number>
  recentActivity: Array<{
    id: string
    action: string
    integrationName: string
    timestamp: Date
    status: string
  }>
}

// Labels y configuraciones para el frontend
export const INTEGRATION_TYPE_LABELS = {
  ECOMMERCE: 'E-commerce',
  CRM: 'CRM',
  ERP: 'ERP',
  PAYMENT: 'Pagos',
  ANALYTICS: 'Análisis',
  MARKETING: 'Marketing',
  SOCIAL_MEDIA: 'Redes Sociales',
  OTHER: 'Otros'
} as const

export const INTEGRATION_STATUS_LABELS = {
  AVAILABLE: 'Disponible',
  CONNECTED: 'Conectado',
  DISCONNECTED: 'Desconectado',
  ERROR: 'Error',
  PENDING: 'Pendiente'
} as const

export const INTEGRATION_STATUS_COLORS = {
  AVAILABLE: 'gray',
  CONNECTED: 'green',
  DISCONNECTED: 'yellow',
  ERROR: 'red',
  PENDING: 'blue'
} as const

export const ECOMMERCE_PLATFORM_LABELS = {
  SHOPIFY: 'Shopify',
  WOOCOMMERCE: 'WooCommerce',
  TIENDANUBE: 'TiendaNube',
  MAGENTO: 'Magento',
  PRESTASHOP: 'PrestaShop',
  OTHER: 'Otras'
} as const

// Configuraciones por plataforma de e-commerce
export const ECOMMERCE_CONFIGS = {
  SHOPIFY: {
    displayName: 'Shopify',
    description: 'Conecta tu tienda Shopify para consultar productos, pedidos e inventario',
    authType: 'oauth',
    authFields: ['shop_domain', 'access_token'],
    iconUrl: '/integrations/shopify.svg',
    brandColor: '#7AB55C',
    supportedFeatures: ['products', 'orders', 'customers', 'inventory'],
    documentation: 'https://docs.shopify.com/api'
  },
  WOOCOMMERCE: {
    displayName: 'WooCommerce',
    description: 'Conecta tu tienda WooCommerce para gestionar productos y pedidos',
    authType: 'api_key',
    authFields: ['site_url', 'consumer_key', 'consumer_secret'],
    iconUrl: '/integrations/woocommerce.svg',
    brandColor: '#7F54B3',
    supportedFeatures: ['products', 'orders', 'customers'],
    documentation: 'https://woocommerce.github.io/woocommerce-rest-api-docs/'
  },
  TIENDANUBE: {
    displayName: 'TiendaNube',
    description: 'Conecta tu tienda TiendaNube para sincronizar catálogo y pedidos',
    authType: 'oauth',
    authFields: ['store_id', 'access_token'],
    iconUrl: '/integrations/tiendanube.svg',
    brandColor: '#FF6900',
    supportedFeatures: ['products', 'orders', 'customers'],
    documentation: 'https://developers.tiendanube.com/'
  }
} as const

// Tipos para consultas de e-commerce
export interface EcommerceQuery {
  type: 'product' | 'order' | 'customer' | 'inventory'
  params: Record<string, any>
}

export interface EcommerceProduct {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  stock?: number
  sku?: string
  images?: string[]
  categories?: string[]
  status: 'active' | 'inactive' | 'draft'
  url?: string
}

export interface EcommerceOrder {
  id: string
  orderNumber: string
  status: string
  total: number
  currency: string
  customerEmail?: string
  customerName?: string
  items: Array<{
    productId: string
    productName: string
    quantity: number
    price: number
  }>
  shippingAddress?: any
  createdAt: Date
  updatedAt?: Date
}

export interface EcommerceCustomer {
  id: string
  email: string
  name?: string
  phone?: string
  totalOrders?: number
  totalSpent?: number
  createdAt: Date
  lastOrderAt?: Date
}

