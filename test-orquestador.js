/**
 * Script de prueba para el Orquestador
 * Simula la ejecución de los 3 agentes y muestra el funcionamiento del orquestador
 */

import Orquestador from './Orquestador.js';

// Función para simular delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Función para mostrar estado de forma legible
function mostrarEstado(orquestador) {
  console.log('\n' + '='.repeat(80));
  const estado = orquestador.obtenerEstadoWorkflow();
  
  console.log(`\n📊 ESTADO DEL WORKFLOW: ${estado.workflow.estado}`);
  console.log(`⏱️  Inicio: ${estado.workflow.inicioEjecucion || 'No iniciado'}`);
  
  console.log('\n👥 AGENTES:');
  estado.agentes.forEach(agente => {
    const emoji = agente.estado === 'COMPLETADO' ? '✅' : 
                  agente.estado === 'EN_PROGRESO' ? '🔄' :
                  agente.estado === 'ERROR' ? '❌' : '⏸️';
    console.log(`  ${emoji} ${agente.nombre}`);
    console.log(`     Estado: ${agente.estado} | Progreso: ${agente.progreso}% | Errores: ${agente.errores}`);
  });
  
  if (estado.log.length > 0) {
    console.log('\n📝 ÚLTIMOS EVENTOS:');
    estado.log.slice(-5).forEach(entrada => {
      const emoji = entrada.nivel === 'ERROR' ? '❌' : 
                    entrada.nivel === 'WARNING' ? '⚠️' : 'ℹ️';
      console.log(`  ${emoji} [${entrada.nivel}] ${entrada.mensaje}`);
    });
  }
  
  console.log('='.repeat(80) + '\n');
}

// Función principal de prueba
async function ejecutarPrueba() {
  console.log('🚀 Iniciando prueba del Orquestador\n');
  
  // Crear instancia del orquestador
  const orquestador = new Orquestador();
  
  // Mostrar estado inicial
  console.log('📋 Estado inicial:');
  mostrarEstado(orquestador);
  
  // Iniciar workflow
  console.log('▶️  Iniciando workflow...');
  const resultado = orquestador.iniciarWorkflow();
  
  if (!resultado.exito) {
    console.error('❌ Error al iniciar workflow:', resultado.mensaje);
    if (resultado.conflictos) {
      console.error('Conflictos detectados:', resultado.conflictos);
    }
    return;
  }
  
  mostrarEstado(orquestador);
  
  // Simular progreso del Agente 1
  console.log('🔄 Simulando progreso del Agente 1...');
  await delay(2000);
  orquestador.actualizarEstadoAgente('agente1', 'EN_PROGRESO', 25);
  mostrarEstado(orquestador);
  
  await delay(2000);
  orquestador.actualizarEstadoAgente('agente1', 'EN_PROGRESO', 50);
  mostrarEstado(orquestador);
  
  await delay(2000);
  orquestador.actualizarEstadoAgente('agente1', 'EN_PROGRESO', 75);
  mostrarEstado(orquestador);
  
  await delay(2000);
  orquestador.actualizarEstadoAgente('agente1', 'COMPLETADO', 100);
  console.log('✅ Agente 1 completado');
  mostrarEstado(orquestador);
  
  // Simular progreso del Agente 2
  console.log('🔄 Simulando progreso del Agente 2...');
  await delay(1500);
  orquestador.actualizarEstadoAgente('agente2', 'EN_PROGRESO', 30);
  mostrarEstado(orquestador);
  
  await delay(1500);
  orquestador.actualizarEstadoAgente('agente2', 'EN_PROGRESO', 60);
  mostrarEstado(orquestador);
  
  await delay(1500);
  orquestador.actualizarEstadoAgente('agente2', 'COMPLETADO', 100);
  console.log('✅ Agente 2 completado');
  mostrarEstado(orquestador);
  
  // Simular progreso del Agente 3 con un error
  console.log('🔄 Simulando progreso del Agente 3...');
  await delay(1000);
  orquestador.actualizarEstadoAgente('agente3', 'EN_PROGRESO', 20);
  mostrarEstado(orquestador);
  
  await delay(1000);
  orquestador.actualizarEstadoAgente('agente3', 'EN_PROGRESO', 40);
  mostrarEstado(orquestador);
  
  // Simular un error
  await delay(1000);
  console.log('⚠️  Simulando error en Agente 3...');
  orquestador.actualizarEstadoAgente(
    'agente3',
    'EN_PROGRESO',
    50,
    'Error al crear archivo de tests'
  );
  mostrarEstado(orquestador);
  
  // Recuperarse del error
  await delay(2000);
  console.log('🔧 Recuperándose del error...');
  orquestador.actualizarEstadoAgente('agente3', 'EN_PROGRESO', 75);
  mostrarEstado(orquestador);
  
  await delay(1500);
  orquestador.actualizarEstadoAgente('agente3', 'COMPLETADO', 100);
  console.log('✅ Agente 3 completado');
  mostrarEstado(orquestador);
  
  // Generar reporte final
  console.log('\n📊 Generando reporte final...\n');
  const reporte = orquestador.generarReporte();
  
  console.log('='.repeat(80));
  console.log('📄 REPORTE FINAL');
  console.log('='.repeat(80));
  console.log(`\n⏱️  Duración total: ${reporte.duracion}`);
  console.log(`📊 Estado: ${reporte.estado}`);
  console.log(`❌ Total de errores: ${reporte.totalErrores}`);
  console.log(`⚠️  Conflictos: ${reporte.conflictos.length}`);
  
  console.log('\n👥 Resumen de Agentes:');
  reporte.agentes.forEach(agente => {
    console.log(`\n  ${agente.nombre}`);
    console.log(`    Estado: ${agente.estado}`);
    console.log(`    Progreso: ${agente.progreso}%`);
    console.log(`    Tareas completadas: ${agente.tareasCompletadas}`);
    console.log(`    Errores: ${agente.errores}`);
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ Prueba completada exitosamente\n');
}

// Ejecutar prueba
ejecutarPrueba().catch(error => {
  console.error('❌ Error en la prueba:', error);
  process.exit(1);
});

export { ejecutarPrueba };
