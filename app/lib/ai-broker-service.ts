

import { AIWalletService, AIUsageRequest } from './ai-wallet-service';
import { getActiveAIProviders, getDecryptedApiKey } from './ai-providers';
import { AIUsageType } from '@prisma/client';
import { db } from './db';

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
   * Procesar una solicitud de IA de forma completa
   * 
   * Flujo completo:
   * 1. Verificar saldo suficiente
   * 2. Obtener configuración del proveedor
   * 3. Llamar a la API externa
   * 4. Calcular costos
   * 5. Debitar de la billetera
   * 6. Registrar transacción
   * 7. Retornar respuesta
   */
  static async processAIRequest(request: AIBrokerRequest): Promise<AIBrokerResponse> {
    const startTime = Date.now();
    
    try {
      // 1. Verificar que la organización tenga saldo suficiente
      const hasBalance = await this.checkSufficientBalance(request.organizationId, request.prompt);
      if (!hasBalance) {
        return {
          success: false,
          error: 'Saldo Insuficiente: No hay suficiente saldo en la billetera para procesar esta solicitud de IA'
        };
      }

      // 2. Obtener configuración del proveedor de IA apropiado
      const providerConfig = await this.getProviderForRequest(request);
      if (!providerConfig) {
        return {
          success: false,
          error: 'No hay proveedores de IA disponibles actualmente'
        };
      }

      // 3. Recuperar la clave API maestra
      const apiKey = await getDecryptedApiKey(providerConfig.id);

      // 4. Realizar llamada a la API del proveedor externo
      const aiResult = await this.callExternalProvider(
        providerConfig, 
        apiKey, 
        request
      );

      if (!aiResult.success) {
        return {
          success: false,
          error: `Error del proveedor ${providerConfig.name}: ${aiResult.error}`
        };
      }

      const processingTime = Date.now() - startTime;

      // 5. Calcular costos finales
      const costs = await this.calculateCosts(
        providerConfig,
        aiResult.usage.inputTokens,
        aiResult.usage.outputTokens
      );

      // 6. Crear registro de uso y debitar de la billetera
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

      // 7. Actualizar último uso del proveedor
      await this.updateProviderLastUsed(providerConfig.id);

      // 8. Retornar respuesta exitosa
      return {
        success: true,
        response: aiResult.response,
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
}

