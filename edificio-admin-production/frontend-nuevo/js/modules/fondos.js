// Fondos Module
const FondosModule = (() => {
  
  // Module state
  let fondosData = {};
  let movimientosData = [];
  let currentFilters = {};
  
  // Load fondos data
  const loadFondos = async () => {
    try {
      Utils.showLoading('fondos-table-body');
      
      // Load fondos balance and movements
      const [fondosResult, movimientosResult] = await Promise.all([
        DBClient.fondos.getBalance(),
        DBClient.fondos.getMovimientos(currentFilters)
      ]);
      
      fondosData = fondosResult.fondos || {};
      movimientosData = movimientosResult.movimientos || [];
      
      renderFondosBalance();
      renderMovimientos();
      
    } catch (error) {
      console.error('Error loading fondos:', error);
      Utils.showAlert('Error al cargar fondos', 'error');
    }
  };

  // Render fondos balance
  const renderFondosBalance = () => {
    const reservaEl = document.getElementById('fondo-reserva');
    const reparacionesEl = document.getElementById('fondo-reparaciones');
    const extraordinarioEl = document.getElementById('fondo-extraordinario');

    if (reservaEl) {
      reservaEl.textContent = Utils.formatCurrency(fondosData.reserva || 0);
    }
    if (reparacionesEl) {
      reparacionesEl.textContent = Utils.formatCurrency(fondosData.reparaciones || 0);
    }
    if (extraordinarioEl) {
      extraordinarioEl.textContent = Utils.formatCurrency(fondosData.extraordinario || 0);
    }
  };

  // Render movimientos table
  const renderMovimientos = () => {
    const tbody = document.getElementById('fondos-table-body');
    if (!tbody) return;

    if (movimientosData.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">No hay movimientos registrados</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = movimientosData.map(movimiento => `
      <tr>
        <td>${Utils.formatDate(movimiento.fecha)}</td>
        <td>
          <span class="badge badge-${getMovementTypeBadgeClass(movimiento.tipo)}">
            ${getMovementTypeName(movimiento.tipo)}
          </span>
        </td>
        <td>
          <span class="badge badge-${getFondoBadgeClass(movimiento.fondo)}">
            ${getFondoName(movimiento.fondo)}
          </span>
        </td>
        <td class="${movimiento.tipo === 'egreso' ? 'text-danger' : 'text-success'}">
          ${movimiento.tipo === 'egreso' ? '-' : '+'}${Utils.formatCurrency(movimiento.monto)}
        </td>
        <td>${movimiento.descripcion}</td>
        <td>${Utils.formatCurrency(movimiento.saldo_resultante)}</td>
        <td class="actions">
          <button class="btn btn-sm btn-info" onclick="FondosModule.viewMovimientoDetails(${movimiento.id})" title="Ver detalles">
            <i class="fas fa-eye"></i>
          </button>
          ${movimiento.tipo !== 'transferencia' ? `
            <button class="btn btn-sm btn-outline" onclick="FondosModule.editMovimiento(${movimiento.id})" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
          ` : ''}
        </td>
      </tr>
    `).join('');
  };

  // Show movimiento fondo modal
  const showMovimientoFondoModal = () => {
    const modalHtml = `
      <div class="modal-overlay" id="movimientoFondoModal" style="display: block;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Movimiento de Fondos</h3>
            <button class="modal-close" onclick="Utils.hideModal('movimientoFondoModal')">&times;</button>
          </div>
          <div class="modal-body">
            <div class="movement-options">
              <div class="option-group">
                <input type="radio" id="movement-ingreso" name="movementType" value="ingreso" checked>
                <label for="movement-ingreso">
                  <strong>Ingreso</strong>
                  <p>Agregar dinero al fondo</p>
                </label>
              </div>
              
              <div class="option-group">
                <input type="radio" id="movement-egreso" name="movementType" value="egreso">
                <label for="movement-egreso">
                  <strong>Egreso</strong>
                  <p>Retirar dinero del fondo</p>
                </label>
              </div>
              
              <div class="option-group">
                <input type="radio" id="movement-transferencia" name="movementType" value="transferencia">
                <label for="movement-transferencia">
                  <strong>Transferencia</strong>
                  <p>Mover dinero entre fondos</p>
                </label>
              </div>
            </div>
            
            <form id="movimientoFondoForm">
              <div class="form-group">
                <label for="movement-fecha">Fecha:</label>
                <input type="date" id="movement-fecha" value="${new Date().toISOString().split('T')[0]}" required>
              </div>
              
              <div class="form-group" id="fondo-origen-group">
                <label for="movement-fondo">Fondo:</label>
                <select id="movement-fondo" required>
                  <option value="">Seleccionar fondo</option>
                  <option value="reserva">Fondo de Reserva</option>
                  <option value="reparaciones">Fondo de Reparaciones</option>
                  <option value="extraordinario">Fondo Extraordinario</option>
                </select>
              </div>
              
              <div class="form-group" id="fondo-destino-group" style="display: none;">
                <label for="movement-fondo-destino">Fondo Destino:</label>
                <select id="movement-fondo-destino">
                  <option value="">Seleccionar fondo destino</option>
                  <option value="reserva">Fondo de Reserva</option>
                  <option value="reparaciones">Fondo de Reparaciones</option>
                  <option value="extraordinario">Fondo Extraordinario</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="movement-monto">Monto:</label>
                <input type="number" id="movement-monto" step="0.01" placeholder="0.00" required>
              </div>
              
              <div class="form-group">
                <label for="movement-descripcion">Descripción:</label>
                <input type="text" id="movement-descripcion" placeholder="Descripción del movimiento" required>
              </div>
              
              <div class="form-group">
                <label for="movement-comprobante">Comprobante:</label>
                <input type="text" id="movement-comprobante" placeholder="Número de comprobante o referencia">
              </div>
              
              <div class="form-group">
                <label for="movement-notas">Notas:</label>
                <textarea id="movement-notas" rows="3" placeholder="Observaciones adicionales"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="Utils.hideModal('movimientoFondoModal')">Cancelar</button>
            <button class="btn btn-primary" onclick="FondosModule.saveMovimiento()">Registrar Movimiento</button>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal
    const existingModal = document.getElementById('movimientoFondoModal');
    if (existingModal) existingModal.remove();

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Setup radio button change handlers
    document.querySelectorAll('input[name="movementType"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const fondoDestinoGroup = document.getElementById('fondo-destino-group');
        const fondoOrigenLabel = document.querySelector('label[for="movement-fondo"]');
        
        if (radio.value === 'transferencia') {
          fondoDestinoGroup.style.display = 'block';
          fondoOrigenLabel.textContent = 'Fondo Origen:';
        } else {
          fondoDestinoGroup.style.display = 'none';
          fondoOrigenLabel.textContent = 'Fondo:';
        }
      });
    });
  };

  // Save movimiento
  const saveMovimiento = async () => {
    try {
      const tipo = document.querySelector('input[name="movementType"]:checked').value;
      
      const movimientoData = {
        fecha: document.getElementById('movement-fecha').value,
        tipo: tipo,
        fondo: document.getElementById('movement-fondo').value,
        monto: parseFloat(document.getElementById('movement-monto').value),
        descripcion: document.getElementById('movement-descripcion').value,
        comprobante: document.getElementById('movement-comprobante').value,
        notas: document.getElementById('movement-notas').value
      };

      // Validate required fields
      if (!movimientoData.fecha || !movimientoData.fondo || !movimientoData.monto || !movimientoData.descripcion) {
        Utils.showAlert('Todos los campos obligatorios deben ser completados', 'warning');
        return;
      }

      // Handle transferencia
      if (tipo === 'transferencia') {
        const fondoDestino = document.getElementById('movement-fondo-destino').value;
        if (!fondoDestino) {
          Utils.showAlert('Debe seleccionar el fondo destino para la transferencia', 'warning');
          return;
        }
        if (fondoDestino === movimientoData.fondo) {
          Utils.showAlert('El fondo origen y destino no pueden ser el mismo', 'warning');
          return;
        }
        
        movimientoData.fondo_destino = fondoDestino;
        await DBClient.fondos.transfer(movimientoData);
      } else {
        await DBClient.fondos.createMovimiento(movimientoData);
      }
      
      Utils.showAlert('Movimiento registrado correctamente', 'success');
      Utils.hideModal('movimientoFondoModal');
      loadFondos();
      
    } catch (error) {
      console.error('Error saving movimiento:', error);
      Utils.showAlert('Error al registrar movimiento', 'error');
    }
  };

  // View movimiento details
  const viewMovimientoDetails = (movimientoId) => {
    const movimiento = movimientosData.find(m => m.id === movimientoId);
    if (!movimiento) return;

    const modalHtml = `
      <div class="modal-overlay" id="movimientoDetailsModal" style="display: block;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Detalles del Movimiento</h3>
            <button class="modal-close" onclick="Utils.hideModal('movimientoDetailsModal')">&times;</button>
          </div>
          <div class="modal-body">
            <div class="details-grid">
              <div class="detail-item">
                <span class="label">Fecha:</span>
                <span class="value">${Utils.formatDate(movimiento.fecha)}</span>
              </div>
              <div class="detail-item">
                <span class="label">Tipo:</span>
                <span class="badge badge-${getMovementTypeBadgeClass(movimiento.tipo)}">
                  ${getMovementTypeName(movimiento.tipo)}
                </span>
              </div>
              <div class="detail-item">
                <span class="label">Fondo:</span>
                <span class="badge badge-${getFondoBadgeClass(movimiento.fondo)}">
                  ${getFondoName(movimiento.fondo)}
                </span>
              </div>
              ${movimiento.fondo_destino ? `
                <div class="detail-item">
                  <span class="label">Fondo Destino:</span>
                  <span class="badge badge-${getFondoBadgeClass(movimiento.fondo_destino)}">
                    ${getFondoName(movimiento.fondo_destino)}
                  </span>
                </div>
              ` : ''}
              <div class="detail-item">
                <span class="label">Monto:</span>
                <span class="value ${movimiento.tipo === 'egreso' ? 'text-danger' : 'text-success'}">
                  ${movimiento.tipo === 'egreso' ? '-' : '+'}${Utils.formatCurrency(movimiento.monto)}
                </span>
              </div>
              <div class="detail-item">
                <span class="label">Descripción:</span>
                <span class="value">${movimiento.descripcion}</span>
              </div>
              <div class="detail-item">
                <span class="label">Saldo Resultante:</span>
                <span class="value">${Utils.formatCurrency(movimiento.saldo_resultante)}</span>
              </div>
              ${movimiento.comprobante ? `
                <div class="detail-item">
                  <span class="label">Comprobante:</span>
                  <span class="value">${movimiento.comprobante}</span>
                </div>
              ` : ''}
              ${movimiento.notas ? `
                <div class="detail-item">
                  <span class="label">Notas:</span>
                  <span class="value">${movimiento.notas}</span>
                </div>
              ` : ''}
              ${movimiento.creado_por ? `
                <div class="detail-item">
                  <span class="label">Creado por:</span>
                  <span class="value">${movimiento.creado_por}</span>
                </div>
              ` : ''}
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="Utils.hideModal('movimientoDetailsModal')">Cerrar</button>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal
    const existingModal = document.getElementById('movimientoDetailsModal');
    if (existingModal) existingModal.remove();

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  };

  // Edit movimiento
  const editMovimiento = (movimientoId) => {
    const movimiento = movimientosData.find(m => m.id === movimientoId);
    if (!movimiento) return;

    Utils.showAlert('Funcionalidad de edición en desarrollo', 'info');
  };

  // Helper functions
  const getMovementTypeName = (tipo) => {
    const types = {
      ingreso: 'Ingreso',
      egreso: 'Egreso',
      transferencia: 'Transferencia'
    };
    return types[tipo] || tipo;
  };

  const getMovementTypeBadgeClass = (tipo) => {
    const classes = {
      ingreso: 'success',
      egreso: 'danger',
      transferencia: 'info'
    };
    return classes[tipo] || 'secondary';
  };

  const getFondoName = (fondo) => {
    const fondos = {
      reserva: 'Reserva',
      reparaciones: 'Reparaciones',
      extraordinario: 'Extraordinario'
    };
    return fondos[fondo] || fondo;
  };

  const getFondoBadgeClass = (fondo) => {
    const classes = {
      reserva: 'primary',
      reparaciones: 'success',
      extraordinario: 'warning'
    };
    return classes[fondo] || 'secondary';
  };

  // Initialize filters
  const initializeFilters = () => {
    // Add filter initialization if needed
  };

  // Initialize module
  const init = () => {
    initializeFilters();
  };

  // Public API
  return {
    loadFondos,
    showMovimientoFondoModal,
    saveMovimiento,
    viewMovimientoDetails,
    editMovimiento,
    init
  };
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', FondosModule.init);