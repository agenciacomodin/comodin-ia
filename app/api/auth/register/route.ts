import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Función para generar slug único
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, organizationName, phone, country } = body;

    // Validaciones
    if (!name || !email || !password || !organizationName) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validar contraseña (mínimo 8 caracteres)
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    // Generar slug único para la organización
    let slug = generateSlug(organizationName);
    let slugExists = await prisma.organization.findUnique({
      where: { slug },
    });
    
    // Si el slug existe, agregar un número
    let counter = 1;
    while (slugExists) {
      slug = `${generateSlug(organizationName)}-${counter}`;
      slugExists = await prisma.organization.findUnique({
        where: { slug },
      });
      counter++;
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear organización
    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
        slug: slug,
        email: email,
        phone: phone || '',
        country: country || null,
        status: 'TRIAL',
        currentPlan: 'FREE',
      },
    });

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        name,
        email,
        fullName: name,
        phone: phone || null,
        country: country || null,
        role: 'PROPIETARIO',
        organizationId: organization.id,
        emailVerified: new Date(),
        isActive: true,
      },
    });

    // Crear Account con la contraseña hasheada en refresh_token
    await prisma.account.create({
      data: {
        userId: user.id,
        type: 'credentials',
        provider: 'credentials',
        providerAccountId: user.id,
        refresh_token: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Registro exitoso. Ya puedes iniciar sesión.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Error en el registro. Por favor intenta nuevamente.' },
      { status: 500 }
    );
  }
}
