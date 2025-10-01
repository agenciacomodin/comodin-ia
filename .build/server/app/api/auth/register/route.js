"use strict";(()=>{var e={};e.id=3002,e.ids=[3002],e.modules={53524:e=>{e.exports=require("@prisma/client")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},61282:e=>{e.exports=require("child_process")},84770:e=>{e.exports=require("crypto")},80665:e=>{e.exports=require("dns")},17702:e=>{e.exports=require("events")},92048:e=>{e.exports=require("fs")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},98216:e=>{e.exports=require("net")},19801:e=>{e.exports=require("os")},55315:e=>{e.exports=require("path")},76162:e=>{e.exports=require("stream")},82452:e=>{e.exports=require("tls")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},71568:e=>{e.exports=require("zlib")},25999:(e,a,r)=>{r.r(a),r.d(a,{originalPathname:()=>v,patchFetch:()=>f,requestAsyncStorage:()=>g,routeModule:()=>x,serverHooks:()=>h,staticGenerationAsyncStorage:()=>m});var t={};r.r(t),r.d(t,{POST:()=>u});var i=r(79182),o=r(72007),s=r(56719),n=r(93442),d=r(83178),c=r(55743),p=r(3390),l=r.n(p);async function u(e){try{let a;let{email:r,password:t,name:i,fullName:o,phone:s,country:p,organizationName:u,role:x="AGENTE"}=await e.json();if(!r||!t||!u)return n.NextResponse.json({success:!1,message:"Email, contrase\xf1a y nombre de organizaci\xf3n son requeridos"},{status:400});if(!r.includes("@"))return n.NextResponse.json({success:!1,message:"Email no v\xe1lido"},{status:400});if(t.length<8)return n.NextResponse.json({success:!1,message:"La contrase\xf1a debe tener al menos 8 caracteres"},{status:400});if(await d._.user.findUnique({where:{email:r.toLowerCase()}}))return n.NextResponse.json({success:!1,message:"Este email ya est\xe1 registrado"},{status:400});let g=x,m=u.toLowerCase().replace(/[^a-z0-9]/g,"-").replace(/-+/g,"-").trim();a=await d._.organization.create({data:{name:u,slug:m+"-"+Date.now(),email:r.toLowerCase(),status:"TRIAL",currentPlan:"FREE",maxUsers:5,maxMessages:1e3,maxIntegrations:2}}),g="PROPIETARIO";let h=await l().hash(t,12),v=await d._.user.create({data:{email:r.toLowerCase(),name:i||r.split("@")[0],fullName:o,phone:s,country:p,organizationId:a.id,role:g,isActive:!0}});await d._.account.create({data:{userId:v.id,type:"credentials",provider:"credentials",providerAccountId:v.id,refresh_token:h}}),await d._.aIWallet.create({data:{organizationId:a.id,balance:10,currency:"USD"}});let f=await (0,c.Cz)({to:v.email,subject:`🎉 \xa1Bienvenido a ${a.name}! - COMOD\xcdN IA`,html:(0,c.dL)(v.name||v.email,a.name)});return f||console.error("Error sending welcome email to:",v.email),n.NextResponse.json({success:!0,message:"Usuario registrado exitosamente",data:{userId:v.id,organizationId:a.id,role:g,emailSent:f}})}catch(e){return console.error("Error in register:",e),n.NextResponse.json({success:!1,message:"Error interno del servidor"},{status:500})}}let x=new i.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/auth/register/route",pathname:"/api/auth/register",filename:"route",bundlePath:"app/api/auth/register/route"},resolvedPagePath:"/home/ubuntu/comodin_ia/app/app/api/auth/register/route.ts",nextConfigOutput:"",userland:t}),{requestAsyncStorage:g,staticGenerationAsyncStorage:m,serverHooks:h}=x,v="/api/auth/register/route";function f(){return(0,s.patchFetch)({serverHooks:h,staticGenerationAsyncStorage:m})}},83178:(e,a,r)=>{r.d(a,{_:()=>i,db:()=>o});var t=r(53524);let i=globalThis.prisma??new t.PrismaClient,o=i},55743:(e,a,r)=>{r.d(a,{Cz:()=>i,dL:()=>o,xN:()=>s});let t=r(12446).createTransport({host:process.env.SMTP_HOST||"smtp.gmail.com",port:parseInt(process.env.SMTP_PORT||"587"),secure:!1,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}});async function i(e){try{let a=await t.sendMail({from:`"${process.env.SMTP_FROM_NAME||"COMOD\xcdN IA"}" <${process.env.SMTP_FROM_EMAIL||process.env.SMTP_USER}>`,to:e.to,subject:e.subject,text:e.text,html:e.html});return console.log("✅ Email enviado:",a.messageId),!0}catch(e){return console.error("❌ Error enviando email:",e),!1}}function o(e,a){return`
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
  `}function s(e,a,r,t,i){let o=`${process.env.NEXTAUTH_URL}/auth/join?token=${t}`;return`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invitaci\xf3n a ${r} - COMOD\xcdN IA</title>
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
          <p>\xdanete a ${r}</p>
        </div>
        <div class="content">
          <h2>Hola${e?" "+e:""},</h2>
          <p><strong>${a}</strong> te ha invitado a unirte a <strong>${r}</strong> en COMOD\xcdN IA.</p>
          
          <p>Tu rol ser\xe1: <span class="role-badge">${i}</span></p>
          
          <p>Con COMOD\xcdN IA podr\xe1s:</p>
          <ul>
            <li>📱 Gestionar conversaciones de WhatsApp de forma profesional</li>
            <li>🤖 Usar inteligencia artificial para respuestas autom\xe1ticas</li>
            <li>👥 Colaborar eficientemente con tu equipo</li>
            <li>📊 Acceder a m\xe9tricas y an\xe1lisis detallados</li>
            <li>🚀 Impulsar el crecimiento del negocio</li>
          </ul>
          
          <p>Para aceptar la invitaci\xf3n y crear tu cuenta:</p>
          <a href="${o}" class="button">Aceptar Invitaci\xf3n</a>
          
          <p><strong>⏰ Esta invitaci\xf3n expirar\xe1 en 7 d\xedas.</strong></p>
          
          <p>Si no puedes hacer clic en el bot\xf3n, copia y pega esta URL en tu navegador:</p>
          <p style="background: #e9ecef; padding: 10px; border-radius: 5px; word-break: break-all;">
            ${o}
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
  `}}};var a=require("../../../../webpack-runtime.js");a.C(e);var r=e=>a(a.s=e),t=a.X(0,[4372,7329,7609,2446],()=>r(25999));module.exports=t})();