import { handleControllerError } from '../middleware/error-handler.js';
import {
  validateDataStructure,
  cleanInconsistentData,
  migrateDataFormat,
  createDataBackup,
  generateDataHealthReport
} from '../utils/dataValidation.js';

// GET /api/validation/health - Obtener reporte de salud de datos
export const obtenerReporteSalud = async (req, res) => {
  try {
    const report = generateDataHealthReport();
        
    res.json({
      ok: true,
      report
    });
  } catch (error) {
    return handleControllerError(error, res, 'obtenerReporteSalud');
  }
};

// GET /api/validation/validate - Validar estructura de datos
export const validarEstructura = async (req, res) => {
  try {
    const validation = validateDataStructure();
        
    res.json({
      ok: true,
      validation
    });
  } catch (error) {
    return handleControllerError(error, res, 'validarEstructura');
  }
};

// POST /api/validation/clean - Limpiar datos inconsistentes
export const limpiarDatos = async (req, res) => {
  try {
    // Crear backup antes de limpiar
    const backup = await createDataBackup('before-clean');
        
    if (!backup.success) {
      return res.status(500).json({
        ok: false,
        msg: 'Error al crear backup antes de limpiar datos',
        error: backup.error
      });
    }
        
    const cleanResult = cleanInconsistentData();
        
    res.json({
      ok: true,
      msg: cleanResult.changesMade ? 'Datos limpiados exitosamente' : 'No se encontraron inconsistencias',
      backup: backup.filename,
      changes: cleanResult.changes,
      totalChanges: cleanResult.totalChanges
    });
  } catch (error) {
    return handleControllerError(error, res, 'limpiarDatos');
  }
};

// POST /api/validation/migrate - Migrar datos al nuevo formato
export const migrarDatos = async (req, res) => {
  try {
    // Crear backup antes de migrar
    const backup = await createDataBackup('before-migrate');
        
    if (!backup.success) {
      return res.status(500).json({
        ok: false,
        msg: 'Error al crear backup antes de migrar datos',
        error: backup.error
      });
    }
        
    const migrateResult = migrateDataFormat();
        
    res.json({
      ok: true,
      msg: migrateResult.migrationsMade ? 'Migraciones aplicadas exitosamente' : 'No se requieren migraciones',
      backup: backup.filename,
      migrations: migrateResult.migrations,
      totalMigrations: migrateResult.totalMigrations
    });
  } catch (error) {
    return handleControllerError(error, res, 'migrarDatos');
  }
};

// POST /api/validation/backup - Crear backup manual
export const crearBackup = async (req, res) => {
  try {
    const { reason = 'manual' } = req.body;
    const backup = await createDataBackup(reason);
        
    if (backup.success) {
      res.json({
        ok: true,
        msg: 'Backup creado exitosamente',
        backup: {
          filename: backup.filename,
          path: backup.backupPath,
          size: backup.size
        }
      });
    } else {
      res.status(500).json({
        ok: false,
        msg: 'Error al crear backup',
        error: backup.error
      });
    }
  } catch (error) {
    return handleControllerError(error, res, 'crearBackup');
  }
};
