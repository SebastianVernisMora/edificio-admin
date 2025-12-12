/**
 * Tests del Sistema Completo
 * Suite integral que prueba todo el sistema
 */

import CuotasSistemaTest from './cuotas-sistema.test.js';
import FrontendApiTest from './frontend-api.test.js';
import { readData } from '../src/data.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

class SistemaCompletoTest {
    constructor() {
        this.testResults = [];
        this.totalTests = 0;
        this.passedTests = 0;
        this.failedTests = 0;
        this.testSuites = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`${prefix} [${timestamp}] ${message}`);
    }

    async runTestSuite(suiteName, TestClass) {
        this.log(`\n🧪 Ejecutando Suite: ${suiteName}`);
        this.log('='.repeat(50));
        
        try {
            const tester = new TestClass();
            const results = await tester.runAllTests();
            
            this.testSuites.push({
                name: suiteName,
                ...results
            });
            
            this.totalTests += results.total;
            this.passedTests += results.passed;
            this.failedTests += results.failed;
            
            if (results.success) {
                this.log(`✅ Suite ${suiteName} completada exitosamente`, 'success');
            } else {
                this.log(`❌ Suite ${suiteName} completada con errores`, 'error');
            }
            
            return results;
            
        } catch (error) {
            this.log(`❌ Error ejecutando suite ${suiteName}: ${error.message}`, 'error');
            throw error;
        }
    }

    async testIntegridadDatos() {
        this.log('🔍 Verificando integridad de datos...');
        
        const data = readData();
        
        // Verificar estructura básica
        if (!data.usuarios || !Array.isArray(data.usuarios)) {
            throw new Error('Estructura de usuarios inválida');
        }
        
        if (!data.cuotas || !Array.isArray(data.cuotas)) {
            throw new Error('Estructura de cuotas inválida');
        }
        
        // Verificar datos mínimos
        const admins = data.usuarios.filter(u => u.rol === 'ADMIN');
        const inquilinos = data.usuarios.filter(u => u.rol === 'INQUILINO');
        
        if (admins.length === 0) {
            throw new Error('No hay usuarios administradores');
        }
        
        if (inquilinos.length === 0) {
            throw new Error('No hay usuarios inquilinos');
        }
        
        // Verificar cuotas para años actuales
        const currentYear = new Date().getFullYear();
        const cuotasActuales = data.cuotas.filter(c => c.anio >= currentYear);
        
        if (cuotasActuales.length === 0) {
            throw new Error('No hay cuotas para años actuales');
        }
        
        // Verificar montos correctos
        const cuotasIncorrectas = cuotasActuales.filter(c => c.monto !== 550);
        if (cuotasIncorrectas.length > 0) {
            throw new Error(`${cuotasIncorrectas.length} cuotas tienen monto incorrecto (debe ser $550)`);
        }
        
        this.log(`✅ Integridad de datos verificada: ${data.usuarios.length} usuarios, ${data.cuotas.length} cuotas`);
    }

    async testConfiguracionServidor() {
        this.log('⚙️ Verificando configuración del servidor...');
        
        // Verificar variables de entorno
        const requiredEnvVars = ['PORT', 'JWT_SECRET', 'NODE_ENV'];
        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        
        if (missingVars.length > 0) {
            throw new Error(`Variables de entorno faltantes: ${missingVars.join(', ')}`);
        }
        
        // Verificar puerto
        const port = process.env.PORT || 3000;
        if (isNaN(port) || port < 1000 || port > 65535) {
            throw new Error(`Puerto inválido: ${port}`);
        }
        
        // Verificar JWT secret
        if (process.env.JWT_SECRET.length < 10) {
            throw new Error('JWT_SECRET es demasiado corto (mínimo 10 caracteres)');
        }
        
        this.log('✅ Configuración del servidor verificada');
    }

    async testEstructuraArchivos() {
        this.log('📁 Verificando estructura de archivos...');
        
        const fs = await import('fs');
        const path = await import('path');
        
        const requiredFiles = [
            'src/app.js',
            'src/data.js',
            'src/models/Cuota.js',
            'src/utils/cuotasInicializacion.js',
            'public/js/auth.js',
            'package.json',
            '.env'
        ];
        
        const missingFiles = [];
        
        for (const file of requiredFiles) {
            if (!fs.default.existsSync(file)) {
                missingFiles.push(file);
            }
        }
        
        if (missingFiles.length > 0) {
            throw new Error(`Archivos faltantes: ${missingFiles.join(', ')}`);
        }
        
        this.log('✅ Estructura de archivos verificada');
    }

    async testRendimiento() {
        this.log('⚡ Ejecutando tests de rendimiento...');
        
        const startTime = Date.now();
        
        // Test de carga de datos
        const loadStart = Date.now();
        const data = readData();
        const loadTime = Date.now() - loadStart;
        
        if (loadTime > 1000) {
            this.log(`⚠️ Carga de datos lenta: ${loadTime}ms`, 'warning');
        } else {
            this.log(`✅ Carga de datos rápida: ${loadTime}ms`);
        }
        
        // Test de consultas básicas
        const queryStart = Date.now();
        const cuotas2025 = data.cuotas.filter(c => c.anio === 2025);
        const cuotas2026 = data.cuotas.filter(c => c.anio === 2026);
        const inquilinos = data.usuarios.filter(u => u.rol === 'INQUILINO');
        const queryTime = Date.now() - queryStart;
        
        if (queryTime > 100) {
            this.log(`⚠️ Consultas lentas: ${queryTime}ms`, 'warning');
        } else {
            this.log(`✅ Consultas rápidas: ${queryTime}ms`);
        }
        
        const totalTime = Date.now() - startTime;
        this.log(`📊 Rendimiento total: ${totalTime}ms`);
    }

    async testSeguridad() {
        this.log('🔒 Verificando aspectos de seguridad...');
        
        const data = readData();
        
        // Verificar que no hay passwords en texto plano
        const usersWithPlainPassword = data.usuarios.filter(u => 
            u.password && !u.password.startsWith('$2b$')
        );
        
        if (usersWithPlainPassword.length > 0) {
            this.log(`⚠️ ${usersWithPlainPassword.length} usuarios con password en texto plano`, 'warning');
        } else {
            this.log('✅ Passwords están hasheados');
        }
        
        // Verificar JWT secret seguro
        const jwtSecret = process.env.JWT_SECRET;
        if (jwtSecret === 'default' || jwtSecret === 'secret' || jwtSecret.length < 32) {
            this.log('⚠️ JWT_SECRET débil o predecible', 'warning');
        } else {
            this.log('✅ JWT_SECRET seguro');
        }
        
        // Verificar roles apropiados
        const adminCount = data.usuarios.filter(u => u.rol === 'ADMIN').length;
        if (adminCount === 0) {
            throw new Error('No hay administradores');
        } else if (adminCount > 5) {
            this.log(`⚠️ Muchos administradores (${adminCount})`, 'warning');
        } else {
            this.log(`✅ Número apropiado de administradores: ${adminCount}`);
        }
    }

    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests: this.totalTests,
                passedTests: this.passedTests,
                failedTests: this.failedTests,
                successRate: this.totalTests > 0 ? (this.passedTests / this.totalTests * 100).toFixed(2) : 0,
                overallSuccess: this.failedTests === 0
            },
            testSuites: this.testSuites,
            systemInfo: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch,
                memoryUsage: process.memoryUsage()
            }
        };

        this.log('\n📋 REPORTE FINAL DEL SISTEMA');
        this.log('='.repeat(80));
        this.log(`🎯 Tests Totales: ${report.summary.totalTests}`);
        this.log(`✅ Exitosos: ${report.summary.passedTests}`);
        this.log(`❌ Fallidos: ${report.summary.failedTests}`);
        this.log(`📊 Tasa de Éxito: ${report.summary.successRate}%`);
        
        if (report.summary.overallSuccess) {
            this.log('🎉 ¡SISTEMA FUNCIONANDO CORRECTAMENTE!', 'success');
        } else {
            this.log('⚠️ SISTEMA CON PROBLEMAS DETECTADOS', 'warning');
        }

        this.log('\n📋 Detalle por Suite:');
        this.testSuites.forEach(suite => {
            const status = suite.success ? '✅' : '❌';
            this.log(`${status} ${suite.name}: ${suite.passed}/${suite.total}`);
        });

        this.log('\n💾 Información del Sistema:');
        this.log(`Node.js: ${report.systemInfo.nodeVersion}`);
        this.log(`Plataforma: ${report.systemInfo.platform} (${report.systemInfo.arch})`);
        this.log(`Memoria: ${Math.round(report.systemInfo.memoryUsage.rss / 1024 / 1024)}MB RSS`);

        return report;
    }

    async runAllTests() {
        this.log('🚀 INICIANDO TESTS COMPLETOS DEL SISTEMA');
        this.log('='.repeat(80));
        
        const startTime = Date.now();

        try {
            // Tests preliminares del sistema
            await this.testConfiguracionServidor();
            await this.testEstructuraArchivos();
            await this.testIntegridadDatos();
            await this.testRendimiento();
            await this.testSeguridad();

            // Ejecutar suites de tests
            await this.runTestSuite('Sistema de Cuotas', CuotasSistemaTest);
            await this.runTestSuite('Frontend y API', FrontendApiTest);

            const totalTime = Date.now() - startTime;
            this.log(`\n⏱️  Tiempo total de ejecución: ${(totalTime / 1000).toFixed(2)}s`);

        } catch (error) {
            this.log(`❌ Error crítico en tests del sistema: ${error.message}`, 'error');
            this.failedTests++;
        }

        const report = this.generateReport();
        
        // Guardar reporte
        try {
            const fs = await import('fs');
            const reportPath = 'test-reports/sistema-completo-report.json';
            fs.default.writeFileSync(reportPath, JSON.stringify(report, null, 2));
            this.log(`📄 Reporte guardado en: ${reportPath}`);
        } catch (error) {
            this.log(`⚠️ No se pudo guardar el reporte: ${error.message}`, 'warning');
        }

        return report;
    }
}

// Ejecutar tests si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new SistemaCompletoTest();
    tester.runAllTests()
        .then(report => {
            process.exit(report.summary.overallSuccess ? 0 : 1);
        })
        .catch(error => {
            console.error('❌ Error ejecutando tests del sistema:', error);
            process.exit(1);
        });
}

export default SistemaCompletoTest;