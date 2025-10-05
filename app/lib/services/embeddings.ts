
import OpenAI from 'openai'
import { prisma } from '@/lib/db'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder'
})

// Función para calcular similitud de coseno entre dos vectores
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0
  
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  
  if (normA === 0 || normB === 0) return 0
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-placeholder') {
      console.warn('OpenAI API key not configured, returning mock embedding')
      // Retornar un embedding mock para desarrollo
      return new Array(1536).fill(0).map(() => Math.random() * 0.1)
    }
    
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text
    })
    
    return response.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw new Error('Failed to generate embedding')
  }
}

export async function searchSimilar(
  queryEmbedding: number[],
  organizationId: string,
  limit: number = 5
) {
  try {
    // Intentar usar pgvector si está disponible
    try {
      const embeddingString = `[${queryEmbedding.join(',')}]`
      
      const results = await prisma.$queryRawUnsafe<any[]>(`
        SELECT 
          kc.id,
          kc.content,
          kc."chunkIndex",
          ks.name as source_title,
          ks.type as source_type,
          1 - (kc.embedding <=> $1::vector) as similarity
        FROM knowledge_chunks kc
        JOIN knowledge_sources ks ON kc."sourceId" = ks.id
        WHERE kc."organizationId" = $2 AND kc.embedding IS NOT NULL
        ORDER BY kc.embedding <=> $1::vector
        LIMIT $3
      `, embeddingString, organizationId, limit)
      
      return results
    } catch (pgvectorError) {
      // Si pgvector no está disponible, usar búsqueda basada en KnowledgeEmbedding con Json
      console.warn('pgvector not available, falling back to JSON-based search')
      
      const chunks = await prisma.knowledgeChunk.findMany({
        where: {
          organizationId,
          embeddings: {
            some: {}
          }
        },
        include: {
          source: {
            select: {
              name: true,
              type: true
            }
          },
          embeddings: {
            take: 1,
            orderBy: {
              createdAt: 'desc'
            }
          }
        },
        take: 100 // Limitar búsqueda inicial
      })
      
      // Calcular similaridad manualmente
      const results = chunks
        .map(chunk => {
          if (!chunk.embeddings[0]?.embedding) return null
          
          const embedding = chunk.embeddings[0].embedding as number[]
          const similarity = cosineSimilarity(queryEmbedding, embedding)
          
          return {
            id: chunk.id,
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            source_title: chunk.source.name,
            source_type: chunk.source.type,
            similarity
          }
        })
        .filter(Boolean)
        .sort((a, b) => (b?.similarity || 0) - (a?.similarity || 0))
        .slice(0, limit)
      
      return results
    }
  } catch (error) {
    console.error('Error searching similar chunks:', error)
    return [] // Retornar array vacío en lugar de lanzar error
  }
}

export async function storeEmbedding(
  chunkId: string,
  embedding: number[],
  modelUsed: string = 'text-embedding-3-small'
) {
  try {
    // Intentar almacenar en el campo vector si pgvector está disponible
    try {
      const embeddingString = `[${embedding.join(',')}]`
      
      await prisma.$executeRawUnsafe(`
        UPDATE knowledge_chunks 
        SET embedding = $1::vector, "processedAt" = NOW()
        WHERE id = $2
      `, embeddingString, chunkId)
      
      return true
    } catch (pgvectorError) {
      // Fallback: almacenar en KnowledgeEmbedding con Json
      console.warn('pgvector not available, storing embedding as JSON')
      
      await prisma.knowledgeEmbedding.upsert({
        where: {
          chunkId_modelUsed: {
            chunkId,
            modelUsed
          }
        },
        create: {
          chunkId,
          modelUsed,
          dimensions: embedding.length,
          embedding: embedding,
          providerUsed: 'openai'
        },
        update: {
          embedding: embedding,
          dimensions: embedding.length
        }
      })
      
      return true
    }
  } catch (error) {
    console.error('Error storing embedding:', error)
    throw new Error('Failed to store embedding')
  }
}
