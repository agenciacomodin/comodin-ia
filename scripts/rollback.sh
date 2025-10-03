
#!/bin/bash

echo "⏪ Iniciando rollback de COMODÍN IA..."

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Directorio del proyecto
PROJECT_DIR="/srv/comodin_ia/comodin_ia/app"
cd $PROJECT_DIR

# Verificar si hay un tag o commit para hacer rollback
if [ -z "$1" ]; then
  echo -e "${RED}❌ Debes especificar un tag o commit${NC}"
  echo "Uso: ./rollback.sh <tag-o-commit>"
  echo "Ejemplo: ./rollback.sh v1.0-production"
  echo ""
  echo "Tags disponibles:"
  git tag -l
  exit 1
fi

TARGET=$1

# Confirmar rollback
echo -e "${YELLOW}⚠️  Vas a hacer rollback a: $TARGET${NC}"
echo -e "${YELLOW}¿Estás seguro? (y/n)${NC}"
read -r response

if [[ ! "$response" =~ ^[Yy]$ ]]; then
  echo "Rollback cancelado"
  exit 0
fi

# Hacer checkout al tag/commit
echo -e "${YELLOW}📥 Haciendo checkout a $TARGET...${NC}"
git checkout $TARGET

# Instalar dependencias
echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
npm install

# Regenerar Prisma
echo -e "${YELLOW}🔄 Regenerando Prisma Client...${NC}"
npx prisma generate

# Build
echo -e "${YELLOW}🏗️  Construyendo aplicación...${NC}"
npm run build

# Reiniciar PM2
echo -e "${YELLOW}🔄 Reiniciando aplicación...${NC}"
pm2 restart comodin-ia

echo -e "${GREEN}✅ Rollback completado a $TARGET${NC}"
pm2 status comodin-ia
