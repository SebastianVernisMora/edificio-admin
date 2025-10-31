#!/usr/bin/env node
// migrateUsers.js - Script para migrar usuarios al nuevo formato

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, '../data.json');

/**
 * Migrar usuarios al formato estándar
 */
async function migrateUsers() {
    console.log('🔄 Iniciando migración de usuarios...');
    
    try {
        // Leer datos actuales
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        let changesMade = false;
        const changes = [];

        // Crear backup antes de migrar
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(__dirname, '../backups', `data-backup-before-migration-${timestamp}.json`);
        
        // Crear directorio de backups si no existe
        const backupsDir = path.join(__dirname, '../backups');
        if (!fs.existsSync(backupsDir)) {
            fs.mkdirSync(backupsDir, { recursive: true });
        }
        
        fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
        console.log(`📁 Backup creado: ${backupPath}`);

        // Migrar usuarios
        if (data.usuarios) {
            data.usuarios.forEach((usuario, index) => {
                let userChanged = false;

                // 1. Normalizar IDs a números secuenciales
                if (typeof usuario.id !== 'number' || usuario.id > 1000000) {
                    const newId = index + 1;
                    changes.push(`Usuario ${usuario.nombre}: ID ${usuario.id} → ${newId}`);
                    usuario.id = newId;
                    userChanged = true;
                }

                // 2. Asegurar campo activo existe
                if (typeof usuario.activo !== 'boolean') {
                    usuario.activo = true;
                    changes.push(`Usuario ${usuario.nombre}: Campo 'activo' añadido`);
                    userChanged = true;
                }

                // 3. Normalizar departamentos para roles especiales
                if (usuario.rol === 'ADMIN' && usuario.departamento !== 'ADMIN') {
                    changes.push(`Usuario ${usuario.nombre}: Departamento ${usuario.departamento} → ADMIN`);
                    usuario.departamento = 'ADMIN';
                    userChanged = true;
                }

                if (usuario.rol === 'COMITE' && usuario.departamento !== 'COMITE') {
                    changes.push(`Usuario ${usuario.nombre}: Departamento ${usuario.departamento} → COMITE`);
                    usuario.departamento = 'COMITE';
                    userChanged = true;
                }

                // 4. Asegurar permisos para usuarios COMITE
                if (usuario.rol === 'COMITE' && !usuario.permisos) {
                    usuario.permisos = {
                        anuncios: false,
                        gastos: false,
                        presupuestos: false,
                        cuotas: false,
                        usuarios: false,
                        cierres: false
                    };
                    changes.push(`Usuario ${usuario.nombre}: Permisos inicializados para COMITE`);
                    userChanged = true;
                }

                // 5. Limpiar permisos para usuarios no COMITE
                if (usuario.rol !== 'COMITE' && usuario.permisos) {
                    delete usuario.permisos;
                    changes.push(`Usuario ${usuario.nombre}: Permisos eliminados (rol: ${usuario.rol})`);
                    userChanged = true;
                }

                // 6. Asegurar fechaCreacion existe
                if (!usuario.fechaCreacion) {
                    usuario.fechaCreacion = new Date().toISOString();
                    changes.push(`Usuario ${usuario.nombre}: Fecha de creación añadida`);
                    userChanged = true;
                }

                if (userChanged) {
                    changesMade = true;
                }
            });
        }

        // Asegurar nextId existe y es correcto
        if (!data.nextId) {
            data.nextId = {
                usuarios: Math.max(...(data.usuarios?.map(u => u.id) || [0])) + 1,
                cuotas: Math.max(...(data.cuotas?.map(c => c.id) || [0])) + 1,
                gastos: Math.max(...(data.gastos?.map(g => g.id) || [0])) + 1,
                presupuestos: Math.max(...(data.presupuestos?.map(p => p.id) || [0])) + 1,
                anuncios: Math.max(...(data.anuncios?.map(a => a.id) || [0])) + 1,
                cierres: Math.max(...(data.cierres?.map(c => c.id) || [0])) + 1
            };
            changes.push('Sistema nextId inicializado');
            changesMade = true;
        }

        // Guardar cambios si los hay
        if (changesMade) {
            fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
            console.log('✅ Migración completada exitosamente');
            console.log(`📊 Total de cambios: ${changes.length}`);
            changes.forEach(change => console.log(`   - ${change}`));
        } else {
            console.log('✅ No se requieren migraciones');
        }

        return {
            success: true,
            changesMade,
            changes,
            backupPath
        };

    } catch (error) {
        console.error('❌ Error en migración:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    migrateUsers().then(result => {
        if (result.success) {
            console.log('🎉 Migración completada');
            process.exit(0);
        } else {
            console.error('💥 Migración falló:', result.error);
            process.exit(1);
        }
    });
}

export default migrateUsers;