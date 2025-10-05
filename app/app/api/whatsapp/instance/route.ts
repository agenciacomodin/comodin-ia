
/**
 * WhatsApp Instance Management API
 * Endpoints para crear y gestionar instancias de WhatsApp
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { 
  createInstance, 
  fetchInstances, 
  deleteInstance as deleteEvolutionInstance,
  getConnectionState,
  logoutInstance,
  checkEvolutionConnection
} from '@/lib/services/evolution-api';

// GET /api/whatsapp/instance - Obtener todas las instancias
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email! },
      include: { organization: true }
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'Usuario sin organización' }, { status: 403 });
    }

    // Obtener canales de WhatsApp de la organización
    const channels = await db.whatsAppChannel.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: 'desc' }
    });

    // Obtener estado de las instancias desde Evolution API
    const evolutionResult = await fetchInstances();
    const evolutionInstances = evolutionResult.data || [];

    // Combinar datos locales con datos de Evolution API
    const channelsWithStatus = channels.map(channel => {
      const evolutionInstance = evolutionInstances.find(
        (inst: any) => inst.instance?.instanceName === channel.instanceId
      );

      return {
        ...channel,
        evolutionStatus: evolutionInstance?.state || 'unknown',
        evolutionData: evolutionInstance,
      };
    });

    return NextResponse.json({
      success: true,
      channels: channelsWithStatus
    });

  } catch (error: any) {
    console.error('Error obteniendo instancias:', error);
    return NextResponse.json(
      { error: 'Error obteniendo instancias', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/whatsapp/instance - Crear nueva instancia
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email! },
      include: { organization: true }
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'Usuario sin organización' }, { status: 403 });
    }

    const body = await req.json();
    const { name, phoneNumber } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });
    }

    // Generar nombre único para la instancia
    const instanceName = `${user.organizationId}_${Date.now()}`;

    // Crear instancia en Evolution API
    const webhookUrl = `${process.env.NEXTAUTH_URL}/api/webhooks/whatsapp`;
    
    const result = await createInstance({
      instanceName,
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS',
      webhook: webhookUrl,
      webhookByEvents: true,
      events: [
        'QRCODE_UPDATED',
        'MESSAGES_UPSERT',
        'MESSAGES_UPDATE',
        'MESSAGES_DELETE',
        'CONNECTION_UPDATE',
      ],
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Error creando instancia en Evolution API', details: result.error },
        { status: 500 }
      );
    }

    // Guardar canal en la base de datos
    const channel = await db.whatsAppChannel.create({
      data: {
        organizationId: user.organizationId,
        name,
        phone: phoneNumber || 'pending',
        instanceId: instanceName,
        connectionType: 'QR_CODE',
        status: 'DISCONNECTED', // Se actualizará cuando se conecte
        webhookUrl,
        qrCode: result.data?.qrcode?.base64 || null,
      }
    });

    return NextResponse.json({
      success: true,
      channel,
      qrCode: result.data?.qrcode?.base64,
      message: 'Instancia creada exitosamente'
    });

  } catch (error: any) {
    console.error('Error creando instancia:', error);
    return NextResponse.json(
      { error: 'Error creando instancia', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/whatsapp/instance?id=<channelId> - Eliminar instancia
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email! }
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'Usuario sin organización' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get('id');

    if (!channelId) {
      return NextResponse.json({ error: 'ID de canal requerido' }, { status: 400 });
    }

    // Buscar el canal
    const channel = await db.whatsAppChannel.findFirst({
      where: {
        id: channelId,
        organizationId: user.organizationId
      }
    });

    if (!channel) {
      return NextResponse.json({ error: 'Canal no encontrado' }, { status: 404 });
    }

    // Eliminar instancia de Evolution API
    if (channel.instanceId) {
      await deleteEvolutionInstance(channel.instanceId);
    }

    // Eliminar canal de la base de datos
    await db.whatsAppChannel.delete({
      where: { id: channelId }
    });

    return NextResponse.json({
      success: true,
      message: 'Instancia eliminada exitosamente'
    });

  } catch (error: any) {
    console.error('Error eliminando instancia:', error);
    return NextResponse.json(
      { error: 'Error eliminando instancia', details: error.message },
      { status: 500 }
    );
  }
}
