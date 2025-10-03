
#!/bin/bash

echo "🚀 Iniciando deployment de COMODÍN IA..."

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Directorio del proyecto
PROJECT_DIR="/srv/comodin_ia/comodin_ia/app"
cd $PROJECT_DIR

# 1. Pull de cambios
echo -e "${YELLOW}📥 Descargando cambios desde GitHub...${NC}"
git pull origin main

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Error al hacer pull desde GitHub${NC}"
  exit 1
fi

# 2. Instalar dependencias
echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
npm install

# 3. Regenerar Prisma Client
echo -e "${YELLOW}🔄 Regenerando Prisma Client...${NC}"
npx prisma generate

# 4. Ejecutar migraciones
echo -e "${YELLOW}🗄️  Ejecutando migraciones de base de datos...${NC}"
npx prisma migrate deploy

# 5. Build
echo -e "${YELLOW}🏗️  Construyendo aplicación...${NC}"
npm run build

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Error en el build${NC}"
  exit 1
fi

# 6. Reiniciar PM2
echo -e "${YELLOW}🔄 Reiniciando aplicación con PM2...${NC}"
pm2 restart comodin-ia

# 7. Verificar estado
echo -e "${YELLOW}✅ Verificando estado...${NC}"
pm2 status comodin-ia

echo -e "${GREEN}✅ Deployment completado exitosamente!${NC}"
echo -e "${GREEN}🌐 Aplicación disponible en: http://89.116.73.62${NC}"
