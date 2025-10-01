const bcrypt = require('bcryptjs');

async function generateHashes() {
  const passwords = {
    'agente@comodinia.com': 'Agente123!',
    'distribuidor@comodinia.com': 'Usuario123!',
    'propietario@comodinia.com': 'Admin123!',
    'admin@comodinia.com': 'SuperAdmin123!'
  };

  console.log('=== GENERANDO HASHES DE CONTRASEÑAS ===\n');
  
  for (const [email, password] of Object.entries(passwords)) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}`);
    console.log('---');
  }
}

generateHashes().catch(console.error);
