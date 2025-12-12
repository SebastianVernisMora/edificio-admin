/**
 * Módulo Gastos Optimizado
 * Gestión de gastos con state management y event delegation
 */

import APIClient from '../core/api-client.js';
import State from '../core/state-manager.js';

class GastosModule {
  constructor() {
    this.initialized = false;
    this.filters = {
      mes: new Date().getMonth() + 1,
      anio: new Date().getFullYear(),
      categoria: 'TODOS'
    };
    this.unsubscribers = [];
  }

  /**
   * Inicializar módulo
   */
  async init() {
    if (this.initialized) {
      console.log('Gastos module already initialized');
      return;
    }

    console.log('🎬 Initializing Gastos module...');

    this.setupEventListeners();
    this.subscribeToState();
    await this.loadInitialData();

    this.initialized = true;
    console.log('✅ Gastos module initialized');
  }

  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    document.addEventListener('click', this.handleClick.bind(this));
    document.addEventListener('change', this.handleChange.bind(this));
    document.addEventListener('submit', this.handleSubmit.bind(this));
  }

  /**
   * Suscribirse a estado
   */
  subscribeToState() {
    const unsubGastos = State.subscribe('gastos', (gastos) => {
      this.renderGastosTable(gastos);
    });

    const unsubLoading = State.subscribe('loading', (loading) => {
      this.updateLoadingState(loading.gastos);
    });

    const unsubErrors = State.subscribe('errors', (errors) => {
      if (errors.gastos) this.showError(errors.gastos);
    });

    this.unsubscribers.push(unsubGastos, unsubLoading, unsubErrors);
  }

  /**
   * Cargar datos iniciales
   */
  async loadInitialData() {
    await Promise.all([
      this.loadGastos(),
      this.loadFondosForDropdown()
    ]);
  }

  /**
   * Cargar gastos
   */
  async loadGastos() {
    State.setLoading('gastos', true);

    try {
      const params = {};
      if (this.filters.mes) params.mes = this.filters.mes;
      if (this.filters.anio) params.anio = this.filters.anio;
      if (this.filters.categoria !== 'TODOS') params.categoria = this.filters.categoria;

      const data = await APIClient.getGastos(params);
      State.set('gastos', data.gastos || []);

    } catch (error) {
      State.setError('gastos', error.message);
    } finally {
      State.setLoading('gastos', false);
    }
  }

  /**
   * Cargar fondos para dropdown
   */
  async loadFondosForDropdown() {
    try {
      const data = await APIClient.getFondos();
      State.set('fondos', data.fondos || data);
    } catch (error) {
      console.error('Error loading fondos:', error);
    }
  }

  /**
   * Handler de clicks
   */
  handleClick(e) {
    const target = e.target;

    if (target.id === 'nuevo-gasto-btn') {
      e.preventDefault();
      this.showNuevoGastoModal();
    }
    else if (target.closest('[data-action="edit-gasto"]')) {
      e.preventDefault();
      const btn = target.closest('[data-action="edit-gasto"]');
      const gastoId = btn.dataset.id;
      this.editGasto(gastoId);
    }
    else if (target.closest('[data-action="delete-gasto"]')) {
      e.preventDefault();
      const btn = target.closest('[data-action="delete-gasto"]');
      const gastoId = btn.dataset.id;
      this.deleteGasto(gastoId);
    }
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

    if (['gastos-mes', 'gastos-año', 'gastos-categoria'].includes(target.id)) {
      this.updateFilters();
    }
  }

  /**
   * Handler de submit
   */
  handleSubmit(e) {
    const form = e.target;

    if (form.id === 'gasto-form') {
      e.preventDefault();
      this.submitGasto(form);
    }
  }

  /**
   * Actualizar filtros
   */
  updateFilters() {
    this.filters = {
      mes: document.getElementById('gastos-mes')?.value || '',
      anio: document.getElementById('gastos-año')?.value || '',
      categoria: document.getElementById('gastos-categoria')?.value || 'TODOS'
    };

    console.log('Filters updated:', this.filters);
    this.loadGastos();
  }

  /**
   * Renderizar tabla
   */
  renderGastosTable(gastos) {
    const tbody = document.querySelector('#gastos-table tbody');
    if (!tbody) return;

    if (!gastos || gastos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay gastos registrados</td></tr>';
      return;
    }

    const fragment = document.createDocumentFragment();

    gastos.forEach(gasto => {
      const tr = this.createGastoRow(gasto);
      fragment.appendChild(tr);
    });

    tbody.innerHTML = '';
    tbody.appendChild(fragment);
  }

  /**
   * Crear fila de gasto
   */
  createGastoRow(gasto) {
    const tr = document.createElement('tr');
    
    const fecha = new Date(gasto.fecha).toLocaleDateString('es-MX');
    const categoriaClass = this.getCategoriaClass(gasto.categoria);

    tr.innerHTML = `
      <td>${fecha}</td>
      <td>${gasto.concepto}</td>
      <td>$${gasto.monto.toLocaleString()}</td>
      <td><span class="badge ${categoriaClass}">${gasto.categoria}</span></td>
      <td>${gasto.proveedor || '-'}</td>
      <td>
        <button class="btn btn-sm btn-secondary" data-action="edit-gasto" data-id="${gasto.id}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger" data-action="delete-gasto" data-id="${gasto.id}">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;

    return tr;
  }

  /**
   * Obtener clase de categoría
   */
  getCategoriaClass(categoria) {
    const map = {
      'MANTENIMIENTO': 'badge-info',
      'SERVICIOS': 'badge-primary',
      'REPARACIONES': 'badge-warning',
      'ADMINISTRATIVO': 'badge-secondary',
      'OTROS': 'badge-light'
    };
    return map[categoria] || 'badge-secondary';
  }

  /**
   * Mostrar modal nuevo gasto
   */
  showNuevoGastoModal() {
    const modal = document.getElementById('gasto-modal');
    if (!modal) return;

    const form = document.getElementById('gasto-form');
    if (form) {
      form.reset();
      document.getElementById('gasto-id').value = '';
      document.getElementById('gasto-modal-title').textContent = 'Nuevo Gasto';
      
      // Fecha actual
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('gasto-fecha').value = today;
    }

    modal.style.display = 'block';
  }

  /**
   * Editar gasto
   */
  editGasto(gastoId) {
    const gastos = State.get('gastos');
    const gasto = gastos.find(g => g.id === parseInt(gastoId));
    
    if (!gasto) {
      alert('Gasto no encontrado');
      return;
    }

    const modal = document.getElementById('gasto-modal');
    if (!modal) return;

    // Llenar form
    document.getElementById('gasto-id').value = gasto.id;
    document.getElementById('gasto-concepto').value = gasto.concepto;
    document.getElementById('gasto-monto').value = gasto.monto;
    document.getElementById('gasto-categoria').value = gasto.categoria;
    document.getElementById('gasto-proveedor').value = gasto.proveedor || '';
    document.getElementById('gasto-fecha').value = gasto.fecha.split('T')[0];
    document.getElementById('gasto-fondo').value = gasto.fondo || 'dineroOperacional';
    document.getElementById('gasto-comprobante').value = gasto.comprobante || '';
    document.getElementById('gasto-notas').value = gasto.notas || '';
    
    document.getElementById('gasto-modal-title').textContent = 'Editar Gasto';

    modal.style.display = 'block';
  }

  /**
   * Eliminar gasto
   */
  async deleteGasto(gastoId) {
    if (!confirm('¿Está seguro de eliminar este gasto?')) return;

    try {
      await APIClient.request(`/gastos/${gastoId}`, {
        method: 'DELETE',
        cache: false
      });

      alert('Gasto eliminado exitosamente');
      this.loadGastos();
      
      // Recargar fondos (afectados por el gasto)
      this.loadFondosForDropdown();

    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }

  /**
   * Submit gasto
   */
  async submitGasto(form) {
    const formData = new FormData(form);
    const gastoId = formData.get('gasto-id');
    
    const data = {
      concepto: formData.get('concepto'),
      monto: parseFloat(formData.get('monto')),
      categoria: formData.get('categoria'),
      proveedor: formData.get('proveedor'),
      fecha: formData.get('fecha'),
      fondo: formData.get('fondo'),
      comprobante: formData.get('comprobante'),
      notas: formData.get('notas')
    };

    try {
      if (gastoId) {
        // Actualizar
        await APIClient.request(`/gastos/${gastoId}`, {
          method: 'PUT',
          body: data,
          cache: false
        });
        alert('Gasto actualizado exitosamente');
      } else {
        // Crear
        await APIClient.createGasto(data);
        alert('Gasto creado exitosamente');
      }

      this.closeModals();
      this.loadGastos();
      this.loadFondosForDropdown();

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
    const section = document.getElementById('gastos-section');
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
    console.error('Gastos error:', message);
  }

  /**
   * Cleanup
   */
  cleanup() {
    console.log('🧹 Cleaning up Gastos module...');
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];
    this.initialized = false;
  }
}

export default new GastosModule();
