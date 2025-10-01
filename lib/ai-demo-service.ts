
import { AIWalletService, AIUsageRequest } from './ai-wallet-service';
import { AIUsageType } from '@prisma/client';

// Simulaciones de diferentes usos de IA con costos realistas
export class AIDemoService {
  
  // Simular respuesta de chat con IA
  static async simulateChatResponse(organizationId: string, userId?: string, userName?: string) {
    const usageRequest: AIUsageRequest = {
      organizationId,
      userId,
      userName,
      usageType: AIUsageType.CHAT_RESPONSE,
      providerName: 'OpenAI',
      modelUsed: 'gpt-3.5-turbo',
      providerCost: 0.015, // Costo real típico para una respuesta
      inputTokens: 150,
      outputTokens: 200,
      processingTime: 1200,
      description: 'Respuesta automática a consulta de cliente sobre productos'
    };

    return await AIWalletService.processAIUsage(usageRequest);
  }

  // Simular análisis de sentimientos
  static async simulateSentimentAnalysis(organizationId: string, userId?: string, userName?: string) {
    const usageRequest: AIUsageRequest = {
      organizationId,
      userId,
      userName,
      usageType: AIUsageType.SENTIMENT_ANALYSIS,
      providerName: 'OpenAI',
      modelUsed: 'text-davinci-003',
      providerCost: 0.008,
      inputTokens: 80,
      outputTokens: 25,
      processingTime: 800,
      description: 'Análisis de sentimiento de conversación con cliente',
      metadata: {
        sentiment: 'positive',
        confidence: 0.87,
        keywords: ['satisfied', 'good service', 'helpful']
      }
    };

    return await AIWalletService.processAIUsage(usageRequest);
  }

  // Simular generación de contenido
  static async simulateContentGeneration(organizationId: string, userId?: string, userName?: string) {
    const usageRequest: AIUsageRequest = {
      organizationId,
      userId,
      userName,
      usageType: AIUsageType.CONTENT_GENERATION,
      providerName: 'OpenAI',
      modelUsed: 'gpt-4',
      providerCost: 0.045,
      inputTokens: 100,
      outputTokens: 300,
      processingTime: 2500,
      description: 'Generación de respuesta personalizada para follow-up de venta',
      metadata: {
        contentType: 'sales_followup',
        tone: 'professional',
        length: 'medium'
      }
    };

    return await AIWalletService.processAIUsage(usageRequest);
  }

  // Simular traducción
  static async simulateTranslation(organizationId: string, userId?: string, userName?: string) {
    const usageRequest: AIUsageRequest = {
      organizationId,
      userId,
      userName,
      usageType: AIUsageType.TRANSLATION,
      providerName: 'OpenAI',
      modelUsed: 'gpt-3.5-turbo',
      providerCost: 0.012,
      inputTokens: 120,
      outputTokens: 110,
      processingTime: 1000,
      description: 'Traducción automática de español a inglés para cliente internacional',
      metadata: {
        sourceLanguage: 'es',
        targetLanguage: 'en',
        textLength: 450
      }
    };

    return await AIWalletService.processAIUsage(usageRequest);
  }

  // Simular resumen de texto
  static async simulateTextSummary(organizationId: string, userId?: string, userName?: string) {
    const usageRequest: AIUsageRequest = {
      organizationId,
      userId,
      userName,
      usageType: AIUsageType.SUMMARY,
      providerName: 'OpenAI',
      modelUsed: 'gpt-3.5-turbo',
      providerCost: 0.021,
      inputTokens: 800,
      outputTokens: 150,
      processingTime: 1800,
      description: 'Resumen de historial de conversación para reporte de equipo',
      metadata: {
        originalLength: 3200,
        summaryLength: 600,
        compressionRatio: 0.19
      }
    };

    return await AIWalletService.processAIUsage(usageRequest);
  }

  // Función para crear múltiples usos de IA de demo
  static async createDemoUsage(organizationId: string, userId?: string, userName?: string, count: number = 5) {
    const usageFunctions = [
      this.simulateChatResponse,
      this.simulateSentimentAnalysis,
      this.simulateContentGeneration,
      this.simulateTranslation,
      this.simulateTextSummary
    ];

    const results = [];
    
    for (let i = 0; i < count; i++) {
      try {
        // Seleccionar función aleatoria
        const randomFunction = usageFunctions[Math.floor(Math.random() * usageFunctions.length)];
        
        // Añadir delay pequeño entre usos
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        const result = await randomFunction(organizationId, userId, userName);
        results.push(result);
        
      } catch (error) {
        console.error(`Error in demo usage ${i + 1}:`, error);
        // Continuar con los otros usos aunque uno falle
      }
    }

    return results;
  }

  // Calcular costo estimado de diferentes operaciones
  static getEstimatedCosts() {
    return {
      chatResponse: {
        provider: 'OpenAI GPT-3.5',
        providerCost: 0.015,
        clientCost: 0.015 * 1.30,
        description: 'Respuesta automática de chat'
      },
      sentimentAnalysis: {
        provider: 'OpenAI Text-Davinci',
        providerCost: 0.008,
        clientCost: 0.008 * 1.30,
        description: 'Análisis de sentimiento'
      },
      contentGeneration: {
        provider: 'OpenAI GPT-4',
        providerCost: 0.045,
        clientCost: 0.045 * 1.30,
        description: 'Generación de contenido'
      },
      translation: {
        provider: 'OpenAI GPT-3.5',
        providerCost: 0.012,
        clientCost: 0.012 * 1.30,
        description: 'Traducción de texto'
      },
      textSummary: {
        provider: 'OpenAI GPT-3.5',
        providerCost: 0.021,
        clientCost: 0.021 * 1.30,
        description: 'Resumen de texto'
      }
    };
  }
}
