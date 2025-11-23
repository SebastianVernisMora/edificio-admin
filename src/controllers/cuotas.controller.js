import Cuota from '../models/Cuota.js';
import Fondo from '../models/Fondo.js';
import { handleControllerError, validateId, validateRequired } from '../middleware/error-handler.js';

export const getCuotas = async (req, res) => {
  try {
    const { departamento, mes, anio, estado } = req.query;
    
    let cuotas = Cuota.obtenerTodas();
    
    // Filtrar por departamento
    if (departamento) {
      cuotas = cuotas.filter(c => c.departamento === departamento);
    }
    
    // Filtrar por mes
    if (mes) {
      cuotas = cuotas.filter(c => c.mes === mes);
    }
    
    // Filtrar por año
    if (anio) {
      cuotas = cuotas.filter(c => c.anio === parseInt(anio));
    }
    
    // Filtrar por estado
    if (estado) {
      cuotas = cuotas.filter(c => c.estado === estado);
    }
    
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
    const cuotas = Cuota.obtenerPorDepartamento(departamento);
    
    res.json({
      ok: true,
      cuotas
    });
  } catch (error) {
    return handleControllerError(error, res, 'getCuotasByDepartamento');
  }
};

export const crearCuota = async (req, res) => {
  const { mes, anio, monto, departamento, fechaVencimiento } = req.body;
  
  try {
    // Si departamento es TODOS, generar para todos
    if (departamento === 'TODOS') {
      try {
        const cuotasGeneradas = Cuota.generarCuotasMensuales(mes, anio, monto, fechaVencimiento);
        
        return res.json({
          ok: true,
          cuotasGeneradas: cuotasGeneradas.length,
          cuotas: cuotasGeneradas
        });
      } catch (error) {
        if (error.message.includes('Ya existen cuotas')) {
          return res.status(400).json({
            ok: false,
            msg: error.message
          });
        }
        throw error;
      }
    }
    
    // Si es departamento específico
    const cuotas = Cuota.obtenerPorDepartamento(departamento);
    const cuotaExistente = cuotas.find(c => c.mes === mes && c.anio === parseInt(anio));
    
    if (cuotaExistente) {
      return res.status(400).json({
        ok: false,
        msg: `Ya existe una cuota para ${mes} ${anio} en el departamento ${departamento}`
      });
    }
    
    // Crear cuota individual
    const cuota = Cuota.crear({
      mes,
      anio,
      monto,
      departamento,
      fechaVencimiento
    });
    
    res.json({
      ok: true,
      cuota
    });
  } catch (error) {
    return handleControllerError(error, res, 'crearCuota');
  }
};

export const actualizarCuota = async (req, res) => {
  const { id } = req.params;
  const { estado, fechaPago, comprobante } = req.body;
  
  try {
    const cuota = Cuota.obtenerPorId(parseInt(id));
    
    if (!cuota) {
      return res.status(404).json({
        ok: false,
        msg: 'Cuota no encontrada'
      });
    }
    
    // Si se está marcando como pagada, actualizar fondos
    if (estado === 'PAGADO' && cuota.estado !== 'PAGADO') {
      // Todo el monto de la cuota va a Dinero Operacional
      await Fondo.registrarIngreso(cuota.monto, 'dineroOperacional');
      console.log(`✅ Ingreso de $${cuota.monto} a Dinero Operacional por pago de cuota`);
      
      // Actualizar estado de cuota
      const cuotaActualizada = Cuota.actualizarEstado(parseInt(id), estado, fechaPago, comprobante);
      
      return res.json({
        ok: true,
        cuota: cuotaActualizada
      });
    }
    
    // Actualización normal
    const cuotaActualizada = Cuota.actualizarEstado(parseInt(id), estado, fechaPago, comprobante);
    
    res.json({
      ok: true,
      cuota: cuotaActualizada
    });
  } catch (error) {
    return handleControllerError(error, res, 'actualizarCuota');
  }
};

export const verificarVencimientos = async (req, res) => {
  try {
    const actualizadas = Cuota.actualizarVencidas();
    
    res.json({
      ok: true,
      actualizadas,
      msg: 'Vencimientos verificados correctamente'
    });
  } catch (error) {
    return handleControllerError(error, res, 'verificarVencimientos');
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