
import nodemailer from 'nodemailer'
import { v4 as uuidv4 } from 'uuid'

// Configurar el transporter de nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

// Interface para opciones de email
interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

// Función principal para enviar emails
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'COMODÍN IA'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })

    console.log('✅ Email enviado:', info.messageId)
    return true
  } catch (error) {
    console.error('❌ Error enviando email:', error)
    return false
  }
}

// Template para email de bienvenida
export function getWelcomeEmailTemplate(userName: string, organizationName: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bienvenido a COMODÍN IA</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Bienvenido a COMODÍN IA!</h1>
          <p>Tu plataforma de comunicación inteligente</p>
        </div>
        <div class="content">
          <h2>Hola ${userName},</h2>
          <p>¡Felicitaciones! Te has registrado exitosamente en <strong>${organizationName}</strong> usando COMODÍN IA.</p>
          
          <p>Con tu cuenta podrás:</p>
          <ul>
            <li>📱 Gestionar conversaciones de WhatsApp</li>
            <li>🤖 Usar inteligencia artificial para respuestas automáticas</li>
            <li>📊 Analizar métricas de comunicación</li>
            <li>👥 Colaborar con tu equipo</li>
            <li>🚀 Hacer crecer tu negocio</li>
          </ul>
          
          <p>Para comenzar, simplemente inicia sesión en tu cuenta:</p>
          <a href="${process.env.NEXTAUTH_URL}/auth/login" class="button">Iniciar Sesión</a>
          
          <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
          
          <p>¡Bienvenido al futuro de la comunicación empresarial!</p>
          
          <p><strong>El equipo de COMODÍN IA</strong></p>
        </div>
        <div class="footer">
          <p>© 2024 COMODÍN IA. Todos los derechos reservados.</p>
          <p>Este correo fue enviado automáticamente, por favor no respondas a este mensaje.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Template para recuperación de contraseña
export function getPasswordResetTemplate(userName: string, resetToken: string): string {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`
  
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Restablecer Contraseña - COMODÍN IA</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Restablecer Contraseña</h1>
          <p>COMODÍN IA</p>
        </div>
        <div class="content">
          <h2>Hola ${userName},</h2>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en COMODÍN IA.</p>
          
          <p>Para restablecer tu contraseña, haz clic en el siguiente botón:</p>
          <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
          
          <div class="warning">
            <strong>⚠️ Importante:</strong>
            <ul>
              <li>Este enlace expirará en 1 hora por seguridad</li>
              <li>Solo podrás usarlo una vez</li>
              <li>Si no solicitaste este cambio, ignora este correo</li>
            </ul>
          </div>
          
          <p>Si no puedes hacer clic en el botón, copia y pega esta URL en tu navegador:</p>
          <p style="background: #e9ecef; padding: 10px; border-radius: 5px; word-break: break-all;">
            ${resetUrl}
          </p>
          
          <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura.</p>
          
          <p><strong>El equipo de COMODÍN IA</strong></p>
        </div>
        <div class="footer">
          <p>© 2024 COMODÍN IA. Todos los derechos reservados.</p>
          <p>Este correo fue enviado automáticamente, por favor no respondas a este mensaje.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Template para confirmación de cambio de contraseña
export function getPasswordChangeConfirmationTemplate(userName: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Contraseña Cambiada - COMODÍN IA</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; color: #155724; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Contraseña Cambiada</h1>
          <p>COMODÍN IA</p>
        </div>
        <div class="content">
          <h2>Hola ${userName},</h2>
          
          <div class="success">
            <strong>✅ ¡Éxito!</strong><br>
            Tu contraseña ha sido cambiada exitosamente.
          </div>
          
          <p>Tu contraseña de COMODÍN IA se ha actualizado correctamente en <strong>${new Date().toLocaleString('es-ES')}</strong>.</p>
          
          <p>Si realizaste este cambio, no necesitas hacer nada más. Tu cuenta está segura.</p>
          
          <p><strong>⚠️ ¿No fuiste tú?</strong></p>
          <p>Si no cambiaste tu contraseña, contacta inmediatamente con nuestro equipo de soporte para asegurar tu cuenta.</p>
          
          <p>Consejos de seguridad:</p>
          <ul>
            <li>🔐 Usa una contraseña única y segura</li>
            <li>🔄 Cambia tu contraseña regularmente</li>
            <li>❌ No compartas tu contraseña con nadie</li>
            <li>💻 Cierra sesión en dispositivos compartidos</li>
          </ul>
          
          <p><strong>El equipo de COMODÍN IA</strong></p>
        </div>
        <div class="footer">
          <p>© 2024 COMODÍN IA. Todos los derechos reservados.</p>
          <p>Este correo fue enviado automáticamente, por favor no respondas a este mensaje.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Template para invitación de equipo
export function getTeamInvitationTemplate(
  invitedUserName: string, 
  inviterName: string, 
  organizationName: string, 
  invitationToken: string,
  role: string
): string {
  const joinUrl = `${process.env.NEXTAUTH_URL}/auth/join?token=${invitationToken}`
  
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invitación a ${organizationName} - COMODÍN IA</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #28a745; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .role-badge { background: #e9ecef; padding: 5px 15px; border-radius: 20px; display: inline-block; font-weight: bold; color: #495057; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 ¡Estás Invitado!</h1>
          <p>Únete a ${organizationName}</p>
        </div>
        <div class="content">
          <h2>Hola${invitedUserName ? ' ' + invitedUserName : ''},</h2>
          <p><strong>${inviterName}</strong> te ha invitado a unirte a <strong>${organizationName}</strong> en COMODÍN IA.</p>
          
          <p>Tu rol será: <span class="role-badge">${role}</span></p>
          
          <p>Con COMODÍN IA podrás:</p>
          <ul>
            <li>📱 Gestionar conversaciones de WhatsApp de forma profesional</li>
            <li>🤖 Usar inteligencia artificial para respuestas automáticas</li>
            <li>👥 Colaborar eficientemente con tu equipo</li>
            <li>📊 Acceder a métricas y análisis detallados</li>
            <li>🚀 Impulsar el crecimiento del negocio</li>
          </ul>
          
          <p>Para aceptar la invitación y crear tu cuenta:</p>
          <a href="${joinUrl}" class="button">Aceptar Invitación</a>
          
          <p><strong>⏰ Esta invitación expirará en 7 días.</strong></p>
          
          <p>Si no puedes hacer clic en el botón, copia y pega esta URL en tu navegador:</p>
          <p style="background: #e9ecef; padding: 10px; border-radius: 5px; word-break: break-all;">
            ${joinUrl}
          </p>
          
          <p>¡Esperamos verte pronto en el equipo!</p>
          
          <p><strong>El equipo de COMODÍN IA</strong></p>
        </div>
        <div class="footer">
          <p>© 2024 COMODÍN IA. Todos los derechos reservados.</p>
          <p>Si no esperabas esta invitación, puedes ignorar este correo de forma segura.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
