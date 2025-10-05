
/**
 * WhatsApp Status API
 * Endpoint para verificar el estado de conexión de las instancias
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getConnectionState, checkEvolutionConnection } from '@/lib/services/evolution-api';

// GET /api/whatsapp/status - Verificar estado de Evolution API
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const instanceId = searchParams.get('instanceId');

    // Si se especifica una instancia, obtener su estado
    if (instanceId) {
      const result = await getConnectionState(instanceId);
      
      if (!result.success) {
        return NextResponse.json({
          success: false,
          error: 'Error obteniendo estado de instancia',
          details: result.error
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        instanceId,
        state: result.data
      });
    }

    // Si no se especifica instancia, verificar conexión general
    const result = await checkEvolutionConnection();

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: 'Evolution API no está disponible',
        details: result.error
      }, { status: 503 });
    }

    return NextResponse.json({
      success: true,
      message: 'Evolution API está funcionando correctamente',
      data: result.data
    });

  } catch (error: any) {
    console.error('Error verificando estado:', error);
    return NextResponse.json(
      { error: 'Error verificando estado', details: error.message },
      { status: 500 }
    );
  }
}
