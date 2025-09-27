
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seeding de la base de datos...')

  try {
    // Limpiar datos existentes (en orden correcto debido a foreign keys)
    console.log('🗑️ Limpiando datos existentes...')
    await prisma.account.deleteMany()
    await prisma.session.deleteMany()
    await prisma.verificationToken.deleteMany()
    await prisma.user.deleteMany()
    await prisma.organization.deleteMany()

    // 1. Crear organización de prueba para COMODÍN IA (Super Admin)
    console.log('🏢 Creando organización COMODÍN IA...')
    const comodinOrg = await prisma.organization.create({
      data: {
        name: 'COMODÍN IA',
        slug: 'comodin-ia',
        description: 'Plataforma SaaS de comunicación y ventas para PyMEs latinoamericanas',
        country: 'México',
        email: 'admin@comodin.ai',
        phone: '+52 555 000 0000',
        website: 'https://comodin.ai',
        status: 'ACTIVE',
        timezone: 'America/Mexico_City',
        currency: 'MXN',
        language: 'es'
      }
    })

    // 2. Crear cuenta de prueba obligatoria: john@doe.com / johndoe123
    console.log('👤 Creando cuenta de prueba obligatoria...')
    const hashedPassword = await bcrypt.hash('johndoe123', 12)
    
    const testUser = await prisma.user.create({
      data: {
        email: 'john@doe.com',
        name: 'John',
        fullName: 'John Doe',
        phone: '+1 555 123 4567',
        country: 'Estados Unidos',
        organizationId: comodinOrg.id,
        role: 'SUPER_ADMIN', // Admin con privilegios especiales
        isActive: true,
        timezone: 'America/New_York',
        language: 'en'
      }
    })

    // Crear credenciales para la cuenta de prueba
    await prisma.account.create({
      data: {
        userId: testUser.id,
        type: 'credentials',
        provider: 'credentials',
        providerAccountId: testUser.id,
        refresh_token: hashedPassword
      }
    })

    // 3. Crear organización de ejemplo
    console.log('🏪 Creando organización de ejemplo...')
    const exampleOrg = await prisma.organization.create({
      data: {
        name: 'Restaurante La Mexicana',
        slug: 'restaurante-la-mexicana',
        description: 'Restaurante familiar especializado en comida tradicional mexicana',
        country: 'México',
        email: 'contacto@lamexicana.com.mx',
        phone: '+52 555 123 4567',
        status: 'TRIAL',
        timezone: 'America/Mexico_City',
        currency: 'MXN',
        language: 'es'
      }
    })

    // 4. Crear usuarios de ejemplo para la organización
    console.log('👥 Creando usuarios de ejemplo...')
    
    // Propietario
    const ownerPassword = await bcrypt.hash('owner123', 12)
    const ownerUser = await prisma.user.create({
      data: {
        email: 'maria@lamexicana.com.mx',
        name: 'María',
        fullName: 'María González',
        phone: '+52 555 123 4567',
        country: 'México',
        organizationId: exampleOrg.id,
        role: 'PROPIETARIO',
        isActive: true
      }
    })

    await prisma.account.create({
      data: {
        userId: ownerUser.id,
        type: 'credentials',
        provider: 'credentials',
        providerAccountId: ownerUser.id,
        refresh_token: ownerPassword
      }
    })

    // Agente
    const agentPassword = await bcrypt.hash('agent123', 12)
    const agentUser = await prisma.user.create({
      data: {
        email: 'carlos@lamexicana.com.mx',
        name: 'Carlos',
        fullName: 'Carlos Martínez',
        phone: '+52 555 987 6543',
        country: 'México',
        organizationId: exampleOrg.id,
        role: 'AGENTE',
        isActive: true
      }
    })

    await prisma.account.create({
      data: {
        userId: agentUser.id,
        type: 'credentials',
        provider: 'credentials',
        providerAccountId: agentUser.id,
        refresh_token: agentPassword
      }
    })

    // Distribuidor
    const distributorPassword = await bcrypt.hash('dist123', 12)
    const distributorUser = await prisma.user.create({
      data: {
        email: 'ana@lamexicana.com.mx',
        name: 'Ana',
        fullName: 'Ana López',
        phone: '+52 555 555 1234',
        country: 'México',
        organizationId: exampleOrg.id,
        role: 'DISTRIBUIDOR',
        isActive: true
      }
    })

    await prisma.account.create({
      data: {
        userId: distributorUser.id,
        type: 'credentials',
        provider: 'credentials',
        providerAccountId: distributorUser.id,
        refresh_token: distributorPassword
      }
    })

    console.log('✅ Seeding completado exitosamente!')
    console.log('📊 Resumen de datos creados:')
    console.log(`   - ${await prisma.organization.count()} organizaciones`)
    console.log(`   - ${await prisma.user.count()} usuarios`)
    console.log(`   - ${await prisma.account.count()} cuentas`)
    
    console.log('\n🔐 Cuentas de prueba disponibles:')
    console.log('   • Super Admin: john@doe.com / johndoe123')
    console.log('   • Propietario: maria@lamexicana.com.mx / owner123')
    console.log('   • Agente: carlos@lamexicana.com.mx / agent123')
    console.log('   • Distribuidor: ana@lamexicana.com.mx / dist123')
    
  } catch (error) {
    console.error('❌ Error durante el seeding:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
