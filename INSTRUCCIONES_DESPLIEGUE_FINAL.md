
# 🚀 INSTRUCCIONES DE DESPLIEGUE FINAL - COMODÍN IA

## 📋 PASOS PARA COMPLETAR EL DESPLIEGUE

### 1️⃣ TRANSFERIR ARCHIVOS AL SERVIDOR

Desde tu computadora local, transfiere TODA la carpeta `comodin_ia` al servidor:

```bash
# Opción A: Usar SCP (recomendado)
scp -r /ruta/a/comodin_ia root@31.97.175.147:/srv/

# Opción B: Usar rsync (más eficiente)
rsync -avz -e ssh /ruta/a/comodin_ia/ root@31.97.175.147:/srv/comodin_ia/

# Contraseña del servidor: Komodin1223456?
```

### 2️⃣ CONECTARSE AL SERVIDOR Y EJECUTAR DEPLOYMENT

```bash
# Conectarse al servidor
ssh root@31.97.175.147
# Contraseña: Komodin1223456?

# Ir al directorio de la aplicación
cd /srv/comodin_ia

# Dar permisos de ejecución a los scripts
chmod +x scripts/*.sh

# Ejecutar deployment completo
./scripts/deploy-production.sh
```

### 3️⃣ INICIAR LA APLICACIÓN

```bash
# Ejecutar post-deployment
./scripts/post-deploy.sh

# Verificar que todo funcione
./scripts/verificar-deployment.sh
```

### 4️⃣ VERIFICACIÓN FINAL

1. **Abrir en navegador**: https://crm.comodinia.com
2. **Verificar Health Check**: https://crm.comodinia.com/health
3. **Evolution API**: https://crm.comodinia.com/evolution/

## 🔧 ARCHIVOS PREPARADOS

- ✅ `production.env` - Variables de entorno de producción
- ✅ `docker-compose.production.yml` - Configuración Docker
- ✅ `nginx.production.conf` - Configuración Nginx con SSL
- ✅ `scripts/deploy-production.sh` - Script principal
- ✅ `scripts/post-deploy.sh` - Post-despliegue
- ✅ `scripts/verificar-deployment.sh` - Verificación

## 🎯 RESULTADO ESPERADO

Al finalizar exitosamente:
- ✅ Aplicación funcionando en https://crm.comodinia.com
- ✅ SSL configurado automáticamente
- ✅ Base de datos Supabase conectada
- ✅ WhatsApp API (Evolution) operativa
- ✅ Sistema de pagos (Stripe/MercadoPago) configurado
- ✅ Todas las credenciales de producción aplicadas

## 🚨 SOLUCIÓN DE PROBLEMAS

Si algo falla:
1. Revisar logs: `docker-compose -f docker-compose.production.yml logs -f`
2. Reiniciar servicios: `docker-compose -f docker-compose.production.yml restart`
3. Verificar SSL: `certbot certificates`
4. Verificar Nginx: `nginx -t && systemctl status nginx`

## 📞 CONFIRMACIÓN FINAL

Una vez completado, la aplicación estará 100% funcional en producción con todas las características del CRM COMODÍN IA operativas.
