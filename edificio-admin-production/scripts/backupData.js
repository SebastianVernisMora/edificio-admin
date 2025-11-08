// Script de Backup de Datos - Edificio Admin
// Este script maneja la funcionalidad de backup de datos de la aplicación

const fs = require('fs').promises;
const path = require('path');

class BackupManager {
    constructor() {
        this.dataFile = path.join(process.cwd(), 'data.json');
        this.backupDir = path.join(process.cwd(), 'backups');
    }

    async createBackup() {
        try {
            // Crear directorio de backups si no existe
            try {
                await fs.access(this.backupDir);
            } catch {
                await fs.mkdir(this.backupDir, { recursive: true });
            }

            // Leer datos actuales
            const data = await fs.readFile(this.dataFile, 'utf8');
            
            // Crear nombre de backup con timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFileName = `data-backup-${timestamp}.json`;
            const backupPath = path.join(this.backupDir, backupFileName);

            // Guardar backup
            await fs.writeFile(backupPath, data, 'utf8');

            console.log(`✅ Backup creado: ${backupFileName}`);
            return backupPath;

        } catch (error) {
            console.error('❌ Error al crear backup:', error);
            throw error;
        }
    }

    async listBackups() {
        try {
            const files = await fs.readdir(this.backupDir);
            const backupFiles = files.filter(file => file.startsWith('data-backup-') && file.endsWith('.json'));
            
            console.log(`📋 Backups disponibles: ${backupFiles.length}`);
            backupFiles.forEach(file => console.log(`  - ${file}`));
            
            return backupFiles;
        } catch (error) {
            console.error('❌ Error al listar backups:', error);
            return [];
        }
    }

    async cleanupOldBackups(keepCount = 10) {
        try {
            const backupFiles = await this.listBackups();
            
            if (backupFiles.length <= keepCount) {
                console.log('ℹ️  No hay backups antiguos para limpiar');
                return;
            }

            // Ordenar por fecha (más recientes primero)
            const sortedBackups = backupFiles
                .map(file => ({
                    name: file,
                    path: path.join(this.backupDir, file)
                }))
                .sort((a, b) => b.name.localeCompare(a.name));

            // Eliminar backups antiguos
            const toDelete = sortedBackups.slice(keepCount);
            
            for (const backup of toDelete) {
                await fs.unlink(backup.path);
                console.log(`🗑️  Eliminado: ${backup.name}`);
            }

            console.log(`✅ Limpieza completada. Mantenidos ${keepCount} backups más recientes.`);

        } catch (error) {
            console.error('❌ Error en limpieza de backups:', error);
        }
    }
}

// Funciones de utilidad para uso externo
async function createDataBackup() {
    const backupManager = new BackupManager();
    return await backupManager.createBackup();
}

async function cleanupBackups(keepCount = 10) {
    const backupManager = new BackupManager();
    return await backupManager.cleanupOldBackups(keepCount);
}

// Exportar para uso en otros módulos
module.exports = {
    BackupManager,
    createDataBackup,
    cleanupBackups
};

// Si se ejecuta directamente, realizar backup
if (require.main === module) {
    (async () => {
        try {
            console.log('🚀 Iniciando backup de datos...');
            const backupPath = await createDataBackup();
            console.log(`✅ Backup completado: ${path.basename(backupPath)}`);
            
            // Limpiar backups antiguos
            await cleanupBackups(10);
            
        } catch (error) {
            console.error('❌ Error en el proceso de backup:', error);
            process.exit(1);
        }
    })();
}