#!/usr/bin/env node
// validateData.js - Script de validación continua de datos

import { generateDataHealthReport, validateDataStructure, cleanInconsistentData } from '../src/utils/dataValidation.js';
import backupSystem from './backupData.js';
const { createAutoBackup } = backupSystem;

/**
 * Ejecutar validación completa con reporte detallado
 */
async function runFullValidation() {
    console.log('🔍 INICIANDO VALIDACIÓN COMPLETA DE DATOS');
    console.log('==========================================');
    
    try {
        // Generar reporte de salud
        const healthReport = generateDataHealthReport();
        
        console.log(`📊 RESUMEN GENERAL:`);
        console.log(`   ✅ Datos válidos: ${healthReport.validation.isValid ? 'SÍ' : 'NO'}`);
        console.log(`   ❌ Errores críticos: ${healthReport.validation.errors.length}`);
        console.log(`   ⚠️ Advertencias: ${healthReport.validation.warnings.length}`);
        console.log('');
        
        // Mostrar estadísticas
        console.log('📈 ESTADÍSTICAS DEL SISTEMA:');
        console.log('----------------------------');
        const stats = healthReport.statistics;
        
        console.log(`👥 USUARIOS (${stats.usuarios.total} total):`);
        console.log(`   - Administradores: ${stats.usuarios.admins}`);
        console.log(`   - Comité: ${stats.usuarios.comite}`);
        console.log(`   - Inquilinos: ${stats.usuarios.inquilinos}`);
        console.log(`   - Activos: ${stats.usuarios.activos}/${stats.usuarios.total}`);
        console.log('');
        
        console.log(`💰 CUOTAS (${stats.cuotas.total} total):`);
        console.log(`   - Pendientes: ${stats.cuotas.pendientes}`);
        console.log(`   - Pagadas: ${stats.cuotas.pagadas}`);
        console.log(`   - Vencidas: ${stats.cuotas.vencidas}`);
        console.log('');
        
        console.log(`💳 GASTOS (${stats.gastos.total} total):`);
        console.log(`   - Monto total: $${stats.gastos.totalMonto.toLocaleString()} MXN`);
        console.log('');
        
        // Mostrar errores si los hay
        if (healthReport.validation.errors.length > 0) {
            console.log('❌ ERRORES CRÍTICOS ENCONTRADOS:');
            console.log('--------------------------------');
            healthReport.validation.errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
            console.log('');
        }
        
        // Mostrar advertencias si las hay
        if (healthReport.validation.warnings.length > 0) {
            console.log('⚠️ ADVERTENCIAS:');
            console.log('----------------');
            healthReport.validation.warnings.forEach((warning, index) => {
                console.log(`   ${index + 1}. ${warning}`);
            });
            console.log('');
        }
        
        // Mostrar recomendaciones
        if (healthReport.recommendations.length > 0) {
            console.log('💡 RECOMENDACIONES:');
            console.log('-------------------');
            healthReport.recommendations.forEach((rec, index) => {
                const icon = rec.type === 'critical' ? '🚨' : rec.type === 'warning' ? '⚠️' : 'ℹ️';
                console.log(`   ${index + 1}. ${icon} ${rec.message}`);
                console.log(`      Acción: ${rec.action}`);
            });
            console.log('');
        }
        
        // Ofrecer limpieza automática si hay problemas
        if (healthReport.validation.errors.length > 0) {
            console.log('🔧 EJECUTANDO LIMPIEZA AUTOMÁTICA...');
            
            // Crear backup antes de limpiar
            const backup = await createAutoBackup('before-cleanup');
            if (backup.success) {
                console.log(`📁 Backup creado: ${backup.filename}`);
            }
            
            // Ejecutar limpieza
            const cleanResult = cleanInconsistentData();
            
            if (cleanResult.changesMade) {
                console.log('✅ LIMPIEZA COMPLETADA:');
                cleanResult.changes.forEach((change, index) => {
                    console.log(`   ${index + 1}. ${change}`);
                });
            } else {
                console.log('ℹ️ No se requirió limpieza adicional');
            }
        }
        
        console.log('🎉 VALIDACIÓN COMPLETADA EXITOSAMENTE');
        return {
            success: true,
            report: healthReport
        };
        
    } catch (error) {
        console.error('💥 ERROR EN VALIDACIÓN:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Validación rápida (solo estructura básica)
 */
async function runQuickValidation() {
    console.log('⚡ VALIDACIÓN RÁPIDA');
    console.log('===================');
    
    try {
        const validation = validateDataStructure();
        
        console.log(`✅ Estado: ${validation.isValid ? 'VÁLIDO' : 'INVÁLIDO'}`);
        console.log(`❌ Errores: ${validation.errors.length}`);
        console.log(`⚠️ Advertencias: ${validation.warnings.length}`);
        
        if (validation.errors.length > 0) {
            console.log('\n❌ Errores encontrados:');
            validation.errors.forEach(error => console.log(`   - ${error}`));
        }
        
        return validation;
        
    } catch (error) {
        console.error('💥 ERROR EN VALIDACIÓN RÁPIDA:', error);
        return { success: false, error: error.message };
    }
}

// Ejecutar según parámetros de línea de comandos
if (import.meta.url === `file://${process.argv[1]}`) {
    const mode = process.argv[2] || 'full';
    
    switch (mode) {
        case 'quick':
            runQuickValidation();
            break;
            
        case 'full':
        default:
            runFullValidation().then(result => {
                process.exit(result.success ? 0 : 1);
            });
            break;
    }
}

export { runFullValidation, runQuickValidation };