
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { DocumentProcessor } from '@/lib/services/document-processor';
import { generateEmbedding } from '@/lib/services/embeddings';

export const config = {
  api: {
    bodyParser: false, // Disable body parser for multipart/form-data
  },
};

// POST /api/agents/[id]/train - Entrenar agente con documentos
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Usuario sin organización' }, { status: 403 });
    }

    // Verificar que el agente exists y pertenece a la organización
    const agent = await prisma.rAGAgent.findFirst({
      where: {
        id: params.id,
        organizationId: user.organizationId,
      },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agente no encontrado' }, { status: 404 });
    }

    // Parsear form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No se proporcionaron archivos' },
        { status: 400 }
      );
    }

    console.log(`📚 Procesando ${files.length} archivos para agente ${agent.name}...`);

    const results = [];

    for (const file of files) {
      try {
        console.log(`📄 Procesando ${file.name}...`);

        // Convertir File a Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Procesar documento
        const processed = await DocumentProcessor.processFile(buffer, file.name);
        console.log(`✅ Extraído ${processed.metadata.wordCount} palabras de ${file.name}`);

        // Crear KnowledgeSource
        const knowledgeSource = await prisma.knowledgeSource.create({
          data: {
            organizationId: user.organizationId,
            name: file.name,
            type: 'FILE',
            status: 'PROCESSING',
            originalFileName: file.name,
            fileMimeType: file.type,
            fileSize: file.size,
            textContent: processed.text,
            createdBy: user.id,
            createdByName: user.name || user.email,
          },
        });

        // Vincular con el agente
        await prisma.rAGAgentKnowledgeBase.create({
          data: {
            agentId: agent.id,
            knowledgeSourceId: knowledgeSource.id,
            priority: 1,
            isActive: true,
          },
        });

        // Dividir en chunks
        const chunks = DocumentProcessor.chunkText(processed.text);
        console.log(`📝 Dividido en ${chunks.length} chunks`);

        // Actualizar total chunks
        await prisma.knowledgeSource.update({
          where: { id: knowledgeSource.id },
          data: { totalChunks: chunks.length },
        });

        // Generar embeddings para cada chunk
        let successfulChunks = 0;

        for (let i = 0; i < chunks.length; i++) {
          try {
            const embedding = await generateEmbedding(chunks[i]);

            // Crear chunk
            const chunk = await prisma.knowledgeChunk.create({
              data: {
                sourceId: knowledgeSource.id,
                content: chunks[i],
                chunkIndex: i,
                wordCount: chunks[i].split(/\s+/).length,
                characterCount: chunks[i].length,
                language: 'es',
                status: 'COMPLETED',
                processedAt: new Date(),
              },
            });

            // Guardar embedding
            await prisma.knowledgeEmbedding.create({
              data: {
                chunkId: chunk.id,
                modelUsed: 'text-embedding-ada-002',
                embeddingVersion: '1.0',
                dimensions: embedding.length,
                embedding: embedding,
                providerUsed: 'openai',
              },
            });

            successfulChunks++;
          } catch (error) {
            console.error(`Error procesando chunk ${i}:`, error);
            
            // Crear chunk con error
            await prisma.knowledgeChunk.create({
              data: {
                sourceId: knowledgeSource.id,
                content: chunks[i],
                chunkIndex: i,
                wordCount: chunks[i].split(/\s+/).length,
                characterCount: chunks[i].length,
                status: 'FAILED',
                processingError: error instanceof Error ? error.message : 'Error desconocido',
              },
            });
          }
        }

        // Actualizar estado del knowledge source
        await prisma.knowledgeSource.update({
          where: { id: knowledgeSource.id },
          data: {
            status: successfulChunks === chunks.length ? 'ACTIVE' : 'ERROR',
            processedChunks: successfulChunks,
            failedChunks: chunks.length - successfulChunks,
          },
        });

        results.push({
          fileName: file.name,
          success: true,
          chunksProcessed: successfulChunks,
          totalChunks: chunks.length,
        });

        console.log(`✅ ${file.name}: ${successfulChunks}/${chunks.length} chunks guardados`);
      } catch (error: any) {
        console.error(`❌ Error procesando ${file.name}:`, error);
        results.push({
          fileName: file.name,
          success: false,
          error: error.message,
        });
      }
    }

    // Actualizar timestamp de entrenamiento del agente
    await prisma.rAGAgent.update({
      where: { id: agent.id },
      data: {
        updatedAt: new Date(),
      },
    });

    const successCount = results.filter(r => r.success).length;
    console.log(`\n🎉 Entrenamiento completado: ${successCount}/${files.length} archivos exitosos`);

    return NextResponse.json({
      success: true,
      message: `Entrenamiento completado: ${successCount}/${files.length} archivos procesados`,
      results,
    });
  } catch (error) {
    console.error('Error training agent:', error);
    return NextResponse.json(
      { error: 'Error al entrenar agente' },
      { status: 500 }
    );
  }
}

// GET /api/agents/[id]/train - Obtener estado de entrenamiento
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Usuario sin organización' }, { status: 403 });
    }

    // Obtener fuentes de conocimiento vinculadas al agente
    const agentKnowledge = await prisma.rAGAgentKnowledgeBase.findMany({
      where: { agentId: params.id },
      include: {
        knowledgeSource: {
          include: {
            chunks: {
              select: {
                id: true,
                status: true,
                wordCount: true,
              },
            },
          },
        },
      },
    });

    const fileStats = agentKnowledge.map((ak: any) => ({
      fileName: ak.knowledgeSource.name,
      status: ak.knowledgeSource.status,
      totalChunks: ak.knowledgeSource.totalChunks,
      processedChunks: ak.knowledgeSource.processedChunks,
      failedChunks: ak.knowledgeSource.failedChunks,
      lastUpdated: ak.knowledgeSource.updatedAt,
    }));

    const totalChunks = fileStats.reduce((sum: number, f: any) => sum + (f.totalChunks || 0), 0);

    return NextResponse.json({
      totalChunks,
      files: fileStats,
    });
  } catch (error) {
    console.error('Error getting training status:', error);
    return NextResponse.json(
      { error: 'Error al obtener estado de entrenamiento' },
      { status: 500 }
    );
  }
}
