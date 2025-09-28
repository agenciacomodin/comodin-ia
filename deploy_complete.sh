#!/bin/bash

# =============================================================================
# COMODÍN IA - SCRIPT DE DEPLOYMENT COMPLETO PARA PRODUCCIÓN
# =============================================================================

set -e  # Salir en caso de error

echo "🚀 INICIANDO DEPLOYMENT COMPLETO DE COMODÍN IA EN PRODUCCIÓN..."
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

# Función para logging con timestamp
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

# PASO 1: Preparar el entorno del servidor
log "🧹 PASO 1: Preparando el entorno del servidor..."

# Actualizar sistema
apt update && apt upgrade -y
check_success "Sistema actualizado"

# Instalar dependencias
apt install -y curl wget git ufw htop nano certbot python3-certbot-nginx nginx
check_success "Dependencias básicas instaladas"

# PASO 2: Instalar Docker si no existe
log "🐳 PASO 2: Verificando/Instalando Docker..."

if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl start docker
    systemctl enable docker
    check_success "Docker instalado"
else
    log "✅ Docker ya está instalado"
fi

if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    check_success "Docker Compose instalado"
else
    log "✅ Docker Compose ya está instalado"
fi

# PASO 3: Configurar firewall
log "🔥 PASO 3: Configurando firewall..."
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
check_success "Firewall configurado"

# PASO 4: Limpiar instalación anterior
log "🧹 PASO 4: Limpiando instalación anterior..."

if [ -d "$APP_DIR" ]; then
    cd $APP_DIR
    docker-compose -f docker-compose.production.yml down --remove-orphans 2>/dev/null || true
    check_success "Contenedores anteriores detenidos"
    
    # Crear backup si existe
    mkdir -p $(dirname $BACKUP_DIR)
    cp -r $APP_DIR $BACKUP_DIR 2>/dev/null || true
    log "✅ Backup creado en $BACKUP_DIR"
fi

# Limpiar configuraciones de Nginx
rm -f /etc/nginx/sites-enabled/*
rm -f /etc/nginx/sites-available/comodin*
systemctl stop nginx || true
systemctl start nginx
systemctl enable nginx
check_success "Nginx reiniciado y limpiado"

# PASO 5: Crear directorio de aplicación
log "📁 PASO 5: Creando directorio de aplicación..."
mkdir -p $APP_DIR
cd $APP_DIR
check_success "Directorio de trabajo creado: $APP_DIR"

# PASO 6: Configurar SSL temporal para Let's Encrypt
log "🔒 PASO 6: Configurando certificado SSL..."

# Crear configuración temporal para validación SSL
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
