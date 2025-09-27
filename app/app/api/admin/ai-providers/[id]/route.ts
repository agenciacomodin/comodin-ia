
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { 
  getAIProvider, 
  updateAIProvider, 
  deleteAIProvider,
  toggleAIProviderStatus,
  setDefaultAIProvider
} from '@/lib/ai-providers'
import { z } from 'zod'

const UpdateProviderSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long').optional(),
  displayName: z.string().min(1, 'Display name is required').max(100, 'Display name too long').optional(),
  description: z.string().optional(),
  logoUrl: z.string().url('Invalid logo URL').optional().or(z.literal('')),
  apiUrl: z.string().url('Invalid API URL').optional(),
  apiKeyName: z.string().optional(),
  apiKey: z.string().min(10, 'API key too short').optional(),
  defaultModel: z.string().optional(),
  availableModels: z.array(z.string()).optional(),
  inputPricePerToken: z.number().positive().optional(),
  outputPricePerToken: z.number().positive().optional(),
  currency: z.string().length(3, 'Invalid currency code').optional(),
  maxTokensPerRequest: z.number().positive().optional(),
  rateLimitPerMinute: z.number().positive().optional(),
  metadata: z.record(z.any()).optional()
})

const ActionSchema = z.object({
  action: z.enum(['toggle-status', 'set-default'])
})

/**
 * GET /api/admin/ai-providers/[id]
 * Obtener un proveedor específico (Solo Super Admin)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Access denied: Super Admin required' }, { status: 403 })
    }

    const provider = await getAIProvider(params.id, session.user.role)
    
    return NextResponse.json({
      success: true,
      data: provider
    })
  } catch (error) {
    console.error('Error fetching AI provider:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/ai-providers/[id]
 * Actualizar un proveedor de IA (Solo Super Admin)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Access denied: Super Admin required' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = UpdateProviderSchema.parse(body)

    const provider = await updateAIProvider(
      params.id,
      validatedData,
      session.user.id,
      session.user.name || session.user.email,
      session.user.role
    )

    return NextResponse.json({
      success: true,
      data: provider,
      message: `Provider "${provider.displayName}" updated successfully`
    })
  } catch (error) {
    console.error('Error updating AI provider:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/ai-providers/[id]
 * Acciones específicas en un proveedor (activar/desactivar, establecer default)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Access denied: Super Admin required' }, { status: 403 })
    }

    const body = await request.json()
    const { action } = ActionSchema.parse(body)

    switch (action) {
      case 'toggle-status':
        const { isActive } = z.object({ isActive: z.boolean() }).parse(body)
        const provider = await toggleAIProviderStatus(
          params.id,
          isActive,
          session.user.id,
          session.user.name || session.user.email,
          session.user.role
        )
        
        return NextResponse.json({
          success: true,
          data: provider,
          message: `Provider ${isActive ? 'activated' : 'deactivated'} successfully`
        })

      case 'set-default':
        await setDefaultAIProvider(
          params.id,
          session.user.id,
          session.user.name || session.user.email,
          session.user.role
        )
        
        return NextResponse.json({
          success: true,
          message: 'Default provider updated successfully'
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error performing action on AI provider:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/ai-providers/[id]
 * Eliminar un proveedor de IA (Solo Super Admin)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Access denied: Super Admin required' }, { status: 403 })
    }

    await deleteAIProvider(params.id, session.user.role)

    return NextResponse.json({
      success: true,
      message: 'Provider deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting AI provider:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
