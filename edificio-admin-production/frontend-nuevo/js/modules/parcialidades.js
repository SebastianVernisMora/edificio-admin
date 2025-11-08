// Parcialidades Module
const ParcialidadesModule = (() => {
  
  // Module state
  let parcialidadesData = [];
  let configData = null;
  
  // Load parcialidades
  const loadParcialidades = async () => {
    try {
      Utils.showLoading('parcialidades-config');
      
      const data = await Utils.apiRequest('/parcialidades');
      parcialidadesData = data.parcialidades || [];
      configData = data.config || null;
      
      renderParcialidadesConfig();
      renderParcialidadesList();
      
    } catch (error) {
      console.error('Error loading parcialidades:', error);
      Utils.showAlert('Error al cargar parcialidades', 'error');
    }
  };

  // Render parcialidades config
  const renderParcialidadesConfig = () => {
    const configDiv = document.getElementById('parcialidades-config');
    if (!configDiv) return;

    if (!configData) {
      configDiv.innerHTML = `
        <div class="config-card">
          <h3>Configuración de Parcialidades 2026</h3>
          <p class="text-muted">No hay configuración establecida para las parcialidades de 2026.</p>
          <button class="btn btn-primary" onclick="ParcialidadesModule.crearConfiguracion()">
            Crear Configuración
          </button>
        </div>
      `;
      return;
    }

    configDiv.innerHTML = `
      <div class="config-card">
        <h3>Configuración de Parcialidades 2026</h3>
        <div class="config-details">
          <div class="config-item">
            <strong>Monto Base:</strong> ${Utils.formatCurrency(configData.monto_base)}
          </div>
          <div class="config-item">
            <strong>Número de Parcialidades:</strong> ${configData.numero_parcialidades}
          </div>
          <div class="config-item">
            <strong>Monto por Parcialidad:</strong> ${Utils.formatCurrency(configData.monto_parcialidad)}
          </div>
          <div class="config-item">
            <strong>Fecha Límite:</strong> ${Utils.formatDate(configData.fecha_limite)}
          </div>
          <div class="config-item">
            <strong>Estado:</strong> 
            <span class="badge badge-${configData.activo ? 'success' : 'secondary'}">
              ${configData.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
        <div class="config-actions">
          <button class="btn btn-outline" onclick="ParcialidadesModule.editarConfiguracion()">
            Editar Configuración
          </button>
          <button class="btn btn-${configData.activo ? 'warning' : 'success'}" 
                  onclick="ParcialidadesModule.toggleConfiguracion()">
            ${configData.activo ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      </div>
    `;
  };

  // Render parcialidades list
  const renderParcialidadesList = () => {
    const tbody = document.getElementById('parcialidades-table-body');
    if (!tbody) return;

    if (parcialidadesData.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center">No hay parcialidades registradas</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = parcialidadesData.map(parcialidad => `
      <tr>
        <td>${parcialidad.usuario_nombre}</td>
        <td>${parcialidad.departamento}</td>
        <td>${parcialidad.numero_parcialidad} / ${configData ? configData.numero_parcialidades : 'N/A'}</td>
        <td>${Utils.formatCurrency(parcialidad.monto_pagado)}</td>
        <td>
          <span class="badge badge-${getStatusBadgeClass(parcialidad.estado)}">
            ${getStatusName(parcialidad.estado)}
          </span>
        </td>
        <td>
          <div class="progress">
            <div class="progress-bar" style="width: ${parcialidad.progreso_porcentaje}%">
              ${parcialidad.progreso_porcentaje}%
            </div>
          </div>
        </td>
        <td class="actions">
          <button class="btn btn-sm btn-outline" onclick="ParcialidadesModule.verDetalle(${parcialidad.id})" title="Ver detalle">
            <i class="fas fa-eye"></i>
          </button>
          ${parcialidad.estado === 'activo' ? `
            <button class="btn btn-sm btn-success" onclick="ParcialidadesModule.registrarPago(${parcialidad.id})" title="Registrar pago">
              <i class="fas fa-plus"></i>
            </button>
          ` : ''}
        </td>
      </tr>
    `).join('');
  };

  // Get status badge class
  const getStatusBadgeClass = (estado) => {
    const classes = {
      'activo': 'info',
      'completado': 'success',
      'vencido': 'danger',
      'cancelado': 'secondary'
    };
    return classes[estado] || 'secondary';
  };

  // Get status name
  const getStatusName = (estado) => {
    const names = {
      'activo': 'Activo',
      'completado': 'Completado',
      'vencido': 'Vencido',
      'cancelado': 'Cancelado'
    };
    return names[estado] || estado;
  };

  // Crear configuración
  const crearConfiguracion = () => {
    const modalHtml = `
      <div class="modal-overlay" id="configParcialidadesModal" style="display: block;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Configurar Parcialidades 2026</h3>
            <button class="modal-close" onclick="Utils.hideModal('configParcialidadesModal')">&times;</button>
          </div>
          <div class="modal-body">
            <form id="configParcialidadesForm">
              <div class="form-group">
                <label for="montoBase">Monto Base:</label>
                <input type="number" id="montoBase" min="0" step="0.01" required>
              </div>
              
              <div class="form-group">
                <label for="numeroParcialidades">Número de Parcialidades:</label>
                <input type="number" id="numeroParcialidades" min="1" max="12" value="12" required>
              </div>
              
              <div class="form-group">
                <label for="fechaLimite">Fecha Límite:</label>
                <input type="date" id="fechaLimite" required>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="Utils.hideModal('configParcialidadesModal')">Cancelar</button>
            <button class="btn btn-primary" onclick="ParcialidadesModule.guardarConfiguracion()">Crear</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  };

  // Guardar configuración
  const guardarConfiguracion = async () => {
    try {
      const montoBase = parseFloat(document.getElementById('montoBase').value);
      const numeroParcialidades = parseInt(document.getElementById('numeroParcialidades').value);
      const fechaLimite = document.getElementById('fechaLimite').value;

      const configData = {
        monto_base: montoBase,
        numero_parcialidades: numeroParcialidades,
        monto_parcialidad: montoBase / numeroParcialidades,
        fecha_limite: fechaLimite,
        activo: true
      };

      await Utils.apiRequest('/parcialidades/config', 'POST', configData);
      
      Utils.showAlert('Configuración creada correctamente', 'success');
      Utils.hideModal('configParcialidadesModal');
      loadParcialidades();
      
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      Utils.showAlert('Error al guardar configuración', 'error');
    }
  };

  // Editar configuración
  const editarConfiguracion = () => {
    if (!configData) return;

    const modalHtml = `
      <div class="modal-overlay" id="editConfigParcialidadesModal" style="display: block;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Editar Configuración</h3>
            <button class="modal-close" onclick="Utils.hideModal('editConfigParcialidadesModal')">&times;</button>
          </div>
          <div class="modal-body">
            <form id="editConfigParcialidadesForm">
              <div class="form-group">
                <label for="editMontoBase">Monto Base:</label>
                <input type="number" id="editMontoBase" min="0" step="0.01" value="${configData.monto_base}" required>
              </div>
              
              <div class="form-group">
                <label for="editNumeroParcialidades">Número de Parcialidades:</label>
                <input type="number" id="editNumeroParcialidades" min="1" max="12" value="${configData.numero_parcialidades}" required>
              </div>
              
              <div class="form-group">
                <label for="editFechaLimite">Fecha Límite:</label>
                <input type="date" id="editFechaLimite" value="${configData.fecha_limite}" required>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="Utils.hideModal('editConfigParcialidadesModal')">Cancelar</button>
            <button class="btn btn-primary" onclick="ParcialidadesModule.actualizarConfiguracion()">Actualizar</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  };

  // Actualizar configuración
  const actualizarConfiguracion = async () => {
    try {
      const montoBase = parseFloat(document.getElementById('editMontoBase').value);
      const numeroParcialidades = parseInt(document.getElementById('editNumeroParcialidades').value);
      const fechaLimite = document.getElementById('editFechaLimite').value;

      const updateData = {
        monto_base: montoBase,
        numero_parcialidades: numeroParcialidades,
        monto_parcialidad: montoBase / numeroParcialidades,
        fecha_limite: fechaLimite
      };

      await Utils.apiRequest(`/parcialidades/config/${configData.id}`, 'PUT', updateData);
      
      Utils.showAlert('Configuración actualizada correctamente', 'success');
      Utils.hideModal('editConfigParcialidadesModal');
      loadParcialidades();
      
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      Utils.showAlert('Error al actualizar configuración', 'error');
    }
  };

  // Toggle configuración
  const toggleConfiguracion = async () => {
    if (!configData) return;

    try {
      const newStatus = !configData.activo;
      await Utils.apiRequest(`/parcialidades/config/${configData.id}/toggle`, 'PUT', { activo: newStatus });
      
      Utils.showAlert(`Configuración ${newStatus ? 'activada' : 'desactivada'} correctamente`, 'success');
      loadParcialidades();
      
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      Utils.showAlert('Error al cambiar estado de configuración', 'error');
    }
  };

  // Ver detalle
  const verDetalle = (parcialidadId) => {
    const parcialidad = parcialidadesData.find(p => p.id === parcialidadId);
    if (!parcialidad) return;

    Utils.showAlert(`Detalle de ${parcialidad.usuario_nombre} - Depto ${parcialidad.departamento}`, 'info');
  };

  // Registrar pago
  const registrarPago = (parcialidadId) => {
    const parcialidad = parcialidadesData.find(p => p.id === parcialidadId);
    if (!parcialidad) return;

    const modalHtml = `
      <div class="modal-overlay" id="registrarPagoModal" style="display: block;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Registrar Pago</h3>
            <button class="modal-close" onclick="Utils.hideModal('registrarPagoModal')">&times;</button>
          </div>
          <div class="modal-body">
            <p><strong>Usuario:</strong> ${parcialidad.usuario_nombre}</p>
            <p><strong>Departamento:</strong> ${parcialidad.departamento}</p>
            
            <form id="registrarPagoForm">
              <div class="form-group">
                <label for="montoPago">Monto:</label>
                <input type="number" id="montoPago" min="0" step="0.01" value="${configData?.monto_parcialidad || 0}" required>
              </div>
              
              <div class="form-group">
                <label for="fechaPago">Fecha de Pago:</label>
                <input type="date" id="fechaPago" value="${new Date().toISOString().split('T')[0]}" required>
              </div>
              
              <div class="form-group">
                <label for="referenciaPago">Referencia:</label>
                <input type="text" id="referenciaPago" placeholder="Número de transferencia, recibo, etc.">
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="Utils.hideModal('registrarPagoModal')">Cancelar</button>
            <button class="btn btn-success" onclick="ParcialidadesModule.guardarPago(${parcialidadId})">Registrar Pago</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  };

  // Guardar pago
  const guardarPago = async (parcialidadId) => {
    try {
      const monto = parseFloat(document.getElementById('montoPago').value);
      const fecha = document.getElementById('fechaPago').value;
      const referencia = document.getElementById('referenciaPago').value;

      const pagoData = {
        monto,
        fecha_pago: fecha,
        referencia
      };

      await Utils.apiRequest(`/parcialidades/${parcialidadId}/pago`, 'POST', pagoData);
      
      Utils.showAlert('Pago registrado correctamente', 'success');
      Utils.hideModal('registrarPagoModal');
      loadParcialidades();
      
    } catch (error) {
      console.error('Error al registrar pago:', error);
      Utils.showAlert('Error al registrar pago', 'error');
    }
  };

  // Public API
  return {
    loadParcialidades,
    crearConfiguracion,
    guardarConfiguracion,
    editarConfiguracion,
    actualizarConfiguracion,
    toggleConfiguracion,
    verDetalle,
    registrarPago,
    guardarPago
  };
})();