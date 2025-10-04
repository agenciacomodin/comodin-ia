
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createAIProvider, getAIProviders } from '@/lib/ai-providers'
import { z } from 'zod'

const CreateProviderSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  displayName: z.string().min(1, 'Display name is required').max(100, 'Display name too long'),
  description: z.string().optional(),
  logoUrl: z.string().url('Invalid logo URL').optional().or(z.literal('')),
  apiUrl: z.string().url('Invalid API URL'),
  apiKeyName: z.string().optional(),
  apiKey: z.string().min(10, 'API key too short'),
  defaultModel: z.string().optional(),
  availableModels: z.array(z.string()).optional(),
  inputPricePerToken: z.number().positive().optional(),
  outputPricePerToken: z.number().positive().optional(),
  currency: z.string().length(3, 'Invalid currency code').optional(),
  maxTokensPerRequest: z.number().positive().optional(),
  rateLimitPerMinute: z.number().positive().optional(),
  metadata: z.record(z.any()).optional()
})

/**
 * GET /api/admin/ai-providers
 * Obtener todos los proveedores de IA (Solo Super Admin)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Access denied: Super Admin required' }, { status: 403 })
    }

    const providers = await getAIProviders(session.user.role)
    
    return NextResponse.json({
      success: true,
      data: providers
    })
  } catch (error) {
    console.error('Error fetching AI providers:', error)
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
 * POST /api/admin/ai-providers
 * Crear un nuevo proveedor de IA (Solo Super Admin)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Access denied: Super Admin required' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = CreateProviderSchema.parse(body)

    const provider = await createAIProvider(
      validatedData,
      session.user.id,
      session.user.name || session.user.email,
      session.user.role
    )

    return NextResponse.json({
      success: true,
      data: provider,
      message: `Provider "${provider.displayName}" created successfully`
    })
  } catch (error) {
    console.error('Error creating AI provider:', error)
    
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
