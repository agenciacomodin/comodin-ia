

/**
 * AI Knowledge Resolver - Sistema resolutivo que integra IA con Knowledge Base
 * 
 * Funcionalidades principales:
 * 1. Búsqueda inteligente en base de conocimiento vectorial
 * 2. Generación de respuestas contextuales usando información encontrada
 * 3. Envío automático de archivos cuando la información proviene de documentos
 * 4. Tracking completo de resoluciones y archivos enviados
 */

import { PrismaClient } from '@prisma/client'
import { KnowledgeSearcher } from '@/lib/knowledge-processor'
import OpenAI from 'openai'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { AIAnalysisResult } from './types'

const prisma = new PrismaClient()

// Configuración del cliente OpenAI
const openai = new OpenAI({
  baseURL: process.env.ABACUSAI_BASE_URL || 'https://chatllm.abacus.ai/v1',
  apiKey: process.env.ABACUSAI_API_KEY || '',
})

// Configuración de S3
const s3Client = new S3Client({})
const bucketName = process.env.AWS_BUCKET_NAME || ''
const folderPrefix = process.env.AWS_FOLDER_PREFIX || ''

export interface ResolutionResult {
  responseText: string
  filesToSend: Array<{
    sourceId: string
    sourceName: string
    fileUrl: string
    fileName: string
    mimeType: string
    reason: string // Por qué se está enviando este archivo
  }>
  knowledgeUsed: Array<{
    sourceId: string
    sourceName: string
    content: string
    similarity: number
  }>
  confidence: number
  processingTime: number
}

export interface ResolutionOptions {
  maxResults?: number
  minSimilarity?: number
  includeFilesInResponse?: boolean // Si incluir archivos cuando la información es relevante
  responseStyle?: 'formal' | 'casual' | 'professional'
  maxResponseLength?: number
}

export class AIKnowledgeResolver {
  private organizationId: string
  private userId: string
  private userName: string
  private knowledgeSearcher: KnowledgeSearcher

  constructor(organizationId: string, userId: string, userName: string) {
    this.organizationId = organizationId
    this.userId = userId
    this.userName = userName
    this.knowledgeSearcher = new KnowledgeSearcher(organizationId)
  }

  /**
   * Resuelve una consulta del cliente usando IA + Knowledge Base
   */
  async resolveQuery(
    query: string, 
    conversationId: string,
    options: ResolutionOptions = {}
  ): Promise<ResolutionResult> {
    const startTime = Date.now()
    
    try {
      // 1. Buscar información relevante en Knowledge Base
      console.log('🔍 Buscando en Knowledge Base:', query)
      const searchResult = await this.knowledgeSearcher.searchKnowledge(query, {
        maxResults: options.maxResults || 5,
        minSimilarity: options.minSimilarity || 0.75
      })

      if (searchResult.results.length === 0) {
        // Si no hay resultados relevantes, generar respuesta básica
        return {
          responseText: 'Lo siento, no tengo información específica sobre esa consulta. ¿Podrías ser más específico o contactar con un agente?',
          filesToSend: [],
          knowledgeUsed: [],
          confidence: 0.1,
          processingTime: Date.now() - startTime
        }
      }

      // 2. Generar respuesta inteligente usando la información encontrada
      console.log('🤖 Generando respuesta inteligente...')
      const intelligentResponse = await this.generateIntelligentResponse(
        query, 
        searchResult.results,
        options
      )

      // 3. Determinar qué archivos enviar automáticamente
      const filesToSend = await this.determineFilesToSend(searchResult.results)

      // 4. Registrar la resolución en base de datos
      await this.logResolution(conversationId, query, searchResult, intelligentResponse, filesToSend)

      const processingTime = Date.now() - startTime
      console.log('✅ Resolución completada en', processingTime, 'ms')

      return {
        responseText: intelligentResponse.text,
        filesToSend,
        knowledgeUsed: searchResult.results.map(r => ({
          sourceId: r.sourceId,
          sourceName: r.sourceName,
          content: r.content,
          similarity: r.similarity
        })),
        confidence: intelligentResponse.confidence,
        processingTime
      }

    } catch (error) {
      console.error('❌ Error en resolución:', error)
      
      return {
        responseText: 'Disculpa, tengo dificultades técnicas en este momento. Un agente te ayudará pronto.',
        filesToSend: [],
        knowledgeUsed: [],
        confidence: 0,
        processingTime: Date.now() - startTime
      }
    }
  }

  /**
   * Genera una respuesta inteligente usando IA y la información encontrada
   */
  private async generateIntelligentResponse(
    query: string,
    knowledgeResults: any[],
    options: ResolutionOptions
  ): Promise<{ text: string, confidence: number }> {
    
    // Construir contexto con la información encontrada
    const context = knowledgeResults.map((result, index) => 
      `[Fuente ${index + 1}: ${result.sourceName} (relevancia: ${Math.round(result.similarity * 100)}%)]\n${result.content}`
    ).join('\n\n')

    const responseStyle = options.responseStyle || 'professional'
    const maxLength = options.maxResponseLength || 500

    const prompt = this.createResponsePrompt(query, context, responseStyle, maxLength, knowledgeResults)

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: this.getSystemPromptForResolution(responseStyle)
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: Math.min(800, maxLength + 100)
      })

      const responseText = response.choices[0]?.message?.content || 'No pude generar una respuesta adecuada.'
      
      // Calcular confianza basada en relevancia de fuentes
      const avgSimilarity = knowledgeResults.reduce((sum, r) => sum + r.similarity, 0) / knowledgeResults.length
      const confidence = Math.min(0.95, avgSimilarity)

      return {
        text: responseText,
        confidence
      }

    } catch (error) {
      console.error('Error generando respuesta:', error)
      return {
        text: 'Basándome en la información disponible, puedo ayudarte con tu consulta. Te he preparado algunos documentos relevantes que contienen información detallada.',
        confidence: 0.6
      }
    }
  }

  /**
   * Determina qué archivos enviar automáticamente
   */
  private async determineFilesToSend(knowledgeResults: any[]): Promise<any[]> {
    const filesToSend = []

    // Obtener fuentes de conocimiento que tienen archivos asociados
    const sourceIds = [...new Set(knowledgeResults.map(r => r.sourceId))]
    
    const sourcesWithFiles = await prisma.knowledgeSource.findMany({
      where: {
        id: { in: sourceIds },
        type: 'FILE',
        fileUrl: { not: null },
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        fileUrl: true,
        originalFileName: true,
        fileMimeType: true
      }
    })

    for (const source of sourcesWithFiles) {
      // Encontrar el resultado de búsqueda correspondiente para determinar relevancia
      const searchResult = knowledgeResults.find(r => r.sourceId === source.id)
      
      if (searchResult && searchResult.similarity >= 0.80) { // Solo enviar si alta relevancia
        const reason = `Este documento contiene información específica sobre tu consulta (relevancia: ${Math.round(searchResult.similarity * 100)}%)`
        
        filesToSend.push({
          sourceId: source.id,
          sourceName: source.name,
          fileUrl: source.fileUrl!,
          fileName: source.originalFileName || `${source.name}.pdf`,
          mimeType: source.fileMimeType || 'application/pdf',
          reason
        })
      }
    }

    // Limitar a máximo 3 archivos para no saturar
    return filesToSend.slice(0, 3)
  }

  /**
   * Registra la resolución en la base de datos para tracking
   */
  private async logResolution(
    conversationId: string,
    query: string,
    searchResult: any,
    response: any,
    filesToSend: any[]
  ): Promise<void> {
    try {
      await prisma.knowledgeUsage.create({
        data: {
          organizationId: this.organizationId,
          userId: this.userId,
          userName: this.userName,
          conversationId,
          query,
          queryType: 'ai_resolution',
          resultsFound: searchResult.totalResults,
          resultsUsed: searchResult.results.length,
          avgSimilarity: searchResult.results.length > 0 
            ? searchResult.results.reduce((sum: number, r: any) => sum + r.similarity, 0) / searchResult.results.length 
            : 0,
          sourcesConsulted: [...new Set(searchResult.results.map((r: any) => r.sourceId))] as string[],
          chunksRetrieved: searchResult.results.map((r: any) => r.chunkId) as string[],
          processingTime: searchResult.processingTime,
          responseGenerated: true,
          metadata: {
            responseLength: response.text.length,
            confidence: response.confidence,
            filesAttached: filesToSend.length,
            filesSent: filesToSend.map(f => ({ sourceId: f.sourceId, fileName: f.fileName }))
          }
        }
      })

      // Actualizar estadísticas de las fuentes utilizadas
      const sourceIds = [...new Set(searchResult.results.map((r: any) => r.sourceId))] as string[]
      if (sourceIds.length > 0) {
        await prisma.knowledgeSource.updateMany({
          where: { id: { in: sourceIds } },
          data: { 
            usageCount: { increment: 1 },
            lastUsedAt: new Date()
          }
        })
      }

    } catch (error) {
      console.error('Error registrando resolución:', error)
      // No fallar por error de logging
    }
  }

  /**
   * Crea el prompt para generar la respuesta
   */
  private createResponsePrompt(
    query: string, 
    context: string, 
    style: string,
    maxLength: number,
    knowledgeResults: any[]
  ): string {
    const hasAttachments = knowledgeResults.some(r => r.metadata?.type === 'FILE')
    
    return `
Consulta del cliente: "${query}"

Información encontrada en nuestra base de conocimiento:
${context}

INSTRUCCIONES:
1. Responde de manera ${style} y útil a la consulta del cliente
2. Usa ÚNICAMENTE la información proporcionada arriba - no inventes datos
3. Si la información es suficiente, da una respuesta completa y detallada
4. Si la información es parcial, explica qué información tienes y sugiere contactar a un agente para más detalles
5. Máximo ${maxLength} caracteres
6. ${hasAttachments ? 'IMPORTANTE: Menciona que adjuntarás documentos relevantes con información adicional' : ''}
7. Sé natural y humano, evita sonar robótico
8. Si hay múltiples fuentes, integra la información de manera coherente

La respuesta debe ser directa, útil y enfocada en resolver la necesidad del cliente.
`
  }

  /**
   * Obtiene el prompt del sistema para resolución
   */
  private getSystemPromptForResolution(style: string): string {
    const styleInstructions = {
      formal: 'Usa un tono formal y profesional. Evita contracciones.',
      casual: 'Usa un tono amigable y cercano. Puedes usar contracciones.',
      professional: 'Usa un tono profesional pero accesible. Equilibra formalidad con calidez.'
    }

    return `Eres un asistente de atención al cliente especializado en proporcionar información precisa y útil. Tu objetivo es resolver las consultas de los clientes usando la información disponible en la base de conocimiento de la empresa.

Características clave:
- ${styleInstructions[style as keyof typeof styleInstructions] || styleInstructions.professional}
- Siempre honesto sobre las limitaciones de la información disponible
- Enfocado en ser resolutivo y útil
- Capaz de sugerir documentos adicionales cuando sea apropiado
- Comprensivo con las necesidades del cliente

NUNCA inventes información que no está en el contexto proporcionado.`
  }

  /**
   * Genera URLs firmadas para descarga de archivos
   */
  async generateDownloadUrls(filesToSend: any[]): Promise<any[]> {
    const filesWithUrls = []

    for (const file of filesToSend) {
      try {
        // Extraer la clave S3 de la URL
        const fileKey = file.fileUrl.replace(`https://${bucketName}.s3.amazonaws.com/`, '')
        
        // Generar URL firmada válida por 1 hora
        const downloadUrl = await getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: bucketName,
            Key: fileKey
          }),
          { expiresIn: 3600 } // 1 hora
        )

        filesWithUrls.push({
          ...file,
          downloadUrl
        })

      } catch (error) {
        console.error(`Error generando URL para archivo ${file.fileName}:`, error)
        // Skip este archivo si hay error
      }
    }

    return filesWithUrls
  }
}

// Función auxiliar para crear instancia del resolver
export function createAIKnowledgeResolver(
  organizationId: string, 
  userId: string, 
  userName: string
): AIKnowledgeResolver {
  return new AIKnowledgeResolver(organizationId, userId, userName)
}

/**
 * Función principal para procesamiento resolutivo
 * Para usar en API routes y automatizaciones
 */
export async function resolveCustomerQuery(
  organizationId: string,
  userId: string,
  userName: string,
  query: string,
  conversationId: string,
  options?: ResolutionOptions
): Promise<ResolutionResult> {
  const resolver = createAIKnowledgeResolver(organizationId, userId, userName)
  return await resolver.resolveQuery(query, conversationId, options)
}
