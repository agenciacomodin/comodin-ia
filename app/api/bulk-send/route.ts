import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Límites de envío
const QR_DAILY_LIMIT = 40;
const API_DAILY_LIMIT = 10000; // Prácticamente ilimitado con plantillas aprobadas

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      method, // 'qr' o 'api'
      recipients, // Array de contactos
      message,
      templateId, // Solo para API
      campaignName
    } = body;

    if (!method || !recipients || recipients.length === 0) {
      return NextResponse.json({ 
        error: 'Method and recipients are required' 
      }, { status: 400 });
    }

    // Validar método
    if (!['qr', 'api'].includes(method)) {
      return NextResponse.json({ 
        error: 'Method must be "qr" or "api"' 
      }, { status: 400 });
    }

    // Verificar límites diarios
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sentToday = await prisma.bulkMessage.count({
      where: {
        organizationId: session.user.organizationId,
        method,
        createdAt: {
          gte: today
        }
      }
    });

    const limit = method === 'qr' ? QR_DAILY_LIMIT : API_DAILY_LIMIT;
    const remaining = limit - sentToday;

    if (recipients.length > remaining) {
      return NextResponse.json({ 
        error: `Daily limit exceeded. You can send ${remaining} more messages today using ${method.toUpperCase()} method.`,
        limit,
        sent: sentToday,
        remaining
      }, { status: 429 });
    }

    // Validaciones específicas por método
    if (method === 'qr' && !message) {
      return NextResponse.json({ 
        error: 'Message is required for QR method' 
      }, { status: 400 });
    }

    if (method === 'api' && !templateId) {
      return NextResponse.json({ 
        error: 'Template ID is required for API method' 
      }, { status: 400 });
    }

    // Crear campaña
    const campaign = await prisma.bulkCampaign.create({
      data: {
        name: campaignName || `Campaign ${new Date().toISOString()}`,
        method,
        totalRecipients: recipients.length,
        organizationId: session.user.organizationId,
        status: 'pending'
      }
    });

    // Crear mensajes individuales
    const messages = await prisma.bulkMessage.createMany({
      data: recipients.map((recipient: any) => ({
        campaignId: campaign.id,
        organizationId: session.user.organizationId,
        method,
        recipientPhone: recipient.phone,
        recipientName: recipient.name,
        message: method === 'qr' ? message : undefined,
        templateId: method === 'api' ? templateId : undefined,
        status: 'pending'
      }))
    });

    // Actualizar campaña
    await prisma.bulkCampaign.update({
      where: { id: campaign.id },
      data: { status: 'processing' }
    });

    // Aquí iría la lógica de envío real
    // Por ahora solo creamos los registros

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        method,
        totalRecipients: recipients.length,
        status: 'processing'
      },
      limits: {
        method,
        dailyLimit: limit,
        sentToday: sentToday + recipients.length,
        remaining: remaining - recipients.length
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating bulk send campaign:', error);
    return NextResponse.json({ 
      error: 'Failed to create campaign',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const method = searchParams.get('method');

    // Obtener límites diarios
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [qrSent, apiSent] = await Promise.all([
      prisma.bulkMessage.count({
        where: {
          organizationId: session.user.organizationId,
          method: 'qr',
          createdAt: { gte: today }
        }
      }),
      prisma.bulkMessage.count({
        where: {
          organizationId: session.user.organizationId,
          method: 'api',
          createdAt: { gte: today }
        }
      })
    ]);

    const limits = {
      qr: {
        dailyLimit: QR_DAILY_LIMIT,
        sent: qrSent,
        remaining: QR_DAILY_LIMIT - qrSent
      },
      api: {
        dailyLimit: API_DAILY_LIMIT,
        sent: apiSent,
        remaining: API_DAILY_LIMIT - apiSent
      }
    };

    // Obtener campañas
    const campaigns = await prisma.bulkCampaign.findMany({
      where: {
        organizationId: session.user.organizationId,
        ...(method && { method })
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json({
      limits,
      campaigns
    });
  } catch (error) {
    console.error('Error fetching bulk send data:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
