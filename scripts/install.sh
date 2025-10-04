
#!/bin/bash

# COMODÍN IA - Script de Instalación Automática
# Para VPS con Ubuntu/Debian

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Banner
echo -e "${PURPLE}"
cat << "EOF"
   ____   ___  __  __   ___   ____  ___ _   _       ___    _    
  / ___| / _ \|  \/  | / _ \ |  _ \|_ _| \ | |     |_ _|  / \   
 | |    | | | | |\/| || | | || | | | ||  \| |      | |  / _ \  
 | |___ | |_| | |  | || |_| || |_| | || |\  |      | | / ___ \ 
  \____| \___/|_|  |_| \___/ |____/___|_| \_|     |___/_/   \_\
                                                               
EOF
echo -e "${NC}"
echo -e "${BLUE}=== Instalador Automático de COMODÍN IA ===${NC}"
echo ""

# Verificar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Este script debe ejecutarse como root${NC}"
    echo "Ejecuta: sudo $0"
    exit 1
fi

# Función para imprimir status
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

# Detectar sistema operativo
print_status "Detectando sistema operativo..."
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
    print_success "Sistema detectado: $OS"
else
    print_error "No se pudo detectar el sistema operativo"
    exit 1
fi

# Actualizar sistema
print_status "Actualizando sistema..."
apt update && apt upgrade -y

# Instalar dependencias básicas
print_status "Instalando dependencias básicas..."
apt install -y curl git wget unzip htop nano software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Instalar Docker
print_status "Instalando Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io
    systemctl enable docker
    systemctl start docker
    print_success "Docker instalado exitosamente"
else
    print_success "Docker ya está instalado"
fi

# Instalar Docker Compose
print_status "Instalando Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose instalado exitosamente"
else
    print_success "Docker Compose ya está instalado"
fi

# Instalar Node.js 18
print_status "Instalando Node.js 18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    print_success "Node.js instalado exitosamente"
else
    print_success "Node.js ya está instalado"
fi

# Instalar Yarn
print_status "Instalando Yarn..."
if ! command -v yarn &> /dev/null; then
    npm install -g yarn
    print_success "Yarn instalado exitosamente"
else
    print_success "Yarn ya está instalado"
fi

# Instalar PM2
print_status "Instalando PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    print_success "PM2 instalado exitosamente"
else
    print_success "PM2 ya está instalado"
fi

# Instalar Nginx
print_status "Instalando Nginx..."
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl enable nginx
    systemctl start nginx
    print_success "Nginx instalado exitosamente"
else
    print_success "Nginx ya está instalado"
fi

# Configurar firewall
print_status "Configurando firewall..."
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 3000/tcp  # Next.js (temporal)
ufw --force enable
print_success "Firewall configurado"

# Crear directorio de trabajo
WORK_DIR="/opt/comodin-ia"
print_status "Creando directorio de trabajo en $WORK_DIR..."
mkdir -p $WORK_DIR
cd $WORK_DIR

# Clonar repositorio (esto necesitarás ajustarlo con tu repo real)
print_status "Descargando COMODÍN IA..."
print_warning "NOTA: Asegúrate de tener el código de la aplicación disponible"

# Solicitar información de configuración
echo ""
echo -e "${YELLOW}=== CONFIGURACIÓN DE CREDENCIALES ===${NC}"
echo ""

# Database URL
read -p "Database URL de Supabase: " DATABASE_URL
read -p "Supabase URL: " SUPABASE_URL
read -p "Supabase Anon Key: " SUPABASE_ANON_KEY

# Domain
read -p "Dominio de la aplicación (ej: crm.comodinia.com): " DOMAIN

# OpenAI
read -p "OpenAI API Key: " OPENAI_API_KEY

# Stripe
read -p "Stripe Secret Key: " STRIPE_SECRET_KEY
read -p "Stripe Publishable Key: " STRIPE_PUBLISHABLE_KEY

# MercadoPago
read -p "MercadoPago Access Token: " MERCADO_PAGO_ACCESS_TOKEN
read -p "MercadoPago Public Key: " MERCADO_PAGO_PUBLIC_KEY

# Google OAuth
read -p "Google Client ID: " GOOGLE_CLIENT_ID
read -p "Google Client Secret: " GOOGLE_CLIENT_SECRET

# Email
read -p "SMTP User (email): " SMTP_USER
read -p "SMTP Password (Gmail App Password): " SMTP_PASSWORD

# Generar secretos
NEXTAUTH_SECRET=$(openssl rand -base64 32)
ENCRYPTION_SECRET=$(openssl rand -hex 32)

# Crear archivo de configuración
print_status "Creando archivo de configuración..."
cat > .env.production << EOF
# COMODÍN IA - Configuración de Producción
# Generado automáticamente el $(date)

# Base de datos
DATABASE_URL=$DATABASE_URL
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# Seguridad
NEXTAUTH_URL=https://$DOMAIN
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENCRYPTION_SECRET=$ENCRYPTION_SECRET

# APIs de IA
OPENAI_API_KEY=$OPENAI_API_KEY

# Pagos
STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY
MERCADO_PAGO_ACCESS_TOKEN=$MERCADO_PAGO_ACCESS_TOKEN
MERCADO_PAGO_PUBLIC_KEY=$MERCADO_PAGO_PUBLIC_KEY

# OAuth
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=$SMTP_USER
SMTP_PASSWORD=$SMTP_PASSWORD
SMTP_FROM_NAME=COMODÍN IA
SMTP_FROM_EMAIL=$SMTP_USER

# WhatsApp
WHATSAPP_WEBHOOK_VERIFY_TOKEN=comodin_whatsapp_webhook_2024

# Ambiente
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
EOF

print_success "Archivo de configuración creado"

# Configurar Nginx
print_status "Configurando Nginx para $DOMAIN..."
cat > /etc/nginx/sites-available/comodin-ia << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    # Redirigir a HTTPS (después de configurar SSL)
    # return 301 https://\$server_name\$request_uri;
    
    # Temporal: permitir HTTP para pruebas
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # API con rate limiting
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Activar sitio
ln -sf /etc/nginx/sites-available/comodin-ia /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

print_success "Nginx configurado para $DOMAIN"

# Crear script de instalación de la aplicación
print_status "Creando script para instalar la aplicación..."
cat > install-app.sh << 'EOF'
#!/bin/bash

# Este script debe ejecutarse después de subir el código de la aplicación

if [ ! -d "app" ]; then
    echo "Error: No se encuentra el directorio 'app' con el código de la aplicación"
    echo "Por favor, sube el código usando:"
    echo "  scp -r tu-app-local/ root@tu-servidor:/opt/comodin-ia/app/"
    exit 1
fi

cd app

# Instalar dependencias
echo "Instalando dependencias..."
yarn install

# Copiar configuración
cp ../.env.production .env

# Configurar base de datos
echo "Configurando base de datos..."
npx prisma generate
npx prisma migrate deploy

# Build de producción
echo "Compilando aplicación..."
yarn build

# Iniciar con PM2
echo "Iniciando aplicación..."
pm2 delete comodin-ia 2>/dev/null || true
pm2 start yarn --name "comodin-ia" -- start
pm2 save
pm2 startup

echo "¡Aplicación iniciada con PM2!"
echo "Verificar con: pm2 status"
echo "Ver logs con: pm2 logs comodin-ia"
EOF

chmod +x install-app.sh

# Instalar Certbot para SSL
print_status "Instalando Certbot para SSL..."
apt install -y certbot python3-certbot-nginx

# Crear script de configuración SSL
cat > setup-ssl.sh << EOF
#!/bin/bash

echo "Configurando SSL para $DOMAIN..."
certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN

# Configurar renovación automática
systemctl enable certbot.timer
systemctl start certbot.timer

echo "SSL configurado exitosamente para $DOMAIN"
EOF

chmod +x setup-ssl.sh

# Crear script de backup
cat > backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup de la aplicación
tar -czf $BACKUP_DIR/comodin-ia-$DATE.tar.gz /opt/comodin-ia --exclude="node_modules" --exclude=".next"

# Limpiar backups antiguos (mantener solo los últimos 7)
find $BACKUP_DIR -name "comodin-ia-*.tar.gz" -mtime +7 -delete

echo "Backup creado: comodin-ia-$DATE.tar.gz"
EOF

chmod +x backup.sh

# Configurar cron para backups
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/comodin-ia/backup.sh") | crontab -

# Verificar instalaciones
print_status "Verificando instalaciones..."
echo "✓ Docker: $(docker --version)"
echo "✓ Docker Compose: $(docker-compose --version)"
echo "✓ Node.js: $(node --version)"
echo "✓ Yarn: $(yarn --version)"
echo "✓ PM2: $(pm2 --version)"
echo "✓ Nginx: $(nginx -v 2>&1)"

# Resumen final
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}       INSTALACIÓN COMPLETADA EXITOSAMENTE      ${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "${YELLOW}📋 SIGUIENTES PASOS:${NC}"
echo ""
echo "1. 📁 Subir el código de la aplicación:"
echo "   scp -r tu-aplicacion-local/ root@tu-servidor:/opt/comodin-ia/app/"
echo ""
echo "2. 🚀 Instalar y ejecutar la aplicación:"
echo "   cd /opt/comodin-ia && ./install-app.sh"
echo ""
echo "3. 🔒 Configurar SSL (después de que el DNS esté configurado):"
echo "   ./setup-ssl.sh"
echo ""
echo "4. 🌍 Configurar DNS:"
echo "   Tipo: A"
echo "   Nombre: crm (o www)"
echo "   Valor: $(curl -s http://checkip.amazonaws.com/)"
echo ""
echo -e "${BLUE}📝 INFORMACIÓN DEL SERVIDOR:${NC}"
echo "   • IP: $(curl -s http://checkip.amazonaws.com/)"
echo "   • Dominio configurado: $DOMAIN"
echo "   • Directorio de trabajo: /opt/comodin-ia"
echo "   • Usuario: root"
echo ""
echo -e "${BLUE}🛠️ COMANDOS ÚTILES:${NC}"
echo "   • Ver estado: pm2 status"
echo "   • Ver logs: pm2 logs comodin-ia"
echo "   • Reiniciar: pm2 restart comodin-ia"
echo "   • Backup manual: /opt/comodin-ia/backup.sh"
echo ""
echo -e "${GREEN}¡Tu servidor está listo para COMODÍN IA! 🎉${NC}"

exit 0
