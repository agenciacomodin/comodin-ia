
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendNewMessageNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, instance, data } = body;

    console.log('Webhook Evolution recibido:', { event, instance });

    switch (event) {
      case 'messages.upsert':
        await handleNewMessage(instance, data);
        break;
      
      case 'connection.update':
        await handleConnectionUpdate(instance, data);
        break;
      
      case 'qr.updated':
        await handleQRUpdate(instance, data);
        break;
      
      default:
        console.log('Evento no manejado:', event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en webhook Evolution:', error);
    return NextResponse.json(
      { error: 'Error al procesar webhook' },
      { status: 500 }
    );
  }
}

async function handleNewMessage(instanceName: string, data: any) {
  try {
    const message = data.messages?.[0];
    if (!message) return;

    // Ignorar mensajes propios
    if (message.key.fromMe) return;

    const phoneNumber = message.key.remoteJid.replace('@s.whatsapp.net', '');
    const messageText = message.message?.conversation || 
                       message.message?.extendedTextMessage?.text || 
                       '[Mensaje multimedia]';

    // Buscar o crear contacto
    let contact = await prisma.contact.findFirst({
      where: { phone: phoneNumber },
    });

    if (!contact) {
      const pushName = message.pushName || phoneNumber;
      contact = await prisma.contact.create({
        data: {
          name: pushName,
          phone: phoneNumber,
          source: 'WHATSAPP',
        },
      });
    }

    // Buscar o crear conversación
    let conversation = await prisma.conversation.findFirst({
      where: {
        contactId: contact.id,
        channel: 'WHATSAPP',
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          contactId: contact.id,
          channel: 'WHATSAPP',
          status: 'OPEN',
        },
      });
    }

    // Guardar mensaje
    const savedMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: messageText,
        direction: 'INBOUND',
        channel: 'WHATSAPP',
        externalId: message.key.id,
        metadata: {
          timestamp: message.messageTimestamp,
          fromMe: message.key.fromMe,
        },
      },
    });

    // Actualizar conversación
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        unreadCount: { increment: 1 },
      },
    });

    // Procesar con IA si está configurado
    await processWithAI(conversation.id, messageText);

    // Notificar a agentes asignados
    await notifyAssignedAgents(conversation.id, contact.name, messageText);

    console.log('Mensaje guardado:', savedMessage.id);
  } catch (error) {
    console.error('Error manejando mensaje:', error);
  }
}

async function handleConnectionUpdate(instanceName: string, data: any) {
  try {
    const state = data.state;
    
    await prisma.whatsappInstance.updateMany({
      where: { name: instanceName },
      data: { 
        status: state,
        connectedAt: state === 'open' ? new Date() : null,
      },
    });

    console.log(`Instancia ${instanceName} estado: ${state}`);
  } catch (error) {
    console.error('Error actualizando conexión:', error);
  }
}

async function handleQRUpdate(instanceName: string, data: any) {
  try {
    await prisma.whatsappInstance.updateMany({
      where: { name: instanceName },
      data: { 
        qrCode: data.qrcode,
      },
    });

    console.log(`QR actualizado para ${instanceName}`);
  } catch (error) {
    console.error('Error actualizando QR:', error);
  }
}

async function processWithAI(conversationId: string, messageText: string) {
  try {
    // Obtener configuración de IA de la conversación
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        contact: {
          include: {
            organization: {
              include: {
                aiAgents: {
                  where: { isActive: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    const aiAgent = conversation?.contact?.organization?.aiAgents?.[0];
    if (!aiAgent || !aiAgent.autoReply) return;

    // Aquí iría la lógica de procesamiento con OpenAI
    // Por ahora solo registramos que se debería procesar
    console.log('Procesando con IA:', { conversationId, aiAgent: aiAgent.name });
  } catch (error) {
    console.error('Error procesando con IA:', error);
  }
}

async function notifyAssignedAgents(
  conversationId: string,
  contactName: string,
  messagePreview: string
) {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        assignedTo: true,
      },
    });

    if (conversation?.assignedTo?.email) {
      await sendNewMessageNotification(
        conversation.assignedTo.email,
        contactName,
        messagePreview
      );
    }
  } catch (error) {
    console.error('Error notificando agentes:', error);
  }
}
