import Gasto from '../models/Gasto.js';
import Fondo from '../models/Fondo.js';
import { handleControllerError, validateId, validateRequired, validateNumber } from '../middleware/error-handler.js';

export const getGastos = async (req, res) => {
  try {
    const gastos = await Gasto.getAll();
    
    res.json({
      ok: true,
      gastos
    });
  } catch (error) {
    return handleControllerError(error, res, 'getGastos');
  }
};

export const getGastoById = async (req, res) => {
  try {
    const id = validateId(req.params.id);
    const gasto = await Gasto.getById(id);
    
    if (!gasto) {
      return res.status(404).json({
        ok: false,
        msg: 'Gasto no encontrado'
      });
    }
    
    res.json({
      ok: true,
      gasto
    });
  } catch (error) {
    return handleControllerError(error, res, 'getGastoById');
  }
};

export const getGastosByCategoria = async (req, res) => {
  const { categoria } = req.params;
  
  try {
    const gastos = await Gasto.getByCategoria(categoria);
    
    res.json({
      ok: true,
      gastos
    });
  } catch (error) {
    return handleControllerError(error, res, 'gastos');
    res.status(500).json({
      ok: false,
      msg: 'Error en el servidor'
    });
  }
};

export const getGastosByMesAño = async (req, res) => {
  const { mes, año } = req.params;
  
  try {
    const gastos = await Gasto.getByMesAño(parseInt(mes), parseInt(año));
    
    res.json({
      ok: true,
      gastos
    });
  } catch (error) {
    return handleControllerError(error, res, 'gastos');
    res.status(500).json({
      ok: false,
      msg: 'Error en el servidor'
    });
  }
};

export const crearGasto = async (req, res) => {
  const { concepto, monto, categoria, proveedor, fecha, comprobante, notas, fondo } = req.body;
  
  try {
    // Registrar el gasto en el fondo correspondiente
    await Fondo.registrarGasto(monto, fondo || 'dineroOperacional');
    
    // Crear registro de gasto
    const gasto = await Gasto.create({
      concepto,
      monto,
      categoria,
      proveedor,
      fecha,
      comprobante,
      notas,
      createdBy: req.usuario.id
    });
    
    res.json({
      ok: true,
      gasto
    });
  } catch (error) {
    return handleControllerError(error, res, 'gastos');
    res.status(500).json({
      ok: false,
      msg: error.message || 'Error en el servidor'
    });
  }
};

export const actualizarGasto = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  try {
    const gasto = await Gasto.getById(id);
    
    if (!gasto) {
      return res.status(404).json({
        ok: false,
        msg: 'Gasto no encontrado'
      });
    }
    
    // Si se actualiza el monto, ajustar fondos
    if (updates.monto && updates.monto !== gasto.monto) {
      const diferencia = updates.monto - gasto.monto;
      
      if (diferencia > 0) {
        // Si aumentó el gasto, restar la diferencia
        await Fondo.registrarGasto(diferencia, updates.fondo || 'dineroOperacional');
      } else {
        // Si disminuyó el gasto, sumar la diferencia
        await Fondo.registrarIngreso(Math.abs(diferencia), updates.fondo || 'dineroOperacional');
      }
    }
    
    const gastoActualizado = await Gasto.update(id, updates);
    
    res.json({
      ok: true,
      gasto: gastoActualizado
    });
  } catch (error) {
    return handleControllerError(error, res, 'gastos');
    res.status(500).json({
      ok: false,
      msg: error.message || 'Error en el servidor'
    });
  }
};

export const eliminarGasto = async (req, res) => {
  const { id } = req.params;
  
  try {
    const gasto = await Gasto.getById(id);
    
    if (!gasto) {
      return res.status(404).json({
        ok: false,
        msg: 'Gasto no encontrado'
      });
    }
    
    // Devolver el monto al fondo correspondiente
    await Fondo.registrarIngreso(gasto.monto, 'dineroOperacional');
    
    // Eliminar el gasto
    await Gasto.delete(id);
    
    res.json({
      ok: true,
      msg: 'Gasto eliminado correctamente'
    });
  } catch (error) {
    return handleControllerError(error, res, 'gastos');
    res.status(500).json({
      ok: false,
      msg: 'Error en el servidor'
    });
  }
};