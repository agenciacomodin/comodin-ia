
/**
 * AI Broker - Sistema central para análisis de mensajes y automatizaciones
 * 
 * Funcionalidades:
 * 1. Análisis de intenciones con IA
 * 2. Detección de palabras clave  
 * 3. Análisis de sentimientos
 * 4. Cache inteligente para optimización
 * 5. Integración con automatizaciones
 */

import OpenAI from 'openai'
import { PrismaClient } from '@prisma/client'
import { AIIntentionType, AutomationConditionType, AutomationActionType } from '@prisma/client'
import { AIAnalysisResult } from './types'
import { createHash } from 'crypto'

const prisma = new PrismaClient()

// Configuración del cliente OpenAI usando las variables de entorno
const openai = new OpenAI({
  baseURL: process.env.ABACUSAI_BASE_URL || 'https://chatllm.abacus.ai/v1',
  apiKey: process.env.ABACUSAI_API_KEY || '',
})

export class AIBroker {
  protected organizationId: string

  constructor(organizationId: string) {
    this.organizationId = organizationId
  }

  /**
   * Analiza un mensaje usando IA para detectar intenciones, sentimientos y palabras clave
   */
  async analyzeMessage(content: string, useCache = true): Promise<AIAnalysisResult> {
    const startTime = Date.now()
    
    // Crear hash del contenido para el cache
    const contentHash = createHash('md5').update(content.toLowerCase().trim()).digest('hex')
    
    // Verificar cache si está habilitado
    if (useCache) {
      const cachedResult = await this.getCachedAnalysis(contentHash)
      if (cachedResult) {
        // Actualizar estadísticas de uso del cache
        await this.updateCacheHit(cachedResult.id)
        return this.mapCachedResultToAnalysis(cachedResult)
      }
    }

    try {
      // Realizar análisis con IA
      const analysis = await this.performAIAnalysis(content)
      const processingTime = Date.now() - startTime

      // Guardar en cache para futuros usos
      if (useCache) {
        await this.saveToCaches(contentHash, {
          ...analysis,
          processingTime
        })
      }

      return {
        ...analysis,
        processingTime
      }

    } catch (error) {
      console.error('Error en análisis de IA:', error)
      
      // Retornar análisis básico en caso de error
      return {
        detectedIntentions: [AIIntentionType.OTHER],
        confidenceScore: 0.1,
        sentiment: 'neutral',
        keywordsExtracted: this.extractBasicKeywords(content),
        aiProvider: 'fallback',
        modelUsed: 'basic-analysis',
        processingTime: Date.now() - startTime,
        analysisVersion: '1.0'
      }
    }
  }

  /**
   * Realiza el análisis completo con IA usando OpenAI
   */
  private async performAIAnalysis(content: string): Promise<Omit<AIAnalysisResult, 'processingTime'>> {
    const prompt = this.createAnalysisPrompt(content)
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en análisis de comunicaciones de atención al cliente. Analiza mensajes para determinar intenciones, sentimientos y extraer palabras clave relevantes. Responde únicamente en formato JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    })

    const result = response.choices[0]?.message?.content
    if (!result) {
      throw new Error('No se obtuvo respuesta de la IA')
    }

    try {
      const parsedResult = JSON.parse(result)
      return this.mapAIResponseToAnalysis(parsedResult)
    } catch (parseError) {
      console.error('Error parseando respuesta de IA:', parseError)
      throw new Error('Respuesta de IA inválida')
    }
  }

  /**
   * Crea el prompt para el análisis de IA
   */
  private createAnalysisPrompt(content: string): string {
    return `
Analiza el siguiente mensaje de un cliente y proporciona el análisis en formato JSON:

Mensaje: "${content}"

Responde con este formato JSON exacto:
{
  "intentions": ["SALES", "SUPPORT", "QUESTION", "COMPLAINT", "BOOKING", "PAYMENT", "INFORMATION", "GREETING", "FAREWELL", "OTHER"],
  "confidence": 0.85,
  "sentiment": "positive|negative|neutral",
  "keywords": ["palabra1", "palabra2", "palabra3"]
}

Instrucciones:
1. intentions: Array con las intenciones detectadas (pueden ser múltiples)
2. confidence: Nivel de confianza del análisis (0.0 a 1.0)
3. sentiment: Sentimiento general del mensaje
4. keywords: Palabras clave más relevantes (máximo 10)

Intenciones disponibles:
- SALES: Interés en comprar, consultas de precios, productos
- SUPPORT: Problemas técnicos, solicitudes de ayuda
- QUESTION: Preguntas generales, dudas
- COMPLAINT: Quejas, reclamos, insatisfacción
- BOOKING: Reservas, citas, agendamiento
- PAYMENT: Pagos, facturación, métodos de pago
- INFORMATION: Solicitud de información general
- GREETING: Saludos iniciales
- FAREWELL: Despedidas
- OTHER: Otras intenciones no clasificadas

Responde únicamente el JSON, sin texto adicional.`
  }

  /**
   * Mapea la respuesta de IA al formato interno
   */
  private mapAIResponseToAnalysis(aiResponse: any): Omit<AIAnalysisResult, 'processingTime'> {
    const intentions = Array.isArray(aiResponse.intentions) 
      ? aiResponse.intentions.filter((i: string) => Object.values(AIIntentionType).includes(i as AIIntentionType))
      : [AIIntentionType.OTHER]

    return {
      detectedIntentions: intentions.length > 0 ? intentions : [AIIntentionType.OTHER],
      confidenceScore: Math.max(0, Math.min(1, aiResponse.confidence || 0)),
      sentiment: ['positive', 'negative', 'neutral'].includes(aiResponse.sentiment) 
        ? aiResponse.sentiment 
        : 'neutral',
      keywordsExtracted: Array.isArray(aiResponse.keywords) 
        ? aiResponse.keywords.slice(0, 10) 
        : [],
      aiProvider: 'openai',
      modelUsed: 'gpt-4o-mini',
      analysisVersion: '1.0'
    }
  }

  /**
   * Extrae palabras clave básicas sin IA (fallback)
   */
  private extractBasicKeywords(content: string): string[] {
    const commonWords = ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al', 'del', 'me', 'mi', 'tu', 'ti', 'si', 'ya', 'muy', 'mas', 'como', 'pero', 'nos', 'os']
    
    const words = content.toLowerCase()
      .replace(/[^\w\sáéíóúñü]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word))
      
    return [...new Set(words)].slice(0, 5)
  }

  /**
   * Busca análisis en cache
   */
  private async getCachedAnalysis(contentHash: string) {
    return await prisma.aIAnalysisCache.findFirst({
      where: {
        organizationId: this.organizationId,
        contentHash,
        expiresAt: {
          gt: new Date()
        }
      }
    })
  }

  /**
   * Actualiza estadísticas de hit del cache
   */
  private async updateCacheHit(cacheId: string) {
    await prisma.aIAnalysisCache.update({
      where: { id: cacheId },
      data: {
        hitCount: { increment: 1 },
        lastUsedAt: new Date()
      }
    })
  }

  /**
   * Guarda resultado en cache
   */
  private async saveToCaches(contentHash: string, analysis: AIAnalysisResult) {
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + 7) // Cache por 7 días

    await prisma.aIAnalysisCache.create({
      data: {
        organizationId: this.organizationId,
        contentHash,
        detectedIntentions: analysis.detectedIntentions,
        confidenceScore: analysis.confidenceScore,
        sentiment: analysis.sentiment,
        keywordsExtracted: analysis.keywordsExtracted,
        aiProvider: analysis.aiProvider,
        modelUsed: analysis.modelUsed,
        processingTime: analysis.processingTime,
        analysisVersion: analysis.analysisVersion,
        hitCount: 0,
        expiresAt: expirationDate
      }
    })
  }

  /**
   * Mapea resultado del cache al formato de análisis
   */
  private mapCachedResultToAnalysis(cached: any): AIAnalysisResult {
    return {
      detectedIntentions: cached.detectedIntentions,
      confidenceScore: cached.confidenceScore.toNumber(),
      sentiment: cached.sentiment,
      keywordsExtracted: cached.keywordsExtracted,
      aiProvider: cached.aiProvider,
      modelUsed: cached.modelUsed,
      processingTime: cached.processingTime,
      analysisVersion: cached.analysisVersion
    }
  }

  /**
   * Procesa un mensaje entrante completo y ejecuta automatizaciones
   */
  async processIncomingMessage(messageId: string, content: string): Promise<{
    analysis: AIAnalysisResult
    automationsExecuted: number
    automationsSkipped: number
  }> {
    try {
      // 1. Analizar el mensaje con IA
      const analysis = await this.analyzeMessage(content)

      // 2. Obtener mensaje y contexto
      const message = await prisma.message.findUnique({
        where: { id: messageId },
        include: {
          conversation: {
            include: {
              contact: true
            }
          }
        }
      })

      if (!message) {
        throw new Error('Mensaje no encontrado')
      }

      // 3. Ejecutar automatizaciones aplicables
      const automationResults = await this.executeAutomations(message, analysis)

      return {
        analysis,
        automationsExecuted: automationResults.executed,
        automationsSkipped: automationResults.skipped
      }

    } catch (error) {
      console.error('Error procesando mensaje:', error)
      throw error
    }
  }

  /**
   * Ejecuta todas las automatizaciones aplicables para un mensaje
   */
  private async executeAutomations(message: any, analysis: AIAnalysisResult): Promise<{
    executed: number
    skipped: number
  }> {
    let executed = 0
    let skipped = 0

    try {
      // Obtener todas las reglas activas ordenadas por prioridad
      const rules = await prisma.automationRule.findMany({
        where: {
          organizationId: this.organizationId,
          isActive: true
        },
        include: {
          conditions: true,
          actions: {
            orderBy: { executionOrder: 'asc' }
          }
        },
        orderBy: { priority: 'asc' }
      })

      // Ejecutar cada regla que cumpla las condiciones
      for (const rule of rules) {
        const shouldExecute = await this.evaluateRuleConditions(rule, message, analysis)
        
        if (shouldExecute) {
          await this.executeRuleActions(rule, message, analysis)
          executed++
        } else {
          skipped++
        }
      }

      return { executed, skipped }

    } catch (error) {
      console.error('Error ejecutando automatizaciones:', error)
      return { executed, skipped }
    }
  }

  /**
   * Evalúa si las condiciones de una regla se cumplen
   */
  private async evaluateRuleConditions(rule: any, message: any, analysis: AIAnalysisResult): Promise<boolean> {
    if (!rule.conditions || rule.conditions.length === 0) {
      return true // Si no hay condiciones, siempre ejecutar
    }

    // Evaluar cada condición
    const conditionResults: boolean[] = []
    
    for (const condition of rule.conditions) {
      const result = await this.evaluateCondition(condition, message, analysis)
      conditionResults.push(result)
    }

    // Aplicar lógica AND/OR entre condiciones
    // Por simplicidad, usamos AND por defecto
    return conditionResults.every(result => result)
  }

  /**
   * Evalúa una condición específica
   */
  private async evaluateCondition(condition: any, message: any, analysis: AIAnalysisResult): Promise<boolean> {
    switch (condition.type) {
      case AutomationConditionType.INTENTION_DETECTED:
        return this.evaluateIntentionCondition(condition, analysis)
        
      case AutomationConditionType.KEYWORDS_CONTAINS:
        return this.evaluateKeywordsCondition(condition, message.content)
        
      case AutomationConditionType.SENDER_IS_VIP:
        return message.conversation.contact.isVip
        
      case AutomationConditionType.FIRST_MESSAGE:
        return message.conversation.messageCount <= 1
        
      case AutomationConditionType.TIME_RANGE:
        return this.evaluateTimeRangeCondition(condition)
        
      default:
        return false
    }
  }

  /**
   * Evalúa condición de intención detectada
   */
  private evaluateIntentionCondition(condition: any, analysis: AIAnalysisResult): boolean {
    if (!condition.intentionTypes || condition.intentionTypes.length === 0) {
      return false
    }

    return analysis.detectedIntentions.some(intention => 
      condition.intentionTypes.includes(intention)
    )
  }

  /**
   * Evalúa condición de palabras clave
   */
  private evaluateKeywordsCondition(condition: any, content: string): boolean {
    if (!condition.keywords || condition.keywords.length === 0) {
      return false
    }

    const contentLower = content.toLowerCase()
    const matchType = condition.keywordMatchType || 'ANY'

    switch (matchType) {
      case 'ALL':
        return condition.keywords.every((keyword: string) => 
          contentLower.includes(keyword.toLowerCase())
        )
      case 'EXACT':
        return condition.keywords.some((keyword: string) => 
          contentLower === keyword.toLowerCase()
        )
      default: // 'ANY'
        return condition.keywords.some((keyword: string) => 
          contentLower.includes(keyword.toLowerCase())
        )
    }
  }

  /**
   * Evalúa condición de horario
   */
  private evaluateTimeRangeCondition(condition: any): boolean {
    if (!condition.timeStart || !condition.timeEnd) {
      return true
    }

    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTime = currentHour * 60 + currentMinute

    const [startHour, startMinute] = condition.timeStart.split(':').map(Number)
    const [endHour, endMinute] = condition.timeEnd.split(':').map(Number)
    
    const startTime = startHour * 60 + startMinute
    const endTime = endHour * 60 + endMinute

    // Verificar día de la semana si está configurado
    if (condition.weekdays && condition.weekdays.length > 0) {
      const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, etc.
      const adjustedDay = currentDay === 0 ? 7 : currentDay // Ajustar para que Monday = 1
      if (!condition.weekdays.includes(adjustedDay)) {
        return false
      }
    }

    return currentTime >= startTime && currentTime <= endTime
  }

  /**
   * Ejecuta las acciones de una regla
   */
  private async executeRuleActions(rule: any, message: any, analysis: AIAnalysisResult): Promise<void> {
    const executionStartTime = Date.now()
    
    try {
      const actionsExecuted = []
      const actionsSkipped = []

      for (const action of rule.actions) {
        try {
          await this.executeAction(action, message, analysis)
          actionsExecuted.push({
            type: action.type,
            success: true
          })
        } catch (actionError) {
          console.error(`Error ejecutando acción ${action.type}:`, actionError)
          actionsSkipped.push({
            type: action.type,
            error: actionError instanceof Error ? actionError.message : 'Error desconocido'
          })
        }
      }

      // Registrar la ejecución
      await prisma.automationExecution.create({
        data: {
          ruleId: rule.id,
          messageId: message.id,
          conversationId: message.conversationId,
          contactId: message.conversation.contactId,
          success: true,
          executionTime: Date.now() - executionStartTime,
          detectedIntentions: analysis.detectedIntentions,
          confidenceScore: analysis.confidenceScore,
          keywordsFound: analysis.keywordsExtracted,
          aiAnalysis: analysis as any,
          actionsExecuted,
          actionsSkipped
        }
      })

      // Actualizar estadísticas de la regla
      await prisma.automationRule.update({
        where: { id: rule.id },
        data: {
          executionCount: { increment: 1 },
          successCount: { increment: 1 },
          lastExecutedAt: new Date()
        }
      })

    } catch (error) {
      // Registrar ejecución fallida
      await prisma.automationExecution.create({
        data: {
          ruleId: rule.id,
          messageId: message.id,
          conversationId: message.conversationId,
          contactId: message.conversation.contactId,
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
          executionTime: Date.now() - executionStartTime,
          detectedIntentions: analysis.detectedIntentions,
          confidenceScore: analysis.confidenceScore,
          keywordsFound: analysis.keywordsExtracted,
          aiAnalysis: analysis as any
        }
      })

      // Actualizar estadísticas de error
      await prisma.automationRule.update({
        where: { id: rule.id },
        data: {
          executionCount: { increment: 1 },
          errorCount: { increment: 1 },
          lastExecutedAt: new Date()
        }
      })

      throw error
    }
  }

  /**
   * Ejecuta una acción específica
   */
  private async executeAction(action: any, message: any, analysis: AIAnalysisResult): Promise<void> {
    switch (action.type) {
      case AutomationActionType.ADD_TAG:
        await this.addContactTag(message.conversation.contactId, action.tagName, action.tagColor)
        break
        
      case AutomationActionType.ASSIGN_AGENT:
        await this.assignAgent(message.conversationId, action.agentId)
        break
        
      case AutomationActionType.SET_PRIORITY:
        await this.setPriority(message.conversationId, action.priority)
        break
        
      case AutomationActionType.AUTO_REPLY:
        await this.sendAutoReply(message.conversationId, action.replyMessage, action.replyDelay)
        break
        
      case AutomationActionType.MARK_VIP:
        await this.markAsVip(message.conversation.contactId)
        break
        
      default:
        console.log(`Acción no implementada: ${action.type}`)
    }
  }

  /**
   * Implementaciones de acciones específicas
   */
  private async addContactTag(contactId: string, tagName: string, tagColor?: string): Promise<void> {
    // Verificar si la etiqueta ya existe
    const existingTag = await prisma.contactTag.findFirst({
      where: {
        contactId,
        name: tagName
      }
    })

    if (!existingTag) {
      await prisma.contactTag.create({
        data: {
          organizationId: this.organizationId,
          contactId,
          name: tagName,
          color: tagColor || '#3B82F6',
          createdByName: 'AI Automation'
        }
      })
    }
  }

  private async assignAgent(conversationId: string, agentId: string): Promise<void> {
    const agent = await prisma.user.findUnique({
      where: { id: agentId }
    })

    if (agent) {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          assignedAgentId: agentId,
          assignedAgentName: agent.name
        }
      })
    }
  }

  private async setPriority(conversationId: string, priority: string): Promise<void> {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        priority: priority as any
      }
    })
  }

  private async sendAutoReply(conversationId: string, replyMessage: string, delay = 0): Promise<void> {
    // Implementar delay si es necesario
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay * 1000))
    }

    // Crear mensaje de respuesta automática
    await prisma.message.create({
      data: {
        organizationId: this.organizationId,
        conversationId,
        direction: 'OUTGOING',
        type: 'TEXT',
        content: replyMessage,
        sentByName: 'Respuesta Automática',
        sentAt: new Date()
      }
    })

    // Actualizar conversación
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        lastMessageText: replyMessage,
        lastMessageFrom: 'OUTGOING',
        messageCount: { increment: 1 }
      }
    })
  }

  private async markAsVip(contactId: string): Promise<void> {
    await prisma.contact.update({
      where: { id: contactId },
      data: {
        isVip: true
      }
    })
  }

  /**
   * Limpia cache expirado
   */
  async cleanExpiredCache(): Promise<number> {
    const result = await prisma.aIAnalysisCache.deleteMany({
      where: {
        organizationId: this.organizationId,
        expiresAt: {
          lt: new Date()
        }
      }
    })

    return result.count
  }
}

// Función auxiliar para crear instancia del broker
export function createAIBroker(organizationId: string): AIBroker {
  return new AIBroker(organizationId)
}

// Función para procesar mensaje entrante (para usar en API routes)
export async function processIncomingMessage(
  organizationId: string, 
  messageId: string, 
  content: string
): Promise<{
  analysis: AIAnalysisResult
  automationsExecuted: number  
  automationsSkipped: number
}> {
  const broker = createAIBroker(organizationId)
  return await broker.processIncomingMessage(messageId, content)
}
