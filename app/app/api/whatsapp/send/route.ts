
/**
 * WhatsApp Send Message API
 * Endpoint para enviar mensajes a través de WhatsApp
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendTextMessage, sendMediaMessage } from '@/lib/services/evolution-api';
import { MessageDirection } from '@prisma/client';

// POST /api/whatsapp/send - Enviar mensaje de WhatsApp
export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { 
      channelId, 
      contactId, 
      conversationId,
      message, 
      mediaUrl, 
      mediaCaption 
    } = body;

    // Validaciones
    if (!channelId) {
      return NextResponse.json({ error: 'ID de canal requerido' }, { status: 400 });
    }

    if (!message && !mediaUrl) {
      return NextResponse.json({ error: 'Mensaje o media requerido' }, { status: 400 });
    }

    // Obtener el canal de WhatsApp
    const channel = await db.whatsAppChannel.findFirst({
      where: {
        id: channelId,
        organizationId: user.organizationId
      }
    });

    if (!channel) {
      return NextResponse.json({ error: 'Canal no encontrado' }, { status: 404 });
    }

    if (channel.status !== 'CONNECTED') {
      return NextResponse.json(
        { error: 'Canal no conectado', status: channel.status }, 
        { status: 400 }
      );
    }

    if (!channel.instanceId) {
      return NextResponse.json(
        { error: 'Canal sin instancia configurada' }, 
        { status: 400 }
      );
    }

    // Obtener el contacto
    let contact;
    if (contactId) {
      contact = await db.contact.findFirst({
        where: {
          id: contactId,
          organizationId: user.organizationId
        }
      });
    }

    if (!contact) {
      return NextResponse.json({ error: 'Contacto no encontrado' }, { status: 404 });
    }

    // Formatear número de teléfono para WhatsApp
    const phoneNumber = contact.phone?.replace(/\D/g, '') + '@s.whatsapp.net';

    // Enviar mensaje a través de Evolution API
    let result;
    if (mediaUrl) {
      result = await sendMediaMessage(channel.instanceId, {
        number: phoneNumber,
        mediaUrl,
        mediaCaption: mediaCaption || message,
      });
    } else {
      result = await sendTextMessage(channel.instanceId, {
        number: phoneNumber,
        text: message,
      });
    }

    if (!result.success) {
      return NextResponse.json(
        { error: 'Error enviando mensaje', details: result.error },
        { status: 500 }
      );
    }

    // Buscar o crear conversación
    let conversation;
    if (conversationId) {
      conversation = await db.conversation.findFirst({
        where: {
          id: conversationId,
          organizationId: user.organizationId
        }
      });
    }

    if (!conversation) {
      conversation = await db.conversation.create({
        data: {
          organizationId: user.organizationId,
          contactId: contact.id,
          whatsappChannelId: channel.id,
          whatsappChatId: phoneNumber,
          status: 'OPEN',
        }
      });
    }

    // Guardar mensaje en la base de datos
    const messageRecord = await db.message.create({
      data: {
        conversationId: conversation.id,
        organizationId: user.organizationId,
        content: message || mediaCaption || '',
        direction: MessageDirection.OUTGOING,
        whatsappId: result.data?.key?.id,
        whatsappStatus: 'sent',
        whatsappChannelId: channel.id,
        sentBy: user.id,
        sentByName: user.name || user.email,
        sentAt: new Date(),
        metadata: mediaUrl ? {
          mediaUrl,
          rawResponse: result.data ? JSON.parse(JSON.stringify(result.data)) : null,
        } : (result.data ? JSON.parse(JSON.stringify(result.data)) : {})
      }
    });

    // Actualizar conversación
    await db.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      message: messageRecord,
      whatsappResponse: result.data
    });

  } catch (error: any) {
    console.error('Error enviando mensaje:', error);
    return NextResponse.json(
      { error: 'Error enviando mensaje', details: error.message },
      { status: 500 }
    );
  }
}
