// dataValidation.js - Utilidades para validación y consistencia de datos

import { readData, writeData } from '../data.js';

/**
 * Validar estructura completa de datos
 */
export function validateDataStructure() {
  const data = readData();
  const errors = [];
  const warnings = [];

  // Validar usuarios
  const userValidation = validateUsers(data.usuarios || []);
  errors.push(...userValidation.errors);
  warnings.push(...userValidation.warnings);

  // Validar cuotas
  const cuotasValidation = validateCuotas(data.cuotas || []);
  errors.push(...cuotasValidation.errors);
  warnings.push(...cuotasValidation.warnings);

  // Validar gastos
  const gastosValidation = validateGastos(data.gastos || []);
  errors.push(...gastosValidation.errors);
  warnings.push(...gastosValidation.warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: {
      totalUsers: data.usuarios?.length || 0,
      totalCuotas: data.cuotas?.length || 0,
      totalGastos: data.gastos?.length || 0
    }
  };
}

/**
 * Validar usuarios
 */
export function validateUsers(usuarios) {
  const errors = [];
  const warnings = [];
  const emails = new Set();
  const departamentos = new Set();

  usuarios.forEach((usuario, index) => {
    const prefix = `Usuario ${index + 1} (ID: ${usuario.id})`;

    // Validaciones obligatorias
    if (!usuario.id) {
      errors.push(`${prefix}: Falta ID`);
    }
    if (!usuario.nombre || usuario.nombre.trim().length < 3) {
      errors.push(`${prefix}: Nombre inválido o muy corto`);
    }
    if (!usuario.email || !isValidEmail(usuario.email)) {
      errors.push(`${prefix}: Email inválido`);
    }
    if (!usuario.password) {
      errors.push(`${prefix}: Falta contraseña`);
    }
    if (!['ADMIN', 'COMITE', 'INQUILINO'].includes(usuario.rol)) {
      errors.push(`${prefix}: Rol inválido (${usuario.rol})`);
    }

    // Validar emails únicos
    if (usuario.email) {
      if (emails.has(usuario.email)) {
        errors.push(`${prefix}: Email duplicado (${usuario.email})`);
      } else {
        emails.add(usuario.email);
      }
    }

    // Validar departamentos únicos para inquilinos
    if (usuario.rol === 'INQUILINO' && usuario.departamento) {
      if (departamentos.has(usuario.departamento)) {
        errors.push(`${prefix}: Departamento duplicado para inquilino (${usuario.departamento})`);
      } else {
        departamentos.add(usuario.departamento);
      }
    }

    // Validar formato de departamento
    if (usuario.departamento && usuario.rol === 'INQUILINO') {
      const deptoRegex = /^[1-5]0[1-4]$/;
      if (!deptoRegex.test(usuario.departamento)) {
        errors.push(`${prefix}: Formato de departamento inválido (${usuario.departamento})`);
      }
    }

    // Validar permisos para usuarios COMITE
    if (usuario.rol === 'COMITE') {
      if (!usuario.permisos) {
        warnings.push(`${prefix}: Usuario COMITE sin permisos definidos`);
      } else {
        const validPermissions = ['anuncios', 'gastos', 'presupuestos', 'cuotas', 'usuarios', 'cierres'];
        const hasAnyPermission = validPermissions.some(perm => usuario.permisos[perm] === true);
                
        if (!hasAnyPermission) {
          warnings.push(`${prefix}: Usuario COMITE sin permisos activos`);
        }
      }
    }

    // Validar campo activo
    if (typeof usuario.activo !== 'boolean') {
      warnings.push(`${prefix}: Campo 'activo' no es booleano`);
    }

    // Validar fecha de creación
    if (usuario.fechaCreacion && !isValidDate(usuario.fechaCreacion)) {
      warnings.push(`${prefix}: Fecha de creación inválida`);
    }
  });

  return { errors, warnings };
}

/**
 * Validar cuotas
 */
export function validateCuotas(cuotas) {
  const errors = [];
  const warnings = [];
  const cuotasUnicas = new Set();

  cuotas.forEach((cuota, index) => {
    const prefix = `Cuota ${index + 1} (ID: ${cuota.id})`;

    // Validaciones obligatorias
    if (!cuota.id) {
      errors.push(`${prefix}: Falta ID`);
    }
    if (!cuota.mes) {
      errors.push(`${prefix}: Falta mes`);
    }
    if (!cuota.anio || cuota.anio < 2025 || cuota.anio > 2030) {
      errors.push(`${prefix}: Año inválido (${cuota.anio})`);
    }
    if (!cuota.monto || cuota.monto <= 0) {
      errors.push(`${prefix}: Monto inválido (${cuota.monto})`);
    }
    if (!cuota.departamento) {
      errors.push(`${prefix}: Falta departamento`);
    }
    if (!['PENDIENTE', 'PAGADO', 'VENCIDO'].includes(cuota.estado)) {
      errors.push(`${prefix}: Estado inválido (${cuota.estado})`);
    }

    // Validar unicidad de cuota por departamento/mes/año
    const cuotaKey = `${cuota.departamento}-${cuota.mes}-${cuota.anio}`;
    if (cuotasUnicas.has(cuotaKey)) {
      errors.push(`${prefix}: Cuota duplicada para ${cuota.departamento} en ${cuota.mes} ${cuota.anio}`);
    } else {
      cuotasUnicas.add(cuotaKey);
    }

    // Validar fecha de vencimiento
    if (cuota.fechaVencimiento && !isValidDate(cuota.fechaVencimiento)) {
      warnings.push(`${prefix}: Fecha de vencimiento inválida`);
    }

    // Validar fecha de pago si está pagado
    if (cuota.estado === 'PAGADO' && !cuota.fechaPago) {
      warnings.push(`${prefix}: Cuota marcada como pagada pero sin fecha de pago`);
    }
  });

  return { errors, warnings };
}

/**
 * Validar gastos
 */
export function validateGastos(gastos) {
  const errors = [];
  const warnings = [];

  gastos.forEach((gasto, index) => {
    const prefix = `Gasto ${index + 1} (ID: ${gasto.id})`;

    // Validaciones obligatorias
    if (!gasto.id) {
      errors.push(`${prefix}: Falta ID`);
    }
    if (!gasto.concepto || gasto.concepto.trim().length < 3) {
      errors.push(`${prefix}: Concepto inválido o muy corto`);
    }
    if (!gasto.categoria) {
      errors.push(`${prefix}: Falta categoría`);
    }
    if (!gasto.monto || gasto.monto <= 0) {
      errors.push(`${prefix}: Monto inválido (${gasto.monto})`);
    }
    if (!gasto.fecha || !isValidDate(gasto.fecha)) {
      errors.push(`${prefix}: Fecha inválida`);
    }

    // Validar categorías válidas
    const validCategories = ['Mantenimiento', 'Reparación', 'Limpieza', 'Servicios', 'Administrativo', 'Proyecto', 'Otro'];
    if (gasto.categoria && !validCategories.includes(gasto.categoria)) {
      warnings.push(`${prefix}: Categoría no estándar (${gasto.categoria})`);
    }

    // Validar proveedor
    if (!gasto.proveedor || gasto.proveedor.trim().length < 2) {
      warnings.push(`${prefix}: Proveedor faltante o muy corto`);
    }
  });

  return { errors, warnings };
}

/**
 * Limpiar datos inconsistentes
 */
export function cleanInconsistentData() {
  const data = readData();
  let changes = [];

  // Limpiar usuarios
  if (data.usuarios) {
    data.usuarios.forEach(usuario => {
      // Asegurar que activo sea booleano
      if (typeof usuario.activo !== 'boolean') {
        usuario.activo = true;
        changes.push(`Usuario ${usuario.id}: Campo 'activo' convertido a booleano`);
      }

      // Limpiar permisos para usuarios no COMITE
      if (usuario.rol !== 'COMITE' && usuario.permisos) {
        delete usuario.permisos;
        changes.push(`Usuario ${usuario.id}: Permisos eliminados (rol: ${usuario.rol})`);
      }

      // Asegurar permisos para usuarios COMITE
      if (usuario.rol === 'COMITE' && !usuario.permisos) {
        usuario.permisos = {
          anuncios: false,
          gastos: false,
          presupuestos: false,
          cuotas: false,
          usuarios: false,
          cierres: false
        };
        changes.push(`Usuario ${usuario.id}: Permisos inicializados para COMITE`);
      }

      // Normalizar departamento para admin
      if (usuario.rol === 'ADMIN' && usuario.departamento !== 'ADMIN') {
        usuario.departamento = 'ADMIN';
        changes.push(`Usuario ${usuario.id}: Departamento normalizado para ADMIN`);
      }
    });
  }

  // Limpiar cuotas
  if (data.cuotas) {
    data.cuotas.forEach(cuota => {
      // Normalizar estado
      if (cuota.estado && !['PENDIENTE', 'PAGADO', 'VENCIDO'].includes(cuota.estado)) {
        cuota.estado = 'PENDIENTE';
        changes.push(`Cuota ${cuota.id}: Estado normalizado a PENDIENTE`);
      }

      // Limpiar fecha de pago si no está pagado
      if (cuota.estado !== 'PAGADO' && cuota.fechaPago) {
        delete cuota.fechaPago;
        changes.push(`Cuota ${cuota.id}: Fecha de pago eliminada (estado: ${cuota.estado})`);
      }
    });
  }

  // Guardar cambios si los hay
  if (changes.length > 0) {
    writeData(data);
    console.log('Datos limpiados:', changes);
  }

  return {
    changesMade: changes.length > 0,
    changes,
    totalChanges: changes.length
  };
}

/**
 * Migrar datos al nuevo formato si es necesario
 */
export function migrateDataFormat() {
  const data = readData();
  let migrations = [];

  // Migración: Asegurar que todos los usuarios tengan fechaCreacion
  if (data.usuarios) {
    data.usuarios.forEach(usuario => {
      if (!usuario.fechaCreacion) {
        usuario.fechaCreacion = new Date().toISOString();
        migrations.push(`Usuario ${usuario.id}: Fecha de creación añadida`);
      }
    });
  }

  // Migración: Asegurar nextId existe
  if (!data.nextId) {
    data.nextId = {
      usuarios: Math.max(...(data.usuarios?.map(u => u.id) || [0])) + 1,
      cuotas: Math.max(...(data.cuotas?.map(c => c.id) || [0])) + 1,
      gastos: Math.max(...(data.gastos?.map(g => g.id) || [0])) + 1,
      presupuestos: Math.max(...(data.presupuestos?.map(p => p.id) || [0])) + 1,
      anuncios: Math.max(...(data.anuncios?.map(a => a.id) || [0])) + 1,
      cierres: Math.max(...(data.cierres?.map(c => c.id) || [0])) + 1
    };
    migrations.push('Sistema nextId inicializado');
  }

  // Guardar migraciones si las hay
  if (migrations.length > 0) {
    writeData(data);
    console.log('Migraciones aplicadas:', migrations);
  }

  return {
    migrationsMade: migrations.length > 0,
    migrations,
    totalMigrations: migrations.length
  };
}

/**
 * Crear backup de datos antes de cambios críticos
 */
export async function createDataBackup(reason = 'manual') {
  const data = readData();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilename = `data-backup-${timestamp}-${reason}.json`;
    
  try {
    const fs = await import('fs');
    const path = await import('path');
        
    const backupPath = path.join(process.cwd(), 'backups', backupFilename);
        
    // Crear directorio de backups si no existe
    const backupsDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }
        
    fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
        
    return {
      success: true,
      backupPath,
      filename: backupFilename,
      size: fs.statSync(backupPath).size
    };
  } catch (error) {
    console.error('Error creating backup:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Utilidades de validación
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Generar reporte de salud de datos
 */
export function generateDataHealthReport() {
  const validation = validateDataStructure();
  const data = readData();
    
  // Estadísticas adicionales
  const stats = {
    usuarios: {
      total: data.usuarios?.length || 0,
      admins: data.usuarios?.filter(u => u.rol === 'ADMIN').length || 0,
      comite: data.usuarios?.filter(u => u.rol === 'COMITE').length || 0,
      inquilinos: data.usuarios?.filter(u => u.rol === 'INQUILINO').length || 0,
      activos: data.usuarios?.filter(u => u.activo).length || 0
    },
    cuotas: {
      total: data.cuotas?.length || 0,
      pendientes: data.cuotas?.filter(c => c.estado === 'PENDIENTE').length || 0,
      pagadas: data.cuotas?.filter(c => c.estado === 'PAGADO').length || 0,
      vencidas: data.cuotas?.filter(c => c.estado === 'VENCIDO').length || 0
    },
    gastos: {
      total: data.gastos?.length || 0,
      totalMonto: data.gastos?.reduce((sum, g) => sum + (g.monto || 0), 0) || 0
    }
  };
    
  return {
    timestamp: new Date().toISOString(),
    validation,
    statistics: stats,
    recommendations: generateRecommendations(validation, stats)
  };
}

/**
 * Generar recomendaciones basadas en el análisis
 */
function generateRecommendations(validation, stats) {
  const recommendations = [];
    
  if (validation.errors.length > 0) {
    recommendations.push({
      type: 'critical',
      message: `Se encontraron ${validation.errors.length} errores críticos que deben corregirse`,
      action: 'Ejecutar cleanInconsistentData()'
    });
  }
    
  if (validation.warnings.length > 0) {
    recommendations.push({
      type: 'warning',
      message: `Se encontraron ${validation.warnings.length} advertencias`,
      action: 'Revisar y corregir manualmente si es necesario'
    });
  }
    
  if (stats.usuarios.comite > 0) {
    const comiteSinPermisos = validation.warnings.filter(w => w.includes('sin permisos')).length;
    if (comiteSinPermisos > 0) {
      recommendations.push({
        type: 'info',
        message: `${comiteSinPermisos} usuarios COMITE sin permisos activos`,
        action: 'Revisar y asignar permisos apropiados'
      });
    }
  }
    
  if (stats.cuotas.vencidas > 0) {
    recommendations.push({
      type: 'info',
      message: `${stats.cuotas.vencidas} cuotas vencidas`,
      action: 'Revisar estado de pagos'
    });
  }
    
  return recommendations;
}

export default {
  validateDataStructure,
  validateUsers,
  validateCuotas,
  validateGastos,
  cleanInconsistentData,
  migrateDataFormat,
  createDataBackup,
  generateDataHealthReport
};