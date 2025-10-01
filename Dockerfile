
# =============================================================================
# COMODÍN IA - DOCKERFILE PARA PRODUCCIÓN
# =============================================================================

FROM node:18-alpine AS base

# Instalar dependencias de sistema necesarias
RUN apk add --no-cache libc6-compat curl

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY prisma ./prisma/

# =============================================================================
# STAGE 1: DEPENDENCIES
# =============================================================================
FROM base AS deps
RUN yarn install --frozen-lockfile

# =============================================================================
# STAGE 2: BUILD
# =============================================================================
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar cliente de Prisma
RUN npx prisma generate

# Construir aplicación
ENV NEXT_TELEMETRY_DISABLED 1
ENV TSC_COMPILE_ON_ERROR 1
# RUN yarn build - Comentado, usaremos el build pre-existente
COPY .next ./.next

# =============================================================================
# STAGE 3: RUNNER (PRODUCTION)
# =============================================================================
FROM base AS runner

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV TSC_COMPILE_ON_ERROR 1

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos públicos
COPY --from=builder /app/public ./public

# Crear directorio .next con permisos correctos
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copiar archivos de build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar cliente de Prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Crear directorio de logs
RUN mkdir -p /app/logs && chown nextjs:nodejs /app/logs

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]

