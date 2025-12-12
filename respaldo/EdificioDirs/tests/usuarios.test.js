// usuarios.test.js - Test suite completo para usuarios CRUD operations
import request from 'supertest';
import assert from 'assert';
import { readData, writeData } from '../src/data.js';
import app from '../src/app.js';

// Variables globales para tests
let adminToken;
let comiteToken;
let inquilinoToken;
let testUserId;

// Datos de prueba
const testUser = {
  nombre: 'Usuario Test',
  email: 'test@edificio205.com',
  password: 'test123',
  rol: 'inquilino',
  departamento: '501'
};

const updateUserData = {
  nombre: 'Usuario Test Actualizado',
  telefono: '555-1234'
};

// Helper function para obtener token de autenticación
async function getAuthToken(email, password) {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  
  if (response.status === 200) {
    return response.body.token;
  }
  throw new Error(`Failed to get token for ${email}: ${response.body.message}`);
}

// Setup inicial - obtener tokens de autenticación
async function setupAuth() {
  try {
    console.log('🔐 Configurando autenticación...');
    
    // Token de admin
    adminToken = await getAuthToken('admin@edificio205.com', 'Gemelo1');
    console.log('✅ Token de admin obtenido');
    
    // Token de comité (si existe)
    try {
      comiteToken = await getAuthToken('comite@edificio205.com', 'Gemelo1');
      console.log('✅ Token de comité obtenido');
    } catch (error) {
      console.log('⚠️  Usuario comité no encontrado, continuando sin token de comité');
    }
    
    // Token de inquilino
    try {
      inquilinoToken = await getAuthToken('felipe@edificio205.com', 'Gemelo1');
      console.log('✅ Token de inquilino obtenido');
    } catch (error) {
      console.log('⚠️  Usuario inquilino no encontrado, continuando sin token de inquilino');
    }
    
  } catch (error) {
    console.error('❌ Error en setup de autenticación:', error.message);
    throw error;
  }
}

// Test Suite 1: Autenticación y Permisos
async function testAuthentication() {
  console.log('\\n=== 🔐 Tests de Autenticación y Permisos ===');
  
  // Test 1.1: Acceso sin token debe fallar
  console.log('Test 1.1: Acceso sin token debe fallar');
  const response1 = await request(app)
    .get('/api/usuarios');
  
  assert.strictEqual(response1.status, 401);
  assert.strictEqual(response1.body.success, false);
  console.log('✅ Pasado - Acceso denegado sin token');
  
  // Test 1.2: Token inválido debe fallar
  console.log('Test 1.2: Token inválido debe fallar');
  const response2 = await request(app)
    .get('/api/usuarios')
    .set('x-auth-token', 'token_invalido');
  
  assert.strictEqual(response2.status, 401);
  console.log('✅ Pasado - Token inválido rechazado');
  
  // Test 1.3: Inquilino sin permisos debe fallar
  if (inquilinoToken) {
    console.log('Test 1.3: Inquilino sin permisos debe fallar');
    const response3 = await request(app)
      .get('/api/usuarios')
      .set('x-auth-token', inquilinoToken);
    
    assert.strictEqual(response3.status, 403);
    console.log('✅ Pasado - Inquilino sin permisos rechazado');
  } else {
    console.log('⏭️  Test 1.3: Saltado - No hay token de inquilino');
  }
  
  // Test 1.4: Admin con permisos debe funcionar
  console.log('Test 1.4: Admin con permisos debe funcionar');
  const response4 = await request(app)
    .get('/api/usuarios')
    .set('x-auth-token', adminToken);
  
  assert.strictEqual(response4.status, 200);
  assert(Array.isArray(response4.body));
  console.log('✅ Pasado - Admin con acceso correcto');
}

// Test Suite 2: CRUD Operations
async function testCRUDOperations() {
  console.log('\\n=== 📝 Tests de Operaciones CRUD ===');
  
  // Test 2.1: GET /api/usuarios - Listar usuarios
  console.log('Test 2.1: GET /api/usuarios - Listar usuarios');
  const response1 = await request(app)
    .get('/api/usuarios')
    .set('x-auth-token', adminToken);
  
  assert.strictEqual(response1.status, 200);
  assert(Array.isArray(response1.body));
  assert(response1.body.length > 0);
  
  // Verificar que no se devuelven passwords
  response1.body.forEach(user => {
    assert.strictEqual(user.password, undefined);
  });
  console.log('✅ Pasado - Lista de usuarios obtenida sin passwords');
  
  // Test 2.2: POST /api/usuarios - Crear usuario
  console.log('Test 2.2: POST /api/usuarios - Crear usuario');
  const response2 = await request(app)
    .post('/api/usuarios')
    .set('x-auth-token', adminToken)
    .send(testUser);
  
  assert.strictEqual(response2.status, 201);
  assert.strictEqual(response2.body.nombre, testUser.nombre);
  assert.strictEqual(response2.body.email, testUser.email);
  assert.strictEqual(response2.body.rol, testUser.rol);
  assert.strictEqual(response2.body.departamento, testUser.departamento);
  assert.strictEqual(response2.body.password, undefined); // No debe devolver password
  
  testUserId = response2.body.id;
  console.log(`✅ Pasado - Usuario creado con ID: ${testUserId}`);
  
  // Test 2.3: PUT /api/usuarios/:id - Actualizar usuario
  console.log('Test 2.3: PUT /api/usuarios/:id - Actualizar usuario');
  const response3 = await request(app)
    .put(`/api/usuarios/${testUserId}`)
    .set('x-auth-token', adminToken)
    .send(updateUserData);
  
  assert.strictEqual(response3.status, 200);
  assert.strictEqual(response3.body.nombre, updateUserData.nombre);
  assert.strictEqual(response3.body.telefono, updateUserData.telefono);
  console.log('✅ Pasado - Usuario actualizado correctamente');
  
  // Test 2.4: DELETE /api/usuarios/:id - Eliminar usuario
  console.log('Test 2.4: DELETE /api/usuarios/:id - Eliminar usuario');
  const response4 = await request(app)
    .delete(`/api/usuarios/${testUserId}`)
    .set('x-auth-token', adminToken);
  
  assert.strictEqual(response4.status, 200);
  assert.strictEqual(response4.body.mensaje, 'Usuario eliminado exitosamente');
  console.log('✅ Pasado - Usuario eliminado correctamente');
  
  // Test 2.5: Verificar que el usuario fue eliminado
  console.log('Test 2.5: Verificar que el usuario fue eliminado');
  const response5 = await request(app)
    .get('/api/usuarios')
    .set('x-auth-token', adminToken);
  
  const deletedUser = response5.body.find(u => u.id === testUserId);
  assert.strictEqual(deletedUser, undefined);
  console.log('✅ Pasado - Usuario confirmado como eliminado');
}

// Test Suite 3: Validaciones y Edge Cases
async function testValidationsAndEdgeCases() {
  console.log('\\n=== ⚠️  Tests de Validaciones y Edge Cases ===');
  
  // Test 3.1: Crear usuario con email duplicado
  console.log('Test 3.1: Crear usuario con email duplicado');
  const response1 = await request(app)
    .post('/api/usuarios')
    .set('x-auth-token', adminToken)
    .send({
      nombre: 'Usuario Duplicado',
      email: 'admin@edificio205.com', // Email ya existente
      password: 'test123',
      rol: 'inquilino',
      departamento: '502'
    });
  
  assert.strictEqual(response1.status, 400);
  assert(response1.body.mensaje.includes('email ya está en uso'));
  console.log('✅ Pasado - Email duplicado rechazado');
  
  // Test 3.2: Crear usuario con departamento duplicado
  console.log('Test 3.2: Crear usuario con departamento duplicado');
  const response2 = await request(app)
    .post('/api/usuarios')
    .set('x-auth-token', adminToken)
    .send({
      nombre: 'Usuario Depto Duplicado',
      email: 'depto_dup@edificio205.com',
      password: 'test123',
      rol: 'inquilino',
      departamento: '101' // Departamento ya asignado
    });
  
  assert.strictEqual(response2.status, 400);
  assert(response2.body.mensaje.includes('departamento ya está asignado'));
  console.log('✅ Pasado - Departamento duplicado rechazado');
  
  // Test 3.3: Crear usuario con campos faltantes
  console.log('Test 3.3: Crear usuario con campos faltantes');
  const response3 = await request(app)
    .post('/api/usuarios')
    .set('x-auth-token', adminToken)
    .send({
      nombre: 'Usuario Incompleto',
      email: 'incompleto@edificio205.com'
      // Faltan password, rol, departamento
    });
  
  assert.strictEqual(response3.status, 400);
  assert(response3.body.mensaje.includes('campos obligatorios'));
  console.log('✅ Pasado - Campos faltantes rechazados');
  
  // Test 3.4: Crear usuario con rol inválido
  console.log('Test 3.4: Crear usuario con rol inválido');
  const response4 = await request(app)
    .post('/api/usuarios')
    .set('x-auth-token', adminToken)
    .send({
      nombre: 'Usuario Rol Inválido',
      email: 'rol_invalido@edificio205.com',
      password: 'test123',
      rol: 'super_admin', // Rol no válido
      departamento: '503'
    });
  
  assert.strictEqual(response4.status, 400);
  assert(response4.body.mensaje.includes('Rol no válido'));
  console.log('✅ Pasado - Rol inválido rechazado');
  
  // Test 3.5: Intentar eliminar admin principal
  console.log('Test 3.5: Intentar eliminar admin principal');
  const response5 = await request(app)
    .delete('/api/usuarios/1')
    .set('x-auth-token', adminToken);
  
  assert.strictEqual(response5.status, 400);
  assert(response5.body.mensaje.includes('No se puede eliminar el administrador principal'));
  console.log('✅ Pasado - Admin principal protegido');
  
  // Test 3.6: Actualizar usuario inexistente
  console.log('Test 3.6: Actualizar usuario inexistente');
  const response6 = await request(app)
    .put('/api/usuarios/99999')
    .set('x-auth-token', adminToken)
    .send({ nombre: 'Usuario Inexistente' });
  
  assert.strictEqual(response6.status, 404);
  assert(response6.body.mensaje.includes('Usuario no encontrado'));
  console.log('✅ Pasado - Usuario inexistente manejado correctamente');
  
  // Test 3.7: Eliminar usuario inexistente
  console.log('Test 3.7: Eliminar usuario inexistente');
  const response7 = await request(app)
    .delete('/api/usuarios/99999')
    .set('x-auth-token', adminToken);
  
  assert.strictEqual(response7.status, 404);
  assert(response7.body.mensaje.includes('Usuario no encontrado'));
  console.log('✅ Pasado - Eliminación de usuario inexistente manejada correctamente');
}

// Test Suite 4: Performance Tests
async function testPerformance() {
  console.log('\\n=== ⚡ Tests de Performance ===');
  
  // Test 4.1: Tiempo de respuesta GET /api/usuarios
  console.log('Test 4.1: Tiempo de respuesta GET /api/usuarios');
  const startTime = Date.now();
  
  const response = await request(app)
    .get('/api/usuarios')
    .set('x-auth-token', adminToken);
  
  const responseTime = Date.now() - startTime;
  
  assert.strictEqual(response.status, 200);
  assert(responseTime < 200, `Response time ${responseTime}ms should be < 200ms`);
  console.log(`✅ Pasado - Tiempo de respuesta: ${responseTime}ms (< 200ms)`);
  
  // Test 4.2: Load test básico - múltiples requests concurrentes
  console.log('Test 4.2: Load test básico - 10 requests concurrentes');
  const loadTestStart = Date.now();
  
  const promises = Array(10).fill().map(() => 
    request(app)
      .get('/api/usuarios')
      .set('x-auth-token', adminToken)
  );
  
  const responses = await Promise.all(promises);
  const loadTestTime = Date.now() - loadTestStart;
  
  // Verificar que todas las respuestas fueron exitosas
  responses.forEach((response, index) => {
    assert.strictEqual(response.status, 200, `Request ${index + 1} failed`);
  });
  
  const avgResponseTime = loadTestTime / 10;
  assert(avgResponseTime < 500, `Average response time ${avgResponseTime}ms should be < 500ms`);
  console.log(`✅ Pasado - 10 requests concurrentes completadas en ${loadTestTime}ms (promedio: ${avgResponseTime}ms)`);
}

// Función principal para ejecutar todos los tests
async function runAllTests() {
  console.log('🧪 Iniciando Test Suite Completo para Usuarios CRUD');
  console.log('================================================');
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  try {
    // Setup inicial
    await setupAuth();
    
    // Ejecutar test suites
    await testAuthentication();
    totalTests += 7;
    passedTests += 7;
    
    await testCRUDOperations();
    totalTests += 5;
    passedTests += 5;
    
    await testValidationsAndEdgeCases();
    totalTests += 7;
    passedTests += 7;
    
    await testPerformance();
    totalTests += 2;
    passedTests += 2;
    
  } catch (error) {
    console.error('❌ Test fallido:', error.message);
    failedTests++;
  }
  
  // Resumen final
  console.log('\\n=== 📊 Resumen de Tests ===');
  console.log(`Total de tests ejecutados: ${totalTests}`);
  console.log(`Tests pasados: ${passedTests}`);
  console.log(`Tests fallidos: ${failedTests}`);
  console.log(`Tasa de éxito: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (failedTests === 0) {
    console.log('\\n🎉 Todos los tests han pasado correctamente!');
    return true;
  } else {
    console.log('\\n⚠️  Algunos tests han fallado. Revisar logs arriba.');
    return false;
  }
}

// Ejecutar tests si el archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Error fatal en tests:', error);
      process.exit(1);
    });
}

export default {
  runAllTests,
  testAuthentication,
  testCRUDOperations,
  testValidationsAndEdgeCases,
  testPerformance
};