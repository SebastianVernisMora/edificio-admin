/**
 * Módulo Cuotas Optimizado
 * Gestión de cuotas con lazy loading y state management
 */

import APIClient from '../core/api-client.js';
import State from '../core/state-manager.js';

class CuotasModule {
  constructor() {
    this.initialized = false;
    this.filters = {
      mes: '',
      anio: new Date().getFullYear().toString(),
      estado: 'TODOS',
      departamento: ''
    };
    this.unsubscribers = [];
  }

  /**
   * Inicializar módulo
   */
  async init() {
    if (this.initialized) {
      console.log('Cuotas module already initialized');
      return;
    }

    console.log('🎬 Initializing Cuotas module...');

    this.setupEventListeners();
    this.subscribeToState();
    await this.loadInitialData();

    this.initialized = true;
    console.log('✅ Cuotas module initialized');
  }

  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    // Event delegation en document
    document.addEventListener('click', this.handleClick.bind(this));
    document.addEventListener('change', this.handleChange.bind(this));
    document.addEventListener('submit', this.handleSubmit.bind(this));
  }

  /**
   * Suscribirse a cambios de estado
   */
  subscribeToState() {
    // Cuotas
    const unsubCuotas = State.subscribe('cuotas', (cuotas) => {
      this.renderCuotasTable(cuotas);
    });

    // Loading
    const unsubLoading = State.subscribe('loading', (loading) => {
      this.updateLoadingState(loading.cuotas);
    });

    // Errors
    const unsubErrors = State.subscribe('errors', (errors) => {
      if (errors.cuotas) {
        this.showError(errors.cuotas);
      }
    });

    this.unsubscribers.push(unsubCuotas, unsubLoading, unsubErrors);
  }

  /**
   * Cargar datos iniciales
   */
  async loadInitialData() {
    await this.loadCuotas();
  }

  /**
   * Cargar cuotas con filtros
   */
  async loadCuotas() {
    State.setLoading('cuotas', true);

    try {
      const params = {};
      if (this.filters.mes) params.mes = this.filters.mes;
      if (this.filters.anio) params.anio = this.filters.anio;
      if (this.filters.estado !== 'TODOS') params.estado = this.filters.estado;
      if (this.filters.departamento) params.departamento = this.filters.departamento;

      const data = await APIClient.getCuotas(params);
      State.set('cuotas', data.cuotas || []);

    } catch (error) {
      State.setError('cuotas', error.message);
      console.error('Error loading cuotas:', error);
    } finally {
      State.setLoading('cuotas', false);
    }
  }

  /**
   * Handler de clicks
   */
  handleClick(e) {
    const target = e.target;

    // Botón nueva cuota
    if (target.id === 'nueva-cuota-btn') {
      e.preventDefault();
      this.showNuevaCuotaModal();
    }

    // Botón verificar vencimientos
    else if (target.id === 'verificar-vencimientos-btn') {
      e.preventDefault();
      this.verificarVencimientos();
    }

    // Botón validar pago
    else if (target.closest('[data-action="validar"]')) {
      e.preventDefault();
      const btn = target.closest('[data-action="validar"]');
      const cuotaId = btn.dataset.id;
      this.showValidarPagoModal(cuotaId);
    }

    // Cerrar modal
    else if (target.classList.contains('close') || target.classList.contains('modal-cancel')) {
      e.preventDefault();
      this.closeModals();
    }
  }

  /**
   * Handler de cambios
   */
  handleChange(e) {
    const target = e.target;

    // Filtros
    if (['cuotas-mes', 'cuotas-año', 'cuotas-estado'].includes(target.id)) {
      this.updateFilters();
    }
  }

  /**
   * Handler de submit
   */
  handleSubmit(e) {
    const form = e.target;

    // Form nueva cuota
    if (form.id === 'cuota-form') {
      e.preventDefault();
      this.submitNuevaCuota(form);
    }

    // Form validar pago
    else if (form.id === 'validar-pago-form') {
      e.preventDefault();
      this.submitValidarPago(form);
    }
  }

  /**
   * Actualizar filtros
   */
  updateFilters() {
    this.filters = {
      mes: document.getElementById('cuotas-mes')?.value || '',
      anio: document.getElementById('cuotas-año')?.value || '',
      estado: document.getElementById('cuotas-estado')?.value || 'TODOS',
      departamento: document.getElementById('cuotas-departamento')?.value || ''
    };

    console.log('Filters updated:', this.filters);
    this.loadCuotas();
  }

  /**
   * Renderizar tabla de cuotas
   */
  renderCuotasTable(cuotas) {
    const tbody = document.querySelector('#cuotas-table tbody');
    if (!tbody) return;

    if (!cuotas || cuotas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay cuotas registradas</td></tr>';
      return;
    }

    // Usar DocumentFragment para mejor performance
    const fragment = document.createDocumentFragment();

    cuotas.forEach(cuota => {
      const tr = this.createCuotaRow(cuota);
      fragment.appendChild(tr);
    });

    tbody.innerHTML = '';
    tbody.appendChild(fragment);
  }

  /**
   * Crear fila de cuota
   */
  createCuotaRow(cuota) {
    const tr = document.createElement('tr');
    
    let estadoClass = '';
    switch (cuota.estado) {
      case 'PAGADO': estadoClass = 'badge-success'; break;
      case 'PENDIENTE': estadoClass = 'badge-warning'; break;
      case 'VENCIDO': estadoClass = 'badge-danger'; break;
    }

    const vencimiento = new Date(cuota.fechaVencimiento);
    const fechaPago = cuota.fechaPago ? new Date(cuota.fechaPago).toLocaleDateString('es-MX') : '-';

    tr.innerHTML = `
      <td>${cuota.departamento}</td>
      <td>${cuota.mes} ${cuota.anio}</td>
      <td>$${cuota.monto.toLocaleString()}</td>
      <td><span class="badge ${estadoClass}">${cuota.estado}</span></td>
      <td>${vencimiento.toLocaleDateString('es-MX')}</td>
      <td>${fechaPago}</td>
      <td>
        <button class="btn btn-sm btn-primary" data-action="validar" data-id="${cuota.id}">
          Validar
        </button>
      </td>
    `;

    return tr;
  }

  /**
   * Mostrar modal nueva cuota
   */
  showNuevaCuotaModal() {
    const modal = document.getElementById('cuota-modal');
    if (!modal) return;

    // Reset form
    const form = document.getElementById('cuota-form');
    if (form) {
      form.reset();
      document.getElementById('cuota-id').value = '';
      document.getElementById('cuota-modal-title').textContent = 'Nueva Cuota';
      
      // Fecha vencimiento por defecto
      const today = new Date();
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      document.getElementById('cuota-vencimiento').value = lastDay.toISOString().split('T')[0];
    }

    modal.style.display = 'block';
  }

  /**
   * Mostrar modal validar pago
   */
  showValidarPagoModal(cuotaId) {
    const modal = document.getElementById('validar-pago-modal');
    if (!modal) return;

    const cuotas = State.get('cuotas');
    const cuota = cuotas.find(c => c.id === parseInt(cuotaId));
    
    if (!cuota) {
      alert('Cuota no encontrada');
      return;
    }

    // Llenar form
    document.getElementById('validar-cuota-id').value = cuota.id;
    document.getElementById('validar-estado').value = cuota.estado;
    document.getElementById('validar-fecha-pago').value = cuota.fechaPago || '';
    document.getElementById('validar-comprobante').value = cuota.comprobante || '';

    modal.style.display = 'block';
  }

  /**
   * Submit nueva cuota
   */
  async submitNuevaCuota(form) {
    const formData = new FormData(form);
    
    const data = {
      mes: formData.get('mes'),
      anio: parseInt(formData.get('anio')),
      monto: parseFloat(formData.get('monto')),
      departamento: formData.get('departamento'),
      fechaVencimiento: formData.get('vencimiento')
    };

    try {
      await APIClient.createCuota(data);
      this.closeModals();
      this.loadCuotas();
      alert('Cuota creada exitosamente');
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }

  /**
   * Submit validar pago
   */
  async submitValidarPago(form) {
    const formData = new FormData(form);
    const id = formData.get('cuota-id');
    
    const data = {
      estado: formData.get('estado'),
      fechaPago: formData.get('fecha-pago'),
      comprobante: formData.get('comprobante')
    };

    try {
      await APIClient.updateCuota(id, data);
      this.closeModals();
      this.loadCuotas();
      alert('Pago validado exitosamente');
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }

  /**
   * Verificar vencimientos
   */
  async verificarVencimientos() {
    if (!confirm('¿Verificar vencimientos de todas las cuotas?')) return;

    try {
      const result = await APIClient.verificarVencimientos();
      alert(`Vencimientos verificados:\n${result.actualizadas} cuotas actualizadas`);
      this.loadCuotas();
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
   * Actualizar estado de loading
   */
  updateLoadingState(isLoading) {
    const section = document.getElementById('cuotas-section');
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
    console.error('Cuotas error:', message);
    // Implementar toast o notificación
  }

  /**
   * Cleanup
   */
  cleanup() {
    console.log('🧹 Cleaning up Cuotas module...');
    
    // Unsubscribe de state
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];
    
    this.initialized = false;
  }
}

export default new CuotasModule();
