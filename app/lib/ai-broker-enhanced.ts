

/**
 * AI Broker Enhanced - Versión mejorada con integración de Knowledge Base
 * 
 * Extiende el AI Broker original con capacidades resolutivas:
 * - Búsqueda automática en Knowledge Base
 * - Envío de archivos relevantes
 * - Respuestas contextuales inteligentes
 */

import { AIBroker } from './ai-broker'
import { createAIKnowledgeResolver, ResolutionResult } from './ai-knowledge-resolver'
import { PrismaClient } from '@prisma/client'
import { AIAnalysisResult } from './types'

const prisma = new PrismaClient()

export class AIBrokerEnhanced extends AIBroker {
  
  /**
   * Procesa un mensaje entrante con capacidades resolutivas
   * Override del método original para agregar funcionalidad de Knowledge Base
   */
  async processIncomingMessage(messageId: string, content: string): Promise<{
    analysis: AIAnalysisResult
    automationsExecuted: number
    automationsSkipped: number
    aiResolution?: ResolutionResult // Nueva funcionalidad
  }> {
    try {
      // 1. Ejecutar análisis y automatizaciones originales
      const originalResult = await super.processIncomingMessage(messageId, content)
      
      // 2. Obtener contexto del mensaje para resolución inteligente
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
        return originalResult
      }

      // 3. Verificar si debe activarse resolución inteligente
      const shouldResolve = await this.shouldActivateResolution(
        originalResult.analysis, 
        content, 
        message.conversation
      )

      if (!shouldResolve) {
        console.log('🤖 IA: No se activa resolución automática para este mensaje')
        return originalResult
      }

      console.log('🧠 IA: Activando resolución inteligente...')

      // 4. Ejecutar resolución con Knowledge Base
      const resolver = createAIKnowledgeResolver(
        message.organizationId,
        'ai-system',
        'COMODÍN IA'
      )

      const resolutionResult = await resolver.resolveQuery(
        content,
        message.conversationId,
        {
          maxResults: 5,
          minSimilarity: 0.75,
          includeFilesInResponse: true,
          responseStyle: 'professional'
        }
      )

      // 5. Si hay confianza suficiente, enviar respuesta automática
      if (resolutionResult.confidence >= 0.7) {
        await this.sendIntelligentResponse(message.conversationId, resolutionResult)
      }

      return {
        ...originalResult,
        aiResolution: resolutionResult
      }

    } catch (error) {
      console.error('❌ Error en procesamiento mejorado:', error)
      // Retornar resultado original en caso de error
      return await super.processIncomingMessage(messageId, content)
    }
  }

  /**
   * Determina si debe activarse la resolución inteligente
   */
  private async shouldActivateResolution(
    analysis: AIAnalysisResult,
    content: string,
    conversation: any
  ): Promise<boolean> {
    
    // 1. Verificar que sean intenciones que requieren información
    const resolvableIntentions = ['QUESTION', 'INFORMATION', 'SALES', 'SUPPORT']
    const hasResolvableIntention = analysis.detectedIntentions.some(intention => 
      resolvableIntentions.includes(intention)
    )

    if (!hasResolvableIntention) {
      return false
    }

    // 2. Verificar confianza mínima en el análisis
    if (analysis.confidenceScore < 0.6) {
      return false
    }

    // 3. No activar para saludos o despedidas simples
    const simpleIntentions = ['GREETING', 'FAREWELL']
    if (analysis.detectedIntentions.every(intention => simpleIntentions.includes(intention))) {
      return false
    }

    // 4. Verificar longitud mínima del mensaje (evitar respuestas a "ok", "si", etc.)
    if (content.trim().length < 10) {
      return false
    }

    // 5. Verificar que no sea la primera respuesta en una secuencia reciente
    const recentMessages = await prisma.message.findMany({
      where: {
        conversationId: conversation.id,
        direction: 'OUTGOING',
        sentAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Últimos 5 minutos
        }
      },
      orderBy: { sentAt: 'desc' },
      take: 2
    })

    // Si ya se envió una respuesta automática recientemente, no enviar otra
    if (recentMessages.some(msg => msg.sentByName?.includes('IA') || msg.sentByName?.includes('Automática'))) {
      return false
    }

    return true
  }

  /**
   * Envía respuesta inteligente con archivos adjuntos si corresponde
   */
  private async sendIntelligentResponse(
    conversationId: string, 
    resolution: ResolutionResult
  ): Promise<void> {
    try {
      console.log('📤 Enviando respuesta inteligente...')

      // 1. Enviar mensaje de texto principal
      const textMessage = await prisma.message.create({
        data: {
          organizationId: this.organizationId,
          conversationId,
          direction: 'OUTGOING',
          type: 'TEXT',
          content: resolution.responseText,
          sentByName: 'COMODÍN IA',
          sentAt: new Date(),
          metadata: {
            aiResolution: true,
            confidence: resolution.confidence,
            knowledgeSourcesUsed: resolution.knowledgeUsed.length,
            processingTime: resolution.processingTime
          }
        }
      })

      // 2. Enviar archivos si hay adjuntos
      if (resolution.filesToSend.length > 0) {
        console.log(`📎 Enviando ${resolution.filesToSend.length} archivos adjuntos...`)
        
        for (const file of resolution.filesToSend) {
          await this.sendFileMessage(conversationId, file)
        }
      }

      // 3. Actualizar conversación
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageAt: new Date(),
          lastMessageText: resolution.responseText.substring(0, 100),
          lastMessageFrom: 'OUTGOING',
          messageCount: { increment: 1 + resolution.filesToSend.length }
        }
      })

      console.log('✅ Respuesta inteligente enviada exitosamente')

    } catch (error) {
      console.error('❌ Error enviando respuesta inteligente:', error)
      throw error
    }
  }

  /**
   * Envía un mensaje con archivo adjunto
   */
  private async sendFileMessage(conversationId: string, file: any): Promise<void> {
    try {
      // Generar URL de descarga temporal
      const resolver = createAIKnowledgeResolver(this.organizationId, 'ai-system', 'COMODÍN IA')
      const filesWithUrls = await resolver.generateDownloadUrls([file])
      
      if (filesWithUrls.length === 0) {
        console.warn(`No se pudo generar URL para ${file.fileName}`)
        return
      }

      const fileWithUrl = filesWithUrls[0]
      
      await prisma.message.create({
        data: {
          organizationId: this.organizationId,
          conversationId,
          direction: 'OUTGOING',
          type: this.getMessageTypeFromMime(file.mimeType),
          content: `📄 ${file.fileName}\n\n${file.reason}`,
          sentByName: 'COMODÍN IA',
          sentAt: new Date(),
          attachmentUrl: fileWithUrl.downloadUrl,
          attachmentName: file.fileName,
          attachmentType: file.mimeType,
          metadata: {
            aiAttachment: true,
            sourceId: file.sourceId,
            sourceName: file.sourceName,
            originalFileUrl: file.fileUrl
          }
        }
      })

      console.log(`✅ Archivo enviado: ${file.fileName}`)

    } catch (error) {
      console.error(`❌ Error enviando archivo ${file.fileName}:`, error)
    }
  }

  /**
   * Determina el tipo de mensaje basado en MIME type
   */
  private getMessageTypeFromMime(mimeType: string): 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' {
    if (mimeType.startsWith('image/')) return 'IMAGE'
    if (mimeType.startsWith('video/')) return 'VIDEO'
    if (mimeType.startsWith('audio/')) return 'AUDIO'
    return 'DOCUMENT'
  }
}

// Función auxiliar para crear instancia del broker mejorado
export function createEnhancedAIBroker(organizationId: string): AIBrokerEnhanced {
  return new AIBrokerEnhanced(organizationId)
}

// Función para procesar mensaje entrante con funcionalidades mejoradas
export async function processIncomingMessageEnhanced(
  organizationId: string, 
  messageId: string, 
  content: string
): Promise<{
  analysis: AIAnalysisResult
  automationsExecuted: number  
  automationsSkipped: number
  aiResolution?: ResolutionResult
}> {
  const enhancedBroker = createEnhancedAIBroker(organizationId)
  return await enhancedBroker.processIncomingMessage(messageId, content)
}
