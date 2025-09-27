
# =====================================
# DOCKERFILE PARA COMODÍN IA
# =====================================

# Usar Node.js 18 Alpine como base
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instalar dependencias
FROM base AS deps
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar cliente de Prisma
RUN npx prisma generate

# Construir la aplicación
ENV NEXT_TELEMETRY_DISABLED 1
RUN yarn build

# Runner stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Configurar archivos estáticos de Next.js
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copiar archivos construidos
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar Prisma Schema y generar cliente
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Crear directorios para logs y uploads
RUN mkdir -p /app/logs /app/uploads
RUN chown nextjs:nodejs /app/logs /app/uploads

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Script de inicio
CMD ["node", "server.js"]
