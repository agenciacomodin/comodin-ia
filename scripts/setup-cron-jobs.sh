
#!/bin/bash

# Script para configurar trabajos cron automáticos para COMODÍN IA
# Ejecutar como: sudo ./setup-cron-jobs.sh

PROJECT_DIR="/home/ubuntu/comodin_ia"
CRON_FILE="/tmp/comodin_cron"

echo "🔧 Configurando trabajos cron para COMODÍN IA..."

# Crear archivo temporal con trabajos cron
cat > "$CRON_FILE" << EOF
# COMODÍN IA - Trabajos de Mantenimiento Automatizados
# Generado automáticamente el $(date)

# Mantenimiento diario a las 3:00 AM
0 3 * * * $PROJECT_DIR/scripts/maintenance-daily.sh >> $PROJECT_DIR/logs/cron.log 2>&1

# Optimización de performance los domingos a las 2:00 AM
0 2 * * 0 $PROJECT_DIR/scripts/performance-optimizer.sh >> $PROJECT_DIR/logs/cron.log 2>&1

# Backup completo todos los días a las 1:00 AM
0 1 * * * $PROJECT_DIR/scripts/backup-completo.sh >> $PROJECT_DIR/logs/cron.log 2>&1

# Verificación de SSL cada lunes a las 6:00 AM
0 6 * * 1 /usr/bin/certbot renew --quiet --no-self-upgrade

# Limpieza de logs cada día a las 4:00 AM
0 4 * * * find $PROJECT_DIR/logs -name "*.log" -mtime +30 -delete

# Reinicio de servicios Docker si es necesario (cada 6 horas)
0 */6 * * * docker system prune -f > /dev/null 2>&1

# Monitoreo de espacio en disco cada hora
0 * * * * df / | awk 'NR==2 {if (\$5 > 85) print "⚠️ Espacio en disco: " \$5}' | mail -s "Alerta Espacio" admin@comodinia.com 2>/dev/null

# Verificación de contenedores cada 30 minutos
*/30 * * * * cd $PROJECT_DIR && docker-compose ps | grep -v "Up" | grep -q "comodin" && echo "🚨 Contenedor caído" | mail -s "Alerta Sistema" admin@comodinia.com 2>/dev/null

EOF

# Instalar trabajos cron
crontab "$CRON_FILE"

# Limpiar archivo temporal
rm "$CRON_FILE"

# Dar permisos de ejecución a todos los scripts
chmod +x "$PROJECT_DIR/scripts/"*.sh

# Crear directorio de logs si no existe
mkdir -p "$PROJECT_DIR/logs"

echo "✅ Trabajos cron configurados exitosamente"
echo ""
echo "📋 Trabajos programados:"
echo "  • Mantenimiento diario: 3:00 AM"
echo "  • Optimización: Domingos 2:00 AM"
echo "  • Backup completo: 1:00 AM diario"
echo "  • Renovación SSL: Lunes 6:00 AM"
echo "  • Limpieza logs: 4:00 AM diario"
echo "  • Monitoreo espacio: cada hora"
echo "  • Verificación contenedores: cada 30 min"
echo ""
echo "📁 Logs en: $PROJECT_DIR/logs/"
echo ""
echo "Para ver trabajos cron actuales: crontab -l"
echo "Para editar trabajos cron: crontab -e"
echo ""
echo "🚀 ¡Sistema de mantenimiento automatizado listo!"
