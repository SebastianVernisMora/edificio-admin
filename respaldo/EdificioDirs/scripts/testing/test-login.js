#!/usr/bin/env node

import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api/auth/login';

const testCredentials = [
  { email: 'admin@edificio205.com', password: 'Admin2025!', role: 'ADMIN' },
  { email: 'comite@edificio205.com', password: 'Comite2025!', role: 'COMITE' },
  { email: 'maria.garcia@edificio205.com', password: 'Inquilino2025!', role: 'INQUILINO' }
];

console.log('🧪 Probando credenciales de login...\n');

for (const credential of testCredentials) {
  try {
    console.log(`🔐 Probando ${credential.role}: ${credential.email}`);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: credential.email,
        password: credential.password
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.ok) {
      console.log(`✅ ${credential.role}: Login exitoso`);
      console.log(`   Usuario: ${data.usuario.nombre}`);
      console.log(`   Rol: ${data.usuario.rol}`);
      console.log(`   Token generado: ${data.token ? 'Sí' : 'No'}\n`);
    } else {
      console.log(`❌ ${credential.role}: Login fallido`);
      console.log(`   Error: ${data.msg || 'Error desconocido'}\n`);
    }
  } catch (error) {
    console.log(`❌ ${credential.role}: Error de conexión`);
    console.log(`   Error: ${error.message}\n`);
  }
}

console.log('✅ Pruebas de login completadas');