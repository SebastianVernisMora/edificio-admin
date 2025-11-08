// Cuotas Module
const CuotasModule = (() => {
  
  // Module state
  let cuotasData = [];
  let currentFilters = {};
  
  // Load cuotas with filters
  const loadCuotas = async (filters = {}) => {
    try {
      Utils.showLoading('cuotas-table-body');
      
      currentFilters = { ...filters };
      const data = await DBClient.cuotas.getAll(filters);
      cuotasData = data.cuotas || [];
      
      renderCuotas();
      updateCuotasStats();
      
    } catch (error) {
      console.error('Error loading cuotas:', error);
      Utils.showAlert('Error al cargar cuotas', 'error');
    }
  };

  // Render cuotas table
  const renderCuotas = () => {
    const tbody = document.getElementById('cuotas-table-body');
    if (!tbody) return;

    if (cuotasData.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">No hay cuotas registradas</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = cuotasData.map(cuota => `
      <tr class="cuota-row ${cuota.estado}" data-id="${cuota.id}">
        <td>${cuota.departamento}</td>
        <td>${getMonthName(cuota.mes)}</td>
        <td>${cuota.año}</td>
        <td>${Utils.formatCurrency(cuota.monto)}</td>
        <td>
          <span class="badge badge-${getStatusBadgeClass(cuota.estado)}">
            ${getStatusName(cuota.estado)}
          </span>
        </td>
        <td>${Utils.formatDate(cuota.fecha_vencimiento)}</td>
        <td class="actions">
          ${cuota.estado === 'pendiente' ? `
            <button class="btn btn-sm btn-success" onclick="CuotasModule.markAsPaid(${cuota.id})" title="Marcar como pagada">
              <i class="fas fa-check"></i>
            </button>
          ` : ''}
          <button class="btn btn-sm btn-info" onclick="CuotasModule.viewDetails(${cuota.id})" title="Ver detalles">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-sm btn-outline" onclick="CuotasModule.editCuota(${cuota.id})" title="Editar cuota">
            <i class="fas fa-edit"></i>
          </button>
          ${cuota.estado === 'pendiente' ? `
            <button class="btn btn-sm btn-warning" onclick="CuotasModule.addParcialidad(${cuota.id})" title="Agregar parcialidad">
              <i class="fas fa-percentage"></i>
            </button>
          ` : ''}
        </td>
      </tr>
    `).join('');
  };

  // Update cuotas statistics
  const updateCuotasStats = () => {
    const stats = cuotasData.reduce((acc, cuota) => {
      acc.total++;
      acc[cuota.estado] = (acc[cuota.estado] || 0) + 1;
      acc.montoTotal += cuota.monto;
      if (cuota.estado === 'pagada') {
        acc.montoPagado += cuota.monto;
      }
      return acc;
    }, { total: 0, pagada: 0, pendiente: 0, vencida: 0, montoTotal: 0, montoPagado: 0 });

    // Update summary if exists
    const summaryEl = document.getElementById('cuotas-summary');
    if (summaryEl) {
      summaryEl.innerHTML = `
        <div class="summary-item">
          <span class="label">Total:</span>
          <span class="value">${stats.total}</span>
        </div>
        <div class="summary-item">
          <span class="label">Pagadas:</span>
          <span class="value text-success">${stats.pagada || 0}</span>
        </div>
        <div class="summary-item">
          <span class="label">Pendientes:</span>
          <span class="value text-warning">${stats.pendiente || 0}</span>
        </div>
        <div class="summary-item">
          <span class="label">Vencidas:</span>
          <span class="value text-danger">${stats.vencida || 0}</span>
        </div>
        <div class="summary-item">
          <span class="label">Total:</span>
          <span class="value">${Utils.formatCurrency(stats.montoTotal)}</span>
        </div>
        <div class="summary-item">
          <span class="label">Cobrado:</span>
          <span class="value text-success">${Utils.formatCurrency(stats.montoPagado)}</span>
        </div>
      `;
    }
  };

  // Mark cuota as paid
  const markAsPaid = async (cuotaId) => {
    const cuota = cuotasData.find(c => c.id === cuotaId);
    if (!cuota) return;

    showPaymentModal(cuota);
  };

  // Show payment modal
  const showPaymentModal = (cuota) => {
    const modalHtml = `
      <div class="modal-overlay" id="paymentModal" style="display: block;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Registrar Pago de Cuota</h3>
            <button class="modal-close" onclick="Utils.hideModal('paymentModal')">&times;</button>
          </div>
          <div class="modal-body">
            <div class="payment-info">
              <p><strong>Departamento:</strong> ${cuota.departamento}</p>
              <p><strong>Período:</strong> ${getMonthName(cuota.mes)} ${cuota.año}</p>
              <p><strong>Monto:</strong> ${Utils.formatCurrency(cuota.monto)}</p>
            </div>
            
            <form id="paymentForm">
              <div class="form-group">
                <label for="payment-date">Fecha de Pago:</label>
                <input type="date" id="payment-date" value="${new Date().toISOString().split('T')[0]}" required>
              </div>
              
              <div class="form-group">
                <label for="payment-method">Método de Pago:</label>
                <select id="payment-method" required>
                  <option value="">Seleccionar método</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="deposito">Depósito</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="payment-reference">Referencia:</label>
                <input type="text" id="payment-reference" placeholder="Número de referencia, cheque, etc.">
              </div>
              
              <div class="form-group">
                <label for="payment-notes">Notas:</label>
                <textarea id="payment-notes" rows="3" placeholder="Observaciones adicionales"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="Utils.hideModal('paymentModal')">Cancelar</button>
            <button class="btn btn-success" onclick="CuotasModule.confirmPayment(${cuota.id})">Registrar Pago</button>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal
    const existingModal = document.getElementById('paymentModal');
    if (existingModal) existingModal.remove();

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  };

  // Confirm payment
  const confirmPayment = async (cuotaId) => {
    try {
      const paymentData = {
        fecha_pago: document.getElementById('payment-date').value,
        metodo_pago: document.getElementById('payment-method').value,
        referencia: document.getElementById('payment-reference').value,
        notas: document.getElementById('payment-notes').value
      };

      if (!paymentData.fecha_pago || !paymentData.metodo_pago) {
        Utils.showAlert('Fecha y método de pago son obligatorios', 'warning');
        return;
      }

      await DBClient.cuotas.markAsPaid(cuotaId, paymentData);
      
      Utils.showAlert('Pago registrado correctamente', 'success');
      Utils.hideModal('paymentModal');
      loadCuotas(currentFilters);
      
    } catch (error) {
      console.error('Error registering payment:', error);
      Utils.showAlert('Error al registrar el pago', 'error');
    }
  };

  // View cuota details
  const viewDetails = async (cuotaId) => {
    const cuota = cuotasData.find(c => c.id === cuotaId);
    if (!cuota) return;

    try {
      // Get parcialidades if any
      const parcialidades = await DBClient.parcialidades.getByCuota(cuotaId);
      showDetailsModal(cuota, parcialidades.parcialidades || []);
    } catch (error) {
      console.error('Error loading details:', error);
      showDetailsModal(cuota, []);
    }
  };

  // Show details modal
  const showDetailsModal = (cuota, parcialidades) => {
    const modalHtml = `
      <div class="modal-overlay" id="detailsModal" style="display: block;">
        <div class="modal-content modal-large">
          <div class="modal-header">
            <h3>Detalles de Cuota</h3>
            <button class="modal-close" onclick="Utils.hideModal('detailsModal')">&times;</button>
          </div>
          <div class="modal-body">
            <div class="details-grid">
              <div class="detail-group">
                <h4>Información General</h4>
                <div class="detail-item">
                  <span class="label">Departamento:</span>
                  <span class="value">${cuota.departamento}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Período:</span>
                  <span class="value">${getMonthName(cuota.mes)} ${cuota.año}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Monto:</span>
                  <span class="value">${Utils.formatCurrency(cuota.monto)}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Estado:</span>
                  <span class="badge badge-${getStatusBadgeClass(cuota.estado)}">
                    ${getStatusName(cuota.estado)}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="label">Fecha Vencimiento:</span>
                  <span class="value">${Utils.formatDate(cuota.fecha_vencimiento)}</span>
                </div>
              </div>
              
              ${cuota.estado === 'pagada' ? `
                <div class="detail-group">
                  <h4>Información de Pago</h4>
                  <div class="detail-item">
                    <span class="label">Fecha Pago:</span>
                    <span class="value">${Utils.formatDate(cuota.fecha_pago)}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Método:</span>
                    <span class="value">${cuota.metodo_pago}</span>
                  </div>
                  ${cuota.referencia ? `
                    <div class="detail-item">
                      <span class="label">Referencia:</span>
                      <span class="value">${cuota.referencia}</span>
                    </div>
                  ` : ''}
                  ${cuota.notas ? `
                    <div class="detail-item">
                      <span class="label">Notas:</span>
                      <span class="value">${cuota.notas}</span>
                    </div>
                  ` : ''}
                </div>
              ` : ''}
            </div>
            
            ${parcialidades.length > 0 ? `
              <div class="parcialidades-section">
                <h4>Pagos Parciales</h4>
                <table class="table-sm">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Monto</th>
                      <th>Método</th>
                      <th>Referencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${parcialidades.map(p => `
                      <tr>
                        <td>${Utils.formatDate(p.fecha_pago)}</td>
                        <td>${Utils.formatCurrency(p.monto_pagado)}</td>
                        <td>${p.metodo_pago}</td>
                        <td>${p.referencia || '-'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
                <div class="parcialidades-summary">
                  <strong>Total Pagado: ${Utils.formatCurrency(parcialidades.reduce((sum, p) => sum + p.monto_pagado, 0))}</strong>
                </div>
              </div>
            ` : ''}
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="Utils.hideModal('detailsModal')">Cerrar</button>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal
    const existingModal = document.getElementById('detailsModal');
    if (existingModal) existingModal.remove();

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  };

  // Edit cuota
  const editCuota = (cuotaId) => {
    const cuota = cuotasData.find(c => c.id === cuotaId);
    if (!cuota) return;

    showEditModal(cuota);
  };

  // Show edit modal
  const showEditModal = (cuota) => {
    const modalHtml = `
      <div class="modal-overlay" id="editCuotaModal" style="display: block;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Editar Cuota</h3>
            <button class="modal-close" onclick="Utils.hideModal('editCuotaModal')">&times;</button>
          </div>
          <div class="modal-body">
            <form id="editCuotaForm">
              <div class="form-group">
                <label for="edit-departamento">Departamento:</label>
                <input type="text" id="edit-departamento" value="${cuota.departamento}" required>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="edit-mes">Mes:</label>
                  <select id="edit-mes" required>
                    ${Array.from({length: 12}, (_, i) => i + 1).map(month => 
                      `<option value="${month}" ${month === cuota.mes ? 'selected' : ''}>${getMonthName(month)}</option>`
                    ).join('')}
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="edit-año">Año:</label>
                  <input type="number" id="edit-año" value="${cuota.año}" min="2024" max="2030" required>
                </div>
              </div>
              
              <div class="form-group">
                <label for="edit-monto">Monto:</label>
                <input type="number" id="edit-monto" value="${cuota.monto}" step="0.01" required>
              </div>
              
              <div class="form-group">
                <label for="edit-fecha-vencimiento">Fecha Vencimiento:</label>
                <input type="date" id="edit-fecha-vencimiento" value="${cuota.fecha_vencimiento?.split('T')[0]}" required>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="Utils.hideModal('editCuotaModal')">Cancelar</button>
            <button class="btn btn-primary" onclick="CuotasModule.saveEdit(${cuota.id})">Guardar</button>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal
    const existingModal = document.getElementById('editCuotaModal');
    if (existingModal) existingModal.remove();

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  };

  // Save edit
  const saveEdit = async (cuotaId) => {
    try {
      const updateData = {
        departamento: document.getElementById('edit-departamento').value,
        mes: parseInt(document.getElementById('edit-mes').value),
        año: parseInt(document.getElementById('edit-año').value),
        monto: parseFloat(document.getElementById('edit-monto').value),
        fecha_vencimiento: document.getElementById('edit-fecha-vencimiento').value
      };

      await DBClient.cuotas.update(cuotaId, updateData);
      
      Utils.showAlert('Cuota actualizada correctamente', 'success');
      Utils.hideModal('editCuotaModal');
      loadCuotas(currentFilters);
      
    } catch (error) {
      console.error('Error updating cuota:', error);
      Utils.showAlert('Error al actualizar cuota', 'error');
    }
  };

  // Add parcialidad
  const addParcialidad = (cuotaId) => {
    // Redirect to parcialidades module with cuota preselected
    NavigationSystem.showSection('parcialidades');
    setTimeout(() => {
      if (typeof ParcialidadesModule !== 'undefined') {
        ParcialidadesModule.showAddParcialidadModal(cuotaId);
      }
    }, 100);
  };

  // Show generate cuotas modal
  const showGenerarCuotasModal = () => {
    const currentYear = new Date().getFullYear();
    
    const modalHtml = `
      <div class="modal-overlay" id="generateCuotasModal" style="display: block;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Generar Cuotas</h3>
            <button class="modal-close" onclick="Utils.hideModal('generateCuotasModal')">&times;</button>
          </div>
          <div class="modal-body">
            <div class="generate-options">
              <div class="option-group">
                <input type="radio" id="generate-monthly" name="generateType" value="monthly" checked>
                <label for="generate-monthly">
                  <strong>Generar Cuotas Mensuales</strong>
                  <p>Generar cuotas para un mes específico</p>
                </label>
              </div>
              
              <div class="option-group">
                <input type="radio" id="generate-yearly" name="generateType" value="yearly">
                <label for="generate-yearly">
                  <strong>Generar Cuotas Anuales</strong>
                  <p>Generar todas las cuotas del año (12 meses)</p>
                </label>
              </div>
            </div>
            
            <form id="generateCuotasForm">
              <div class="form-row">
                <div class="form-group" id="month-group">
                  <label for="generate-month">Mes:</label>
                  <select id="generate-month">
                    ${Array.from({length: 12}, (_, i) => i + 1).map(month => 
                      `<option value="${month}">${getMonthName(month)}</option>`
                    ).join('')}
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="generate-year">Año:</label>
                  <input type="number" id="generate-year" value="${currentYear + 1}" min="${currentYear}" max="${currentYear + 5}" required>
                </div>
              </div>
              
              <div class="form-group">
                <label for="cuota-amount">Monto de Cuota:</label>
                <input type="number" id="cuota-amount" value="75000" step="0.01" required>
                <small>Monto en pesos mexicanos</small>
              </div>
              
              <div class="form-group">
                <label for="due-day">Día de Vencimiento:</label>
                <input type="number" id="due-day" value="10" min="1" max="28" required>
                <small>Día del mes para el vencimiento</small>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="Utils.hideModal('generateCuotasModal')">Cancelar</button>
            <button class="btn btn-primary" onclick="CuotasModule.generateCuotas()">Generar Cuotas</button>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal
    const existingModal = document.getElementById('generateCuotasModal');
    if (existingModal) existingModal.remove();

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Setup radio button change handler
    document.querySelectorAll('input[name="generateType"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const monthGroup = document.getElementById('month-group');
        monthGroup.style.display = radio.value === 'monthly' ? 'block' : 'none';
      });
    });
  };

  // Generate cuotas
  const generateCuotas = async () => {
    try {
      const generateType = document.querySelector('input[name="generateType"]:checked').value;
      const year = parseInt(document.getElementById('generate-year').value);
      const month = generateType === 'monthly' ? parseInt(document.getElementById('generate-month').value) : null;
      const amount = parseFloat(document.getElementById('cuota-amount').value);
      const dueDay = parseInt(document.getElementById('due-day').value);

      if (generateType === 'monthly') {
        await DBClient.cuotas.generateMonthly(year, month, { monto: amount, dia_vencimiento: dueDay });
        Utils.showAlert(`Cuotas generadas para ${getMonthName(month)} ${year}`, 'success');
      } else {
        await DBClient.cuotas.generateYearly(year, { monto: amount, dia_vencimiento: dueDay });
        Utils.showAlert(`Cuotas generadas para todo el año ${year}`, 'success');
      }
      
      Utils.hideModal('generateCuotasModal');
      loadCuotas(currentFilters);
      
    } catch (error) {
      console.error('Error generating cuotas:', error);
      Utils.showAlert('Error al generar cuotas', 'error');
    }
  };

  // Show validate payments modal
  const showValidarPagosModal = () => {
    const pendingCuotas = cuotasData.filter(c => c.estado === 'pendiente');
    
    const modalHtml = `
      <div class="modal-overlay" id="validatePaymentsModal" style="display: block;">
        <div class="modal-content modal-large">
          <div class="modal-header">
            <h3>Validar Pagos Múltiples</h3>
            <button class="modal-close" onclick="Utils.hideModal('validatePaymentsModal')">&times;</button>
          </div>
          <div class="modal-body">
            <div class="batch-payment-form">
              <div class="form-group">
                <label for="batch-payment-date">Fecha de Pago:</label>
                <input type="date" id="batch-payment-date" value="${new Date().toISOString().split('T')[0]}" required>
              </div>
              
              <div class="form-group">
                <label for="batch-payment-method">Método de Pago:</label>
                <select id="batch-payment-method" required>
                  <option value="">Seleccionar método</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="deposito">Depósito</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
            </div>
            
            <div class="cuotas-selection">
              <div class="selection-header">
                <label>
                  <input type="checkbox" id="select-all-cuotas" onchange="CuotasModule.toggleSelectAll()">
                  Seleccionar todas las cuotas pendientes
                </label>
              </div>
              
              <div class="cuotas-list">
                ${pendingCuotas.map(cuota => `
                  <div class="cuota-item">
                    <label>
                      <input type="checkbox" class="cuota-checkbox" value="${cuota.id}">
                      <span class="cuota-info">
                        <strong>Depto ${cuota.departamento}</strong> - 
                        ${getMonthName(cuota.mes)} ${cuota.año} - 
                        ${Utils.formatCurrency(cuota.monto)}
                      </span>
                    </label>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="Utils.hideModal('validatePaymentsModal')">Cancelar</button>
            <button class="btn btn-success" onclick="CuotasModule.validateMultiplePayments()">Validar Pagos Seleccionados</button>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal
    const existingModal = document.getElementById('validatePaymentsModal');
    if (existingModal) existingModal.remove();

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  };

  // Toggle select all cuotas
  const toggleSelectAll = () => {
    const selectAllCheckbox = document.getElementById('select-all-cuotas');
    const cuotaCheckboxes = document.querySelectorAll('.cuota-checkbox');
    
    cuotaCheckboxes.forEach(checkbox => {
      checkbox.checked = selectAllCheckbox.checked;
    });
  };

  // Validate multiple payments
  const validateMultiplePayments = async () => {
    try {
      const selectedIds = Array.from(document.querySelectorAll('.cuota-checkbox:checked'))
        .map(checkbox => parseInt(checkbox.value));
      
      if (selectedIds.length === 0) {
        Utils.showAlert('Selecciona al menos una cuota', 'warning');
        return;
      }

      const paymentData = {
        fecha_pago: document.getElementById('batch-payment-date').value,
        metodo_pago: document.getElementById('batch-payment-method').value
      };

      if (!paymentData.fecha_pago || !paymentData.metodo_pago) {
        Utils.showAlert('Fecha y método de pago son obligatorios', 'warning');
        return;
      }

      await DBClient.cuotas.batchMarkAsPaid(selectedIds, paymentData);
      
      Utils.showAlert(`${selectedIds.length} pagos registrados correctamente`, 'success');
      Utils.hideModal('validatePaymentsModal');
      loadCuotas(currentFilters);
      
    } catch (error) {
      console.error('Error validating multiple payments:', error);
      Utils.showAlert('Error al validar los pagos', 'error');
    }
  };

  // Helper functions
  const getMonthName = (month) => {
    const months = [
      '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month] || month;
  };

  const getStatusName = (status) => {
    const statuses = {
      pendiente: 'Pendiente',
      pagada: 'Pagada', 
      vencida: 'Vencida'
    };
    return statuses[status] || status;
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      pendiente: 'warning',
      pagada: 'success',
      vencida: 'danger'
    };
    return classes[status] || 'secondary';
  };

  // Initialize filters
  const initializeFilters = () => {
    const yearFilter = document.getElementById('cuotas-year-filter');
    const monthFilter = document.getElementById('cuotas-month-filter');
    const statusFilter = document.getElementById('cuotas-status-filter');

    if (yearFilter) {
      yearFilter.addEventListener('change', applyFilters);
    }
    if (monthFilter) {
      monthFilter.addEventListener('change', applyFilters);
    }
    if (statusFilter) {
      statusFilter.addEventListener('change', applyFilters);
    }
  };

  // Apply filters
  const applyFilters = () => {
    const filters = {};
    
    const yearFilter = document.getElementById('cuotas-year-filter');
    const monthFilter = document.getElementById('cuotas-month-filter');
    const statusFilter = document.getElementById('cuotas-status-filter');

    if (yearFilter && yearFilter.value) {
      filters.año = yearFilter.value;
    }
    if (monthFilter && monthFilter.value) {
      filters.mes = monthFilter.value;
    }
    if (statusFilter && statusFilter.value) {
      filters.estado = statusFilter.value;
    }

    loadCuotas(filters);
  };

  // Initialize module
  const init = () => {
    initializeFilters();
  };

  // Public API
  return {
    loadCuotas,
    markAsPaid,
    confirmPayment,
    viewDetails,
    editCuota,
    saveEdit,
    addParcialidad,
    showGenerarCuotasModal,
    generateCuotas,
    showValidarPagosModal,
    toggleSelectAll,
    validateMultiplePayments,
    init
  };
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', CuotasModule.init);