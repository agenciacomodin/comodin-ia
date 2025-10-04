

import { NextRequest, NextResponse } from 'next/server';
import { AIBrokerService, AIBrokerRequest } from '@/lib/ai-broker-service';
import { AIUsageType } from '@prisma/client';
import { z } from 'zod';

export const dynamic = 'force-dynamic'

// Schema de validación para solicitudes al AI Broker
const AIBrokerRequestSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID es requerido'),
  prompt: z.string().min(1, 'Prompt es requerido').max(10000, 'Prompt demasiado largo'),
  usageType: z.nativeEnum(AIUsageType).optional(),
  userId: z.string().optional(),
  userName: z.string().optional(),
  model: z.string().optional(),
  maxTokens: z.number().positive().max(4000).optional(),
  temperature: z.number().min(0).max(2).optional(),
  metadata: z.record(z.any()).optional()
});

/**
 * POST /api/ai/broker
 * Endpoint principal del AI Broker Service
 * 
 * Este es el único punto de entrada para todas las solicitudes de IA
 * internas del sistema (CRM, chatbots, análisis, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar el request
    const validatedData = AIBrokerRequestSchema.parse(body);
    
    const brokerRequest: AIBrokerRequest = {
      organizationId: validatedData.organizationId,
      prompt: validatedData.prompt,
      usageType: validatedData.usageType || AIUsageType.CHAT_RESPONSE,
      userId: validatedData.userId,
      userName: validatedData.userName,
      model: validatedData.model,
      maxTokens: validatedData.maxTokens,
      temperature: validatedData.temperature,
      metadata: validatedData.metadata
    };

    // Procesar la solicitud a través del AI Broker
    const result = await AIBrokerService.processAIRequest(brokerRequest);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          response: result.response,
          transactionId: result.transactionId,
          cost: result.cost,
          usage: result.usage,
          provider: result.provider
        },
        message: 'Solicitud de IA procesada exitosamente'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { 
        status: result.error?.includes('Saldo Insuficiente') ? 402 : 400 
      });
    }

  } catch (error: any) {
    console.error('Error in AI Broker API:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Datos de solicitud inválidos',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

/**
 * GET /api/ai/broker
 * Obtener estadísticas del AI Broker Service
 */
export async function GET() {
  try {
    const stats = await AIBrokerService.getBrokerStats();
    
    return NextResponse.json({
      success: true,
      data: stats,
      message: 'Estadísticas del AI Broker obtenidas exitosamente'
    });

  } catch (error) {
    console.error('Error getting AI Broker stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

