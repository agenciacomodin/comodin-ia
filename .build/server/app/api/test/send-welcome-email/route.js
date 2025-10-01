"use strict";(()=>{var e={};e.id=5288,e.ids=[5288],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},61282:e=>{e.exports=require("child_process")},84770:e=>{e.exports=require("crypto")},80665:e=>{e.exports=require("dns")},17702:e=>{e.exports=require("events")},92048:e=>{e.exports=require("fs")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},98216:e=>{e.exports=require("net")},19801:e=>{e.exports=require("os")},55315:e=>{e.exports=require("path")},76162:e=>{e.exports=require("stream")},82452:e=>{e.exports=require("tls")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},71568:e=>{e.exports=require("zlib")},26703:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>h,patchFetch:()=>x,requestAsyncStorage:()=>c,routeModule:()=>d,serverHooks:()=>m,staticGenerationAsyncStorage:()=>u});var i={};r.r(i),r.d(i,{POST:()=>l});var n=r(79182),a=r(72007),o=r(56719),s=r(93442),p=r(55743);async function l(e){try{let{email:t,name:r,organizationName:i}=await e.json();if(!t||!t.includes("@"))return s.NextResponse.json({success:!1,message:"Email v\xe1lido es requerido"},{status:400});let n=await (0,p.Cz)({to:t,subject:`🎉 Email de Prueba - Bienvenido a ${i||"COMOD\xcdN IA"}`,html:(0,p.dL)(r||"Usuario de Prueba",i||"Organizaci\xf3n Demo")});return s.NextResponse.json({success:n,message:n?"Email de bienvenida enviado correctamente":"Error al enviar el email de bienvenida"})}catch(e){return console.error("Error in send-welcome-email test:",e),s.NextResponse.json({success:!1,message:"Error interno del servidor"},{status:500})}}let d=new n.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/test/send-welcome-email/route",pathname:"/api/test/send-welcome-email",filename:"route",bundlePath:"app/api/test/send-welcome-email/route"},resolvedPagePath:"/home/ubuntu/comodin_ia/app/app/api/test/send-welcome-email/route.ts",nextConfigOutput:"",userland:i}),{requestAsyncStorage:c,staticGenerationAsyncStorage:u,serverHooks:m}=d,h="/api/test/send-welcome-email/route";function x(){return(0,o.patchFetch)({serverHooks:m,staticGenerationAsyncStorage:u})}},55743:(e,t,r)=>{r.d(t,{Cz:()=>n,dL:()=>a,xN:()=>o});let i=r(12446).createTransport({host:process.env.SMTP_HOST||"smtp.gmail.com",port:parseInt(process.env.SMTP_PORT||"587"),secure:!1,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}});async function n(e){try{let t=await i.sendMail({from:`"${process.env.SMTP_FROM_NAME||"COMOD\xcdN IA"}" <${process.env.SMTP_FROM_EMAIL||process.env.SMTP_USER}>`,to:e.to,subject:e.subject,text:e.text,html:e.html});return console.log("✅ Email enviado:",t.messageId),!0}catch(e){return console.error("❌ Error enviando email:",e),!1}}function a(e,t){return`
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
          <p>\xa1Felicitaciones! Te has registrado exitosamente en <strong>${t}</strong> usando COMOD\xcdN IA.</p>
          
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
  `}function o(e,t,r,i,n){let a=`${process.env.NEXTAUTH_URL}/auth/join?token=${i}`;return`
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
          <p><strong>${t}</strong> te ha invitado a unirte a <strong>${r}</strong> en COMOD\xcdN IA.</p>
          
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
          <a href="${a}" class="button">Aceptar Invitaci\xf3n</a>
          
          <p><strong>⏰ Esta invitaci\xf3n expirar\xe1 en 7 d\xedas.</strong></p>
          
          <p>Si no puedes hacer clic en el bot\xf3n, copia y pega esta URL en tu navegador:</p>
          <p style="background: #e9ecef; padding: 10px; border-radius: 5px; word-break: break-all;">
            ${a}
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
  `}},21666:e=>{var t=Object.defineProperty,r=Object.getOwnPropertyDescriptor,i=Object.getOwnPropertyNames,n=Object.prototype.hasOwnProperty,a={};function o(e){var t;let r=["path"in e&&e.path&&`Path=${e.path}`,"expires"in e&&(e.expires||0===e.expires)&&`Expires=${("number"==typeof e.expires?new Date(e.expires):e.expires).toUTCString()}`,"maxAge"in e&&"number"==typeof e.maxAge&&`Max-Age=${e.maxAge}`,"domain"in e&&e.domain&&`Domain=${e.domain}`,"secure"in e&&e.secure&&"Secure","httpOnly"in e&&e.httpOnly&&"HttpOnly","sameSite"in e&&e.sameSite&&`SameSite=${e.sameSite}`,"partitioned"in e&&e.partitioned&&"Partitioned","priority"in e&&e.priority&&`Priority=${e.priority}`].filter(Boolean),i=`${e.name}=${encodeURIComponent(null!=(t=e.value)?t:"")}`;return 0===r.length?i:`${i}; ${r.join("; ")}`}function s(e){let t=new Map;for(let r of e.split(/; */)){if(!r)continue;let e=r.indexOf("=");if(-1===e){t.set(r,"true");continue}let[i,n]=[r.slice(0,e),r.slice(e+1)];try{t.set(i,decodeURIComponent(null!=n?n:"true"))}catch{}}return t}function p(e){var t,r;if(!e)return;let[[i,n],...a]=s(e),{domain:o,expires:p,httponly:c,maxage:u,path:m,samesite:h,secure:x,partitioned:g,priority:f}=Object.fromEntries(a.map(([e,t])=>[e.toLowerCase(),t]));return function(e){let t={};for(let r in e)e[r]&&(t[r]=e[r]);return t}({name:i,value:decodeURIComponent(n),domain:o,...p&&{expires:new Date(p)},...c&&{httpOnly:!0},..."string"==typeof u&&{maxAge:Number(u)},path:m,...h&&{sameSite:l.includes(t=(t=h).toLowerCase())?t:void 0},...x&&{secure:!0},...f&&{priority:d.includes(r=(r=f).toLowerCase())?r:void 0},...g&&{partitioned:!0}})}((e,r)=>{for(var i in r)t(e,i,{get:r[i],enumerable:!0})})(a,{RequestCookies:()=>c,ResponseCookies:()=>u,parseCookie:()=>s,parseSetCookie:()=>p,stringifyCookie:()=>o}),e.exports=((e,a,o,s)=>{if(a&&"object"==typeof a||"function"==typeof a)for(let o of i(a))n.call(e,o)||void 0===o||t(e,o,{get:()=>a[o],enumerable:!(s=r(a,o))||s.enumerable});return e})(t({},"__esModule",{value:!0}),a);var l=["strict","lax","none"],d=["low","medium","high"],c=class{constructor(e){this._parsed=new Map,this._headers=e;let t=e.get("cookie");if(t)for(let[e,r]of s(t))this._parsed.set(e,{name:e,value:r})}[Symbol.iterator](){return this._parsed[Symbol.iterator]()}get size(){return this._parsed.size}get(...e){let t="string"==typeof e[0]?e[0]:e[0].name;return this._parsed.get(t)}getAll(...e){var t;let r=Array.from(this._parsed);if(!e.length)return r.map(([e,t])=>t);let i="string"==typeof e[0]?e[0]:null==(t=e[0])?void 0:t.name;return r.filter(([e])=>e===i).map(([e,t])=>t)}has(e){return this._parsed.has(e)}set(...e){let[t,r]=1===e.length?[e[0].name,e[0].value]:e,i=this._parsed;return i.set(t,{name:t,value:r}),this._headers.set("cookie",Array.from(i).map(([e,t])=>o(t)).join("; ")),this}delete(e){let t=this._parsed,r=Array.isArray(e)?e.map(e=>t.delete(e)):t.delete(e);return this._headers.set("cookie",Array.from(t).map(([e,t])=>o(t)).join("; ")),r}clear(){return this.delete(Array.from(this._parsed.keys())),this}[Symbol.for("edge-runtime.inspect.custom")](){return`RequestCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`}toString(){return[...this._parsed.values()].map(e=>`${e.name}=${encodeURIComponent(e.value)}`).join("; ")}},u=class{constructor(e){var t,r,i;this._parsed=new Map,this._headers=e;let n=null!=(i=null!=(r=null==(t=e.getSetCookie)?void 0:t.call(e))?r:e.get("set-cookie"))?i:[];for(let e of Array.isArray(n)?n:function(e){if(!e)return[];var t,r,i,n,a,o=[],s=0;function p(){for(;s<e.length&&/\s/.test(e.charAt(s));)s+=1;return s<e.length}for(;s<e.length;){for(t=s,a=!1;p();)if(","===(r=e.charAt(s))){for(i=s,s+=1,p(),n=s;s<e.length&&"="!==(r=e.charAt(s))&&";"!==r&&","!==r;)s+=1;s<e.length&&"="===e.charAt(s)?(a=!0,s=n,o.push(e.substring(t,i)),t=s):s=i+1}else s+=1;(!a||s>=e.length)&&o.push(e.substring(t,e.length))}return o}(n)){let t=p(e);t&&this._parsed.set(t.name,t)}}get(...e){let t="string"==typeof e[0]?e[0]:e[0].name;return this._parsed.get(t)}getAll(...e){var t;let r=Array.from(this._parsed.values());if(!e.length)return r;let i="string"==typeof e[0]?e[0]:null==(t=e[0])?void 0:t.name;return r.filter(e=>e.name===i)}has(e){return this._parsed.has(e)}set(...e){let[t,r,i]=1===e.length?[e[0].name,e[0].value,e[0]]:e,n=this._parsed;return n.set(t,function(e={name:"",value:""}){return"number"==typeof e.expires&&(e.expires=new Date(e.expires)),e.maxAge&&(e.expires=new Date(Date.now()+1e3*e.maxAge)),(null===e.path||void 0===e.path)&&(e.path="/"),e}({name:t,value:r,...i})),function(e,t){for(let[,r]of(t.delete("set-cookie"),e)){let e=o(r);t.append("set-cookie",e)}}(n,this._headers),this}delete(...e){let[t,r,i]="string"==typeof e[0]?[e[0]]:[e[0].name,e[0].path,e[0].domain];return this.set({name:t,path:r,domain:i,value:"",expires:new Date(0)})}[Symbol.for("edge-runtime.inspect.custom")](){return`ResponseCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`}toString(){return[...this._parsed.values()].map(o).join("; ")}}},18764:(e,t,r)=>{Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{RequestCookies:function(){return i.RequestCookies},ResponseCookies:function(){return i.ResponseCookies},stringifyCookie:function(){return i.stringifyCookie}});let i=r(21666)}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),i=t.X(0,[4372,7609,2446],()=>r(26703));module.exports=i})();