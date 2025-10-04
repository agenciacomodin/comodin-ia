
import { NextRequest } from 'next/server'
import { withAuth, ApiResponse } from '@/lib/api-auth'
import { Permission } from '@/lib/permissions'
import { prisma } from '@/lib/db'

/**
 * GET /api/admin/organizations - Obtener todas las organizaciones (Solo Super Admin)
 */
export const GET = withAuth(async (request: NextRequest, authData) => {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const where = status ? { status: status as any } : {}
    
    const organizations = await prisma.organization.findMany({
      where,
      include: {
        users: {
          select: {
            id: true,
            role: true,
            isActive: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    })

    const total = await prisma.organization.count({ where })

    return ApiResponse.success({
      organizations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching organizations:', error)
    return ApiResponse.error('Error al obtener organizaciones', 500)
  }
}, [Permission.PLATFORM_ADMINISTRATION])

