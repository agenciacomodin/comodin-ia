
#!/bin/bash
# COMODÍN IA - Script de Backup Completo
# Uso: ./scripts/backup-completo.sh [opcional: descripcion]

DESCRIPTION=${1:-"backup_manual"}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/${TIMESTAMP}_${DESCRIPTION}"

echo "💾 === COMODÍN IA - BACKUP COMPLETO ==="
echo "📅 Fecha: $(date)"
echo "📁 Directorio de destino: $BACKUP_DIR"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ ERROR: Ejecutar desde el directorio raíz del proyecto"
    exit 1
fi

# Crear directorio de backup
mkdir -p "$BACKUP_DIR"
if [ $? -ne 0 ]; then
    echo "❌ ERROR: No se pudo crear directorio de backup"
    exit 1
fi

LOG_FILE="$BACKUP_DIR/backup.log"
exec 1> >(tee -a "$LOG_FILE")
exec 2>&1

echo "🚀 Iniciando proceso de backup completo..."
echo ""

# 1. Información del sistema
echo "📋 PASO 1/7: Recopilando información del sistema..."
{
    echo "=== INFORMACIÓN DEL BACKUP ==="
    echo "Fecha: $(date)"
    echo "Usuario: $(whoami)"
    echo "Servidor: $(hostname -f)"
    echo "Directorio: $(pwd)"
    echo ""
    echo "=== ESTADO DE SERVICIOS ==="
    docker-compose ps
    echo ""
    echo "=== USO DE RECURSOS ==="
    free -h
    df -h
} > "$BACKUP_DIR/system_info.txt"
echo "✅ Información del sistema guardada"

# 2. Backup de la base de datos PostgreSQL
echo ""
echo "🗄️ PASO 2/7: Respaldando base de datos PostgreSQL..."
if docker-compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
    echo "Creando dump de la base de datos..."
    
    # Schema y datos
    docker-compose exec -T postgres pg_dump -U postgres \
        --verbose --clean --if-exists --create \
        comodin_ia | gzip > "$BACKUP_DIR/database_full.sql.gz"
    
    if [ $? -eq 0 ]; then
        # Solo datos (para restore rápido)
        docker-compose exec -T postgres pg_dump -U postgres \
            --data-only --inserts \
            comodin_ia | gzip > "$BACKUP_DIR/database_data_only.sql.gz"
        
        # Solo schema
        docker-compose exec -T postgres pg_dump -U postgres \
            --schema-only \
            comodin_ia | gzip > "$BACKUP_DIR/database_schema_only.sql.gz"
        
        # Estadísticas de la BD
        docker-compose exec -T postgres psql -U postgres -d comodin_ia -c "
        SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del, n_live_tup, n_dead_tup
        FROM pg_stat_user_tables
        ORDER BY n_live_tup DESC;
        " > "$BACKUP_DIR/database_stats.txt"
        
        echo "✅ Base de datos respaldada exitosamente"
    else
        echo "❌ Error al respaldar base de datos"
    fi
else
    echo "❌ PostgreSQL no está disponible - omitiendo backup de BD"
fi

# 3. Backup de Redis
echo ""
echo "📦 PASO 3/7: Respaldando cache Redis..."
if docker-compose exec -T redis redis-cli ping >/dev/null 2>&1; then
    # Crear snapshot manual
    docker-compose exec -T redis redis-cli BGSAVE >/dev/null 2>&1
    sleep 5
    
    # Exportar datos en formato RDB
    docker-compose exec -T redis redis-cli --rdb - | gzip > "$BACKUP_DIR/redis_dump.rdb.gz"
    
    # Información de Redis
    docker-compose exec -T redis redis-cli INFO > "$BACKUP_DIR/redis_info.txt"
    docker-compose exec -T redis redis-cli CONFIG GET '*' > "$BACKUP_DIR/redis_config.txt"
    
    echo "✅ Redis respaldado exitosamente"
else
    echo "❌ Redis no está disponible - omitiendo backup de cache"
fi

# 4. Backup de archivos de configuración
echo ""
echo "⚙️ PASO 4/7: Respaldando configuraciones..."

# Archivos de configuración principales
CONFIG_FILES=(.env docker-compose.yml nginx.conf)
mkdir -p "$BACKUP_DIR/config"

for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$BACKUP_DIR/config/"
        echo "✓ $file"
    else
        echo "⚠️ $file no encontrado"
    fi
done

# SSL certificates
if [ -d "ssl" ]; then
    cp -r ssl "$BACKUP_DIR/config/"
    echo "✓ Certificados SSL"
else
    echo "⚠️ Directorio SSL no encontrado"
fi

# Scripts
if [ -d "scripts" ]; then
    cp -r scripts "$BACKUP_DIR/config/"
    echo "✓ Scripts de utilidad"
fi

# Documentación
DOC_FILES=(DEPLOYMENT_GUIDE.md TROUBLESHOOTING_GUIDE.md README.md)
for doc in "${DOC_FILES[@]}"; do
    if [ -f "$doc" ]; then
        cp "$doc" "$BACKUP_DIR/config/"
        echo "✓ $doc"
    fi
done

echo "✅ Configuraciones respaldadas"

# 5. Backup de volúmenes Docker
echo ""
echo "🐳 PASO 5/7: Respaldando volúmenes Docker..."

# Obtener lista de volúmenes del proyecto
VOLUMES=$(docker-compose config --volumes 2>/dev/null | grep "^comodin_ia_")

for volume in $VOLUMES; do
    echo "Respaldando volumen: $volume"
    
    # Crear backup del volumen usando contenedor temporal
    docker run --rm \
        -v "${volume}:/data" \
        -v "$(pwd)/$BACKUP_DIR:/backup" \
        ubuntu:20.04 \
        tar -czf "/backup/volume_${volume}.tar.gz" -C /data . 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✓ $volume"
    else
        echo "⚠️ Error respaldando $volume"
    fi
done

echo "✅ Volúmenes Docker respaldados"

# 6. Backup de logs recientes
echo ""
echo "📄 PASO 6/7: Respaldando logs del sistema..."

mkdir -p "$BACKUP_DIR/logs"

# Logs de Docker Compose
for service in app postgres redis evolution-api nginx; do
    if docker-compose ps "$service" >/dev/null 2>&1; then
        docker-compose logs --tail=1000 "$service" > "$BACKUP_DIR/logs/${service}.log" 2>/dev/null
        echo "✓ Logs de $service"
    fi
done

# Logs del sistema (si existen)
if [ -d "logs" ]; then
    find logs -name "*.log" -mtime -7 -exec cp {} "$BACKUP_DIR/logs/" \; 2>/dev/null
    echo "✓ Logs de aplicación"
fi

echo "✅ Logs respaldados"

# 7. Verificación e integridad
echo ""
echo "🔍 PASO 7/7: Verificando integridad del backup..."

# Verificar que los archivos críticos existan
CRITICAL_FILES=(
    "$BACKUP_DIR/database_full.sql.gz"
    "$BACKUP_DIR/config/.env"
    "$BACKUP_DIR/config/docker-compose.yml"
    "$BACKUP_DIR/system_info.txt"
)

ALL_GOOD=true
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
        if [ "$SIZE" -gt 0 ]; then
            echo "✓ $(basename "$file") - ${SIZE} bytes"
        else
            echo "❌ $(basename "$file") - archivo vacío"
            ALL_GOOD=false
        fi
    else
        echo "❌ $(basename "$file") - no encontrado"
        ALL_GOOD=false
    fi
done

# Calcular tamaño total del backup
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo ""
echo "📊 Tamaño total del backup: $TOTAL_SIZE"

# Comprimir todo el backup
echo ""
echo "🗜️ Comprimiendo backup completo..."
cd ./backups
tar -czf "${TIMESTAMP}_${DESCRIPTION}.tar.gz" "${TIMESTAMP}_${DESCRIPTION}/"

if [ $? -eq 0 ]; then
    COMPRESSED_SIZE=$(du -sh "${TIMESTAMP}_${DESCRIPTION}.tar.gz" | cut -f1)
    echo "✅ Backup comprimido: ${COMPRESSED_SIZE}"
    
    # Opcional: eliminar directorio sin comprimir para ahorrar espacio
    echo "¿Eliminar directorio sin comprimir para ahorrar espacio? (y/N)"
    read -t 10 -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        rm -rf "${TIMESTAMP}_${DESCRIPTION}/"
        echo "✅ Directorio temporal eliminado"
    fi
else
    echo "❌ Error al comprimir backup"
    ALL_GOOD=false
fi

cd ..

# Resumen final
echo ""
echo "🏁 === RESUMEN DEL BACKUP ==="
echo "📅 Fecha y hora: $(date)"
echo "📁 Ubicación: ./backups/${TIMESTAMP}_${DESCRIPTION}.tar.gz"
echo "📊 Tamaño: $COMPRESSED_SIZE"
echo "⏱️ Duración: $SECONDS segundos"

if [ "$ALL_GOOD" = true ]; then
    echo "🟢 BACKUP COMPLETADO EXITOSAMENTE"
    echo ""
    echo "✅ El backup incluye:"
    echo "   - Base de datos completa (PostgreSQL)"
    echo "   - Cache y sesiones (Redis)"
    echo "   - Configuraciones del sistema"
    echo "   - Certificados SSL"
    echo "   - Volúmenes Docker"
    echo "   - Logs recientes"
    echo ""
    echo "📝 Para restaurar este backup:"
    echo "   ./scripts/restaurar.sh ./backups/${TIMESTAMP}_${DESCRIPTION}.tar.gz"
else
    echo "🟡 BACKUP COMPLETADO CON ADVERTENCIAS"
    echo "⚠️ Algunos componentes no se pudieron respaldar completamente"
    echo "📋 Revisar el log para más detalles: $LOG_FILE"
fi

echo ""
echo "🔄 Próximo backup automático programado según configuración de cron"
echo "💡 Para backups regulares, configurar este script en crontab"

# Limpiar backups antiguos (mantener últimos 10)
echo ""
echo "🧹 Limpiando backups antiguos..."
cd ./backups
ls -t *.tar.gz 2>/dev/null | tail -n +11 | xargs -r rm -f
REMAINING=$(ls -1 *.tar.gz 2>/dev/null | wc -l)
echo "📦 Backups mantenidos: $REMAINING"

echo ""
echo "=== FIN DEL BACKUP COMPLETO ==="
