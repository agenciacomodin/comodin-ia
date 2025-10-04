
# 🚀 DESPLIEGUE DE COMODÍN IA - GUÍA PASO A PASO

## 📋 RESUMEN RÁPIDO

### Opción 1: Instalación Automática (RECOMENDADA)
```bash
# En tu servidor VPS:
wget https://raw.githubusercontent.com/tu-usuario/comodin-ia/main/install.sh
chmod +x install.sh
sudo ./install.sh
```

### Opción 2: Instalación Manual
Ver [GUIA_DESPLIEGUE_COMPLETA.md](./GUIA_DESPLIEGUE_COMPLETA.md) para instrucciones detalladas.

---

## 🎯 MÉTODOS DE TRANSFERENCIA DE ARCHIVOS

### Método 1: SCP (Recomendado para principiantes)
```bash
# Comprimir el proyecto en tu computadora local
cd /home/ubuntu
tar -czf comodin_ia.tar.gz comodin_ia/

# Subir al servidor
scp comodin_ia.tar.gz root@TU_IP_SERVIDOR:/opt/

# En el servidor, extraer
ssh root@TU_IP_SERVIDOR
cd /opt
tar -xzf comodin_ia.tar.gz
mv comodin_ia comodin-ia
```

### Método 2: GitHub
```bash
# 1. Crear repositorio en GitHub
# 2. Subir archivos desde tu computadora local:
cd /home/ubuntu/comodin_ia
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/comodin-ia.git
git push -u origin main

# 3. En el servidor:
cd /opt
git clone https://github.com/tu-usuario/comodin-ia.git comodin-ia
```

### Método 3: SFTP (FileZilla, WinSCP)
```
Host: TU_IP_SERVIDOR
Usuario: root
Puerto: 22
Protocolo: SFTP

Subir carpeta completa a: /opt/comodin-ia/
```

---

## ⚡ DESPLIEGUE RÁPIDO PARA EXPERTOS

```bash
# 1. Preparar servidor
sudo apt update && apt upgrade -y
sudo apt install -y docker.io docker-compose-plugin

# 2. Subir archivos (elegir método)
scp -r comodin_ia/ root@servidor:/opt/comodin-ia/

# 3. Configurar
cd /opt/comodin-ia
cp production.env .env
nano .env  # Actualizar NEXTAUTH_URL, SMTP, APIs

# 4. Desplegar
sudo docker compose -f docker-compose.evolution.yml up -d
sleep 30
sudo docker compose up --build -d

# 5. Verificar
sudo docker ps
curl http://localhost:3000
```

---

## 🔧 CONFIGURACIÓN MÍNIMA REQUERIDA

### Variables de Entorno Obligatorias
```env
# Cambiar OBLIGATORIAMENTE
NEXTAUTH_URL=https://tu-dominio.com
NEXTAUTH_SECRET=secreto-super-seguro-aqui

# SMTP (para emails)
SMTP_HOST=smtp.gmail.com
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password

# WhatsApp Evolution API
EVOLUTION_API_URL=http://evolution-api:8080
EVOLUTION_API_KEY=clave-super-secreta
```

### APIs Opcionales (configurar después)
```env
# Pagos
STRIPE_SECRET_KEY=sk_live_...
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-...

# IA
OPENAI_API_KEY=sk-...

# Google
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## 🌐 CONFIGURACIÓN DE DOMINIO

### En tu Registrador de Dominio:
```dns
Tipo    Nombre    Valor
A       @         TU_IP_SERVIDOR
A       www       TU_IP_SERVIDOR
A       api       TU_IP_SERVIDOR
```

### SSL Automático (Let's Encrypt):
```bash
# En el servidor:
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

---

## 📞 RESPUESTAS A TUS PREGUNTAS

### ❓ "¿Puedo abrir otro chat DevOps para conectar a mi servidor?"
**Sí, absolutamente.** Puedes:

1. **Abrir nuevo chat con rol DevOps** - Te ayudará a:
   - Conectarse remotamente a tu VPS
   - Configurar automáticamente todo el despliegue
   - Resolver problemas técnicos en tiempo real

2. **O seguir esta guía** si prefieres hacerlo tú mismo

### ❓ "¿Cómo funciona GitHub y cómo cargar archivos?"
**GitHub es opcional pero recomendado:**

**SIN GitHub (Más Simple):**
```bash
# Comprimir y subir directamente
tar -czf proyecto.tar.gz comodin_ia/
scp proyecto.tar.gz root@servidor:/opt/
```

**CON GitHub (Profesional):**
```bash
# 1. Crear repositorio en github.com
# 2. Subir código:
git init
git add .
git commit -m "Deploy COMODIN IA"
git push origin main

# 3. En servidor:
git clone https://github.com/tu-usuario/repo.git
```

### ❓ "¿Evolution API vs WhatsApp Business API oficial?"
**Evolution API es MEJOR porque:**
- ✅ Código QR simple y rápido
- ✅ No necesita verificación de Meta
- ✅ Configuración en 5 minutos
- ✅ Funciona inmediatamente
- ✅ Soporte completo para multimedia

**WhatsApp Business API oficial:**
- ❌ Proceso de verificación largo (semanas)
- ❌ Requiere aprobación de Meta
- ❌ Más complejo de configurar
- ❌ Costos adicionales

---

## 🚨 SOLUCIÓN DE PROBLEMAS COMUNES

### Error: "Puerto 3000 en uso"
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
sudo docker compose up -d
```

### Error: "Evolution API no conecta"
```bash
sudo docker logs evolution-api -f
curl http://localhost:8080
```

### Error: "No se puede acceder desde internet"
```bash
# Verificar firewall
sudo ufw status
sudo ufw allow 80
sudo ufw allow 443
```

### WhatsApp no conecta
1. Verificar que Evolution API esté funcionando: `curl http://localhost:8080`
2. Comprobar logs: `sudo docker logs evolution-api -f`
3. Reintentar conexión desde el panel web

---

## 📊 VERIFICACIÓN POST-DESPLIEGUE

### ✅ Checklist de Verificación:
- [ ] Aplicación accesible en `https://tu-dominio.com`
- [ ] Evolution API responde en `http://servidor:8080`
- [ ] Base de datos conectada (no errores en logs)
- [ ] WhatsApp conectado (código QR escaneado)
- [ ] Emails funcionando (verificar SMTP)
- [ ] SSL certificado instalado
- [ ] Backups automáticos configurados

### 📈 Comandos de Monitoreo:
```bash
# Estado de contenedores
sudo docker ps

# Logs en tiempo real
sudo docker compose logs -f

# Uso de recursos
sudo docker stats

# Verificar puertos
sudo netstat -tlnp | grep -E ':(80|443|3000|8080)'
```

---

## 🎉 PRÓXIMOS PASOS DESPUÉS DEL DESPLIEGUE

1. **Configurar APIs de pago** (Stripe, MercadoPago)
2. **Conectar WhatsApp Business** (Panel > Configuraciones > WhatsApp)
3. **Configurar SMTP** para envío de emails
4. **Subir documentos** para IA resolutiva
5. **Crear usuarios y organizaciones**
6. **Configurar seguimientos automáticos**

---

**¿Necesitas ayuda? Abre un chat DevOps para asistencia técnica personalizada! 🚀**
