
import nodemailer from 'nodemailer'
import { Invitation, Organization } from '@prisma/client'

export interface InvitationEmailData {
  invitation: Invitation & {
    organization: Organization
  }
  inviteUrl: string
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    this.initializeTransporter()
  }

  private async initializeTransporter() {
    // En producción, usar variables de entorno para SMTP
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    } else {
      // Para desarrollo: usar Ethereal (test account)
      const testAccount = await nodemailer.createTestAccount()
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      })
    }
  }

  async sendInvitationEmail({ invitation, inviteUrl }: InvitationEmailData): Promise<{ success: boolean; messageUrl?: string; error?: string }> {
    try {
      if (!this.transporter) {
        await this.initializeTransporter()
      }

      if (!this.transporter) {
        throw new Error('No se pudo configurar el transportador de email')
      }

      const roleNames = {
        PROPIETARIO: 'Propietario',
        AGENTE: 'Agente de Ventas',
        DISTRIBUIDOR: 'Distribuidor',
        SUPER_ADMIN: 'Super Admin'
      }

      const emailHTML = this.generateInvitationHTML({
        invitedByName: invitation.invitedByName,
        organizationName: invitation.organization.name,
        roleName: roleNames[invitation.role],
        inviteUrl,
        message: invitation.message,
        firstName: invitation.firstName
      })

      const info = await this.transporter.sendMail({
        from: `"COMODÍN IA" <${process.env.SMTP_FROM || 'noreply@comodin.ia'}>`,
        to: invitation.email,
        subject: `Invitación a COMODÍN IA - ${invitation.organization.name}`,
        html: emailHTML,
        text: this.generateInvitationText({
          invitedByName: invitation.invitedByName,
          organizationName: invitation.organization.name,
          roleName: roleNames[invitation.role],
          inviteUrl,
          message: invitation.message,
          firstName: invitation.firstName
        })
      })

      console.log('✅ Email enviado:', info.messageId)

      // Para desarrollo, mostrar URL del preview
      const previewUrl = nodemailer.getTestMessageUrl(info)
      if (previewUrl) {
        console.log('📧 Preview URL:', previewUrl)
        return { success: true, messageUrl: previewUrl }
      }

      return { success: true }
    } catch (error) {
      console.error('❌ Error enviando email:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }
    }
  }

  private generateInvitationHTML(data: {
    invitedByName: string
    organizationName: string
    roleName: string
    inviteUrl: string
    message?: string | null
    firstName?: string | null
  }): string {
    const greeting = data.firstName ? `Hola ${data.firstName}` : 'Hola'
    const personalMessage = data.message ? `<p style="color: #666; font-style: italic; border-left: 3px solid #3B82F6; padding-left: 15px;">"${data.message}"</p>` : ''

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitación a COMODÍN IA</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">COMODÍN IA</h1>
        <p style="color: #E5E7EB; margin: 5px 0 0 0;">Plataforma de Comunicación y Ventas</p>
    </div>
    
    <div style="background: white; padding: 40px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1F2937; margin-top: 0;">¡Has sido invitado!</h2>
        
        <p><strong>${greeting},</strong></p>
        
        <p><strong>${data.invitedByName}</strong> te ha invitado a unirte a <strong>${data.organizationName}</strong> en COMODÍN IA como <strong>${data.roleName}</strong>.</p>
        
        ${personalMessage}
        
        <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #374151;">¿Qué es COMODÍN IA?</h3>
            <p style="margin-bottom: 0;">Una plataforma integral que unifica la comunicación con clientes, CRM inteligente y herramientas de ventas, diseñada especialmente para PyMEs en América Latina.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${data.inviteUrl}" 
               style="background: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; transition: background-color 0.3s;">
                Aceptar Invitación
            </a>
        </div>
        
        <div style="border-top: 1px solid #E5E7EB; padding-top: 20px; margin-top: 30px; color: #6B7280; font-size: 14px;">
            <p><strong>Información de tu cuenta:</strong></p>
            <ul style="list-style: none; padding: 0;">
                <li>📧 Email: ${data.organizationName}</li>
                <li>🏢 Organización: ${data.organizationName}</li>
                <li>👤 Rol: ${data.roleName}</li>
            </ul>
        </div>
        
        <p style="color: #6B7280; font-size: 12px; margin-top: 30px; text-align: center;">
            Si no solicitaste esta invitación, puedes ignorar este email de manera segura.<br>
            Esta invitación expirará en 7 días.
        </p>
    </div>
    
    <div style="text-align: center; margin-top: 20px; color: #6B7280; font-size: 12px;">
        <p>© 2025 COMODÍN IA. Todos los derechos reservados.</p>
    </div>
</body>
</html>`
  }

  private generateInvitationText(data: {
    invitedByName: string
    organizationName: string
    roleName: string
    inviteUrl: string
    message?: string | null
    firstName?: string | null
  }): string {
    const greeting = data.firstName ? `Hola ${data.firstName}` : 'Hola'
    const personalMessage = data.message ? `\n\nMensaje personal: "${data.message}"\n` : ''

    return `
${greeting},

${data.invitedByName} te ha invitado a unirte a ${data.organizationName} en COMODÍN IA como ${data.roleName}.
${personalMessage}
COMODÍN IA es una plataforma integral que unifica la comunicación con clientes, CRM inteligente y herramientas de ventas, diseñada especialmente para PyMEs en América Latina.

Para aceptar esta invitación, visita el siguiente enlace:
${data.inviteUrl}

Información de tu cuenta:
- Email: ${data.organizationName}
- Organización: ${data.organizationName}
- Rol: ${data.roleName}

Si no solicitaste esta invitación, puedes ignorar este email de manera segura.
Esta invitación expirará en 7 días.

© 2025 COMODÍN IA. Todos los derechos reservados.
    `
  }
}

export const emailService = new EmailService()
