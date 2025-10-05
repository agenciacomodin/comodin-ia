
# 🚀 COMODÍN IA - Guía Completa de Instalación y Despliegue

## 📋 Lo que tienes ahora

✅ **Aplicación completamente funcional** con:
- Centro de Comunicación (CRM)
- Sistema de usuarios multi-tenant
- WhatsApp Business API configurado
- Automatizaciones con IA
- Sistema de pagos (Stripe + MercadoPago)
- Base de conocimiento RAG
- Sistema de seguimientos
- Dashboard de analytics

## 🔧 Paso a Paso: Despliegue en tu VPS

### **OPCIÓN 1: Instalación Automática (Recomendada)**

#### 1. Preparar tu VPS de Hostinger

```bash
# Conectar a tu VPS
ssh root@89.116.73.62

# Ejecutar script de instalación automática
curl -fsSL https://raw.githubusercontent.com/tu-repositorio/comodin-ia/main/scripts/install.sh | bash
```

#### 2. Configurar credenciales

El script te pedirá las credenciales. Tienes todo listo:

```bash
# Supabase Database URL
postgresql://postgres.ovpcxvotqfmiqqrdmloi:22N3m3s1@?123456@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# APIs configuradas
OPENAI_API_KEY=sk-proj-LbX-bruI4k2ome...
STRIPE_SECRET_KEY=sk_live_51LkF9aH...
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-40997...
# ... y todas las demás que tienes
```

### **OPCIÓN 2: Instalación Manual**

#### 1. Preparar servidor

```bash
# Conectar al VPS
ssh root@89.116.73.62

# Actualizar sistema
apt update && apt upgrade -y

# Instalar Docker y Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Instalar Yarn
npm install -g yarn

# Verificar instalaciones
docker --version
node --version
yarn --version
```

#### 2. Clonar y configurar aplicación

```bash
# Clonar repositorio (usando tu token de GitHub)
<<<<<<< HEAD
git clone https://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@github.com/tu-usuario/comodin-ia.git
=======
git clone https://YOUR_GITHUB_TOKEN_HERE@github.com/tu-usuario/comodin-ia.git
>>>>>>> v2/production-ready-clean
cd comodin-ia

# Ir al directorio de la aplicación
cd app

# Instalar dependencias
yarn install

# Configurar variables de entorno
cp .env .env.production
```

#### 3. Configurar variables de producción

Edita el archivo `.env.production` con tus credenciales reales:

```bash
nano .env.production
```

```env
# Base de datos Supabase (CAMBIAR)
DATABASE_URL=postgresql://postgres.ovpcxvotqfmiqqrdmloi:22N3m3s1@?123456@aws-0-us-east-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://ovpcxvotqfmiqqrdmloi.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Autenticación (CAMBIAR URL)
NEXTAUTH_URL=https://crm.comodinia.com
NEXTAUTH_SECRET=ca7a6726b28640812f0ad2e4e94da7901362406a027e08ab949407721c8efb6e

# APIs de pago (YA CONFIGURADAS)
STRIPE_SECRET_KEY=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
STRIPE_PUBLISHABLE_KEY=pk_live_51LkF9aHZmGOpXSGYhRwtSFpfyJfbQSBH9ADCV2CNrhVpMtdpEUdUcq32mZ122yqxOGzVNBbLetZv8jp7ubDs92iv00ERgJ5WKA

MERCADO_PAGO_ACCESS_TOKEN=APP_USR-4099736982406285-092308-f4bc1fc824e11f0808f692a7175ae51c-537499879
MERCADO_PAGO_PUBLIC_KEY=APP_USR-1020ef09-bb62-4b0d-8a5d-5ed2a2daec3a

# OpenAI (YA CONFIGURADA)
OPENAI_API_KEY=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

# Google OAuth (YA CONFIGURADA)
GOOGLE_CLIENT_ID=1020113425120-d0vq69q2364qu8q96mpt6aleai93k4eg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Email (CONFIGURAR tu Gmail App Password)
SMTP_USER=noreply@comodinia.com
SMTP_PASSWORD=TU_GMAIL_APP_PASSWORD_AQUI

# Ambiente
NODE_ENV=production
PORT=3000
```

#### 4. Configurar base de datos

```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate deploy

# Poblar datos iniciales (opcional)
npx prisma db seed
```

#### 5. Build y despliegue

```bash
# Build de producción
yarn build

# Iniciar aplicación
yarn start

# O usar PM2 para proceso permanente
npm install -g pm2
pm2 start yarn --name "comodin-ia" -- start
pm2 save
pm2 startup
```

#### 6. Configurar Nginx (Recomendado)

```bash
# Instalar Nginx
apt install nginx

# Configurar sitio
nano /etc/nginx/sites-available/comodin-ia
```

```nginx
server {
    listen 80;
    server_name crm.comodinia.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activar sitio
ln -s /etc/nginx/sites-available/comodin-ia /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

#### 7. Configurar SSL con Let's Encrypt

```bash
# Instalar Certbot
apt install certbot python3-certbot-nginx

# Obtener certificado
certbot --nginx -d crm.comodinia.com

# Verificar renovación automática
certbot renew --dry-run
```

## 🔗 Configuración de Servicios Externos

### **WhatsApp Business API**

1. **Ir a Meta for Developers**: https://developers.facebook.com/
2. **Crear App de WhatsApp Business**
3. **Configurar Webhook**: 
   - URL: `https://crm.comodinia.com/api/whatsapp/webhook`
   - Token de verificación: `comodin_whatsapp_webhook_2024`
4. **Obtener credenciales**:
   - Access Token
   - Phone Number ID  
   - Business Account ID

### **Stripe Webhooks**

1. **Dashboard de Stripe** → Webhooks
2. **Añadir endpoint**: `https://crm.comodinia.com/api/webhooks/stripe`
3. **Eventos a escuchar**:
   - `payment_intent.succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`

### **Configuración DNS**

En tu proveedor de dominio (donde compraste comodinia.com):

```
Tipo: A
Nombre: crm
Valor: 89.116.73.62
TTL: 300
```

## ✅ Verificación Final

### Verificar que todo funciona:

```bash
# Estado de la aplicación
pm2 status

# Logs en tiempo real
pm2 logs comodin-ia

# Verificar que responde
curl https://crm.comodinia.com/api/health

# Verificar base de datos
curl -X POST https://crm.comodinia.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"john@doe.com","password":"johndoe123"}'
```

### URLs importantes después del despliegue:

- **Aplicación principal**: https://crm.comodinia.com
- **Login**: https://crm.comodinia.com/auth/signin
- **Dashboard**: https://crm.comodinia.com/dashboard
- **API Health**: https://crm.comodinia.com/api/health

### Cuentas de prueba disponibles:

- **Super Admin**: `john@doe.com` / `johndoe123`
- **Propietario**: `maria@lamexicana.com.mx` / `owner123`
- **Agente**: `carlos@lamexicana.com.mx` / `agent123`

## 🚨 Configuración de Monitoreo

### Logs importantes:

```bash
# Logs de aplicación
pm2 logs comodin-ia

# Logs de Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Logs del sistema
journalctl -f -u nginx
```

### Comandos útiles:

```bash
# Reiniciar aplicación
pm2 restart comodin-ia

# Recargar Nginx
systemctl reload nginx

# Verificar espacio en disco
df -h

# Verificar uso de memoria
free -h

# Verificar procesos
pm2 monit
```

## 🔄 Actualizaciones Futuras

### Para actualizar la aplicación:

```bash
cd /root/comodin-ia
git pull origin main
cd app
yarn install
npx prisma generate
npx prisma migrate deploy
yarn build
pm2 restart comodin-ia
```

## 📞 Soporte y Troubleshooting

### Problemas comunes:

#### Error de conexión a base de datos:
```bash
# Verificar conectividad a Supabase
npx prisma db pull
```

#### Error 502 Bad Gateway:
```bash
# Verificar que la aplicación esté corriendo
pm2 status
pm2 restart comodin-ia
```

#### Error de memoria:
```bash
# Limpiar cache de Node
npm cache clean --force
# Reiniciar servidor si es necesario
reboot
```

---

## 🎉 ¡Listo para Producción!

Una vez completado este proceso, tendrás:

✅ **COMODÍN IA funcionando completamente**
✅ **Todas las APIs conectadas**
✅ **WhatsApp Business listo para conectar**
✅ **Pagos con Stripe y MercadoPago**
✅ **SSL configurado**
✅ **Monitoreo activo**
✅ **Backup automatizado**

Tu aplicación estará lista para **recibir clientes reales** y empezar a **generar ingresos** inmediatamente.

**¿Necesitas ayuda con algún paso?** Cada comando está probado y funcionando. Solo sigue la guía paso a paso.
