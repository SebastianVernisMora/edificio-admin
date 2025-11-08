#!/usr/bin/env node
// backupData.js - Sistema de backup automático

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, '../data.json');
const backupsDir = path.join(__dirname, '../backups');

/**
 * Crear backup automático con rotación
 */
export async function createAutoBackup(reason = 'auto') {
    try {
        // Crear directorio de backups si no existe
        if (!fs.existsSync(backupsDir)) {
            fs.mkdirSync(backupsDir, { recursive: true });
        }

        // Leer datos actuales
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        
        // Generar nombre de archivo con timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFilename = `data-backup-${timestamp}-${reason}.json`;
        const backupPath = path.join(backupsDir, backupFilename);
        
        // Crear backup
        fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
        
        // Obtener información del archivo
        const stats = fs.statSync(backupPath);
        
        console.log(`✅ Backup creado: ${backupFilename}`);
        console.log(`📊 Tamaño: ${(stats.size / 1024).toFixed(2)} KB`);
        
        // Limpiar backups antiguos (mantener solo los últimos 10)
        await cleanOldBackups();
        
        return {
            success: true,
            filename: backupFilename,
            path: backupPath,
            size: stats.size,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('❌ Error creando backup:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Limpiar backups antiguos (mantener solo los últimos 10)
 */
async function cleanOldBackups() {
    try {
        const files = fs.readdirSync(backupsDir)
            .filter(file => file.startsWith('data-backup-') && file.endsWith('.json'))
            .map(file => ({
                name: file,
                path: path.join(backupsDir, file),
                mtime: fs.statSync(path.join(backupsDir, file)).mtime
            }))
            .sort((a, b) => b.mtime - a.mtime); // Más recientes primero

        // Eliminar archivos antiguos (mantener solo los últimos 10)
        if (files.length > 10) {
            const filesToDelete = files.slice(10);
            filesToDelete.forEach(file => {
                fs.unlinkSync(file.path);
                console.log(`🗑️ Backup antiguo eliminado: ${file.name}`);
            });
        }
        
    } catch (error) {
        console.error('⚠️ Error limpiando backups antiguos:', error);
    }
}

/**
 * Restaurar desde backup
 */
export async function restoreFromBackup(backupFilename) {
    try {
        const backupPath = path.join(backupsDir, backupFilename);
        
        if (!fs.existsSync(backupPath)) {
            throw new Error(`Backup no encontrado: ${backupFilename}`);
        }
        
        // Crear backup del estado actual antes de restaurar
        await createAutoBackup('before-restore');
        
        // Leer backup
        const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
        
        // Restaurar datos
        fs.writeFileSync(dataPath, JSON.stringify(backupData, null, 2));
        
        console.log(`✅ Datos restaurados desde: ${backupFilename}`);
        
        return {
            success: true,
            restoredFrom: backupFilename,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('❌ Error restaurando backup:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Listar backups disponibles
 */
export function listBackups() {
    try {
        if (!fs.existsSync(backupsDir)) {
            return { success: true, backups: [] };
        }
        
        const backups = fs.readdirSync(backupsDir)
            .filter(file => file.startsWith('data-backup-') && file.endsWith('.json'))
            .map(file => {
                const filePath = path.join(backupsDir, file);
                const stats = fs.statSync(filePath);
                return {
                    filename: file,
                    size: stats.size,
                    created: stats.mtime,
                    sizeKB: (stats.size / 1024).toFixed(2)
                };
            })
            .sort((a, b) => b.created - a.created); // Más recientes primero
        
        return {
            success: true,
            backups,
            total: backups.length
        };
        
    } catch (error) {
        console.error('❌ Error listando backups:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    const action = process.argv[2];
    const param = process.argv[3];
    
    switch (action) {
        case 'create':
            createAutoBackup(param || 'manual').then(result => {
                console.log(result.success ? '✅ Backup creado' : '❌ Error:', result);
            });
            break;
            
        case 'restore':
            if (!param) {
                console.error('❌ Especifique el nombre del backup a restaurar');
                process.exit(1);
            }
            restoreFromBackup(param).then(result => {
                console.log(result.success ? '✅ Restauración completa' : '❌ Error:', result);
            });
            break;
            
        case 'list':
            const list = listBackups();
            if (list.success) {
                console.log(`📁 Backups disponibles (${list.total}):`);
                list.backups.forEach(backup => {
                    console.log(`   - ${backup.filename} (${backup.sizeKB} KB) - ${backup.created.toLocaleString()}`);
                });
            } else {
                console.error('❌ Error:', list.error);
            }
            break;
            
        default:
            console.log(`
🔧 Sistema de Backup - Edificio Admin

Uso: node scripts/backupData.js <acción> [parámetro]

Acciones disponibles:
  create [razón]     - Crear nuevo backup
  restore <archivo>  - Restaurar desde backup
  list              - Listar backups disponibles

Ejemplos:
  node scripts/backupData.js create manual
  node scripts/backupData.js restore data-backup-2025-10-30-manual.json
  node scripts/backupData.js list
            `);
    }
}

export default { createAutoBackup, restoreFromBackup, listBackups };