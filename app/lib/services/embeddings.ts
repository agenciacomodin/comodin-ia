
import OpenAI from 'openai'
import { prisma } from '@/lib/db'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
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
    // Usando SQL directo para búsqueda vectorial con pgvector
    const embeddingString = `[${queryEmbedding.join(',')}]`
    
    const results = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        kc.id,
        kc.content,
        kc."chunkIndex",
        ks.title as source_title,
        ks.type as source_type,
        1 - (kc.embedding <=> $1::vector) as similarity
      FROM "KnowledgeChunk" kc
      JOIN "KnowledgeSource" ks ON kc."sourceId" = ks.id
      WHERE ks."organizationId" = $2
      ORDER BY kc.embedding <=> $1::vector
      LIMIT $3
    `, embeddingString, organizationId, limit)
    
    return results
  } catch (error) {
    console.error('Error searching similar chunks:', error)
    throw new Error('Failed to search similar chunks')
  }
}

export async function storeEmbedding(
  sourceId: string,
  chunkIndex: number,
  content: string,
  embedding: number[],
  organizationId: string
) {
  try {
    const embeddingString = `[${embedding.join(',')}]`
    
    await prisma.$executeRawUnsafe(`
      INSERT INTO "KnowledgeChunk" (id, "sourceId", "chunkIndex", content, embedding, "organizationId", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4::vector, $5, NOW(), NOW())
    `, sourceId, chunkIndex, content, embeddingString, organizationId)
    
    return true
  } catch (error) {
    console.error('Error storing embedding:', error)
    throw new Error('Failed to store embedding')
  }
}
