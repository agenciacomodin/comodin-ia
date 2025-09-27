
# =============================================================================
# DOCKERFILE - COMODÍN IA PRODUCTION
# =============================================================================

# Usar Node.js 18 Alpine como base (más ligero y seguro)
FROM node:18-alpine AS base

# Instalar dependencias de sistema necesarias
RUN apk add --no-cache \
    libc6-compat \
    curl \
    dumb-init

# Establecer directorio de trabajo
WORKDIR /app

# ----------------------
# STAGE: Dependencies
# ----------------------
FROM base AS deps

# Copiar archivos de dependencias
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Instalar dependencias basado en el lock file disponible
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
  else echo "No lockfile found." && exit 1; \
  fi

# ----------------------
# STAGE: Builder
# ----------------------
FROM base AS builder

WORKDIR /app

# Copiar dependencias instaladas
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Variables de entorno para build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Generar cliente de Prisma
RUN npx prisma generate

# Build de la aplicación
RUN \
  if [ -f yarn.lock ]; then yarn build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then pnpm build; \
  else npm run build; \
  fi

# ----------------------
# STAGE: Runner (Producción)
# ----------------------
FROM base AS runner

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Crear directorios necesarios
RUN mkdir -p /app/logs && chown nextjs:nodejs /app/logs
RUN mkdir -p /app/.next && chown nextjs:nodejs /app/.next

# Copiar archivos necesarios para producción
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js

# Copiar archivos de Prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copiar build de Next.js con permisos correctos
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar node_modules (solo las dependencias de producción)
COPY --from=builder /app/node_modules ./node_modules

# Script de health check
COPY --chown=nextjs:nodejs <<EOF /app/healthcheck.js
const http = require('http');
const options = {
  host: 'localhost',
  port: process.env.PORT || 3000,
  path: '/api/health',
  timeout: 2000,
};
const request = http.request(options, (res) => {
  console.log('Health check status:', res.statusCode);
  process.exit(res.statusCode === 200 ? 0 : 1);
});
request.on('error', () => process.exit(1));
request.on('timeout', () => process.exit(1));
request.end();
EOF

# Cambiar a usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node /app/healthcheck.js

# Comando de inicio usando dumb-init para mejor manejo de procesos
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
