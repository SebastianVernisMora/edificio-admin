#!/usr/bin/env node

/**
 * Script maestro para ejecutar todos los tests del sistema
 */

import SistemaCompletoTest from './tests/sistema-completo.test.js';

async function main() {
    console.log('🧪 EDIFICIO ADMIN - TEST SUITE COMPLETO');
    console.log('='.repeat(60));
    console.log('Iniciando tests integrales del sistema...\n');

    try {
        const tester = new SistemaCompletoTest();
        const report = await tester.runAllTests();
        
        console.log('\n' + '='.repeat(60));
        
        if (report.summary.overallSuccess) {
            console.log('🎉 TODOS LOS TESTS PASARON - SISTEMA OPERATIVO');
            process.exit(0);
        } else {
            console.log('⚠️  ALGUNOS TESTS FALLARON - REVISAR PROBLEMAS');
            console.log(`Tasa de éxito: ${report.summary.successRate}%`);
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ ERROR CRÍTICO EJECUTANDO TESTS:');
        console.error(error.message);
        console.error('\nStack trace:');
        console.error(error.stack);
        process.exit(1);
    }
}

// Manejar señales para cleanup
process.on('SIGINT', () => {
    console.log('\n⚠️  Tests interrumpidos por usuario');
    process.exit(130);
});

process.on('SIGTERM', () => {
    console.log('\n⚠️  Tests terminados por sistema');
    process.exit(143);
});

// Ejecutar tests
main();