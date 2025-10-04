
#!/bin/bash

# 🚀 Script de Instalación Automática - COMODÍN IA
# Versión: 2.0
# Fecha: $(date +%Y-%m-%d)

set -e  # Salir si hay cualquier error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Banner de bienvenida
print_banner() {
    clear
    echo -e "${BLUE}"
    cat << "EOF"
   _____ ____  __  __  ____  _____ _____ _   _   _____            
  / ____/ __ \|  \/  |/ __ \|  __ \_   _| \ | | |_   _|   /\      
 | |   | |  | | \  / | |  | | |  | || | |  \| |   | |    /  \     
 | |   | |  | | |\/| | |  | | |  | || | | . ` |   | |   / /\ \    
 | |___| |__| | |  | | |__| | |__| || |_| |\  |  _| |_ / ____ \   
  \_____\____/|_|  |_|\____/|_____/_____|_| \_| |_____/_/    \_\  
                                                                  
EOF
    echo -e "${NC}"
    echo -e "${GREEN}🚀 Instalador Automático de COMODÍN IA${NC}"
    echo -e "${BLUE}====================================${NC}"
    echo ""
}

# Verificar que se ejecuta como root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "Este script debe ejecutarse como root (usar sudo)"
        exit 1
    fi
}

# Obtener información del sistema
get_system_info() {
    print_status "Obteniendo información del sistema..."
    
    OS=$(lsb_release -si 2>/dev/null || echo "Unknown")
    VERSION=$(lsb_release -sr 2>/dev/null || echo "Unknown")
    ARCH=$(uname -m)
    
    print_success "Sistema: $OS $VERSION ($ARCH)"
    
    # Verificar RAM
    TOTAL_RAM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
    if [[ $TOTAL_RAM -lt 2048 ]]; then
        print_warning "RAM disponible: ${TOTAL_RAM}MB (Recomendado: 4GB+)"
    else
        print_success "RAM disponible: ${TOTAL_RAM}MB"
    fi
    
    # Verificar espacio en disco
    DISK_SPACE=$(df / | awk 'NR==2{printf "%.0f", $4/1024}')
    if [[ $DISK_SPACE -lt 10240 ]]; then
        print_warning "Espacio disponible: ${DISK_SPACE}MB (Recomendado: 20GB+)"
    else
        print_success "Espacio disponible: ${DISK_SPACE}MB"
    fi
}

# Actualizar sistema
update_system() {
    print_status "Actualizando sistema operativo..."
    apt update && apt upgrade -y
    apt install -y curl wget git unzip nano htop net-tools
    print_success "Sistema actualizado correctamente"
}

# Instalar Docker
install_docker() {
    if command_exists docker; then
        print_success "Docker ya está instalado: $(docker --version)"
        return
    fi
    
    print_status "Instalando Docker..."
    
    # Eliminar versiones anteriores
    apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Instalar dependencias
    apt install -y ca-certificates curl gnupg lsb-release
    
    # Agregar clave GPG
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Agregar repositorio
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Instalar Docker
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Habilitar Docker
    systemctl enable docker
    systemctl start docker
    
    # Verificar instalación
    if docker --version && docker compose version; then
        print_success "Docker instalado correctamente: $(docker --version)"
    else
        print_error "Error al instalar Docker"
        exit 1
    fi
}

# Configurar firewall básico
setup_firewall() {
    print_status "Configurando firewall básico..."
    
    if command_exists ufw; then
        # Configurar UFW
        ufw --force reset
        ufw default deny incoming
        ufw default allow outgoing
        
        # Permitir puertos necesarios
        ufw allow 22      # SSH
        ufw allow 80      # HTTP
        ufw allow 443     # HTTPS
        ufw allow 3000    # Next.js (temporal)
        ufw allow 8080    # Evolution API (temporal)
        
        ufw --force enable
        print_success "Firewall configurado"
    else
        print_warning "UFW no disponible, configuración manual de firewall recomendada"
    fi
}

# Configurar directorios
setup_directories() {
    print_status "Configurando directorios..."
    
    # Crear directorio principal
    mkdir -p /opt/comodin-ia
    mkdir -p /opt/backups
    mkdir -p /var/log/comodin-ia
    
    # Permisos
    chown -R root:root /opt/comodin-ia
    chmod -R 755 /opt/comodin-ia
    
    print_success "Directorios configurados"
}

# Preguntar por configuración
ask_configuration() {
    echo ""
    print_status "Configuración personalizada:"
    echo ""
    
    # Dominio
    read -p "Ingresa tu dominio (ej: midominio.com): " DOMAIN
    if [[ -z "$DOMAIN" ]]; then
        DOMAIN="localhost"
        print_warning "Usando localhost como dominio por defecto"
    fi
    
    # Email para SSL
    if [[ "$DOMAIN" != "localhost" ]]; then
        read -p "Ingresa tu email para certificado SSL: " SSL_EMAIL
    fi
    
    # Configuración SMTP
    read -p "Servidor SMTP (ej: smtp.gmail.com): " SMTP_HOST
    read -p "Usuario SMTP: " SMTP_USER
    read -s -p "Contraseña SMTP: " SMTP_PASSWORD
    echo ""
    
    # Base de datos externa (opcional)
    read -p "¿Tienes una base de datos PostgreSQL externa? (y/n): " HAS_EXTERNAL_DB
    if [[ "$HAS_EXTERNAL_DB" == "y" || "$HAS_EXTERNAL_DB" == "Y" ]]; then
        read -p "URL de la base de datos: " DATABASE_URL
    fi
    
    print_success "Configuración recopilada"
}

# Crear archivo de configuración
create_env_file() {
    print_status "Creando archivo de configuración..."
    
    # Generar secretos aleatorios
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    ENCRYPTION_SECRET=$(openssl rand -base64 32)
    CRON_SECRET=$(openssl rand -base64 16)
    EVOLUTION_KEY=$(openssl rand -base64 24)
    WEBHOOK_TOKEN=$(openssl rand -base64 16)
    
    # Configurar DATABASE_URL si no se proporcionó
    if [[ -z "$DATABASE_URL" ]]; then
        DB_PASSWORD=$(openssl rand -base64 16)
        DATABASE_URL="postgresql://comodin:${DB_PASSWORD}@postgres:5432/comodin_ia"
    fi
    
    # Crear archivo .env
    cat > /opt/comodin-ia/.env << EOF
# Base de datos
DATABASE_URL='${DATABASE_URL}'

# NextAuth
NEXTAUTH_URL=https://${DOMAIN}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}

# Seguridad
ENCRYPTION_SECRET=${ENCRYPTION_SECRET}
CRON_SECRET=cron_${CRON_SECRET}

# SMTP Configuration
SMTP_HOST=${SMTP_HOST:-smtp.gmail.com}
SMTP_PORT=587
SMTP_USER=${SMTP_USER}
SMTP_PASSWORD=${SMTP_PASSWORD}
SMTP_FROM_NAME='COMODÍN IA'
SMTP_FROM_EMAIL=${SMTP_USER}

# Evolution API
EVOLUTION_API_URL=http://evolution-api:8080
EVOLUTION_API_KEY=comodin_${EVOLUTION_KEY}
WHATSAPP_WEBHOOK_VERIFY_TOKEN=webhook_${WEBHOOK_TOKEN}

# APIs Externas (configurar después)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
MERCADO_PAGO_ACCESS_TOKEN=your_mercado_pago_access_token_here
OPENAI_API_KEY=your_openai_api_key_here

# Cloud Storage (AWS S3)
AWS_PROFILE=hosted_storage
AWS_REGION=us-west-2
AWS_BUCKET_NAME=your-bucket-name
AWS_FOLDER_PREFIX=comodin/

# Redis
REDIS_PASSWORD=ComodinRedis2024_${CRON_SECRET}
EOF

    print_success "Archivo de configuración creado"
}

# Instalar certificado SSL
install_ssl() {
    if [[ "$DOMAIN" == "localhost" ]]; then
        print_warning "Saltando instalación de SSL (usando localhost)"
        return
    fi
    
    print_status "Instalando certificado SSL para $DOMAIN..."
    
    # Instalar Certbot
    apt install -y certbot python3-certbot-nginx
    
    # Verificar que el dominio apunte al servidor
    print_warning "Asegúrate de que $DOMAIN apunte a este servidor antes de continuar"
    read -p "¿El dominio ya está configurado? (y/n): " DOMAIN_READY
    
    if [[ "$DOMAIN_READY" == "y" || "$DOMAIN_READY" == "Y" ]]; then
        # Obtener certificado
        certbot certonly --standalone -d "$DOMAIN" -d "www.$DOMAIN" --email "$SSL_EMAIL" --agree-tos --non-interactive
        
        if [[ $? -eq 0 ]]; then
            print_success "Certificado SSL instalado para $DOMAIN"
            
            # Configurar renovación automática
            echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
            print_success "Renovación automática de SSL configurada"
        else
            print_warning "Error al obtener certificado SSL, continuando sin SSL"
        fi
    else
        print_warning "Configurar SSL manualmente después del despliegue"
    fi
}

# Desplegar aplicación
deploy_application() {
    print_status "Descargando y desplegando COMODÍN IA..."
    
    cd /opt/comodin-ia
    
    # Si existe el código fuente, continuar; si no, mostrar instrucciones
    if [[ ! -f "docker-compose.yml" ]]; then
        print_error "Archivos de la aplicación no encontrados"
        echo ""
        print_status "Por favor, sube los archivos de COMODÍN IA a /opt/comodin-ia/"
        echo ""
        echo "Puedes usar uno de estos métodos:"
        echo "1. SCP: scp -r comodin_ia/* root@$IP:/opt/comodin-ia/"
        echo "2. Git: git clone <repo-url> /opt/comodin-ia/"
        echo "3. SFTP con FileZilla o similar"
        echo ""
        print_status "Una vez subidos los archivos, ejecuta: ./install.sh deploy"
        exit 1
    fi
    
    # Dar permisos a scripts
    chmod +x scripts/*.sh 2>/dev/null || true
    
    # Levantar servicios
    print_status "Iniciando servicios..."
    
    # Evolution API primero
    if [[ -f "docker-compose.evolution.yml" ]]; then
        docker compose -f docker-compose.evolution.yml up -d
        sleep 30
        print_success "Evolution API iniciado"
    fi
    
    # Aplicación principal
    docker compose up --build -d
    
    # Verificar servicios
    sleep 15
    if docker ps | grep -q "comodin-ia"; then
        print_success "COMODÍN IA desplegado correctamente"
    else
        print_error "Error en el despliegue"
        print_status "Revisando logs..."
        docker compose logs --tail=20
        exit 1
    fi
}

# Configurar monitoreo básico
setup_monitoring() {
    print_status "Configurando monitoreo básico..."
    
    # Script de monitoreo
    cat > /opt/monitor-comodin.sh << 'EOF'
#!/bin/bash
LOG_FILE="/var/log/comodin-ia/monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] === MONITOREO COMODÍN IA ===" >> $LOG_FILE

# Verificar contenedores
CONTAINERS=$(docker ps --format "{{.Names}}: {{.Status}}" | grep comodin)
echo "[$DATE] Contenedores: $CONTAINERS" >> $LOG_FILE

# Verificar uso de recursos
MEMORY=$(free -h | awk 'NR==2{printf "Memoria: %s/%s (%.2f%%)", $3,$2,$3*100/$2}')
DISK=$(df -h / | awk 'NR==2{printf "Disco: %s/%s (%s usado)", $3,$2,$5}')

echo "[$DATE] $MEMORY" >> $LOG_FILE
echo "[$DATE] $DISK" >> $LOG_FILE

# Verificar servicios web
if curl -sf http://localhost:3000 > /dev/null; then
    echo "[$DATE] ✅ Aplicación web: OK" >> $LOG_FILE
else
    echo "[$DATE] ❌ Aplicación web: ERROR" >> $LOG_FILE
fi

if curl -sf http://localhost:8080 > /dev/null; then
    echo "[$DATE] ✅ Evolution API: OK" >> $LOG_FILE
else
    echo "[$DATE] ❌ Evolution API: ERROR" >> $LOG_FILE
fi

echo "[$DATE] ================================" >> $LOG_FILE
EOF

    chmod +x /opt/monitor-comodin.sh
    
    # Configurar cron para monitoreo cada hora
    (crontab -l 2>/dev/null; echo "0 * * * * /opt/monitor-comodin.sh") | crontab -
    
    print_success "Monitoreo configurado (logs en /var/log/comodin-ia/monitor.log)"
}

# Configurar backups automáticos
setup_backups() {
    print_status "Configurando backups automáticos..."
    
    cat > /opt/backup-comodin.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/var/log/comodin-ia/backup.log"

echo "[$DATE] Iniciando backup..." >> $LOG_FILE

# Crear directorio de backup
mkdir -p $BACKUP_DIR

# Backup de base de datos (si es local)
if docker ps | grep -q postgres; then
    docker exec postgres pg_dumpall -U postgres > $BACKUP_DIR/db_$DATE.sql
    echo "[$DATE] ✅ Backup de base de datos creado" >> $LOG_FILE
fi

# Backup de configuraciones
tar -czf $BACKUP_DIR/config_$DATE.tar.gz /opt/comodin-ia/.env /opt/comodin-ia/docker-compose.yml 2>/dev/null
echo "[$DATE] ✅ Backup de configuración creado" >> $LOG_FILE

# Limpiar backups antiguos (>7 días)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "[$DATE] ✅ Backup completado" >> $LOG_FILE
EOF

    chmod +x /opt/backup-comodin.sh
    
    # Backup diario a las 2 AM
    (crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup-comodin.sh") | crontab -
    
    print_success "Backups automáticos configurados (diarios a las 2:00 AM)"
}

# Mostrar información final
show_final_info() {
    echo ""
    print_success "🎉 ¡INSTALACIÓN COMPLETADA!"
    echo -e "${BLUE}=================================${NC}"
    echo ""
    echo -e "📍 ${GREEN}URLs de acceso:${NC}"
    echo "   • Aplicación web: https://$DOMAIN (o http://$DOMAIN:3000)"
    echo "   • Evolution API: http://$DOMAIN:8080"
    echo ""
    echo -e "📁 ${GREEN}Archivos importantes:${NC}"
    echo "   • Configuración: /opt/comodin-ia/.env"
    echo "   • Logs: /var/log/comodin-ia/"
    echo "   • Backups: /opt/backups/"
    echo ""
    echo -e "🔧 ${GREEN}Comandos útiles:${NC}"
    echo "   • Ver logs: cd /opt/comodin-ia && docker compose logs -f"
    echo "   • Reiniciar: cd /opt/comodin-ia && docker compose restart"
    echo "   • Estado: docker ps"
    echo "   • Monitoreo: tail -f /var/log/comodin-ia/monitor.log"
    echo ""
    echo -e "⚠️  ${YELLOW}Próximos pasos:${NC}"
    echo "   1. Configurar tus APIs en /opt/comodin-ia/.env"
    echo "   2. Conectar WhatsApp en Configuraciones > WhatsApp"
    echo "   3. Configurar SMTP para emails"
    echo "   4. Revisar configuración de dominio/SSL si es necesario"
    echo ""
    echo -e "${GREEN}¡Tu COMODÍN IA está listo para usar! 🚀${NC}"
}

# Función principal
main() {
    # Si se pasa "deploy" como argumento, solo hacer deploy
    if [[ "$1" == "deploy" ]]; then
        deploy_application
        show_final_info
        exit 0
    fi
    
    print_banner
    check_root
    get_system_info
    
    echo ""
    read -p "¿Continuar con la instalación? (y/n): " CONTINUE
    if [[ "$CONTINUE" != "y" && "$CONTINUE" != "Y" ]]; then
        print_status "Instalación cancelada por el usuario"
        exit 0
    fi
    
    update_system
    install_docker
    setup_firewall
    setup_directories
    ask_configuration
    create_env_file
    install_ssl
    deploy_application
    setup_monitoring
    setup_backups
    show_final_info
}

# Manejo de errores
trap 'print_error "Error en línea $LINENO. Código de salida: $?"' ERR

# Ejecutar función principal
main "$@"
