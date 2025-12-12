// api-validation.test.js - Tests de validación API usando curl
import { exec } from 'child_process';
import { promisify } from 'util';
import assert from 'assert';

const execAsync = promisify(exec);

// Configuración
const BASE_URL = 'http://localhost:3002';
let adminToken = null;

// Helper para ejecutar curl
async function curlRequest(method, endpoint, data = null, token = null, expectStatus = 200) {
  let curlCmd = `curl -s -w "\\n%{http_code}" -X ${method.toUpperCase()} ${BASE_URL}${endpoint}`;
  
  if (token) {
    curlCmd += ` -H "x-auth-token: ${token}"`;
  }
  
  if (data) {
    curlCmd += ` -H "Content-Type: application/json" -d '${JSON.stringify(data)}'`;
  }
  
  try {
    const { stdout } = await execAsync(curlCmd);
    const lines = stdout.trim().split('\n');
    const statusCode = parseInt(lines[lines.length - 1]);
    const responseBody = lines.slice(0, -1).join('\n');
    
    let parsedBody = null;
    try {
      parsedBody = JSON.parse(responseBody);
    } catch (e) {
      parsedBody = responseBody;
    }
    
    return {
      status: statusCode,
      body: parsedBody,
      raw: responseBody
    };
  } catch (error) {
    throw new Error(`Curl request failed: ${error.message}`);
  }
}

// Setup - obtener token de admin
async function setupApiTests() {
  console.log('🔐 Obteniendo token de administrador...');
  
  const loginResponse = await curlRequest('POST', '/api/auth/login', {
    email: 'admin@edificio205.com',
    password: 'Gemelo1'
  });
  
  assert.strictEqual(loginResponse.status, 200, 'Login should succeed');
  assert(loginResponse.body.token, 'Login should return token');
  
  adminToken = loginResponse.body.token;
  console.log('✅ Token obtenido exitosamente');
}

// Test Suite 1: API Endpoints Validation
async function testApiEndpoints() {
  console.log('\\n=== 🔗 Tests de Validación de Endpoints API ===');
  
  // Test 1.1: GET /api/usuarios
  console.log('Test 1.1: GET /api/usuarios');
  const usuariosResponse = await curlRequest('GET', '/api/usuarios', null, adminToken);
  
  assert.strictEqual(usuariosResponse.status, 200, 'GET usuarios should return 200');
  assert(Array.isArray(usuariosResponse.body), 'Response should be an array');
  assert(usuariosResponse.body.length > 0, 'Should have at least one user');
  
  // Verificar que no se devuelven passwords
  usuariosResponse.body.forEach(user => {
    assert.strictEqual(user.password, undefined, 'Password should not be returned');
  });
  console.log(`✅ Obtenidos ${usuariosResponse.body.length} usuarios sin passwords`);
  
  // Test 1.2: POST /api/usuarios - Crear usuario
  console.log('Test 1.2: POST /api/usuarios - Crear usuario');
  const newUser = {
    nombre: 'Usuario API Test',
    email: 'apitest@edificio205.com',
    password: 'test123',
    rol: 'INQUILINO',
    departamento: '103'
  };
  
  const createResponse = await curlRequest('POST', '/api/usuarios', newUser, adminToken);
  
  assert.strictEqual(createResponse.status, 201, 'POST usuarios should return 201');
  assert.strictEqual(createResponse.body.nombre, newUser.nombre, 'Name should match');
  assert.strictEqual(createResponse.body.email, newUser.email, 'Email should match');
  assert.strictEqual(createResponse.body.password, undefined, 'Password should not be returned');
  
  const createdUserId = createResponse.body.id;
  console.log(`✅ Usuario creado con ID: ${createdUserId}`);
  
  // Test 1.3: PUT /api/usuarios/:id - Actualizar usuario
  console.log('Test 1.3: PUT /api/usuarios/:id - Actualizar usuario');
  const updateData = {
    nombre: 'Usuario API Test Actualizado',
    telefono: '555-API-TEST'
  };
  
  const updateResponse = await curlRequest('PUT', `/api/usuarios/${createdUserId}`, updateData, adminToken);
  
  assert.strictEqual(updateResponse.status, 200, 'PUT usuarios should return 200');
  assert.strictEqual(updateResponse.body.nombre, updateData.nombre, 'Updated name should match');
  assert.strictEqual(updateResponse.body.telefono, updateData.telefono, 'Updated phone should match');
  console.log('✅ Usuario actualizado correctamente');
  
  // Test 1.4: DELETE /api/usuarios/:id - Eliminar usuario
  console.log('Test 1.4: DELETE /api/usuarios/:id - Eliminar usuario');
  const deleteResponse = await curlRequest('DELETE', `/api/usuarios/${createdUserId}`, null, adminToken);
  
  assert.strictEqual(deleteResponse.status, 200, 'DELETE usuarios should return 200');
  assert(deleteResponse.body.mensaje.includes('eliminado'), 'Should confirm deletion');
  console.log('✅ Usuario eliminado correctamente');
  
  // Test 1.5: Verificar que el usuario fue eliminado
  console.log('Test 1.5: Verificar eliminación');
  const verifyResponse = await curlRequest('GET', '/api/usuarios', null, adminToken);
  const deletedUser = verifyResponse.body.find(u => u.id === createdUserId);
  
  assert.strictEqual(deletedUser, undefined, 'Deleted user should not exist');
  console.log('✅ Eliminación verificada');
}

// Test Suite 2: Authentication and Authorization
async function testAuthAndAuth() {
  console.log('\\n=== 🔐 Tests de Autenticación y Autorización ===');
  
  // Test 2.1: Acceso sin token
  console.log('Test 2.1: Acceso sin token debe fallar');
  const noTokenResponse = await curlRequest('GET', '/api/usuarios');
  
  assert.strictEqual(noTokenResponse.status, 401, 'No token should return 401');
  console.log('✅ Acceso sin token rechazado');
  
  // Test 2.2: Token inválido
  console.log('Test 2.2: Token inválido debe fallar');
  const invalidTokenResponse = await curlRequest('GET', '/api/usuarios', null, 'invalid_token');
  
  assert.strictEqual(invalidTokenResponse.status, 401, 'Invalid token should return 401');
  console.log('✅ Token inválido rechazado');
  
  // Test 2.3: Obtener perfil
  console.log('Test 2.3: Obtener perfil de usuario');
  const profileResponse = await curlRequest('GET', '/api/auth/perfil', null, adminToken);
  
  assert.strictEqual(profileResponse.status, 200, 'Profile should return 200');
  assert(profileResponse.body.usuario, 'Should return user data');
  assert.strictEqual(profileResponse.body.usuario.password, undefined, 'Password should not be returned');
  console.log('✅ Perfil obtenido correctamente');
}

// Test Suite 3: Data Validation
async function testDataValidation() {
  console.log('\\n=== ✅ Tests de Validación de Datos ===');
  
  // Test 3.1: Email duplicado
  console.log('Test 3.1: Email duplicado debe fallar');
  const duplicateEmailUser = {
    nombre: 'Usuario Duplicado',
    email: 'admin@edificio205.com', // Email ya existente
    password: 'test123',
    rol: 'INQUILINO',
    departamento: '302'
  };
  
  const duplicateResponse = await curlRequest('POST', '/api/usuarios', duplicateEmailUser, adminToken);
  
  assert.strictEqual(duplicateResponse.status, 400, 'Duplicate email should return 400');
  assert(duplicateResponse.body.mensaje.includes('email'), 'Should mention email error');
  console.log('✅ Email duplicado rechazado');
  
  // Test 3.2: Campos faltantes
  console.log('Test 3.2: Campos faltantes deben fallar');
  const incompleteUser = {
    nombre: 'Usuario Incompleto',
    email: 'incompleto@test.com'
    // Faltan password, rol, departamento
  };
  
  const incompleteResponse = await curlRequest('POST', '/api/usuarios', incompleteUser, adminToken);
  
  assert.strictEqual(incompleteResponse.status, 400, 'Incomplete data should return 400');
  assert(incompleteResponse.body.mensaje.includes('obligatorios'), 'Should mention required fields');
  console.log('✅ Campos faltantes rechazados');
  
  // Test 3.3: Rol inválido
  console.log('Test 3.3: Rol inválido debe fallar');
  const invalidRoleUser = {
    nombre: 'Usuario Rol Inválido',
    email: 'invalidrole@test.com',
    password: 'test123',
    rol: 'super_admin', // Rol no válido
    departamento: '303'
  };
  
  const invalidRoleResponse = await curlRequest('POST', '/api/usuarios', invalidRoleUser, adminToken);
  
  assert.strictEqual(invalidRoleResponse.status, 400, 'Invalid role should return 400');
  assert(invalidRoleResponse.body.mensaje.includes('Rol'), 'Should mention role error');
  console.log('✅ Rol inválido rechazado');
}

// Test Suite 4: Security Tests
async function testSecurity() {
  console.log('\\n=== 🛡️  Tests de Seguridad ===');
  
  // Test 4.1: Protección del admin principal
  console.log('Test 4.1: Protección del admin principal');
  const deleteAdminResponse = await curlRequest('DELETE', '/api/usuarios/1', null, adminToken);
  
  assert.strictEqual(deleteAdminResponse.status, 400, 'Delete admin should return 400');
  assert(deleteAdminResponse.body.mensaje.includes('administrador principal'), 'Should mention admin protection');
  console.log('✅ Admin principal protegido');
  
  // Test 4.2: Usuario inexistente
  console.log('Test 4.2: Usuario inexistente');
  const nonExistentResponse = await curlRequest('PUT', '/api/usuarios/99999', { nombre: 'Test' }, adminToken);
  
  assert.strictEqual(nonExistentResponse.status, 404, 'Non-existent user should return 404');
  assert(nonExistentResponse.body.mensaje.includes('no encontrado'), 'Should mention not found');
  console.log('✅ Usuario inexistente manejado correctamente');
}

// Test Suite 5: Performance básico
async function testBasicPerformance() {
  console.log('\\n=== ⚡ Tests de Performance Básico ===');
  
  // Test 5.1: Tiempo de respuesta
  console.log('Test 5.1: Tiempo de respuesta');
  const startTime = Date.now();
  
  const perfResponse = await curlRequest('GET', '/api/usuarios', null, adminToken);
  
  const responseTime = Date.now() - startTime;
  
  assert.strictEqual(perfResponse.status, 200, 'Performance test should succeed');
  assert(responseTime < 1000, `Response time ${responseTime}ms should be < 1000ms`);
  console.log(`✅ Tiempo de respuesta: ${responseTime}ms`);
  
  // Test 5.2: Múltiples requests secuenciales
  console.log('Test 5.2: Múltiples requests secuenciales');
  const sequentialStartTime = Date.now();
  
  for (let i = 0; i < 5; i++) {
    const response = await curlRequest('GET', '/api/usuarios', null, adminToken);
    assert.strictEqual(response.status, 200, `Sequential request ${i + 1} should succeed`);
  }
  
  const sequentialTime = Date.now() - sequentialStartTime;
  const avgTime = sequentialTime / 5;
  
  assert(avgTime < 500, `Average response time ${avgTime}ms should be < 500ms`);
  console.log(`✅ 5 requests secuenciales completadas en ${sequentialTime}ms (promedio: ${avgTime.toFixed(0)}ms)`);
}

// Función principal
async function runApiValidationTests() {
  console.log('🧪 Iniciando Tests de Validación API');
  console.log('====================================');
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  try {
    // Setup
    await setupApiTests();
    
    // Ejecutar test suites
    await testApiEndpoints();
    totalTests += 5;
    passedTests += 5;
    
    await testAuthAndAuth();
    totalTests += 3;
    passedTests += 3;
    
    await testDataValidation();
    totalTests += 3;
    passedTests += 3;
    
    await testSecurity();
    totalTests += 2;
    passedTests += 2;
    
    await testBasicPerformance();
    totalTests += 2;
    passedTests += 2;
    
  } catch (error) {
    console.error('❌ Test fallido:', error.message);
    failedTests++;
  }
  
  // Resumen final
  console.log('\\n=== 📊 Resumen de Tests de Validación API ===');
  console.log(`Total de tests ejecutados: ${totalTests}`);
  console.log(`Tests pasados: ${passedTests}`);
  console.log(`Tests fallidos: ${failedTests}`);
  console.log(`Tasa de éxito: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (failedTests === 0) {
    console.log('\\n🎉 Todos los tests de validación API han pasado correctamente!');
    return true;
  } else {
    console.log('\\n⚠️  Algunos tests han fallado. Revisar logs arriba.');
    return false;
  }
}

// Ejecutar tests si el archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runApiValidationTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Error fatal en tests de validación API:', error);
      process.exit(1);
    });
}

export default {
  runApiValidationTests,
  testApiEndpoints,
  testAuthAndAuth,
  testDataValidation,
  testSecurity,
  testBasicPerformance
};