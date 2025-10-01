import { sendEmail } from './email';
import { prisma } from './prisma';

export async function notifyNewMessage(conversationId: string) {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        contact: true,
        assignedAgent: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!conversation || !conversation.assignedAgent) return;

    const lastMessage = conversation.messages[0];
    
    await sendEmail({
      to: conversation.assignedAgent.email,
      subject: `Nuevo mensaje de ${conversation.contact.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Nuevo mensaje en COMODÍN IA</h2>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>De:</strong> ${conversation.contact.name}</p>
            <p><strong>Teléfono:</strong> ${conversation.contact.phone}</p>
            <p><strong>Mensaje:</strong></p>
            <p style="background-color: white; padding: 15px; border-radius: 4px; margin-top: 10px;">
              ${lastMessage.content}
            </p>
          </div>
          <a href="${process.env.NEXTAUTH_URL}/inbox/${conversationId}" 
             style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
            Ver conversación
          </a>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error al enviar notificación:', error);
  }
}

export async function notifyAssignedConversation(conversationId: string, agentId: string) {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        contact: true,
      },
    });

    const agent = await prisma.user.findUnique({
      where: { id: agentId },
    });

    if (!conversation || !agent) return;

    await sendEmail({
      to: agent.email,
      subject: `Nueva conversación asignada`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Nueva conversación asignada</h2>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>Se te ha asignado una nueva conversación:</p>
            <p><strong>Contacto:</strong> ${conversation.contact.name}</p>
            <p><strong>Teléfono:</strong> ${conversation.contact.phone}</p>
          </div>
          <a href="${process.env.NEXTAUTH_URL}/inbox/${conversationId}" 
             style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
            Ver conversación
          </a>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error al enviar notificación de asignación:', error);
  }
}
