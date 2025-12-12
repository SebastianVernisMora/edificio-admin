import Cierre from '../models/Cierre.js';
import { handleControllerError } from '../middleware/error-handler.js';

export const getCierres = async (req, res) => {
  try {
    const { anio } = req.query;
    
    let cierres = await Cierre.getAll();
    
    // Filtrar por año si se especifica
    if (anio) {
      cierres = cierres.filter(c => (c.año || c.anio) === parseInt(anio));
    }
    
    res.json({
      ok: true,
      cierres
    });
  } catch (error) {
    return handleControllerError(error, res, 'getCierres');
  }
};

export const getCierreById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const cierre = await Cierre.getById(id);
    
    if (!cierre) {
      return res.status(404).json({
        ok: false,
        msg: 'Cierre no encontrado'
      });
    }
    
    res.json({
      ok: true,
      cierre
    });
  } catch (error) {
    return handleControllerError(error, res, 'getCierreById');
  }
};

export const getCierreByMesAño = async (req, res) => {
  const { mes, año } = req.params;
  
  try {
    const cierre = await Cierre.getByMesAño(mes, parseInt(año));
    
    if (!cierre) {
      return res.status(404).json({
        ok: false,
        msg: `No hay cierre para ${mes} ${año}`
      });
    }
    
    res.json({
      ok: true,
      cierre
    });
  } catch (error) {
    return handleControllerError(error, res, 'getCierreByMesAño');
  }
};

export const realizarCierreMensual = async (req, res) => {
  const { mes, año } = req.body;
  
  try {
    const cierre = await Cierre.realizarCierreMensual(mes, parseInt(año));
    
    res.json({
      ok: true,
      cierre,
      msg: `Cierre de ${mes} ${año} realizado correctamente`
    });
  } catch (error) {
    if (error.message.includes('Ya existe un cierre')) {
      return res.status(400).json({
        ok: false,
        msg: error.message
      });
    }
    return handleControllerError(error, res, 'realizarCierreMensual');
  }
};

export const realizarCierreAnual = async (req, res) => {
  const { año } = req.body;
  
  try {
    const cierre = await Cierre.realizarCierreAnual(parseInt(año));
    
    res.json({
      ok: true,
      cierre,
      msg: `Cierre anual de ${año} realizado correctamente`
    });
  } catch (error) {
    return handleControllerError(error, res, 'realizarCierreAnual');
  }
};