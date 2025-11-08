// Inquilino Module - Main module for tenant functionality
const InquilinoModule = (() => {
  // Module state
  let misCuotas = [];
  let anuncios = [];
  let misSolicitudes = [];
  let presupuestos = [];

  // Load dashboard data
  const loadDashboard = async () => {
    try {
      const currentUser = Auth.getCurrentUser();
      if (!currentUser) return;

      // Load dashboard data
      const [cuotasData, anunciosData] = await Promise.all([
        Utils.apiRequest('/cuotas/mis-cuotas'),
        Utils.apiRequest('/anuncios')
      ]);

      updateDashboardSummary(cuotasData, currentUser);
      updateRecentActivity(anunciosData);
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
      Utils.showAlert('Error al cargar dashboard', 'error');
    }
  };

  // Update dashboard summary
  const updateDashboardSummary = (cuotasData, currentUser) => {
    // Current month quota
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleDateString('es-ES', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    
    const currentQuota = cuotasData.find(c => 
      c.mes.toLowerCase() === currentMonth.toLowerCase() && 
      c.año === currentYear
    );

    // Update cuota actual
    const cuotaActualEstado = document.getElementById('cuota-actual-estado');
    const cuotaActualInfo = document.getElementById('cuota-actual-info');
    
    if (cuotaActualEstado && cuotaActualInfo && currentQuota) {
      cuotaActualEstado.textContent = getStatusName(currentQuota.estado);
      cuotaActualEstado.className = `amount ${getStatusClass(currentQuota.estado)}`;
      cuotaActualInfo.textContent = `${currentMonth} ${currentYear} - ${Utils.formatCurrency(currentQuota.monto)}`;
    }

    // Update next due date
    const proximoVencimiento = document.getElementById('proximo-vencimiento');
    const diasVencimiento = document.getElementById('dias-vencimiento');
    
    if (proximoVencimiento && diasVencimiento) {
      const nextDueDate = new Date(currentYear, currentDate.getMonth() + 1, 1);
      proximoVencimiento.textContent = nextDueDate.toLocaleDateString('es-ES');
      
      const daysUntilDue = Math.ceil((nextDueDate - currentDate) / (1000 * 60 * 60 * 24));
      diasVencimiento.textContent = daysUntilDue;
    }

    // Update parcialidades progress
    updateParcialidadesProgress();
  };

  // Update recent activity
  const updateRecentActivity = (anunciosData) => {
    // This could be implemented to show recent announcements
    console.log('Recent announcements:', anunciosData);
  };

  // Update parcialidades progress
  const updateParcialidadesProgress = async () => {
    try {
      const data = await Utils.apiRequest('/parcialidades/mi-progreso');
      const parcialidadesProgreso = document.getElementById('parcialidades-progreso');
      
      if (parcialidadesProgreso) {
        parcialidadesProgreso.textContent = `${data.progreso_porcentaje || 0}%`;
      }
      
    } catch (error) {
      console.error('Error loading parcialidades progress:', error);
    }
  };

  // Load cuotas data
  const loadCuotas = async () => {
    try {
      Utils.showLoading('cuotas-table-body');
      
      const data = await Utils.apiRequest('/cuotas/mis-cuotas');
      misCuotas = data || [];
      
      renderCuotasTable();
      
    } catch (error) {
      console.error('Error loading cuotas:', error);
      Utils.showAlert('Error al cargar cuotas', 'error');
    }
  };

  // Render cuotas table
  const renderCuotasTable = () => {
    const tbody = document.getElementById('cuotas-table-body');
    if (!tbody) return;

    if (misCuotas.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center">No hay cuotas registradas</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = misCuotas.map(cuota => `
      <tr class="cuota-row ${cuota.estado}">
        <td>${getMonthName(cuota.mes)}</td>
        <td>${cuota.año}</td>
        <td>${Utils.formatCurrency(cuota.monto)}</td>
        <td>
          <span class="badge badge-${getStatusBadgeClass(cuota.estado)}">
            ${getStatusName(cuota.estado)}
          </span>
        </td>
        <td>${cuota.fecha_vencimiento ? Utils.formatDate(cuota.fecha_vencimiento) : '-'}</td>
        <td class="actions">
          ${cuota.estado === 'pendiente' ? `
            <button class="btn btn-sm btn-primary" onclick="InquilinoModule.reportarPago(${cuota.id})" title="Reportar pago">
              <i class="fas fa-money-bill-wave"></i>
            </button>
          ` : ''}
          ${cuota.estado === 'pagado' && cuota.comprobante_pago ? `
            <button class="btn btn-sm btn-info" onclick="InquilinoModule.verComprobante(${cuota.id})" title="Ver comprobante">
              <i class="fas fa-eye"></i>
            </button>
          ` : ''}
        </td>
      </tr>
    `).join('');
  };

  // Load anuncios data
  const loadAnuncios = async () => {
    try {
      Utils.showLoading('anuncios-list');
      
      const data = await Utils.apiRequest('/anuncios');
      anuncios = data || [];
      
      renderAnunciosList();
      
    } catch (error) {
      console.error('Error loading anuncios:', error);
      Utils.showAlert('Error al cargar anuncios', 'error');
    }
  };

  // Render anuncios list
  const renderAnunciosList = () => {
    const container = document.getElementById('anuncios-list');
    if (!container) return;

    if (anuncios.length === 0) {
      container.innerHTML = `
        <div class="no-data">
          <p>No hay anuncios disponibles</p>
        </div>
      `;
      return;
    }

    container.innerHTML = anuncios.map(anuncio => `
      <div class="anuncio-card">
        <div class="anuncio-header">
          <h4>${anuncio.titulo}</h4>
          <span class="anuncio-date">${Utils.formatDate(anuncio.fecha_publicacion)}</span>
        </div>
        <div class="anuncio-content">
          <p>${anuncio.contenido}</p>
          ${anuncio.prioridad === 'alta' ? '<span class="badge badge-danger">Importante</span>' : ''}
        </div>
      </div>
    `).join('');
  };

  // Load parcialidades data
  const loadParcialidades = async () => {
    try {
      Utils.showLoading('parcialidades-content');
      
      const data = await Utils.apiRequest('/parcialidades/mi-progreso');
      
      renderParcialidadesDetail(data);
      
    } catch (error) {
      console.error('Error loading parcialidades:', error);
      Utils.showAlert('Error al cargar parcialidades', 'error');
    }
  };

  // Render parcialidades detail
  const renderParcialidadesDetail = (data) => {
    const container = document.getElementById('parcialidades-content');
    if (!container) return;

    container.innerHTML = `
      <div class="parcialidades-summary">
        <div class="summary-card">
          <h3>Mi Progreso</h3>
          <div class="progress-circle">
            <div class="progress-text">${data.progreso_porcentaje || 0}%</div>
          </div>
          <p>Completado</p>
        </div>
        
        <div class="summary-card">
          <h3>Monto Pagado</h3>
          <p class="amount success">${Utils.formatCurrency(data.monto_pagado || 0)}</p>
          <p class="description">de ${Utils.formatCurrency(data.monto_total || 0)}</p>
        </div>
        
        <div class="summary-card">
          <h3>Saldo Pendiente</h3>
          <p class="amount warning">${Utils.formatCurrency(data.saldo_pendiente || 0)}</p>
          <p class="description">Por pagar</p>
        </div>
      </div>
      
      <div class="parcialidades-history">
        <h3>Historial de Pagos</h3>
        ${renderPagosHistory(data.pagos || [])}
      </div>
    `;
  };

  // Render pagos history
  const renderPagosHistory = (pagos) => {
    if (pagos.length === 0) {
      return '<p class="no-data">No hay pagos registrados</p>';
    }

    return `
      <table class="table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Monto</th>
            <th>Método</th>
            <th>Referencia</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${pagos.map(pago => `
            <tr>
              <td>${Utils.formatDate(pago.fecha_pago)}</td>
              <td>${Utils.formatCurrency(pago.monto)}</td>
              <td>${pago.metodo_pago || 'Transferencia'}</td>
              <td>${pago.referencia || '-'}</td>
              <td>
                <span class="badge badge-${pago.estado === 'validado' ? 'success' : 'warning'}">
                  ${pago.estado || 'Pendiente'}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  };

  // Reportar pago
  const reportarPago = (cuotaId) => {
    const cuota = misCuotas.find(c => c.id === cuotaId);
    if (!cuota) return;

    // Show report payment modal
    showReportPaymentModal(cuota);
  };

  // Show report payment modal
  const showReportPaymentModal = (cuota) => {
    const modalHtml = `
      <div class="modal-overlay" id="reportPaymentModal" style="display: block;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Reportar Pago de Cuota</h3>
            <button class="modal-close" onclick="Utils.hideModal('reportPaymentModal')">&times;</button>
          </div>
          <div class="modal-body">
            <div class="cuota-info">
              <p><strong>Cuota:</strong> ${getMonthName(cuota.mes)} ${cuota.año}</p>
              <p><strong>Monto:</strong> ${Utils.formatCurrency(cuota.monto)}</p>
            </div>
            
            <form id="reportPaymentForm">
              <div class="form-group">
                <label for="fechaPago">Fecha de Pago:</label>
                <input type="date" id="fechaPago" value="${new Date().toISOString().split('T')[0]}" required>
              </div>
              
              <div class="form-group">
                <label for="metodoPago">Método de Pago:</label>
                <select id="metodoPago" required>
                  <option value="transferencia">Transferencia Bancaria</option>
                  <option value="deposito">Depósito</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="referenciaPago">Referencia/Comprobante:</label>
                <input type="text" id="referenciaPago" placeholder="Número de referencia, folio, etc." required>
              </div>
              
              <div class="form-group">
                <label for="observaciones">Observaciones:</label>
                <textarea id="observaciones" placeholder="Información adicional (opcional)"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="Utils.hideModal('reportPaymentModal')">Cancelar</button>
            <button class="btn btn-primary" onclick="InquilinoModule.guardarReportePago(${cuota.id})">Reportar Pago</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  };

  // Guardar reporte de pago
  const guardarReportePago = async (cuotaId) => {
    try {
      const fechaPago = document.getElementById('fechaPago').value;
      const metodoPago = document.getElementById('metodoPago').value;
      const referencia = document.getElementById('referenciaPago').value;
      const observaciones = document.getElementById('observaciones').value;

      const pagoData = {
        fecha_pago: fechaPago,
        metodo_pago: metodoPago,
        referencia,
        observaciones: observaciones || null
      };

      await Utils.apiRequest(`/cuotas/${cuotaId}/reportar-pago`, 'POST', pagoData);
      
      Utils.showAlert('Pago reportado correctamente. Será validado por el administrador.', 'success');
      Utils.hideModal('reportPaymentModal');
      loadCuotas();
      
    } catch (error) {
      console.error('Error al reportar pago:', error);
      Utils.showAlert('Error al reportar pago', 'error');
    }
  };

  // Ver comprobante
  const verComprobante = (cuotaId) => {
    const cuota = misCuotas.find(c => c.id === cuotaId);
    if (!cuota) return;

    Utils.showAlert(`Comprobante: ${cuota.comprobante_pago || 'No disponible'}`, 'info');
  };

  // Helper functions
  const getMonthName = (month) => {
    const months = {
      'Enero': 'Enero', 'Febrero': 'Febrero', 'Marzo': 'Marzo',
      'Abril': 'Abril', 'Mayo': 'Mayo', 'Junio': 'Junio',
      'Julio': 'Julio', 'Agosto': 'Agosto', 'Septiembre': 'Septiembre',
      'Octubre': 'Octubre', 'Noviembre': 'Noviembre', 'Diciembre': 'Diciembre'
    };
    return months[month] || month;
  };

  const getStatusName = (estado) => {
    const estados = {
      'pendiente': 'PENDIENTE',
      'pagado': 'PAGADO',
      'vencido': 'VENCIDO',
      'parcial': 'PARCIAL'
    };
    return estados[estado] || estado.toUpperCase();
  };

  const getStatusClass = (estado) => {
    const classes = {
      'pendiente': 'warning',
      'pagado': 'success',
      'vencido': 'danger',
      'parcial': 'info'
    };
    return classes[estado] || '';
  };

  const getStatusBadgeClass = (estado) => {
    const classes = {
      'pendiente': 'warning',
      'pagado': 'success',
      'vencido': 'danger',
      'parcial': 'info'
    };
    return classes[estado] || 'secondary';
  };

  // Public API
  return {
    loadDashboard,
    loadCuotas,
    loadAnuncios,
    loadParcialidades,
    reportarPago,
    guardarReportePago,
    verComprobante
  };
})();