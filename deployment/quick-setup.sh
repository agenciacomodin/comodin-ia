
#!/bin/bash

# Script de configuración rápida para VPS
echo "🚀 COMODÍN IA - Configuración Rápida para VPS"
echo "=============================================="

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar si estamos como root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Este script debe ejecutarse como root${NC}"
    echo "Ejecuta: sudo $0"
    exit 1
fi

echo -e "${YELLOW}📋 Instalando dependencias del sistema...${NC}"

# Actualizar sistema
apt update && apt upgrade -y

# Instalar dependencias básicas
apt install -y curl git wget unzip htop nano

# Instalar Docker
echo -e "${YELLOW}🐳 Instalando Docker...${NC}"
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Instalar Docker Compose
echo -e "${YELLOW}🔧 Instalando Docker Compose...${NC}"
curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verificar instalaciones
echo -e "${YELLOW}✅ Verificando instalaciones...${NC}"
docker --version
docker-compose --version

# Configurar firewall básico (opcional)
echo -e "${YELLOW}🔥 Configurando firewall...${NC}"
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw --force enable

# Crear directorio de trabajo
echo -e "${YELLOW}📁 Creando directorios de trabajo...${NC}"
mkdir -p /opt/comodin-ia
cd /opt/comodin-ia

echo -e "${GREEN}✅ Configuración básica completada${NC}"
echo ""
echo "📋 Siguientes pasos:"
echo "1. Sube los archivos de tu aplicación a /opt/comodin-ia/"
echo "2. Copia las credenciales de producción"
echo "3. Ejecuta ./deploy.sh"
echo ""
echo "🔗 Información del servidor:"
echo "   • IP: $(curl -s http://checkip.amazonaws.com/)"
echo "   • Usuario: root"
echo "   • Directorio: /opt/comodin-ia/"
echo ""
echo -e "${GREEN}¡Sistema listo para el despliegue! 🚀${NC}"
