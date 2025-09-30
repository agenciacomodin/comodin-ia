
#!/bin/bash

# Script de Optimización de Performance - COMODÍN IA
# Optimiza la base de datos y limpia recursos

LOG_FILE="/home/ubuntu/comodin_ia/logs/performance-$(date +%Y%m%d).log"
PROJECT_DIR="/home/ubuntu/comodin_ia"

# Función para logging
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

cd "$PROJECT_DIR" || exit 1

log "=== INICIANDO OPTIMIZACIÓN DE PERFORMANCE ==="

# 1. Optimizar base de datos PostgreSQL
log "1. Optimizando base de datos PostgreSQL..."
docker-compose exec -T postgres psql -U postgres -d comodin_ia -c "
-- Actualizar estadísticas
ANALYZE;

-- Limpiar tabla de logs antiguos (mantener 30 días)
DELETE FROM \"Log\" WHERE \"createdAt\" < NOW() - INTERVAL '30 days';

-- Limpiar sesiones expiradas
DELETE FROM \"Session\" WHERE \"expires\" < NOW();

-- Limpiar tokens expirados
DELETE FROM \"PasswordResetToken\" WHERE \"expires\" < NOW();

-- Optimizar tablas con VACUUM
VACUUM ANALYZE \"User\";
VACUUM ANALYZE \"Message\";
VACUUM ANALYZE \"Payment\";
VACUUM ANALYZE \"AIUsage\";

-- Mostrar estadísticas de tablas grandes
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public' 
AND tablename IN ('User', 'Message', 'Payment', 'AIUsage')
ORDER BY tablename, attname;
"
log "✅ Optimización de base de datos completada"

# 2. Limpiar caché de aplicación
log "2. Limpiando caché de aplicación..."
docker-compose exec -T app rm -rf .next/cache/* 2>/dev/null || true
log "✅ Caché de aplicación limpiado"

# 3. Optimizar imágenes Docker
log "3. Optimizando imágenes Docker..."
docker-compose exec -T app npm cache clean --force 2>/dev/null || true
docker system df
docker system prune -f
log "✅ Optimización de Docker completada"

# 4. Comprimir logs rotativos
log "4. Comprimiendo logs antiguos..."
find ./logs -name "*.log" -mtime +7 -not -name "*$(date +%Y%m%d)*" -exec gzip {} \;
compressed_logs=$(find ./logs -name "*.log.gz" | wc -l)
log "✅ $compressed_logs archivos de log comprimidos"

# 5. Generar reporte de performance
log "5. Generando reporte de performance..."
docker-compose exec -T postgres psql -U postgres -d comodin_ia -c "
SELECT 
    'Total Users' as metric,
    COUNT(*) as value
FROM \"User\"
UNION ALL
SELECT 
    'Active Users (7 days)',
    COUNT(*)
FROM \"User\" 
WHERE \"lastActive\" > NOW() - INTERVAL '7 days'
UNION ALL
SELECT 
    'Total Messages',
    COUNT(*)
FROM \"Message\"
UNION ALL
SELECT 
    'Messages Today',
    COUNT(*)
FROM \"Message\" 
WHERE \"createdAt\" >= CURRENT_DATE
UNION ALL
SELECT 
    'Total Revenue',
    COALESCE(SUM(amount), 0)
FROM \"Payment\" 
WHERE status = 'COMPLETED'
UNION ALL
SELECT 
    'Revenue This Month',
    COALESCE(SUM(amount), 0)
FROM \"Payment\" 
WHERE status = 'COMPLETED' 
AND \"createdAt\" >= DATE_TRUNC('month', CURRENT_DATE);
" >> "$LOG_FILE"

# 6. Verificar índices de base de datos
log "6. Verificando índices de base de datos..."
docker-compose exec -T postgres psql -U postgres -d comodin_ia -c "
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE idx_tup_read > 0 
ORDER BY idx_tup_read DESC
LIMIT 10;
" >> "$LOG_FILE"

log "=== OPTIMIZACIÓN DE PERFORMANCE COMPLETADA ==="

exit 0
