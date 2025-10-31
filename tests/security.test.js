// security.test.js - Tests de seguridad y edge cases
import request from 'supertest';
import assert from 'assert';
import app from '../src/app.js';
import { readData, writeData } from '../src/data.js';

// Variables globales
let adminToken;
let inquilinoToken;
let comiteToken;

// Helper para obtener tokens
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
async function setupSecurityTests() {
  console.log('🔒 Configurando tests de seguridad...');
  
  try {
    adminToken = await getAuthToken('admin@edificio205.com', 'Gemelo1');
    console.log('✅ Token de admin obtenido');
    
    try {
      inquilinoToken = await getAuthToken('felipe@edificio205.com', 'Gemelo1');
      console.log('✅ Token de inquilino obtenido');
    } catch (error) {
      console.log('⚠️  Token de inquilino no disponible');
    }
    
    try {
      comiteToken = await getAuthToken('comite@edificio205.com', 'Gemelo1');
      console.log('✅ Token de comité obtenido');
    } catch (error) {
      console.log('⚠️  Token de comité no disponible');
    }
    
  } catch (error) {
    console.error('❌ Error en setup de seguridad:', error.message);
    throw error;
  }
}

// Test Suite 1: Authentication Security
async function testAuthenticationSecurity() {
  console.log('\\n=== 🔐 Tests de Seguridad de Autenticación ===');
  
  // Test 1.1: SQL Injection attempts in login
  console.log('Test 1.1: Intentos de SQL Injection en login');
  const sqlInjectionAttempts = [
    "admin@edificio205.com'; DROP TABLE usuarios; --",
    "admin@edificio205.com' OR '1'='1",
    "admin@edificio205.com' UNION SELECT * FROM usuarios --",
    "'; UPDATE usuarios SET password='hacked' WHERE id=1; --"
  ];
  
  for (const maliciousEmail of sqlInjectionAttempts) {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: maliciousEmail,
        password: 'any_password'
      });
    
    assert.strictEqual(response.status, 401, 'SQL injection attempt should be rejected');
  }
  console.log('✅ Intentos de SQL injection rechazados correctamente');
  
  // Test 1.2: Password brute force protection
  console.log('Test 1.2: Protección contra fuerza bruta de contraseñas');
  const bruteForceAttempts = Array(10).fill().map((_, i) => 
    request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@edificio205.com',
        password: `wrong_password_${i}`
      })
  );
  
  const bruteForceResults = await Promise.all(bruteForceAttempts);
  const allRejected = bruteForceResults.every(r => r.status === 401);
  
  assert(allRejected, 'All brute force attempts should be rejected');
  console.log('✅ Intentos de fuerza bruta rechazados');
  
  // Test 1.3: JWT token tampering
  console.log('Test 1.3: Manipulación de tokens JWT');
  const tamperedTokens = [
    adminToken.slice(0, -5) + 'XXXXX', // Modificar signature
    adminToken.replace('.', 'X'), // Corromper estructura
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c', // Token genérico
    'Bearer ' + adminToken, // Formato incorrecto
    adminToken + '.extra' // Token con datos extra
  ];
  
  for (const tamperedToken of tamperedTokens) {
    const response = await request(app)
      .get('/api/usuarios')
      .set('x-auth-token', tamperedToken);
    
    assert.strictEqual(response.status, 401, 'Tampered token should be rejected');
  }
  console.log('✅ Tokens manipulados rechazados correctamente');
  
  // Test 1.4: Token expiration handling
  console.log('Test 1.4: Manejo de expiración de tokens');
  // Crear un token con expiración muy corta (esto requeriría modificar el código para testing)
  // Por ahora, verificamos que el token actual sea válido
  const validTokenResponse = await request(app)
    .get('/api/auth/perfil')
    .set('x-auth-token', adminToken);
  
  assert.strictEqual(validTokenResponse.status, 200);
  console.log('✅ Token válido aceptado correctamente');
}

// Test Suite 2: Authorization Security
async function testAuthorizationSecurity() {
  console.log('\\n=== 🛡️  Tests de Seguridad de Autorización ===');
  
  // Test 2.1: Privilege escalation attempts
  console.log('Test 2.1: Intentos de escalación de privilegios');
  
  if (inquilinoToken) {
    // Inquilino intentando acceder a endpoints de admin
    const privilegeEscalationAttempts = [
      { method: 'get', path: '/api/usuarios', name: 'Listar usuarios' },
      { method: 'post', path: '/api/usuarios', name: 'Crear usuario', data: { nombre: 'Test' } },
      { method: 'delete', path: '/api/usuarios/2', name: 'Eliminar usuario' }
    ];
    
    for (const attempt of privilegeEscalationAttempts) {
      const response = await request(app)
        [attempt.method](attempt.path)
        .set('x-auth-token', inquilinoToken)
        .send(attempt.data || {});
      
      assert.strictEqual(response.status, 403, `${attempt.name} should be forbidden for inquilino`);
    }
    console.log('✅ Escalación de privilegios bloqueada');
  } else {
    console.log('⚠️  Test de escalación saltado - no hay token de inquilino');
  }
  
  // Test 2.2: Cross-user data access
  console.log('Test 2.2: Acceso a datos de otros usuarios');
  
  // Intentar acceder a datos de otro usuario
  if (inquilinoToken) {
    const response = await request(app)
      .get('/api/auth/perfil')
      .set('x-auth-token', inquilinoToken);
    
    if (response.status === 200) {
      const userProfile = response.body.usuario;
      
      // Verificar que solo obtiene sus propios datos
      assert.strictEqual(userProfile.email, 'felipe@edificio205.com');
      assert.strictEqual(userProfile.password, undefined);
      console.log('✅ Usuario solo accede a sus propios datos');
    }
  }
  
  // Test 2.3: Admin protection
  console.log('Test 2.3: Protección del usuario administrador');
  
  // Intentar eliminar admin principal
  const deleteAdminResponse = await request(app)
    .delete('/api/usuarios/1')
    .set('x-auth-token', adminToken);
  
  assert.strictEqual(deleteAdminResponse.status, 400);
  assert(deleteAdminResponse.body.mensaje.includes('No se puede eliminar el administrador principal'));
  console.log('✅ Usuario administrador protegido contra eliminación');
}

// Test Suite 3: Input Validation Security
async function testInputValidationSecurity() {
  console.log('\\n=== 📝 Tests de Seguridad de Validación de Entrada ===');
  
  // Test 3.1: XSS attempts
  console.log('Test 3.1: Intentos de XSS');
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    'javascript:alert("XSS")',
    '<img src="x" onerror="alert(\\'XSS\\')">',
    '"><script>alert("XSS")</script>',
    '\\'><script>alert(String.fromCharCode(88,83,83))</script>'
  ];
  
  for (const payload of xssPayloads) {
    const response = await request(app)
      .post('/api/usuarios')
      .set('x-auth-token', adminToken)
      .send({
        nombre: payload,
        email: 'xss@test.com',
        password: 'test123',
        rol: 'inquilino',
        departamento: '507'
      });
    
    // Debería rechazar o sanitizar el input
    if (response.status === 201) {
      // Si se crea, verificar que el payload fue sanitizado
      assert(!response.body.nombre.includes('<script>'), 'XSS payload should be sanitized');
      
      // Limpiar usuario creado
      await request(app)
        .delete(`/api/usuarios/${response.body.id}`)
        .set('x-auth-token', adminToken);
    }
  }
  console.log('✅ Intentos de XSS manejados correctamente');
  
  // Test 3.2: Buffer overflow attempts
  console.log('Test 3.2: Intentos de buffer overflow');
  const longString = 'A'.repeat(10000); // String muy largo
  
  const bufferOverflowResponse = await request(app)
    .post('/api/usuarios')
    .set('x-auth-token', adminToken)
    .send({
      nombre: longString,
      email: 'buffer@test.com',
      password: 'test123',
      rol: 'inquilino',
      departamento: '508'
    });
  
  // Debería rechazar o truncar el input
  assert(bufferOverflowResponse.status === 400 || 
         (bufferOverflowResponse.status === 201 && bufferOverflowResponse.body.nombre.length < 10000),
         'Long input should be rejected or truncated');
  
  if (bufferOverflowResponse.status === 201) {
    await request(app)
      .delete(`/api/usuarios/${bufferOverflowResponse.body.id}`)
      .set('x-auth-token', adminToken);
  }
  console.log('✅ Intentos de buffer overflow manejados');
  
  // Test 3.3: Null byte injection
  console.log('Test 3.3: Inyección de null bytes');
  const nullBytePayloads = [
    'test\\x00.txt',
    'test\\0admin',
    'normal\\x00<script>alert("XSS")</script>'
  ];
  
  for (const payload of nullBytePayloads) {
    const response = await request(app)
      .post('/api/usuarios')
      .set('x-auth-token', adminToken)
      .send({
        nombre: payload,
        email: 'nullbyte@test.com',
        password: 'test123',
        rol: 'inquilino',
        departamento: '509'
      });
    
    if (response.status === 201) {
      // Verificar que null bytes fueron manejados
      assert(!response.body.nombre.includes('\\x00'), 'Null bytes should be handled');
      
      await request(app)
        .delete(`/api/usuarios/${response.body.id}`)
        .set('x-auth-token', adminToken);
    }
  }
  console.log('✅ Inyección de null bytes manejada');
}

// Test Suite 4: Data Integrity Security
async function testDataIntegritySecurity() {
  console.log('\\n=== 🔒 Tests de Seguridad de Integridad de Datos ===');
  
  // Test 4.1: Concurrent modification protection
  console.log('Test 4.1: Protección contra modificación concurrente');
  
  // Crear usuario de prueba
  const createResponse = await request(app)
    .post('/api/usuarios')
    .set('x-auth-token', adminToken)
    .send({
      nombre: 'Usuario Concurrencia',
      email: 'concurrencia@test.com',
      password: 'test123',
      rol: 'inquilino',
      departamento: '510'
    });
  
  if (createResponse.status === 201) {
    const userId = createResponse.body.id;
    
    // Intentar modificaciones concurrentes
    const concurrentUpdates = [
      request(app)
        .put(`/api/usuarios/${userId}`)
        .set('x-auth-token', adminToken)
        .send({ nombre: 'Nombre 1', telefono: '111-1111' }),
      request(app)
        .put(`/api/usuarios/${userId}`)
        .set('x-auth-token', adminToken)
        .send({ nombre: 'Nombre 2', telefono: '222-2222' }),
      request(app)
        .put(`/api/usuarios/${userId}`)
        .set('x-auth-token', adminToken)
        .send({ nombre: 'Nombre 3', telefono: '333-3333' })
    ];
    
    const updateResults = await Promise.all(concurrentUpdates);
    const successfulUpdates = updateResults.filter(r => r.status === 200).length;
    
    // Al menos una actualización debería ser exitosa
    assert(successfulUpdates >= 1, 'At least one concurrent update should succeed');
    
    // Verificar estado final
    const finalState = await request(app)
      .get('/api/usuarios')
      .set('x-auth-token', adminToken);
    
    const updatedUser = finalState.body.find(u => u.id === userId);
    assert(updatedUser, 'User should still exist after concurrent updates');
    
    // Limpiar
    await request(app)
      .delete(`/api/usuarios/${userId}`)
      .set('x-auth-token', adminToken);
    
    console.log(`✅ ${successfulUpdates}/3 actualizaciones concurrentes exitosas`);
  }
  
  // Test 4.2: Data consistency validation
  console.log('Test 4.2: Validación de consistencia de datos');
  
  const data = readData();
  
  // Verificar integridad de usuarios
  const usuarios = data.usuarios;
  const emails = usuarios.map(u => u.email);
  const uniqueEmails = [...new Set(emails)];
  
  assert.strictEqual(emails.length, uniqueEmails.length, 'All user emails should be unique');
  
  // Verificar que todos los usuarios tienen campos requeridos
  usuarios.forEach(usuario => {
    assert(usuario.id, 'User should have ID');
    assert(usuario.nombre, 'User should have name');
    assert(usuario.email, 'User should have email');
    assert(usuario.rol, 'User should have role');
  });
  
  console.log('✅ Consistencia de datos verificada');
}

// Test Suite 5: Edge Cases and Error Handling
async function testEdgeCasesAndErrorHandling() {
  console.log('\\n=== ⚠️  Tests de Edge Cases y Manejo de Errores ===');
  
  // Test 5.1: Malformed JSON handling
  console.log('Test 5.1: Manejo de JSON malformado');
  
  const malformedJsonResponse = await request(app)
    .post('/api/usuarios')
    .set('x-auth-token', adminToken)
    .set('Content-Type', 'application/json')
    .send('{"nombre": "Test", "email": "test@test.com", "invalid": json}');
  
  assert.strictEqual(malformedJsonResponse.status, 400, 'Malformed JSON should be rejected');
  console.log('✅ JSON malformado rechazado');
  
  // Test 5.2: Missing Content-Type header
  console.log('Test 5.2: Header Content-Type faltante');
  
  const noContentTypeResponse = await request(app)
    .post('/api/usuarios')
    .set('x-auth-token', adminToken)
    .send('nombre=Test&email=test@test.com');
  
  // Debería manejar gracefully la falta de Content-Type
  assert(noContentTypeResponse.status >= 400, 'Missing Content-Type should be handled');
  console.log('✅ Content-Type faltante manejado');
  
  // Test 5.3: Extremely large request body
  console.log('Test 5.3: Cuerpo de request extremadamente grande');
  
  const largeObject = {
    nombre: 'Test',
    email: 'large@test.com',
    password: 'test123',
    rol: 'inquilino',
    departamento: '511',
    largeField: 'x'.repeat(1000000) // 1MB de datos
  };
  
  const largeRequestResponse = await request(app)
    .post('/api/usuarios')
    .set('x-auth-token', adminToken)
    .send(largeObject);
  
  // Debería rechazar o manejar requests muy grandes
  assert(largeRequestResponse.status === 413 || largeRequestResponse.status === 400,
         'Large request should be rejected');
  console.log('✅ Request grande manejado');
  
  // Test 5.4: Unicode and special characters
  console.log('Test 5.4: Caracteres Unicode y especiales');
  
  const unicodeResponse = await request(app)
    .post('/api/usuarios')
    .set('x-auth-token', adminToken)
    .send({
      nombre: '测试用户 José María Ñoño 🏠',
      email: 'unicode@test.com',
      password: 'test123',
      rol: 'inquilino',
      departamento: '512'
    });
  
  if (unicodeResponse.status === 201) {
    // Verificar que Unicode se maneja correctamente
    assert(unicodeResponse.body.nombre.includes('测试'), 'Unicode should be preserved');
    
    // Limpiar
    await request(app)
      .delete(`/api/usuarios/${unicodeResponse.body.id}`)
      .set('x-auth-token', adminToken);
    
    console.log('✅ Caracteres Unicode manejados correctamente');
  } else {
    console.log('⚠️  Caracteres Unicode rechazados (comportamiento aceptable)');
  }
  
  // Test 5.5: Boundary value testing
  console.log('Test 5.5: Testing de valores límite');
  
  const boundaryTests = [
    { departamento: '101', valid: true }, // Mínimo válido
    { departamento: '504', valid: true }, // Máximo válido
    { departamento: '100', valid: false }, // Fuera de rango inferior
    { departamento: '505', valid: false }, // Fuera de rango superior
    { departamento: '1A1', valid: false }, // Formato inválido
    { departamento: '', valid: false }, // Vacío
    { departamento: null, valid: false } // Null
  ];
  
  for (const test of boundaryTests) {
    const response = await request(app)
      .post('/api/usuarios')
      .set('x-auth-token', adminToken)
      .send({
        nombre: 'Boundary Test',
        email: `boundary${Math.random()}@test.com`,
        password: 'test123',
        rol: 'inquilino',
        departamento: test.departamento
      });
    
    if (test.valid) {
      if (response.status === 201) {
        await request(app)
          .delete(`/api/usuarios/${response.body.id}`)
          .set('x-auth-token', adminToken);
      }
    } else {
      assert.strictEqual(response.status, 400, `Invalid departamento ${test.departamento} should be rejected`);
    }
  }
  console.log('✅ Valores límite validados correctamente');
}

// Función principal para ejecutar todos los tests de seguridad
async function runSecurityTests() {
  console.log('🔒 Iniciando Tests de Seguridad y Edge Cases');
  console.log('=============================================');
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  try {
    // Setup inicial
    await setupSecurityTests();
    
    // Ejecutar test suites
    await testAuthenticationSecurity();
    totalTests += 4;
    passedTests += 4;
    
    await testAuthorizationSecurity();
    totalTests += 3;
    passedTests += 3;
    
    await testInputValidationSecurity();
    totalTests += 3;
    passedTests += 3;
    
    await testDataIntegritySecurity();
    totalTests += 2;
    passedTests += 2;
    
    await testEdgeCasesAndErrorHandling();
    totalTests += 5;
    passedTests += 5;
    
  } catch (error) {
    console.error('❌ Test de seguridad fallido:', error.message);
    failedTests++;
  }
  
  // Resumen final
  console.log('\\n=== 📊 Resumen de Tests de Seguridad ===');
  console.log(`Total de tests ejecutados: ${totalTests}`);
  console.log(`Tests pasados: ${passedTests}`);
  console.log(`Tests fallidos: ${failedTests}`);
  console.log(`Tasa de éxito: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (failedTests === 0) {
    console.log('\\n🎉 Todos los tests de seguridad han pasado correctamente!');
    return true;
  } else {
    console.log('\\n⚠️  Algunos tests de seguridad han fallado. Revisar logs arriba.');
    return false;
  }
}

// Ejecutar tests si el archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runSecurityTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Error fatal en tests de seguridad:', error);
      process.exit(1);
    });
}

export default {
  runSecurityTests,
  testAuthenticationSecurity,
  testAuthorizationSecurity,
  testInputValidationSecurity,
  testDataIntegritySecurity,
  testEdgeCasesAndErrorHandling
};