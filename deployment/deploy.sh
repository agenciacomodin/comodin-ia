
#!/bin/bash

# Script de despliegue para VPS
set -e

echo "🚀 Iniciando despliegue de COMODÍN IA..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con colores
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

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.production.yml" ]; then
    print_error "No se encontró docker-compose.production.yml. Ejecuta desde el directorio deployment/"
    exit 1
fi

# Detener servicios existentes
print_status "Deteniendo servicios existentes..."
docker-compose -f docker-compose.production.yml down || true

# Limpiar imágenes antiguas
print_status "Limpiando imágenes antiguas..."
docker system prune -f

# Construir imágenes
print_status "Construyendo imágenes..."
docker-compose -f docker-compose.production.yml build --no-cache

# Crear directorios necesarios
print_status "Creando directorios necesarios..."
mkdir -p logs/nginx
mkdir -p ssl

# Generar certificados SSL self-signed si no existen
if [ ! -f "ssl/nginx-selfsigned.crt" ]; then
    print_status "Generando certificados SSL self-signed..."
    mkdir -p ssl
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/nginx-selfsigned.key \
        -out ssl/nginx-selfsigned.crt \
        -subj "/C=MX/ST=Mexico/L=Mexico/O=ComodinIA/CN=crm.comodinia.com"
    print_warning "Se generaron certificados self-signed. Para producción, usa certificados SSL válidos."
fi

# Iniciar servicios
print_status "Iniciando servicios..."
docker-compose -f docker-compose.production.yml up -d

# Esperar a que los servicios estén listos
print_status "Esperando a que los servicios estén listos..."
sleep 30

# Verificar que los servicios estén corriendo
print_status "Verificando estado de los servicios..."
docker-compose -f docker-compose.production.yml ps

# Ejecutar migraciones de base de datos
print_status "Ejecutando migraciones de base de datos..."
docker-compose -f docker-compose.production.yml exec app npx prisma migrate deploy || print_warning "Las migraciones fallaron, continúa manualmente"

# Generar cliente de Prisma
print_status "Generando cliente de Prisma..."
docker-compose -f docker-compose.production.yml exec app npx prisma generate

# Verificar que la aplicación responde
print_status "Verificando que la aplicación responde..."
sleep 10
if curl -f -s http://localhost/health > /dev/null; then
    print_success "✅ Aplicación responde correctamente en http://localhost"
else
    print_warning "⚠️ La aplicación podría no estar respondiendo correctamente"
fi

# Mostrar logs en tiempo real por unos segundos
print_status "Mostrando logs de la aplicación..."
timeout 10 docker-compose -f docker-compose.production.yml logs -f app || true

print_success "🎉 ¡Despliegue completado!"
echo ""
echo "📋 Resumen del despliegue:"
echo "   • Aplicación: http://localhost (redirige a HTTPS)"
echo "   • HTTPS: https://localhost (certificado self-signed)"
echo "   • Salud: http://localhost/health"
echo ""
echo "🔧 Comandos útiles:"
echo "   • Ver logs: docker-compose -f docker-compose.production.yml logs -f"
echo "   • Reiniciar: docker-compose -f docker-compose.production.yml restart"
echo "   • Detener: docker-compose -f docker-compose.production.yml down"
echo "   • Estado: docker-compose -f docker-compose.production.yml ps"
echo ""
echo "⚠️ Notas importantes:"
echo "   • Configura certificados SSL reales para producción"
echo "   • Configura tu dominio para apuntar a este servidor"
echo "   • Revisa los logs regularmente"
echo "   • Haz backup de la base de datos regularmente"

print_success "¡COMODÍN IA está listo para producción! 🚀"
