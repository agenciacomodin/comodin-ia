
/**
 * WhatsApp Webhook - Evolution API
 * Endpoint para recibir eventos de WhatsApp a través de Evolution API
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { MessageDirection } from '@prisma/client';

// POST /api/webhooks/whatsapp - Recibir eventos de WhatsApp
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log('📱 WhatsApp Webhook recibido:', JSON.stringify(body, null, 2));
    
    const { event, instance, data } = body;
    
    // Manejar diferentes tipos de eventos
    switch (event) {
      case 'qrcode.updated':
        await handleQRCodeUpdate(instance, data);
        break;
        
      case 'connection.update':
        await handleConnectionUpdate(instance, data);
        break;
        
      case 'messages.upsert':
        await handleMessageUpsert(instance, data);
        break;
        
      case 'messages.update':
        await handleMessageUpdate(instance, data);
        break;
        
      case 'messages.delete':
        await handleMessageDelete(instance, data);
        break;
        
      default:
        console.log(`ℹ️ Evento no manejado: ${event}`);
    }
    
    return NextResponse.json({ success: true, event });
    
  } catch (error: any) {
    console.error('❌ Error en webhook de WhatsApp:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message }, 
      { status: 500 }
    );
  }
}

/**
 * Manejar actualización de QR code
 */
async function handleQRCodeUpdate(instance: string, data: any) {
  try {
    const { qrcode } = data;
    
    // Actualizar el canal de WhatsApp con el nuevo QR
    await db.whatsAppChannel.updateMany({
      where: { 
        instanceId: instance,
        status: 'DISCONNECTED'
      },
      data: {
        qrCode: qrcode,
        qrExpiration: new Date(Date.now() + 60000), // QR expira en 60 segundos
      }
    });
    
    console.log(`✅ QR Code actualizado para instancia: ${instance}`);
  } catch (error) {
    console.error('Error actualizando QR code:', error);
  }
}

/**
 * Manejar actualización de conexión
 */
async function handleConnectionUpdate(instance: string, data: any) {
  try {
    const { state, statusReason } = data;
    
    // Mapear estado de Evolution API a nuestro enum
    let status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'SCANNING' | 'FAILED' = 'DISCONNECTED';
    
    if (state === 'open') {
      status = 'CONNECTED';
    } else if (state === 'connecting') {
      status = 'CONNECTING';
    } else if (state === 'close') {
      status = 'DISCONNECTED';
    }
    
    // Actualizar el canal de WhatsApp
    const channel = await db.whatsAppChannel.findFirst({
      where: { instanceId: instance }
    });
    
    if (channel) {
      await db.whatsAppChannel.update({
        where: { id: channel.id },
        data: {
          status,
          errorMessage: statusReason || null,
          lastActivity: new Date(),
        }
      });
      
      // Si se conectó exitosamente, limpiar el QR code
      if (status === 'CONNECTED') {
        await db.whatsAppChannel.update({
          where: { id: channel.id },
          data: {
            qrCode: null,
            connectedAt: new Date(),
          }
        });
      }
    }
    
    console.log(`✅ Estado de conexión actualizado para ${instance}: ${status}`);
  } catch (error) {
    console.error('Error actualizando conexión:', error);
  }
}

/**
 * Manejar mensaje entrante o enviado
 */
async function handleMessageUpsert(instance: string, data: any) {
  try {
    const messages = data.messages || [];
    
    for (const message of messages) {
      await processIncomingMessage(instance, message);
    }
    
  } catch (error) {
    console.error('Error procesando mensajes:', error);
  }
}

/**
 * Procesar un mensaje individual
 */
async function processIncomingMessage(instance: string, message: any) {
  try {
    const { key, message: messageContent, messageTimestamp, pushName } = message;
    const { remoteJid, fromMe, id: messageId } = key;
    
    // Obtener el canal de WhatsApp
    const channel = await db.whatsAppChannel.findFirst({
      where: { instanceId: instance }
    });
    
    if (!channel) {
      console.error(`Canal no encontrado para instancia: ${instance}`);
      return;
    }
    
    // Extraer el número de teléfono
    const phoneNumber = remoteJid.replace('@s.whatsapp.net', '').replace('@g.us', '');
    
    // Buscar o crear contacto
    let contact = await db.contact.findFirst({
      where: {
        organizationId: channel.organizationId,
        phone: phoneNumber
      }
    });
    
    if (!contact) {
      // Crear nuevo contacto
      contact = await db.contact.create({
        data: {
          organizationId: channel.organizationId,
          name: pushName || phoneNumber,
          phone: phoneNumber,
          whatsappId: remoteJid,
          whatsappName: pushName,
          source: 'WHATSAPP_QR',
        }
      });
    }
    
    // Buscar o crear conversación
    let conversation = await db.conversation.findFirst({
      where: {
        organizationId: channel.organizationId,
        contactId: contact.id,
        whatsappChannelId: channel.id,
      }
    });
    
    if (!conversation) {
      conversation = await db.conversation.create({
        data: {
          organizationId: channel.organizationId,
          contactId: contact.id,
          whatsappChannelId: channel.id,
          whatsappChatId: remoteJid,
          status: 'OPEN',
        }
      });
    }
    
    // Extraer contenido del mensaje
    const textContent = messageContent?.conversation || 
                       messageContent?.extendedTextMessage?.text || 
                       '';
    
    // Determinar tipo de mensaje
    let messageType = 'text';
    if (messageContent?.imageMessage) messageType = 'image';
    else if (messageContent?.videoMessage) messageType = 'video';
    else if (messageContent?.audioMessage) messageType = 'audio';
    else if (messageContent?.documentMessage) messageType = 'document';
    
    // Crear el mensaje en la base de datos
    await db.message.create({
      data: {
        conversationId: conversation.id,
        organizationId: channel.organizationId,
        content: textContent,
        direction: fromMe ? MessageDirection.OUTGOING : MessageDirection.INCOMING,
        whatsappId: messageId,
        whatsappStatus: 'received',
        whatsappChannelId: channel.id,
        sentAt: new Date(messageTimestamp * 1000),
        metadata: {
          type: messageType,
          remoteJid,
          pushName,
          rawMessage: messageContent,
        }
      }
    });
    
    // Actualizar última interacción de la conversación
    await db.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(messageTimestamp * 1000),
        unreadCount: fromMe ? 0 : { increment: 1 },
      }
    });
    
    // Actualizar lastSeen del contacto si no es de nosotros
    if (!fromMe) {
      await db.contact.update({
        where: { id: contact.id },
        data: {
          lastSeen: new Date(messageTimestamp * 1000),
        }
      });
    }
    
    console.log(`✅ Mensaje procesado: ${messageId} de ${phoneNumber}`);
    
  } catch (error) {
    console.error('Error procesando mensaje individual:', error);
  }
}

/**
 * Manejar actualización de mensaje (ej: estado de entrega)
 */
async function handleMessageUpdate(instance: string, data: any) {
  try {
    const messages = data.messages || [];
    
    for (const message of messages) {
      const { key, update } = message;
      const { id: messageId } = key;
      const { status } = update || {};
      
      if (status) {
        // Actualizar estado del mensaje
        const updateData: any = {
          whatsappStatus: status,
        };
        
        // Actualizar timestamps según el estado
        if (status === 'DELIVERY_ACK' || status === 'SERVER_ACK') {
          updateData.deliveredAt = new Date();
        } else if (status === 'READ') {
          updateData.readAt = new Date();
          updateData.isRead = true;
        }
        
        await db.message.updateMany({
          where: { whatsappId: messageId },
          data: updateData
        });
      }
    }
    
    console.log(`✅ Estados de mensaje actualizados para instancia: ${instance}`);
  } catch (error) {
    console.error('Error actualizando mensajes:', error);
  }
}

/**
 * Manejar eliminación de mensaje
 */
async function handleMessageDelete(instance: string, data: any) {
  try {
    const messages = data.messages || [];
    
    for (const message of messages) {
      const { key } = message;
      const { id: messageId } = key;
      
      // Marcar mensaje como eliminado (soft delete)
      await db.message.updateMany({
        where: { whatsappId: messageId },
        data: {
          content: '[Mensaje eliminado]',
          metadata: {
            deleted: true,
            deletedAt: new Date().toISOString(),
          }
        }
      });
    }
    
    console.log(`✅ Mensajes eliminados para instancia: ${instance}`);
  } catch (error) {
    console.error('Error eliminando mensajes:', error);
  }
}
