
import { prisma } from './db'
import { AIProvider, UserRole } from '@prisma/client'
import { encryptApiKey, decryptApiKey, maskApiKey, validateApiKeyFormat } from './crypto'
import { hasPermission, Permission } from './permissions'

export interface AIProviderInput {
  name: string
  displayName: string
  description?: string
  logoUrl?: string
  apiUrl: string
  apiKeyName?: string
  apiKey: string
  defaultModel?: string
  availableModels?: string[]
  inputPricePerToken?: number
  outputPricePerToken?: number
  currency?: string
  maxTokensPerRequest?: number
  rateLimitPerMinute?: number
  metadata?: Record<string, any>
}

export interface AIProviderResponse extends Omit<AIProvider, 'encryptedApiKey'> {
  maskedApiKey: string
}

/**
 * Verificar permisos de Super Admin
 */
function requireSuperAdmin(userRole: UserRole): void {
  if (userRole !== 'SUPER_ADMIN') {
    throw new Error('Access denied: Only Super Admin can manage AI providers')
  }
}

/**
 * Crear un nuevo proveedor de IA
 */
export async function createAIProvider(
  input: AIProviderInput,
  userId: string,
  userName: string,
  userRole: UserRole
): Promise<AIProviderResponse> {
  requireSuperAdmin(userRole)

  // Validar formato de la clave API
  if (!validateApiKeyFormat(input.apiKey, input.name)) {
    throw new Error(`Invalid API key format for ${input.name}`)
  }

  // Verificar que el nombre sea único
  const existingProvider = await prisma.aIProvider.findUnique({
    where: { name: input.name }
  })

  if (existingProvider) {
    throw new Error(`Provider with name "${input.name}" already exists`)
  }

  // Si es el primer proveedor, marcarlo como default
  const existingCount = await prisma.aIProvider.count()
  const isDefault = existingCount === 0

  // Cifrar la clave API
  const encryptedApiKey = encryptApiKey(input.apiKey)

  const provider = await prisma.aIProvider.create({
    data: {
      name: input.name,
      displayName: input.displayName,
      description: input.description,
      logoUrl: input.logoUrl,
      apiUrl: input.apiUrl,
      apiKeyName: input.apiKeyName || 'API_KEY',
      encryptedApiKey,
      defaultModel: input.defaultModel,
      availableModels: input.availableModels ? JSON.parse(JSON.stringify(input.availableModels)) : null,
      inputPricePerToken: input.inputPricePerToken,
      outputPricePerToken: input.outputPricePerToken,
      currency: input.currency || 'USD',
      maxTokensPerRequest: input.maxTokensPerRequest,
      rateLimitPerMinute: input.rateLimitPerMinute,
      metadata: input.metadata ? JSON.parse(JSON.stringify(input.metadata)) : null,
      isDefault,
      createdBy: userId,
      createdByName: userName,
    }
  })

  return {
    ...provider,
    maskedApiKey: maskApiKey(input.apiKey)
  }
}

/**
 * Obtener todos los proveedores de IA
 */
export async function getAIProviders(userRole: UserRole): Promise<AIProviderResponse[]> {
  requireSuperAdmin(userRole)

  const providers = await prisma.aIProvider.findMany({
    orderBy: [
      { isDefault: 'desc' },
      { isActive: 'desc' },
      { name: 'asc' }
    ]
  })

  return providers.map(provider => ({
    ...provider,
    maskedApiKey: maskApiKey(decryptApiKey(provider.encryptedApiKey))
  }))
}

/**
 * Obtener un proveedor específico por ID
 */
export async function getAIProvider(id: string, userRole: UserRole): Promise<AIProviderResponse> {
  requireSuperAdmin(userRole)

  const provider = await prisma.aIProvider.findUnique({
    where: { id }
  })

  if (!provider) {
    throw new Error('AI Provider not found')
  }

  return {
    ...provider,
    maskedApiKey: maskApiKey(decryptApiKey(provider.encryptedApiKey))
  }
}

/**
 * Actualizar un proveedor de IA
 */
export async function updateAIProvider(
  id: string,
  input: Partial<AIProviderInput>,
  userId: string,
  userName: string,
  userRole: UserRole
): Promise<AIProviderResponse> {
  requireSuperAdmin(userRole)

  const existingProvider = await prisma.aIProvider.findUnique({
    where: { id }
  })

  if (!existingProvider) {
    throw new Error('AI Provider not found')
  }

  // Si se está actualizando el nombre, verificar unicidad
  if (input.name && input.name !== existingProvider.name) {
    const nameExists = await prisma.aIProvider.findUnique({
      where: { name: input.name }
    })
    if (nameExists) {
      throw new Error(`Provider with name "${input.name}" already exists`)
    }
  }

  let encryptedApiKey = existingProvider.encryptedApiKey
  if (input.apiKey) {
    if (!validateApiKeyFormat(input.apiKey, input.name || existingProvider.name)) {
      throw new Error(`Invalid API key format for ${input.name || existingProvider.name}`)
    }
    encryptedApiKey = encryptApiKey(input.apiKey)
  }

  const provider = await prisma.aIProvider.update({
    where: { id },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.displayName && { displayName: input.displayName }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.logoUrl !== undefined && { logoUrl: input.logoUrl }),
      ...(input.apiUrl && { apiUrl: input.apiUrl }),
      ...(input.apiKeyName && { apiKeyName: input.apiKeyName }),
      ...(input.apiKey && { encryptedApiKey }),
      ...(input.defaultModel !== undefined && { defaultModel: input.defaultModel }),
      ...(input.availableModels && { availableModels: JSON.parse(JSON.stringify(input.availableModels)) }),
      ...(input.inputPricePerToken !== undefined && { inputPricePerToken: input.inputPricePerToken }),
      ...(input.outputPricePerToken !== undefined && { outputPricePerToken: input.outputPricePerToken }),
      ...(input.currency && { currency: input.currency }),
      ...(input.maxTokensPerRequest !== undefined && { maxTokensPerRequest: input.maxTokensPerRequest }),
      ...(input.rateLimitPerMinute !== undefined && { rateLimitPerMinute: input.rateLimitPerMinute }),
      ...(input.metadata && { metadata: JSON.parse(JSON.stringify(input.metadata)) }),
      updatedBy: userId,
      updatedByName: userName,
      updatedAt: new Date()
    }
  })

  return {
    ...provider,
    maskedApiKey: maskApiKey(input.apiKey || decryptApiKey(provider.encryptedApiKey))
  }
}

/**
 * Eliminar un proveedor de IA
 */
export async function deleteAIProvider(id: string, userRole: UserRole): Promise<void> {
  requireSuperAdmin(userRole)

  const provider = await prisma.aIProvider.findUnique({
    where: { id },
    include: {
      _count: {
        select: { transactions: true }
      }
    }
  })

  if (!provider) {
    throw new Error('AI Provider not found')
  }

  if (provider._count.transactions > 0) {
    // Si tiene transacciones asociadas, solo desactivar en lugar de eliminar
    await prisma.aIProvider.update({
      where: { id },
      data: { isActive: false }
    })
  } else {
    // Si no tiene transacciones, eliminar completamente
    await prisma.aIProvider.delete({
      where: { id }
    })
  }
}

/**
 * Activar/Desactivar un proveedor
 */
export async function toggleAIProviderStatus(
  id: string,
  isActive: boolean,
  userId: string,
  userName: string,
  userRole: UserRole
): Promise<AIProviderResponse> {
  requireSuperAdmin(userRole)

  const provider = await prisma.aIProvider.update({
    where: { id },
    data: {
      isActive,
      updatedBy: userId,
      updatedByName: userName,
      updatedAt: new Date()
    }
  })

  return {
    ...provider,
    maskedApiKey: maskApiKey(decryptApiKey(provider.encryptedApiKey))
  }
}

/**
 * Establecer proveedor por defecto
 */
export async function setDefaultAIProvider(
  id: string,
  userId: string,
  userName: string,
  userRole: UserRole
): Promise<void> {
  requireSuperAdmin(userRole)

  await prisma.$transaction(async (tx) => {
    // Quitar default de todos los proveedores
    await tx.aIProvider.updateMany({
      where: { isDefault: true },
      data: { isDefault: false }
    })

    // Establecer el nuevo default
    await tx.aIProvider.update({
      where: { id },
      data: {
        isDefault: true,
        updatedBy: userId,
        updatedByName: userName,
        updatedAt: new Date()
      }
    })
  })
}

/**
 * Obtener la clave API descifrada (solo para uso interno del sistema)
 */
export async function getDecryptedApiKey(providerId: string): Promise<string> {
  const provider = await prisma.aIProvider.findUnique({
    where: { id: providerId, isActive: true }
  })

  if (!provider) {
    throw new Error('Active AI Provider not found')
  }

  return decryptApiKey(provider.encryptedApiKey)
}

/**
 * Obtener proveedores activos (para uso en el sistema)
 */
export async function getActiveAIProviders(): Promise<Pick<AIProvider, 'id' | 'name' | 'displayName' | 'apiUrl' | 'defaultModel' | 'isDefault'>[]> {
  return await prisma.aIProvider.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      displayName: true,
      apiUrl: true,
      defaultModel: true,
      isDefault: true
    },
    orderBy: [
      { isDefault: 'desc' },
      { name: 'asc' }
    ]
  })
}
