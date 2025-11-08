/**
 * Worker para ejecutar un agente en segundo plano
 * Se comunica con el orquestador vía HTTP
 */

import axios from 'axios';

class AgenteWorker {
  constructor(agenteId, orquestadorUrl = 'http://localhost:3000') {
    this.agenteId = agenteId;
    this.orquestadorUrl = orquestadorUrl;
    this.estado = 'INICIANDO';
    this.progreso = 0;
    this.tareas = [];
    this.intervaloReporte = 2000; // Reportar cada 2 segundos
  }

  /**
   * Inicia la ejecución del agente
   */
  async iniciar() {
    console.log(`[${this.agenteId}] 🚀 Iniciando agente...`);
    
    try {
      // Reportar inicio al orquestador
      await this.reportarEstado('EN_PROGRESO', 0);
      
      // Cargar tareas del agente
      await this.cargarTareas();
      
      // Ejecutar tareas
      await this.ejecutarTareas();
      
      // Reportar completado
      await this.reportarEstado('COMPLETADO', 100);
      console.log(`[${this.agenteId}] ✅ Agente completado exitosamente`);
      
    } catch (error) {
      console.error(`[${this.agenteId}] ❌ Error:`, error.message);
      await this.reportarEstado('ERROR', this.progreso, error.message);
      process.exit(1);
    }
  }

  /**
   * Carga las tareas específicas del agente
   */
  async cargarTareas() {
    console.log(`[${this.agenteId}] 📋 Cargando tareas...`);
    
    // Definir tareas según el agente
    switch (this.agenteId) {
      case 'agente1':
        this.tareas = [
          { nombre: 'Mejorar visualización de permisos', duracion: 5000 },
          { nombre: 'Implementar filtrado de usuarios', duracion: 5000 }
        ];
        break;
      
      case 'agente2':
        this.tareas = [
          { nombre: 'Crear sección de gestión de permisos', duracion: 6000 },
          { nombre: 'Implementar registro de actividad', duracion: 4000 }
        ];
        break;
      
      case 'agente3':
        this.tareas = [
          { nombre: 'Corregir visualización del menú', duracion: 3000 },
          { nombre: 'Mejorar documentación', duracion: 4000 },
          { nombre: 'Implementar tests', duracion: 5000 }
        ];
        break;
      
      default:
        throw new Error(`Agente desconocido: ${this.agenteId}`);
    }
    
    console.log(`[${this.agenteId}] ✓ ${this.tareas.length} tareas cargadas`);
  }

  /**
   * Ejecuta todas las tareas del agente
   */
  async ejecutarTareas() {
    const totalTareas = this.tareas.length;
    
    for (let i = 0; i < totalTareas; i++) {
      const tarea = this.tareas[i];
      console.log(`[${this.agenteId}] 🔄 Ejecutando: ${tarea.nombre}`);
      
      // Simular ejecución de la tarea
      await this.ejecutarTarea(tarea, i, totalTareas);
      
      // Calcular progreso
      this.progreso = Math.round(((i + 1) / totalTareas) * 100);
      
      // Reportar progreso
      await this.reportarEstado('EN_PROGRESO', this.progreso);
      
      console.log(`[${this.agenteId}] ✓ Completado: ${tarea.nombre} (${this.progreso}%)`);
    }
  }

  /**
   * Ejecuta una tarea individual
   */
  async ejecutarTarea(tarea, indice, total) {
    const pasos = 10;
    const tiempoPorPaso = tarea.duracion / pasos;
    
    for (let paso = 0; paso < pasos; paso++) {
      await this.delay(tiempoPorPaso);
      
      // Calcular progreso dentro de la tarea
      const progresoTarea = ((indice + (paso / pasos)) / total) * 100;
      this.progreso = Math.round(progresoTarea);
      
      // Reportar progreso cada cierto tiempo
      if (paso % 3 === 0) {
        await this.reportarEstado('EN_PROGRESO', this.progreso);
      }
    }
  }

  /**
   * Reporta el estado al orquestador
   */
  async reportarEstado(estado, progreso, error = null) {
    try {
      const payload = {
        estado,
        progreso,
        ...(error && { error })
      };
      
      await axios.put(
        `${this.orquestadorUrl}/api/orquestador/agente/${this.agenteId}`,
        payload
      );
      
    } catch (error) {
      console.error(`[${this.agenteId}] ⚠️  Error al reportar estado:`, error.message);
      // No lanzar error para no interrumpir la ejecución
    }
  }

  /**
   * Función auxiliar para delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Ejecutar worker si se llama directamente
if (process.argv.length < 3) {
  console.error('❌ Uso: node agente-worker.js <agenteId> [orquestadorUrl]');
  process.exit(1);
}

const agenteId = process.argv[2];
const orquestadorUrl = process.argv[3] || 'http://localhost:3000';

const worker = new AgenteWorker(agenteId, orquestadorUrl);
worker.iniciar().catch(error => {
  console.error(`[${agenteId}] ❌ Error fatal:`, error);
  process.exit(1);
});

export default AgenteWorker;
