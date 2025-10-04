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
          status: "ACTIVE",
          createdAt: new Date(),
          updatedAt: new Date()
        } 
      });
      console.log("✓ Organización creada:", org.id);
    } else {
      console.log("✓ Organización encontrada:", org.id);
    }
    
    // Crear o actualizar usuario
    const user = await prisma.user.upsert({
      where: { email: "admin@comodinia.com" },
      update: { 
        name: "Administrador",
        role: "SUPER_ADMIN",
        isActive: true,
        organizationId: org.id
      },
      create: { 
        email: "admin@comodinia.com", 
        name: "Administrador",
        role: "SUPER_ADMIN",
        isActive: true,
        organizationId: org.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log("✓ Usuario creado/actualizado:", user.id);
    
    // Crear o actualizar account con la contraseña en refresh_token
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: "credentials",
          providerAccountId: user.id
        }
      },
      update: {
        refresh_token: hash
      },
      create: {
        userId: user.id,
        type: "credentials",
        provider: "credentials",
        providerAccountId: user.id,
        refresh_token: hash
      }
    });
    
    console.log("✓ Credenciales configuradas");
    console.log("");
    console.log("✅ ¡USUARIO ADMIN CREADO EXITOSAMENTE!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email: admin@comodinia.com");
    console.log("🔑 Password: Admin123!");
    console.log("👤 Nombre:", user.name);
    console.log("🎭 Rol:", user.role);
    console.log("🏢 Organización:", org.name);
    console.log("🆔 User ID:", user.id);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
