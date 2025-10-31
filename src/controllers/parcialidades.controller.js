import Parcialidad from '../models/Parcialidad.js';
import Fondo from '../models/Fondo.js';

export const getConfig = async (req, res) => {
  try {
    const config = await Parcialidad.getConfig();
    
    res.json({
      ok: true,
      config
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: 'Error en el servidor'
    });
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
    console.error(error);
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
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: 'Error en el servidor'
    });
  }
};

export const getPagosByDepartamento = async (req, res) => {
  const { departamento } = req.params;
  
  try {
    const pagos = await Parcialidad.getPagosByDepartamento(departamento);
    
    res.json({
      ok: true,
      pagos
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: 'Error en el servidor'
    });
  }
};

export const registrarPago = async (req, res) => {
  const { departamento, monto, fecha, comprobante, notas } = req.body;
  
  try {
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
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: error.message || 'Error en el servidor'
    });
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
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: 'Error en el servidor'
    });
  }
};