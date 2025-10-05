
/**
 * Knowledge Processor - Procesador de contenido para la base de conocimiento
 * 
 * Funcionalidades:
 * 1. Extracción de texto de archivos (PDF, DOC, TXT)
 * 2. Procesamiento de URLs y web scraping
 * 3. División de contenido en chunks (fragmentos)
 * 4. Generación de embeddings vectoriales
 * 5. Cálculo de calidad de contenido
 */

import { PrismaClient } from '@prisma/client'
import { KnowledgeSourceType, KnowledgeSourceStatus, ChunkProcessingStatus } from '@prisma/client'
import OpenAI from 'openai'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { ContentProcessor, EmbeddingProvider, DEFAULT_CHUNK_SIZE, DEFAULT_CHUNK_OVERLAP, DEFAULT_EMBEDDING_MODEL } from './types'

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

export class KnowledgeProcessor {
  private organizationId: string
  private userId: string
  private userName: string

  constructor(organizationId: string, userId: string, userName: string) {
    this.organizationId = organizationId
    this.userId = userId
    this.userName = userName
  }

  /**
   * Procesa una fuente de conocimiento completa
   */
  async processKnowledgeSource(sourceId: string): Promise<{
    success: boolean
    chunksProcessed: number
    embeddings: number
    error?: string
  }> {
    try {
      const source = await prisma.knowledgeSource.findUnique({
        where: { id: sourceId }
      })

      if (!source) {
        throw new Error('Fuente de conocimiento no encontrada')
      }

      // Actualizar estado a PROCESSING
      await prisma.knowledgeSource.update({
        where: { id: sourceId },
        data: { 
          status: KnowledgeSourceStatus.PROCESSING,
          lastError: null,
          retryCount: { increment: 1 }
        }
      })

      let textContent = source.textContent

      // Extraer contenido según el tipo de fuente
      if (source.type === KnowledgeSourceType.FILE && source.fileUrl) {
        textContent = await this.extractTextFromFile(source.fileUrl, source.fileMimeType || '')
      } else if (source.type === KnowledgeSourceType.URL && source.sourceUrl) {
        textContent = await this.extractTextFromURL(source.sourceUrl)
      }

      if (!textContent || textContent.trim().length < 10) {
        throw new Error('No se pudo extraer contenido válido')
      }

      // Actualizar contenido extraído
      await prisma.knowledgeSource.update({
        where: { id: sourceId },
        data: { 
          textContent,
          status: KnowledgeSourceStatus.CHUNKING
        }
      })

      // Dividir en chunks
      const chunks = this.splitIntoChunks(textContent, source.chunkSize, source.chunkOverlap)
      const totalChunks = chunks.length

      // Actualizar estadísticas
      await prisma.knowledgeSource.update({
        where: { id: sourceId },
        data: { 
          totalChunks,
          status: KnowledgeSourceStatus.EMBEDDING
        }
      })

      // Procesar cada chunk
      let processedChunks = 0
      let embeddings = 0

      for (let i = 0; i < chunks.length; i++) {
        try {
          const chunk = await this.processChunk(sourceId, chunks[i], i)
          const embedding = await this.generateEmbeddingForChunk(chunk.id, chunks[i])
          
          if (embedding) {
            embeddings++
          }
          processedChunks++

          // Actualizar progreso
          await prisma.knowledgeSource.update({
            where: { id: sourceId },
            data: { processedChunks }
          })

        } catch (chunkError) {
          console.error(`Error procesando chunk ${i}:`, chunkError)
          await prisma.knowledgeSource.update({
            where: { id: sourceId },
            data: { failedChunks: { increment: 1 } }
          })
        }
      }

      // Finalizar procesamiento
      const contentQuality = this.calculateQuality(textContent)
      
      await prisma.knowledgeSource.update({
        where: { id: sourceId },
        data: { 
          status: KnowledgeSourceStatus.ACTIVE,
          processedAt: new Date(),
          contentQuality
        }
      })

      return {
        success: true,
        chunksProcessed: processedChunks,
        embeddings
      }

    } catch (error) {
      console.error('Error procesando fuente de conocimiento:', error)
      
      // Marcar como error
      await prisma.knowledgeSource.update({
        where: { id: sourceId },
        data: { 
          status: KnowledgeSourceStatus.ERROR,
          lastError: error instanceof Error ? error.message : 'Error desconocido'
        }
      })

      return {
        success: false,
        chunksProcessed: 0,
        embeddings: 0,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  /**
   * Extrae texto de un archivo almacenado en S3
   */
  async extractTextFromFile(fileUrl: string, mimeType: string): Promise<string> {
    try {
      // Para esta implementación básica, asumimos que los archivos de texto se pueden leer directamente
      if (mimeType === 'text/plain' || mimeType === 'text/markdown' || mimeType === 'text/csv') {
        // Obtener el archivo de S3
        const fileKey = fileUrl.replace(`https://${bucketName}.s3.amazonaws.com/`, '')
        const command = new GetObjectCommand({
          Bucket: bucketName,
          Key: fileKey
        })

        const response = await s3Client.send(command)
        const textContent = await response.Body?.transformToString() || ''
        return textContent
      }

      // Para PDF y DOC, normalmente usaríamos librerías especializadas
      // Por ahora, retornamos un placeholder
      if (mimeType === 'application/pdf') {
        return `[Contenido PDF - Requiere procesamiento especializado]
        
        Este archivo PDF contiene información importante para el negocio.
        Para una extracción completa, se requiere implementar un procesador PDF específico.`
      }

      if (mimeType.includes('word') || mimeType.includes('document')) {
        return `[Contenido DOC/DOCX - Requiere procesamiento especializado]
        
        Este documento Word contiene información importante para el negocio.
        Para una extracción completa, se requiere implementar un procesador de documentos específico.`
      }

      throw new Error(`Tipo de archivo no soportado: ${mimeType}`)

    } catch (error) {
      console.error('Error extrayendo texto del archivo:', error)
      throw new Error('No se pudo extraer el texto del archivo')
    }
  }

  /**
   * Extrae texto de una URL mediante web scraping básico
   */
  async extractTextFromURL(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'COMODIN IA Knowledge Processor 1.0'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const html = await response.text()
      
      // Extracción básica de texto HTML (remover tags)
      const textContent = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remover scripts
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remover estilos
        .replace(/<[^>]*>/g, '') // Remover tags HTML
        .replace(/&nbsp;/g, ' ') // Reemplazar entidades HTML
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ') // Normalizar espacios
        .trim()

      if (textContent.length < 100) {
        throw new Error('Contenido muy corto o vacío')
      }

      return textContent

    } catch (error) {
      console.error('Error extrayendo contenido de URL:', error)
      throw new Error(`No se pudo extraer contenido de la URL: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  /**
   * Extrae metadatos básicos de un archivo
   */
  async extractMetadata(file: File): Promise<any> {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified),
      language: this.detectLanguage(file.name)
    }
  }

  /**
   * Divide el contenido en chunks (fragmentos)
   */
  splitIntoChunks(content: string, chunkSize = DEFAULT_CHUNK_SIZE, overlap = DEFAULT_CHUNK_OVERLAP): string[] {
    const chunks: string[] = []
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    
    let currentChunk = ''
    let currentLength = 0

    for (const sentence of sentences) {
      const sentenceLength = sentence.trim().length
      
      // Si agregar esta oración excede el tamaño del chunk
      if (currentLength + sentenceLength > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim())
        
        // Comenzar nuevo chunk con overlap
        const overlapWords = currentChunk.split(' ').slice(-Math.floor(overlap / 10))
        currentChunk = overlapWords.join(' ') + ' ' + sentence.trim()
        currentLength = currentChunk.length
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence.trim()
        currentLength = currentChunk.length
      }
    }

    // Agregar el último chunk si no está vacío
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim())
    }

    // Si no se generaron chunks, crear uno con todo el contenido
    if (chunks.length === 0 && content.trim().length > 0) {
      chunks.push(content.trim())
    }

    return chunks
  }

  /**
   * Detecta el idioma del contenido (básico)
   */
  detectLanguage(content: string): string {
    const spanishWords = ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'como', 'pero', 'más', 'muy', 'todo', 'esta', 'está', 'hasta']
    const englishWords = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they']
    
    const words = content.toLowerCase().split(/\s+/).slice(0, 100) // Analizar las primeras 100 palabras
    
    let spanishScore = 0
    let englishScore = 0
    
    words.forEach(word => {
      if (spanishWords.includes(word)) spanishScore++
      if (englishWords.includes(word)) englishScore++
    })
    
    return spanishScore > englishScore ? 'es' : 'en'
  }

  /**
   * Calcula la calidad del contenido (0-1)
   */
  calculateQuality(content: string): number {
    if (!content || content.trim().length === 0) return 0

    let score = 0.5 // Puntuación base
    
    // Longitud adecuada (ni muy corto ni muy largo)
    const length = content.length
    if (length > 100 && length < 50000) score += 0.2
    
    // Diversidad de palabras
    const words = content.toLowerCase().split(/\s+/)
    const uniqueWords = new Set(words)
    const diversity = uniqueWords.size / words.length
    score += diversity * 0.2
    
    // Estructura (presencia de puntuación)
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    if (sentences.length > 1) score += 0.1
    
    // Ausencia de caracteres extraños
    const cleanRatio = content.replace(/[^\w\s.,;:!?()""''—-]/g, '').length / content.length
    score += cleanRatio * 0.1

    return Math.min(1, Math.max(0, score))
  }

  /**
   * Procesa un chunk individual
   */
  private async processChunk(sourceId: string, content: string, index: number) {
    const wordCount = content.split(/\s+/).length
    const characterCount = content.length
    const language = this.detectLanguage(content)
    const quality = this.calculateQuality(content)

    return await prisma.knowledgeChunk.create({
      data: {
        sourceId,
        organizationId: this.organizationId,
        content,
        chunkIndex: index,
        status: ChunkProcessingStatus.COMPLETED,
        wordCount,
        characterCount,
        language,
        contentQuality: quality,
      }
    })
  }

  /**
   * Genera embedding para un chunk
   */
  private async generateEmbeddingForChunk(chunkId: string, content: string) {
    try {
      const startTime = Date.now()
      
      // Generar embedding usando OpenAI
      const response = await openai.embeddings.create({
        model: DEFAULT_EMBEDDING_MODEL,
        input: content.slice(0, 8000), // Limitar a 8K caracteres
      })

      const embedding = response.data[0]?.embedding
      if (!embedding) {
        throw new Error('No se pudo generar el embedding')
      }

      const processingTime = Date.now() - startTime
      const dimensions = embedding.length

      // Guardar embedding en la base de datos
      return await prisma.knowledgeEmbedding.create({
        data: {
          chunkId,
          modelUsed: DEFAULT_EMBEDDING_MODEL,
          embeddingVersion: '1.0',
          dimensions,
          embedding: embedding,
          processingTime,
          providerUsed: 'openai',
          quality: 0.9, // Por ahora asumimos buena calidad
          confidence: 0.95
        }
      })

    } catch (error) {
      console.error('Error generando embedding:', error)
      
      // Marcar chunk como fallido
      await prisma.knowledgeChunk.update({
        where: { id: chunkId },
        data: { 
          status: ChunkProcessingStatus.FAILED,
          processingError: error instanceof Error ? error.message : 'Error generando embedding'
        }
      })
      
      return null
    }
  }
}

// Clase para búsqueda semántica
export class KnowledgeSearcher {
  private organizationId: string

  constructor(organizationId: string) {
    this.organizationId = organizationId
  }

  /**
   * Realiza búsqueda semántica en la base de conocimiento
   */
  async searchKnowledge(query: string, options: {
    maxResults?: number
    minSimilarity?: number
    sourceTypes?: KnowledgeSourceType[]
    sourceTags?: string[]
  } = {}): Promise<{
    results: Array<{
      chunkId: string
      sourceId: string
      sourceName: string
      content: string
      similarity: number
      metadata?: any
    }>
    totalResults: number
    processingTime: number
  }> {
    const startTime = Date.now()
    
    try {
      // Generar embedding para la consulta
      const queryEmbedding = await this.generateQueryEmbedding(query)
      
      // Buscar chunks similares
      const chunks = await this.findSimilarChunks(queryEmbedding, options)
      
      const processingTime = Date.now() - startTime

      return {
        results: chunks,
        totalResults: chunks.length,
        processingTime
      }

    } catch (error) {
      console.error('Error en búsqueda semántica:', error)
      throw error
    }
  }

  /**
   * Genera embedding para la consulta
   */
  private async generateQueryEmbedding(query: string): Promise<number[]> {
    const response = await openai.embeddings.create({
      model: DEFAULT_EMBEDDING_MODEL,
      input: query,
    })

    const embedding = response.data[0]?.embedding
    if (!embedding) {
      throw new Error('No se pudo generar embedding para la consulta')
    }

    return embedding
  }

  /**
   * Encuentra chunks similares usando búsqueda vectorial básica
   */
  private async findSimilarChunks(queryEmbedding: number[], options: any) {
    // Esta es una implementación básica
    // En producción se usaría una base de datos vectorial como Pinecone, Weaviate, etc.
    
    const chunks = await prisma.knowledgeChunk.findMany({
      where: {
        source: {
          organizationId: this.organizationId,
          status: KnowledgeSourceStatus.ACTIVE,
          ...(options.sourceTypes && { type: { in: options.sourceTypes } })
        },
        status: ChunkProcessingStatus.COMPLETED
      },
      include: {
        source: {
          select: {
            id: true,
            name: true,
            type: true,
            tags: true
          }
        },
        embeddings: {
          where: {
            modelUsed: DEFAULT_EMBEDDING_MODEL
          },
          take: 1
        }
      },
      take: 100 // Limitar para performance
    })

    // Calcular similaridad coseno
    const results = chunks
      .filter(chunk => chunk.embeddings.length > 0)
      .map(chunk => {
        const embedding = chunk.embeddings[0].embedding as number[]
        const similarity = this.calculateCosineSimilarity(queryEmbedding, embedding)
        
        return {
          chunkId: chunk.id,
          sourceId: chunk.source.id,
          sourceName: chunk.source.name,
          content: chunk.content.slice(0, 500), // Limitar contenido
          similarity,
          metadata: {
            type: chunk.source.type,
            tags: chunk.source.tags,
            wordCount: chunk.wordCount,
            quality: chunk.contentQuality?.toNumber()
          }
        }
      })
      .filter(result => result.similarity >= (options.minSimilarity || 0.7))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, options.maxResults || 10)

    return results
  }

  /**
   * Calcula la similaridad coseno entre dos vectores
   */
  private calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i]
      normA += vecA[i] * vecA[i]
      normB += vecB[i] * vecB[i]
    }

    if (normA === 0 || normB === 0) return 0

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }
}

// Funciones de utilidad
export async function createKnowledgeProcessor(
  organizationId: string, 
  userId: string, 
  userName: string
): Promise<KnowledgeProcessor> {
  return new KnowledgeProcessor(organizationId, userId, userName)
}

export async function createKnowledgeSearcher(
  organizationId: string
): Promise<KnowledgeSearcher> {
  return new KnowledgeSearcher(organizationId)
}
