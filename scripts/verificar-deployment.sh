
#!/bin/bash

# =============================================================================
# COMODÍN IA - SCRIPT DE VERIFICACIÓN POST-DEPLOYMENT
# =============================================================================

APP_DIR="/srv/comodin_ia"
DOMAIN="crm.comodinia.com"

echo "🔍 VERIFICANDO DEPLOYMENT DE COMODÍN IA..."
echo "=================================================================="

# Función para verificar status
check_status() {
    if [ $1 -eq 0 ]; then
        echo "✅ $2"
        return 0
    else
        echo "❌ $2"
        return 1
    fi
}

# Verificar si estamos en el directorio correcto
if [ ! -d "$APP_DIR" ]; then
    echo "❌ ERROR: Directorio $APP_DIR no existe"
    exit 1
fi

cd $APP_DIR

echo "📋 VERIFICACIÓN DEL SISTEMA:"
echo "----------------------------"

# 1. Verificar Docker
docker --version > /dev/null 2>&1
check_status $? "Docker instalado"

# 2. Verificar Docker Compose
docker-compose --version > /dev/null 2>&1
check_status $? "Docker Compose instalado"

# 3. Verificar Nginx
systemctl is-active nginx > /dev/null 2>&1
check_status $? "Nginx activo"

# 4. Verificar configuración de Nginx
nginx -t > /dev/null 2>&1
check_status $? "Configuración de Nginx válida"

# 5. Verificar certificado SSL
if openssl s_client -connect $DOMAIN:443 < /dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
    check_status 0 "Certificado SSL válido"
else
    check_status 1 "Certificado SSL inválido"
fi

echo ""
echo "📋 VERIFICACIÓN DE CONTENEDORES:"
echo "--------------------------------"

# 6. Verificar contenedores
if docker-compose -f docker-compose.production.yml ps | grep -q "Up"; then
    check_status 0 "Contenedores ejecutándose"
    docker-compose -f docker-compose.production.yml ps
else
    check_status 1 "Contenedores no están ejecutándose"
    echo "📋 Logs de contenedores:"
    docker-compose -f docker-compose.production.yml logs --tail=20
fi

echo ""
echo "📋 VERIFICACIÓN DE CONECTIVIDAD:"
echo "--------------------------------"

# 7. Verificar aplicación principal
if curl -f -s https://$DOMAIN/health > /dev/null; then
    check_status 0 "Aplicación principal respondiendo"
    echo "   🌐 https://$DOMAIN ✅"
else
    check_status 1 "Aplicación principal no responde"
    echo "   🔍 Verificando puerto 3000..."
    if curl -f -s http://localhost:3000/health > /dev/null; then
        echo "   ⚠️  Aplicación funciona localmente, problema con Nginx/SSL"
    else
        echo "   ❌ Aplicación no funciona localmente"
    fi
fi

# 8. Verificar Evolution API
if curl -f -s http://localhost:8080/ > /dev/null; then
    check_status 0 "Evolution API respondiendo"
else
    check_status 1 "Evolution API no responde (puede ser normal en primer arranque)"
fi

# 9. Verificar base de datos (Supabase)
echo ""
echo "📋 VERIFICACIÓN DE BASE DE DATOS:"
echo "---------------------------------"

if docker-compose -f docker-compose.production.yml exec -T app npx prisma db status > /dev/null 2>&1; then
    check_status 0 "Conexión a Supabase exitosa"
else
    check_status 1 "Problemas con conexión a Supabase"
fi

# 10. Verificar archivos importantes
echo ""
echo "📋 VERIFICACIÓN DE ARCHIVOS:"
echo "----------------------------"

[ -f ".env" ] && check_status 0 "Archivo .env presente" || check_status 1 "Archivo .env faltante"
[ -f "docker-compose.production.yml" ] && check_status 0 "docker-compose.production.yml presente" || check_status 1 "docker-compose.production.yml faltante"
[ -f "/etc/nginx/sites-enabled/comodin-production" ] && check_status 0 "Configuración de Nginx activa" || check_status 1 "Configuración de Nginx no activa"

echo ""
echo "📋 RESUMEN DEL DEPLOYMENT:"
echo "========================="
echo "🌐 URL Principal: https://$DOMAIN"
echo "🔧 Health Check: https://$DOMAIN/health"
echo "📱 WhatsApp API: http://localhost:8080"
echo "📊 Logs: docker-compose -f docker-compose.production.yml logs -f"
echo ""

# Generar reporte final
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
echo "Verificación completada: $TIMESTAMP" > verification_report.txt
echo "Dominio: $DOMAIN" >> verification_report.txt
echo "Estado de la aplicación: $(curl -f -s https://$DOMAIN/health > /dev/null && echo 'OK' || echo 'ERROR')" >> verification_report.txt

echo "📄 Reporte guardado en: verification_report.txt"
echo "=================================================================="

