#!/usr/bin/env node
// dataMonitor.js - Sistema de monitoreo continuo de integridad de datos

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateDataHealthReport } from '../src/utils/dataValidation.js';
import backupSystem from './backupData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, '../data.json');
const logPath = path.join(__dirname, '../logs/data-monitor.log');

/**
 * Monitorear cambios en data.json y validar automáticamente
 */
class DataMonitor {
    constructor() {
        this.isMonitoring = false;
        this.lastValidation = null;
        this.validationInterval = null;
    }

    /**
     * Iniciar monitoreo continuo
     */
    start(intervalMinutes = 5) {
        if (this.isMonitoring) {
            console.log('⚠️ El monitoreo ya está activo');
            return;
        }

        console.log(`🔍 Iniciando monitoreo de datos (cada ${intervalMinutes} minutos)`);
        this.isMonitoring = true;

        // Validación inicial
        this.runValidation();

        // Configurar validación periódica
        this.validationInterval = setInterval(() => {
            this.runValidation();
        }, intervalMinutes * 60 * 1000);

        // Monitorear cambios en el archivo
        fs.watchFile(dataPath, (curr, prev) => {
            if (curr.mtime !== prev.mtime) {
                console.log('📝 Cambios detectados en data.json - Ejecutando validación...');
                this.runValidation();
            }
        });

        console.log('✅ Monitoreo iniciado exitosamente');
    }

    /**
     * Detener monitoreo
     */
    stop() {
        if (!this.isMonitoring) {
            console.log('⚠️ El monitoreo no está activo');
            return;
        }

        this.isMonitoring = false;
        
        if (this.validationInterval) {
            clearInterval(this.validationInterval);
            this.validationInterval = null;
        }

        fs.unwatchFile(dataPath);
        console.log('🛑 Monitoreo detenido');
    }

    /**
     * Ejecutar validación y logging
     */
    async runValidation() {
        try {
            const report = generateDataHealthReport();
            const timestamp = new Date().toISOString();
            
            // Log básico en consola
            const status = report.validation.isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO';
            console.log(`[${timestamp}] ${status} - Errores: ${report.validation.errors.length}, Advertencias: ${report.validation.warnings.length}`);
            
            // Log detallado en archivo
            this.logToFile(timestamp, report);
            
            // Crear backup automático si hay errores críticos
            if (report.validation.errors.length > 0) {
                console.log('🚨 Errores críticos detectados - Creando backup automático...');
                const backup = await backupSystem.createAutoBackup('critical-errors-detected');
                if (backup.success) {
                    console.log(`📁 Backup de emergencia: ${backup.filename}`);
                }
            }
            
            this.lastValidation = report;
            return report;
            
        } catch (error) {
            console.error('💥 Error en validación:', error);
            this.logError(error);
        }
    }

    /**
     * Escribir log detallado en archivo
     */
    logToFile(timestamp, report) {
        try {
            // Crear directorio de logs si no existe
            const logsDir = path.dirname(logPath);
            if (!fs.existsSync(logsDir)) {
                fs.mkdirSync(logsDir, { recursive: true });
            }

            const logEntry = {
                timestamp,
                isValid: report.validation.isValid,
                errors: report.validation.errors,
                warnings: report.validation.warnings,
                statistics: report.statistics
            };

            const logLine = JSON.stringify(logEntry) + '\n';
            fs.appendFileSync(logPath, logLine);
            
        } catch (error) {
            console.error('⚠️ Error escribiendo log:', error);
        }
    }

    /**
     * Log de errores
     */
    logError(error) {
        try {
            const timestamp = new Date().toISOString();
            const errorEntry = {
                timestamp,
                type: 'MONITOR_ERROR',
                error: error.message,
                stack: error.stack
            };

            const logLine = JSON.stringify(errorEntry) + '\n';
            fs.appendFileSync(logPath, logLine);
            
        } catch (logError) {
            console.error('💥 Error crítico en logging:', logError);
        }
    }

    /**
     * Obtener estadísticas del monitoreo
     */
    getStats() {
        return {
            isMonitoring: this.isMonitoring,
            lastValidation: this.lastValidation,
            uptime: this.isMonitoring ? 'Activo' : 'Inactivo'
        };
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    const action = process.argv[2] || 'help';
    const param = process.argv[3];
    
    const monitor = new DataMonitor();
    
    switch (action) {
        case 'start':
            const interval = param ? parseInt(param) : 5;
            monitor.start(interval);
            
            // Mantener el proceso activo
            process.on('SIGINT', () => {
                console.log('\n🛑 Deteniendo monitoreo...');
                monitor.stop();
                process.exit(0);
            });
            break;
            
        case 'validate':
            monitor.runValidation().then(() => {
                process.exit(0);
            });
            break;
            
        case 'help':
        default:
            console.log(`
🔍 Sistema de Monitoreo de Datos - Edificio Admin

Uso: node scripts/dataMonitor.js <acción> [parámetros]

Acciones disponibles:
  start [minutos]   - Iniciar monitoreo continuo (default: 5 min)
  validate         - Ejecutar validación única
  help             - Mostrar esta ayuda

Ejemplos:
  node scripts/dataMonitor.js start 10    # Monitoreo cada 10 minutos
  node scripts/dataMonitor.js validate    # Validación única
  
Logs guardados en: logs/data-monitor.log
            `);
            break;
    }
}

export default DataMonitor;