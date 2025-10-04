
#!/bin/bash

# Script para preparar la aplicación para producción
set -e

echo "🔧 Preparando aplicación para producción..."

# Ir al directorio de la aplicación
cd ../app

# Backup del next.config.js original
if [ -f "next.config.js" ]; then
    cp next.config.js next.config.js.backup
fi

# Crear next.config.js optimizado para producción
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs']
  },
  images: {
    domains: ['localhost', 'via.placeholder.com', 'ovpcxvotqfmiqqrdmloi.supabase.co'],
  },
  // Configuración para producción
  poweredByHeader: false,
  generateEtags: false,
  compress: true,
  // Configuración de redirects
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/dashboard',
        permanent: true,
      },
    ]
  },
  // Configuración de headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
EOF

echo "✅ next.config.js actualizado para producción"

# Limpiar dependencias y reinstalar
echo "🧹 Limpiando dependencias..."
rm -rf node_modules
rm -rf .next

echo "📦 Instalando dependencias..."
yarn install --frozen-lockfile

echo "🗃️ Generando cliente Prisma..."
npx prisma generate

echo "🏗️ Construyendo aplicación..."
yarn build

echo "✅ Aplicación preparada para producción!"
EOF

chmod +x prepare-build.sh
