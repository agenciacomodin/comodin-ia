
#!/bin/bash

# =============================================================================
# COMODÍN IA - SCRIPT DE DEPLOYMENT PARA PRODUCCIÓN
# =============================================================================

set -e  # Salir en caso de error

echo "🚀 INICIANDO DEPLOYMENT DE COMODÍN IA EN PRODUCCIÓN..."
echo "=================================================================="

# Variables de configuración
DOMAIN="crm.comodinia.com"
APP_DIR="/srv/comodin_ia"
BACKUP_DIR="/srv/backups/$(date +%Y%m%d_%H%M%S)"

echo "📋 Configuración del deployment:"
echo "  - Dominio: $DOMAIN"
echo "  - Directorio: $APP_DIR"
echo "  - Backup: $BACKUP_DIR"
echo ""

# Función para logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Función para verificar éxito de comandos
check_success() {
    if [ $? -eq 0 ]; then
        log "✅ $1"
    else
        log "❌ ERROR: $1"
        exit 1
    fi
}

# PASO 1: Preparar el entorno
log "🧹 PASO 1: Limpiando configuración anterior..."

# Detener servicios anteriores si existen
if [ -d "$APP_DIR" ]; then
    cd $APP_DIR
    docker-compose down --remove-orphans 2>/dev/null || true
    check_success "Servicios anteriores detenidos"
fi

# Limpiar configuraciones de Nginx
rm -f /etc/nginx/sites-enabled/*
rm -f /etc/nginx/sites-available/comodin*
systemctl reload nginx 2>/dev/null || true
check_success "Configuración de Nginx limpiada"

# PASO 2: Crear directorios y backup
log "📁 PASO 2: Preparando directorios..."

# Crear backup si existe instalación anterior
if [ -d "$APP_DIR" ]; then
    mkdir -p $(dirname $BACKUP_DIR)
    cp -r $APP_DIR $BACKUP_DIR
    check_success "Backup creado en $BACKUP_DIR"
fi

# Crear directorio de trabajo
mkdir -p $APP_DIR
cd $APP_DIR
check_success "Directorio de trabajo creado"

# PASO 3: Crear archivo .env de producción
log "⚙️  PASO 3: Configurando variables de entorno..."

cat > .env << 'EOF'
# =============================================================================
# COMODÍN IA - CONFIGURACIÓN DE PRODUCCIÓN
# =============================================================================

# SUPABASE DATABASE (PRODUCCIÓN)
DATABASE_URL="postgresql://postgres:22N3m3s1@?123456@db.ovpcxvotqfmiqqrdmloi.supabase.co:5432/postgres"
SUPABASE_URL="https://ovpcxvotqfmiqqrdmloi.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92cGN4dm90cWZtaXFxcmRtbG9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MDg0MTQsImV4cCI6MjA3NDA4NDQxNH0.7ZFIWqIM2snDqmZYZKmlfNWBk6VN2ojlYftNctbrpUA"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92cGN4dm90cWZtaXFxcmRtbG9pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODUwODQxNCwiZXhwIjoyMDc0MDg0NDE0fQ.P78W782Ix9Nixeh1LbHax3Rf--JSoTvpSR2l0KGS31w"

# NEXTAUTH
NEXTAUTH_URL="https://crm.comodinia.com"
NEXTAUTH_SECRET="ComodinIA_Production_Auth_Secret_2024_SuperSecure_32chars+"

# SEGURIDAD
CRON_SECRET="ComodinIA_Cron_Production_Secret_2024_Secure"
ENCRYPTION_SECRET="ComodinIA_Production_Encryption_Key_2024_SuperSecure_64bytes"

# STRIPE PRODUCCIÓN
STRIPE_SECRET_KEY="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"
STRIPE_PUBLISHABLE_KEY="pk_live_51LkF9aHZmGOpXSGYhRwtSFpfyJfbQSBH9ADCV2CNrhVpMtdpEUdUcq32mZ122yqxOGzVNBbLetZv8jp7ubDs92iv00ERgJ5WKA"
STRIPE_WEBHOOK_SECRET="whsec_configure_after_deployment"

# MERCADO PAGO
MERCADO_PAGO_ACCESS_TOKEN="APP_USR-4099736982406285-092308-f4bc1fc824e11f0808f692a7175ae51c-537499879"
MERCADO_PAGO_PUBLIC_KEY="APP_USR-1020ef09-bb62-4b0d-8a5d-5ed2a2daec3a"
MERCADO_PAGO_CLIENT_ID="4099736982406285"
MERCADO_PAGO_CLIENT_SECRET="vJrqDIdNd8ZxJFRZ98E556MZpGucvIWD"

# OPENAI & IA
OPENAI_API_KEY="sk-proj-LbX-bruI4k2ome6ewriy0xNZORiK0WKOxdq-fWoSY_uGozmZx4xNYc1xRrnEbvGd0sA8A"
ABACUSAI_API_KEY="7735d751a94543119ff07ad06d43f6c2"

# AWS S3
AWS_PROFILE="hosted_storage"
AWS_REGION="us-west-2"
AWS_BUCKET_NAME="abacusai-apps-62cb009bed32f42cefea6a0d-us-west-2"
AWS_FOLDER_PREFIX="3294/"

# EVOLUTION API
EVOLUTION_API_KEY="ComodinIA_Evolution_API_Key_Production_2024_Secure"
EVOLUTION_API_URL="http://evolution-api:8080"

# SISTEMA
NODE_ENV="production"
PORT="3000"
TZ="America/Mexico_City"
LOG_LEVEL="info"
EOF

check_success "Archivo .env creado"

# PASO 4: Instalar dependencias del sistema
log "📦 PASO 4: Instalando dependencias del sistema..."

# Actualizar sistema
apt update && apt upgrade -y
check_success "Sistema actualizado"

# Instalar Docker y Docker Compose si no están instalados
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl start docker
    systemctl enable docker
    check_success "Docker instalado"
fi

if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    check_success "Docker Compose instalado"
fi

# Instalar Nginx y Certbot
apt install -y nginx certbot python3-certbot-nginx
systemctl start nginx
systemctl enable nginx
check_success "Nginx y Certbot instalados"

# PASO 5: Configurar Nginx
log "🌐 PASO 5: Configurando Nginx..."

# Crear configuración temporal para certificado SSL
cat > /etc/nginx/sites-available/comodin-temp << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}
EOF

ln -sf /etc/nginx/sites-available/comodin-temp /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
check_success "Configuración temporal de Nginx creada"

# PASO 6: Obtener certificado SSL
log "🔒 PASO 6: Obteniendo certificado SSL..."

certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@comodinia.com
check_success "Certificado SSL obtenido"

# PASO 7: Configurar Nginx para producción
log "🌐 PASO 7: Configurando Nginx final..."

# Crear configuración final
cat > /etc/nginx/sites-available/comodin-production << 'EOF'
server {
    listen 80;
    server_name crm.comodinia.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name crm.comodinia.com;

    ssl_certificate /etc/letsencrypt/live/crm.comodinia.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/crm.comodinia.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    
    client_max_body_size 50M;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=63072000" always;

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
        proxy_read_timeout 86400;
    }

    location /evolution/ {
        proxy_pass http://localhost:8080/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /health {
        proxy_pass http://localhost:3000/api/health;
        access_log off;
    }
}
EOF

# Activar nueva configuración
rm -f /etc/nginx/sites-enabled/comodin-temp
ln -sf /etc/nginx/sites-available/comodin-production /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
check_success "Configuración final de Nginx aplicada"

echo ""
echo "✅ DEPLOYMENT SCRIPT CREADO CORRECTAMENTE!"
echo ""
echo "📝 Para ejecutar el deployment:"
echo "   1. Transfiere todos los archivos de la aplicación a $APP_DIR"
echo "   2. Ejecuta: chmod +x scripts/deploy-production.sh"
echo "   3. Ejecuta: ./scripts/deploy-production.sh"
echo ""
echo "🌐 La aplicación estará disponible en: https://$DOMAIN"
echo "=================================================================="

