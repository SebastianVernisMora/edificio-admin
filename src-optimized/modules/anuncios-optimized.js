/**
 * Módulo Anuncios Optimizado
 * Gestión de anuncios con filtros
 */

import APIClient from '../core/api-client.js';
import State from '../core/state-manager.js';

class AnunciosModule {
  constructor() {
    this.initialized = false;
    this.filters = {
      tipo: 'TODOS'
    };
    this.unsubscribers = [];
  }

  /**
   * Inicializar módulo
   */
  async init() {
    if (this.initialized) {
      console.log('Anuncios module already initialized');
      return;
    }

    console.log('🎬 Initializing Anuncios module...');

    this.setupEventListeners();
    this.subscribeToState();
    await this.loadInitialData();

    this.initialized = true;
    console.log('✅ Anuncios module initialized');
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
    const unsubAnuncios = State.subscribe('anuncios', (anuncios) => {
      this.renderAnuncios(anuncios);
    });

    const unsubLoading = State.subscribe('loading', (loading) => {
      this.updateLoadingState(loading.anuncios);
    });

    const unsubErrors = State.subscribe('errors', (errors) => {
      if (errors.anuncios) this.showError(errors.anuncios);
    });

    this.unsubscribers.push(unsubAnuncios, unsubLoading, unsubErrors);
  }

  /**
   * Cargar datos iniciales
   */
  async loadInitialData() {
    await this.loadAnuncios();
  }

  /**
   * Cargar anuncios
   */
  async loadAnuncios() {
    State.setLoading('anuncios', true);

    try {
      const params = {};
      if (this.filters.tipo !== 'TODOS') params.tipo = this.filters.tipo;

      const data = await APIClient.getAnuncios(params);
      State.set('anuncios', data.anuncios || []);

    } catch (error) {
      State.setError('anuncios', error.message);
    } finally {
      State.setLoading('anuncios', false);
    }
  }

  /**
   * Handler de clicks
   */
  handleClick(e) {
    const target = e.target;

    if (target.id === 'nuevo-anuncio-btn') {
      e.preventDefault();
      this.showNuevoAnuncioModal();
    }
    else if (target.closest('[data-action="edit-anuncio"]')) {
      e.preventDefault();
      const btn = target.closest('[data-action="edit-anuncio"]');
      const anuncioId = btn.dataset.id;
      this.editAnuncio(anuncioId);
    }
    else if (target.closest('[data-action="delete-anuncio"]')) {
      e.preventDefault();
      const btn = target.closest('[data-action="delete-anuncio"]');
      const anuncioId = btn.dataset.id;
      this.deleteAnuncio(anuncioId);
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

    if (target.id === 'anuncios-tipo') {
      this.updateFilters();
    }
  }

  /**
   * Handler de submit
   */
  handleSubmit(e) {
    const form = e.target;

    if (form.id === 'anuncio-form') {
      e.preventDefault();
      this.submitAnuncio(form);
    }
  }

  /**
   * Actualizar filtros
   */
  updateFilters() {
    this.filters = {
      tipo: document.getElementById('anuncios-tipo')?.value || 'TODOS'
    };

    console.log('Filters updated:', this.filters);
    this.loadAnuncios();
  }

  /**
   * Renderizar anuncios
   */
  renderAnuncios(anuncios) {
    const container = document.getElementById('anuncios-list');
    if (!container) return;

    if (!anuncios || anuncios.length === 0) {
      container.innerHTML = '<p class="text-center">No hay anuncios disponibles</p>';
      return;
    }

    const fragment = document.createDocumentFragment();

    anuncios.forEach(anuncio => {
      const card = this.createAnuncioCard(anuncio);
      fragment.appendChild(card);
    });

    container.innerHTML = '';
    container.appendChild(fragment);
  }

  /**
   * Crear tarjeta de anuncio
   */
  createAnuncioCard(anuncio) {
    const div = document.createElement('div');
    div.className = 'anuncio-card';
    
    const tipoClass = this.getTipoClass(anuncio.tipo);
    const fecha = new Date(anuncio.fechaPublicacion || anuncio.createdAt).toLocaleDateString('es-MX');

    div.innerHTML = `
      <div class="anuncio-header">
        <div>
          <h4>${anuncio.titulo}</h4>
          <span class="badge ${tipoClass}">${anuncio.tipo}</span>
        </div>
        <div class="anuncio-actions">
          <button class="btn btn-sm btn-secondary" data-action="edit-anuncio" data-id="${anuncio.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger" data-action="delete-anuncio" data-id="${anuncio.id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="anuncio-body">
        <p>${anuncio.contenido}</p>
      </div>
      <div class="anuncio-footer">
        <small>Publicado: ${fecha}</small>
        ${anuncio.activo ? '<span class="badge badge-success">Activo</span>' : '<span class="badge badge-secondary">Inactivo</span>'}
      </div>
    `;

    return div;
  }

  /**
   * Obtener clase de tipo
   */
  getTipoClass(tipo) {
    const map = {
      'URGENTE': 'badge-danger',
      'IMPORTANTE': 'badge-warning',
      'GENERAL': 'badge-info',
      'REUNION': 'badge-primary',
      'MANTENIMIENTO': 'badge-secondary'
    };
    return map[tipo] || 'badge-secondary';
  }

  /**
   * Mostrar modal nuevo anuncio
   */
  showNuevoAnuncioModal() {
    const modal = document.getElementById('anuncio-modal');
    if (!modal) return;

    const form = document.getElementById('anuncio-form');
    if (form) {
      form.reset();
      document.getElementById('anuncio-id').value = '';
      document.getElementById('anuncio-modal-title').textContent = 'Nuevo Anuncio';
    }

    modal.style.display = 'block';
  }

  /**
   * Editar anuncio
   */
  editAnuncio(anuncioId) {
    const anuncios = State.get('anuncios');
    const anuncio = anuncios.find(a => a.id === parseInt(anuncioId));
    
    if (!anuncio) {
      alert('Anuncio no encontrado');
      return;
    }

    const modal = document.getElementById('anuncio-modal');
    if (!modal) return;

    // Llenar form
    document.getElementById('anuncio-id').value = anuncio.id;
    document.getElementById('anuncio-titulo').value = anuncio.titulo;
    document.getElementById('anuncio-tipo').value = anuncio.tipo;
    document.getElementById('anuncio-contenido').value = anuncio.contenido;
    
    document.getElementById('anuncio-modal-title').textContent = 'Editar Anuncio';

    modal.style.display = 'block';
  }

  /**
   * Eliminar anuncio
   */
  async deleteAnuncio(anuncioId) {
    if (!confirm('¿Está seguro de eliminar este anuncio?')) return;

    try {
      await APIClient.request(`/anuncios/${anuncioId}`, {
        method: 'DELETE',
        cache: false
      });

      alert('Anuncio eliminado exitosamente');
      this.loadAnuncios();

    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }

  /**
   * Submit anuncio
   */
  async submitAnuncio(form) {
    const formData = new FormData(form);
    const anuncioId = formData.get('anuncio-id');
    
    const data = {
      titulo: formData.get('titulo'),
      tipo: formData.get('tipo'),
      contenido: formData.get('contenido'),
      activo: true
    };

    try {
      if (anuncioId) {
        // Actualizar
        await APIClient.request(`/anuncios/${anuncioId}`, {
          method: 'PUT',
          body: data,
          cache: false
        });
        alert('Anuncio actualizado exitosamente');
      } else {
        // Crear
        await APIClient.createAnuncio(data);
        alert('Anuncio creado exitosamente');
      }

      this.closeModals();
      this.loadAnuncios();

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
    const section = document.getElementById('anuncios-section');
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
    console.error('Anuncios error:', message);
  }

  /**
   * Cleanup
   */
  cleanup() {
    console.log('🧹 Cleaning up Anuncios module...');
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];
    this.initialized = false;
  }
}

export default new AnunciosModule();
