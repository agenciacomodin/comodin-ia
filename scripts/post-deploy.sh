
#!/bin/bash

# =============================================================================
# COMODÍN IA - SCRIPT POST-DEPLOYMENT 
# =============================================================================

set -e

APP_DIR="/srv/comodin_ia"
DOMAIN="crm.comodinia.com"

echo "🔄 EJECUTANDO POST-DEPLOYMENT DE COMODÍN IA..."
echo "=================================================================="

cd $APP_DIR

# PASO 8: Ejecutar migraciones de Supabase
echo "🗄️  PASO 8: Ejecutando migraciones de base de datos..."

# Usar el archivo docker-compose.production.yml
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d

# Esperar que la aplicación esté lista
echo "⏳ Esperando que la aplicación esté lista..."
sleep 30

# Verificar que los contenedores estén corriendo
docker-compose -f docker-compose.production.yml ps

# PASO 9: Ejecutar migraciones
echo "🔄 Ejecutando migraciones de Prisma..."
docker-compose -f docker-compose.production.yml exec app npx prisma generate
docker-compose -f docker-compose.production.yml exec app npx prisma db push
docker-compose -f docker-compose.production.yml exec app npx prisma db seed

# PASO 10: Verificación final
echo "🔍 PASO 10: Verificando deployment..."

# Verificar salud de la aplicación
if curl -f https://$DOMAIN/health > /dev/null 2>&1; then
    echo "✅ Aplicación respondiendo correctamente"
else
    echo "❌ ERROR: La aplicación no responde"
    echo "📋 Logs de la aplicación:"
    docker-compose -f docker-compose.production.yml logs app
    exit 1
fi

# Verificar Evolution API
if curl -f http://localhost:8080/ > /dev/null 2>&1; then
    echo "✅ Evolution API funcionando"
else
    echo "⚠️  ADVERTENCIA: Evolution API no responde (normal en primer arranque)"
fi

# Verificar SSL
if openssl s_client -connect $DOMAIN:443 < /dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
    echo "✅ Certificado SSL válido"
else
    echo "⚠️  ADVERTENCIA: Problemas con certificado SSL"
fi

echo ""
echo "🎉 DEPLOYMENT COMPLETADO EXITOSAMENTE!"
echo "=================================================================="
echo "🌐 URL: https://$DOMAIN"
echo "🔧 Panel de Admin: https://$DOMAIN/admin"
echo "📱 WhatsApp API: https://$DOMAIN/evolution/"
echo ""
echo "📋 Comandos útiles:"
echo "   Ver logs: docker-compose -f docker-compose.production.yml logs -f"
echo "   Reiniciar: docker-compose -f docker-compose.production.yml restart"
echo "   Estado: docker-compose -f docker-compose.production.yml ps"
echo ""
echo "📞 SIGUIENTE PASO: Configurar webhook de Stripe en:"
echo "   https://dashboard.stripe.com/webhooks"
echo "   URL: https://$DOMAIN/api/webhooks/stripe"
echo "=================================================================="

