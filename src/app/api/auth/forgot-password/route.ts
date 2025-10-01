import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requerido' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    return NextResponse.json({
      success: true,
      message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña',
      resetToken: resetToken,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
