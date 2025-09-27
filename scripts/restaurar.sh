
#!/bin/bash
# COMODÍN IA - Script de Restauración
# Uso: ./scripts/restaurar.sh /ruta/a/backup.tar.gz

BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
    echo "❌ ERROR: Debe especificar el archivo de backup"
    echo "Uso: $0 /ruta/a/backup.tar.gz"
    echo ""
    echo "Backups disponibles:"
    ls -la ./backups/*.tar.gz 2>/dev/null || echo "No hay backups disponibles"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ ERROR: Archivo de backup no existe: $BACKUP_FILE"
    exit 1
fi

echo "🔄 === COMODÍN IA - RESTAURACIÓN DESDE BACKUP ==="
echo "📁 Archivo de backup: $BACKUP_FILE"
echo "📅 Fecha: $(date)"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ ERROR: Ejecutar desde el directorio raíz del proyecto"
    exit 1
fi

# Confirmación de seguridad
echo "⚠️  ADVERTENCIA: Esta operación reemplazará completamente:"
echo "   - Toda la base de datos actual"
echo "   - Todas las configuraciones"
echo "   - Todos los certificados SSL"
echo "   - Todos los volúmenes Docker"
echo ""
echo "🚨 ASEGÚRESE DE HABER HECHO UN BACKUP ACTUAL ANTES DE CONTINUAR"
echo ""
echo "¿Está COMPLETAMENTE seguro de proceder? (escriba 'SI RESTAURAR' para continuar)"
read -r response

if [[ "$response" != "SI RESTAURAR" ]]; then
    echo "❌ Operación cancelada por el usuario"
    exit 0
fi

# Log del proceso
LOG_FILE="restauracion_$(date +%Y%m%d_%H%M%S).log"
exec 1> >(tee -a "$LOG_FILE")
exec 2>&1

echo ""
echo "🚀 Iniciando proceso de restauración..."
echo "📝 Log guardado en: $LOG_FILE"
echo ""

# 1. Crear backup de seguridad del estado actual
echo "💾 PASO 1/10: Creando backup de seguridad del estado actual..."
SAFETY_BACKUP="./backups/pre_restore_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$SAFETY_BACKUP"

# Backup rápido de configuraciones actuales
cp .env "$SAFETY_BACKUP/" 2>/dev/null || echo "⚠️ No se pudo respaldar .env"
cp docker-compose.yml "$SAFETY_BACKUP/" 2>/dev/null || echo "⚠️ No se pudo respaldar docker-compose.yml"

# Backup rápido de BD actual
if docker-compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
    docker-compose exec -T postgres pg_dump -U postgres comodin_ia | gzip > "$SAFETY_BACKUP/current_db.sql.gz"
    echo "✅ Estado actual respaldado en: $SAFETY_BACKUP"
else
    echo "⚠️ No se pudo respaldar la BD actual (servicio no disponible)"
fi

# 2. Extraer el archivo de backup
echo ""
echo "📦 PASO 2/10: Extrayendo archivo de backup..."
TEMP_EXTRACT="/tmp/comodin_restore_$(date +%s)"
mkdir -p "$TEMP_EXTRACT"

if [[ "$BACKUP_FILE" == *.tar.gz ]]; then
    tar -xzf "$BACKUP_FILE" -C "$TEMP_EXTRACT"
elif [[ "$BACKUP_FILE" == *.zip ]]; then
    unzip -q "$BACKUP_FILE" -d "$TEMP_EXTRACT"
else
    echo "❌ ERROR: Formato de backup no soportado. Use .tar.gz o .zip"
    exit 1
fi

# Encontrar el directorio extraído
BACKUP_DIR=$(find "$TEMP_EXTRACT" -maxdepth 2 -type d -name "*backup*" | head -1)
if [ -z "$BACKUP_DIR" ]; then
    # Buscar cualquier directorio con archivos de configuración
    BACKUP_DIR=$(find "$TEMP_EXTRACT" -name "docker-compose.yml" -exec dirname {} \; | head -1)
fi

if [ -z "$BACKUP_DIR" ]; then
    echo "❌ ERROR: No se encontró estructura de backup válida"
    exit 1
fi

echo "✅ Backup extraído en: $BACKUP_DIR"

# 3. Detener servicios actuales
echo ""
echo "🛑 PASO 3/10: Deteniendo servicios actuales..."
docker-compose down --remove-orphans --timeout 30
if [ $? -ne 0 ]; then
    echo "⚠️ Algunos servicios requirieron fuerza para detenerse"
    docker-compose kill
    docker-compose rm -f
fi
echo "✅ Servicios detenidos"

# 4. Restaurar configuraciones
echo ""
echo "⚙️ PASO 4/10: Restaurando configuraciones..."

CONFIG_DIR="$BACKUP_DIR/config"
if [ -d "$CONFIG_DIR" ]; then
    # Restaurar archivos de configuración principales
    [ -f "$CONFIG_DIR/.env" ] && cp "$CONFIG_DIR/.env" . && echo "✓ .env restaurado"
    [ -f "$CONFIG_DIR/docker-compose.yml" ] && cp "$CONFIG_DIR/docker-compose.yml" . && echo "✓ docker-compose.yml restaurado"
    [ -f "$CONFIG_DIR/nginx.conf" ] && cp "$CONFIG_DIR/nginx.conf" . && echo "✓ nginx.conf restaurado"
    
    # Restaurar SSL
    if [ -d "$CONFIG_DIR/ssl" ]; then
        rm -rf ssl
        cp -r "$CONFIG_DIR/ssl" .
        chmod 600 ssl/*
        echo "✓ Certificados SSL restaurados"
    fi
    
    # Restaurar scripts
    if [ -d "$CONFIG_DIR/scripts" ]; then
        rm -rf scripts
        cp -r "$CONFIG_DIR/scripts" .
        chmod +x scripts/*.sh
        echo "✓ Scripts restaurados"
    fi
    
    echo "✅ Configuraciones restauradas"
else
    echo "❌ ERROR: No se encontraron configuraciones en el backup"
    exit 1
fi

# 5. Limpiar volúmenes existentes
echo ""
echo "🗑️ PASO 5/10: Limpiando volúmenes existentes..."
VOLUMES=$(docker volume ls -q | grep "^comodin_ia_")
for volume in $VOLUMES; do
    docker volume rm "$volume" 2>/dev/null && echo "✓ Eliminado $volume" || echo "⚠️ No se pudo eliminar $volume"
done

# 6. Restaurar volúmenes Docker
echo ""
echo "🐳 PASO 6/10: Restaurando volúmenes Docker..."

# Buscar archivos de volúmenes
VOLUME_FILES=$(find "$BACKUP_DIR" -name "volume_*.tar.gz")
for volume_file in $VOLUME_FILES; do
    volume_name=$(basename "$volume_file" | sed 's/^volume_//' | sed 's/\.tar\.gz$//')
    
    echo "Restaurando volumen: $volume_name"
    
    # Crear el volumen
    docker volume create "$volume_name"
    
    # Restaurar contenido
    docker run --rm \
        -v "${volume_name}:/data" \
        -v "$(dirname "$volume_file"):/backup" \
        ubuntu:20.04 \
        tar -xzf "/backup/$(basename "$volume_file")" -C /data
    
    if [ $? -eq 0 ]; then
        echo "✓ $volume_name restaurado"
    else
        echo "⚠️ Error restaurando $volume_name"
    fi
done

echo "✅ Volúmenes Docker restaurados"

# 7. Iniciar servicios de base de datos
echo ""
echo "🗄️ PASO 7/10: Iniciando servicios de base de datos..."
docker-compose up -d postgres redis

# Esperar a que PostgreSQL esté listo
echo "Esperando a que PostgreSQL esté disponible..."
COUNTER=0
while [ $COUNTER -lt 60 ]; do
    if docker-compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
        echo "✅ PostgreSQL listo"
        break
    fi
    sleep 2
    COUNTER=$((COUNTER + 2))
    echo -n "."
done

if [ $COUNTER -ge 60 ]; then
    echo ""
    echo "❌ PostgreSQL no respondió en tiempo esperado"
    exit 1
fi

# 8. Restaurar base de datos
echo ""
echo "💽 PASO 8/10: Restaurando base de datos..."

# Buscar archivo de base de datos
DB_FILE="$BACKUP_DIR/database_full.sql.gz"
if [ ! -f "$DB_FILE" ]; then
    DB_FILE="$BACKUP_DIR/database.sql.gz"
fi

if [ -f "$DB_FILE" ]; then
    echo "Restaurando desde: $(basename "$DB_FILE")"
    
    # Restaurar base de datos
    gunzip -c "$DB_FILE" | docker-compose exec -T postgres psql -U postgres -d postgres
    
    if [ $? -eq 0 ]; then
        echo "✅ Base de datos restaurada exitosamente"
        
        # Verificar datos
        USER_COUNT=$(docker-compose exec -T postgres psql -U postgres -d comodin_ia -c "SELECT count(*) FROM \"User\";" 2>/dev/null | grep -E '^\s*[0-9]+' | tr -d ' ')
        ORG_COUNT=$(docker-compose exec -T postgres psql -U postgres -d comodin_ia -c "SELECT count(*) FROM \"Organization\";" 2>/dev/null | grep -E '^\s*[0-9]+' | tr -d ' ')
        
        echo "✓ Usuarios restaurados: $USER_COUNT"
        echo "✓ Organizaciones restauradas: $ORG_COUNT"
    else
        echo "❌ Error al restaurar base de datos"
        exit 1
    fi
else
    echo "❌ ERROR: No se encontró archivo de base de datos"
    exit 1
fi

# 9. Restaurar Redis (si existe)
echo ""
echo "📦 PASO 9/10: Restaurando cache Redis..."

REDIS_FILE="$BACKUP_DIR/redis_dump.rdb.gz"
if [ -f "$REDIS_FILE" ]; then
    # Detener Redis temporalmente
    docker-compose stop redis
    
    # Restaurar datos
    gunzip -c "$REDIS_FILE" | docker run --rm -i \
        -v comodin_ia_redis_data:/data \
        redis:7-alpine \
        sh -c 'cat > /data/dump.rdb'
    
    # Reiniciar Redis
    docker-compose start redis
    
    if docker-compose exec -T redis redis-cli ping >/dev/null 2>&1; then
        echo "✅ Redis restaurado y funcionando"
    else
        echo "⚠️ Redis restaurado pero no responde"
    fi
else
    echo "⚠️ No se encontró backup de Redis"
fi

# 10. Iniciar todos los servicios
echo ""
echo "🚀 PASO 10/10: Iniciando todos los servicios..."
docker-compose up -d

# Esperar a que todos los servicios estén listos
echo "Esperando a que todos los servicios estén disponibles..."
sleep 60

# Verificación final
echo ""
echo "✅ VERIFICACIÓN FINAL"

# Estado de contenedores
echo "Estado de servicios:"
docker-compose ps

# Test de conectividad
DOMAIN=$(grep NEXTAUTH_URL .env 2>/dev/null | cut -d'=' -f2 | sed 's|https://||' | sed 's|http://||' || echo "localhost:3000")

echo ""
echo "Pruebas de conectividad:"
if curl -s -I "https://$DOMAIN" 2>/dev/null | head -1 | grep -q "200\|301\|302"; then
    echo "✅ Aplicación principal respondiendo"
else
    echo "⚠️ Aplicación no responde (puede necesitar más tiempo)"
fi

if curl -s "https://$DOMAIN/api/health" 2>/dev/null | grep -q "ok"; then
    echo "✅ API de salud OK"
else
    echo "⚠️ API de salud no responde"
fi

# Limpiar archivos temporales
rm -rf "$TEMP_EXTRACT"

# Resumen final
echo ""
echo "🏁 === RESTAURACIÓN COMPLETADA ==="
echo "📅 Fecha: $(date)"
echo "⏱️ Duración: $SECONDS segundos"
echo "📁 Backup de seguridad guardado en: $SAFETY_BACKUP"
echo "📋 Log completo: $LOG_FILE"

echo ""
echo "🟢 RESTAURACIÓN EXITOSA"
echo "✅ Sistema restaurado desde backup"
echo "🌐 Verificar funcionamiento en: https://$DOMAIN"

echo ""
echo "📝 PRÓXIMOS PASOS RECOMENDADOS:"
echo "1. Verificar que todas las funcionalidades trabajen correctamente"
echo "2. Revisar logs: docker-compose logs -f"
echo "3. Ejecutar diagnóstico: ./scripts/diagnostico-completo.sh"
echo "4. Realizar nuevo backup una vez verificado el funcionamiento"

echo ""
echo "=== FIN DE LA RESTAURACIÓN ==="
