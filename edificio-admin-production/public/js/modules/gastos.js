// Gastos Module
const GastosModule = (() => {
  
  // Module state
  let gastosData = [];
  let currentFilters = {};
  
  // Load gastos with filters
  const loadGastos = async (filters = {}) => {
    try {
      Utils.showLoading('gastos-table-body');
      
      currentFilters = { ...filters };
      const data = await DBClient.gastos.getAll(filters);
      gastosData = data.gastos || [];
      
      renderGastos();
      updateGastosStats();
      
    } catch (error) {
      console.error('Error loading gastos:', error);
      Utils.showAlert('Error al cargar gastos', 'error');
    }
  };

  // Render gastos table
  const renderGastos = () => {
    const tbody = document.getElementById('gastos-table-body');
    if (!tbody) return;

    if (gastosData.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">No hay gastos registrados</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = gastosData.map(gasto => `
      <tr>
        <td>${Utils.formatDate(gasto.fecha)}</td>
        <td>${gasto.descripcion}</td>
        <td>
          <span class="badge badge-${getCategoryBadgeClass(gasto.categoria)}">
            ${getCategoryName(gasto.categoria)}
          </span>
        </td>
        <td>${Utils.formatCurrency(gasto.monto)}</td>
        <td>${gasto.proveedor || '-'}</td>
        <td>
          ${gasto.comprobante ? `
            <a href="${gasto.comprobante}" target="_blank" class="btn btn-sm btn-outline">
              <i class="fas fa-file"></i> Ver
            </a>
          ` : '-'}
        </td>
        <td class="actions">
          <button class="btn btn-sm btn-outline" onclick="GastosModule.editGasto(${gasto.id})" title="Editar gasto">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="GastosModule.deleteGasto(${gasto.id})" title="Eliminar gasto">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  };

  // Update gastos statistics
  const updateGastosStats = () => {
    const stats = gastosData.reduce((acc, gasto) => {
      acc.total++;
      acc.montoTotal += gasto.monto;
      acc.categorias[gasto.categoria] = (acc.categorias[gasto.categoria] || 0) + gasto.monto;
      return acc;
    }, { total: 0, montoTotal: 0, categorias: {} });

    // Update summary if exists
    const summaryEl = document.getElementById('gastos-summary');
    if (summaryEl) {
      summaryEl.innerHTML = `
        <div class="summary-item">
          <span class="label">Total Gastos:</span>
          <span class="value">${stats.total}</span>
        </div>
        <div class="summary-item">
          <span class="label">Monto Total:</span>
          <span class="value">${Utils.formatCurrency(stats.montoTotal)}</span>
        </div>
      `;
    }
  };

  // Show add gasto modal
  const showAddGastoModal = () => {
    const modalHtml = `
      <div class="modal-overlay" id="addGastoModal" style="display: block;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Registrar Nuevo Gasto</h3>
            <button class="modal-close" onclick="Utils.hideModal('addGastoModal')">&times;</button>
          </div>
          <div class="modal-body">
            <form id="addGastoForm">
              <div class="form-group">
                <label for="gasto-fecha">Fecha:</label>
                <input type="date" id="gasto-fecha" value="${new Date().toISOString().split('T')[0]}" required>
              </div>
              
              <div class="form-group">
                <label for="gasto-descripcion">Descripción:</label>
                <input type="text" id="gasto-descripcion" placeholder="Descripción del gasto" required>
              </div>
              
              <div class="form-group">
                <label for="gasto-categoria">Categoría:</label>
                <select id="gasto-categoria" required>
                  <option value="">Seleccionar categoría</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="limpieza">Limpieza</option>
                  <option value="seguridad">Seguridad</option>
                  <option value="servicios">Servicios</option>
                  <option value="reparaciones">Reparaciones</option>
                  <option value="otros">Otros</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="gasto-monto">Monto:</label>
                <input type="number" id="gasto-monto" step="0.01" placeholder="0.00" required>
              </div>
              
              <div class="form-group">
                <label for="gasto-proveedor">Proveedor:</label>
                <input type="text" id="gasto-proveedor" placeholder="Nombre del proveedor">
              </div>
              
              <div class="form-group">
                <label for="gasto-comprobante">Comprobante:</label>
                <input type="file" id="gasto-comprobante" accept="image/*,application/pdf">
                <small>Archivo de imagen o PDF (opcional)</small>
              </div>
              
              <div class="form-group">
                <label for="gasto-notas">Notas:</label>
                <textarea id="gasto-notas" rows="3" placeholder="Observaciones adicionales"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="Utils.hideModal('addGastoModal')">Cancelar</button>
            <button class="btn btn-primary" onclick="GastosModule.saveGasto()">Registrar Gasto</button>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal
    const existingModal = document.getElementById('addGastoModal');
    if (existingModal) existingModal.remove();

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  };

  // Save gasto
  const saveGasto = async () => {
    try {
      const gastoData = {
        fecha: document.getElementById('gasto-fecha').value,
        descripcion: document.getElementById('gasto-descripcion').value,
        categoria: document.getElementById('gasto-categoria').value,
        monto: parseFloat(document.getElementById('gasto-monto').value),
        proveedor: document.getElementById('gasto-proveedor').value,
        notas: document.getElementById('gasto-notas').value
      };

      // Validate required fields
      if (!gastoData.fecha || !gastoData.descripcion || !gastoData.categoria || !gastoData.monto) {
        Utils.showAlert('Todos los campos obligatorios deben ser completados', 'warning');
        return;
      }

      // Handle file upload if present
      const fileInput = document.getElementById('gasto-comprobante');
      if (fileInput.files.length > 0) {
        // In a real implementation, you would upload the file first
        // and get the URL back, then include it in gastoData
        gastoData.comprobante = `uploads/comprobantes/${Date.now()}_${fileInput.files[0].name}`;
      }

      await DBClient.gastos.create(gastoData);
      
      Utils.showAlert('Gasto registrado correctamente', 'success');
      Utils.hideModal('addGastoModal');
      loadGastos(currentFilters);
      
    } catch (error) {
      console.error('Error saving gasto:', error);
      Utils.showAlert('Error al registrar gasto', 'error');
    }
  };

  // Edit gasto
  const editGasto = (gastoId) => {
    const gasto = gastosData.find(g => g.id === gastoId);
    if (!gasto) return;

    showEditGastoModal(gasto);
  };

  // Show edit gasto modal
  const showEditGastoModal = (gasto) => {
    const modalHtml = `
      <div class="modal-overlay" id="editGastoModal" style="display: block;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Editar Gasto</h3>
            <button class="modal-close" onclick="Utils.hideModal('editGastoModal')">&times;</button>
          </div>
          <div class="modal-body">
            <form id="editGastoForm">
              <div class="form-group">
                <label for="edit-gasto-fecha">Fecha:</label>
                <input type="date" id="edit-gasto-fecha" value="${gasto.fecha?.split('T')[0]}" required>
              </div>
              
              <div class="form-group">
                <label for="edit-gasto-descripcion">Descripción:</label>
                <input type="text" id="edit-gasto-descripcion" value="${gasto.descripcion}" required>
              </div>
              
              <div class="form-group">
                <label for="edit-gasto-categoria">Categoría:</label>
                <select id="edit-gasto-categoria" required>
                  <option value="">Seleccionar categoría</option>
                  <option value="mantenimiento" ${gasto.categoria === 'mantenimiento' ? 'selected' : ''}>Mantenimiento</option>
                  <option value="limpieza" ${gasto.categoria === 'limpieza' ? 'selected' : ''}>Limpieza</option>
                  <option value="seguridad" ${gasto.categoria === 'seguridad' ? 'selected' : ''}>Seguridad</option>
                  <option value="servicios" ${gasto.categoria === 'servicios' ? 'selected' : ''}>Servicios</option>
                  <option value="reparaciones" ${gasto.categoria === 'reparaciones' ? 'selected' : ''}>Reparaciones</option>
                  <option value="otros" ${gasto.categoria === 'otros' ? 'selected' : ''}>Otros</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="edit-gasto-monto">Monto:</label>
                <input type="number" id="edit-gasto-monto" value="${gasto.monto}" step="0.01" required>
              </div>
              
              <div class="form-group">
                <label for="edit-gasto-proveedor">Proveedor:</label>
                <input type="text" id="edit-gasto-proveedor" value="${gasto.proveedor || ''}">
              </div>
              
              <div class="form-group">
                <label for="edit-gasto-notas">Notas:</label>
                <textarea id="edit-gasto-notas" rows="3">${gasto.notas || ''}</textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="Utils.hideModal('editGastoModal')">Cancelar</button>
            <button class="btn btn-primary" onclick="GastosModule.updateGasto(${gasto.id})">Actualizar</button>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal
    const existingModal = document.getElementById('editGastoModal');
    if (existingModal) existingModal.remove();

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  };

  // Update gasto
  const updateGasto = async (gastoId) => {
    try {
      const updateData = {
        fecha: document.getElementById('edit-gasto-fecha').value,
        descripcion: document.getElementById('edit-gasto-descripcion').value,
        categoria: document.getElementById('edit-gasto-categoria').value,
        monto: parseFloat(document.getElementById('edit-gasto-monto').value),
        proveedor: document.getElementById('edit-gasto-proveedor').value,
        notas: document.getElementById('edit-gasto-notas').value
      };

      await DBClient.gastos.update(gastoId, updateData);
      
      Utils.showAlert('Gasto actualizado correctamente', 'success');
      Utils.hideModal('editGastoModal');
      loadGastos(currentFilters);
      
    } catch (error) {
      console.error('Error updating gasto:', error);
      Utils.showAlert('Error al actualizar gasto', 'error');
    }
  };

  // Delete gasto
  const deleteGasto = async (gastoId) => {
    const gasto = gastosData.find(g => g.id === gastoId);
    if (!gasto) return;

    if (confirm(`¿Estás seguro de que quieres eliminar el gasto "${gasto.descripcion}"?`)) {
      try {
        await DBClient.gastos.delete(gastoId);
        
        Utils.showAlert('Gasto eliminado correctamente', 'success');
        loadGastos(currentFilters);
        
      } catch (error) {
        console.error('Error deleting gasto:', error);
        Utils.showAlert('Error al eliminar gasto', 'error');
      }
    }
  };

  // Helper functions
  const getCategoryName = (categoria) => {
    const categories = {
      mantenimiento: 'Mantenimiento',
      limpieza: 'Limpieza',
      seguridad: 'Seguridad',
      servicios: 'Servicios',
      reparaciones: 'Reparaciones',
      otros: 'Otros'
    };
    return categories[categoria] || categoria;
  };

  const getCategoryBadgeClass = (categoria) => {
    const classes = {
      mantenimiento: 'primary',
      limpieza: 'success',
      seguridad: 'warning',
      servicios: 'info',
      reparaciones: 'danger',
      otros: 'secondary'
    };
    return classes[categoria] || 'secondary';
  };

  // Initialize filters
  const initializeFilters = () => {
    const dateFromFilter = document.getElementById('gastos-date-from');
    const dateToFilter = document.getElementById('gastos-date-to');
    const categoryFilter = document.getElementById('gastos-category-filter');

    if (dateFromFilter) {
      dateFromFilter.addEventListener('change', applyFilters);
    }
    if (dateToFilter) {
      dateToFilter.addEventListener('change', applyFilters);
    }
    if (categoryFilter) {
      categoryFilter.addEventListener('change', applyFilters);
    }
  };

  // Apply filters
  const applyFilters = () => {
    const filters = {};
    
    const dateFromFilter = document.getElementById('gastos-date-from');
    const dateToFilter = document.getElementById('gastos-date-to');
    const categoryFilter = document.getElementById('gastos-category-filter');

    if (dateFromFilter && dateFromFilter.value) {
      filters.fecha_desde = dateFromFilter.value;
    }
    if (dateToFilter && dateToFilter.value) {
      filters.fecha_hasta = dateToFilter.value;
    }
    if (categoryFilter && categoryFilter.value) {
      filters.categoria = categoryFilter.value;
    }

    loadGastos(filters);
  };

  // Initialize module
  const init = () => {
    initializeFilters();
  };

  // Public API
  return {
    loadGastos,
    showAddGastoModal,
    saveGasto,
    editGasto,
    updateGasto,
    deleteGasto,
    init
  };
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', GastosModule.init);