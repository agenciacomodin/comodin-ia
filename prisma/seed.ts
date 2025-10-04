import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed file ready for production');
  console.log('⚠️  All mock data has been removed');
  console.log('✅ Only admin@comodinia.com user exists in production');
  
  // Production seed file - no mock data
  // All test organizations and users have been removed
  // Only real production data should be added here
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
