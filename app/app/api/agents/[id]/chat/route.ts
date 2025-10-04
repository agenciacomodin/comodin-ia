
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateEmbedding, searchSimilar } from '@/lib/services/embeddings'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { message, conversationId } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Mensaje es requerido' }, { status: 400 })
    }

    // Obtener agente
    const agent = await prisma.rAGAgent.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId
      }
    })

    if (!agent) {
      return NextResponse.json({ error: 'Agente no encontrado' }, { status: 404 })
    }

    // Buscar contexto relevante en knowledge base
    const queryEmbedding = await generateEmbedding(message)
    const relevantChunks = await searchSimilar(
      queryEmbedding,
      session.user.organizationId,
      5
    )

    // Construir contexto
    const context = relevantChunks
      .map(chunk => chunk.content)
      .join('\n\n---\n\n')

    // Obtener o crear conversación
    let conversation
    if (conversationId) {
      conversation = await prisma.rAGAgentConversation.findFirst({
        where: {
          id: conversationId,
          agentId: params.id,
          organizationId: session.user.organizationId
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 10
          }
        }
      })
    } else {
      conversation = await prisma.rAGAgentConversation.create({
        data: {
          agentId: params.id,
          organizationId: session.user.organizationId,
          title: message.slice(0, 50)
        },
        include: {
          messages: true
        }
      })
    }

    if (!conversation) {
      return NextResponse.json({ error: 'No se pudo encontrar o crear la conversación' }, { status: 500 })
    }

    // Guardar mensaje del usuario
    await prisma.rAGAgentMessage.create({
      data: {
        agentId: params.id,
        conversationId: conversation.id,
        organizationId: session.user.organizationId,
        role: 'user',
        content: message
      }
    })

    // Construir mensajes para OpenAI
    const messages = [
      {
        role: 'system',
        content: `${agent.systemPrompt || 'Eres un asistente útil.'}\n\nContexto relevante de la base de conocimiento:\n${context}`
      },
      ...conversation.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ]

    // Generar respuesta con OpenAI
    const completion = await openai.chat.completions.create({
      model: agent.aiModel,
      messages: messages as any,
      temperature: agent.temperature || 0.7,
      max_tokens: 1000
    })

    const assistantMessage = completion.choices[0].message.content

    // Guardar respuesta del asistente
    await prisma.rAGAgentMessage.create({
      data: {
        agentId: params.id,
        conversationId: conversation.id,
        organizationId: session.user.organizationId,
        role: 'assistant',
        content: assistantMessage || ''
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        conversationId: conversation.id,
        message: assistantMessage,
        sources: relevantChunks.map(chunk => ({
          title: chunk.source_title,
          type: chunk.source_type,
          similarity: chunk.similarity
        }))
      }
    })
  } catch (error) {
    console.error('Error en chat con agente:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
