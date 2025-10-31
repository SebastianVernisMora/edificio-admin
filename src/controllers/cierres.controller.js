import Cierre from '../models/Cierre.js';

export const getCierres = async (req, res) => {
  try {
    const cierres = await Cierre.getAll();
    
    res.json({
      ok: true,
      cierres
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: 'Error en el servidor'
    });
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
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: 'Error en el servidor'
    });
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
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: 'Error en el servidor'
    });
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
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: error.message || 'Error en el servidor'
    });
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
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: error.message || 'Error en el servidor'
    });
  }
};