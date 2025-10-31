import Cuota from '../models/Cuota.js';

// Controlador para obtener todas las cuotas
export const getCuotas = (req, res) => {
  try {
    // Actualizar estado de cuotas vencidas
    Cuota.actualizarVencidas();
    
    // Filtrar por departamento si es inquilino
    let cuotas;
    if (req.usuario.rol === 'ADMIN') {
      cuotas = Cuota.obtenerTodas();
    } else {
      cuotas = Cuota.obtenerPorDepartamento(req.usuario.departamento);
    }
    
    res.json({
      success: true,
      cuotas
    });
  } catch (error) {
    console.error('Error al obtener cuotas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cuotas'
    });
  }
};

// Controlador para obtener cuotas por mes y año
export const getCuotasPorMesAnio = (req, res) => {
  try {
    const { mes, anio } = req.params;
    
    // Validar datos
    if (!mes || !anio) {
      return res.status(400).json({
        success: false,
        message: 'Mes y año son obligatorios'
      });
    }
    
    // Obtener cuotas
    const cuotas = Cuota.obtenerPorMesAnio(mes, parseInt(anio));
    
    res.json({
      success: true,
      cuotas
    });
  } catch (error) {
    console.error('Error al obtener cuotas por mes y año:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cuotas por mes y año'
    });
  }
};

// Controlador para generar cuotas mensuales
export const generarCuotasMensuales = (req, res) => {
  try {
    const { mes, anio, monto, fechaVencimiento } = req.body;
    
    // Validar datos
    if (!mes || !anio || !monto || !fechaVencimiento) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios'
      });
    }
    
    // Generar cuotas
    const cuotasGeneradas = Cuota.generarCuotasMensuales(
      mes,
      parseInt(anio),
      parseFloat(monto),
      fechaVencimiento
    );
    
    res.status(201).json({
      success: true,
      message: `Se generaron ${cuotasGeneradas.length} cuotas para ${mes}/${anio}`,
      cuotas: cuotasGeneradas
    });
  } catch (error) {
    console.error('Error al generar cuotas mensuales:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al generar cuotas mensuales'
    });
  }
};

// Controlador para registrar pago de cuota
export const registrarPago = (req, res) => {
  try {
    const { id } = req.params;
    const { comprobantePago } = req.body;
    
    // Validar ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID de cuota es obligatorio'
      });
    }
    
    // Registrar pago
    const cuotaActualizada = Cuota.registrarPago(parseInt(id), comprobantePago);
    
    if (!cuotaActualizada) {
      return res.status(404).json({
        success: false,
        message: 'Cuota no encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Pago registrado exitosamente',
      cuota: cuotaActualizada
    });
  } catch (error) {
    console.error('Error al registrar pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar pago'
    });
  }
};

// Controlador para actualizar estado de cuota
export const actualizarEstado = (req, res) => {
  try {
    const { id } = req.params;
    const { estado, fechaPago, comprobantePago } = req.body;
    
    // Validar datos
    if (!id || !estado) {
      return res.status(400).json({
        success: false,
        message: 'ID y estado son obligatorios'
      });
    }
    
    // Actualizar estado
    const cuotaActualizada = Cuota.actualizarEstado(
      parseInt(id),
      estado,
      fechaPago,
      comprobantePago
    );
    
    if (!cuotaActualizada) {
      return res.status(404).json({
        success: false,
        message: 'Cuota no encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Estado de cuota actualizado exitosamente',
      cuota: cuotaActualizada
    });
  } catch (error) {
    console.error('Error al actualizar estado de cuota:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado de cuota'
    });
  }
};

export default {
  getCuotas,
  getCuotasPorMesAnio,
  generarCuotasMensuales,
  registrarPago,
  actualizarEstado
};