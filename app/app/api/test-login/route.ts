
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log('=== Testing Login Process ===')
    console.log('Email:', email)
    console.log('Password provided:', !!password)
    
    // 1. Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true }
    })
    
    console.log('1. User found:', !!user)
    if (!user) {
      return NextResponse.json({ error: 'User not found', step: 1 }, { status: 404 })
    }
    
    console.log('2. User active:', user.isActive)
    console.log('3. Organization status:', user.organization.status)
    
    if (!user.isActive) {
      return NextResponse.json({ error: 'User inactive', step: 2 }, { status: 403 })
    }
    
    if (user.organization.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Organization not active', step: 3 }, { status: 403 })
    }
    
    // 4. Buscar account
    const account = await prisma.account.findFirst({
      where: { 
        userId: user.id, 
        provider: 'credentials' 
      }
    })
    
    console.log('4. Account found:', !!account)
    if (!account?.refresh_token) {
      return NextResponse.json({ error: 'No credentials account', step: 4 }, { status: 404 })
    }
    
    // 5. Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, account.refresh_token)
    console.log('5. Password valid:', isValidPassword)
    
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid password', step: 5 }, { status: 401 })
    }
    
    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId
      }
    })
    
  } catch (error) {
    console.error('Test login error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
