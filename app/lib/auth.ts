
import { NextAuthOptions, User, Profile } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from './db'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'
import { getRolePermissions } from './permissions'

export interface ExtendedUser {
  id: string
  email: string
  name?: string | null
  image?: string | null
  organizationId: string
  role: UserRole
  fullName?: string | null
  phone?: string | null
  country?: string | null
  permissions?: string[]
  createdAt: Date
}

declare module "next-auth" {
  interface Session {
    user: ExtendedUser
  }
  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
    organizationId: string
    role: UserRole
    fullName?: string | null
    phone?: string | null
    country?: string | null
    permissions?: string[]
    createdAt: Date
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    organizationId: string
    role: UserRole
    fullName?: string | null
    phone?: string | null
    country?: string | null
    permissions?: string[]
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt'
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Credenciales incompletas')
        }

        // Buscar usuario con organización
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { organization: true }
        })

        if (!user) {
          throw new Error('Usuario no encontrado')
        }

        if (!user.isActive) {
          throw new Error('Usuario inactivo')
        }

        if (user.organization.status === 'SUSPENDED' || user.organization.status === 'INACTIVE') {
          throw new Error('Organización suspendida o inactiva')
        }

        // Verificar contraseña - buscar en accounts table
        const account = await prisma.account.findFirst({
          where: { 
            userId: user.id, 
            provider: 'credentials' 
          }
        })

        if (!account?.refresh_token) {
          throw new Error('Método de autenticación no válido')
        }

        const isValidPassword = await bcrypt.compare(credentials.password, account.refresh_token)
        
        if (!isValidPassword) {
          throw new Error('Contraseña incorrecta')
        }

        // Actualizar último login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() }
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          organizationId: user.organizationId,
          role: user.role,
          fullName: user.fullName,
          phone: user.phone,
          country: user.country,
          permissions: getRolePermissions(user.role).map(p => p.toString()),
        } as ExtendedUser
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.organizationId = user.organizationId
        token.role = user.role
        token.fullName = user.fullName
        token.phone = user.phone
        token.country = user.country
        token.permissions = user.permissions
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.organizationId = token.organizationId
        session.user.role = token.role
        session.user.fullName = token.fullName
        session.user.phone = token.phone
        session.user.country = token.country
        session.user.permissions = token.permissions
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to dashboard after successful login
      if (url === baseUrl || url.startsWith(baseUrl + '/auth')) {
        return baseUrl + '/dashboard'
      }
      return url
    }
  },
  pages: {
    signIn: '/auth/login',
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`✅ Usuario iniciado sesión: ${user.email}`)
    }
  }
}
