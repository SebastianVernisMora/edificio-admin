/**
 * State Manager Global
 * Gestión centralizada de estado con patrón observer
 */

class StateManager {
  constructor() {
    this.state = {
      user: null,
      cuotas: [],
      gastos: [],
      fondos: null,
      anuncios: [],
      parcialidades: [],
      loading: {},
      errors: {}
    };
    
    this.listeners = new Map();
    this.history = [];
    this.maxHistory = 50;
  }

  /**
   * Obtener valor del estado
   */
  get(key) {
    return this.state[key];
  }

  /**
   * Establecer valor del estado
   */
  set(key, value, recordHistory = true) {
    const oldValue = this.state[key];
    this.state[key] = value;

    // Guardar en historial
    if (recordHistory) {
      this.history.push({
        key,
        oldValue,
        newValue: value,
        timestamp: Date.now()
      });

      // Limitar historial
      if (this.history.length > this.maxHistory) {
        this.history.shift();
      }
    }

    // Notificar listeners
    this.notify(key, value, oldValue);

    // Notificar listener global
    this.notify('*', { key, value, oldValue });
  }

  /**
   * Actualizar múltiples valores
   */
  setMultiple(updates) {
    Object.entries(updates).forEach(([key, value]) => {
      this.set(key, value, false);
    });

    // Una notificación al final
    this.notify('batch', updates);
  }

  /**
   * Suscribirse a cambios
   */
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    
    this.listeners.get(key).add(callback);

    // Retornar función de unsubscribe
    return () => {
      this.listeners.get(key).delete(callback);
    };
  }

  /**
   * Notificar a listeners
   */
  notify(key, value, oldValue) {
    if (this.listeners.has(key)) {
      this.listeners.get(key).forEach(callback => {
        try {
          callback(value, oldValue);
        } catch (error) {
          console.error(`Error in listener for ${key}:`, error);
        }
      });
    }
  }

  /**
   * Establecer estado de carga
   */
  setLoading(key, isLoading) {
    this.state.loading[key] = isLoading;
    this.notify('loading', this.state.loading);
  }

  /**
   * Establecer error
   */
  setError(key, error) {
    this.state.errors[key] = error;
    this.notify('errors', this.state.errors);
    
    // Auto-limpiar error después de 5 segundos
    setTimeout(() => {
      if (this.state.errors[key] === error) {
        delete this.state.errors[key];
        this.notify('errors', this.state.errors);
      }
    }, 5000);
  }

  /**
   * Limpiar error
   */
  clearError(key) {
    delete this.state.errors[key];
    this.notify('errors', this.state.errors);
  }

  /**
   * Obtener todo el estado
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Reset del estado
   */
  reset() {
    const initialState = {
      user: null,
      cuotas: [],
      gastos: [],
      fondos: null,
      anuncios: [],
      parcialidades: [],
      loading: {},
      errors: {}
    };

    Object.entries(initialState).forEach(([key, value]) => {
      this.set(key, value);
    });

    this.history = [];
  }

  /**
   * Obtener historial
   */
  getHistory(key = null) {
    if (key) {
      return this.history.filter(h => h.key === key);
    }
    return [...this.history];
  }

  /**
   * Computar valor derivado
   */
  computed(keys, computeFn) {
    const compute = () => {
      const values = keys.map(key => this.get(key));
      return computeFn(...values);
    };

    // Suscribirse a cambios en las keys
    keys.forEach(key => {
      this.subscribe(key, compute);
    });

    // Retornar valor inicial
    return compute();
  }

  /**
   * Debug: Log del estado
   */
  debug() {
    console.group('🔍 State Manager Debug');
    console.log('State:', this.state);
    console.log('Listeners:', this.listeners);
    console.log('History:', this.history);
    console.groupEnd();
  }
}

// Singleton
const stateManager = new StateManager();

// Exponer en window para debugging
if (typeof window !== 'undefined') {
  window.__STATE__ = stateManager;
}

export default stateManager;
