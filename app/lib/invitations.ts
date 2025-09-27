
import { prisma } from './db'
import { UserRole, InvitationStatus } from '@prisma/client'
import { emailService } from './email'
import crypto from 'crypto'

export interface CreateInvitationData {
  email: string
  role: UserRole
  organizationId: string
  invitedBy: string
  invitedByName: string
  firstName?: string
  lastName?: string
  message?: string
}

export interface AcceptInvitationData {
  token: string
  userData: {
    name: string
    fullName?: string
    phone?: string
    country?: string
    password: string
  }
}

export class InvitationService {
  // Crear nueva invitación
  static async createInvitation(data: CreateInvitationData) {
    try {
      // Verificar que el usuario no existe ya en la organización
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          organizationId: data.organizationId
        }
      })

      if (existingUser) {
        throw new Error('El usuario ya pertenece a esta organización')
      }

      // Verificar si hay una invitación pendiente
      const existingInvitation = await prisma.invitation.findFirst({
        where: {
          email: data.email,
          organizationId: data.organizationId,
          status: InvitationStatus.PENDING
        }
      })

      if (existingInvitation) {
        throw new Error('Ya existe una invitación pendiente para este email')
      }

      // Generar token único y seguro
      const token = crypto.randomBytes(32).toString('hex')
      
      // Fecha de expiración (7 días)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      // Crear invitación
      const invitation = await prisma.invitation.create({
        data: {
          email: data.email,
          token,
          role: data.role,
          organizationId: data.organizationId,
          invitedBy: data.invitedBy,
          invitedByName: data.invitedByName,
          firstName: data.firstName,
          lastName: data.lastName,
          message: data.message,
          expiresAt,
          status: InvitationStatus.PENDING
        },
        include: {
          organization: true
        }
      })

      // Enviar email
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const inviteUrl = `${baseUrl}/auth/invite/${token}`

      const emailResult = await emailService.sendInvitationEmail({
        invitation,
        inviteUrl
      })

      if (!emailResult.success) {
        // Si falla el email, eliminar la invitación
        await prisma.invitation.delete({ where: { id: invitation.id } })
        throw new Error(`Error enviando email: ${emailResult.error}`)
      }

      return {
        success: true,
        invitation,
        emailPreviewUrl: emailResult.messageUrl
      }

    } catch (error) {
      console.error('❌ Error creando invitación:', error)
      throw error
    }
  }

  // Obtener invitación por token
  static async getInvitationByToken(token: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { organization: true }
    })

    if (!invitation) {
      throw new Error('Invitación no encontrada')
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new Error('Esta invitación ya ha sido procesada')
    }

    if (invitation.expiresAt < new Date()) {
      throw new Error('Esta invitación ha expirado')
    }

    return invitation
  }

  // Aceptar invitación
  static async acceptInvitation(data: AcceptInvitationData) {
    try {
      // Obtener y validar invitación
      const invitation = await this.getInvitationByToken(data.token)

      // Verificar que el usuario no existe ya
      const existingUser = await prisma.user.findUnique({
        where: { email: invitation.email }
      })

      if (existingUser) {
        throw new Error('Ya existe un usuario con este email')
      }

      // Hash de la contraseña
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash(data.userData.password, 12)

      // Transacción para crear usuario y actualizar invitación
      const result = await prisma.$transaction(async (tx) => {
        // Crear usuario
        const user = await tx.user.create({
          data: {
            email: invitation.email,
            name: data.userData.name,
            fullName: data.userData.fullName || `${invitation.firstName || ''} ${invitation.lastName || ''}`.trim() || data.userData.name,
            phone: data.userData.phone,
            country: data.userData.country,
            organizationId: invitation.organizationId,
            role: invitation.role,
            isActive: true,
            emailVerified: new Date() // Auto-verificar por invitación
          }
        })

        // Crear credenciales para NextAuth
        await tx.account.create({
          data: {
            userId: user.id,
            type: 'credentials',
            provider: 'credentials',
            providerAccountId: user.email,
            refresh_token: hashedPassword, // Guardamos el hash aquí
          }
        })

        // Actualizar invitación como aceptada
        await tx.invitation.update({
          where: { id: invitation.id },
          data: {
            status: InvitationStatus.ACCEPTED,
            acceptedAt: new Date()
          }
        })

        return { user, invitation }
      })

      return result

    } catch (error) {
      console.error('❌ Error aceptando invitación:', error)
      throw error
    }
  }

  // Cancelar invitación
  static async cancelInvitation(invitationId: string, userId: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId }
    })

    if (!invitation) {
      throw new Error('Invitación no encontrada')
    }

    if (invitation.invitedBy !== userId) {
      throw new Error('No tienes permisos para cancelar esta invitación')
    }

    await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: InvitationStatus.CANCELLED }
    })

    return { success: true }
  }

  // Listar invitaciones de una organización
  static async getOrganizationInvitations(organizationId: string, status?: InvitationStatus) {
    return await prisma.invitation.findMany({
      where: {
        organizationId,
        ...(status && { status })
      },
      include: {
        organization: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  // Limpiar invitaciones expiradas (tarea de mantenimiento)
  static async cleanExpiredInvitations() {
    const result = await prisma.invitation.updateMany({
      where: {
        expiresAt: { lt: new Date() },
        status: InvitationStatus.PENDING
      },
      data: {
        status: InvitationStatus.EXPIRED
      }
    })

    console.log(`🧹 Invitaciones expiradas actualizadas: ${result.count}`)
    return result
  }
}
