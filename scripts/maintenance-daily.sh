
#!/bin/bash

# Script de Mantenimiento Diario - COMODÍN IA
# Se ejecuta cada día a las 3:00 AM via cron

LOG_FILE="/home/ubuntu/comodin_ia/logs/maintenance-$(date +%Y%m%d).log"
PROJECT_DIR="/home/ubuntu/comodin_ia"

# Función para logging
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Función para enviar notificaciones
send_notification() {
    local message="$1"
    local priority="$2"
    
    # Enviar email (si está configurado)
    if [ -n "$ADMIN_EMAIL" ]; then
        echo "$message" | mail -s "COMODÍN IA - Mantenimiento Diario" "$ADMIN_EMAIL"
    fi
    
    # Webhook a Slack/Discord (si está configurado)
    if [ -n "$WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🔧 COMODÍN IA Mantenimiento: $message\"}" \
            "$WEBHOOK_URL" 2>/dev/null
    fi
}

cd "$PROJECT_DIR" || exit 1

log "=== INICIANDO MANTENIMIENTO DIARIO ==="

# 1. Verificar estado de contenedores
log "1. Verificando estado de contenedores..."
containers_down=$(docker-compose ps | grep -v "Up" | wc -l)
if [ "$containers_down" -gt 1 ]; then
    log "⚠️  ALERTA: $containers_down contenedores no están funcionando"
    send_notification "Contenedores no funcionando: $containers_down" "high"
    
    # Intentar reiniciar contenedores problemáticos
    log "Intentando reiniciar contenedores..."
    docker-compose restart
    sleep 30
    
    # Verificar nuevamente
    containers_down_after=$(docker-compose ps | grep -v "Up" | wc -l)
    if [ "$containers_down_after" -gt 1 ]; then
        send_notification "⚠️ CRÍTICO: No se pudieron reiniciar todos los contenedores" "critical"
    else
        log "✅ Contenedores reiniciados exitosamente"
    fi
else
    log "✅ Todos los contenedores están funcionando correctamente"
fi

# 2. Limpiar logs antiguos
log "2. Limpiando logs antiguos..."
find ./logs -name "*.log" -mtime +30 -delete
logs_deleted=$(find ./logs -name "*.log" -mtime +30 2>/dev/null | wc -l)
log "✅ Eliminados $logs_deleted archivos de log antiguos"

# 3. Limpiar imágenes Docker no utilizadas
log "3. Limpiando imágenes Docker no utilizadas..."
docker image prune -f > /dev/null 2>&1
docker container prune -f > /dev/null 2>&1
log "✅ Limpieza de Docker completada"

# 4. Verificar uso de disco
log "4. Verificando uso de disco..."
disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$disk_usage" -gt 80 ]; then
    log "⚠️  ALERTA: Uso de disco alto: ${disk_usage}%"
    send_notification "Uso de disco alto: ${disk_usage}%" "medium"
elif [ "$disk_usage" -gt 90 ]; then
    log "🚨 CRÍTICO: Uso de disco crítico: ${disk_usage}%"
    send_notification "🚨 CRÍTICO: Uso de disco crítico: ${disk_usage}%" "critical"
else
    log "✅ Uso de disco normal: ${disk_usage}%"
fi

# 5. Verificar memoria RAM
log "5. Verificando uso de memoria..."
mem_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ "$mem_usage" -gt 85 ]; then
    log "⚠️  ALERTA: Uso de memoria alto: ${mem_usage}%"
    send_notification "Uso de memoria alto: ${mem_usage}%" "medium"
else
    log "✅ Uso de memoria normal: ${mem_usage}%"
fi

# 6. Verificar base de datos
log "6. Verificando conexión a base de datos..."
if docker-compose exec -T app npx prisma db pull > /dev/null 2>&1; then
    log "✅ Conexión a base de datos exitosa"
else
    log "🚨 ERROR: No se puede conectar a la base de datos"
    send_notification "🚨 ERROR: Conexión a base de datos fallida" "critical"
fi

# 7. Verificar certificados SSL
log "7. Verificando certificados SSL..."
if [ -f "./ssl/fullchain.pem" ]; then
    cert_expiry=$(openssl x509 -in ./ssl/fullchain.pem -noout -enddate | cut -d= -f2)
    cert_expiry_timestamp=$(date -d "$cert_expiry" +%s)
    current_timestamp=$(date +%s)
    days_until_expiry=$(( (cert_expiry_timestamp - current_timestamp) / 86400 ))
    
    if [ "$days_until_expiry" -lt 30 ]; then
        log "⚠️  ALERTA: Certificado SSL expira en $days_until_expiry días"
        send_notification "Certificado SSL expira en $days_until_expiry días" "high"
    else
        log "✅ Certificado SSL válido por $days_until_expiry días"
    fi
else
    log "⚠️  ADVERTENCIA: No se encontró certificado SSL"
fi

# 8. Backup de configuraciones críticas
log "8. Realizando backup de configuraciones..."
backup_date=$(date +%Y%m%d)
tar -czf "./backups/config-backup-${backup_date}.tar.gz" \
    .env docker-compose.yml nginx.conf ssl/ 2>/dev/null
log "✅ Backup de configuraciones completado"

# 9. Verificar servicios externos críticos
log "9. Verificando servicios externos..."

# Evolution API
if curl -s "${EVOLUTION_API_URL}/manager/instances" > /dev/null 2>&1; then
    log "✅ Evolution API (WhatsApp) funcionando"
else
    log "⚠️  ALERTA: Evolution API no responde"
    send_notification "Evolution API no responde" "medium"
fi

# Verificar conectividad a internet
if ping -c 1 google.com > /dev/null 2>&1; then
    log "✅ Conectividad a internet OK"
else
    log "🚨 ERROR: Sin conectividad a internet"
    send_notification "🚨 ERROR: Sin conectividad a internet" "critical"
fi

# 10. Generar reporte de métricas diarias
log "10. Generando métricas del día..."
docker-compose exec -T app node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function dailyReport() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const [users, messages, payments] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
      prisma.message.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
      prisma.payment.count({ where: { createdAt: { gte: today, lt: tomorrow }, status: 'COMPLETED' } })
    ]);
    
    console.log(\`Nuevos usuarios: \${users}\`);
    console.log(\`Mensajes enviados: \${messages}\`);
    console.log(\`Pagos completados: \${payments}\`);
  } catch (error) {
    console.error('Error generando reporte:', error.message);
  } finally {
    await prisma.\$disconnect();
  }
}

dailyReport();
" >> "$LOG_FILE" 2>&1

log "=== MANTENIMIENTO DIARIO COMPLETADO ==="

# Enviar resumen del mantenimiento
errors_count=$(grep -c "ERROR\|🚨" "$LOG_FILE" || echo "0")
warnings_count=$(grep -c "ALERTA\|⚠️" "$LOG_FILE" || echo "0")

if [ "$errors_count" -gt 0 ]; then
    send_notification "Mantenimiento completado con $errors_count errores y $warnings_count advertencias. Ver log: $LOG_FILE" "high"
elif [ "$warnings_count" -gt 0 ]; then
    send_notification "Mantenimiento completado con $warnings_count advertencias. Ver log: $LOG_FILE" "medium"
else
    send_notification "Mantenimiento completado exitosamente sin problemas" "low"
fi

exit 0
