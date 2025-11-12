import Fondo from '../models/Fondo.js';
import { handleControllerError } from '../middleware/error-handler.js';

export const getFondos = async (req, res) => {
  try {
    const fondos = await Fondo.getFondos();
    
    res.json({
      ok: true,
      fondos
    });
  } catch (error) {
    return handleControllerError(error, res, 'fondos');
    res.status(500).json({
      ok: false,
      msg: 'Error en el servidor'
    });
  }
};

export const actualizarFondos = async (req, res) => {
  const updates = req.body;
  
  try {
    const fondosActualizados = await Fondo.updateFondos(updates);
    
    res.json({
      ok: true,
      fondos: fondosActualizados
    });
  } catch (error) {
    return handleControllerError(error, res, 'fondos');
    res.status(500).json({
      ok: false,
      msg: 'Error en el servidor'
    });
  }
};

export const transferirEntreFondos = async (req, res) => {
  const { origen, destino, monto } = req.body;
  
  try {
    const fondosActualizados = await Fondo.transferirEntreFondos(origen, destino, monto);
    
    res.json({
      ok: true,
      fondos: fondosActualizados,
      msg: `Transferencia de ${monto} realizada correctamente de ${origen} a ${destino}`
    });
  } catch (error) {
    return handleControllerError(error, res, 'fondos');
    res.status(500).json({
      ok: false,
      msg: error.message || 'Error en el servidor'
    });
  }
};