
# 🚀 Guía de Despliegue - COMODÍN IA

Esta guía te ayudará a desplegar COMODÍN IA en tu VPS de Hostinger.

## 📋 Pre-requisitos

### En tu servidor VPS:
- **Docker & Docker Compose**: Versión 20.x o superior
- **Git**: Para clonar el repositorio
- **Dominio configurado**: `crm.comodinia.com` apuntando a tu IP
- **Puertos abiertos**: 80, 443, 22

### Credenciales configuradas:
✅ **Supabase**: Base de datos PostgreSQL
✅ **Stripe**: Pagos (claves de producción)
✅ **MercadoPago**: Pagos LATAM
✅ **OpenAI**: Servicios de IA
✅ **Google OAuth**: Autenticación social
✅ **WhatsApp Business**: API de Meta

## 🔧 Instalación

### 1. Preparar el servidor

```bash
# Conectar al VPS
ssh root@89.116.73.62

# Actualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verificar instalación
docker --version
docker-compose --version
```

### 2. Clonar y preparar la aplicación

```bash
# Clonar repositorio (usando tu token de GitHub)
git clone https://YOUR_GITHUB_TOKEN_HERE@github.com/tu-usuario/comodin-ia.git
cd comodin-ia/deployment

# Dar permisos de ejecución al script
chmod +x deploy.sh

# Revisar configuración
cat .env.production
```

### 3. Configurar certificados SSL (Recomendado)

```bash
# Opción 1: Let's Encrypt (Recomendado)
apt install certbot
certbot certonly --standalone -d crm.comodinia.com
cp /etc/letsencrypt/live/crm.comodinia.com/fullchain.pem ssl/cert.pem
cp /etc/letsencrypt/live/crm.comodinia.com/privkey.pem ssl/key.pem

# Opción 2: El script generará certificados self-signed automáticamente
```

### 4. Ejecutar despliegue

```bash
# Ejecutar script de despliegue
./deploy.sh
```

## 🔍 Verificación del despliegue

### Verificar servicios:
```bash
# Estado de contenedores
docker-compose -f docker-compose.production.yml ps

# Logs en tiempo real
docker-compose -f docker-compose.production.yml logs -f

# Salud de la aplicación
curl http://localhost/health
```

### URLs importantes:
- **Aplicación**: https://crm.comodinia.com
- **Health check**: https://crm.comodinia.com/health
- **API**: https://crm.comodinia.com/api
- **Webhooks WhatsApp**: https://crm.comodinia.com/api/whatsapp/webhook

## 🔐 Configuración de servicios externos

### WhatsApp Business (Por organización):
1. Ir a **Meta for Developers**
2. Crear app de WhatsApp Business
3. Obtener:
   - Access Token
   - Phone Number ID
   - Business Account ID
4. Configurar webhook: `https://crm.comodinia.com/api/whatsapp/webhook`
5. Token de verificación: `comodin_whatsapp_webhook_2024`

### Stripe Webhooks:
- URL: `https://crm.comodinia.com/api/webhooks/stripe`
- Eventos: `payment_intent.succeeded`, `invoice.payment_failed`, etc.

### Configuración DNS:
```bash
# En tu proveedor de dominio, configura:
crm.comodinia.com A 89.116.73.62
```

## 🛠️ Comandos de mantenimiento

### Gestión de contenedores:
```bash
# Reiniciar todos los servicios
docker-compose -f docker-compose.production.yml restart

# Reiniciar solo la app
docker-compose -f docker-compose.production.yml restart app

# Ver logs específicos
docker-compose -f docker-compose.production.yml logs app
docker-compose -f docker-compose.production.yml logs nginx

# Detener todo
docker-compose -f docker-compose.production.yml down

# Limpiar sistema
docker system prune -f
```

### Base de datos:
```bash
# Ejecutar migraciones
docker-compose -f docker-compose.production.yml exec app npx prisma migrate deploy

# Resetear base de datos (¡CUIDADO!)
docker-compose -f docker-compose.production.yml exec app npx prisma migrate reset

# Generar cliente Prisma
docker-compose -f docker-compose.production.yml exec app npx prisma generate

# Poblar datos iniciales
docker-compose -f docker-compose.production.yml exec app npx prisma db seed
```

## 📊 Monitoreo

### Logs importantes:
```bash
# Logs de aplicación
tail -f logs/app.log

# Logs de Nginx
tail -f logs/nginx/access.log
tail -f logs/nginx/error.log

# Logs de Redis
docker logs comodin-ia-redis
```

### Métricas del sistema:
```bash
# Uso de recursos
docker stats

# Espacio en disco
df -h

# Memoria y CPU
htop
```

## 🚨 Solución de problemas

### Problemas comunes:

#### Error de conexión a base de datos:
```bash
# Verificar conectividad a Supabase
docker-compose -f docker-compose.production.yml exec app npx prisma db pull
```

#### Error 502 Bad Gateway:
```bash
# Verificar que la app esté corriendo
docker-compose -f docker-compose.production.yml ps
docker-compose -f docker-compose.production.yml restart app
```

#### Certificados SSL expirados:
```bash
# Renovar certificados Let's Encrypt
certbot renew
docker-compose -f docker-compose.production.yml restart nginx
```

#### Falta de espacio en disco:
```bash
# Limpiar imágenes Docker antiguas
docker system prune -a -f

# Limpiar logs antiguos
find logs/ -name "*.log" -mtime +30 -delete
```

## 🔄 Actualización de la aplicación

```bash
# Obtener última versión
git pull origin main

# Rebuildar y redesplegar
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d
```

## 📞 Soporte

Si tienes problemas durante el despliegue:

1. **Revisa logs**: `docker-compose logs -f`
2. **Verifica conexiones**: URLs y credenciales
3. **Consulta documentación**: De cada servicio integrado
4. **Contacto**: Para soporte técnico específico

---

## ✅ Checklist final

- [ ] Servidor preparado con Docker
- [ ] Repositorio clonado
- [ ] Variables de entorno configuradas
- [ ] Certificados SSL instalados
- [ ] Despliegue ejecutado exitosamente
- [ ] Health check respondiendo OK
- [ ] Webhooks configurados en servicios externos
- [ ] DNS apuntando correctamente
- [ ] Monitoreo configurado

¡Tu aplicación COMODÍN IA está lista para producción! 🚀
