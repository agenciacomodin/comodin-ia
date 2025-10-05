
import { prisma } from '../lib/db';

async function cleanDemoData() {
  console.log('🧹 Limpiando datos demo...');

  try {
    // Find all organizations with demo data
    const demoOrgs = await prisma.organization.findMany({
      where: {
        isDemoData: true
      }
    });

    console.log(`📊 Encontradas ${demoOrgs.length} organizaciones demo`);

    for (const org of demoOrgs) {
      console.log(`🗑️  Eliminando datos de organización: ${org.name}`);
      
      // Delete in correct order to respect foreign keys
      await prisma.message.deleteMany({ where: { organizationId: org.id } });
      await prisma.conversation.deleteMany({ where: { organizationId: org.id } });
      await prisma.contactNote.deleteMany({ where: { organizationId: org.id } });
      await prisma.contactTag.deleteMany({ where: { organizationId: org.id } });
      await prisma.contact.deleteMany({ where: { organizationId: org.id } });
      await prisma.knowledgeSource.deleteMany({ where: { organizationId: org.id } });
      await prisma.whatsAppChannel.deleteMany({ where: { organizationId: org.id } });
      
      // Delete AITransactions through AIWallet
      const wallet = await prisma.aIWallet.findUnique({ where: { organizationId: org.id } });
      if (wallet) {
        await prisma.aITransaction.deleteMany({ where: { walletId: wallet.id } });
      }
      
      await prisma.user.deleteMany({ where: { organizationId: org.id } });
      await prisma.organization.delete({ where: { id: org.id } });
    }

    console.log('✅ Datos demo eliminados correctamente');
  } catch (error) {
    console.error('❌ Error eliminando datos demo:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanDemoData()
  .then(() => {
    console.log('🎉 Limpieza completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
