
#!/bin/bash
# COMODÍN IA - Script de Diagnóstico Completo
# Uso: ./scripts/diagnostico-completo.sh

echo "=== COMODÍN IA - DIAGNÓSTICO COMPLETO ==="
echo "Fecha: $(date)"
echo "Servidor: $(hostname -f)"
echo "Usuario: $(whoami)"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    echo "ERROR: Ejecutar desde el directorio raíz del proyecto"
    exit 1
fi

# 1. Estado de contenedores
echo "=== ESTADO DE CONTENEDORES ==="
docker-compose ps
echo ""

# 2. Uso de recursos
echo "=== USO DE RECURSOS ==="
echo "CPU y Memoria por contenedor:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
echo ""
echo "Espacio en disco:"
df -h | grep -E '^(/dev|tmpfs)'
echo ""
echo "Memoria del sistema:"
free -h
echo ""

# 3. Pruebas de conectividad
echo "=== PRUEBAS DE CONECTIVIDAD ==="

# Obtener dominio del .env
DOMAIN=$(grep NEXTAUTH_URL .env 2>/dev/null | cut -d'=' -f2 | sed 's|https://||' | sed 's|http://||')
if [ -z "$DOMAIN" ]; then
    DOMAIN="localhost:3000"
    echo "No se encontró NEXTAUTH_URL, usando localhost:3000"
fi

echo "Dominio configurado: $DOMAIN"
echo ""

echo "Test 1 - Aplicación principal:"
if curl -s -I "https://$DOMAIN" 2>/dev/null | head -1; then
    echo "✅ Aplicación responde"
else
    echo "❌ Error conectando a aplicación principal"
fi

echo "Test 2 - API de salud:"
HEALTH_RESPONSE=$(curl -s "https://$DOMAIN/api/health" 2>/dev/null)
if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
    echo "✅ API de salud OK"
else
    echo "❌ API de salud no responde: $HEALTH_RESPONSE"
fi

echo "Test 3 - Evolution API:"
if curl -s "https://$DOMAIN/evolution/" 2>/dev/null | head -1 | grep -q "200\|404"; then
    echo "✅ Evolution API accesible"
else
    echo "❌ Error conectando a Evolution API"
fi
echo ""

# 4. Estado de base de datos
echo "=== ESTADO DE BASE DE DATOS ==="
echo "Conexión a PostgreSQL:"
if docker-compose exec -T postgres psql -U postgres -d comodin_ia -c "SELECT NOW();" >/dev/null 2>&1; then
    echo "✅ PostgreSQL conectado"
    
    # Contar registros principales
    USERS=$(docker-compose exec -T postgres psql -U postgres -d comodin_ia -c "SELECT count(*) FROM \"User\";" 2>/dev/null | grep -E '^\s*[0-9]+' | tr -d ' ')
    ORGS=$(docker-compose exec -T postgres psql -U postgres -d comodin_ia -c "SELECT count(*) FROM \"Organization\";" 2>/dev/null | grep -E '^\s*[0-9]+' | tr -d ' ')
    MESSAGES=$(docker-compose exec -T postgres psql -U postgres -d comodin_ia -c "SELECT count(*) FROM \"Message\";" 2>/dev/null | grep -E '^\s*[0-9]+' | tr -d ' ')
    
    echo "   - Usuarios: $USERS"
    echo "   - Organizaciones: $ORGS"
    echo "   - Mensajes: $MESSAGES"
else
    echo "❌ Error conectando a PostgreSQL"
fi

echo "Conexión a Redis:"
if docker-compose exec -T redis redis-cli ping >/dev/null 2>&1; then
    echo "✅ Redis conectado"
    REDIS_KEYS=$(docker-compose exec -T redis redis-cli dbsize 2>/dev/null)
    echo "   - Claves en cache: $REDIS_KEYS"
else
    echo "❌ Error conectando a Redis"
fi
echo ""

# 5. Verificación SSL
echo "=== CERTIFICADO SSL ==="
if [ -f "./ssl/fullchain.pem" ]; then
    SSL_INFO=$(openssl x509 -in ./ssl/fullchain.pem -noout -subject -dates 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo "✅ Certificado SSL encontrado"
        echo "$SSL_INFO" | grep "Not After" | sed 's/notAfter=/   - Expira: /'
    else
        echo "❌ Certificado SSL corrupto"
    fi
else
    echo "⚠️  No se encontró certificado SSL"
fi
echo ""

# 6. Logs de errores recientes
echo "=== ERRORES RECIENTES (últimos 5) ==="
echo "Aplicación principal:"
ERROR_COUNT=$(docker-compose logs --tail=100 app 2>/dev/null | grep -i error | wc -l)
if [ "$ERROR_COUNT" -gt 0 ]; then
    docker-compose logs --tail=100 app 2>/dev/null | grep -i error | tail -3 | sed 's/^/   /'
    echo "   Total errores en logs: $ERROR_COUNT"
else
    echo "   ✅ Sin errores recientes"
fi

echo "Evolution API:"
EV_ERROR_COUNT=$(docker-compose logs --tail=100 evolution-api 2>/dev/null | grep -i error | wc -l)
if [ "$EV_ERROR_COUNT" -gt 0 ]; then
    docker-compose logs --tail=100 evolution-api 2>/dev/null | grep -i error | tail -3 | sed 's/^/   /'
    echo "   Total errores: $EV_ERROR_COUNT"
else
    echo "   ✅ Sin errores recientes"
fi
echo ""

# 7. Variables de entorno críticas
echo "=== CONFIGURACIÓN CRÍTICA ==="
echo "✓ Verificando variables de entorno..."

if grep -q "NEXTAUTH_URL=" .env; then
    echo "   ✅ NEXTAUTH_URL configurado"
else
    echo "   ❌ NEXTAUTH_URL faltante"
fi

if grep -q "DATABASE_URL=" .env; then
    echo "   ✅ DATABASE_URL configurado"
else
    echo "   ❌ DATABASE_URL faltante"
fi

if grep -q "STRIPE_SECRET_KEY=" .env; then
    echo "   ✅ Stripe configurado"
else
    echo "   ⚠️  Stripe no configurado"
fi

if grep -q "MERCADO_PAGO_ACCESS_TOKEN=" .env; then
    echo "   ✅ MercadoPago configurado"
else
    echo "   ⚠️  MercadoPago no configurado"
fi

if grep -q "ABACUSAI_API_KEY=" .env; then
    echo "   ✅ IA (AbacusAI) configurado"
else
    echo "   ⚠️  IA no configurado"
fi

if grep -q "EVOLUTION_API_KEY=" .env; then
    echo "   ✅ Evolution API configurado"
else
    echo "   ❌ Evolution API faltante"
fi
echo ""

# 8. Espacio y backups
echo "=== BACKUPS Y ALMACENAMIENTO ==="
if [ -d "./backups" ]; then
    BACKUP_COUNT=$(ls -1 ./backups/*.gz 2>/dev/null | wc -l)
    if [ "$BACKUP_COUNT" -gt 0 ]; then
        echo "✅ Directorio de backups: $BACKUP_COUNT archivos"
        LATEST_BACKUP=$(ls -t ./backups/*.gz 2>/dev/null | head -1)
        if [ -n "$LATEST_BACKUP" ]; then
            BACKUP_DATE=$(stat -c %y "$LATEST_BACKUP" | cut -d' ' -f1)
            echo "   - Último backup: $BACKUP_DATE"
        fi
    else
        echo "⚠️  Sin backups disponibles"
    fi
else
    echo "❌ Directorio de backups no existe"
fi

# Verificar espacio crítico
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 85 ]; then
    echo "❌ Espacio en disco crítico: ${DISK_USAGE}%"
elif [ "$DISK_USAGE" -gt 70 ]; then
    echo "⚠️  Espacio en disco alto: ${DISK_USAGE}%"
else
    echo "✅ Espacio en disco OK: ${DISK_USAGE}%"
fi
echo ""

# 9. Resumen final
echo "=== RESUMEN DEL DIAGNÓSTICO ==="
TOTAL_ERRORS=$((ERROR_COUNT + EV_ERROR_COUNT))
RUNNING_CONTAINERS=$(docker-compose ps --services --filter status=running | wc -l)
TOTAL_CONTAINERS=$(docker-compose ps --services | wc -l)

if [ "$TOTAL_ERRORS" -eq 0 ] && [ "$RUNNING_CONTAINERS" -eq "$TOTAL_CONTAINERS" ]; then
    echo "🟢 ESTADO GENERAL: SALUDABLE"
    echo "   - Todos los servicios funcionando"
    echo "   - Sin errores críticos"
    echo "   - Conectividad OK"
elif [ "$TOTAL_ERRORS" -lt 10 ] && [ "$RUNNING_CONTAINERS" -gt $((TOTAL_CONTAINERS / 2)) ]; then
    echo "🟡 ESTADO GENERAL: ATENCIÓN REQUERIDA"
    echo "   - La mayoría de servicios funcionan"
    echo "   - Algunos errores menores detectados"
    echo "   - Revisar logs para detalles"
else
    echo "🔴 ESTADO GENERAL: CRÍTICO"
    echo "   - Múltiples servicios con problemas"
    echo "   - Intervención inmediata requerida"
    echo "   - Considerar reinicio de emergencia"
fi

echo ""
echo "Diagnóstico completado: $(date)"
echo "Archivo de log generado: diagnóstico_$(date +%Y%m%d_%H%M%S).log"
