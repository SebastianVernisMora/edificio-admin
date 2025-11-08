// Cierres Module
const CierresModule = (() => {
  
  // Module state
  let cierresData = [];
  
  // Load cierres
  const loadCierres = async () => {
    try {
      Utils.showLoading('cierres-table-body');
      
      const data = await Utils.apiRequest('/cierres');
      cierresData = data.cierres || [];
      
      renderCierres();
      
    } catch (error) {
      console.error('Error loading cierres:', error);
      Utils.showAlert('Error al cargar cierres', 'error');
    }
  };

  // Render cierres table
  const renderCierres = () => {
    const tbody = document.getElementById('cierres-table-body');
    if (!tbody) return;

    if (cierresData.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center">No hay cierres registrados</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = cierresData.map(cierre => `
      <tr>
        <td>${getMonthName(cierre.mes)} ${cierre.año}</td>
        <td>${Utils.formatCurrency(cierre.ingresos_totales)}</td>
        <td>${Utils.formatCurrency(cierre.gastos_totales)}</td>
        <td>${Utils.formatCurrency(cierre.balance)}</td>
        <td>
          <span class="badge badge-${cierre.estado === 'cerrado' ? 'success' : 'warning'}">
            ${cierre.estado === 'cerrado' ? 'Cerrado' : 'Abierto'}
          </span>
        </td>
        <td class="actions">
          ${cierre.estado === 'abierto' ? `
            <button class="btn btn-sm btn-primary" onclick="CierresModule.cerrarPeriodo('${cierre.id}')" title="Cerrar período">
              <i class="fas fa-lock"></i>
            </button>
          ` : ''}
          <button class="btn btn-sm btn-outline" onclick="CierresModule.verDetalle('${cierre.id}')" title="Ver detalle">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-sm btn-info" onclick="CierresModule.descargarReporte('${cierre.id}')" title="Descargar reporte">
            <i class="fas fa-download"></i>
          </button>
        </td>
      </tr>
    `).join('');
  };

  // Get month name
  const getMonthName = (month) => {
    const months = {
      'Enero': 'Enero', 'Febrero': 'Febrero', 'Marzo': 'Marzo',
      'Abril': 'Abril', 'Mayo': 'Mayo', 'Junio': 'Junio',
      'Julio': 'Julio', 'Agosto': 'Agosto', 'Septiembre': 'Septiembre',
      'Octubre': 'Octubre', 'Noviembre': 'Noviembre', 'Diciembre': 'Diciembre'
    };
    return months[month] || month;
  };

  // Cerrar período
  const cerrarPeriodo = async (cierreId) => {
    if (!confirm('¿Estás seguro de que quieres cerrar este período? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await Utils.apiRequest(`/cierres/${cierreId}/cerrar`, 'PUT');
      Utils.showAlert('Período cerrado correctamente', 'success');
      loadCierres();
      
    } catch (error) {
      console.error('Error al cerrar período:', error);
      Utils.showAlert('Error al cerrar período', 'error');
    }
  };

  // Ver detalle
  const verDetalle = (cierreId) => {
    const cierre = cierresData.find(c => c.id === cierreId);
    if (!cierre) return;

    Utils.showAlert(`Detalle del cierre ${getMonthName(cierre.mes)} ${cierre.año}`, 'info');
  };

  // Descargar reporte
  const descargarReporte = async (cierreId) => {
    try {
      const response = await Utils.apiRequest(`/cierres/${cierreId}/reporte`, 'GET', null, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(response);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `reporte-cierre-${cierreId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error al descargar reporte:', error);
      Utils.showAlert('Error al descargar reporte', 'error');
    }
  };

  // Public API
  return {
    loadCierres,
    cerrarPeriodo,
    verDetalle,
    descargarReporte
  };
})();