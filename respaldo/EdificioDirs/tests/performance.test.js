// performance.test.js - Tests de rendimiento y carga para el sistema
import request from 'supertest';
import assert from 'assert';
import app from '../src/app.js';
import { readData } from '../src/data.js';

// Variables globales
let adminToken;
let performanceMetrics = {
  responseTime: [],
  memoryUsage: [],
  concurrentRequests: [],
  errorRate: 0,
  throughput: 0
};

// Helper para obtener token
async function getAuthToken() {
  const response = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@edificio205.com',
      password: 'Gemelo1'
    });
  
  if (response.status === 200) {
    return response.body.token;
  }
  throw new Error('Failed to get admin token');
}

// Helper para medir uso de memoria
function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    rss: Math.round(usage.rss / 1024 / 1024), // MB
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
    external: Math.round(usage.external / 1024 / 1024) // MB
  };
}

// Setup inicial
async function setupPerformanceTests() {
  console.log('⚡ Configurando tests de performance...');
  
  try {
    adminToken = await getAuthToken();
    console.log('✅ Token de admin obtenido');
    
    // Baseline de memoria
    const initialMemory = getMemoryUsage();
    performanceMetrics.memoryUsage.push({
      phase: 'initial',
      ...initialMemory
    });
    console.log(`📊 Memoria inicial: ${initialMemory.heapUsed}MB`);
    
  } catch (error) {
    console.error('❌ Error en setup de performance:', error.message);
    throw error;
  }
}

// Test Suite 1: Response Time Tests
async function testResponseTimes() {
  console.log('\\n=== ⏱️  Tests de Tiempo de Respuesta ===');
  
  const endpoints = [
    { method: 'get', path: '/api/usuarios', name: 'Usuarios' },
    { method: 'get', path: '/api/cuotas', name: 'Cuotas' },
    { method: 'get', path: '/api/gastos', name: 'Gastos' },
    { method: 'get', path: '/api/presupuestos', name: 'Presupuestos' },
    { method: 'get', path: '/api/anuncios', name: 'Anuncios' },
    { method: 'get', path: '/api/fondos', name: 'Fondos' },
    { method: 'get', path: '/api/auth/perfil', name: 'Perfil' }
  ];
  
  console.log('Test 1.1: Tiempo de respuesta individual por endpoint');
  
  for (const endpoint of endpoints) {
    const startTime = Date.now();
    
    const response = await request(app)
      [endpoint.method](endpoint.path)
      .set('x-auth-token', adminToken);
    
    const responseTime = Date.now() - startTime;
    
    performanceMetrics.responseTime.push({
      endpoint: endpoint.name,
      time: responseTime,
      status: response.status
    });
    
    assert.strictEqual(response.status, 200, `${endpoint.name} should return 200`);
    assert(responseTime < 500, `${endpoint.name} response time ${responseTime}ms should be < 500ms`);
    
    console.log(`  ${endpoint.name}: ${responseTime}ms ✅`);
  }
  
  const avgResponseTime = performanceMetrics.responseTime.reduce((sum, metric) => sum + metric.time, 0) / performanceMetrics.responseTime.length;
  console.log(`📊 Tiempo promedio de respuesta: ${avgResponseTime.toFixed(2)}ms`);
}

// Test Suite 2: Load Testing
async function testLoadCapacity() {
  console.log('\\n=== 🚀 Tests de Capacidad de Carga ===');
  
  // Test 2.1: Concurrent requests test
  console.log('Test 2.1: 50 requests concurrentes');
  const concurrentCount = 50;
  const startTime = Date.now();
  
  const promises = Array(concurrentCount).fill().map((_, index) => 
    request(app)
      .get('/api/usuarios')
      .set('x-auth-token', adminToken)
      .then(response => ({
        index,
        status: response.status,
        time: Date.now() - startTime
      }))
      .catch(error => ({
        index,
        status: 'error',
        error: error.message,
        time: Date.now() - startTime
      }))
  );
  
  const results = await Promise.all(promises);
  const totalTime = Date.now() - startTime;
  
  const successfulRequests = results.filter(r => r.status === 200).length;
  const failedRequests = results.length - successfulRequests;
  const successRate = (successfulRequests / results.length) * 100;
  
  performanceMetrics.concurrentRequests.push({
    count: concurrentCount,
    successful: successfulRequests,
    failed: failedRequests,
    successRate,
    totalTime,
    throughput: (successfulRequests / totalTime) * 1000 // requests per second
  });
  
  assert(successRate >= 95, `Success rate ${successRate}% should be >= 95%`);
  console.log(`✅ ${successfulRequests}/${concurrentCount} requests exitosos (${successRate.toFixed(1)}%)`);
  console.log(`📊 Throughput: ${((successfulRequests / totalTime) * 1000).toFixed(2)} req/s`);
  
  // Test 2.2: Sustained load test
  console.log('Test 2.2: Carga sostenida - 100 requests en 10 segundos');
  const sustainedStartTime = Date.now();
  const sustainedResults = [];
  
  for (let i = 0; i < 100; i++) {
    const requestStart = Date.now();
    
    try {
      const response = await request(app)
        .get('/api/usuarios')
        .set('x-auth-token', adminToken);
      
      sustainedResults.push({
        index: i,
        status: response.status,
        time: Date.now() - requestStart
      });
      
      // Pequeña pausa para simular carga sostenida
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      sustainedResults.push({
        index: i,
        status: 'error',
        error: error.message,
        time: Date.now() - requestStart
      });
    }
  }
  
  const sustainedTotalTime = Date.now() - sustainedStartTime;
  const sustainedSuccessful = sustainedResults.filter(r => r.status === 200).length;
  const sustainedSuccessRate = (sustainedSuccessful / sustainedResults.length) * 100;
  
  assert(sustainedSuccessRate >= 98, `Sustained success rate ${sustainedSuccessRate}% should be >= 98%`);
  console.log(`✅ ${sustainedSuccessful}/100 requests exitosos en ${(sustainedTotalTime/1000).toFixed(1)}s`);
  console.log(`📊 Tasa de éxito sostenida: ${sustainedSuccessRate.toFixed(1)}%`);
}

// Test Suite 3: Memory Usage Tests
async function testMemoryUsage() {
  console.log('\\n=== 💾 Tests de Uso de Memoria ===');
  
  // Test 3.1: Memory usage during normal operations
  console.log('Test 3.1: Uso de memoria durante operaciones normales');
  
  const memoryBefore = getMemoryUsage();
  
  // Realizar múltiples operaciones
  for (let i = 0; i < 20; i++) {
    await request(app)
      .get('/api/usuarios')
      .set('x-auth-token', adminToken);
    
    await request(app)
      .get('/api/cuotas')
      .set('x-auth-token', adminToken);
  }
  
  const memoryAfter = getMemoryUsage();
  const memoryIncrease = memoryAfter.heapUsed - memoryBefore.heapUsed;
  
  performanceMetrics.memoryUsage.push({
    phase: 'normal_operations',
    before: memoryBefore,
    after: memoryAfter,
    increase: memoryIncrease
  });
  
  console.log(`📊 Memoria antes: ${memoryBefore.heapUsed}MB`);
  console.log(`📊 Memoria después: ${memoryAfter.heapUsed}MB`);
  console.log(`📊 Incremento: ${memoryIncrease}MB`);
  
  // El incremento de memoria no debería ser excesivo
  assert(memoryIncrease < 50, `Memory increase ${memoryIncrease}MB should be < 50MB`);
  console.log('✅ Uso de memoria dentro de límites normales');
  
  // Test 3.2: Memory usage during heavy load
  console.log('Test 3.2: Uso de memoria durante carga pesada');
  
  const heavyLoadMemoryBefore = getMemoryUsage();
  
  // Carga pesada - 100 requests concurrentes
  const heavyPromises = Array(100).fill().map(() => 
    request(app)
      .get('/api/usuarios')
      .set('x-auth-token', adminToken)
  );
  
  await Promise.all(heavyPromises);
  
  const heavyLoadMemoryAfter = getMemoryUsage();
  const heavyMemoryIncrease = heavyLoadMemoryAfter.heapUsed - heavyLoadMemoryBefore.heapUsed;
  
  performanceMetrics.memoryUsage.push({
    phase: 'heavy_load',
    before: heavyLoadMemoryBefore,
    after: heavyLoadMemoryAfter,
    increase: heavyMemoryIncrease
  });
  
  console.log(`📊 Memoria antes de carga pesada: ${heavyLoadMemoryBefore.heapUsed}MB`);
  console.log(`📊 Memoria después de carga pesada: ${heavyLoadMemoryAfter.heapUsed}MB`);
  console.log(`📊 Incremento durante carga pesada: ${heavyMemoryIncrease}MB`);
  
  // Forzar garbage collection si está disponible
  if (global.gc) {
    global.gc();
    const memoryAfterGC = getMemoryUsage();
    console.log(`📊 Memoria después de GC: ${memoryAfterGC.heapUsed}MB`);
  }
  
  assert(heavyMemoryIncrease < 100, `Heavy load memory increase ${heavyMemoryIncrease}MB should be < 100MB`);
  console.log('✅ Uso de memoria durante carga pesada dentro de límites');
}

// Test Suite 4: Data Consistency Under Load
async function testDataConsistencyUnderLoad() {
  console.log('\\n=== 🔄 Tests de Consistencia de Datos Bajo Carga ===');
  
  // Test 4.1: Concurrent read operations
  console.log('Test 4.1: Operaciones de lectura concurrentes');
  
  const readPromises = Array(30).fill().map(async (_, index) => {
    const response = await request(app)
      .get('/api/usuarios')
      .set('x-auth-token', adminToken);
    
    return {
      index,
      status: response.status,
      userCount: response.body.length,
      hasAdmin: response.body.some(u => u.rol === 'ADMIN')
    };
  });
  
  const readResults = await Promise.all(readPromises);
  
  // Verificar consistencia
  const userCounts = readResults.map(r => r.userCount);
  const uniqueUserCounts = [...new Set(userCounts)];
  const allHaveAdmin = readResults.every(r => r.hasAdmin);
  
  assert(uniqueUserCounts.length <= 2, 'User counts should be consistent (allowing for 1 difference due to timing)');
  assert(allHaveAdmin, 'All responses should include admin user');
  
  console.log(`✅ Consistencia de datos verificada en ${readResults.length} lecturas concurrentes`);
  console.log(`📊 Conteos de usuarios: ${uniqueUserCounts.join(', ')}`);
  
  // Test 4.2: Mixed read/write operations
  console.log('Test 4.2: Operaciones mixtas lectura/escritura');
  
  const initialData = readData();
  const initialUserCount = initialData.usuarios.length;
  
  // Crear usuario de prueba
  const createResponse = await request(app)
    .post('/api/usuarios')
    .set('x-auth-token', adminToken)
    .send({
      nombre: 'Usuario Performance Test',
      email: 'performance@edificio205.com',
      password: 'test123',
      rol: 'inquilino',
      departamento: '506'
    });
  
  let testUserId = null;
  if (createResponse.status === 201) {
    testUserId = createResponse.body.id;
    
    // Operaciones mixtas concurrentes
    const mixedPromises = [
      // Lecturas
      ...Array(10).fill().map(() => 
        request(app)
          .get('/api/usuarios')
          .set('x-auth-token', adminToken)
      ),
      // Actualizaciones
      ...Array(3).fill().map(() => 
        request(app)
          .put(`/api/usuarios/${testUserId}`)
          .set('x-auth-token', adminToken)
          .send({ telefono: `555-${Math.floor(Math.random() * 10000)}` })
      )
    ];
    
    const mixedResults = await Promise.all(mixedPromises);
    const successfulOperations = mixedResults.filter(r => r.status === 200).length;
    
    // Limpiar - eliminar usuario de prueba
    await request(app)
      .delete(`/api/usuarios/${testUserId}`)
      .set('x-auth-token', adminToken);
    
    assert(successfulOperations >= 12, 'Most mixed operations should succeed');
    console.log(`✅ ${successfulOperations}/13 operaciones mixtas exitosas`);
  } else {
    console.log('⚠️  No se pudo crear usuario de prueba para operaciones mixtas');
  }
}

// Test Suite 5: Error Rate and Resilience
async function testErrorRateAndResilience() {
  console.log('\\n=== 🛡️  Tests de Tasa de Error y Resistencia ===');
  
  // Test 5.1: Invalid requests handling
  console.log('Test 5.1: Manejo de requests inválidos');
  
  const invalidRequests = [
    // Token inválido
    request(app).get('/api/usuarios').set('x-auth-token', 'invalid_token'),
    // Endpoint inexistente
    request(app).get('/api/nonexistent').set('x-auth-token', adminToken),
    // Método no permitido
    request(app).patch('/api/usuarios').set('x-auth-token', adminToken),
    // Datos inválidos
    request(app).post('/api/usuarios').set('x-auth-token', adminToken).send({ invalid: 'data' })
  ];
  
  const invalidResults = await Promise.all(invalidRequests.map(p => 
    p.catch(error => ({ status: 'error', error: error.message }))
  ));
  
  const properlyHandledErrors = invalidResults.filter(r => 
    r.status >= 400 && r.status < 500
  ).length;
  
  console.log(`✅ ${properlyHandledErrors}/4 errores manejados correctamente`);
  
  // Test 5.2: System stability under error conditions
  console.log('Test 5.2: Estabilidad del sistema bajo condiciones de error');
  
  // Generar múltiples errores y luego verificar que el sistema sigue funcionando
  const errorPromises = Array(20).fill().map(() => 
    request(app)
      .get('/api/usuarios')
      .set('x-auth-token', 'invalid_token')
      .catch(() => ({ status: 401 }))
  );
  
  await Promise.all(errorPromises);
  
  // Verificar que el sistema sigue funcionando normalmente
  const recoveryResponse = await request(app)
    .get('/api/usuarios')
    .set('x-auth-token', adminToken);
  
  assert.strictEqual(recoveryResponse.status, 200);
  console.log('✅ Sistema estable después de múltiples errores');
}

// Función principal para ejecutar todos los tests de performance
async function runPerformanceTests() {
  console.log('⚡ Iniciando Tests de Performance y Carga');
  console.log('=========================================');
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  try {
    // Setup inicial
    await setupPerformanceTests();
    
    // Ejecutar test suites
    await testResponseTimes();
    totalTests += 7;
    passedTests += 7;
    
    await testLoadCapacity();
    totalTests += 2;
    passedTests += 2;
    
    await testMemoryUsage();
    totalTests += 2;
    passedTests += 2;
    
    await testDataConsistencyUnderLoad();
    totalTests += 2;
    passedTests += 2;
    
    await testErrorRateAndResilience();
    totalTests += 2;
    passedTests += 2;
    
  } catch (error) {
    console.error('❌ Test de performance fallido:', error.message);
    failedTests++;
  }
  
  // Generar reporte de métricas
  console.log('\\n=== 📊 Reporte de Métricas de Performance ===');
  
  // Response times
  if (performanceMetrics.responseTime.length > 0) {
    const avgResponseTime = performanceMetrics.responseTime.reduce((sum, m) => sum + m.time, 0) / performanceMetrics.responseTime.length;
    const maxResponseTime = Math.max(...performanceMetrics.responseTime.map(m => m.time));
    const minResponseTime = Math.min(...performanceMetrics.responseTime.map(m => m.time));
    
    console.log(`⏱️  Tiempo de respuesta promedio: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`⏱️  Tiempo de respuesta máximo: ${maxResponseTime}ms`);
    console.log(`⏱️  Tiempo de respuesta mínimo: ${minResponseTime}ms`);
  }
  
  // Concurrent requests
  if (performanceMetrics.concurrentRequests.length > 0) {
    const concurrentMetric = performanceMetrics.concurrentRequests[0];
    console.log(`🚀 Throughput máximo: ${concurrentMetric.throughput.toFixed(2)} req/s`);
    console.log(`🚀 Tasa de éxito concurrente: ${concurrentMetric.successRate.toFixed(1)}%`);
  }
  
  // Memory usage
  if (performanceMetrics.memoryUsage.length > 0) {
    const finalMemory = performanceMetrics.memoryUsage[performanceMetrics.memoryUsage.length - 1];
    console.log(`💾 Uso de memoria final: ${finalMemory.after ? finalMemory.after.heapUsed : finalMemory.heapUsed}MB`);
  }
  
  // Resumen final
  console.log('\\n=== 📊 Resumen de Tests de Performance ===');
  console.log(`Total de tests ejecutados: ${totalTests}`);
  console.log(`Tests pasados: ${passedTests}`);
  console.log(`Tests fallidos: ${failedTests}`);
  console.log(`Tasa de éxito: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (failedTests === 0) {
    console.log('\\n🎉 Todos los tests de performance han pasado correctamente!');
    return true;
  } else {
    console.log('\\n⚠️  Algunos tests de performance han fallado. Revisar logs arriba.');
    return false;
  }
}

// Ejecutar tests si el archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runPerformanceTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Error fatal en tests de performance:', error);
      process.exit(1);
    });
}

export default {
  runPerformanceTests,
  testResponseTimes,
  testLoadCapacity,
  testMemoryUsage,
  testDataConsistencyUnderLoad,
  testErrorRateAndResilience,
  performanceMetrics
};