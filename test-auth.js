
require('dotenv').config();
console.log('Testing authentication flow...');

// Simulación de test de autenticación
async function testAuth() {
  try {
    console.log('1. Testing database connection...');
    
    // Verificar conexión a la base de datos
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const user = await prisma.user.findFirst({
      where: { email: 'john@doe.com' },
      include: { organization: true }
    });
    
    console.log('User found:', user ? 'YES' : 'NO');
    if (user) {
      console.log('User details:', {
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        organizationStatus: user.organization?.status
      });
    }
    
    // Verificar account
    const account = await prisma.account.findFirst({
      where: { userId: user?.id, provider: 'credentials' }
    });
    
    console.log('Account found:', account ? 'YES' : 'NO');
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testAuth();
