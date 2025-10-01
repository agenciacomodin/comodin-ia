
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { action, instanceName, phoneNumber } = body;

    switch (action) {
      case 'create':
        return await createInstance(instanceName, session.user.id);
      
      case 'qrcode':
        return await getQRCode(instanceName);
      
      case 'status':
        return await getInstanceStatus(instanceName);
      
      case 'send':
        return await sendMessage(instanceName, body.to, body.message);
      
      default:
        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error en WhatsApp API:', error);
    return NextResponse.json(
      { error: 'Error al procesar solicitud' },
      { status: 500 }
    );
  }
}

async function createInstance(instanceName: string, userId: string) {
  try {
    const response = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        instanceName,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Guardar instancia en la base de datos
      await prisma.whatsappInstance.create({
        data: {
          name: instanceName,
          instanceId: data.instance.instanceId,
          status: 'DISCONNECTED',
          userId,
        },
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creando instancia:', error);
    throw error;
  }
}

async function getQRCode(instanceName: string) {
  try {
    const response = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, {
      method: 'GET',
      headers: {
        'apikey': EVOLUTION_API_KEY,
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error obteniendo QR:', error);
    throw error;
  }
}

async function getInstanceStatus(instanceName: string) {
  try {
    const response = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, {
      method: 'GET',
      headers: {
        'apikey': EVOLUTION_API_KEY,
      },
    });

    const data = await response.json();
    
    // Actualizar estado en la base de datos
    await prisma.whatsappInstance.updateMany({
      where: { name: instanceName },
      data: { status: data.state },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error obteniendo estado:', error);
    throw error;
  }
}

async function sendMessage(instanceName: string, to: string, message: string) {
  try {
    const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        number: to,
        text: message,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error enviando mensaje:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener todas las instancias del usuario
    const instances = await prisma.whatsappInstance.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ instances });
  } catch (error) {
    console.error('Error obteniendo instancias:', error);
    return NextResponse.json(
      { error: 'Error al obtener instancias' },
      { status: 500 }
    );
  }
}
