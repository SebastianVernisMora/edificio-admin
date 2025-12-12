/**
 * Tests de Frontend y API
 * Prueba la comunicación entre frontend y backend
 */

import fetch from 'node-fetch';
import { readData } from '../src/data.js';

class FrontendApiTest {
    constructor() {
        this.testResults = [];
        this.totalTests = 0;
        this.passedTests = 0;
        this.failedTests = 0;
        this.baseUrl = 'http://localhost:3000';
        this.authToken = null;
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

    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.authToken ? { 'x-auth-token': this.authToken } : {})
            }
        };

        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        const response = await fetch(url, mergedOptions);
        return { response, data: await this.parseResponse(response) };
    }

    async parseResponse(response) {
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch {
            return { text, isJson: false };
        }
    }

    async testServidorActivo() {
        const { response } = await this.makeRequest('/');
        this.assert(response.status === 200, 'Servidor debe responder con status 200');
    }

    async testLoginAdmin() {
        const data = readData();
        const admin = data.usuarios.find(u => u.rol === 'ADMIN');
        
        this.assert(admin, 'Debe existir al menos un usuario administrador');

        const { response, data: responseData } = await this.makeRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: admin.email,
                password: 'admin123' // Password por defecto
            })
        });

        if (response.status === 200 && responseData.success) {
            this.authToken = responseData.data.token;
            this.assert(this.authToken, 'Debe devolver token de autenticación');
            this.log('Login exitoso, token obtenido');
        } else {
            // Intentar con otro password común
            const { response: response2, data: responseData2 } = await this.makeRequest('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: admin.email,
                    password: 'password'
                })
            });

            if (response2.status === 200 && responseData2.success) {
                this.authToken = responseData2.data.token;
                this.assert(this.authToken, 'Debe devolver token de autenticación');
                this.log('Login exitoso con password alternativo');
            } else {
                throw new Error(`Login falló: ${responseData.message || 'Credenciales inválidas'}`);
            }
        }
    }

    async testApiUsuarios() {
        const { response, data } = await this.makeRequest('/api/usuarios');
        
        if (response.status === 401) {
            throw new Error('Token inválido o expirado');
        }

        this.assertEquals(response.status, 200, 'API usuarios debe responder 200');
        this.assert(data.success, 'Respuesta debe ser exitosa');
        this.assert(Array.isArray(data.data), 'Debe devolver array de usuarios');
        this.assert(data.data.length > 0, 'Debe haber al menos un usuario');
    }

    async testApiCuotas() {
        const { response, data } = await this.makeRequest('/api/cuotas');
        
        this.assertEquals(response.status, 200, 'API cuotas debe responder 200');
        this.assert(data.success, 'Respuesta debe ser exitosa');
        this.assert(Array.isArray(data.data), 'Debe devolver array de cuotas');
    }

    async testApiCuotasEstado() {
        const { response, data } = await this.makeRequest('/api/cuotas/sistema/estado');
        
        this.assertEquals(response.status, 200, 'API estado cuotas debe responder 200');
        this.assert(data.success, 'Respuesta debe ser exitosa');
        this.assert(data.data.anioActual, 'Debe incluir datos del año actual');
        this.assert(data.data.anioSiguiente, 'Debe incluir datos del año siguiente');
        this.assert(typeof data.data.departamentosActivos === 'number', 'Debe incluir número de departamentos activos');
    }

    async testApiGastos() {
        const { response, data } = await this.makeRequest('/api/gastos');
        
        this.assertEquals(response.status, 200, 'API gastos debe responder 200');
        this.assert(data.success, 'Respuesta debe ser exitosa');
        this.assert(Array.isArray(data.data), 'Debe devolver array de gastos');
    }

    async testApiPresupuestos() {
        const { response, data } = await this.makeRequest('/api/presupuestos');
        
        this.assertEquals(response.status, 200, 'API presupuestos debe responder 200');
        this.assert(data.success, 'Respuesta debe ser exitosa');
        this.assert(Array.isArray(data.data), 'Debe devolver array de presupuestos');
    }

    async testApiAnuncios() {
        const { response, data } = await this.makeRequest('/api/anuncios');
        
        this.assertEquals(response.status, 200, 'API anuncios debe responder 200');
        this.assert(data.success, 'Respuesta debe ser exitosa');
        this.assert(Array.isArray(data.data), 'Debe devolver array de anuncios');
    }

    async testApiCierres() {
        const { response, data } = await this.makeRequest('/api/cierres');
        
        this.assertEquals(response.status, 200, 'API cierres debe responder 200');
        this.assert(data.success, 'Respuesta debe ser exitosa');
        this.assert(Array.isArray(data.data), 'Debe devolver array de cierres');
    }

    async testApiFondos() {
        const { response, data } = await this.makeRequest('/api/fondos');
        
        this.assertEquals(response.status, 200, 'API fondos debe responder 200');
        this.assert(data.success, 'Respuesta debe ser exitosa');
        this.assert(data.data.total !== undefined, 'Debe incluir total de fondos');
    }

    async testApiPermisos() {
        const { response, data } = await this.makeRequest('/api/permisos');
        
        this.assertEquals(response.status, 200, 'API permisos debe responder 200');
        this.assert(data.success, 'Respuesta debe ser exitosa');
        this.assert(Array.isArray(data.data), 'Debe devolver array de permisos');
    }

    async testApiSolicitudes() {
        const { response, data } = await this.makeRequest('/api/solicitudes');
        
        this.assertEquals(response.status, 200, 'API solicitudes debe responder 200');
        this.assert(data.success, 'Respuesta debe ser exitosa');
        this.assert(Array.isArray(data.data), 'Debe devolver array de solicitudes');
    }

    async testPaginasEstaticas() {
        // Test página principal
        const { response: homeResponse } = await this.makeRequest('/');
        this.assertEquals(homeResponse.status, 200, 'Página principal debe cargar');

        // Test página admin
        const { response: adminResponse } = await this.makeRequest('/admin');
        this.assertEquals(adminResponse.status, 200, 'Página admin debe cargar');

        // Test página inquilino
        const { response: inquilinoResponse } = await this.makeRequest('/inquilino');
        this.assertEquals(inquilinoResponse.status, 200, 'Página inquilino debe cargar');
    }

    async testManejadorErrores() {
        // Test endpoint inexistente
        const { response } = await this.makeRequest('/api/endpoint-inexistente');
        this.assert(response.status === 404, 'Endpoint inexistente debe devolver 404');

        // Test sin token
        const originalToken = this.authToken;
        this.authToken = null;
        
        const { response: unauthorizedResponse } = await this.makeRequest('/api/usuarios');
        this.assert(unauthorizedResponse.status === 401, 'Sin token debe devolver 401');
        
        this.authToken = originalToken;
    }

    async testCrearCuota() {
        const { response, data } = await this.makeRequest('/api/cuotas/generar', {
            method: 'POST',
            body: JSON.stringify({
                mes: 'Marzo',
                anio: 2027,
                monto: 550,
                fechaVencimiento: new Date(2027, 2, 31).toISOString()
            })
        });

        if (response.status === 200) {
            this.assert(data.success, 'Generación debe ser exitosa');
            this.assert(Array.isArray(data.data), 'Debe devolver array de cuotas generadas');
        } else if (response.status === 400 && data.message.includes('Ya existen cuotas')) {
            this.log('Las cuotas ya existían - comportamiento esperado');
        } else {
            throw new Error(`Error creando cuotas: ${data.message}`);
        }
    }

    async testActualizarEstadoCuota() {
        // Buscar una cuota pendiente
        const { response: cuotasResponse, data: cuotasData } = await this.makeRequest('/api/cuotas');
        this.assert(cuotasData.success, 'Debe obtener cuotas exitosamente');
        
        const cuotaPendiente = cuotasData.data.find(c => c.estado === 'PENDIENTE');
        
        if (cuotaPendiente) {
            const { response, data } = await this.makeRequest(`/api/cuotas/${cuotaPendiente.id}/estado`, {
                method: 'PUT',
                body: JSON.stringify({
                    estado: 'PAGADO',
                    comprobantePago: 'TEST-12345'
                })
            });

            this.assertEquals(response.status, 200, 'Actualización debe ser exitosa');
            this.assert(data.success, 'Respuesta debe ser exitosa');
            
            // Revertir cambio
            await this.makeRequest(`/api/cuotas/${cuotaPendiente.id}/estado`, {
                method: 'PUT',
                body: JSON.stringify({ estado: 'PENDIENTE' })
            });
        }
    }

    async testFetchAuthMejorado() {
        // Simular el comportamiento de fetchAuth mejorado
        try {
            // Test con token inválido
            const invalidToken = 'token.invalido.test';
            const { response, data } = await this.makeRequest('/api/usuarios', {
                headers: { 'x-auth-token': invalidToken }
            });

            if (response.status === 401) {
                this.log('Manejo correcto de token inválido');
            } else {
                throw new Error('Token inválido debería devolver 401');
            }
        } catch (error) {
            if (error.message.includes('fetch')) {
                this.log('Error de conexión manejado correctamente');
            } else {
                throw error;
            }
        }
    }

    async runAllTests() {
        this.log('🚀 Iniciando Tests de Frontend y API');
        this.log('=====================================');

        await this.runTest('Servidor activo', () => this.testServidorActivo());
        await this.runTest('Login administrador', () => this.testLoginAdmin());
        await this.runTest('API Usuarios', () => this.testApiUsuarios());
        await this.runTest('API Cuotas', () => this.testApiCuotas());
        await this.runTest('API Estado Cuotas', () => this.testApiCuotasEstado());
        await this.runTest('API Gastos', () => this.testApiGastos());
        await this.runTest('API Presupuestos', () => this.testApiPresupuestos());
        await this.runTest('API Anuncios', () => this.testApiAnuncios());
        await this.runTest('API Cierres', () => this.testApiCierres());
        await this.runTest('API Fondos', () => this.testApiFondos());
        await this.runTest('API Permisos', () => this.testApiPermisos());
        await this.runTest('API Solicitudes', () => this.testApiSolicitudes());
        await this.runTest('Páginas estáticas', () => this.testPaginasEstaticas());
        await this.runTest('Manejo de errores', () => this.testManejadorErrores());
        await this.runTest('Crear cuota', () => this.testCrearCuota());
        await this.runTest('Actualizar estado cuota', () => this.testActualizarEstadoCuota());
        await this.runTest('fetchAuth mejorado', () => this.testFetchAuthMejorado());

        this.log('=====================================');
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
    const tester = new FrontendApiTest();
    tester.runAllTests()
        .then(results => {
            process.exit(results.success ? 0 : 1);
        })
        .catch(error => {
            console.error('❌ Error ejecutando tests:', error);
            process.exit(1);
        });
}

export default FrontendApiTest;