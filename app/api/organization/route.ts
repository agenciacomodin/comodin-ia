
import { NextRequest } from 'next/server'
import { withAuth, ApiResponse } from '@/lib/api-auth'
import { Permission } from '@/lib/permissions'
import { prisma } from '@/lib/db'

/**
 * GET /api/organization - Obtener información de la organización
 */
export const GET = withAuth(async (request: NextRequest, authData) => {
  try {
    const organization = await prisma.organization.findUnique({
      where: {
        id: authData.organizationId
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            lastLogin: true
          }
        }
      }
    })

    if (!organization) {
      return ApiResponse.notFound('Organización no encontrada')
    }

    return ApiResponse.success(organization)
  } catch (error) {
    console.error('Error fetching organization:', error)
    return ApiResponse.error('Error al obtener organización', 500)
  }
}, [Permission.VIEW_ORGANIZATION_SETTINGS])

/**
 * PATCH /api/organization - Actualizar organización
 * Requiere permisos: MANAGE_ORGANIZATION
 */
export const PATCH = withAuth(async (request: NextRequest, authData) => {
  try {
    const body = await request.json()
    const { name, description, phone, email, website, timezone, currency, language } = body

    const updatedOrganization = await prisma.organization.update({
      where: {
        id: authData.organizationId
      },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(phone && { phone }),
        ...(email && { email }),
        ...(website && { website }),
        ...(timezone && { timezone }),
        ...(currency && { currency }),
        ...(language && { language })
      }
    })

    return ApiResponse.success(updatedOrganization)
  } catch (error) {
    console.error('Error updating organization:', error)
    return ApiResponse.error('Error al actualizar organización', 500)
  }
}, [Permission.MANAGE_ORGANIZATION])

