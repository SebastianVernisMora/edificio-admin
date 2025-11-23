import Parcialidad from '../models/Parcialidad.js';
import Fondo from '../models/Fondo.js';
import { handleControllerError } from '../middleware/error-handler.js';

export const getConfig = async (req, res) => {
  try {
    const config = await Parcialidad.getConfig();
    
    res.json({
      ok: true,
      config
    });
  } catch (error) {
    return handleControllerError(error, res, 'parcialidades');
  }
};

export const updateConfig = async (req, res) => {
  const updates = req.body;
  
  try {
    const configActualizada = await Parcialidad.updateConfig(updates);
    
    res.json({
      ok: true,
      config: configActualizada
    });
  } catch (error) {
    return handleControllerError(error, res, 'parcialidades');
    res.status(500).json({
      ok: false,
      msg: 'Error en el servidor'
    });
  }
};

export const getPagos = async (req, res) => {
  try {
    const pagos = await Parcialidad.getPagos();
    
    res.json({
      ok: true,
      pagos
    });
  } catch (error) {
    return handleControllerError(error, res, 'parcialidades');
  }
};

export const getPagosByDepartamento = async (req, res) => {
  const { departamento } = req.params;
  
  try {
    // Validar que inquilinos solo puedan ver su propio departamento
    if (req.usuario.rol === 'INQUILINO' && req.usuario.departamento !== departamento) {
      return res.status(403).json({
        ok: false,
        msg: 'Solo puedes ver los pagos de tu propio departamento'
      });
    }
    
    const pagos = await Parcialidad.getPagosByDepartamento(departamento);
    
    res.json({
      ok: true,
      pagos
    });
  } catch (error) {
    return handleControllerError(error, res, 'parcialidades');
  }
};

export const registrarPago = async (req, res) => {
  const { departamento, monto, fecha, comprobante, notas } = req.body;
  
  try {
    // Validar que inquilinos solo puedan registrar para su propio departamento
    if (req.usuario.rol === 'INQUILINO' && req.usuario.departamento !== departamento) {
      return res.status(403).json({
        ok: false,
        msg: 'Solo puedes registrar pagos para tu propio departamento'
      });
    }
    
    // Registrar el ingreso en el fondo de gastos mayores
    await Fondo.registrarIngreso(monto, 'gastosMayores');
    
    // Registrar el pago de parcialidad
    const pago = await Parcialidad.registrarPago({
      departamento,
      monto,
      fecha,
      comprobante,
      notas
    });
    
    res.json({
      ok: true,
      pago
    });
  } catch (error) {
    return handleControllerError(error, res, 'parcialidades');
  }
};

export const getEstadoPagos = async (req, res) => {
  try {
    const estadoPagos = await Parcialidad.getEstadoPagos();
    
    res.json({
      ok: true,
      estadoPagos
    });
  } catch (error) {
    return handleControllerError(error, res, 'parcialidades');
    res.status(500).json({
      ok: false,
      msg: 'Error en el servidor'
    });
  }
};