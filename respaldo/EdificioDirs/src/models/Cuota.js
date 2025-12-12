import { readData, addItem, updateItem, deleteItem } from '../data.js';

class Cuota {
  constructor(mes, anio, monto, fechaVencimiento, departamento) {
    this.mes = mes;
    this.anio = anio;
    this.monto = monto;
    this.fechaVencimiento = fechaVencimiento;
    this.departamento = departamento;
    this.estado = 'PENDIENTE'; // PENDIENTE, PAGADO, VENCIDO
    this.fechaPago = null;
    this.comprobantePago = null;
    this.fechaCreacion = new Date().toISOString();
  }
  
  // Método para crear una nueva cuota
  static crear(cuotaData) {
    try {
      const nuevaCuota = new Cuota(
        cuotaData.mes,
        cuotaData.anio,
        cuotaData.monto,
        cuotaData.fechaVencimiento,
        cuotaData.departamento
      );
      
      return addItem('cuotas', nuevaCuota);
    } catch (error) {
      console.error('Error al crear cuota:', error);
      throw error;
    }
  }
  
  // Método para generar cuotas para todos los departamentos
  static generarCuotasMensuales(mes, anio, monto, fechaVencimiento) {
    try {
      const data = readData();
      const departamentos = data.usuarios
        .filter(u => u.rol === 'INQUILINO')
        .map(u => u.departamento);
      
      // Verificar si ya existen cuotas para este mes y año
      const existenCuotas = data.cuotas.some(
        c => c.mes === mes && c.anio === anio
      );
      
      if (existenCuotas) {
        throw new Error(`Ya existen cuotas generadas para ${mes}/${anio}`);
      }
      
      // Crear cuotas para cada departamento
      const cuotasGeneradas = [];
      
      for (const departamento of departamentos) {
        const nuevaCuota = new Cuota(
          mes,
          anio,
          monto,
          fechaVencimiento,
          departamento
        );
        
        const cuotaCreada = addItem('cuotas', nuevaCuota);
        if (cuotaCreada) {
          cuotasGeneradas.push(cuotaCreada);
        }
      }
      
      return cuotasGeneradas;
    } catch (error) {
      console.error('Error al generar cuotas mensuales:', error);
      throw error;
    }
  }
  
  // Método para obtener todas las cuotas
  static obtenerTodas() {
    const data = readData();
    return data.cuotas;
  }
  
  // Método para obtener cuotas por departamento
  static obtenerPorDepartamento(departamento) {
    const data = readData();
    return data.cuotas.filter(c => c.departamento === departamento);
  }
  
  // Método para obtener cuotas por mes y año
  static obtenerPorMesAnio(mes, anio) {
    const data = readData();
    return data.cuotas.filter(c => c.mes === mes && c.anio === anio);
  }
  
  // Método para obtener una cuota por ID
  static obtenerPorId(id) {
    const data = readData();
    return data.cuotas.find(c => c.id === id);
  }
  
  // Método para actualizar estado de cuota
  static actualizarEstado(id, estado, fechaPago = null, comprobantePago = null) {
    const updates = { 
      estado, 
      fechaPago: fechaPago || (estado === 'PAGADO' ? new Date().toISOString() : null),
      comprobantePago
    };
    
    return updateItem('cuotas', id, updates);
  }
  
  // Método para registrar pago
  static registrarPago(id, comprobantePago = null) {
    return Cuota.actualizarEstado(id, 'PAGADO', new Date().toISOString(), comprobantePago);
  }
  
  // Método para actualizar cuotas vencidas
  static actualizarVencidas() {
    const data = readData();
    const hoy = new Date();
    let actualizadas = 0;
    
    for (const cuota of data.cuotas) {
      if (cuota.estado === 'PENDIENTE') {
        const fechaVencimiento = new Date(cuota.fechaVencimiento);
        
        if (fechaVencimiento < hoy) {
          const actualizada = Cuota.actualizarEstado(cuota.id, 'VENCIDO');
          if (actualizada) actualizadas++;
        }
      }
    }
    
    return actualizadas;
  }
  
  // Método para eliminar una cuota
  static eliminar(id) {
    return deleteItem('cuotas', id);
  }
  
  // Método para obtener acumulado anual de pagos por usuario/departamento
  static obtenerAcumuladoAnual(usuarioId, year) {
    try {
      const data = readData();
      
      // Buscar el usuario para obtener su departamento
      const usuario = data.usuarios.find(u => u.id === parseInt(usuarioId));
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }
      
      // Filtrar cuotas del departamento del usuario para el año especificado
      const cuotasDelAnio = data.cuotas.filter(cuota => 
        cuota.departamento === usuario.departamento && 
        cuota.anio === parseInt(year) &&
        cuota.estado === 'PAGADO'
      );
      
      // Calcular total pagado
      const totalPagado = cuotasDelAnio.reduce((total, cuota) => total + cuota.monto, 0);
      
      // Crear desglose mensual
      const desgloseMensual = {};
      const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      
      // Inicializar todos los meses en 0
      meses.forEach(mes => {
        desgloseMensual[mes] = {
          pagado: 0,
          monto: 0,
          estado: 'NO_GENERADA'
        };
      });
      
      // Llenar con datos reales
      cuotasDelAnio.forEach(cuota => {
        desgloseMensual[cuota.mes] = {
          pagado: cuota.monto,
          monto: cuota.monto,
          estado: cuota.estado,
          fechaPago: cuota.fechaPago
        };
      });
      
      // Buscar cuotas pendientes/vencidas del año
      const cuotasPendientes = data.cuotas.filter(cuota => 
        cuota.departamento === usuario.departamento && 
        cuota.anio === parseInt(year) &&
        (cuota.estado === 'PENDIENTE' || cuota.estado === 'VENCIDO')
      );
      
      cuotasPendientes.forEach(cuota => {
        desgloseMensual[cuota.mes] = {
          pagado: 0,
          monto: cuota.monto,
          estado: cuota.estado,
          fechaVencimiento: cuota.fechaVencimiento
        };
      });
      
      // Obtener datos del año anterior para comparación
      const cuotasAnioAnterior = data.cuotas.filter(cuota => 
        cuota.departamento === usuario.departamento && 
        cuota.anio === parseInt(year) - 1 &&
        cuota.estado === 'PAGADO'
      );
      
      const totalAnioAnterior = cuotasAnioAnterior.reduce((total, cuota) => total + cuota.monto, 0);
      
      return {
        year: parseInt(year),
        departamento: usuario.departamento,
        totalPagado,
        totalCuotas: cuotasDelAnio.length,
        desgloseMensual,
        comparativaAnioAnterior: {
          year: parseInt(year) - 1,
          total: totalAnioAnterior,
          diferencia: totalPagado - totalAnioAnterior
        }
      };
      
    } catch (error) {
      console.error('Error al obtener acumulado anual:', error);
      throw error;
    }
  }
}

export default Cuota;