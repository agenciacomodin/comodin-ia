
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateEmbedding, searchSimilar } from '@/lib/services/embeddings'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { agentId, message } = await request.json()

    if (!agentId || !message) {
      return NextResponse.json({ error: 'agentId y message son requeridos' }, { status: 400 })
    }

    // Obtener agente
    const agent = await prisma.rAGAgent.findFirst({
      where: {
        id: agentId,
        organizationId: session.user.organizationId
      }
    })

    if (!agent) {
      return NextResponse.json({ error: 'Agente no encontrado' }, { status: 404 })
    }

    // Buscar contexto relevante
    const queryEmbedding = await generateEmbedding(message)
    const relevantChunks = await searchSimilar(
      queryEmbedding,
      session.user.organizationId,
      5
    )

    // Construir contexto
    const context = relevantChunks
      .map(chunk => `[${chunk.source_title}] ${chunk.content}`)
      .join('\n\n')

    // Generar respuesta con OpenAI
    const completion = await openai.chat.completions.create({
      model: agent.aiModel,
      messages: [
        {
          role: 'system',
          content: `${agent.systemPrompt || 'Eres un asistente útil.'}\n\nContexto:\n${context}`
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: agent.temperature || 0.7,
      max_tokens: 500
    })

    const response = completion.choices[0].message.content

    return NextResponse.json({
      success: true,
      data: {
        response,
        sources: relevantChunks.map(chunk => ({
          title: chunk.source_title,
          type: chunk.source_type,
          similarity: chunk.similarity,
          content: chunk.content.substring(0, 200)
        })),
        model: agent.aiModel,
        temperature: agent.temperature
      }
    })
  } catch (error) {
    console.error('Error en test de agente:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: String(error) },
      { status: 500 }
    )
  }
}
