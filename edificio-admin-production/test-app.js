// Script de prueba simple para verificar la aplicación

const http = require('http');

console.log('🔍 Probando conectividad a la aplicación...');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`📊 Status Code: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers['content-type']);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`📦 Response length: ${data.length} characters`);
    
    // Verificar que sea HTML
    if (data.includes('<!DOCTYPE html>')) {
      console.log('✅ Respuesta es HTML válida');
    } else {
      console.log('❌ Respuesta no parece ser HTML');
    }
    
    // Verificar que contenga elementos esperados
    if (data.includes('Edificio-Admin')) {
      console.log('✅ Contiene título de la aplicación');
    } else {
      console.log('❌ No contiene título esperado');
    }
    
    console.log('✅ Prueba de conectividad completada');
  });
});

req.on('error', (e) => {
  console.error('❌ Error de conexión:', e.message);
});

req.setTimeout(5000, () => {
  console.error('❌ Timeout de conexión');
  req.destroy();
});

req.end();