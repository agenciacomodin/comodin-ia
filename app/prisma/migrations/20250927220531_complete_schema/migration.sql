-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PROPIETARIO', 'AGENTE', 'DISTRIBUIDOR', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'TRIAL');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'STARTER', 'PREMIUM', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'UNPAID', 'INCOMPLETE', 'TRIALING');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE', 'MERCADO_PAGO');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELED');

-- CreateEnum
CREATE TYPE "AIUsageType" AS ENUM ('CHAT_RESPONSE', 'TEXT_ANALYSIS', 'SENTIMENT_ANALYSIS', 'CONTENT_GENERATION', 'TRANSLATION', 'SUMMARY', 'OTHER');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('WALLET_RECHARGE', 'AI_USAGE_DEDUCTION', 'REFUND', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('OPEN', 'PENDING', 'RESOLVED', 'TRANSFERRED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ConversationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'DOCUMENT', 'AUDIO', 'VIDEO', 'LOCATION', 'CONTACT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('INCOMING', 'OUTGOING');

-- CreateEnum
CREATE TYPE "WhatsAppConnectionType" AS ENUM ('QR_CODE', 'API_OFFICIAL');

-- CreateEnum
CREATE TYPE "WhatsAppConnectionStatus" AS ENUM ('DISCONNECTED', 'CONNECTING', 'CONNECTED', 'ERROR', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AIIntentionType" AS ENUM ('SALES', 'SUPPORT', 'QUESTION', 'COMPLAINT', 'BOOKING', 'PAYMENT', 'INFORMATION', 'GREETING', 'FAREWELL', 'OTHER');

-- CreateEnum
CREATE TYPE "AutomationConditionType" AS ENUM ('INTENTION_DETECTED', 'KEYWORDS_CONTAINS', 'SENDER_IS_VIP', 'TIME_RANGE', 'FIRST_MESSAGE', 'MESSAGE_COUNT', 'RESPONSE_TIME');

-- CreateEnum
CREATE TYPE "AutomationActionType" AS ENUM ('ADD_TAG', 'ASSIGN_AGENT', 'SET_PRIORITY', 'AUTO_REPLY', 'MARK_VIP', 'TRANSFER_CONVERSATION', 'CREATE_TASK', 'SEND_NOTIFICATION');

-- CreateEnum
CREATE TYPE "KnowledgeSourceType" AS ENUM ('FILE', 'URL', 'TEXT');

-- CreateEnum
CREATE TYPE "KnowledgeSourceStatus" AS ENUM ('UPLOADING', 'PROCESSING', 'CHUNKING', 'EMBEDDING', 'ACTIVE', 'ERROR', 'DISABLED');

-- CreateEnum
CREATE TYPE "ChunkProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "IntegrationType" AS ENUM ('ECOMMERCE', 'CRM', 'ERP', 'PAYMENT', 'ANALYTICS', 'MARKETING', 'SOCIAL_MEDIA', 'OTHER');

-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('AVAILABLE', 'CONNECTED', 'DISCONNECTED', 'ERROR', 'PENDING');

-- CreateEnum
CREATE TYPE "EcommercePlatform" AS ENUM ('SHOPIFY', 'WOOCOMMERCE', 'TIENDANUBE', 'MAGENTO', 'PRESTASHOP', 'OTHER');

-- CreateEnum
CREATE TYPE "TemplateStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'COMPLETED', 'PAUSED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('IMMEDIATE', 'SCHEDULED', 'DRIP', 'AB_TEST');

-- CreateEnum
CREATE TYPE "AudienceFilterType" AS ENUM ('INCLUDE_TAG', 'EXCLUDE_TAG', 'CHANNEL', 'VIP_STATUS', 'LAST_CONTACT', 'CONVERSATION_STATUS');

-- CreateEnum
CREATE TYPE "AudienceFilterOperator" AS ENUM ('AND', 'OR');

-- CreateEnum
CREATE TYPE "MessageDeliveryStatus" AS ENUM ('PENDING', 'QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "country" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "logo" TEXT,
    "status" "OrganizationStatus" NOT NULL DEFAULT 'TRIAL',
    "currentPlan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "subscriptionId" TEXT,
    "billingEmail" TEXT,
    "maxUsers" INTEGER NOT NULL DEFAULT 1,
    "maxMessages" INTEGER NOT NULL DEFAULT 100,
    "maxIntegrations" INTEGER NOT NULL DEFAULT 1,
    "hasAdvancedFeatures" BOOLEAN NOT NULL DEFAULT false,
    "currentUsers" INTEGER NOT NULL DEFAULT 0,
    "currentMessages" INTEGER NOT NULL DEFAULT 0,
    "usageResetDate" TIMESTAMP(3),
    "timezone" TEXT NOT NULL DEFAULT 'America/Mexico_City',
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    "language" TEXT NOT NULL DEFAULT 'es',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT,
    "fullName" TEXT,
    "image" TEXT,
    "phone" TEXT,
    "country" TEXT,
    "organizationId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'AGENTE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "timezone" TEXT,
    "language" TEXT DEFAULT 'es',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'AGENTE',
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "organizationId" TEXT NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "invitedByName" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "message" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "paymentProvider" "PaymentProvider" NOT NULL,
    "stripeSubscriptionId" TEXT,
    "stripeCustomerId" TEXT,
    "mercadopagoPreapprovalId" TEXT,
    "mercadopagoPayerId" TEXT,
    "pricePerMonth" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "billingCycle" TEXT NOT NULL DEFAULT 'monthly',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "trialStart" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentProvider" "PaymentProvider" NOT NULL,
    "stripePaymentIntentId" TEXT,
    "stripeChargeId" TEXT,
    "mercadopagoPaymentId" TEXT,
    "description" TEXT,
    "invoiceUrl" TEXT,
    "receiptUrl" TEXT,
    "paidAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_wallets" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "balance" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "totalSpent" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "totalRecharged" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "transactionCount" INTEGER NOT NULL DEFAULT 0,
    "lowBalanceThreshold" DECIMAL(10,2) NOT NULL DEFAULT 10.00,
    "alertsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lastLowBalanceAlert" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_transactions" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "providerId" TEXT,
    "usageType" "AIUsageType" NOT NULL,
    "providerName" TEXT NOT NULL,
    "modelUsed" TEXT,
    "providerCost" DECIMAL(10,6) NOT NULL,
    "clientCost" DECIMAL(10,6) NOT NULL,
    "margin" DECIMAL(5,4) NOT NULL DEFAULT 0.30,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "totalTokens" INTEGER,
    "processingTime" INTEGER,
    "description" TEXT,
    "metadata" JSONB,
    "userId" TEXT,
    "userName" TEXT,
    "balanceAfter" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_transactions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "description" TEXT NOT NULL,
    "reference" TEXT,
    "paymentProvider" "PaymentProvider",
    "aiTransactionId" TEXT,
    "balanceBefore" DECIMAL(10,2) NOT NULL,
    "balanceAfter" DECIMAL(10,2) NOT NULL,
    "userId" TEXT,
    "userName" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_providers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "apiUrl" TEXT NOT NULL,
    "apiKeyName" TEXT NOT NULL DEFAULT 'API_KEY',
    "encryptedApiKey" TEXT NOT NULL,
    "defaultModel" TEXT,
    "availableModels" JSONB,
    "inputPricePerToken" DECIMAL(10,8),
    "outputPricePerToken" DECIMAL(10,8),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "maxTokensPerRequest" INTEGER,
    "rateLimitPerMinute" INTEGER,
    "metadata" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "updatedBy" TEXT,
    "updatedByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "ai_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "avatar" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "company" TEXT,
    "jobTitle" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "timezone" TEXT,
    "status" "ContactStatus" NOT NULL DEFAULT 'ACTIVE',
    "isVip" BOOLEAN NOT NULL DEFAULT false,
    "whatsappId" TEXT,
    "whatsappName" TEXT,
    "lastSeen" TIMESTAMP(3),
    "source" TEXT,
    "leadScore" INTEGER,
    "lifetimeValue" DECIMAL(10,2),
    "firstContact" TIMESTAMP(3),
    "lastContact" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_tags" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "description" TEXT,
    "createdBy" TEXT,
    "createdByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_notes" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "status" "ConversationStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "ConversationPriority" NOT NULL DEFAULT 'MEDIUM',
    "assignedAgentId" TEXT,
    "assignedAgentName" TEXT,
    "title" TEXT,
    "summary" TEXT,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "lastMessageAt" TIMESTAMP(3),
    "lastMessageText" TEXT,
    "lastMessageFrom" "MessageDirection",
    "firstResponseAt" TIMESTAMP(3),
    "avgResponseTime" INTEGER,
    "whatsappChatId" TEXT,
    "whatsappChannelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "direction" "MessageDirection" NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "content" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "attachmentType" TEXT,
    "attachmentName" TEXT,
    "attachmentSize" INTEGER,
    "whatsappId" TEXT,
    "whatsappStatus" TEXT,
    "whatsappChannelId" TEXT,
    "sentBy" TEXT,
    "sentByName" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "replyToId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_channels" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "connectionType" "WhatsAppConnectionType" NOT NULL,
    "status" "WhatsAppConnectionStatus" NOT NULL DEFAULT 'DISCONNECTED',
    "qrCode" TEXT,
    "qrExpiration" TIMESTAMP(3),
    "accessToken" TEXT,
    "appId" TEXT,
    "appSecret" TEXT,
    "webhookVerifyToken" TEXT,
    "phoneNumberId" TEXT,
    "businessAccountId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "welcomeMessage" TEXT,
    "autoReplyMessage" TEXT,
    "workingHours" JSONB,
    "messagesReceived" INTEGER NOT NULL DEFAULT 0,
    "messagesSent" INTEGER NOT NULL DEFAULT 0,
    "lastActivity" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "connectedAt" TIMESTAMP(3),

    CONSTRAINT "whatsapp_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quick_replies" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortcut" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "variables" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "modifiedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quick_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_rules" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "executionCount" INTEGER NOT NULL DEFAULT 0,
    "lastExecutedAt" TIMESTAMP(3),
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "modifiedBy" TEXT,
    "modifiedByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_conditions" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "type" "AutomationConditionType" NOT NULL,
    "logicalOperator" TEXT NOT NULL DEFAULT 'AND',
    "intentionTypes" "AIIntentionType"[] DEFAULT ARRAY[]::"AIIntentionType"[],
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "keywordMatchType" TEXT DEFAULT 'ANY',
    "timeStart" TEXT,
    "timeEnd" TEXT,
    "weekdays" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "timezone" TEXT,
    "messageCountMin" INTEGER,
    "messageCountMax" INTEGER,
    "responseTimeMin" INTEGER,
    "responseTimeMax" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automation_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_actions" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "type" "AutomationActionType" NOT NULL,
    "executionOrder" INTEGER NOT NULL DEFAULT 1,
    "tagName" TEXT,
    "tagColor" TEXT,
    "agentId" TEXT,
    "agentName" TEXT,
    "priority" "ConversationPriority",
    "replyMessage" TEXT,
    "replyDelay" INTEGER DEFAULT 0,
    "targetAgentId" TEXT,
    "transferReason" TEXT,
    "taskTitle" TEXT,
    "taskDescription" TEXT,
    "taskDueDate" TIMESTAMP(3),
    "notificationTitle" TEXT,
    "notificationMessage" TEXT,
    "notificationChannels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automation_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_executions" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "messageId" TEXT,
    "conversationId" TEXT,
    "contactId" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "executionTime" INTEGER NOT NULL DEFAULT 0,
    "detectedIntentions" "AIIntentionType"[] DEFAULT ARRAY[]::"AIIntentionType"[],
    "confidenceScore" DECIMAL(5,4),
    "keywordsFound" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "aiAnalysis" JSONB,
    "actionsExecuted" JSONB,
    "actionsSkipped" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automation_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_analysis_cache" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "detectedIntentions" "AIIntentionType"[] DEFAULT ARRAY[]::"AIIntentionType"[],
    "confidenceScore" DECIMAL(5,4) NOT NULL,
    "sentiment" TEXT,
    "keywordsExtracted" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "aiProvider" TEXT NOT NULL,
    "modelUsed" TEXT NOT NULL,
    "processingTime" INTEGER NOT NULL,
    "analysisVersion" TEXT NOT NULL DEFAULT '1.0',
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_analysis_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_cache" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "promptHash" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "originalProvider" TEXT NOT NULL,
    "originalModel" TEXT NOT NULL,
    "originalCost" DECIMAL(10,6) NOT NULL,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_sources" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "KnowledgeSourceType" NOT NULL,
    "status" "KnowledgeSourceStatus" NOT NULL DEFAULT 'UPLOADING',
    "originalFileName" TEXT,
    "fileUrl" TEXT,
    "fileMimeType" TEXT,
    "fileSize" INTEGER,
    "sourceUrl" TEXT,
    "crawlDepth" INTEGER DEFAULT 1,
    "textContent" TEXT,
    "totalChunks" INTEGER NOT NULL DEFAULT 0,
    "processedChunks" INTEGER NOT NULL DEFAULT 0,
    "failedChunks" INTEGER NOT NULL DEFAULT 0,
    "chunkSize" INTEGER NOT NULL DEFAULT 1000,
    "chunkOverlap" INTEGER NOT NULL DEFAULT 100,
    "contentQuality" DECIMAL(3,2),
    "lastUsedAt" TIMESTAMP(3),
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastError" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "createdBy" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "knowledge_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_chunks" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "startPosition" INTEGER,
    "endPosition" INTEGER,
    "status" "ChunkProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "processingError" TEXT,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "characterCount" INTEGER NOT NULL DEFAULT 0,
    "language" TEXT DEFAULT 'es',
    "title" TEXT,
    "section" TEXT,
    "pageNumber" INTEGER,
    "contentQuality" DECIMAL(3,2),
    "keywordDensity" JSONB,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "relevanceScore" DECIMAL(5,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "knowledge_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_embeddings" (
    "id" TEXT NOT NULL,
    "chunkId" TEXT NOT NULL,
    "modelUsed" TEXT NOT NULL,
    "embeddingVersion" TEXT NOT NULL DEFAULT '1.0',
    "dimensions" INTEGER NOT NULL,
    "embedding" JSONB NOT NULL,
    "processingTime" INTEGER NOT NULL DEFAULT 0,
    "providerUsed" TEXT NOT NULL,
    "costIncurred" DECIMAL(10,6),
    "quality" DECIMAL(3,2),
    "confidence" DECIMAL(5,4),
    "searchCount" INTEGER NOT NULL DEFAULT 0,
    "avgSimilarity" DECIMAL(5,4),
    "lastSearchAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_usage" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "userName" TEXT,
    "sessionId" TEXT,
    "conversationId" TEXT,
    "query" TEXT NOT NULL,
    "queryType" TEXT NOT NULL DEFAULT 'similarity',
    "resultsFound" INTEGER NOT NULL DEFAULT 0,
    "resultsUsed" INTEGER NOT NULL DEFAULT 0,
    "sourcesConsulted" JSONB NOT NULL,
    "chunksRetrieved" JSONB NOT NULL,
    "avgSimilarity" DECIMAL(5,4),
    "queryComplexity" INTEGER,
    "satisfactionScore" DECIMAL(3,2),
    "responseGenerated" BOOLEAN NOT NULL DEFAULT false,
    "responseLength" INTEGER,
    "responseQuality" DECIMAL(3,2),
    "metadata" JSONB,
    "processingTime" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "type" "IntegrationType" NOT NULL,
    "platform" "EcommercePlatform",
    "apiUrl" TEXT,
    "authType" TEXT NOT NULL,
    "authFields" JSONB NOT NULL,
    "supportedFeatures" JSONB NOT NULL,
    "iconUrl" TEXT,
    "brandColor" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "documentation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_integrations" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'PENDING',
    "config" JSONB NOT NULL,
    "name" TEXT,
    "credentials" JSONB,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "storeUrl" TEXT,
    "storeName" TEXT,
    "storeId" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "syncErrors" JSONB,
    "syncStats" JSONB,
    "features" JSONB,
    "webhookUrl" TEXT,
    "webhookSecret" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "configuredBy" TEXT,

    CONSTRAINT "organization_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_logs" (
    "id" TEXT NOT NULL,
    "organizationIntegrationId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventData" JSONB,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "userId" TEXT,
    "conversationId" TEXT,
    "processingTime" INTEGER,
    "recordsProcessed" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integration_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_templates" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "metaTemplateId" TEXT,
    "metaTemplateName" TEXT,
    "status" "TemplateStatus" NOT NULL DEFAULT 'PENDING',
    "statusMessage" TEXT,
    "category" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'es',
    "headerType" TEXT,
    "headerContent" TEXT,
    "bodyContent" TEXT NOT NULL,
    "footerContent" TEXT,
    "hasButtons" BOOLEAN NOT NULL DEFAULT false,
    "buttonsConfig" JSONB,
    "variables" JSONB,
    "sampleValues" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "allowedChannels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "usageLimit" INTEGER,
    "metaQualityScore" TEXT,
    "metaRejectionReason" TEXT,
    "metaLastSyncAt" TIMESTAMP(3),
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "successfulSends" INTEGER NOT NULL DEFAULT 0,
    "failedSends" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,

    CONSTRAINT "message_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "CampaignType" NOT NULL DEFAULT 'IMMEDIATE',
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "templateId" TEXT NOT NULL,
    "messageVariables" JSONB,
    "personalizationRules" JSONB,
    "targetAudienceSize" INTEGER NOT NULL DEFAULT 0,
    "maxRecipients" INTEGER,
    "scheduledFor" TIMESTAMP(3),
    "timezone" TEXT NOT NULL DEFAULT 'America/Mexico_City',
    "sendRate" INTEGER NOT NULL DEFAULT 10,
    "batchSize" INTEGER NOT NULL DEFAULT 100,
    "retryAttempts" INTEGER NOT NULL DEFAULT 3,
    "totalRecipients" INTEGER NOT NULL DEFAULT 0,
    "messagesSent" INTEGER NOT NULL DEFAULT 0,
    "messagesDelivered" INTEGER NOT NULL DEFAULT 0,
    "messagesRead" INTEGER NOT NULL DEFAULT 0,
    "messagesFailed" INTEGER NOT NULL DEFAULT 0,
    "messagesQueue" INTEGER NOT NULL DEFAULT 0,
    "estimatedCost" DECIMAL(10,2),
    "actualCost" DECIMAL(10,2),
    "budgetLimit" DECIMAL(10,2),
    "costPerMessage" DECIMAL(6,4),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "pausedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "lastError" TEXT,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_audience_filters" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "filterType" "AudienceFilterType" NOT NULL,
    "operator" "AudienceFilterOperator" NOT NULL DEFAULT 'AND',
    "tagNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "channelIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "vipStatus" BOOLEAN,
    "lastContactAfter" TIMESTAMP(3),
    "lastContactBefore" TIMESTAMP(3),
    "conversationStatuses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "includeInactive" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "filterOrder" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_audience_filters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_message_deliveries" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "status" "MessageDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "messageContent" TEXT NOT NULL,
    "personalizedVars" JSONB,
    "whatsappChannelId" TEXT,
    "whatsappMessageId" TEXT,
    "queuedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "errorCode" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "nextRetryAt" TIMESTAMP(3),
    "messageCost" DECIMAL(6,4),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_message_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_audience_previews" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT,
    "organizationId" TEXT NOT NULL,
    "filtersConfig" JSONB NOT NULL,
    "totalContacts" INTEGER NOT NULL DEFAULT 0,
    "contactIds" JSONB NOT NULL,
    "sampleContacts" JSONB NOT NULL,
    "vipCount" INTEGER NOT NULL DEFAULT 0,
    "channelsDistribution" JSONB NOT NULL,
    "tagsDistribution" JSONB NOT NULL,
    "processingTime" INTEGER NOT NULL DEFAULT 0,
    "lastProcessedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_audience_previews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_organizationId_idx" ON "users"("organizationId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_key" ON "invitations"("token");

-- CreateIndex
CREATE INDEX "invitations_organizationId_idx" ON "invitations"("organizationId");

-- CreateIndex
CREATE INDEX "invitations_email_idx" ON "invitations"("email");

-- CreateIndex
CREATE INDEX "invitations_token_idx" ON "invitations"("token");

-- CreateIndex
CREATE INDEX "subscriptions_organizationId_idx" ON "subscriptions"("organizationId");

-- CreateIndex
CREATE INDEX "subscriptions_stripeSubscriptionId_idx" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "subscriptions_mercadopagoPreapprovalId_idx" ON "subscriptions"("mercadopagoPreapprovalId");

-- CreateIndex
CREATE INDEX "payments_organizationId_idx" ON "payments"("organizationId");

-- CreateIndex
CREATE INDEX "payments_subscriptionId_idx" ON "payments"("subscriptionId");

-- CreateIndex
CREATE INDEX "payments_stripePaymentIntentId_idx" ON "payments"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "payments_mercadopagoPaymentId_idx" ON "payments"("mercadopagoPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_wallets_organizationId_key" ON "ai_wallets"("organizationId");

-- CreateIndex
CREATE INDEX "ai_transactions_walletId_idx" ON "ai_transactions"("walletId");

-- CreateIndex
CREATE INDEX "ai_transactions_usageType_idx" ON "ai_transactions"("usageType");

-- CreateIndex
CREATE INDEX "ai_transactions_createdAt_idx" ON "ai_transactions"("createdAt");

-- CreateIndex
CREATE INDEX "financial_transactions_organizationId_idx" ON "financial_transactions"("organizationId");

-- CreateIndex
CREATE INDEX "financial_transactions_type_idx" ON "financial_transactions"("type");

-- CreateIndex
CREATE INDEX "financial_transactions_createdAt_idx" ON "financial_transactions"("createdAt");

-- CreateIndex
CREATE INDEX "ai_providers_isActive_idx" ON "ai_providers"("isActive");

-- CreateIndex
CREATE INDEX "ai_providers_isDefault_idx" ON "ai_providers"("isDefault");

-- CreateIndex
CREATE INDEX "ai_providers_createdBy_idx" ON "ai_providers"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "ai_providers_name_key" ON "ai_providers"("name");

-- CreateIndex
CREATE INDEX "contacts_organizationId_idx" ON "contacts"("organizationId");

-- CreateIndex
CREATE INDEX "contacts_phone_idx" ON "contacts"("phone");

-- CreateIndex
CREATE INDEX "contacts_status_idx" ON "contacts"("status");

-- CreateIndex
CREATE INDEX "contacts_isVip_idx" ON "contacts"("isVip");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_organizationId_phone_key" ON "contacts"("organizationId", "phone");

-- CreateIndex
CREATE INDEX "contact_tags_organizationId_idx" ON "contact_tags"("organizationId");

-- CreateIndex
CREATE INDEX "contact_tags_contactId_idx" ON "contact_tags"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "contact_tags_contactId_name_key" ON "contact_tags"("contactId", "name");

-- CreateIndex
CREATE INDEX "contact_notes_organizationId_idx" ON "contact_notes"("organizationId");

-- CreateIndex
CREATE INDEX "contact_notes_contactId_idx" ON "contact_notes"("contactId");

-- CreateIndex
CREATE INDEX "conversations_organizationId_idx" ON "conversations"("organizationId");

-- CreateIndex
CREATE INDEX "conversations_contactId_idx" ON "conversations"("contactId");

-- CreateIndex
CREATE INDEX "conversations_status_idx" ON "conversations"("status");

-- CreateIndex
CREATE INDEX "conversations_assignedAgentId_idx" ON "conversations"("assignedAgentId");

-- CreateIndex
CREATE INDEX "conversations_lastMessageAt_idx" ON "conversations"("lastMessageAt");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_organizationId_whatsappChatId_key" ON "conversations"("organizationId", "whatsappChatId");

-- CreateIndex
CREATE INDEX "messages_organizationId_idx" ON "messages"("organizationId");

-- CreateIndex
CREATE INDEX "messages_conversationId_idx" ON "messages"("conversationId");

-- CreateIndex
CREATE INDEX "messages_direction_idx" ON "messages"("direction");

-- CreateIndex
CREATE INDEX "messages_type_idx" ON "messages"("type");

-- CreateIndex
CREATE INDEX "messages_sentAt_idx" ON "messages"("sentAt");

-- CreateIndex
CREATE INDEX "messages_isRead_idx" ON "messages"("isRead");

-- CreateIndex
CREATE INDEX "messages_whatsappChannelId_idx" ON "messages"("whatsappChannelId");

-- CreateIndex
CREATE UNIQUE INDEX "messages_whatsappId_key" ON "messages"("whatsappId");

-- CreateIndex
CREATE INDEX "whatsapp_channels_organizationId_idx" ON "whatsapp_channels"("organizationId");

-- CreateIndex
CREATE INDEX "whatsapp_channels_status_idx" ON "whatsapp_channels"("status");

-- CreateIndex
CREATE INDEX "whatsapp_channels_connectionType_idx" ON "whatsapp_channels"("connectionType");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_channels_organizationId_phone_key" ON "whatsapp_channels"("organizationId", "phone");

-- CreateIndex
CREATE INDEX "quick_replies_organizationId_idx" ON "quick_replies"("organizationId");

-- CreateIndex
CREATE INDEX "quick_replies_shortcut_idx" ON "quick_replies"("shortcut");

-- CreateIndex
CREATE INDEX "quick_replies_category_idx" ON "quick_replies"("category");

-- CreateIndex
CREATE INDEX "quick_replies_isActive_idx" ON "quick_replies"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "quick_replies_organizationId_shortcut_key" ON "quick_replies"("organizationId", "shortcut");

-- CreateIndex
CREATE INDEX "automation_rules_organizationId_idx" ON "automation_rules"("organizationId");

-- CreateIndex
CREATE INDEX "automation_rules_isActive_idx" ON "automation_rules"("isActive");

-- CreateIndex
CREATE INDEX "automation_rules_priority_idx" ON "automation_rules"("priority");

-- CreateIndex
CREATE INDEX "automation_conditions_ruleId_idx" ON "automation_conditions"("ruleId");

-- CreateIndex
CREATE INDEX "automation_conditions_type_idx" ON "automation_conditions"("type");

-- CreateIndex
CREATE INDEX "automation_actions_ruleId_idx" ON "automation_actions"("ruleId");

-- CreateIndex
CREATE INDEX "automation_actions_type_idx" ON "automation_actions"("type");

-- CreateIndex
CREATE INDEX "automation_actions_executionOrder_idx" ON "automation_actions"("executionOrder");

-- CreateIndex
CREATE INDEX "automation_executions_ruleId_idx" ON "automation_executions"("ruleId");

-- CreateIndex
CREATE INDEX "automation_executions_messageId_idx" ON "automation_executions"("messageId");

-- CreateIndex
CREATE INDEX "automation_executions_conversationId_idx" ON "automation_executions"("conversationId");

-- CreateIndex
CREATE INDEX "automation_executions_contactId_idx" ON "automation_executions"("contactId");

-- CreateIndex
CREATE INDEX "automation_executions_success_idx" ON "automation_executions"("success");

-- CreateIndex
CREATE INDEX "automation_executions_createdAt_idx" ON "automation_executions"("createdAt");

-- CreateIndex
CREATE INDEX "ai_analysis_cache_organizationId_idx" ON "ai_analysis_cache"("organizationId");

-- CreateIndex
CREATE INDEX "ai_analysis_cache_contentHash_idx" ON "ai_analysis_cache"("contentHash");

-- CreateIndex
CREATE INDEX "ai_analysis_cache_lastUsedAt_idx" ON "ai_analysis_cache"("lastUsedAt");

-- CreateIndex
CREATE INDEX "ai_analysis_cache_expiresAt_idx" ON "ai_analysis_cache"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ai_analysis_cache_organizationId_contentHash_key" ON "ai_analysis_cache"("organizationId", "contentHash");

-- CreateIndex
CREATE INDEX "ai_cache_organizationId_idx" ON "ai_cache"("organizationId");

-- CreateIndex
CREATE INDEX "ai_cache_promptHash_idx" ON "ai_cache"("promptHash");

-- CreateIndex
CREATE INDEX "ai_cache_isActive_idx" ON "ai_cache"("isActive");

-- CreateIndex
CREATE INDEX "ai_cache_lastUsedAt_idx" ON "ai_cache"("lastUsedAt");

-- CreateIndex
CREATE INDEX "ai_cache_expiresAt_idx" ON "ai_cache"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ai_cache_organizationId_promptHash_key" ON "ai_cache"("organizationId", "promptHash");

-- CreateIndex
CREATE INDEX "knowledge_sources_organizationId_idx" ON "knowledge_sources"("organizationId");

-- CreateIndex
CREATE INDEX "knowledge_sources_status_idx" ON "knowledge_sources"("status");

-- CreateIndex
CREATE INDEX "knowledge_sources_type_idx" ON "knowledge_sources"("type");

-- CreateIndex
CREATE INDEX "knowledge_sources_createdAt_idx" ON "knowledge_sources"("createdAt");

-- CreateIndex
CREATE INDEX "knowledge_sources_lastUsedAt_idx" ON "knowledge_sources"("lastUsedAt");

-- CreateIndex
CREATE INDEX "knowledge_chunks_sourceId_idx" ON "knowledge_chunks"("sourceId");

-- CreateIndex
CREATE INDEX "knowledge_chunks_status_idx" ON "knowledge_chunks"("status");

-- CreateIndex
CREATE INDEX "knowledge_chunks_contentQuality_idx" ON "knowledge_chunks"("contentQuality");

-- CreateIndex
CREATE INDEX "knowledge_chunks_usageCount_idx" ON "knowledge_chunks"("usageCount");

-- CreateIndex
CREATE INDEX "knowledge_chunks_lastUsedAt_idx" ON "knowledge_chunks"("lastUsedAt");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_chunks_sourceId_chunkIndex_key" ON "knowledge_chunks"("sourceId", "chunkIndex");

-- CreateIndex
CREATE INDEX "knowledge_embeddings_chunkId_idx" ON "knowledge_embeddings"("chunkId");

-- CreateIndex
CREATE INDEX "knowledge_embeddings_modelUsed_idx" ON "knowledge_embeddings"("modelUsed");

-- CreateIndex
CREATE INDEX "knowledge_embeddings_dimensions_idx" ON "knowledge_embeddings"("dimensions");

-- CreateIndex
CREATE INDEX "knowledge_embeddings_quality_idx" ON "knowledge_embeddings"("quality");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_embeddings_chunkId_modelUsed_key" ON "knowledge_embeddings"("chunkId", "modelUsed");

-- CreateIndex
CREATE INDEX "knowledge_usage_organizationId_idx" ON "knowledge_usage"("organizationId");

-- CreateIndex
CREATE INDEX "knowledge_usage_userId_idx" ON "knowledge_usage"("userId");

-- CreateIndex
CREATE INDEX "knowledge_usage_conversationId_idx" ON "knowledge_usage"("conversationId");

-- CreateIndex
CREATE INDEX "knowledge_usage_queryType_idx" ON "knowledge_usage"("queryType");

-- CreateIndex
CREATE INDEX "knowledge_usage_createdAt_idx" ON "knowledge_usage"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "integrations_name_key" ON "integrations"("name");

-- CreateIndex
CREATE INDEX "organization_integrations_organizationId_idx" ON "organization_integrations"("organizationId");

-- CreateIndex
CREATE INDEX "organization_integrations_integrationId_idx" ON "organization_integrations"("integrationId");

-- CreateIndex
CREATE INDEX "organization_integrations_status_idx" ON "organization_integrations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "organization_integrations_organizationId_integrationId_key" ON "organization_integrations"("organizationId", "integrationId");

-- CreateIndex
CREATE INDEX "integration_logs_organizationIntegrationId_idx" ON "integration_logs"("organizationIntegrationId");

-- CreateIndex
CREATE INDEX "integration_logs_eventType_idx" ON "integration_logs"("eventType");

-- CreateIndex
CREATE INDEX "integration_logs_createdAt_idx" ON "integration_logs"("createdAt");

-- CreateIndex
CREATE INDEX "message_templates_organizationId_idx" ON "message_templates"("organizationId");

-- CreateIndex
CREATE INDEX "message_templates_status_idx" ON "message_templates"("status");

-- CreateIndex
CREATE INDEX "message_templates_category_idx" ON "message_templates"("category");

-- CreateIndex
CREATE INDEX "message_templates_isActive_idx" ON "message_templates"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "message_templates_organizationId_metaTemplateId_key" ON "message_templates"("organizationId", "metaTemplateId");

-- CreateIndex
CREATE INDEX "campaigns_organizationId_idx" ON "campaigns"("organizationId");

-- CreateIndex
CREATE INDEX "campaigns_status_idx" ON "campaigns"("status");

-- CreateIndex
CREATE INDEX "campaigns_type_idx" ON "campaigns"("type");

-- CreateIndex
CREATE INDEX "campaigns_scheduledFor_idx" ON "campaigns"("scheduledFor");

-- CreateIndex
CREATE INDEX "campaigns_createdAt_idx" ON "campaigns"("createdAt");

-- CreateIndex
CREATE INDEX "campaign_audience_filters_campaignId_idx" ON "campaign_audience_filters"("campaignId");

-- CreateIndex
CREATE INDEX "campaign_audience_filters_filterType_idx" ON "campaign_audience_filters"("filterType");

-- CreateIndex
CREATE INDEX "campaign_message_deliveries_campaignId_idx" ON "campaign_message_deliveries"("campaignId");

-- CreateIndex
CREATE INDEX "campaign_message_deliveries_contactId_idx" ON "campaign_message_deliveries"("contactId");

-- CreateIndex
CREATE INDEX "campaign_message_deliveries_status_idx" ON "campaign_message_deliveries"("status");

-- CreateIndex
CREATE INDEX "campaign_message_deliveries_sentAt_idx" ON "campaign_message_deliveries"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_message_deliveries_campaignId_contactId_key" ON "campaign_message_deliveries"("campaignId", "contactId");

-- CreateIndex
CREATE INDEX "campaign_audience_previews_organizationId_idx" ON "campaign_audience_previews"("organizationId");

-- CreateIndex
CREATE INDEX "campaign_audience_previews_campaignId_idx" ON "campaign_audience_previews"("campaignId");

-- CreateIndex
CREATE INDEX "campaign_audience_previews_expiresAt_idx" ON "campaign_audience_previews"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_wallets" ADD CONSTRAINT "ai_wallets_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_transactions" ADD CONSTRAINT "ai_transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "ai_wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_transactions" ADD CONSTRAINT "ai_transactions_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ai_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_tags" ADD CONSTRAINT "contact_tags_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_tags" ADD CONSTRAINT "contact_tags_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_notes" ADD CONSTRAINT "contact_notes_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_notes" ADD CONSTRAINT "contact_notes_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_whatsappChannelId_fkey" FOREIGN KEY ("whatsappChannelId") REFERENCES "whatsapp_channels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_whatsappChannelId_fkey" FOREIGN KEY ("whatsappChannelId") REFERENCES "whatsapp_channels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_channels" ADD CONSTRAINT "whatsapp_channels_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quick_replies" ADD CONSTRAINT "quick_replies_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quick_replies" ADD CONSTRAINT "quick_replies_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quick_replies" ADD CONSTRAINT "quick_replies_modifiedBy_fkey" FOREIGN KEY ("modifiedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_rules" ADD CONSTRAINT "automation_rules_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_conditions" ADD CONSTRAINT "automation_conditions_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "automation_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_actions" ADD CONSTRAINT "automation_actions_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "automation_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_executions" ADD CONSTRAINT "automation_executions_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "automation_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_analysis_cache" ADD CONSTRAINT "ai_analysis_cache_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_cache" ADD CONSTRAINT "ai_cache_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_sources" ADD CONSTRAINT "knowledge_sources_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_chunks" ADD CONSTRAINT "knowledge_chunks_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "knowledge_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_embeddings" ADD CONSTRAINT "knowledge_embeddings_chunkId_fkey" FOREIGN KEY ("chunkId") REFERENCES "knowledge_chunks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_usage" ADD CONSTRAINT "knowledge_usage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_integrations" ADD CONSTRAINT "organization_integrations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_integrations" ADD CONSTRAINT "organization_integrations_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_integrations" ADD CONSTRAINT "organization_integrations_configuredBy_fkey" FOREIGN KEY ("configuredBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_logs" ADD CONSTRAINT "integration_logs_organizationIntegrationId_fkey" FOREIGN KEY ("organizationIntegrationId") REFERENCES "organization_integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_templates" ADD CONSTRAINT "message_templates_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "message_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_audience_filters" ADD CONSTRAINT "campaign_audience_filters_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_message_deliveries" ADD CONSTRAINT "campaign_message_deliveries_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_audience_previews" ADD CONSTRAINT "campaign_audience_previews_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_audience_previews" ADD CONSTRAINT "campaign_audience_previews_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
