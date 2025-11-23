/**
 * Módulo Fondos Optimizado
 * Gestión de fondos y transferencias
 */

import APIClient from '../core/api-client.js';
import State from '../core/state-manager.js';

class FondosModule {
  constructor() {
    this.initialized = false;
    this.fondos = null;
    this.movimientos = [];
    this.unsubscribers = [];
  }

  /**
   * Inicializar módulo
   */
  async init() {
    if (this.initialized) {
      console.log('Fondos module already initialized');
      return;
    }

    console.log('🎬 Initializing Fondos module...');

    this.setupEventListeners();
    this.subscribeToState();
    await this.loadInitialData();

    this.initialized = true;
    console.log('✅ Fondos module initialized');
  }

  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    document.addEventListener('click', this.handleClick.bind(this));
    document.addEventListener('submit', this.handleSubmit.bind(this));
  }

  /**
   * Suscribirse a estado
   */
  subscribeToState() {
    const unsubFondos = State.subscribe('fondos', (fondos) => {
      this.fondos = fondos;
      this.renderFondos(fondos);
    });

    const unsubLoading = State.subscribe('loading', (loading) => {
      this.updateLoadingState(loading.fondos);
    });

    const unsubErrors = State.subscribe('errors', (errors) => {
      if (errors.fondos) this.showError(errors.fondos);
    });

    this.unsubscribers.push(unsubFondos, unsubLoading, unsubErrors);
  }

  /**
   * Cargar datos iniciales
   */
  async loadInitialData() {
    await this.loadFondos();
  }

  /**
   * Cargar fondos
   */
  async loadFondos() {
    State.setLoading('fondos', true);

    try {
      const data = await APIClient.getFondos();
      State.set('fondos', data.fondos || data);
      
      // Guardar movimientos si existen
      if (data.movimientos) {
        this.movimientos = data.movimientos;
        this.renderMovimientos(data.movimientos);
      }

    } catch (error) {
      State.setError('fondos', error.message);
    } finally {
      State.setLoading('fondos', false);
    }
  }

  /**
   * Handler de clicks
   */
  handleClick(e) {
    const target = e.target;

    if (target.id === 'transferir-fondos-btn') {
      e.preventDefault();
      this.showTransferirModal();
    }
    else if (target.classList.contains('close') || target.classList.contains('modal-cancel')) {
      e.preventDefault();
      this.closeModals();
    }
  }

  /**
   * Handler de submit
   */
  handleSubmit(e) {
    const form = e.target;

    if (form.id === 'transferir-form') {
      e.preventDefault();
      this.submitTransferencia(form);
    }
  }

  /**
   * Renderizar fondos
   */
  renderFondos(fondos) {
    if (!fondos) return;

    // Actualizar tarjetas de fondos
    this.updateFondoCard('ahorro-acumulado', fondos.ahorroAcumulado);
    this.updateFondoCard('gastos-mayores', fondos.gastosMayores);
    this.updateFondoCard('dinero-operacional', fondos.dineroOperacional);

    // Calcular patrimonio total
    const patrimonioTotal = (fondos.ahorroAcumulado || 0) + 
                           (fondos.gastosMayores || 0) + 
                           (fondos.dineroOperacional || 0);

    this.updateFondoCard('patrimonio-total-fondos', patrimonioTotal);

    // Actualizar fecha
    const fechaElem = document.getElementById('fondos-actualizacion');
    if (fechaElem) {
      fechaElem.textContent = new Date().toLocaleDateString('es-MX');
    }
  }

  /**
   * Actualizar tarjeta de fondo
   */
  updateFondoCard(elemId, monto) {
    const elem = document.getElementById(elemId);
    if (elem) {
      elem.textContent = `$${(monto || 0).toLocaleString()}`;
    }
  }

  /**
   * Renderizar movimientos
   */
  renderMovimientos(movimientos) {
    const tbody = document.querySelector('#movimientos-table tbody');
    if (!tbody) return;

    if (!movimientos || movimientos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay movimientos registrados</td></tr>';
      return;
    }

    const fragment = document.createDocumentFragment();

    // Últimos 20 movimientos
    const recientes = movimientos.slice(-20).reverse();

    recientes.forEach(mov => {
      const tr = this.createMovimientoRow(mov);
      fragment.appendChild(tr);
    });

    tbody.innerHTML = '';
    tbody.appendChild(fragment);
  }

  /**
   * Crear fila de movimiento
   */
  createMovimientoRow(mov) {
    const tr = document.createElement('tr');
    
    const fecha = new Date(mov.fecha).toLocaleDateString('es-MX');
    const tipo = mov.tipo || 'transferencia';
    const tipoClass = tipo === 'ingreso' ? 'text-success' : tipo === 'egreso' ? 'text-danger' : '';

    tr.innerHTML = `
      <td>${fecha}</td>
      <td class="${tipoClass}">${tipo.toUpperCase()}</td>
      <td>${this.formatFondoName(mov.origen)}</td>
      <td>${this.formatFondoName(mov.destino)}</td>
      <td>$${mov.monto.toLocaleString()}</td>
      <td>${mov.descripcion || '-'}</td>
    `;

    return tr;
  }

  /**
   * Formatear nombre de fondo
   */
  formatFondoName(fondo) {
    const map = {
      'ahorroAcumulado': 'Ahorro Acumulado',
      'gastosMayores': 'Gastos Mayores',
      'dineroOperacional': 'Dinero Operacional'
    };
    return map[fondo] || fondo || '-';
  }

  /**
   * Mostrar modal transferir
   */
  showTransferirModal() {
    const modal = document.getElementById('transferir-modal');
    if (!modal) return;

    const form = document.getElementById('transferir-form');
    if (form) {
      form.reset();
    }

    modal.style.display = 'block';
  }

  /**
   * Submit transferencia
   */
  async submitTransferencia(form) {
    const formData = new FormData(form);
    
    const data = {
      origen: formData.get('origen'),
      destino: formData.get('destino'),
      monto: parseFloat(formData.get('monto')),
      descripcion: formData.get('descripcion') || ''
    };

    // Validaciones
    if (data.origen === data.destino) {
      alert('El fondo origen y destino no pueden ser el mismo');
      return;
    }

    if (data.monto <= 0) {
      alert('El monto debe ser mayor a 0');
      return;
    }

    // Verificar saldo disponible
    const fondos = State.get('fondos');
    if (fondos && fondos[data.origen] < data.monto) {
      alert('Saldo insuficiente en el fondo origen');
      return;
    }

    try {
      await APIClient.transferirFondos(data);
      alert('Transferencia realizada exitosamente');
      this.closeModals();
      this.loadFondos();

    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }

  /**
   * Cerrar modales
   */
  closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.style.display = 'none';
    });
  }

  /**
   * Actualizar loading state
   */
  updateLoadingState(isLoading) {
    const section = document.getElementById('fondos-section');
    if (!section) return;

    if (isLoading) {
      section.classList.add('loading');
    } else {
      section.classList.remove('loading');
    }
  }

  /**
   * Mostrar error
   */
  showError(message) {
    console.error('Fondos error:', message);
  }

  /**
   * Cleanup
   */
  cleanup() {
    console.log('🧹 Cleaning up Fondos module...');
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];
    this.initialized = false;
  }
}

export default new FondosModule();
