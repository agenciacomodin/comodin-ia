import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token no proporcionado' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { 
        emailVerified: null,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido o ya verificado' },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Email verificado exitosamente',
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Error en la verificación' },
      { status: 500 }
    );
  }
}
