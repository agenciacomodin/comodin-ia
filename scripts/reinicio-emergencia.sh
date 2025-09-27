
#!/bin/bash
# COMODÍN IA - Script de Reinicio de Emergencia
# Uso: ./scripts/reinicio-emergencia.sh

echo "🚨 === COMODÍN IA - REINICIO DE EMERGENCIA === 🚨"
echo ""
echo "ADVERTENCIA: Esta operación causará downtime de aproximadamente 2-3 minutos"
echo "Se detendrán TODOS los servicios y se reiniciarán desde cero."
echo ""
echo "¿Está seguro de continuar? (escriba 'SI CONFIRMO' para proceder)"
read -r response

if [[ "$response" != "SI CONFIRMO" ]]; then
    echo "❌ Operación cancelada por el usuario"
    exit 0
fi

# Log del proceso
LOG_FILE="reinicio_emergencia_$(date +%Y%m%d_%H%M%S).log"
exec 1> >(tee -a "$LOG_FILE")
exec 2>&1

echo ""
echo "🔄 Iniciando reinicio de emergencia: $(date)"
echo "📝 Log guardado en: $LOG_FILE"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ ERROR: Ejecutar desde el directorio raíz del proyecto"
    exit 1
fi

# 1. Pre-check del estado actual
echo "📋 PASO 1/8: Verificando estado actual..."
echo "Contenedores activos antes del reinicio:"
docker-compose ps | grep -c "Up" || echo "0"

# 2. Crear backup de emergencia
echo ""
echo "💾 PASO 2/8: Creando backup de emergencia..."
BACKUP_DIR="./backups/emergencia_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup de configuraciones críticas
tar -czf "$BACKUP_DIR/config_emergencia.tar.gz" .env docker-compose.yml nginx.conf ssl/ 2>/dev/null || echo "⚠️ Warning: Algunas configuraciones no se pudieron respaldar"

# Backup rápido de base de datos (si está disponible)
if docker-compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
    echo "Respaldando base de datos..."
    docker-compose exec -T postgres pg_dump -U postgres comodin_ia | gzip > "$BACKUP_DIR/database_emergencia.sql.gz" 2>/dev/null || echo "⚠️ Warning: No se pudo respaldar la base de datos"
else
    echo "⚠️ PostgreSQL no accesible - omitiendo backup de BD"
fi

echo "✅ Backup de emergencia creado en: $BACKUP_DIR"

# 3. Detener todos los servicios
echo ""
echo "🛑 PASO 3/8: Deteniendo todos los servicios..."
docker-compose down --remove-orphans --timeout 30
if [ $? -eq 0 ]; then
    echo "✅ Servicios detenidos correctamente"
else
    echo "⚠️ Algunos servicios requirieron fuerza para detenerse"
    docker-compose kill
    docker-compose rm -f
fi

# 4. Limpieza de recursos
echo ""
echo "🧹 PASO 4/8: Limpiando recursos del sistema..."
echo "Espacio antes de limpiar:"
df -h / | tail -1

# Limpiar contenedores huérfanos y recursos no usados
docker system prune -f >/dev/null 2>&1
docker network prune -f >/dev/null 2>&1

echo "Espacio después de limpiar:"
df -h / | tail -1

# 5. Verificar recursos del sistema
echo ""
echo "🔍 PASO 5/8: Verificando recursos del sistema..."

# Verificar espacio en disco
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    echo "❌ CRÍTICO: Espacio en disco muy bajo (${DISK_USAGE}%)"
    echo "Liberando espacio adicional..."
    # Limpiar logs de Docker
    truncate -s 0 /var/lib/docker/containers/*/*-json.log 2>/dev/null || true
    docker system df
else
    echo "✅ Espacio en disco: ${DISK_USAGE}% (OK)"
fi

# Verificar memoria
FREE_MEM=$(free -m | awk 'NR==2{printf "%.0f", $7/$2*100}')
echo "💾 Memoria libre: ${FREE_MEM}%"

# 6. Reiniciar servicios críticos primero
echo ""
echo "🚀 PASO 6/8: Iniciando servicios de base de datos..."
docker-compose up -d postgres redis
echo "Esperando a que la base de datos esté lista..."

# Wait loop con timeout
TIMEOUT=60
COUNTER=0
while [ $COUNTER -lt $TIMEOUT ]; do
    if docker-compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
        echo "✅ PostgreSQL listo en $COUNTER segundos"
        break
    fi
    sleep 2
    COUNTER=$((COUNTER + 2))
    echo -n "."
done

if [ $COUNTER -ge $TIMEOUT ]; then
    echo ""
    echo "⚠️ PostgreSQL tardó más de lo esperado en iniciar"
else
    echo ""
fi

# Verificar Redis
if docker-compose exec -T redis redis-cli ping >/dev/null 2>&1; then
    echo "✅ Redis funcionando correctamente"
else
    echo "⚠️ Redis no responde"
fi

# 7. Iniciar servicios de aplicación
echo ""
echo "📱 PASO 7/8: Iniciando servicios de aplicación..."
docker-compose up -d

# Esperar a que todos los servicios estén listos
echo "Esperando a que todos los servicios estén listos..."
sleep 45

# 8. Verificación final
echo ""
echo "✅ PASO 8/8: Verificación final del estado..."

# Verificar estado de contenedores
echo "Estado de contenedores:"
docker-compose ps

# Verificar conectividad básica
echo ""
echo "Pruebas de conectividad:"

# Test de aplicación
DOMAIN=$(grep NEXTAUTH_URL .env 2>/dev/null | cut -d'=' -f2 | sed 's|https://||' | sed 's|http://||' || echo "localhost:3000")
sleep 15  # Dar tiempo adicional para que la app esté lista

if curl -s -I "https://$DOMAIN" 2>/dev/null | head -1 | grep -q "200\|301\|302"; then
    echo "✅ Aplicación principal respondiendo"
else
    echo "⚠️ Aplicación principal no responde aún (puede tardar unos minutos más)"
fi

# Test de API health
if curl -s "https://$DOMAIN/api/health" 2>/dev/null | grep -q "ok"; then
    echo "✅ API de salud OK"
else
    echo "⚠️ API de salud no responde"
fi

# Test de base de datos
if docker-compose exec -T postgres psql -U postgres -d comodin_ia -c "SELECT NOW();" >/dev/null 2>&1; then
    echo "✅ Base de datos accesible"
else
    echo "❌ Base de datos no accesible"
fi

# Resumen final
echo ""
echo "🏁 === RESUMEN DEL REINICIO DE EMERGENCIA ==="
RUNNING_SERVICES=$(docker-compose ps --services --filter status=running | wc -l)
TOTAL_SERVICES=$(docker-compose ps --services | wc -l)

echo "📊 Servicios ejecutándose: $RUNNING_SERVICES/$TOTAL_SERVICES"
echo "⏰ Proceso completado: $(date)"
echo "📋 Log completo guardado en: $LOG_FILE"
echo "💾 Backup de emergencia en: $BACKUP_DIR"

if [ "$RUNNING_SERVICES" -eq "$TOTAL_SERVICES" ]; then
    echo ""
    echo "🟢 REINICIO EXITOSO"
    echo "✅ Todos los servicios están funcionando"
    echo "🌐 Verificar funcionamiento en: https://$DOMAIN"
else
    echo ""
    echo "🟡 REINICIO PARCIAL"
    echo "⚠️ Algunos servicios pueden necesitar tiempo adicional"
    echo "🔍 Ejecutar diagnóstico completo: ./scripts/diagnostico-completo.sh"
fi

echo ""
echo "📝 PRÓXIMOS PASOS RECOMENDADOS:"
echo "1. Verificar que la aplicación funcione correctamente"
echo "2. Revisar logs: docker-compose logs -f"
echo "3. Ejecutar diagnóstico: ./scripts/diagnostico-completo.sh"
echo "4. Monitorear el sistema por las próximas 24 horas"

# Mostrar algunos comandos útiles
echo ""
echo "🛠️ COMANDOS ÚTILES:"
echo "Ver logs en tiempo real: docker-compose logs -f"
echo "Estado de servicios: docker-compose ps"
echo "Reiniciar servicio específico: docker-compose restart [servicio]"

echo ""
echo "=== FIN DEL REINICIO DE EMERGENCIA ==="
