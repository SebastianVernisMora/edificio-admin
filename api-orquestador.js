/**
 * API REST para el Orquestador
 * Proporciona endpoints para controlar y monitorear el workflow de agentes
 */

import express from 'express';
import Orquestador from './Orquestador.js';

const router = express.Router();

// Instancia única del orquestador
let orquestador = new Orquestador();

/**
 * GET /api/orquestador/estado
 * Obtiene el estado actual del workflow y todos los agentes
 */
router.get('/estado', (req, res) => {
  try {
    const estado = orquestador.obtenerEstadoWorkflow();
    res.json({
      exito: true,
      data: estado
    });
  } catch (error) {
    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener estado del workflow',
      error: error.message
    });
  }
});

/**
 * POST /api/orquestador/iniciar
 * Inicia el workflow de los 3 agentes
 */
router.post('/iniciar', (req, res) => {
  try {
    const resultado = orquestador.iniciarWorkflow();
    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      exito: false,
      mensaje: 'Error al iniciar workflow',
      error: error.message
    });
  }
});

/**
 * POST /api/orquestador/detener
 * Detiene el workflow de emergencia
 */
router.post('/detener', (req, res) => {
  try {
    const { razon } = req.body;
    const reporte = orquestador.detenerWorkflow(razon || 'Detenido manualmente');
    res.json({
      exito: true,
      mensaje: 'Workflow detenido',
      reporte
    });
  } catch (error) {
    res.status(500).json({
      exito: false,
      mensaje: 'Error al detener workflow',
      error: error.message
    });
  }
});

/**
 * POST /api/orquestador/reiniciar
 * Reinicia el workflow desde cero
 */
router.post('/reiniciar', (req, res) => {
  try {
    orquestador = new Orquestador();
    const resultado = orquestador.iniciarWorkflow();
    res.json({
      exito: true,
      mensaje: 'Workflow reiniciado',
      data: resultado
    });
  } catch (error) {
    res.status(500).json({
      exito: false,
      mensaje: 'Error al reiniciar workflow',
      error: error.message
    });
  }
});

/**
 * PUT /api/orquestador/agente/:agenteId
 * Actualiza el estado de un agente específico
 */
router.put('/agente/:agenteId', (req, res) => {
  try {
    const { agenteId } = req.params;
    const { estado, progreso, error } = req.body;

    const resultado = orquestador.actualizarEstadoAgente(
      agenteId,
      estado,
      progreso,
      error
    );

    if (resultado) {
      res.json({
        exito: true,
        mensaje: `Agente ${agenteId} actualizado`,
        estado: orquestador.obtenerEstadoWorkflow()
      });
    } else {
      res.status(404).json({
        exito: false,
        mensaje: `Agente ${agenteId} no encontrado`
      });
    }
  } catch (error) {
    res.status(500).json({
      exito: false,
      mensaje: 'Error al actualizar agente',
      error: error.message
    });
  }
});

/**
 * GET /api/orquestador/agentes
 * Obtiene el estado de todos los agentes
 */
router.get('/agentes', (req, res) => {
  try {
    const agentes = orquestador.obtenerEstadoAgentes();
    res.json({
      exito: true,
      data: agentes
    });
  } catch (error) {
    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener agentes',
      error: error.message
    });
  }
});

/**
 * GET /api/orquestador/log
 * Obtiene el log de eventos del orquestador
 */
router.get('/log', (req, res) => {
  try {
    const { limite = 50 } = req.query;
    const estado = orquestador.obtenerEstadoWorkflow();
    const log = estado.log.slice(-parseInt(limite));
    
    res.json({
      exito: true,
      data: log
    });
  } catch (error) {
    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener log',
      error: error.message
    });
  }
});

/**
 * GET /api/orquestador/reporte
 * Genera y obtiene un reporte del workflow
 */
router.get('/reporte', (req, res) => {
  try {
    const reporte = orquestador.generarReporte();
    res.json({
      exito: true,
      data: reporte
    });
  } catch (error) {
    res.status(500).json({
      exito: false,
      mensaje: 'Error al generar reporte',
      error: error.message
    });
  }
});

export default router;
