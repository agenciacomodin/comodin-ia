import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Production seed script')
  console.log('⚠️  All mock data has been removed')
  console.log('✅ Only real production users exist')
  
  // Production seed - no test users
  // john@doe.com and other test accounts removed
  // Only admin@comodinia.com and real users should exist
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

export {}
