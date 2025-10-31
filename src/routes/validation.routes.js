// validation.routes.js - Rutas para validación y mantenimiento de datos

import express from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import {
  validateDataStructure,
  cleanInconsistentData,
  migrateDataFormat,
  createDataBackup,
  generateDataHealthReport
} from '../utils/dataValidation.js';

const router = express.Router();

// Todas las rutas requieren autenticación y rol de administrador
router.use(verifyToken);
router.use(isAdmin);

// GET /api/validation/health - Obtener reporte de salud de datos
router.get('/health', async (req, res) => {
  try {
    const report = generateDataHealthReport();
        
    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Error generating health report:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte de salud',
      error: error.message
    });
  }
});

// GET /api/validation/validate - Validar estructura de datos
router.get('/validate', async (req, res) => {
  try {
    const validation = validateDataStructure();
        
    res.json({
      success: true,
      validation
    });
  } catch (error) {
    console.error('Error validating data structure:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar estructura de datos',
      error: error.message
    });
  }
});

// POST /api/validation/clean - Limpiar datos inconsistentes
router.post('/clean', async (req, res) => {
  try {
    // Crear backup antes de limpiar
    const backup = await createDataBackup('before-clean');
        
    if (!backup.success) {
      return res.status(500).json({
        success: false,
        message: 'Error al crear backup antes de limpiar datos',
        error: backup.error
      });
    }
        
    const cleanResult = cleanInconsistentData();
        
    res.json({
      success: true,
      message: cleanResult.changesMade ? 'Datos limpiados exitosamente' : 'No se encontraron inconsistencias',
      backup: backup.filename,
      changes: cleanResult.changes,
      totalChanges: cleanResult.totalChanges
    });
  } catch (error) {
    console.error('Error cleaning data:', error);
    res.status(500).json({
      success: false,
      message: 'Error al limpiar datos',
      error: error.message
    });
  }
});

// POST /api/validation/migrate - Migrar datos al nuevo formato
router.post('/migrate', async (req, res) => {
  try {
    // Crear backup antes de migrar
    const backup = await createDataBackup('before-migrate');
        
    if (!backup.success) {
      return res.status(500).json({
        success: false,
        message: 'Error al crear backup antes de migrar datos',
        error: backup.error
      });
    }
        
    const migrateResult = migrateDataFormat();
        
    res.json({
      success: true,
      message: migrateResult.migrationsMade ? 'Migraciones aplicadas exitosamente' : 'No se requieren migraciones',
      backup: backup.filename,
      migrations: migrateResult.migrations,
      totalMigrations: migrateResult.totalMigrations
    });
  } catch (error) {
    console.error('Error migrating data:', error);
    res.status(500).json({
      success: false,
      message: 'Error al migrar datos',
      error: error.message
    });
  }
});

// POST /api/validation/backup - Crear backup manual
router.post('/backup', async (req, res) => {
  try {
    const { reason = 'manual' } = req.body;
    const backup = await createDataBackup(reason);
        
    if (backup.success) {
      res.json({
        success: true,
        message: 'Backup creado exitosamente',
        backup: {
          filename: backup.filename,
          path: backup.backupPath,
          size: backup.size
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al crear backup',
        error: backup.error
      });
    }
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear backup',
      error: error.message
    });
  }
});

export default router;