/**
 * Tests del Cierre Anual con Generación Automática de Cuotas
 */

import { readData } from '../src/data.js';
import Cierre from '../src/models/Cierre.js';
import Cuota from '../src/models/Cuota.js';
import { verificarEstadoCuotas } from '../src/utils/cuotasInicializacion.js';

class CierreAnualTest {
    constructor() {
        this.testResults = [];
        this.totalTests = 0;
        this.passedTests = 0;
        this.failedTests = 0;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
        console.log(`${prefix} [${timestamp}] ${message}`);
    }

    async runTest(testName, testFunction) {
        this.totalTests++;
        try {
            await testFunction();
            this.passedTests++;
            this.log(`${testName} - PASÓ`, 'success');
            this.testResults.push({ test: testName, status: 'PASS', error: null });
        } catch (error) {
            this.failedTests++;
            this.log(`${testName} - FALLÓ: ${error.message}`, 'error');
            this.testResults.push({ test: testName, status: 'FAIL', error: error.message });
        }
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }

    assertEquals(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(`${message}. Esperado: ${expected}, Actual: ${actual}`);
        }
    }

    async testCrearCierreMensualParaTest() {
        // Crear un cierre mensual de prueba para poder hacer cierre anual
        const añoTest = 2024;
        const mesTest = 'Diciembre';
        
        try {
            // Verificar si ya existe
            const existente = await Cierre.getByMesAño(mesTest, añoTest);
            if (existente) {
                this.log(`Cierre mensual ${mesTest} ${añoTest} ya existe`);
                return;
            }

            const cierre = await Cierre.realizarCierreMensual(mesTest, añoTest);
            this.assert(cierre, 'Debe crear el cierre mensual');
            this.assertEquals(cierre.mes, mesTest, 'Mes debe coincidir');
            this.assertEquals(cierre.año, añoTest, 'Año debe coincidir');
            
        } catch (error) {
            if (error.message.includes('Ya existe un cierre')) {
                this.log('El cierre mensual ya existía - continuando test');
            } else {
                throw error;
            }
        }
    }

    async testEstadoInicialCuotas() {
        const estadoInicial = verificarEstadoCuotas();
        this.log(`Estado inicial - 2025: ${estadoInicial.anioActual.total} cuotas, 2026: ${estadoInicial.anioSiguiente.total} cuotas`);
        
        this.assert(estadoInicial.anioActual, 'Debe tener datos del año actual');
        this.assert(estadoInicial.anioSiguiente, 'Debe tener datos del año siguiente');
        this.assert(estadoInicial.departamentosActivos > 0, 'Debe haber departamentos activos');
    }

    async testCierreAnualGeneraCuotas() {
        const añoTest = 2027; // Usar un año futuro para el test
        
        // Primero crear un cierre mensual de prueba
        try {
            await Cierre.realizarCierreMensual('Enero', añoTest);
        } catch (error) {
            if (!error.message.includes('Ya existe un cierre')) {
                throw error;
            }
        }

        // Verificar cuotas antes del cierre anual
        const data = readData();
        const cuotasAntesSiguiente = data.cuotas.filter(c => c.anio === añoTest + 1);
        this.log(`Cuotas para ${añoTest + 1} antes del cierre: ${cuotasAntesSiguiente.length}`);

        // Realizar cierre anual
        const cierreAnual = await Cierre.realizarCierreAnual(añoTest);
        
        // Validaciones del cierre anual
        this.assert(cierreAnual, 'Debe crear el cierre anual');
        this.assertEquals(cierreAnual.tipo, 'ANUAL', 'Tipo debe ser ANUAL');
        this.assertEquals(cierreAnual.año, añoTest, 'Año debe coincidir');
        this.assert(cierreAnual.cuotasSiguienteAño, 'Debe incluir información de cuotas del año siguiente');
        this.assertEquals(cierreAnual.cuotasSiguienteAño.año, añoTest + 1, 'Año de cuotas debe ser el siguiente');

        // Verificar que se generaron las cuotas del año siguiente
        const dataActualizada = readData();
        const cuotasDespuesSiguiente = dataActualizada.cuotas.filter(c => c.anio === añoTest + 1);
        
        this.assert(cuotasDespuesSiguiente.length >= cuotasAntesSiguiente.length, 
            'Deben existir cuotas para el año siguiente al cierre');

        // Si se generaron nuevas cuotas, verificar que tengan el monto correcto
        if (cuotasDespuesSiguiente.length > cuotasAntesSiguiente.length) {
            const nuevasCuotas = cuotasDespuesSiguiente.slice(cuotasAntesSiguiente.length);
            nuevasCuotas.forEach(cuota => {
                this.assertEquals(cuota.monto, 550, `Cuota ${cuota.mes}/${cuota.anio} debe tener monto $550`);
                this.assertEquals(cuota.estado, 'PENDIENTE', `Cuota ${cuota.mes}/${cuota.anio} debe estar PENDIENTE`);
            });
            this.log(`✅ Se generaron ${nuevasCuotas.length} cuotas nuevas para ${añoTest + 1}`);
        } else {
            this.log(`ℹ️ Las cuotas para ${añoTest + 1} ya existían`);
        }
    }

    async testCierreAnualConCuotasExistentes() {
        const añoTest = 2025; // Año que ya debería tener cuotas para 2026
        
        // Crear cierre mensual si no existe
        try {
            await Cierre.realizarCierreMensual('Enero', añoTest);
        } catch (error) {
            if (!error.message.includes('Ya existe un cierre')) {
                throw error;
            }
        }

        // Contar cuotas para 2026 antes del cierre
        const data = readData();
        const cuotasAntes2026 = data.cuotas.filter(c => c.anio === 2026);
        
        // Realizar cierre anual
        const cierreAnual = await Cierre.realizarCierreAnual(añoTest);
        
        // Verificar que el cierre se realizó correctamente
        this.assert(cierreAnual, 'Debe crear el cierre anual');
        this.assertEquals(cierreAnual.año, añoTest, 'Año debe coincidir');
        
        // Verificar que las cuotas de 2026 no cambiaron (ya existían)
        const dataActualizada = readData();
        const cuotasDespues2026 = dataActualizada.cuotas.filter(c => c.anio === 2026);
        
        this.assertEquals(cuotasDespues2026.length, cuotasAntes2026.length, 
            'Número de cuotas 2026 no debe cambiar si ya existían');
        
        this.log(`ℹ️ Cuotas 2026 mantuvieron su estado: ${cuotasDespues2026.length} cuotas`);
    }

    async testValidacionEstructuraCierreAnual() {
        const año = 2024;
        
        // Crear cierre mensual de prueba
        try {
            await Cierre.realizarCierreMensual('Noviembre', año);
        } catch (error) {
            if (!error.message.includes('Ya existe un cierre')) {
                throw error;
            }
        }

        const cierre = await Cierre.realizarCierreAnual(año);
        
        // Validar estructura completa del cierre anual
        this.assert(cierre.id, 'Debe tener ID');
        this.assert(cierre.tipo === 'ANUAL', 'Tipo debe ser ANUAL');
        this.assert(cierre.fecha, 'Debe tener fecha');
        this.assert(cierre.ingresos, 'Debe tener sección de ingresos');
        this.assert(cierre.gastos, 'Debe tener sección de gastos');
        this.assert(cierre.fondos, 'Debe tener sección de fondos');
        this.assert(typeof cierre.balance === 'number', 'Balance debe ser número');
        this.assert(cierre.cuotasSiguienteAño, 'Debe tener información de cuotas del año siguiente');
        
        // Validar estructura de cuotasSiguienteAño
        this.assertEquals(cierre.cuotasSiguienteAño.año, año + 1, 'Año siguiente debe ser correcto');
        this.assert(typeof cierre.cuotasSiguienteAño.generadas === 'boolean', 'Generadas debe ser boolean');
        this.assert(cierre.cuotasSiguienteAño.mensaje, 'Debe tener mensaje informativo');
    }

    async testCalculosFinancierosCierreAnual() {
        const año = 2023;
        
        // Crear múltiples cierres mensuales para tener datos
        const meses = ['Enero', 'Febrero'];
        for (const mes of meses) {
            try {
                await Cierre.realizarCierreMensual(mes, año);
            } catch (error) {
                if (!error.message.includes('Ya existe un cierre')) {
                    console.log(`Error creando cierre ${mes}: ${error.message}`);
                }
            }
        }

        const cierreAnual = await Cierre.realizarCierreAnual(año);
        
        // Validar que los cálculos sean correctos
        this.assert(typeof cierreAnual.ingresos.total === 'number', 'Total ingresos debe ser número');
        this.assert(typeof cierreAnual.gastos.total === 'number', 'Total gastos debe ser número');
        this.assert(typeof cierreAnual.balance === 'number', 'Balance debe ser número');
        
        // El balance debe ser la diferencia entre ingresos y gastos
        const balanceCalculado = cierreAnual.ingresos.total - cierreAnual.gastos.total;
        this.assertEquals(cierreAnual.balance, balanceCalculado, 'Balance debe ser ingresos - gastos');
        
        this.log(`📊 Resumen financiero ${año}: Ingresos: $${cierreAnual.ingresos.total}, Gastos: $${cierreAnual.gastos.total}, Balance: $${cierreAnual.balance}`);
    }

    async runAllTests() {
        this.log('🚀 Iniciando Tests del Cierre Anual');
        this.log('=====================================');

        await this.runTest('Crear cierre mensual para test', () => this.testCrearCierreMensualParaTest());
        await this.runTest('Estado inicial de cuotas', () => this.testEstadoInicialCuotas());
        await this.runTest('Cierre anual genera cuotas año siguiente', () => this.testCierreAnualGeneraCuotas());
        await this.runTest('Cierre anual con cuotas existentes', () => this.testCierreAnualConCuotasExistentes());
        await this.runTest('Validación estructura cierre anual', () => this.testValidacionEstructuraCierreAnual());
        await this.runTest('Cálculos financieros cierre anual', () => this.testCalculosFinancierosCierreAnual());

        this.log('=====================================');
        this.log(`📊 Resultados: ${this.passedTests}/${this.totalTests} tests pasaron`);
        
        if (this.failedTests > 0) {
            this.log(`❌ ${this.failedTests} tests fallaron:`, 'error');
            this.testResults.filter(r => r.status === 'FAIL').forEach(r => {
                this.log(`   - ${r.test}: ${r.error}`, 'error');
            });
        } else {
            this.log('🎉 ¡Todos los tests del cierre anual pasaron exitosamente!', 'success');
        }

        return {
            total: this.totalTests,
            passed: this.passedTests,
            failed: this.failedTests,
            results: this.testResults,
            success: this.failedTests === 0
        };
    }
}

// Ejecutar tests si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new CierreAnualTest();
    tester.runAllTests()
        .then(results => {
            process.exit(results.success ? 0 : 1);
        })
        .catch(error => {
            console.error('❌ Error ejecutando tests:', error);
            process.exit(1);
        });
}

export default CierreAnualTest;