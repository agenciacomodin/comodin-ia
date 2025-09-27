

import { AIUsageType } from '@prisma/client';

/**
 * Cliente simplificado para usar el AI Broker desde otros módulos del sistema
 * Este cliente debe ser usado por el CRM, chatbots, y otros servicios internos
 */

export interface AIBrokerClientConfig {
  baseUrl?: string; // Por defecto usa la URL interna de la API
}

export interface AIRequestOptions {
  usageType?: AIUsageType;
  userId?: string;
  userName?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  metadata?: Record<string, any>;
}

export class AIBrokerClient {
  private baseUrl: string;

  constructor(config: AIBrokerClientConfig = {}) {
    this.baseUrl = config.baseUrl || '/api/ai/broker';
  }

  /**
   * Enviar una solicitud de IA al broker
   */
  async sendRequest(
    organizationId: string,
    prompt: string,
    options: AIRequestOptions = {}
  ): Promise<{
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
  }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId,
          prompt,
          ...options
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`
        };
      }

      return {
        success: true,
        ...data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Error de conexión'
      };
    }
  }

  /**
   * Solicitud de chat/conversación
   */
  async chat(
    organizationId: string,
    message: string,
    options: Omit<AIRequestOptions, 'usageType'> = {}
  ) {
    return this.sendRequest(organizationId, message, {
      ...options,
      usageType: AIUsageType.CHAT_RESPONSE
    });
  }

  /**
   * Análisis de sentimientos
   */
  async analyzeSentiment(
    organizationId: string,
    text: string,
    options: Omit<AIRequestOptions, 'usageType'> = {}
  ) {
    return this.sendRequest(
      organizationId,
      `Analiza el sentimiento del siguiente texto: "${text}"`,
      {
        ...options,
        usageType: AIUsageType.SENTIMENT_ANALYSIS,
        temperature: 0.3
      }
    );
  }

  /**
   * Generación de contenido
   */
  async generateContent(
    organizationId: string,
    instructions: string,
    options: Omit<AIRequestOptions, 'usageType'> = {}
  ) {
    return this.sendRequest(organizationId, instructions, {
      ...options,
      usageType: AIUsageType.CONTENT_GENERATION,
      temperature: 0.8
    });
  }

  /**
   * Traducción de texto
   */
  async translate(
    organizationId: string,
    text: string,
    targetLanguage: string,
    options: Omit<AIRequestOptions, 'usageType'> = {}
  ) {
    return this.sendRequest(
      organizationId,
      `Traduce al ${targetLanguage}: "${text}"`,
      {
        ...options,
        usageType: AIUsageType.TRANSLATION,
        temperature: 0.2
      }
    );
  }

  /**
   * Resumen de texto
   */
  async summarize(
    organizationId: string,
    text: string,
    options: Omit<AIRequestOptions, 'usageType'> = {}
  ) {
    return this.sendRequest(
      organizationId,
      `Resume el siguiente texto: "${text}"`,
      {
        ...options,
        usageType: AIUsageType.SUMMARY,
        temperature: 0.4
      }
    );
  }

  /**
   * Análisis de texto general
   */
  async analyzeText(
    organizationId: string,
    text: string,
    analysisType: string,
    options: Omit<AIRequestOptions, 'usageType'> = {}
  ) {
    return this.sendRequest(
      organizationId,
      `Realiza un análisis de ${analysisType} del siguiente texto: "${text}"`,
      {
        ...options,
        usageType: AIUsageType.TEXT_ANALYSIS,
        temperature: 0.5
      }
    );
  }

  /**
   * Obtener estadísticas del broker
   */
  async getStats(): Promise<{
    success: boolean;
    data?: {
      totalRequests: number;
      totalCost: number;
      averageResponseTime: number;
      topProviders: Array<{ name: string; usage: number }>;
    };
    error?: string;
  }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Error de conexión'
      };
    }
  }

  /**
   * Ejecutar test del broker
   */
  async runTest(
    organizationId: string,
    testType: 'simple' | 'chat' | 'analysis' | 'content' | 'translation' | 'summary' = 'simple'
  ) {
    try {
      const response = await fetch(`${this.baseUrl}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId,
          testType
        })
      });

      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Error de conexión'
      };
    }
  }
}

// Instancia global del cliente
export const aiBroker = new AIBrokerClient();

// Funciones de utilidad para facilitar el uso
export const AIBrokerUtils = {
  /**
   * Verificar si un error es de saldo insuficiente
   */
  isInsufficientBalanceError(error: string): boolean {
    return error.includes('Saldo Insuficiente') || error.includes('Insufficient balance');
  },

  /**
   * Extraer el costo de una respuesta exitosa
   */
  extractCost(response: any): number | null {
    return response?.cost?.clientCost || null;
  },

  /**
   * Formatear el costo para mostrar en UI
   */
  formatCost(cost: number): string {
    return `$${cost.toFixed(6)}`;
  },

  /**
   * Calcular tokens aproximados de un texto
   */
  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  },

  /**
   * Validar si una organización puede usar IA
   */
  async canUseAI(organizationId: string, prompt: string): Promise<boolean> {
    try {
      // Esta es una verificación rápida sin consumir tokens
      const estimatedTokens = this.estimateTokens(prompt);
      const estimatedCost = estimatedTokens * 0.00002;
      
      // Aquí deberíamos hacer una llamada rápida para verificar el saldo
      // Por ahora, retornamos true (la verificación real se hace en el broker)
      return true;
    } catch (error) {
      return false;
    }
  }
};

