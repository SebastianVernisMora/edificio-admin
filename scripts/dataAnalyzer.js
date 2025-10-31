#!/usr/bin/env node
// dataAnalyzer.js - Herramienta de análisis avanzado de datos

import { readData } from '../src/data.js';
import { generateDataHealthReport } from '../src/utils/dataValidation.js';

/**
 * Análisis completo del sistema
 */
function analyzeSystem() {
    console.log('🔬 ANÁLISIS AVANZADO DEL SISTEMA EDIFICIO-ADMIN');
    console.log('================================================');
    
    const data = readData();
    const healthReport = generateDataHealthReport();
    
    // Análisis de usuarios
    analyzeUsers(data.usuarios);
    
    // Análisis de cuotas
    analyzeCuotas(data.cuotas);
    
    // Análisis de gastos
    analyzeGastos(data.gastos);
    
    // Análisis financiero
    analyzeFinances(data);
    
    // Recomendaciones del sistema
    showRecommendations(healthReport.recommendations);
}

/**
 * Análisis detallado de usuarios
 */
function analyzeUsers(usuarios) {
    console.log('\n👥 ANÁLISIS DE USUARIOS:');
    console.log('========================');
    
    const usersByRole = usuarios.reduce((acc, user) => {
        acc[user.rol] = (acc[user.rol] || 0) + 1;
        return acc;
    }, {});
    
    console.log('📊 Distribución por rol:');
    Object.entries(usersByRole).forEach(([rol, count]) => {
        const percentage = ((count / usuarios.length) * 100).toFixed(1);
        console.log(`   - ${rol}: ${count} usuarios (${percentage}%)`);
    });
    
    // Análisis de departamentos
    const departamentos = usuarios
        .filter(u => u.rol === 'INQUILINO')
        .map(u => u.departamento)
        .sort();
    
    console.log(`\n🏠 Departamentos ocupados: ${departamentos.length}/20`);
    console.log(`   Ocupación: ${((departamentos.length / 20) * 100).toFixed(1)}%`);
    
    // Departamentos disponibles
    const allDepartments = [];
    for (let floor = 1; floor <= 5; floor++) {
        for (let unit = 1; unit <= 4; unit++) {
            allDepartments.push(`${floor}0${unit}`);
        }
    }
    
    const available = allDepartments.filter(dept => !departamentos.includes(dept));
    console.log(`   Disponibles: ${available.join(', ')}`);
    
    // Análisis de permisos para usuarios COMITE
    const comiteUsers = usuarios.filter(u => u.rol === 'COMITE');
    if (comiteUsers.length > 0) {
        console.log('\n🛡️ Análisis de permisos COMITE:');
        comiteUsers.forEach(user => {
            const permisos = user.permisos || {};
            const activePermissions = Object.values(permisos).filter(p => p).length;
            console.log(`   - ${user.nombre}: ${activePermissions}/6 permisos activos`);
            
            if (activePermissions === 0) {
                console.log('     ⚠️ Usuario sin permisos activos');
            }
        });
    }
}

/**
 * Análisis de cuotas
 */
function analyzeCuotas(cuotas) {
    console.log('\n💰 ANÁLISIS DE CUOTAS:');
    console.log('======================');
    
    const cuotasByStatus = cuotas.reduce((acc, cuota) => {
        acc[cuota.estado] = (acc[cuota.estado] || 0) + 1;
        return acc;
    }, {});
    
    console.log('📊 Estado de cuotas:');
    Object.entries(cuotasByStatus).forEach(([estado, count]) => {
        const percentage = ((count / cuotas.length) * 100).toFixed(1);
        const icon = estado === 'PAGADO' ? '✅' : estado === 'VENCIDO' ? '❌' : '⏳';
        console.log(`   ${icon} ${estado}: ${count} cuotas (${percentage}%)`);
    });
    
    // Análisis de ingresos
    const totalIngresos = cuotas
        .filter(c => c.estado === 'PAGADO')
        .reduce((sum, c) => sum + c.monto, 0);
    
    const ingresosPotenciales = cuotas.reduce((sum, c) => sum + c.monto, 0);
    const eficienciaCobranza = ((totalIngresos / ingresosPotenciales) * 100).toFixed(1);
    
    console.log(`\n💵 Análisis financiero de cuotas:`);
    console.log(`   - Ingresos realizados: $${totalIngresos.toLocaleString()} MXN`);
    console.log(`   - Ingresos potenciales: $${ingresosPotenciales.toLocaleString()} MXN`);
    console.log(`   - Eficiencia de cobranza: ${eficienciaCobranza}%`);
}

/**
 * Análisis de gastos
 */
function analyzeGastos(gastos) {
    console.log('\n💳 ANÁLISIS DE GASTOS:');
    console.log('======================');
    
    const gastosByCategory = gastos.reduce((acc, gasto) => {
        acc[gasto.categoria] = (acc[gasto.categoria] || 0) + gasto.monto;
        return acc;
    }, {});
    
    const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);
    
    console.log('📊 Gastos por categoría:');
    Object.entries(gastosByCategory)
        .sort(([,a], [,b]) => b - a)
        .forEach(([categoria, monto]) => {
            const percentage = ((monto / totalGastos) * 100).toFixed(1);
            console.log(`   - ${categoria}: $${monto.toLocaleString()} MXN (${percentage}%)`);
        });
    
    console.log(`\n💰 Total gastado: $${totalGastos.toLocaleString()} MXN`);
    
    // Análisis temporal
    const gastosRecientes = gastos.filter(g => {
        const gastoDate = new Date(g.fecha);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return gastoDate >= thirtyDaysAgo;
    });
    
    const gastosRecientesTotal = gastosRecientes.reduce((sum, g) => sum + g.monto, 0);
    console.log(`📅 Gastos últimos 30 días: $${gastosRecientesTotal.toLocaleString()} MXN (${gastosRecientes.length} gastos)`);
}

/**
 * Análisis financiero general
 */
function analyzeFinances(data) {
    console.log('\n🏦 ANÁLISIS FINANCIERO GENERAL:');
    console.log('===============================');
    
    const fondos = data.fondos;
    const totalGastos = data.gastos.reduce((sum, g) => sum + g.monto, 0);
    const totalIngresos = data.cuotas
        .filter(c => c.estado === 'PAGADO')
        .reduce((sum, c) => sum + c.monto, 0);
    
    console.log('💰 Estado de fondos:');
    console.log(`   - Fondo Ahorro: $${fondos.ahorroAcumulado.toLocaleString()} MXN`);
    console.log(`   - Gastos Mayores: $${fondos.gastosMayores.toLocaleString()} MXN`);
    console.log(`   - Dinero Operacional: $${fondos.dineroOperacional.toLocaleString()} MXN`);
    console.log(`   - Patrimonio Total: $${fondos.patrimonioTotal.toLocaleString()} MXN`);
    
    console.log('\n📈 Flujo de efectivo:');
    console.log(`   - Ingresos por cuotas: $${totalIngresos.toLocaleString()} MXN`);
    console.log(`   - Gastos registrados: $${totalGastos.toLocaleString()} MXN`);
    console.log(`   - Balance neto: $${(totalIngresos - totalGastos).toLocaleString()} MXN`);
    
    // Análisis de proyectos críticos
    if (data.proyectos) {
        const totalProyectos = data.proyectos.reduce((sum, p) => sum + p.monto, 0);
        const cobertura = ((fondos.gastosMayores / totalProyectos) * 100).toFixed(1);
        
        console.log('\n🚧 Proyectos críticos 2026:');
        console.log(`   - Costo total proyectos: $${totalProyectos.toLocaleString()} MXN`);
        console.log(`   - Fondos disponibles: $${fondos.gastosMayores.toLocaleString()} MXN`);
        console.log(`   - Cobertura: ${cobertura}%`);
        
        if (cobertura < 100) {
            const deficit = totalProyectos - fondos.gastosMayores;
            console.log(`   ⚠️ Déficit: $${deficit.toLocaleString()} MXN`);
        }
    }
}

/**
 * Mostrar recomendaciones del sistema
 */
function showRecommendations(recommendations) {
    if (recommendations.length === 0) {
        console.log('\n✅ SISTEMA EN ÓPTIMAS CONDICIONES');
        console.log('No se encontraron problemas que requieran atención');
        return;
    }
    
    console.log('\n💡 RECOMENDACIONES DEL SISTEMA:');
    console.log('===============================');
    
    recommendations.forEach((rec, index) => {
        const icon = rec.type === 'critical' ? '🚨' : rec.type === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`${index + 1}. ${icon} ${rec.message}`);
        console.log(`   Acción recomendada: ${rec.action}`);
        console.log('');
    });
}

/**
 * Generar reporte completo en formato JSON
 */
function generateJSONReport() {
    const data = readData();
    const healthReport = generateDataHealthReport();
    
    const report = {
        timestamp: new Date().toISOString(),
        system: {
            version: '1.0.0',
            environment: 'production'
        },
        health: healthReport,
        analysis: {
            users: analyzeUsersData(data.usuarios),
            cuotas: analyzeCuotasData(data.cuotas),
            gastos: analyzeGastosData(data.gastos),
            finances: analyzeFinancesData(data)
        }
    };
    
    return report;
}

// Funciones auxiliares para análisis de datos
function analyzeUsersData(usuarios) {
    const usersByRole = usuarios.reduce((acc, user) => {
        acc[user.rol] = (acc[user.rol] || 0) + 1;
        return acc;
    }, {});
    
    const departamentos = usuarios
        .filter(u => u.rol === 'INQUILINO')
        .map(u => u.departamento);
    
    return {
        total: usuarios.length,
        byRole: usersByRole,
        occupancy: {
            occupied: departamentos.length,
            total: 20,
            percentage: ((departamentos.length / 20) * 100).toFixed(1)
        }
    };
}

function analyzeCuotasData(cuotas) {
    const byStatus = cuotas.reduce((acc, cuota) => {
        acc[cuota.estado] = (acc[cuota.estado] || 0) + 1;
        return acc;
    }, {});
    
    const totalIngresos = cuotas
        .filter(c => c.estado === 'PAGADO')
        .reduce((sum, c) => sum + c.monto, 0);
    
    return {
        total: cuotas.length,
        byStatus,
        totalIngresos,
        averageAmount: cuotas.length > 0 ? cuotas.reduce((sum, c) => sum + c.monto, 0) / cuotas.length : 0
    };
}

function analyzeGastosData(gastos) {
    const byCategory = gastos.reduce((acc, gasto) => {
        acc[gasto.categoria] = (acc[gasto.categoria] || 0) + gasto.monto;
        return acc;
    }, {});
    
    return {
        total: gastos.length,
        byCategory,
        totalAmount: gastos.reduce((sum, g) => sum + g.monto, 0),
        averageAmount: gastos.length > 0 ? gastos.reduce((sum, g) => sum + g.monto, 0) / gastos.length : 0
    };
}

function analyzeFinancesData(data) {
    const totalIngresos = data.cuotas
        .filter(c => c.estado === 'PAGADO')
        .reduce((sum, c) => sum + c.monto, 0);
    
    const totalGastos = data.gastos.reduce((sum, g) => sum + g.monto, 0);
    
    return {
        fondos: data.fondos,
        ingresos: totalIngresos,
        gastos: totalGastos,
        balance: totalIngresos - totalGastos,
        proyectos: data.proyectos ? {
            total: data.proyectos.reduce((sum, p) => sum + p.monto, 0),
            count: data.proyectos.length
        } : null
    };
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    const format = process.argv[2] || 'console';
    
    if (format === 'json') {
        const report = generateJSONReport();
        console.log(JSON.stringify(report, null, 2));
    } else {
        analyzeSystem();
    }
}

export { analyzeSystem, generateJSONReport };