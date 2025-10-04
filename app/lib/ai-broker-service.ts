

import { AIWalletService, AIUsageRequest } from './ai-wallet-service';
import { getActiveAIProviders, getDecryptedApiKey } from './ai-providers';
import { AIUsageType } from '@prisma/client';
import { db } from './db';
import { createHash } from 'crypto';
import { EcommerceService } from './services/ecommerce-service';

export interface AIBrokerRequest {
  organizationId: string;
  prompt: string;
  usageType?: AIUsageType;
  userId?: string;
  userName?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  metadata?: Record<string, any>;
}

export interface AIBrokerResponse {
  success: boolean;
  response?: string;
  error?: string;
  transactionId?: string;
  cost?: {
    providerCost: number;
    clientCost: number;
    margin: number;
  };
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    processingTime: number;
  };
  provider?: {
    name: string;
    model: string;
  };
}

export interface ProviderConfig {
  id: string;
  name: string;
  displayName: string;
  apiUrl: string;
  defaultModel: string;
  isDefault: boolean;
}

/**
 * Servicio central para el procesamiento de solicitudes de IA
 * Actúa como "broker" entre los clientes y los proveedores de IA
 */
export class AIBrokerService {

  /**
   * Procesar una solicitud de IA de forma completa con caché inteligente
   * 
   * Flujo optimizado:
   * 1. Generar hash del prompt
   * 2. Buscar en caché inteligente  
   * 3. Si hay caché: devolver y cobrar tarifa simbólica
   * 4. Si no hay caché: flujo completo + guardar en caché
   * 5. Verificar saldo suficiente
   * 6. Obtener configuración del proveedor
   * 7. Llamar a la API externa
   * 8. Calcular costos
   * 9. Debitar de la billetera
   * 10. Registrar transacción
   * 11. Guardar en caché para futuros usos
   * 12. Retornar respuesta
   */
  static async processAIRequest(request: AIBrokerRequest): Promise<AIBrokerResponse> {
    const startTime = Date.now();
    
    try {
      // 🧠 SISTEMA DE CACHÉ INTELIGENTE
      
      // 1. Generar hash del prompt normalizado
      const promptHash = this.generatePromptHash(request.prompt);
      
      // 2. Buscar respuesta en caché
      const cachedResponse = await this.getCachedResponse(request.organizationId, promptHash);
      
      if (cachedResponse) {
        console.log('💡 Caché hit - devolviendo respuesta almacenada');
        
        // 3. Procesar uso de caché (tarifa simbólica: 1/10 del costo normal)
        const cacheUsageResult = await this.processCacheUsage(request, cachedResponse);
        
        return {
          success: true,
          response: cachedResponse.response,
          transactionId: cacheUsageResult.transactionId,
          cost: cacheUsageResult.cost,
          usage: {
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
            processingTime: Date.now() - startTime
          },
          provider: {
            name: `${cachedResponse.originalProvider} (Caché)`,
            model: cachedResponse.originalModel
          }
        };
      }
      
      console.log('🔄 Caché miss - procesando solicitud normal');
      
      // 4. FLUJO NORMAL (sin caché)
      
      // 5. Verificar que la organización tenga saldo suficiente
      const hasBalance = await this.checkSufficientBalance(request.organizationId, request.prompt);
      if (!hasBalance) {
        return {
          success: false,
          error: 'Saldo Insuficiente: No hay suficiente saldo en la billetera para procesar esta solicitud de IA'
        };
      }

      // 🛒 INTEGRACIONES E-COMMERCE: Enriquecer prompt con datos de la tienda
      const enrichedRequest = await this.enrichWithEcommerceData(request);
      
      // 6. Obtener configuración del proveedor de IA apropiado
      const providerConfig = await this.getProviderForRequest(enrichedRequest);
      if (!providerConfig) {
        return {
          success: false,
          error: 'No hay proveedores de IA disponibles actualmente'
        };
      }

      // 7. Recuperar la clave API maestra
      const apiKey = await getDecryptedApiKey(providerConfig.id);

      // 8. Realizar llamada a la API del proveedor externo
      const aiResult = await this.callExternalProvider(
        providerConfig, 
        apiKey, 
        enrichedRequest
      );

      if (!aiResult.success) {
        return {
          success: false,
          error: `Error del proveedor ${providerConfig.name}: ${aiResult.error}`
        };
      }

      const processingTime = Date.now() - startTime;

      // 9. Calcular costos finales
      const costs = await this.calculateCosts(
        providerConfig,
        aiResult.usage.inputTokens,
        aiResult.usage.outputTokens
      );

      // 10. Crear registro de uso y debitar de la billetera
      const usageRequest: AIUsageRequest = {
        organizationId: request.organizationId,
        userId: request.userId,
        userName: request.userName,
        usageType: request.usageType || AIUsageType.CHAT_RESPONSE,
        providerName: providerConfig.name,
        modelUsed: aiResult.modelUsed,
        providerCost: costs.providerCost,
        inputTokens: aiResult.usage.inputTokens,
        outputTokens: aiResult.usage.outputTokens,
        processingTime,
        description: `AI Request via Broker: ${request.usageType || 'CHAT_RESPONSE'}`,
        metadata: {
          ...request.metadata,
          prompt_length: request.prompt.length,
          provider_id: providerConfig.id,
          model_used: aiResult.modelUsed,
          temperature: request.temperature,
          max_tokens: request.maxTokens
        }
      };

      const transaction = await AIWalletService.processAIUsage(usageRequest);

      // 11. GUARDAR EN CACHÉ PARA FUTUROS USOS
      if (aiResult.response) {
        try {
          await this.saveToCacheIntelligent(
            request.organizationId,
            promptHash,
            aiResult.response,
            providerConfig.name,
            aiResult.modelUsed,
            costs.providerCost
          );
          console.log('💾 Respuesta guardada en caché inteligente');
        } catch (cacheError) {
          console.warn('⚠️ Error guardando en caché (no crítico):', cacheError);
        }
      }

      // 12. Actualizar último uso del proveedor
      await this.updateProviderLastUsed(providerConfig.id);

      // 13. Retornar respuesta exitosa
      return {
        success: true,
        response: aiResult.response || '',
        transactionId: transaction.id,
        cost: {
          providerCost: costs.providerCost,
          clientCost: costs.clientCost,
          margin: 0.30
        },
        usage: {
          inputTokens: aiResult.usage.inputTokens,
          outputTokens: aiResult.usage.outputTokens,
          totalTokens: aiResult.usage.inputTokens + aiResult.usage.outputTokens,
          processingTime
        },
        provider: {
          name: providerConfig.displayName,
          model: aiResult.modelUsed
        }
      };

    } catch (error: any) {
      console.error('Error in AI Broker Service:', error);
      return {
        success: false,
        error: error.message || 'Error interno del servidor'
      };
    }
  }

  /**
   * Verificar si hay saldo suficiente para procesar la solicitud
   */
  private static async checkSufficientBalance(organizationId: string, prompt: string): Promise<boolean> {
    try {
      // Estimamos el costo basado en la longitud del prompt
      const estimatedTokens = Math.ceil(prompt.length / 4); // Aproximación básica
      const estimatedCost = estimatedTokens * 0.00002; // Costo estimado por token
      
      return await AIWalletService.hasSufficientBalance(organizationId, estimatedCost);
    } catch (error) {
      console.error('Error checking balance:', error);
      return false;
    }
  }

  /**
   * Obtener el proveedor de IA apropiado para la solicitud
   */
  private static async getProviderForRequest(request: AIBrokerRequest): Promise<ProviderConfig | null> {
    try {
      const activeProviders = await getActiveAIProviders();
      
      if (activeProviders.length === 0) {
        return null;
      }

      // Por ahora, usar el proveedor por defecto o el primero disponible
      const defaultProvider = activeProviders.find(p => p.isDefault) || activeProviders[0];
      
      return {
        id: defaultProvider.id,
        name: defaultProvider.name,
        displayName: defaultProvider.displayName,
        apiUrl: defaultProvider.apiUrl,
        defaultModel: defaultProvider.defaultModel || 'gpt-3.5-turbo',
        isDefault: defaultProvider.isDefault
      };
    } catch (error) {
      console.error('Error getting provider:', error);
      return null;
    }
  }

  /**
   * Realizar llamada a la API del proveedor externo
   */
  private static async callExternalProvider(
    provider: ProviderConfig,
    apiKey: string,
    request: AIBrokerRequest
  ): Promise<{
    success: boolean;
    response?: string;
    error?: string;
    usage: { inputTokens: number; outputTokens: number };
    modelUsed: string;
  }> {
    try {
      // Implementación específica para OpenAI
      if (provider.name.toLowerCase() === 'openai') {
        return await this.callOpenAI(provider, apiKey, request);
      }
      
      // Implementación específica para Gemini
      if (provider.name.toLowerCase() === 'gemini' || provider.name.toLowerCase() === 'google') {
        return await this.callGemini(provider, apiKey, request);
      }

      // Implementación genérica para otros proveedores
      return await this.callGenericProvider(provider, apiKey, request);
      
    } catch (error: any) {
      console.error(`Error calling ${provider.name}:`, error);
      return {
        success: false,
        error: error.message || 'Error desconocido del proveedor',
        usage: { inputTokens: 0, outputTokens: 0 },
        modelUsed: provider.defaultModel
      };
    }
  }

  /**
   * Llamada específica a OpenAI
   */
  private static async callOpenAI(
    provider: ProviderConfig,
    apiKey: string,
    request: AIBrokerRequest
  ): Promise<any> {
    const response = await fetch(`${provider.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: request.model || provider.defaultModel,
        messages: [
          { role: 'user', content: request.prompt }
        ],
        max_tokens: request.maxTokens || 1000,
        temperature: request.temperature || 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenAI API Error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();

    return {
      success: true,
      response: data.choices[0]?.message?.content || 'Sin respuesta',
      usage: {
        inputTokens: data.usage?.prompt_tokens || 0,
        outputTokens: data.usage?.completion_tokens || 0
      },
      modelUsed: data.model || request.model || provider.defaultModel
    };
  }

  /**
   * Llamada específica a Gemini
   */
  private static async callGemini(
    provider: ProviderConfig,
    apiKey: string,
    request: AIBrokerRequest
  ): Promise<any> {
    const model = request.model || provider.defaultModel || 'gemini-pro';
    const response = await fetch(`${provider.apiUrl}/v1/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: request.prompt
          }]
        }],
        generationConfig: {
          temperature: request.temperature || 0.7,
          maxOutputTokens: request.maxTokens || 1000
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Gemini API Error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();

    return {
      success: true,
      response: data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta',
      usage: {
        inputTokens: data.usageMetadata?.promptTokenCount || Math.ceil(request.prompt.length / 4),
        outputTokens: data.usageMetadata?.candidatesTokenCount || 50
      },
      modelUsed: model
    };
  }

  /**
   * Llamada genérica para otros proveedores
   */
  private static async callGenericProvider(
    provider: ProviderConfig,
    apiKey: string,
    request: AIBrokerRequest
  ): Promise<any> {
    // Implementación básica que puede ser extendida para otros proveedores
    throw new Error(`Proveedor ${provider.name} no implementado aún`);
  }

  /**
   * Calcular costos finales para el cliente
   */
  private static async calculateCosts(
    provider: ProviderConfig,
    inputTokens: number,
    outputTokens: number
  ): Promise<{ providerCost: number; clientCost: number }> {
    try {
      // Obtener precios desde la base de datos
      const providerData = await db.aIProvider.findUnique({
        where: { id: provider.id },
        select: {
          inputPricePerToken: true,
          outputPricePerToken: true
        }
      });

      let providerCost = 0;

      if (providerData?.inputPricePerToken && providerData?.outputPricePerToken) {
        // Usar precios configurados
        providerCost = 
          (inputTokens * providerData.inputPricePerToken.toNumber()) +
          (outputTokens * providerData.outputPricePerToken.toNumber());
      } else {
        // Usar precios por defecto según el proveedor
        if (provider.name.toLowerCase() === 'openai') {
          providerCost = (inputTokens * 0.0000015) + (outputTokens * 0.000002); // GPT-3.5 pricing
        } else if (provider.name.toLowerCase() === 'gemini') {
          providerCost = (inputTokens * 0.00000125) + (outputTokens * 0.00000375); // Gemini Pro pricing
        } else {
          // Precio genérico
          providerCost = (inputTokens + outputTokens) * 0.000002;
        }
      }

      const clientCost = providerCost * 1.30; // Aplicar margen del 30%

      return { providerCost, clientCost };
    } catch (error) {
      console.error('Error calculating costs:', error);
      // En caso de error, usar estimación básica
      const estimatedCost = (inputTokens + outputTokens) * 0.000002;
      return { 
        providerCost: estimatedCost, 
        clientCost: estimatedCost * 1.30 
      };
    }
  }

  /**
   * Actualizar la fecha de último uso del proveedor
   */
  private static async updateProviderLastUsed(providerId: string): Promise<void> {
    try {
      await db.aIProvider.update({
        where: { id: providerId },
        data: { lastUsedAt: new Date() }
      });
    } catch (error) {
      console.error('Error updating provider last used:', error);
      // No es crítico, continuar
    }
  }

  /**
   * Obtener estadísticas del broker
   */
  static async getBrokerStats(): Promise<{
    totalRequests: number;
    totalCost: number;
    averageResponseTime: number;
    topProviders: Array<{ name: string; usage: number }>;
  }> {
    try {
      const transactions = await db.aITransaction.findMany({
        where: {
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)) // Últimos 30 días
          }
        },
        include: { provider: true }
      });

      const totalRequests = transactions.length;
      const totalCost = transactions.reduce((sum, t) => sum + t.clientCost.toNumber(), 0);
      const averageResponseTime = transactions.length > 0 
        ? transactions.reduce((sum, t) => sum + (t.processingTime || 0), 0) / transactions.length
        : 0;

      // Agrupar por proveedor
      const providerUsage = transactions.reduce((acc, t) => {
        const providerName = t.provider?.displayName || t.providerName;
        acc[providerName] = (acc[providerName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topProviders = Object.entries(providerUsage)
        .map(([name, usage]) => ({ name, usage }))
        .sort((a, b) => b.usage - a.usage)
        .slice(0, 5);

      return {
        totalRequests,
        totalCost,
        averageResponseTime,
        topProviders
      };
    } catch (error) {
      console.error('Error getting broker stats:', error);
      return {
        totalRequests: 0,
        totalCost: 0,
        averageResponseTime: 0,
        topProviders: []
      };
    }
  }

  // ============================================
  // SISTEMA DE CACHÉ INTELIGENTE DE IA
  // ============================================

  /**
   * Genera un hash normalizado del prompt para el caché
   */
  private static generatePromptHash(prompt: string): string {
    // Normalizar el prompt para mejorar las coincidencias
    const normalizedPrompt = prompt
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ') // Normalizar espacios múltiples
      .replace(/[^\w\s]/g, ''); // Remover puntuación para mejores coincidencias

    return createHash('md5').update(normalizedPrompt).digest('hex');
  }

  /**
   * Busca respuesta en el caché inteligente
   */
  private static async getCachedResponse(organizationId: string, promptHash: string) {
    try {
      const cachedEntry = await db.aICache.findFirst({
        where: {
          organizationId,
          promptHash,
          isActive: true,
          OR: [
            { expiresAt: null }, // Sin expiración
            { expiresAt: { gt: new Date() } } // No expirado
          ]
        },
        orderBy: { lastUsedAt: 'desc' }
      });

      return cachedEntry;
    } catch (error) {
      console.error('Error buscando en caché:', error);
      return null;
    }
  }

  /**
   * Procesa el uso de una respuesta desde caché con tarifa simbólica
   */
  private static async processCacheUsage(request: AIBrokerRequest, cachedResponse: any) {
    try {
      // Calcular tarifa simbólica (1/10 del costo original)
      const originalCost = cachedResponse.originalCost.toNumber();
      const symbolicCost = originalCost * 0.1; // 10% del costo original
      
      // Crear transacción de uso de caché
      const usageRequest: AIUsageRequest = {
        organizationId: request.organizationId,
        userId: request.userId,
        userName: request.userName,
        usageType: request.usageType || AIUsageType.CHAT_RESPONSE,
        providerName: `Cache-${cachedResponse.originalProvider}`,
        modelUsed: `${cachedResponse.originalModel} (Cached)`,
        providerCost: symbolicCost, // Tarifa simbólica
        inputTokens: 0,
        outputTokens: 0,
        processingTime: 0,
        description: `AI Cache Hit: ${request.usageType || 'CHAT_RESPONSE'}`,
        metadata: {
          ...request.metadata,
          cacheHit: true,
          originalCost: originalCost,
          cacheSavings: originalCost - symbolicCost,
          cacheId: cachedResponse.id
        }
      };

      const transaction = await AIWalletService.processAIUsage(usageRequest);

      // Actualizar estadísticas de uso del caché
      await db.aICache.update({
        where: { id: cachedResponse.id },
        data: {
          hitCount: { increment: 1 },
          lastUsedAt: new Date()
        }
      });

      return {
        transactionId: transaction.id,
        cost: {
          providerCost: symbolicCost,
          clientCost: symbolicCost * 1.30, // Aplicar mismo margen del 30%
          margin: 0.30
        }
      };

    } catch (error) {
      console.error('Error procesando uso de caché:', error);
      throw error;
    }
  }

  /**
   * Guarda una respuesta nueva en el caché inteligente
   */
  private static async saveToCacheIntelligent(
    organizationId: string,
    promptHash: string,
    response: string,
    originalProvider: string,
    originalModel: string,
    originalCost: number
  ): Promise<void> {
    try {
      // Calcular fecha de expiración (30 días por defecto)
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30);

      await db.aICache.create({
        data: {
          organizationId,
          promptHash,
          response,
          originalProvider,
          originalModel,
          originalCost,
          hitCount: 0,
          lastUsedAt: new Date(),
          expiresAt: expirationDate,
          isActive: true
        }
      });

    } catch (error) {
      // Si ya existe, actualizar la respuesta
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        await db.aICache.update({
          where: {
            organizationId_promptHash: {
              organizationId,
              promptHash
            }
          },
          data: {
            response,
            originalProvider,
            originalModel,
            originalCost,
            lastUsedAt: new Date(),
            updatedAt: new Date()
          }
        });
      } else {
        throw error;
      }
    }
  }

  /**
   * Purgar todo el caché de IA (SUPER ADMIN ONLY)
   */
  static async purgeAICache(organizationId?: string): Promise<{ deletedCount: number }> {
    try {
      const whereClause = organizationId ? { organizationId } : {};
      
      const deleteResult = await db.aICache.deleteMany({
        where: whereClause
      });

      console.log(`🗑️ Caché de IA purgado: ${deleteResult.count} entradas eliminadas`);

      return { deletedCount: deleteResult.count };

    } catch (error) {
      console.error('Error purgando caché de IA:', error);
      throw new Error('Failed to purge AI cache');
    }
  }

  /**
   * Obtener estadísticas del caché inteligente
   */
  static async getCacheStats(organizationId?: string): Promise<{
    totalEntries: number;
    totalHits: number;
    averageHitRate: number;
    totalSavings: number;
    topCachedQueries: Array<{ promptHash: string; hitCount: number; response: string }>;
  }> {
    try {
      const whereClause = organizationId ? { organizationId } : {};
      
      const cacheEntries = await db.aICache.findMany({
        where: whereClause,
        orderBy: { hitCount: 'desc' }
      });

      const totalEntries = cacheEntries.length;
      const totalHits = cacheEntries.reduce((sum, entry) => sum + entry.hitCount, 0);
      const averageHitRate = totalEntries > 0 ? totalHits / totalEntries : 0;

      // Calcular ahorro total (diferencia entre costo original vs tarifa simbólica)
      const totalSavings = cacheEntries.reduce((sum, entry) => {
        const originalCost = entry.originalCost.toNumber();
        const symbolicCost = originalCost * 0.1;
        const savingsPerHit = originalCost - symbolicCost;
        return sum + (savingsPerHit * entry.hitCount);
      }, 0);

      const topCachedQueries = cacheEntries
        .slice(0, 10)
        .map(entry => ({
          promptHash: entry.promptHash,
          hitCount: entry.hitCount,
          response: entry.response.substring(0, 100) + '...' // Preview
        }));

      return {
        totalEntries,
        totalHits,
        averageHitRate,
        totalSavings,
        topCachedQueries
      };

    } catch (error) {
      console.error('Error obteniendo estadísticas de caché:', error);
      return {
        totalEntries: 0,
        totalHits: 0,
        averageHitRate: 0,
        totalSavings: 0,
        topCachedQueries: []
      };
    }
  }

  /**
   * 🛒 INTEGRACIÓN E-COMMERCE: Enriquecer el prompt con datos de la tienda
   * 
   * Este método detecta si el usuario está preguntando sobre productos, pedidos o inventario
   * y enriquece el prompt con los datos relevantes de las tiendas conectadas.
   */
  private static async enrichWithEcommerceData(request: AIBrokerRequest): Promise<AIBrokerRequest> {
    try {
      // 1. Detectar si la pregunta requiere datos de e-commerce
      const ecommerceIntent = EcommerceService.detectEcommerceIntent(request.prompt);
      
      if (!ecommerceIntent.needsEcommerce) {
        // No necesita datos de e-commerce, devolver request original
        return request;
      }

      console.log('🛒 E-commerce intent detected:', ecommerceIntent);

      // 2. Ejecutar consulta a las APIs de e-commerce
      let ecommerceData = null;
      let ecommerceContext = '';

      try {
        ecommerceData = await EcommerceService.executeQuery(
          request.organizationId,
          {
            type: ecommerceIntent.queryType as any,
            params: ecommerceIntent.params
          }
        );

        // 3. Formatear los datos para el contexto del prompt
        ecommerceContext = this.formatEcommerceContext(ecommerceIntent.queryType!, ecommerceData);

      } catch (ecommerceError) {
        console.log('⚠️ Error fetching e-commerce data:', ecommerceError);
        
        // Si hay error obteniendo datos de e-commerce, incluir esa información en el contexto
        ecommerceContext = `\n\n[INFORMACIÓN DEL SISTEMA]\nNo se pudieron consultar los datos de la tienda en este momento. Error: ${ecommerceError instanceof Error ? ecommerceError.message : 'Error desconocido'}\nPor favor, solicita al cliente que verifique la conexión con su tienda o contacte al administrador.`;
      }

      // 4. Crear el prompt enriquecido
      const enrichedPrompt = this.createEnrichedPrompt(request.prompt, ecommerceContext, ecommerceIntent.queryType!);

      // 5. Devolver request modificado
      return {
        ...request,
        prompt: enrichedPrompt,
        metadata: {
          ...request.metadata,
          hasEcommerceData: true,
          ecommerceIntent,
          originalPrompt: request.prompt
        }
      };

    } catch (error) {
      console.error('Error enriching with e-commerce data:', error);
      // Si hay error, devolver el request original
      return request;
    }
  }

  /**
   * Formatear datos de e-commerce para el contexto del prompt
   */
  private static formatEcommerceContext(queryType: string, data: any): string {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return `\n\n[DATOS DE LA TIENDA]\nNo se encontraron resultados para la consulta de ${queryType}.`;
    }

    let context = `\n\n[DATOS ACTUALES DE LA TIENDA]\n`;

    switch (queryType) {
      case 'product':
        context += `Productos encontrados:\n`;
        data.forEach((product: any, index: number) => {
          context += `${index + 1}. ${product.name}\n`;
          context += `   - Precio: $${product.price} ${product.currency}\n`;
          context += `   - Stock: ${product.stock || 'No disponible'}\n`;
          context += `   - SKU: ${product.sku || 'N/A'}\n`;
          context += `   - Estado: ${product.status}\n`;
          if (product.description) {
            context += `   - Descripción: ${product.description.substring(0, 100)}...\n`;
          }
          context += `\n`;
        });
        break;

      case 'order':
        context += `Pedidos encontrados:\n`;
        data.forEach((order: any, index: number) => {
          context += `${index + 1}. Pedido ${order.orderNumber}\n`;
          context += `   - Estado: ${order.status}\n`;
          context += `   - Total: $${order.total} ${order.currency}\n`;
          context += `   - Cliente: ${order.customerName || order.customerEmail}\n`;
          context += `   - Fecha: ${new Date(order.createdAt).toLocaleDateString('es-ES')}\n`;
          if (order.items && order.items.length > 0) {
            context += `   - Productos: ${order.items.map((item: any) => `${item.productName} (${item.quantity})`).join(', ')}\n`;
          }
          context += `\n`;
        });
        break;

      case 'customer':
        context += `Clientes encontrados:\n`;
        data.forEach((customer: any, index: number) => {
          context += `${index + 1}. ${customer.name || customer.email}\n`;
          context += `   - Email: ${customer.email}\n`;
          context += `   - Teléfono: ${customer.phone || 'N/A'}\n`;
          context += `   - Total pedidos: ${customer.totalOrders || 0}\n`;
          context += `   - Total gastado: $${customer.totalSpent || 0}\n`;
          context += `   - Cliente desde: ${new Date(customer.createdAt).toLocaleDateString('es-ES')}\n`;
          context += `\n`;
        });
        break;

      case 'inventory':
        context += `Información de inventario:\n`;
        if (Array.isArray(data)) {
          data.forEach((item: any, index: number) => {
            context += `${index + 1}. ${item.name || item.sku}\n`;
            context += `   - Stock disponible: ${item.available || 'N/A'}\n`;
            context += `   - Ubicación: ${item.location || 'N/A'}\n`;
            context += `\n`;
          });
        }
        break;

      default:
        context += `Datos: ${JSON.stringify(data, null, 2)}\n`;
    }

    return context;
  }

  /**
   * Crear el prompt enriquecido con contexto de e-commerce
   */
  private static createEnrichedPrompt(originalPrompt: string, ecommerceContext: string, queryType: string): string {
    const systemInstructions = `[INSTRUCCIONES PARA EL ASISTENTE]
Eres un asistente inteligente de atención al cliente para un negocio con tienda en línea. 

IMPORTANTE:
1. Usa ÚNICAMENTE los datos actualizados de la tienda proporcionados abajo
2. Si los datos están vacíos o no coinciden con la pregunta, explica amablemente que no encuentras esa información
3. Sé específico con precios, stock, números de pedido y estados
4. Siempre mantén un tono profesional y servicial
5. Si hay errores de conexión con la tienda, explica la situación y sugiere contactar al administrador

CONTEXTO ACTUAL DE LA TIENDA:${ecommerceContext}

PREGUNTA DEL CLIENTE:
${originalPrompt}

Por favor responde usando únicamente la información proporcionada arriba.`;

    return systemInstructions;
  }
}

