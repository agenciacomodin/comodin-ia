
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email requerido' },
        { status: 400 }
      );
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Por seguridad, no revelar si el email existe
      return NextResponse.json({
        success: true,
        message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña',
      });
    }

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Guardar token en la tabla PasswordResetToken
    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        token: resetToken,
        expiresAt: resetExpires,
      },
    });

    // Enviar email
    await sendPasswordResetEmail(email, resetToken);

    return NextResponse.json({
      success: true,
      message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña',
    });
  } catch (error) {
    console.error('Error en forgot password:', error);
    return NextResponse.json(
      { error: 'Error al procesar solicitud' },
      { status: 500 }
    );
  }
}
