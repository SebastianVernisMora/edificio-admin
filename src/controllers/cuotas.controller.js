import Cuota from '../models/Cuota.js';
import Fondo from '../models/Fondo.js';
import { handleControllerError, validateId, validateRequired } from '../middleware/error-handler.js';

export const getCuotas = async (req, res) => {
  try {
    const cuotas = await Cuota.getAll();
    
    res.json({
      ok: true,
      cuotas
    });
  } catch (error) {
    return handleControllerError(error, res, 'getCuotas');
  }
};

export const getCuotaById = async (req, res) => {
  try {
    const id = validateId(req.params.id);
    const cuota = await Cuota.getById(id);
    
    if (!cuota) {
      return res.status(404).json({
        ok: false,
        msg: 'Cuota no encontrada'
      });
    }
    
    res.json({
      ok: true,
      cuota
    });
  } catch (error) {
    return handleControllerError(error, res, 'getCuotaById');
  }
};

export const getCuotasByDepartamento = async (req, res) => {
  const { departamento } = req.params;
  
  try {
    const cuotas = await Cuota.getByDepartamento(departamento);
    
    res.json({
      ok: true,
      cuotas
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: 'Error en el servidor'
    });
  }
};

export const crearCuota = async (req, res) => {
  const { mes, año, monto, departamento, fechaVencimiento } = req.body;
  
  try {
    // Verificar si ya existe una cuota para este mes/año/departamento
    const cuotas = await Cuota.getByDepartamento(departamento);
    const cuotaExistente = cuotas.find(c => c.mes === mes && c.año === parseInt(año));
    
    if (cuotaExistente) {
      return res.status(400).json({
        ok: false,
        msg: `Ya existe una cuota para ${mes} ${año} en el departamento ${departamento}`
      });
    }
    
    // Crear cuota
    const cuota = await Cuota.create({
      mes,
      año,
      monto,
      departamento,
      fechaVencimiento
    });
    
    res.json({
      ok: true,
      cuota
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: 'Error en el servidor'
    });
  }
};

export const actualizarCuota = async (req, res) => {
  const { id } = req.params;
  const { estado, fechaPago, comprobante } = req.body;
  
  try {
    const cuota = await Cuota.getById(id);
    
    if (!cuota) {
      return res.status(404).json({
        ok: false,
        msg: 'Cuota no encontrada'
      });
    }
    
    // Si se está marcando como pagada, actualizar fondos
    if (estado === 'PAGADO' && cuota.estado !== 'PAGADO') {
      // Distribuir el monto de la cuota entre los fondos
      await Fondo.registrarIngreso(cuota.monto * 0.7, 'dineroOperacional');
      await Fondo.registrarIngreso(cuota.monto * 0.2, 'ahorroAcumulado');
      await Fondo.registrarIngreso(cuota.monto * 0.1, 'gastosMayores');
      
      // Marcar como pagada
      const cuotaActualizada = await Cuota.marcarComoPagada(id, fechaPago, comprobante);
      
      return res.json({
        ok: true,
        cuota: cuotaActualizada
      });
    }
    
    // Actualización normal
    const cuotaActualizada = await Cuota.update(id, {
      estado,
      fechaPago,
      comprobante
    });
    
    res.json({
      ok: true,
      cuota: cuotaActualizada
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: 'Error en el servidor'
    });
  }
};

export const verificarVencimientos = async (req, res) => {
  try {
    await Cuota.verificarVencimientos();
    
    res.json({
      ok: true,
      msg: 'Vencimientos verificados correctamente'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: 'Error en el servidor'
    });
  }
};

export const getAcumuladoAnual = async (req, res) => {
  try {
    const { usuarioId, year } = req.params;
    
    // Validar parámetros
    if (!usuarioId || !year) {
      return res.status(400).json({
        ok: false,
        msg: 'Usuario ID y año son requeridos'
      });
    }
    
    // Validar que el año sea un número válido
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2030) {
      return res.status(400).json({
        ok: false,
        msg: 'Año inválido'
      });
    }
    
    // Verificar permisos: solo el propio usuario o admin puede ver sus datos
    if (req.usuario.rol !== 'ADMIN' && req.usuario.id !== parseInt(usuarioId)) {
      return res.status(403).json({
        ok: false,
        msg: 'No tienes permisos para ver estos datos'
      });
    }
    
    const acumulado = await Cuota.obtenerAcumuladoAnual(usuarioId, year);
    
    res.json({
      ok: true,
      acumulado
    });
  } catch (error) {
    return handleControllerError(error, res, 'getAcumuladoAnual');
  }
};