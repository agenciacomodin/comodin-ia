const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log("🔧 Creando usuario admin...");
    
    const hash = await bcrypt.hash("Admin123!", 10);
    console.log("✓ Hash de contraseña generado");
    
    let org = await prisma.organization.findFirst();
    if (!org) {
      console.log("⚠️  No existe organización, creando una nueva...");
      org = await prisma.organization.create({ 
        data: { 
          name: "COMODÍN IA",
          slug: "comodin-ia",
          createdAt: new Date(),
          updatedAt: new Date()
        } 
      });
      console.log("✓ Organización creada:", org.id);
    } else {
      console.log("✓ Organización encontrada:", org.id);
    }
    
    const user = await prisma.user.upsert({
      where: { email: "admin@comodinia.com" },
      update: { password: hash },
      create: { 
        email: "admin@comodinia.com", 
        name: "Administrador",
        password: hash, 
        role: "ADMIN",
        organizationId: org.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log("✅ Usuario admin creado exitosamente");
    console.log("📧 Email:", user.email);
    console.log("👤 Nombre:", user.name);
    console.log("🔑 Password: Admin123!");
    console.log("🏢 Organización ID:", user.organizationId);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
