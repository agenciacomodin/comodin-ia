

import { NextRequest, NextResponse } from 'next/server';
import { AIBrokerService } from '@/lib/ai-broker-service';
import { AIUsageType } from '@prisma/client';

export const dynamic = 'force-dynamic'

/**
 * POST /api/ai/broker/test
 * Endpoint de prueba para validar el funcionamiento del AI Broker
 * Este endpoint simula diferentes tipos de solicitudes para testing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, testType = 'simple' } = body;

    if (!organizationId) {
      return NextResponse.json({
        success: false,
        error: 'organizationId es requerido'
      }, { status: 400 });
    }

    let testRequest;

    switch (testType) {
      case 'chat':
        testRequest = {
          organizationId,
          prompt: 'Hola, ¿puedes ayudarme con información sobre productos?',
          usageType: AIUsageType.CHAT_RESPONSE,
          userId: 'test-user-id',
          userName: 'Usuario de Prueba',
          temperature: 0.7,
          maxTokens: 150
        };
        break;

      case 'analysis':
        testRequest = {
          organizationId,
          prompt: 'Analiza el siguiente texto y determina si el cliente está satisfecho: "El servicio fue excelente, me encantó la atención recibida"',
          usageType: AIUsageType.SENTIMENT_ANALYSIS,
          userId: 'test-user-id',
          userName: 'Usuario de Prueba',
          temperature: 0.3,
          maxTokens: 100
        };
        break;

      case 'content':
        testRequest = {
          organizationId,
          prompt: 'Genera una respuesta profesional para agradecer a un cliente por su compra',
          usageType: AIUsageType.CONTENT_GENERATION,
          userId: 'test-user-id',
          userName: 'Usuario de Prueba',
          temperature: 0.8,
          maxTokens: 200
        };
        break;

      case 'translation':
        testRequest = {
          organizationId,
          prompt: 'Traduce al inglés: "Gracias por contactarnos, estaremos en comunicación"',
          usageType: AIUsageType.TRANSLATION,
          userId: 'test-user-id',
          userName: 'Usuario de Prueba',
          temperature: 0.2,
          maxTokens: 100
        };
        break;

      case 'summary':
        testRequest = {
          organizationId,
          prompt: 'Resume el siguiente texto: "El cliente contactó para preguntar sobre nuestros productos premium. Está interesado en la línea empresarial y necesita una cotización para 50 unidades. Mencionó que su presupuesto es flexible y que priorizan la calidad sobre el precio. La entrega debe ser antes del próximo mes."',
          usageType: AIUsageType.SUMMARY,
          userId: 'test-user-id',
          userName: 'Usuario de Prueba',
          temperature: 0.4,
          maxTokens: 150
        };
        break;

      default:
        testRequest = {
          organizationId,
          prompt: 'Este es un mensaje de prueba para verificar que el AI Broker funciona correctamente.',
          usageType: AIUsageType.OTHER,
          userId: 'test-user-id',
          userName: 'Usuario de Prueba'
        };
    }

    // Procesar la solicitud de prueba
    const startTime = Date.now();
    const result = await AIBrokerService.processAIRequest(testRequest);
    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      testType,
      processingTime: `${processingTime}ms`,
      result,
      metadata: {
        prompt: testRequest.prompt,
        usageType: testRequest.usageType,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error in AI Broker test:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Error interno del servidor'
    }, { status: 500 });
  }
}

