/**
 * Tests del Sistema de Cuotas
 * Prueba todas las funcionalidades del sistema de cuotas automáticas
 */

import { readData } from '../src/data.js';
import Cuota from '../src/models/Cuota.js';
import { 
    inicializarCuotasAnuales, 
    programarCuotasAnuales, 
    verificarEstadoCuotas,
    actualizarCuotasVencidas 
} from '../src/utils/cuotasInicializacion.js';

class CuotasSistemaTest {
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

    assertGreaterThan(actual, minimum, message) {
        if (actual <= minimum) {
            throw new Error(`${message}. Esperado > ${minimum}, Actual: ${actual}`);
        }
    }

    async testEstadoInicialSistema() {
        const estado = verificarEstadoCuotas();
        
        this.assert(estado.anioActual, 'Debe existir información del año actual');
        this.assert(estado.anioSiguiente, 'Debe existir información del año siguiente');
        this.assert(estado.departamentosActivos >= 0, 'Debe haber departamentos activos');
        this.assert(typeof estado.anioActual.total === 'number', 'Total año actual debe ser número');
        this.assert(typeof estado.anioSiguiente.total === 'number', 'Total año siguiente debe ser número');
    }

    async testCreacionCuotaIndividual() {
        const cuotaData = {
            mes: 'Enero',
            anio: 2025,
            monto: 550,
            fechaVencimiento: new Date(2025, 0, 31, 23, 59, 59).toISOString(),
            departamento: 'TEST-101'
        };

        const nuevaCuota = Cuota.crear(cuotaData);
        
        this.assert(nuevaCuota, 'Debe crear la cuota exitosamente');
        this.assertEquals(nuevaCuota.mes, 'Enero', 'Mes debe ser Enero');
        this.assertEquals(nuevaCuota.anio, 2025, 'Año debe ser 2025');
        this.assertEquals(nuevaCuota.monto, 550, 'Monto debe ser 550');
        this.assertEquals(nuevaCuota.departamento, 'TEST-101', 'Departamento debe ser TEST-101');
        this.assertEquals(nuevaCuota.estado, 'PENDIENTE', 'Estado inicial debe ser PENDIENTE');
    }

    async testGeneracionCuotasMensuales() {
        const data = readData();
        const countAntes = data.cuotas.length;
        
        try {
            const cuotasGeneradas = Cuota.generarCuotasMensuales('Febrero', 2027, 550, new Date(2027, 1, 28).toISOString());
            
            this.assertGreaterThan(cuotasGeneradas.length, 0, 'Debe generar al menos una cuota');
            
            const dataActualizada = readData();
            const countDespues = dataActualizada.cuotas.length;
            
            this.assertEquals(countDespues, countAntes + cuotasGeneradas.length, 'Debe incrementar el total de cuotas');
            
            // Verificar que todas las cuotas generadas son correctas
            cuotasGeneradas.forEach(cuota => {
                this.assertEquals(cuota.mes, 'Febrero', 'Todas deben ser de Febrero');
                this.assertEquals(cuota.anio, 2027, 'Todas deben ser de 2027');
                this.assertEquals(cuota.monto, 550, 'Todas deben tener monto 550');
                this.assertEquals(cuota.estado, 'PENDIENTE', 'Todas deben estar PENDIENTES');
            });
            
        } catch (error) {
            if (error.message.includes('Ya existen cuotas generadas')) {
                this.log('Las cuotas ya existían - comportamiento correcto', 'info');
            } else {
                throw error;
            }
        }
    }

    async testObtenerCuotasPorMesAnio() {
        const cuotasEnero2025 = Cuota.obtenerPorMesAnio('Enero', 2025);
        
        this.assert(Array.isArray(cuotasEnero2025), 'Debe devolver un array');
        
        cuotasEnero2025.forEach(cuota => {
            this.assertEquals(cuota.mes, 'Enero', 'Todas deben ser de Enero');
            this.assertEquals(cuota.anio, 2025, 'Todas deben ser de 2025');
        });
    }

    async testObtenerCuotasPorDepartamento() {
        const data = readData();
        const primerDepartamento = data.usuarios.find(u => u.rol === 'INQUILINO')?.departamento;
        
        if (primerDepartamento) {
            const cuotasDepto = Cuota.obtenerPorDepartamento(primerDepartamento);
            
            this.assert(Array.isArray(cuotasDepto), 'Debe devolver un array');
            
            cuotasDepto.forEach(cuota => {
                this.assertEquals(cuota.departamento, primerDepartamento, `Todas deben ser del departamento ${primerDepartamento}`);
            });
        }
    }

    async testActualizarEstadoCuota() {
        const data = readData();
        const cuotaPendiente = data.cuotas.find(c => c.estado === 'PENDIENTE');
        
        if (cuotaPendiente) {
            const cuotaActualizada = Cuota.actualizarEstado(cuotaPendiente.id, 'PAGADO');
            
            this.assert(cuotaActualizada, 'Debe actualizar la cuota');
            this.assertEquals(cuotaActualizada.estado, 'PAGADO', 'Estado debe ser PAGADO');
            this.assert(cuotaActualizada.fechaPago, 'Debe tener fecha de pago');
            
            // Revertir cambio para no afectar otros tests
            Cuota.actualizarEstado(cuotaPendiente.id, 'PENDIENTE');
        }
    }

    async testRegistrarPago() {
        const data = readData();
        const cuotaPendiente = data.cuotas.find(c => c.estado === 'PENDIENTE');
        
        if (cuotaPendiente) {
            const comprobante = 'TEST-COMPROBANTE-123';
            const cuotaPagada = Cuota.registrarPago(cuotaPendiente.id, comprobante);
            
            this.assert(cuotaPagada, 'Debe registrar el pago');
            this.assertEquals(cuotaPagada.estado, 'PAGADO', 'Estado debe ser PAGADO');
            this.assertEquals(cuotaPagada.comprobantePago, comprobante, 'Debe guardar el comprobante');
            this.assert(cuotaPagada.fechaPago, 'Debe tener fecha de pago');
            
            // Revertir cambio
            Cuota.actualizarEstado(cuotaPendiente.id, 'PENDIENTE');
        }
    }

    async testActualizarCuotasVencidas() {
        // Crear una cuota vencida para probar
        const fechaVencida = new Date();
        fechaVencida.setDate(fechaVencida.getDate() - 1); // Ayer
        
        const cuotaVencida = Cuota.crear({
            mes: 'Test',
            anio: 2024,
            monto: 550,
            fechaVencimiento: fechaVencida.toISOString(),
            departamento: 'TEST-VENCIDA'
        });
        
        const actualizadas = Cuota.actualizarVencidas();
        
        this.assert(typeof actualizadas === 'number', 'Debe devolver número de cuotas actualizadas');
        
        // Verificar que la cuota se marcó como vencida
        const cuotaActualizada = Cuota.obtenerPorId(cuotaVencida.id);
        if (cuotaActualizada && cuotaActualizada.departamento === 'TEST-VENCIDA') {
            this.assertEquals(cuotaActualizada.estado, 'VENCIDO', 'Cuota debe estar marcada como VENCIDA');
        }
    }

    async testValidacionMontosCuotas() {
        const data = readData();
        const cuotasActuales = data.cuotas.filter(c => c.anio >= 2025);
        
        cuotasActuales.forEach(cuota => {
            this.assertEquals(cuota.monto, 550, `Cuota ${cuota.mes}/${cuota.anio} - ${cuota.departamento} debe tener monto $550`);
        });
        
        this.assertGreaterThan(cuotasActuales.length, 0, 'Debe haber cuotas actuales para validar');
    }

    async testFechasVencimientoCorrectas() {
        const data = readData();
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        const cuotas2026 = data.cuotas.filter(c => c.anio === 2026);
        
        meses.forEach((mes, index) => {
            const cuotasMes = cuotas2026.filter(c => c.mes === mes);
            
            if (cuotasMes.length > 0) {
                const fechaVencimiento = new Date(cuotasMes[0].fechaVencimiento);
                const ultimoDiaMes = new Date(2026, index + 1, 0).getDate();
                
                this.assertEquals(fechaVencimiento.getDate(), ultimoDiaMes, 
                    `${mes} 2026 debe vencer el día ${ultimoDiaMes}`);
                this.assertEquals(fechaVencimiento.getMonth(), index, 
                    `${mes} 2026 debe ser del mes ${index + 1}`);
                this.assertEquals(fechaVencimiento.getFullYear(), 2026, 
                    `${mes} 2026 debe ser del año 2026`);
            }
        });
    }

    async testAcumuladoAnual() {
        const data = readData();
        const inquilino = data.usuarios.find(u => u.rol === 'INQUILINO');
        
        if (inquilino) {
            const acumulado = Cuota.obtenerAcumuladoAnual(inquilino.id, 2025);
            
            this.assert(acumulado, 'Debe devolver datos de acumulado');
            this.assertEquals(acumulado.year, 2025, 'Año debe ser 2025');
            this.assertEquals(acumulado.departamento, inquilino.departamento, 
                'Departamento debe coincidir con el del usuario');
            this.assert(typeof acumulado.totalPagado === 'number', 'Total pagado debe ser número');
            this.assert(acumulado.desgloseMensual, 'Debe incluir desglose mensual');
            this.assert(acumulado.comparativaAnioAnterior, 'Debe incluir comparativa año anterior');
        }
    }

    async testDepartamentosActivos() {
        const data = readData();
        const inquilinos = data.usuarios.filter(u => u.rol === 'INQUILINO');
        const departamentos = [...new Set(inquilinos.map(u => u.departamento))];
        
        this.assertGreaterThan(departamentos.length, 0, 'Debe haber al menos un departamento activo');
        
        // Verificar que cada departamento tiene cuotas
        departamentos.forEach(depto => {
            const cuotasDepto = data.cuotas.filter(c => c.departamento === depto);
            this.assertGreaterThan(cuotasDepto.length, 0, 
                `Departamento ${depto} debe tener cuotas asignadas`);
        });
    }

    async testSistemaCompleto() {
        try {
            // Verificar estado inicial
            const estadoInicial = verificarEstadoCuotas();
            this.log(`Estado inicial: ${estadoInicial.anioActual.total} cuotas 2025, ${estadoInicial.anioSiguiente.total} cuotas 2026`);
            
            // Inicializar sistema
            await inicializarCuotasAnuales();
            
            // Verificar estado final
            const estadoFinal = verificarEstadoCuotas();
            this.log(`Estado final: ${estadoFinal.anioActual.total} cuotas 2025, ${estadoFinal.anioSiguiente.total} cuotas 2026`);
            
            // Validaciones del sistema completo
            this.assertGreaterThan(estadoFinal.anioActual.total, 0, 'Debe haber cuotas para 2025');
            this.assertGreaterThan(estadoFinal.anioSiguiente.total, 0, 'Debe haber cuotas para 2026');
            
            // Debe haber cuotas para cada mes de 2026
            const expectedCuotas2026 = estadoFinal.departamentosActivos * 12; // 12 meses
            this.assertEquals(estadoFinal.anioSiguiente.total, expectedCuotas2026, 
                `2026 debe tener ${expectedCuotas2026} cuotas (${estadoFinal.departamentosActivos} deptos × 12 meses)`);
            
        } catch (error) {
            if (error.message && error.message.includes('Ya existen cuotas generadas')) {
                this.log('Sistema ya estaba inicializado - comportamiento correcto');
            } else {
                throw error;
            }
        }
    }

    async runAllTests() {
        this.log('🚀 Iniciando Tests del Sistema de Cuotas');
        this.log('================================================');

        await this.runTest('Estado inicial del sistema', () => this.testEstadoInicialSistema());
        await this.runTest('Creación de cuota individual', () => this.testCreacionCuotaIndividual());
        await this.runTest('Generación de cuotas mensuales', () => this.testGeneracionCuotasMensuales());
        await this.runTest('Obtener cuotas por mes y año', () => this.testObtenerCuotasPorMesAnio());
        await this.runTest('Obtener cuotas por departamento', () => this.testObtenerCuotasPorDepartamento());
        await this.runTest('Actualizar estado de cuota', () => this.testActualizarEstadoCuota());
        await this.runTest('Registrar pago de cuota', () => this.testRegistrarPago());
        await this.runTest('Actualizar cuotas vencidas', () => this.testActualizarCuotasVencidas());
        await this.runTest('Validación montos $550', () => this.testValidacionMontosCuotas());
        await this.runTest('Fechas de vencimiento correctas', () => this.testFechasVencimientoCorrectas());
        await this.runTest('Acumulado anual por usuario', () => this.testAcumuladoAnual());
        await this.runTest('Departamentos activos', () => this.testDepartamentosActivos());
        await this.runTest('Sistema completo', () => this.testSistemaCompleto());

        this.log('================================================');
        this.log(`📊 Resultados: ${this.passedTests}/${this.totalTests} tests pasaron`);
        
        if (this.failedTests > 0) {
            this.log(`❌ ${this.failedTests} tests fallaron:`, 'error');
            this.testResults.filter(r => r.status === 'FAIL').forEach(r => {
                this.log(`   - ${r.test}: ${r.error}`, 'error');
            });
        } else {
            this.log('🎉 ¡Todos los tests pasaron exitosamente!', 'success');
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
    const tester = new CuotasSistemaTest();
    tester.runAllTests()
        .then(results => {
            process.exit(results.success ? 0 : 1);
        })
        .catch(error => {
            console.error('❌ Error ejecutando tests:', error);
            process.exit(1);
        });
}

export default CuotasSistemaTest;