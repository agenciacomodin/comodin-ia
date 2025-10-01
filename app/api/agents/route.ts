import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agents = await prisma.rAGAgent.findMany({
      where: {
        organizationId: session.user.organizationId
      },
      include: {
        knowledgeBases: {
          include: {
            knowledgeSource: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch agents',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      name, 
      description, 
      systemPrompt,
      aiModel = 'gpt-4o-mini',
      temperature = 0.7,
      maxTokens = 2000,
      knowledgeSourceIds = []
    } = body;

    if (!name || !systemPrompt) {
      return NextResponse.json({ 
        error: 'Name and system prompt are required' 
      }, { status: 400 });
    }

    // Crear agente en la base de datos
    const agent = await prisma.rAGAgent.create({
      data: {
        name,
        description,
        systemPrompt,
        aiModel,
        aiProvider: 'OPENAI',
        temperature,
        maxTokens,
        type: 'CUSTOMER_SERVICE',
        status: 'ACTIVE',
        organizationId: session.user.organizationId
      }
    });

    // Asociar knowledge sources si se proporcionaron
    if (knowledgeSourceIds.length > 0) {
      await prisma.rAGAgentKnowledgeBase.createMany({
        data: knowledgeSourceIds.map((ksId: string) => ({
          agentId: agent.id,
          knowledgeSourceId: ksId
        }))
      });
    }

    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json({ 
      error: 'Failed to create agent',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, description, systemPrompt, aiModel, temperature, maxTokens, status, knowledgeSourceIds } = body;

    if (!id) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    // Verificar que el agente pertenece a la organización
    const existingAgent = await prisma.rAGAgent.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId
      }
    });

    if (!existingAgent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Actualizar en la base de datos
    const agent = await prisma.rAGAgent.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(systemPrompt && { systemPrompt }),
        ...(aiModel && { aiModel }),
        ...(temperature !== undefined && { temperature }),
        ...(maxTokens !== undefined && { maxTokens }),
        ...(status && { status })
      }
    });

    // Actualizar knowledge sources si se proporcionaron
    if (knowledgeSourceIds) {
      await prisma.rAGAgentKnowledgeBase.deleteMany({
        where: { agentId: id }
      });
      
      if (knowledgeSourceIds.length > 0) {
        await prisma.rAGAgentKnowledgeBase.createMany({
          data: knowledgeSourceIds.map((ksId: string) => ({
            agentId: id,
            knowledgeSourceId: ksId
          }))
        });
      }
    }

    return NextResponse.json(agent);
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json({ 
      error: 'Failed to update agent',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    // Verificar que el agente pertenece a la organización
    const existingAgent = await prisma.rAGAgent.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId
      }
    });

    if (!existingAgent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Eliminar relaciones con knowledge sources
    await prisma.rAGAgentKnowledgeBase.deleteMany({
      where: { agentId: id }
    });

    // Eliminar agente
    await prisma.rAGAgent.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Agent deleted' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json({ 
      error: 'Failed to delete agent',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
