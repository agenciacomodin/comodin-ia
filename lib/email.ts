
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error };
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Verifica tu cuenta en COMODÍN IA</h2>
      <p>Haz clic en el siguiente enlace para verificar tu cuenta:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        Verificar cuenta
      </a>
      <p>O copia y pega este enlace en tu navegador:</p>
      <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
      <p style="color: #999; font-size: 12px; margin-top: 40px;">
        Si no solicitaste esta verificación, ignora este email.
      </p>
    </div>
  `;
  
  return sendEmail({
    to: email,
    subject: 'Verifica tu cuenta - COMODÍN IA',
    html,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Recupera tu contraseña</h2>
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        Restablecer contraseña
      </a>
      <p>O copia y pega este enlace en tu navegador:</p>
      <p style="color: #666; word-break: break-all;">${resetUrl}</p>
      <p style="color: #999; font-size: 12px; margin-top: 40px;">
        Este enlace expira en 1 hora. Si no solicitaste este cambio, ignora este email.
      </p>
    </div>
  `;
  
  return sendEmail({
    to: email,
    subject: 'Recupera tu contraseña - COMODÍN IA',
    html,
  });
}

export async function sendWelcomeEmail(email: string, name: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">¡Bienvenido a COMODÍN IA, ${name}!</h2>
      <p>Tu cuenta ha sido verificada exitosamente.</p>
      <p>Ahora puedes acceder a todas las funcionalidades de la plataforma:</p>
      <ul style="line-height: 1.8;">
        <li>Gestión de conversaciones con IA</li>
        <li>Integración con WhatsApp</li>
        <li>Campañas automatizadas</li>
        <li>Base de conocimiento personalizada</li>
      </ul>
      <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        Ir al Dashboard
      </a>
    </div>
  `;
  
  return sendEmail({
    to: email,
    subject: '¡Bienvenido a COMODÍN IA!',
    html,
  });
}

export async function sendNewMessageNotification(
  email: string,
  contactName: string,
  messagePreview: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Nuevo mensaje de ${contactName}</h2>
      <p style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb;">
        ${messagePreview}
      </p>
      <a href="${process.env.NEXTAUTH_URL}/inbox" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        Ver conversación
      </a>
    </div>
  `;
  
  return sendEmail({
    to: email,
    subject: `Nuevo mensaje de ${contactName}`,
    html,
  });
}
