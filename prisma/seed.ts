
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos...');

  // Limpiar datos existentes (excepto admin)
  console.log('Limpiando datos anteriores...');
  await prisma.message.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.contact.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.aiAgent.deleteMany({});
  await prisma.knowledgeBase.deleteMany({});
  await prisma.user.deleteMany({
    where: { email: { not: 'admin@comodinia.com' } }
  });
  await prisma.organization.deleteMany({
    where: { email: { not: 'admin@comodinia.com' } }
  });

  // Crear organizaciones
  console.log('Creando organizaciones...');
  
  const org1 = await prisma.organization.create({
    data: {
      name: 'Inmobiliaria Premium',
      email: 'contacto@inmobiliariapremium.com',
      phone: '+5491123456789',
      plan: 'PRO',
      website: 'https://inmobiliariapremium.com',
      address: 'Av. Corrientes 1234, CABA',
    },
  });

  const org2 = await prisma.organization.create({
    data: {
      name: 'TechSolutions SRL',
      email: 'info@techsolutions.com',
      phone: '+5491134567890',
      plan: 'ENTERPRISE',
      website: 'https://techsolutions.com',
      address: 'Av. Santa Fe 5678, CABA',
    },
  });

  const org3 = await prisma.organization.create({
    data: {
      name: 'Clínica Salud Total',
      email: 'turnos@saludtotal.com',
      phone: '+5491145678901',
      plan: 'PRO',
      website: 'https://saludtotal.com',
      address: 'Av. Rivadavia 9012, CABA',
    },
  });

  // Crear usuarios
  console.log('Creando usuarios...');
  
  const hashedPassword = await bcrypt.hash('Demo123!', 10);

  const propietario1 = await prisma.user.create({
    data: {
      email: 'propietario@inmobiliariapremium.com',
      password: hashedPassword,
      name: 'Carlos Rodríguez',
      role: 'PROPIETARIO',
      organizationId: org1.id,
      emailVerified: new Date(),
    },
  });

  const agente1 = await prisma.user.create({
    data: {
      email: 'agente1@inmobiliariapremium.com',
      password: hashedPassword,
      name: 'María González',
      role: 'AGENTE',
      organizationId: org1.id,
      emailVerified: new Date(),
    },
  });

  const agente2 = await prisma.user.create({
    data: {
      email: 'agente2@inmobiliariapremium.com',
      password: hashedPassword,
      name: 'Juan Pérez',
      role: 'AGENTE',
      organizationId: org1.id,
      emailVerified: new Date(),
    },
  });

  const propietario2 = await prisma.user.create({
    data: {
      email: 'propietario@techsolutions.com',
      password: hashedPassword,
      name: 'Laura Martínez',
      role: 'PROPIETARIO',
      organizationId: org2.id,
      emailVerified: new Date(),
    },
  });

  const propietario3 = await prisma.user.create({
    data: {
      email: 'propietario@saludtotal.com',
      password: hashedPassword,
      name: 'Dr. Roberto Sánchez',
      role: 'PROPIETARIO',
      organizationId: org3.id,
      emailVerified: new Date(),
    },
  });

  // Crear contactos para Inmobiliaria Premium
  console.log('Creando contactos...');
  
  const contactos1 = [
    {
      name: 'Ana López',
      email: 'ana.lopez@email.com',
      phone: '+5491156789012',
      source: 'WHATSAPP',
      tags: ['interesado', 'departamento'],
    },
    {
      name: 'Pedro Fernández',
      email: 'pedro.fernandez@email.com',
      phone: '+5491167890123',
      source: 'WEB',
      tags: ['consulta', 'casa'],
    },
    {
      name: 'Lucía Ramírez',
      email: 'lucia.ramirez@email.com',
      phone: '+5491178901234',
      source: 'WHATSAPP',
      tags: ['cliente', 'alquiler'],
    },
    {
      name: 'Diego Torres',
      email: 'diego.torres@email.com',
      phone: '+5491189012345',
      source: 'REFERRAL',
      tags: ['vip', 'compra'],
    },
    {
      name: 'Sofía Morales',
      email: 'sofia.morales@email.com',
      phone: '+5491190123456',
      source: 'WHATSAPP',
      tags: ['seguimiento', 'departamento'],
    },
  ];

  const createdContacts1 = [];
  for (const contactData of contactos1) {
    const contact = await prisma.contact.create({
      data: {
        ...contactData,
        organizationId: org1.id,
      },
    });
    createdContacts1.push(contact);
  }

  // Crear contactos para TechSolutions
  const contactos2 = [
    {
      name: 'Empresa ABC SA',
      email: 'contacto@empresaabc.com',
      phone: '+5491101234567',
      source: 'WEB',
      tags: ['corporativo', 'software'],
    },
    {
      name: 'Startup XYZ',
      email: 'info@startupxyz.com',
      phone: '+5491112345678',
      source: 'REFERRAL',
      tags: ['startup', 'desarrollo'],
    },
  ];

  const createdContacts2 = [];
  for (const contactData of contactos2) {
    const contact = await prisma.contact.create({
      data: {
        ...contactData,
        organizationId: org2.id,
      },
    });
    createdContacts2.push(contact);
  }

  // Crear contactos para Clínica Salud Total
  const contactos3 = [
    {
      name: 'Paciente María Silva',
      email: 'maria.silva@email.com',
      phone: '+5491123456780',
      source: 'WHATSAPP',
      tags: ['paciente', 'turno'],
    },
    {
      name: 'Paciente Jorge Díaz',
      email: 'jorge.diaz@email.com',
      phone: '+5491134567891',
      source: 'PHONE',
      tags: ['paciente', 'consulta'],
    },
  ];

  const createdContacts3 = [];
  for (const contactData of contactos3) {
    const contact = await prisma.contact.create({
      data: {
        ...contactData,
        organizationId: org3.id,
      },
    });
    createdContacts3.push(contact);
  }

  // Crear conversaciones y mensajes para Inmobiliaria Premium
  console.log('Creando conversaciones y mensajes...');
  
  for (let i = 0; i < createdContacts1.length; i++) {
    const contact = createdContacts1[i];
    const conversation = await prisma.conversation.create({
      data: {
        contactId: contact.id,
        channel: 'WHATSAPP',
        status: i < 2 ? 'OPEN' : 'CLOSED',
        assignedToId: i % 2 === 0 ? agente1.id : agente2.id,
        lastMessageAt: new Date(Date.now() - i * 3600000),
      },
    });

    // Crear mensajes de ejemplo
    const mensajes = [
      {
        content: 'Hola, estoy interesado en conocer más sobre las propiedades disponibles',
        direction: 'INBOUND',
        timestamp: new Date(Date.now() - (i + 1) * 3600000),
      },
      {
        content: '¡Hola! Claro, con gusto te ayudo. ¿Buscas departamento o casa?',
        direction: 'OUTBOUND',
        timestamp: new Date(Date.now() - (i + 0.9) * 3600000),
      },
      {
        content: 'Me interesa un departamento de 2 ambientes en Palermo',
        direction: 'INBOUND',
        timestamp: new Date(Date.now() - (i + 0.8) * 3600000),
      },
      {
        content: 'Perfecto, tenemos varias opciones en esa zona. Te envío información',
        direction: 'OUTBOUND',
        timestamp: new Date(Date.now() - (i + 0.7) * 3600000),
      },
    ];

    for (const msgData of mensajes) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          content: msgData.content,
          direction: msgData.direction as any,
          channel: 'WHATSAPP',
          createdAt: msgData.timestamp,
        },
      });
    }

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        unreadCount: msgData.direction === 'INBOUND' ? 1 : 0,
      },
    });
  }

  // Crear agentes IA
  console.log('Creando agentes IA...');
  
  const aiAgent1 = await prisma.aiAgent.create({
    data: {
      name: 'Asistente Inmobiliario',
      description: 'Agente especializado en consultas inmobiliarias',
      organizationId: org1.id,
      model: 'gpt-4',
      temperature: 0.7,
      systemPrompt: 'Eres un asistente virtual de una inmobiliaria. Tu objetivo es ayudar a los clientes con información sobre propiedades, agendar visitas y responder consultas. Sé amable, profesional y conciso.',
      autoReply: true,
      isActive: true,
    },
  });

  const aiAgent2 = await prisma.aiAgent.create({
    data: {
      name: 'Soporte Técnico',
      description: 'Agente para soporte técnico de software',
      organizationId: org2.id,
      model: 'gpt-4',
      temperature: 0.5,
      systemPrompt: 'Eres un asistente de soporte técnico especializado en software. Ayuda a resolver problemas técnicos de manera clara y paso a paso.',
      autoReply: true,
      isActive: true,
    },
  });

  const aiAgent3 = await prisma.aiAgent.create({
    data: {
      name: 'Asistente Médico',
      description: 'Agente para gestión de turnos médicos',
      organizationId: org3.id,
      model: 'gpt-4',
      temperature: 0.6,
      systemPrompt: 'Eres un asistente virtual de una clínica médica. Tu función es ayudar a agendar turnos, responder consultas generales y brindar información sobre servicios. Sé empático y profesional.',
      autoReply: true,
      isActive: true,
    },
  });

  // Crear bases de conocimiento
  console.log('Creando bases de conocimiento...');
  
  await prisma.knowledgeBase.create({
    data: {
      title: 'Catálogo de Propiedades',
      content: `
# Propiedades Disponibles

## Departamentos en Palermo
- 2 ambientes: USD 150,000 - USD 200,000
- 3 ambientes: USD 250,000 - USD 350,000
- Amenities: gimnasio, piscina, seguridad 24hs

## Casas en Belgrano
- 3 ambientes: USD 400,000 - USD 500,000
- 4 ambientes: USD 600,000 - USD 800,000
- Jardín y cochera incluidos

## Alquileres
- Departamentos desde $150,000/mes
- Casas desde $250,000/mes
- Expensas no incluidas
      `,
      organizationId: org1.id,
      aiAgentId: aiAgent1.id,
      isActive: true,
    },
  });

  await prisma.knowledgeBase.create({
    data: {
      title: 'Servicios de Desarrollo',
      content: `
# Servicios TechSolutions

## Desarrollo Web
- Sitios corporativos
- E-commerce
- Aplicaciones web personalizadas

## Desarrollo Mobile
- Apps iOS y Android
- Apps híbridas
- Mantenimiento y soporte

## Consultoría IT
- Auditoría de sistemas
- Migración a la nube
- Ciberseguridad
      `,
      organizationId: org2.id,
      aiAgentId: aiAgent2.id,
      isActive: true,
    },
  });

  await prisma.knowledgeBase.create({
    data: {
      title: 'Información de Turnos',
      content: `
# Clínica Salud Total - Información de Turnos

## Especialidades Disponibles
- Clínica Médica
- Cardiología
- Dermatología
- Pediatría
- Ginecología

## Horarios de Atención
- Lunes a Viernes: 8:00 - 20:00
- Sábados: 9:00 - 13:00

## Cómo Sacar Turno
1. Por WhatsApp: +5491145678901
2. Por teléfono: 011-4567-8901
3. En recepción

## Obras Sociales
Aceptamos todas las obras sociales y prepagas
      `,
      organizationId: org3.id,
      aiAgentId: aiAgent3.id,
      isActive: true,
    },
  });

  // Crear campañas
  console.log('Creando campañas...');
  
  await prisma.campaign.create({
    data: {
      name: 'Lanzamiento Nuevas Propiedades',
      description: 'Campaña para promocionar nuevas propiedades en Palermo',
      organizationId: org1.id,
      status: 'ACTIVE',
      channel: 'WHATSAPP',
      scheduledFor: new Date(Date.now() + 86400000), // Mañana
      message: '🏠 ¡Nuevas propiedades disponibles en Palermo! Departamentos de 2 y 3 ambientes con amenities. Consultá sin compromiso.',
      targetAudience: { tags: ['interesado', 'seguimiento'] },
    },
  });

  await prisma.campaign.create({
    data: {
      name: 'Promoción Desarrollo Web',
      description: 'Oferta especial en desarrollo web',
      organizationId: org2.id,
      status: 'DRAFT',
      channel: 'EMAIL',
      message: '💻 Promoción especial: 20% OFF en desarrollo de sitios web corporativos. Válido hasta fin de mes.',
      targetAudience: { tags: ['corporativo'] },
    },
  });

  console.log('✅ Seed completado exitosamente!');
  console.log('\n📊 Resumen de datos creados:');
  console.log(`- Organizaciones: 3`);
  console.log(`- Usuarios: 5`);
  console.log(`- Contactos: ${createdContacts1.length + createdContacts2.length + createdContacts3.length}`);
  console.log(`- Conversaciones: ${createdContacts1.length}`);
  console.log(`- Agentes IA: 3`);
  console.log(`- Bases de conocimiento: 3`);
  console.log(`- Campañas: 2`);
  console.log('\n🔑 Credenciales de acceso:');
  console.log('Email: propietario@inmobiliariapremium.com');
  console.log('Password: Demo123!');
  console.log('\nEmail: agente1@inmobiliariapremium.com');
  console.log('Password: Demo123!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
