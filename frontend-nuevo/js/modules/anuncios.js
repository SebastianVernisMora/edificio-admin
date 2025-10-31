// Anuncios Module
const AnunciosModule = (() => {
  
  // Module state
  let anunciosData = [];
  let currentFilters = {};
  
  // Load anuncios with filters
  const loadAnuncios = async (filters = {}) => {
    try {
      Utils.showLoading('anuncios-table-body');
      
      currentFilters = { ...filters };
      const data = await DBClient.anuncios.getAll(filters);
      anunciosData = data.anuncios || [];
      
      renderAnuncios();
      
    } catch (error) {
      console.error('Error loading anuncios:', error);
      Utils.showAlert('Error al cargar anuncios', 'error');
    }
  };

  // Render anuncios table
  const renderAnuncios = () => {
    const tbody = document.getElementById('anuncios-table-body');
    if (!tbody) return;

    if (anunciosData.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center">No hay anuncios registrados</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = anunciosData.map(anuncio => `
      <tr>
        <td>
          <strong>${anuncio.titulo}</strong>
          ${anuncio.importante ? '<span class="badge badge-danger ml-2">Importante</span>' : ''}
        </td>
        <td>
          <span class="badge badge-${getTypeBadgeClass(anuncio.tipo)}">
            ${getTypeName(anuncio.tipo)}
          </span>
        </td>
        <td>${Utils.formatDate(anuncio.fecha_publicacion)}</td>
        <td>${anuncio.fecha_vencimiento ? Utils.formatDate(anuncio.fecha_vencimiento) : '-'}</td>
        <td>
          <span class="badge badge-${anuncio.activo ? 'success' : 'secondary'}">
            ${anuncio.activo ? 'Activo' : 'Inactivo'}
          </span>
        </td>
        <td class="actions">
          <button class="btn btn-sm btn-info" onclick="AnunciosModule.viewAnuncio(${anuncio.id})" title="Ver anuncio">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-sm btn-outline" onclick="AnunciosModule.editAnuncio(${anuncio.id})" title="Editar anuncio">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-${anuncio.activo ? 'warning' : 'success'}" onclick="AnunciosModule.toggleStatus(${anuncio.id})" title="${anuncio.activo ? 'Desactivar' : 'Activar'}">
            <i class="fas fa-${anuncio.activo ? 'pause' : 'play'}"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="AnunciosModule.deleteAnuncio(${anuncio.id})" title="Eliminar anuncio">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  };

  // Show add anuncio modal
  const showAddAnuncioModal = () => {
    const modalHtml = `
      <div class="modal-overlay" id="addAnuncioModal" style="display: block;">
        <div class="modal-content modal-large">
          <div class="modal-header">
            <h3>Crear Nuevo Anuncio</h3>
            <button class="modal-close" onclick="Utils.hideModal('addAnuncioModal')">&times;</button>
          </div>
          <div class="modal-body">
            <form id="addAnuncioForm">
              <div class="form-group">
                <label for="anuncio-titulo">Título:</label>
                <input type="text" id="anuncio-titulo" placeholder="Título del anuncio" required>
              </div>
              
              <div class="form-group">
                <label for="anuncio-contenido">Contenido:</label>
                <textarea id="anuncio-contenido" rows="6" placeholder="Contenido del anuncio..." required></textarea>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="anuncio-tipo">Tipo:</label>
                  <select id="anuncio-tipo" required>
                    <option value="">Seleccionar tipo</option>
                    <option value="general">General</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="reunion">Reunión</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="anuncio-fecha-publicacion">Fecha Publicación:</label>
                  <input type="date" id="anuncio-fecha-publicacion" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
              </div>
              
              <div class="form-group">
                <label for="anuncio-fecha-vencimiento">Fecha Vencimiento:</label>
                <input type="date" id="anuncio-fecha-vencimiento">
                <small>Opcional - Fecha hasta la cual el anuncio será visible</small>
              </div>
              
              <div class="form-group">
                <div class="checkbox-group">
                  <label style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="anuncio-importante"> Marcar como importante
                  </label>
                  <label style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="anuncio-activo" checked> Publicar inmediatamente
                  </label>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="Utils.hideModal('addAnuncioModal')">Cancelar</button>
            <button class="btn btn-primary" onclick="AnunciosModule.saveAnuncio()">Crear Anuncio</button>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal
    const existingModal = document.getElementById('addAnuncioModal');
    if (existingModal) existingModal.remove();

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  };

  // Save anuncio
  const saveAnuncio = async () => {
    try {
      const anuncioData = {
        titulo: document.getElementById('anuncio-titulo').value,
        contenido: document.getElementById('anuncio-contenido').value,
        tipo: document.getElementById('anuncio-tipo').value,
        fecha_publicacion: document.getElementById('anuncio-fecha-publicacion').value,
        fecha_vencimiento: document.getElementById('anuncio-fecha-vencimiento').value || null,
        importante: document.getElementById('anuncio-importante').checked,
        activo: document.getElementById('anuncio-activo').checked
      };

      // Validate required fields
      if (!anuncioData.titulo || !anuncioData.contenido || !anuncioData.tipo) {
        Utils.showAlert('Todos los campos obligatorios deben ser completados', 'warning');
        return;
      }

      await DBClient.anuncios.create(anuncioData);
      
      Utils.showAlert('Anuncio creado correctamente', 'success');
      Utils.hideModal('addAnuncioModal');
      loadAnuncios(currentFilters);
      
    } catch (error) {
      console.error('Error saving anuncio:', error);
      Utils.showAlert('Error al crear anuncio', 'error');
    }
  };

  // View anuncio
  const viewAnuncio = (anuncioId) => {
    const anuncio = anunciosData.find(a => a.id === anuncioId);
    if (!anuncio) return;

    const modalHtml = `
      <div class="modal-overlay" id="viewAnuncioModal" style="display: block;">
        <div class="modal-content modal-large">
          <div class="modal-header">
            <h3>${anuncio.titulo}</h3>
            <button class="modal-close" onclick="Utils.hideModal('viewAnuncioModal')">&times;</button>
          </div>
          <div class="modal-body">
            <div class="anuncio-meta">
              <div class="meta-item">
                <span class="badge badge-${getTypeBadgeClass(anuncio.tipo)}">
                  ${getTypeName(anuncio.tipo)}
                </span>
                ${anuncio.importante ? '<span class="badge badge-danger ml-2">Importante</span>' : ''}
                <span class="badge badge-${anuncio.activo ? 'success' : 'secondary'} ml-2">
                  ${anuncio.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div class="meta-item">
                <small class="text-muted">
                  Publicado: ${Utils.formatDate(anuncio.fecha_publicacion)}
                  ${anuncio.fecha_vencimiento ? ` | Vence: ${Utils.formatDate(anuncio.fecha_vencimiento)}` : ''}
                </small>
              </div>
            </div>
            
            <div class="anuncio-content">
              <p>${anuncio.contenido.replace(/\n/g, '<br>')}</p>
            </div>
            
            ${anuncio.archivo_adjunto ? `
              <div class="anuncio-attachment">
                <h5>Archivo Adjunto:</h5>
                <a href="${anuncio.archivo_adjunto}" target="_blank" class="btn btn-outline">
                  <i class="fas fa-download"></i> Descargar
                </a>
              </div>
            ` : ''}
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="Utils.hideModal('viewAnuncioModal')">Cerrar</button>
            <button class="btn btn-primary" onclick="AnunciosModule.editAnuncio(${anuncio.id}); Utils.hideModal('viewAnuncioModal')">Editar</button>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal
    const existingModal = document.getElementById('viewAnuncioModal');
    if (existingModal) existingModal.remove();

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  };

  // Edit anuncio
  const editAnuncio = (anuncioId) => {
    const anuncio = anunciosData.find(a => a.id === anuncioId);
    if (!anuncio) return;

    const modalHtml = `
      <div class="modal-overlay" id="editAnuncioModal" style="display: block;">
        <div class="modal-content modal-large">
          <div class="modal-header">
            <h3>Editar Anuncio</h3>
            <button class="modal-close" onclick="Utils.hideModal('editAnuncioModal')">&times;</button>
          </div>
          <div class="modal-body">
            <form id="editAnuncioForm">
              <div class="form-group">
                <label for="edit-anuncio-titulo">Título:</label>
                <input type="text" id="edit-anuncio-titulo" value="${anuncio.titulo}" required>
              </div>
              
              <div class="form-group">
                <label for="edit-anuncio-contenido">Contenido:</label>
                <textarea id="edit-anuncio-contenido" rows="6" required>${anuncio.contenido}</textarea>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="edit-anuncio-tipo">Tipo:</label>
                  <select id="edit-anuncio-tipo" required>
                    <option value="">Seleccionar tipo</option>
                    <option value="general" ${anuncio.tipo === 'general' ? 'selected' : ''}>General</option>
                    <option value="mantenimiento" ${anuncio.tipo === 'mantenimiento' ? 'selected' : ''}>Mantenimiento</option>
                    <option value="reunion" ${anuncio.tipo === 'reunion' ? 'selected' : ''}>Reunión</option>
                    <option value="urgente" ${anuncio.tipo === 'urgente' ? 'selected' : ''}>Urgente</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="edit-anuncio-fecha-publicacion">Fecha Publicación:</label>
                  <input type="date" id="edit-anuncio-fecha-publicacion" value="${anuncio.fecha_publicacion?.split('T')[0]}" required>
                </div>
              </div>
              
              <div class="form-group">
                <label for="edit-anuncio-fecha-vencimiento">Fecha Vencimiento:</label>
                <input type="date" id="edit-anuncio-fecha-vencimiento" value="${anuncio.fecha_vencimiento?.split('T')[0] || ''}">
              </div>
              
              <div class="form-group">
                <div class="checkbox-group">
                  <label style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="edit-anuncio-importante" ${anuncio.importante ? 'checked' : ''}> Marcar como importante
                  </label>
                  <label style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="edit-anuncio-activo" ${anuncio.activo ? 'checked' : ''}> Mantener activo
                  </label>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="Utils.hideModal('editAnuncioModal')">Cancelar</button>
            <button class="btn btn-primary" onclick="AnunciosModule.updateAnuncio(${anuncio.id})">Actualizar</button>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal
    const existingModal = document.getElementById('editAnuncioModal');
    if (existingModal) existingModal.remove();

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  };

  // Update anuncio
  const updateAnuncio = async (anuncioId) => {
    try {
      const updateData = {
        titulo: document.getElementById('edit-anuncio-titulo').value,
        contenido: document.getElementById('edit-anuncio-contenido').value,
        tipo: document.getElementById('edit-anuncio-tipo').value,
        fecha_publicacion: document.getElementById('edit-anuncio-fecha-publicacion').value,
        fecha_vencimiento: document.getElementById('edit-anuncio-fecha-vencimiento').value || null,
        importante: document.getElementById('edit-anuncio-importante').checked,
        activo: document.getElementById('edit-anuncio-activo').checked
      };

      await DBClient.anuncios.update(anuncioId, updateData);
      
      Utils.showAlert('Anuncio actualizado correctamente', 'success');
      Utils.hideModal('editAnuncioModal');
      loadAnuncios(currentFilters);
      
    } catch (error) {
      console.error('Error updating anuncio:', error);
      Utils.showAlert('Error al actualizar anuncio', 'error');
    }
  };

  // Toggle anuncio status
  const toggleStatus = async (anuncioId) => {
    try {
      await DBClient.anuncios.toggleStatus(anuncioId);
      
      const anuncio = anunciosData.find(a => a.id === anuncioId);
      const newStatus = anuncio ? !anuncio.activo : true;
      
      Utils.showAlert(`Anuncio ${newStatus ? 'activado' : 'desactivado'} correctamente`, 'success');
      loadAnuncios(currentFilters);
      
    } catch (error) {
      console.error('Error toggling anuncio status:', error);
      Utils.showAlert('Error al cambiar estado del anuncio', 'error');
    }
  };

  // Delete anuncio
  const deleteAnuncio = async (anuncioId) => {
    const anuncio = anunciosData.find(a => a.id === anuncioId);
    if (!anuncio) return;

    if (confirm(`¿Estás seguro de que quieres eliminar el anuncio "${anuncio.titulo}"?`)) {
      try {
        await DBClient.anuncios.delete(anuncioId);
        
        Utils.showAlert('Anuncio eliminado correctamente', 'success');
        loadAnuncios(currentFilters);
        
      } catch (error) {
        console.error('Error deleting anuncio:', error);
        Utils.showAlert('Error al eliminar anuncio', 'error');
      }
    }
  };

  // Helper functions
  const getTypeName = (tipo) => {
    const types = {
      general: 'General',
      mantenimiento: 'Mantenimiento',
      reunion: 'Reunión',
      urgente: 'Urgente'
    };
    return types[tipo] || tipo;
  };

  const getTypeBadgeClass = (tipo) => {
    const classes = {
      general: 'primary',
      mantenimiento: 'warning',
      reunion: 'info',
      urgente: 'danger'
    };
    return classes[tipo] || 'secondary';
  };

  // Initialize filters
  const initializeFilters = () => {
    const typeFilter = document.getElementById('anuncios-type-filter');
    const statusFilter = document.getElementById('anuncios-status-filter');

    if (typeFilter) {
      typeFilter.addEventListener('change', applyFilters);
    }
    if (statusFilter) {
      statusFilter.addEventListener('change', applyFilters);
    }
  };

  // Apply filters
  const applyFilters = () => {
    const filters = {};
    
    const typeFilter = document.getElementById('anuncios-type-filter');
    const statusFilter = document.getElementById('anuncios-status-filter');

    if (typeFilter && typeFilter.value) {
      filters.tipo = typeFilter.value;
    }
    if (statusFilter && statusFilter.value) {
      filters.activo = statusFilter.value === 'activo';
    }

    loadAnuncios(filters);
  };

  // Initialize module
  const init = () => {
    initializeFilters();
  };

  // Public API
  return {
    loadAnuncios,
    showAddAnuncioModal,
    saveAnuncio,
    viewAnuncio,
    editAnuncio,
    updateAnuncio,
    toggleStatus,
    deleteAnuncio,
    init
  };
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', AnunciosModule.init);