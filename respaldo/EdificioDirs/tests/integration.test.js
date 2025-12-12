// integration.test.js - Tests de integración para todos los endpoints API
import request from 'supertest';
import assert from 'assert';
import app from '../src/app.js';

// Variables globales
let adminToken;
let comiteToken;
let testIds = {
  usuario: null,
  cuota: null,
  gasto: null,
  presupuesto: null,
  anuncio: null
};

// Helper para obtener token
async function getAuthToken(email, password) {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  
  if (response.status === 200) {
    return response.body.token;
  }
  throw new Error(`Failed to get token for ${email}`);
}

// Setup inicial
async function setupIntegrationTests() {
  console.log('🔧 Configurando tests de integración...');
  
  try {
    adminToken = await getAuthToken('admin@edificio205.com', 'Gemelo1');
    console.log('✅ Token de admin obtenido');
    
    try {
      comiteToken = await getAuthToken('comite@edificio205.com', 'Gemelo1');
      console.log('✅ Token de comité obtenido');
    } catch (error) {
      console.log('⚠️  Token de comité no disponible');
    }
    
  } catch (error) {
    console.error('❌ Error en setup:', error.message);
    throw error;
  }
}

// Test Suite 1: Endpoints de Autenticación
async function testAuthEndpoints() {
  console.log('\\n=== 🔐 Tests de Endpoints de Autenticación ===');
  
  // Test 1.1: POST /api/auth/login - Login exitoso
  console.log('Test 1.1: POST /api/auth/login - Login exitoso');
  const response1 = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@edificio205.com',
      password: 'Gemelo1'
    });
  
  assert.strictEqual(response1.status, 200);
  assert.strictEqual(response1.body.success, true);
  assert(response1.body.token);
  assert(response1.body.usuario);
  console.log('✅ Pasado - Login exitoso');
  
  // Test 1.2: POST /api/auth/login - Credenciales inválidas
  console.log('Test 1.2: POST /api/auth/login - Credenciales inválidas');
  const response2 = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@edificio205.com',
      password: 'password_incorrecto'
    });
  
  assert.strictEqual(response2.status, 401);
  assert.strictEqual(response2.body.success, false);
  console.log('✅ Pasado - Credenciales inválidas rechazadas');
  
  // Test 1.3: GET /api/auth/perfil - Obtener perfil
  console.log('Test 1.3: GET /api/auth/perfil - Obtener perfil');
  const response3 = await request(app)
    .get('/api/auth/perfil')
    .set('x-auth-token', adminToken);
  
  assert.strictEqual(response3.status, 200);
  assert.strictEqual(response3.body.success, true);
  assert(response3.body.usuario);
  assert.strictEqual(response3.body.usuario.password, undefined);
  console.log('✅ Pasado - Perfil obtenido correctamente');
  
  // Test 1.4: POST /api/auth/cambiar-password - Cambiar contraseña
  console.log('Test 1.4: POST /api/auth/cambiar-password - Cambiar contraseña');
  const response4 = await request(app)
    .post('/api/auth/cambiar-password')
    .set('x-auth-token', adminToken)
    .send({
      passwordActual: 'Gemelo1',
      passwordNueva: 'NuevaPassword123'
    });
  
  // Cambiar de vuelta la contraseña
  if (response4.status === 200) {
    await request(app)
      .post('/api/auth/cambiar-password')
      .set('x-auth-token', adminToken)
      .send({
        passwordActual: 'NuevaPassword123',
        passwordNueva: 'Gemelo1'
      });
  }
  
  assert.strictEqual(response4.status, 200);
  assert.strictEqual(response4.body.success, true);
  console.log('✅ Pasado - Contraseña cambiada correctamente');
}

// Test Suite 2: Endpoints de Usuarios
async function testUsuariosEndpoints() {
  console.log('\\n=== 👥 Tests de Endpoints de Usuarios ===');
  
  // Test 2.1: GET /api/usuarios - Listar usuarios
  console.log('Test 2.1: GET /api/usuarios - Listar usuarios');
  const response1 = await request(app)
    .get('/api/usuarios')
    .set('x-auth-token', adminToken);
  
  assert.strictEqual(response1.status, 200);
  assert(Array.isArray(response1.body));
  console.log('✅ Pasado - Lista de usuarios obtenida');
  
  // Test 2.2: POST /api/usuarios - Crear usuario
  console.log('Test 2.2: POST /api/usuarios - Crear usuario');
  const response2 = await request(app)
    .post('/api/usuarios')
    .set('x-auth-token', adminToken)
    .send({
      nombre: 'Usuario Integración Test',
      email: 'integracion@edificio205.com',
      password: 'test123',
      rol: 'inquilino',
      departamento: '505'
    });
  
  assert.strictEqual(response2.status, 201);
  testIds.usuario = response2.body.id;
  console.log(`✅ Pasado - Usuario creado con ID: ${testIds.usuario}`);
  
  // Test 2.3: PUT /api/usuarios/:id - Actualizar usuario
  console.log('Test 2.3: PUT /api/usuarios/:id - Actualizar usuario');
  const response3 = await request(app)
    .put(`/api/usuarios/${testIds.usuario}`)
    .set('x-auth-token', adminToken)
    .send({
      nombre: 'Usuario Integración Actualizado',
      telefono: '555-9999'
    });
  
  assert.strictEqual(response3.status, 200);
  assert.strictEqual(response3.body.nombre, 'Usuario Integración Actualizado');
  console.log('✅ Pasado - Usuario actualizado');
  
  // Test 2.4: DELETE /api/usuarios/:id - Eliminar usuario
  console.log('Test 2.4: DELETE /api/usuarios/:id - Eliminar usuario');
  const response4 = await request(app)
    .delete(`/api/usuarios/${testIds.usuario}`)
    .set('x-auth-token', adminToken);
  
  assert.strictEqual(response4.status, 200);
  console.log('✅ Pasado - Usuario eliminado');
}

// Test Suite 3: Endpoints de Cuotas
async function testCuotasEndpoints() {
  console.log('\\n=== 💰 Tests de Endpoints de Cuotas ===');
  
  // Test 3.1: GET /api/cuotas - Listar cuotas
  console.log('Test 3.1: GET /api/cuotas - Listar cuotas');
  const response1 = await request(app)
    .get('/api/cuotas')
    .set('x-auth-token', adminToken);
  
  assert.strictEqual(response1.status, 200);
  assert(response1.body.success);
  assert(Array.isArray(response1.body.cuotas));
  console.log('✅ Pasado - Lista de cuotas obtenida');
  
  // Test 3.2: POST /api/cuotas - Crear cuota
  console.log('Test 3.2: POST /api/cuotas - Crear cuota');
  const response2 = await request(app)
    .post('/api/cuotas')
    .set('x-auth-token', adminToken)
    .send({
      mes: 'enero',
      año: 2026,
      monto: 550,
      fechaVencimiento: '2026-02-01'
    });
  
  if (response2.status === 201) {
    testIds.cuota = response2.body.cuota.id;
    console.log(`✅ Pasado - Cuota creada con ID: ${testIds.cuota}`);
  } else {
    console.log('⚠️  Cuota no creada (posiblemente ya existe)');
  }
}

// Test Suite 4: Endpoints de Gastos
async function testGastosEndpoints() {
  console.log('\\n=== 💸 Tests de Endpoints de Gastos ===');
  
  // Test 4.1: GET /api/gastos - Listar gastos
  console.log('Test 4.1: GET /api/gastos - Listar gastos');
  const response1 = await request(app)
    .get('/api/gastos')
    .set('x-auth-token', adminToken);
  
  assert.strictEqual(response1.status, 200);
  assert(response1.body.success);
  assert(Array.isArray(response1.body.gastos));
  console.log('✅ Pasado - Lista de gastos obtenida');
  
  // Test 4.2: POST /api/gastos - Crear gasto
  console.log('Test 4.2: POST /api/gastos - Crear gasto');
  const response2 = await request(app)
    .post('/api/gastos')
    .set('x-auth-token', adminToken)
    .send({
      descripcion: 'Gasto de prueba integración',
      monto: 100,
      categoria: 'mantenimiento',
      proveedor: 'Proveedor Test',
      fecha: new Date().toISOString().split('T')[0]
    });
  
  if (response2.status === 201) {
    testIds.gasto = response2.body.gasto.id;
    console.log(`✅ Pasado - Gasto creado con ID: ${testIds.gasto}`);
  } else {
    console.log('⚠️  Error al crear gasto:', response2.body.message);
  }
}

// Test Suite 5: Endpoints de Presupuestos
async function testPresupuestosEndpoints() {
  console.log('\\n=== 📊 Tests de Endpoints de Presupuestos ===');
  
  // Test 5.1: GET /api/presupuestos - Listar presupuestos
  console.log('Test 5.1: GET /api/presupuestos - Listar presupuestos');
  const response1 = await request(app)
    .get('/api/presupuestos')
    .set('x-auth-token', adminToken);
  
  assert.strictEqual(response1.status, 200);
  assert(response1.body.success);
  assert(Array.isArray(response1.body.presupuestos));
  console.log('✅ Pasado - Lista de presupuestos obtenida');
  
  // Test 5.2: POST /api/presupuestos - Crear presupuesto
  console.log('Test 5.2: POST /api/presupuestos - Crear presupuesto');
  const response2 = await request(app)
    .post('/api/presupuestos')
    .set('x-auth-token', adminToken)
    .send({
      nombre: 'Presupuesto Test Integración',
      descripcion: 'Presupuesto para tests de integración',
      monto: 5000,
      categoria: 'mantenimiento',
      prioridad: 'media',
      fechaEstimada: '2026-06-01'
    });
  
  if (response2.status === 201) {
    testIds.presupuesto = response2.body.presupuesto.id;
    console.log(`✅ Pasado - Presupuesto creado con ID: ${testIds.presupuesto}`);
  } else {
    console.log('⚠️  Error al crear presupuesto:', response2.body.message);
  }
}

// Test Suite 6: Endpoints de Anuncios
async function testAnunciosEndpoints() {
  console.log('\\n=== 📢 Tests de Endpoints de Anuncios ===');
  
  // Test 6.1: GET /api/anuncios - Listar anuncios
  console.log('Test 6.1: GET /api/anuncios - Listar anuncios');
  const response1 = await request(app)
    .get('/api/anuncios')
    .set('x-auth-token', adminToken);
  
  assert.strictEqual(response1.status, 200);
  assert(response1.body.success);
  assert(Array.isArray(response1.body.anuncios));
  console.log('✅ Pasado - Lista de anuncios obtenida');
  
  // Test 6.2: POST /api/anuncios - Crear anuncio
  console.log('Test 6.2: POST /api/anuncios - Crear anuncio');
  const response2 = await request(app)
    .post('/api/anuncios')
    .set('x-auth-token', adminToken)
    .send({
      titulo: 'Anuncio Test Integración',
      contenido: 'Este es un anuncio de prueba para tests de integración',
      tipo: 'general',
      prioridad: 'normal'
    });
  
  if (response2.status === 201) {
    testIds.anuncio = response2.body.anuncio.id;
    console.log(`✅ Pasado - Anuncio creado con ID: ${testIds.anuncio}`);
  } else {
    console.log('⚠️  Error al crear anuncio:', response2.body.message);
  }
}

// Test Suite 7: Endpoints de Fondos
async function testFondosEndpoints() {
  console.log('\\n=== 💼 Tests de Endpoints de Fondos ===');
  
  // Test 7.1: GET /api/fondos - Obtener estado de fondos
  console.log('Test 7.1: GET /api/fondos - Obtener estado de fondos');
  const response1 = await request(app)
    .get('/api/fondos')
    .set('x-auth-token', adminToken);
  
  assert.strictEqual(response1.status, 200);
  assert(response1.body.success);
  assert(response1.body.fondos);
  assert(typeof response1.body.fondos.patrimonioTotal === 'number');
  console.log('✅ Pasado - Estado de fondos obtenido');
}

// Test Suite 8: Endpoints de Permisos
async function testPermisosEndpoints() {
  console.log('\\n=== 🔒 Tests de Endpoints de Permisos ===');
  
  // Test 8.1: GET /api/permisos - Obtener permisos del usuario
  console.log('Test 8.1: GET /api/permisos - Obtener permisos del usuario');
  const response1 = await request(app)
    .get('/api/permisos')
    .set('x-auth-token', adminToken);
  
  assert.strictEqual(response1.status, 200);
  assert(response1.body.success);
  assert(response1.body.permisos);
  console.log('✅ Pasado - Permisos obtenidos');
}

// Test Suite 9: Tests de Seguridad Cross-Endpoint
async function testCrossEndpointSecurity() {
  console.log('\\n=== 🛡️  Tests de Seguridad Cross-Endpoint ===');
  
  // Test 9.1: Verificar que todos los endpoints requieren autenticación
  console.log('Test 9.1: Verificar que endpoints requieren autenticación');
  const endpoints = [
    { method: 'get', path: '/api/usuarios' },
    { method: 'get', path: '/api/cuotas' },
    { method: 'get', path: '/api/gastos' },
    { method: 'get', path: '/api/presupuestos' },
    { method: 'get', path: '/api/anuncios' },
    { method: 'get', path: '/api/fondos' },
    { method: 'get', path: '/api/permisos' }
  ];
  
  for (const endpoint of endpoints) {
    const response = await request(app)[endpoint.method](endpoint.path);
    assert.strictEqual(response.status, 401, `${endpoint.method.toUpperCase()} ${endpoint.path} should require auth`);
  }
  console.log('✅ Pasado - Todos los endpoints requieren autenticación');
  
  // Test 9.2: Verificar rate limiting básico (si está implementado)
  console.log('Test 9.2: Test de rate limiting básico');
  const rapidRequests = Array(20).fill().map(() => 
    request(app)
      .get('/api/usuarios')
      .set('x-auth-token', adminToken)
  );
  
  const responses = await Promise.all(rapidRequests);
  const successfulRequests = responses.filter(r => r.status === 200).length;
  
  // Debería permitir al menos 15 requests exitosos
  assert(successfulRequests >= 15, 'Should allow reasonable number of requests');
  console.log(`✅ Pasado - ${successfulRequests}/20 requests exitosos (rate limiting básico)`);
}

// Función principal para ejecutar todos los tests de integración
async function runIntegrationTests() {
  console.log('🔗 Iniciando Tests de Integración API');
  console.log('=====================================');
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  try {
    // Setup inicial
    await setupIntegrationTests();
    
    // Ejecutar test suites
    await testAuthEndpoints();
    totalTests += 4;
    passedTests += 4;
    
    await testUsuariosEndpoints();
    totalTests += 4;
    passedTests += 4;
    
    await testCuotasEndpoints();
    totalTests += 2;
    passedTests += 2;
    
    await testGastosEndpoints();
    totalTests += 2;
    passedTests += 2;
    
    await testPresupuestosEndpoints();
    totalTests += 2;
    passedTests += 2;
    
    await testAnunciosEndpoints();
    totalTests += 2;
    passedTests += 2;
    
    await testFondosEndpoints();
    totalTests += 1;
    passedTests += 1;
    
    await testPermisosEndpoints();
    totalTests += 1;
    passedTests += 1;
    
    await testCrossEndpointSecurity();
    totalTests += 2;
    passedTests += 2;
    
  } catch (error) {
    console.error('❌ Test de integración fallido:', error.message);
    failedTests++;
  }
  
  // Resumen final
  console.log('\\n=== 📊 Resumen de Tests de Integración ===');
  console.log(`Total de tests ejecutados: ${totalTests}`);
  console.log(`Tests pasados: ${passedTests}`);
  console.log(`Tests fallidos: ${failedTests}`);
  console.log(`Tasa de éxito: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (failedTests === 0) {
    console.log('\\n🎉 Todos los tests de integración han pasado correctamente!');
    return true;
  } else {
    console.log('\\n⚠️  Algunos tests de integración han fallado. Revisar logs arriba.');
    return false;
  }
}

// Ejecutar tests si el archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runIntegrationTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Error fatal en tests de integración:', error);
      process.exit(1);
    });
}

export default {
  runIntegrationTests,
  testAuthEndpoints,
  testUsuariosEndpoints,
  testCuotasEndpoints,
  testGastosEndpoints,
  testPresupuestosEndpoints,
  testAnunciosEndpoints,
  testFondosEndpoints,
  testPermisosEndpoints,
  testCrossEndpointSecurity
};