#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_FILE = path.join(process.cwd(), 'data.json');

// Usuarios de demostración
const demoUsers = [
    {
        id: 1,
        nombre: "Administrador Principal",
        email: "admin@edificio205.com",
        password: "Admin2025!",
        departamento: "ADMIN",
        rol: "ADMIN",
        telefono: "+52 55 1234 5678",
        fechaCreacion: new Date().toISOString(),
        activo: true
    },
    {
        id: 2,
        nombre: "Comité de Administración",
        email: "comite@edificio205.com", 
        password: "Comite2025!",
        departamento: "COMITE",
        rol: "COMITE",
        telefono: "+52 55 2345 6789",
        permisos: {
            anuncios: true,
            gastos: true,
            presupuestos: true,
            cuotas: true,
            usuarios: false,
            cierres: false
        },
        fechaCreacion: new Date().toISOString(),
        activo: true
    },
    {
        id: 3,
        nombre: "María García",
        email: "maria.garcia@edificio205.com",
        password: "Inquilino2025!",
        departamento: "101",
        rol: "INQUILINO",
        telefono: "+52 55 3456 7890",
        legitimidad_entregada: true,
        estatus_validacion: "validado",
        fechaCreacion: new Date().toISOString(),
        activo: true
    },
    {
        id: 4,
        nombre: "Carlos López",
        email: "carlos.lopez@edificio205.com",
        password: "Inquilino2025!",
        departamento: "102", 
        rol: "INQUILINO",
        telefono: "+52 55 4567 8901",
        legitimidad_entregada: false,
        estatus_validacion: "pendiente",
        fechaCreacion: new Date().toISOString(),
        activo: true
    },
    {
        id: 5,
        nombre: "Ana Martínez",
        email: "ana.martinez@edificio205.com",
        password: "Inquilino2025!", 
        departamento: "201",
        rol: "INQUILINO",
        telefono: "+52 55 5678 9012",
        legitimidad_entregada: true,
        estatus_validacion: "validado",
        fechaCreacion: new Date().toISOString(),
        activo: true
    },
    {
        id: 6,
        nombre: "Roberto Silva",
        email: "roberto.silva@edificio205.com",
        password: "Inquilino2025!",
        departamento: "202",
        rol: "INQUILINO", 
        telefono: "+52 55 6789 0123",
        legitimidad_entregada: false,
        estatus_validacion: "pendiente",
        fechaCreacion: new Date().toISOString(),
        activo: true
    }
];

async function resetUsers() {
    try {
        console.log('🔄 Iniciando reset de usuarios...');
        
        // Leer datos actuales
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        
        // Crear backup antes del reset
        const backupFile = `data-backup-reset-${Date.now()}.json`;
        fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
        console.log(`✅ Backup creado: ${backupFile}`);
        
        // Hash de contraseñas
        console.log('🔐 Generando hashes de contraseñas...');
        for (const user of demoUsers) {
            const originalPassword = user.password;
            user.password = await bcrypt.hash(originalPassword, 10);
            console.log(`   ${user.nombre}: ${originalPassword} -> ${user.password.substring(0, 20)}...`);
        }
        
        // Reemplazar usuarios
        data.usuarios = demoUsers;
        
        // Guardar datos actualizados
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        
        console.log('\n✅ Reset de usuarios completado!');
        console.log('\n👥 Usuarios creados:');
        demoUsers.forEach(user => {
            console.log(`   ${user.rol.padEnd(10)} | ${user.email.padEnd(35)} | Depto: ${user.departamento}`);
        });
        
        console.log('\n🔑 Credenciales para acceso:');
        console.log('   ADMIN:     admin@edificio205.com / Admin2025!');
        console.log('   COMITÉ:    comite@edificio205.com / Comite2025!'); 
        console.log('   INQUILINO: maria.garcia@edificio205.com / Inquilino2025!');
        console.log('   INQUILINO: carlos.lopez@edificio205.com / Inquilino2025!');
        console.log('   INQUILINO: ana.martinez@edificio205.com / Inquilino2025!');
        console.log('   INQUILINO: roberto.silva@edificio205.com / Inquilino2025!');
        
    } catch (error) {
        console.error('❌ Error durante el reset:', error.message);
        process.exit(1);
    }
}

resetUsers();