"use strict";exports.id=3217,exports.ids=[3217],exports.modules={55743:(e,a,t)=>{t.d(a,{Cz:()=>n,dL:()=>r,xN:()=>o});let i=t(12446).createTransport({host:process.env.SMTP_HOST||"smtp.gmail.com",port:parseInt(process.env.SMTP_PORT||"587"),secure:!1,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}});async function n(e){try{let a=await i.sendMail({from:`"${process.env.SMTP_FROM_NAME||"COMOD\xcdN IA"}" <${process.env.SMTP_FROM_EMAIL||process.env.SMTP_USER}>`,to:e.to,subject:e.subject,text:e.text,html:e.html});return console.log("✅ Email enviado:",a.messageId),!0}catch(e){return console.error("❌ Error enviando email:",e),!1}}function r(e,a){return`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bienvenido a COMOD\xcdN IA</title>
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
          <h1>\xa1Bienvenido a COMOD\xcdN IA!</h1>
          <p>Tu plataforma de comunicaci\xf3n inteligente</p>
        </div>
        <div class="content">
          <h2>Hola ${e},</h2>
          <p>\xa1Felicitaciones! Te has registrado exitosamente en <strong>${a}</strong> usando COMOD\xcdN IA.</p>
          
          <p>Con tu cuenta podr\xe1s:</p>
          <ul>
            <li>📱 Gestionar conversaciones de WhatsApp</li>
            <li>🤖 Usar inteligencia artificial para respuestas autom\xe1ticas</li>
            <li>📊 Analizar m\xe9tricas de comunicaci\xf3n</li>
            <li>👥 Colaborar con tu equipo</li>
            <li>🚀 Hacer crecer tu negocio</li>
          </ul>
          
          <p>Para comenzar, simplemente inicia sesi\xf3n en tu cuenta:</p>
          <a href="${process.env.NEXTAUTH_URL}/auth/login" class="button">Iniciar Sesi\xf3n</a>
          
          <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
          
          <p>\xa1Bienvenido al futuro de la comunicaci\xf3n empresarial!</p>
          
          <p><strong>El equipo de COMOD\xcdN IA</strong></p>
        </div>
        <div class="footer">
          <p>\xa9 2024 COMOD\xcdN IA. Todos los derechos reservados.</p>
          <p>Este correo fue enviado autom\xe1ticamente, por favor no respondas a este mensaje.</p>
        </div>
      </div>
    </body>
    </html>
  `}function o(e,a,t,i,n){let r=`${process.env.NEXTAUTH_URL}/auth/join?token=${i}`;return`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invitaci\xf3n a ${t} - COMOD\xcdN IA</title>
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
          <h1>🎉 \xa1Est\xe1s Invitado!</h1>
          <p>\xdanete a ${t}</p>
        </div>
        <div class="content">
          <h2>Hola${e?" "+e:""},</h2>
          <p><strong>${a}</strong> te ha invitado a unirte a <strong>${t}</strong> en COMOD\xcdN IA.</p>
          
          <p>Tu rol ser\xe1: <span class="role-badge">${n}</span></p>
          
          <p>Con COMOD\xcdN IA podr\xe1s:</p>
          <ul>
            <li>📱 Gestionar conversaciones de WhatsApp de forma profesional</li>
            <li>🤖 Usar inteligencia artificial para respuestas autom\xe1ticas</li>
            <li>👥 Colaborar eficientemente con tu equipo</li>
            <li>📊 Acceder a m\xe9tricas y an\xe1lisis detallados</li>
            <li>🚀 Impulsar el crecimiento del negocio</li>
          </ul>
          
          <p>Para aceptar la invitaci\xf3n y crear tu cuenta:</p>
          <a href="${r}" class="button">Aceptar Invitaci\xf3n</a>
          
          <p><strong>⏰ Esta invitaci\xf3n expirar\xe1 en 7 d\xedas.</strong></p>
          
          <p>Si no puedes hacer clic en el bot\xf3n, copia y pega esta URL en tu navegador:</p>
          <p style="background: #e9ecef; padding: 10px; border-radius: 5px; word-break: break-all;">
            ${r}
          </p>
          
          <p>\xa1Esperamos verte pronto en el equipo!</p>
          
          <p><strong>El equipo de COMOD\xcdN IA</strong></p>
        </div>
        <div class="footer">
          <p>\xa9 2024 COMOD\xcdN IA. Todos los derechos reservados.</p>
          <p>Si no esperabas esta invitaci\xf3n, puedes ignorar este correo de forma segura.</p>
        </div>
      </div>
    </body>
    </html>
  `}},33217:(e,a,t)=>{t.d(a,{e:()=>c});var i=t(83178),n=t(53524),r=t(55743),o=t(84770),s=t.n(o);class c{static async createInvitation(e){try{if(await i._.user.findFirst({where:{email:e.email,organizationId:e.organizationId}}))throw Error("El usuario ya pertenece a esta organizaci\xf3n");if(await i._.invitation.findFirst({where:{email:e.email,organizationId:e.organizationId,status:n.InvitationStatus.PENDING}}))throw Error("Ya existe una invitaci\xf3n pendiente para este email");let a=s().randomBytes(32).toString("hex"),t=new Date;t.setDate(t.getDate()+7);let o=await i._.invitation.create({data:{email:e.email,token:a,role:e.role,organizationId:e.organizationId,invitedBy:e.invitedBy,invitedByName:e.invitedByName,firstName:e.firstName,lastName:e.lastName,message:e.message,expiresAt:t,status:n.InvitationStatus.PENDING},include:{organization:!0}});process.env.NEXTAUTH_URL;let c=(0,r.xN)(o.email,"COMOD\xcdN IA",o.organization.name,a,o.role);if(!await (0,r.Cz)({to:o.email,subject:`Invitaci\xf3n a ${o.organization.name}`,html:c}))throw await i._.invitation.delete({where:{id:o.id}}),Error("Error enviando email de invitaci\xf3n");return{success:!0,invitation:o}}catch(e){throw console.error("❌ Error creando invitaci\xf3n:",e),e}}static async getInvitationByToken(e){let a=await i._.invitation.findUnique({where:{token:e},include:{organization:!0}});if(!a)throw Error("Invitaci\xf3n no encontrada");if(a.status!==n.InvitationStatus.PENDING)throw Error("Esta invitaci\xf3n ya ha sido procesada");if(a.expiresAt<new Date)throw Error("Esta invitaci\xf3n ha expirado");return a}static async acceptInvitation(e){try{let a=await this.getInvitationByToken(e.token);if(await i._.user.findUnique({where:{email:a.email}}))throw Error("Ya existe un usuario con este email");let r=t(3390),o=await r.hash(e.userData.password,12);return await i._.$transaction(async t=>{let i=await t.user.create({data:{email:a.email,name:e.userData.name,fullName:e.userData.fullName||`${a.firstName||""} ${a.lastName||""}`.trim()||e.userData.name,phone:e.userData.phone,country:e.userData.country,organizationId:a.organizationId,role:a.role,isActive:!0,emailVerified:new Date}});return await t.account.create({data:{userId:i.id,type:"credentials",provider:"credentials",providerAccountId:i.email,refresh_token:o}}),await t.invitation.update({where:{id:a.id},data:{status:n.InvitationStatus.ACCEPTED,acceptedAt:new Date}}),{user:i,invitation:a}})}catch(e){throw console.error("❌ Error aceptando invitaci\xf3n:",e),e}}static async cancelInvitation(e,a){let t=await i._.invitation.findUnique({where:{id:e}});if(!t)throw Error("Invitaci\xf3n no encontrada");if(t.invitedBy!==a)throw Error("No tienes permisos para cancelar esta invitaci\xf3n");return await i._.invitation.update({where:{id:e},data:{status:n.InvitationStatus.CANCELLED}}),{success:!0}}static async getOrganizationInvitations(e,a){return await i._.invitation.findMany({where:{organizationId:e,...a&&{status:a}},include:{organization:!0},orderBy:{createdAt:"desc"}})}static async cleanExpiredInvitations(){let e=await i._.invitation.updateMany({where:{expiresAt:{lt:new Date},status:n.InvitationStatus.PENDING},data:{status:n.InvitationStatus.EXPIRED}});return console.log(`🧹 Invitaciones expiradas actualizadas: ${e.count}`),e}}}};