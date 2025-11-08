/**
 * Orquestador - Sistema de supervisión de workflow para agentes paralelos
 * 
 * Este agente supervisa y coordina la ejecución de los Agentes 1, 2 y 3
 * asegurando que trabajen en paralelo sin conflictos y cumplan con sus objetivos.
 */

class Orquestador {
  constructor() {
    this.agentes = {
      agente1: {
        nombre: 'Agente 1: Mejoras en la Interfaz de Usuario',
        estado: 'PENDIENTE', // PENDIENTE, EN_PROGRESO, COMPLETADO, ERROR
        tareas: [
          'Mejorar visualización de permisos en la tabla de usuarios',
          'Implementar filtrado de usuarios por rol'
        ],
        archivosAsignados: [
          '/home/admin/edificio-admin/public/js/usuarios.js',
          '/home/admin/edificio-admin/views/usuarios.html'
        ],
        progreso: 0,
        errores: [],
        ultimaActualizacion: null
      },
      agente2: {
        nombre: 'Agente 2: Gestión Centralizada de Permisos',
        estado: 'PENDIENTE',
        tareas: [
          'Crear nueva sección de gestión de permisos',
          'Implementar registro de actividad para cambios de permisos'
        ],
        archivosAsignados: [
          '/home/admin/edificio-admin/public/js/permisos.js',
          '/home/admin/edificio-admin/public/admin.html',
          '/home/admin/edificio-admin/src/routes/permisos.js',
          '/home/admin/edificio-admin/src/controllers/permisosController.js',
          '/home/admin/edificio-admin/src/app.js'
        ],
        progreso: 0,
        errores: [],
        ultimaActualizacion: null
      },
      agente3: {
        nombre: 'Agente 3: Documentación y Pruebas',
        estado: 'PENDIENTE',
        tareas: [
          'Corregir visualización del menú de configuración',
          'Mejorar la documentación del sistema de permisos',
          'Implementar tests básicos para el sistema de permisos'
        ],
        archivosAsignados: [
          '/home/admin/edificio-admin/PERMISOS.md',
          '/home/admin/edificio-admin/tests/permisos.test.js',
          '/home/admin/edificio-admin/package.json',
          '/home/admin/edificio-admin/public/js/auth.js'
        ],
        progreso: 0,
        errores: [],
        ultimaActualizacion: null
      }
    };

    this.workflow = {
      estado: 'INICIALIZADO',
      inicioEjecucion: null,
      finEjecucion: null,
      conflictos: [],
      dependencias: []
    };

    this.log = [];
  }

  /**
   * Inicia el workflow de los 3 agentes
   */
  iniciarWorkflow() {
    this.registrarLog('INFO', 'Iniciando workflow de agentes paralelos');
    this.workflow.estado = 'EN_EJECUCION';
    this.workflow.inicioEjecucion = new Date();

    // Verificar que no hay conflictos de archivos antes de iniciar
    const conflictos = this.verificarConflictosArchivos();
    if (conflictos.length > 0) {
      this.registrarLog('ERROR', `Conflictos detectados: ${JSON.stringify(conflictos)}`);
      this.workflow.conflictos = conflictos;
      return {
        exito: false,
        mensaje: 'No se puede iniciar el workflow debido a conflictos de archivos',
        conflictos
      };
    }

    // Iniciar todos los agentes en paralelo
    this.registrarLog('INFO', 'Iniciando Agente 1, 2 y 3 en paralelo');
    Object.keys(this.agentes).forEach(agenteId => {
      this.agentes[agenteId].estado = 'EN_PROGRESO';
      this.agentes[agenteId].ultimaActualizacion = new Date();
    });

    return {
      exito: true,
      mensaje: 'Workflow iniciado correctamente',
      agentes: this.obtenerEstadoAgentes()
    };
  }

  /**
   * Verifica que no haya conflictos de archivos entre agentes
   */
  verificarConflictosArchivos() {
    const conflictos = [];
    const archivosUsados = new Map();

    Object.entries(this.agentes).forEach(([agenteId, agente]) => {
      agente.archivosAsignados.forEach(archivo => {
        if (archivosUsados.has(archivo)) {
          conflictos.push({
            archivo,
            agentes: [archivosUsados.get(archivo), agenteId]
          });
        } else {
          archivosUsados.set(archivo, agenteId);
        }
      });
    });

    return conflictos;
  }

  /**
   * Actualiza el estado de un agente específico
   */
  actualizarEstadoAgente(agenteId, estado, progreso = null, error = null) {
    if (!this.agentes[agenteId]) {
      this.registrarLog('ERROR', `Agente ${agenteId} no existe`);
      return false;
    }

    this.agentes[agenteId].estado = estado;
    this.agentes[agenteId].ultimaActualizacion = new Date();

    if (progreso !== null) {
      this.agentes[agenteId].progreso = progreso;
    }

    if (error) {
      this.agentes[agenteId].errores.push({
        timestamp: new Date(),
        mensaje: error
      });
      this.registrarLog('ERROR', `${agenteId}: ${error}`);
    }

    this.registrarLog('INFO', `${agenteId} actualizado: ${estado} (${progreso}%)`);

    // Verificar si todos los agentes han completado
    this.verificarCompletitudWorkflow();

    return true;
  }

  /**
   * Verifica si todos los agentes han completado sus tareas
   */
  verificarCompletitudWorkflow() {
    const todosCompletados = Object.values(this.agentes).every(
      agente => agente.estado === 'COMPLETADO'
    );

    if (todosCompletados) {
      this.workflow.estado = 'COMPLETADO';
      this.workflow.finEjecucion = new Date();
      this.registrarLog('INFO', 'Workflow completado exitosamente');
      this.generarReporte();
    }

    const algunoConError = Object.values(this.agentes).some(
      agente => agente.estado === 'ERROR'
    );

    if (algunoConError) {
      this.workflow.estado = 'ERROR';
      this.registrarLog('ERROR', 'Workflow finalizado con errores');
    }
  }

  /**
   * Obtiene el estado actual de todos los agentes
   */
  obtenerEstadoAgentes() {
    return Object.entries(this.agentes).map(([id, agente]) => ({
      id,
      nombre: agente.nombre,
      estado: agente.estado,
      progreso: agente.progreso,
      tareas: agente.tareas,
      errores: agente.errores.length,
      ultimaActualizacion: agente.ultimaActualizacion
    }));
  }

  /**
   * Obtiene el estado completo del workflow
   */
  obtenerEstadoWorkflow() {
    return {
      workflow: this.workflow,
      agentes: this.obtenerEstadoAgentes(),
      log: this.log.slice(-20) // Últimas 20 entradas del log
    };
  }

  /**
   * Registra un evento en el log
   */
  registrarLog(nivel, mensaje) {
    const entrada = {
      timestamp: new Date(),
      nivel,
      mensaje
    };
    this.log.push(entrada);
    console.log(`[${nivel}] ${mensaje}`);
  }

  /**
   * Genera un reporte final del workflow
   */
  generarReporte() {
    const duracion = this.workflow.finEjecucion - this.workflow.inicioEjecucion;
    const minutos = Math.floor(duracion / 60000);
    const segundos = Math.floor((duracion % 60000) / 1000);

    const reporte = {
      titulo: 'Reporte de Ejecución del Workflow',
      duracion: `${minutos}m ${segundos}s`,
      estado: this.workflow.estado,
      agentes: Object.entries(this.agentes).map(([id, agente]) => ({
        id,
        nombre: agente.nombre,
        estado: agente.estado,
        progreso: agente.progreso,
        errores: agente.errores.length,
        tareasCompletadas: agente.tareas.length
      })),
      conflictos: this.workflow.conflictos,
      totalErrores: Object.values(this.agentes).reduce(
        (sum, agente) => sum + agente.errores.length, 0
      )
    };

    this.registrarLog('INFO', `Reporte generado: ${JSON.stringify(reporte, null, 2)}`);
    return reporte;
  }

  /**
   * Detiene el workflow de emergencia
   */
  detenerWorkflow(razon) {
    this.registrarLog('WARNING', `Workflow detenido: ${razon}`);
    this.workflow.estado = 'DETENIDO';
    this.workflow.finEjecucion = new Date();

    Object.keys(this.agentes).forEach(agenteId => {
      if (this.agentes[agenteId].estado === 'EN_PROGRESO') {
        this.agentes[agenteId].estado = 'DETENIDO';
      }
    });

    return this.generarReporte();
  }

  /**
   * Reinicia el workflow desde cero
   */
  reiniciarWorkflow() {
    this.registrarLog('INFO', 'Reiniciando workflow');
    
    Object.keys(this.agentes).forEach(agenteId => {
      this.agentes[agenteId].estado = 'PENDIENTE';
      this.agentes[agenteId].progreso = 0;
      this.agentes[agenteId].errores = [];
      this.agentes[agenteId].ultimaActualizacion = null;
    });

    this.workflow.estado = 'INICIALIZADO';
    this.workflow.inicioEjecucion = null;
    this.workflow.finEjecucion = null;
    this.workflow.conflictos = [];

    return this.iniciarWorkflow();
  }
}

// Exportar la clase
export default Orquestador;
