
# 🤖 COMODÍN IA

Plataforma de IA conversacional multi-agente con CRM integrado, gestión de campañas y automatización de WhatsApp.

## 🚀 Características

- **Multi-Role System**: SUPER_ADMIN, ADMIN, MANAGER, AGENT
- **CRM Integrado**: Gestión de contactos y conversaciones
- **Campañas**: Envíos masivos por WhatsApp
- **IA Resolutiva**: Agentes con RAG (Retrieval-Augmented Generation)
- **Integraciones**: WhatsApp (Evolution API), Email, Pagos (Stripe, Mercado Pago)
- **Analytics**: Reportes y métricas en tiempo real

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de Datos**: PostgreSQL
- **Autenticación**: NextAuth.js
- **IA**: OpenAI GPT-4, RAG con embeddings
- **Storage**: Supabase
- **Deployment**: PM2, Nginx, VPS Hostinger

## 📋 Requisitos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/agenciacomodin/comodin-ia.git
cd comodin-ia
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/comodin_ia"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
OPENAI_API_KEY="sk-..."
# ... más variables
```

### 4. Configurar base de datos

```bash
# Generar Prisma Client
npx prisma generate

# Ejecutar migraciones
npx prisma migrate deploy

# (Opcional) Seed con datos de prueba
npx prisma db seed
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment en Producción

### Build

```bash
npm run build
```

### Ejecutar con PM2

```bash
pm2 start npm --name "comodin-ia" -- start
pm2 save
pm2 startup
```

## 📁 Estructura del Proyecto

```
comodin-ia/
├── app/
│   ├── (authenticated)/      # Páginas protegidas
│   │   ├── dashboard/
│   │   ├── inbox/
│   │   ├── campaigns/
│   │   ├── knowledge-base/
│   │   └── ...
│   ├── api/                  # API Routes
│   │   ├── auth/
│   │   ├── agents/
│   │   ├── contacts/
│   │   └── ...
│   ├── components/           # Componentes React
│   └── lib/                  # Utilidades
├── prisma/
│   ├── schema.prisma         # Schema de base de datos
│   └── migrations/
├── public/                   # Assets estáticos
└── ...
```

## 👥 Roles y Permisos

### SUPER_ADMIN
- Acceso total al sistema
- Gestión de todas las organizaciones
- Configuración global

### ADMIN
- Gestión completa de su organización
- Usuarios, contactos, campañas
- Configuración de agentes IA

### MANAGER
- Supervisión de equipos
- Reportes y analytics
- Gestión de campañas

### AGENT
- Gestión de conversaciones
- Atención a contactos
- Uso de agentes IA

## 🔌 Integraciones

### WhatsApp (Evolution API)
```bash
# Configurar en .env
EVOLUTION_API_URL="http://localhost:8080"
EVOLUTION_API_KEY="your-key"
```

### Email (Hostinger)
```bash
EMAIL_SERVER="smtp.hostinger.com"
EMAIL_PORT="465"
EMAIL_USER="your-email@domain.com"
```

### Pagos
- **Stripe**: Pagos internacionales
- **Mercado Pago**: Pagos LATAM

## 📊 Base de Datos

### Modelos Principales

- **User**: Usuarios del sistema
- **Organization**: Organizaciones/empresas
- **Contact**: Contactos del CRM
- **Conversation**: Conversaciones
- **Message**: Mensajes
- **Campaign**: Campañas de envío masivo
- **Agent**: Agentes IA
- **KnowledgeBase**: Bases de conocimiento
- **Document**: Documentos para RAG

## 🔒 Seguridad

- Autenticación con NextAuth.js
- Passwords hasheados con bcrypt
- Middleware de autorización por roles
- Variables de entorno para credenciales
- HTTPS en producción

## 📝 Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Build para producción
npm start            # Ejecutar en producción
npm run lint         # Linter
npx prisma studio    # UI de base de datos
npx prisma migrate   # Migraciones
```

## 🌿 Branches

- **main**: Código estable y probado
- **development**: Desarrollo activo
- **feature/\***: Nuevas funcionalidades
- **hotfix/\***: Correcciones urgentes

## 📦 Workflow de Desarrollo

1. Crear branch desde `development`:
   ```bash
   git checkout development
   git pull origin development
   git checkout -b feature/nueva-funcionalidad
   ```

2. Desarrollar y commitear:
   ```bash
   git add .
   git commit -m "feat: descripción del cambio"
   ```

3. Push y crear Pull Request:
   ```bash
   git push origin feature/nueva-funcionalidad
   ```

4. Merge a `development` → probar → merge a `main`

## 🐛 Troubleshooting

### Error de conexión a base de datos
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Verificar credenciales en .env
cat .env | grep DATABASE_URL
```

### Error de Prisma
```bash
# Regenerar Prisma Client
npx prisma generate

# Resetear base de datos (CUIDADO: borra datos)
npx prisma migrate reset
```

### Error de build
```bash
# Limpiar cache
rm -rf .next node_modules
npm install
npm run build
```

## 📞 Soporte

- **Email**: admin@comodinia.com
- **Repositorio**: https://github.com/agenciacomodin/comodin-ia
- **Documentación**: Ver carpeta `/docs`

## 📄 Licencia

Propietario - Agencia Comodín © 2025

---

**Desarrollado con ❤️ por Agencia Comodín**
