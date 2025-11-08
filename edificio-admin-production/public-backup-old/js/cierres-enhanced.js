// Gestión de Cierres Contables - Admin Panel (Enhanced Version)
class CierresManager {
  constructor() {
    this.cierres = [];
    this.fondos = {};
    this.cuotas = [];
    this.gastos = [];
    this.init();
  }

  async init() {
    try {
      // Mostrar loading state
      this.showLoading(true);
      
      // Cargar datos necesarios
      await Promise.all([
        this.loadCierres(),
        this.loadFondos(),
        this.loadCuotasMesActual(),
        this.loadGastosMesActual()
      ]);
      
      // Configurar event listeners
      this.setupEventListeners();
      
      // Renderizar cierres y actualizar contadores
      this.renderCierres();
      this.updateResumenFinanciero();
      this.initCharts();
      
      // Ocultar loading state
      this.showLoading(false);
    } catch (error) {
      console.error('Error inicializando CierresManager:', error);
      this.showError('Error al cargar los cierres. Por favor, intente nuevamente.');
      this.showLoading(false);
    }
  }

  async loadCierres() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/cierres', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.cierres = data.cierres || [];
    } catch (error) {
      console.error('Error cargando cierres:', error);
      throw error;
    }
  }
  
  async loadFondos() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/fondos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.fondos = data.fondos || {};
    } catch (error) {
      console.error('Error cargando fondos:', error);
      throw error;
    }
  }
  
  async loadCuotasMesActual() {
    try {
      const token = localStorage.getItem('token');
      const fecha = new Date();
      const mes = this.getNombreMes(fecha.getMonth() + 1);
      const año = fecha.getFullYear();
      
      const response = await fetch(`/api/cuotas/mes/${mes}/${año}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.cuotas = data.cuotas || [];
    } catch (error) {
      console.error('Error cargando cuotas del mes actual:', error);
      throw error;
    }
  }
  
  async loadGastosMesActual() {
    try {
      const token = localStorage.getItem('token');
      const fecha = new Date();
      const mes = this.getNombreMes(fecha.getMonth() + 1);
      const año = fecha.getFullYear();
      
      const response = await fetch(`/api/gastos/mes/${mes}/${año}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.gastos = data.gastos || [];
    } catch (error) {
      console.error('Error cargando gastos del mes actual:', error);
      throw error;
    }
  }

  setupEventListeners() {
    // Botones de generar cierres
    document.getElementById('btnGenerarCierreMensual')?.addEventListener('click', () => {
      this.showCierreMensualModal();
    });

    document.getElementById('btnGenerarCierreAnual')?.addEventListener('click', () => {
      this.showCierreAnualModal();
    });

    // Botones de confirmar generación de cierres
    document.getElementById('btnGenerarCierreMensualConfirmar')?.addEventListener('click', () => {
      this.handleCierreMensualSubmit();
    });
    
    document.getElementById('btnGenerarCierreAnualConfirmar')?.addEventListener('click', () => {
      this.handleCierreAnualSubmit();
    });

    // Filtros de cierres
    document.getElementById('filtroCierreTipo')?.addEventListener('change', () => {
      this.renderCierres();
    });

    document.getElementById('filtroCierreAño')?.addEventListener('change', () => {
      this.renderCierres();
    });
    
    document.getElementById('filtroCierreMes')?.addEventListener('change', () => {
      this.renderCierres();
    });

    document.getElementById('btnLimpiarFiltrosCierres')?.addEventListener('click', () => {
      this.resetFilters();
    });

    document.getElementById('btnFiltrarCierres')?.addEventListener('click', () => {
      this.renderCierres();
    });

    // Delegación de eventos para botones de acción en la tabla
    document.getElementById('cierresTableBody')?.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (!target) return;
      
      const cierreId = target.dataset.id;
      
      if (target.classList.contains('btn-view')) {
        this.viewCierre(cierreId);
      } else if (target.classList.contains('btn-export')) {
        this.exportCierre(cierreId);
      }
    });
    
    // Botón de exportar en el modal de detalle
    document.getElementById('btnExportarCierre')?.addEventListener('click', () => {
      const cierreId = document.getElementById('detalleCierreId')?.value;
      if (cierreId) {
        this.exportCierre(cierreId);
      }
    });
    
    // Botón de confirmar exportación en el modal de opciones
    document.getElementById('btnConfirmarExport')?.addEventListener('click', () => {
      this.handleExportOptionsSubmit();
    });
  }
  
  showCierreMensualModal() {
    const modal = new bootstrap.Modal(document.getElementById('cierreMensualModal'));
    const form = document.getElementById('cierreMensualForm');
    
    // Reset form
    form.reset();
    
    // Establecer mes y año actuales
    const fecha = new Date();
    document.getElementById('cierreMensualMes').value = this.getNombreMes(fecha.getMonth() + 1);
    document.getElementById('cierreMensualAño').value = fecha.getFullYear();
    
    modal.show();
  }
  
  showCierreAnualModal() {
    const modal = new bootstrap.Modal(document.getElementById('cierreAnualModal'));
    const form = document.getElementById('cierreAnualForm');
    
    // Reset form
    form.reset();
    
    // Establecer año actual
    document.getElementById('cierreAnualAño').value = new Date().getFullYear();
    
    modal.show();
  }
  
  async handleCierreMensualSubmit() {
    try {
      // Validar formulario
      if (!this.validateCierreMensualForm()) {
        return;
      }
      
      // Mostrar loading state
      this.showLoading(true, 'btnGenerarCierreMensualConfirmar', 'Generando...');
      
      // Preparar datos
      const cierreData = {
        mes: document.getElementById('cierreMensualMes').value,
        año: parseInt(document.getElementById('cierreMensualAño').value),
        observaciones: document.getElementById('cierreMensualObservaciones').value || ''
      };
      
      // Verificar si ya existe un cierre para este mes/año
      const cierreExistente = this.cierres.find(c => 
        c.mes === cierreData.mes && 
        c.año === cierreData.año && 
        c.tipo === 'mensual'
      );
      
      if (cierreExistente) {
        throw new Error(`Ya existe un cierre para ${cierreData.mes} ${cierreData.año}`);
      }
      
      // Enviar a la API
      const token = localStorage.getItem('token');
      const response = await fetch('/api/cierres/mensual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cierreData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || `Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Cerrar modal
      bootstrap.Modal.getInstance(document.getElementById('cierreMensualModal')).hide();
      
      // Mostrar mensaje de éxito
      this.showSuccess(`Cierre mensual de ${cierreData.mes} ${cierreData.año} generado correctamente`);
      
      // Recargar datos
      await Promise.all([
        this.loadCierres(),
        this.loadFondos()
      ]);
      
      this.renderCierres();
      this.updateResumenFinanciero();
      this.initCharts();
      
      // Mostrar detalle del cierre generado
      this.viewCierre(result.cierre.id);
    } catch (error) {
      console.error('Error generando cierre mensual:', error);
      this.showError(`Error al generar el cierre mensual: ${error.message}`);
    } finally {
      this.showLoading(false, 'btnGenerarCierreMensualConfirmar', '<i class="bi bi-check-circle me-2"></i> Generar Cierre');
    }
  }
  
  async handleCierreAnualSubmit() {
    try {
      // Validar formulario
      if (!this.validateCierreAnualForm()) {
        return;
      }
      
      // Mostrar loading state
      this.showLoading(true, 'btnGenerarCierreAnualConfirmar', 'Generando...');
      
      // Preparar datos
      const cierreData = {
        año: parseInt(document.getElementById('cierreAnualAño').value),
        observaciones: document.getElementById('cierreAnualObservaciones').value || ''
      };
      
      // Verificar si ya existe un cierre para este año
      const cierreExistente = this.cierres.find(c => 
        c.año === cierreData.año && 
        c.tipo === 'anual'
      );
      
      if (cierreExistente) {
        throw new Error(`Ya existe un cierre anual para ${cierreData.año}`);
      }
      
      // Verificar que existan cierres mensuales para este año
      const cierresMensuales = this.cierres.filter(c => 
        c.año === cierreData.año && 
        c.tipo === 'mensual'
      );
      
      if (cierresMensuales.length === 0) {
        throw new Error(`No existen cierres mensuales para el año ${cierreData.año}`);
      }
      
      // Enviar a la API
      const token = localStorage.getItem('token');
      const response = await fetch('/api/cierres/anual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cierreData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || `Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Cerrar modal
      bootstrap.Modal.getInstance(document.getElementById('cierreAnualModal')).hide();
      
      // Mostrar mensaje de éxito
      this.showSuccess(`Cierre anual de ${cierreData.año} generado correctamente`);
      
      // Recargar datos
      await Promise.all([
        this.loadCierres(),
        this.loadFondos()
      ]);
      
      this.renderCierres();
      this.updateResumenFinanciero();
      this.initCharts();
      
      // Mostrar detalle del cierre generado
      this.viewCierre(result.cierre.id);
    } catch (error) {
      console.error('Error generando cierre anual:', error);
      this.showError(`Error al generar el cierre anual: ${error.message}`);
    } finally {
      this.showLoading(false, 'btnGenerarCierreAnualConfirmar', '<i class="bi bi-check-circle me-2"></i> Generar Cierre Anual');
    }
  }
  
  validateCierreMensualForm() {
    const mes = document.getElementById('cierreMensualMes').value;
    const año = document.getElementById('cierreMensualAño').value;
    
    if (!mes) {
      this.showError('Debe seleccionar un mes');
      return false;
    }
    
    if (!año) {
      this.showError('Debe seleccionar un año');
      return false;
    }
    
    return true;
  }
  
  validateCierreAnualForm() {
    const año = document.getElementById('cierreAnualAño').value;
    
    if (!año) {
      this.showError('Debe seleccionar un año');
      return false;
    }
    
    return true;
  }
  
  async viewCierre(cierreId) {
    try {
      // Mostrar loading state
      this.showLoading(true);
      
      const cierre = this.cierres.find(c => c.id === cierreId);
      if (!cierre) {
        throw new Error('Cierre no encontrado');
      }
      
      const modal = new bootstrap.Modal(document.getElementById('detalleCierreModal'));
      const modalTitle = document.getElementById('detalleCierreModalLabel');
      const modalContent = document.getElementById('detalleCierreContenido');
      
      // Guardar ID del cierre para exportación
      const hiddenInput = document.createElement('input');
      hiddenInput.type = 'hidden';
      hiddenInput.id = 'detalleCierreId';
      hiddenInput.value = cierreId;
      modalContent.innerHTML = '';
      modalContent.appendChild(hiddenInput);
      
      // Establecer título
      const periodo = cierre.tipo === 'anual' ? 
        `Año ${cierre.año}` : 
        `${cierre.mes} ${cierre.año}`;
      
      modalTitle.textContent = `Detalle - Cierre ${cierre.tipo === 'anual' ? 'Anual' : 'Mensual'} - ${periodo}`;
      
      // Obtener detalles del cierre si no los tiene
      if (!cierre.detalles) {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/cierres/${cierreId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        cierre.detalles = data.cierre;
      }
      
      // Construir contenido
      const resumen = cierre.resumen || cierre.detalles?.resumen || {
        total_ingresos: 0,
        total_egresos: 0,
        balance: 0,
        cuotas_cobradas: 0,
        gastos_registrados: 0,
        detalle_ingresos: [],
        detalle_egresos: []
      };
      
      // Determinar clase para el balance
      const balanceClass = resumen.balance >= 0 ? 'success' : 'danger';
      
      // Formatear montos
      const formatMonto = (monto) => `$${monto.toLocaleString('es-MX')}`;
      
      // Construir HTML
      let html = `
        <div class="row mb-4">
          <div class="col-md-4">
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="text-muted mb-2">Ingresos Totales</h6>
                    <h4 class="mb-0 text-success">${formatMonto(resumen.total_ingresos)}</h4>
                    <small class="text-muted">Cuotas cobradas: ${resumen.cuotas_cobradas || 0}</small>
                  </div>
                  <div class="bg-success bg-opacity-10 p-3 rounded">
                    <i class="bi bi-arrow-up-circle text-success fs-3"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="text-muted mb-2">Egresos Totales</h6>
                    <h4 class="mb-0 text-danger">${formatMonto(resumen.total_egresos)}</h4>
                    <small class="text-muted">Gastos registrados: ${resumen.gastos_registrados || 0}</small>
                  </div>
                  <div class="bg-danger bg-opacity-10 p-3 rounded">
                    <i class="bi bi-arrow-down-circle text-danger fs-3"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="text-muted mb-2">Balance Final</h6>
                    <h4 class="mb-0 text-${balanceClass}">${formatMonto(resumen.balance)}</h4>
                    <small class="text-muted">${resumen.balance >= 0 ? 'Superávit' : 'Déficit'}</small>
                  </div>
                  <div class="bg-${balanceClass} bg-opacity-10 p-3 rounded">
                    <i class="bi bi-calculator text-${balanceClass} fs-3"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Gráfico de ingresos vs egresos
      html += `
        <div class="row mb-4">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white">
                <h5 class="card-title mb-0">Distribución de Ingresos vs Egresos</h5>
              </div>
              <div class="card-body">
                <canvas id="detalleCierreChart" height="200"></canvas>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Detalles de ingresos y egresos
      html += `
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-white">
                <h5 class="card-title mb-0">Detalle de Ingresos</h5>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>Concepto</th>
                        <th class="text-end">Cantidad</th>
                        <th class="text-end">Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${(resumen.detalle_ingresos || []).map(item => `
                        <tr>
                          <td>${item.concepto}</td>
                          <td class="text-end">${item.cantidad}</td>
                          <td class="text-end">${formatMonto(item.monto)}</td>
                        </tr>
                      `).join('') || '<tr><td colspan="3" class="text-center">No hay datos disponibles</td></tr>'}
                    </tbody>
                    <tfoot>
                      <tr class="table-light">
                        <th>Total</th>
                        <th class="text-end">${resumen.cuotas_cobradas || 0}</th>
                        <th class="text-end">${formatMonto(resumen.total_ingresos)}</th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-white">
                <h5 class="card-title mb-0">Detalle de Egresos</h5>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>Categoría</th>
                        <th class="text-end">Cantidad</th>
                        <th class="text-end">Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${(resumen.detalle_egresos || []).map(item => `
                        <tr>
                          <td>${item.categoria}</td>
                          <td class="text-end">${item.cantidad}</td>
                          <td class="text-end">${formatMonto(item.monto)}</td>
                        </tr>
                      `).join('') || '<tr><td colspan="3" class="text-center">No hay datos disponibles</td></tr>'}
                    </tbody>
                    <tfoot>
                      <tr class="table-light">
                        <th>Total</th>
                        <th class="text-end">${resumen.gastos_registrados || 0}</th>
                        <th class="text-end">${formatMonto(resumen.total_egresos)}</th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Estado de fondos
      if (cierre.fondos) {
        html += `
          <div class="row mb-4">
            <div class="col-12">
              <div class="card border-0 shadow-sm">
                <div class="card-header bg-white">
                  <h5 class="card-title mb-0">Estado de Fondos</h5>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-3">
                      <div class="text-center mb-3">
                        <h6 class="text-muted">Fondo Ahorro</h6>
                        <h4>${formatMonto(cierre.fondos.ahorroAcumulado)}</h4>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="text-center mb-3">
                        <h6 class="text-muted">Gastos Mayores</h6>
                        <h4>${formatMonto(cierre.fondos.gastosMayores)}</h4>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="text-center mb-3">
                        <h6 class="text-muted">Dinero Operacional</h6>
                        <h4>${formatMonto(cierre.fondos.dineroOperacional)}</h4>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="text-center mb-3">
                        <h6 class="text-muted">Patrimonio Total</h6>
                        <h4>${formatMonto(cierre.fondos.patrimonioTotal)}</h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      }
      
      // Observaciones
      if (cierre.observaciones) {
        html += `
          <div class="row">
            <div class="col-12">
              <div class="card border-0 shadow-sm">
                <div class="card-header bg-white">
                  <h5 class="card-title mb-0">Observaciones</h5>
                </div>
                <div class="card-body">
                  <p class="mb-0">${cierre.observaciones}</p>
                </div>
              </div>
            </div>
          </div>
        `;
      }
      
      // Agregar HTML al modal
      modalContent.innerHTML += html;
      
      // Mostrar modal
      modal.show();
      
      // Inicializar gráfico
      this.initDetalleChart(resumen);
      
      // Ocultar loading state
      this.showLoading(false);
    } catch (error) {
      console.error('Error mostrando detalle del cierre:', error);
      this.showError(`Error al mostrar el detalle del cierre: ${error.message}`);
      this.showLoading(false);
    }
  }
  
  initDetalleChart(resumen) {
    const ctx = document.getElementById('detalleCierreChart');
    if (!ctx) return;
    
    // Destruir gráfico existente si hay
    if (this.detalleChart) {
      this.detalleChart.destroy();
    }
    
    // Preparar datos para el gráfico
    const ingresos = resumen.detalle_ingresos || [];
    const egresos = resumen.detalle_egresos || [];
    
    const ingresosLabels = ingresos.map(i => i.concepto);
    const ingresosData = ingresos.map(i => i.monto);
    
    const egresosLabels = egresos.map(e => e.categoria);
    const egresosData = egresos.map(e => e.monto);
    
    // Crear gráfico
    this.detalleChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Ingresos', 'Egresos'],
        datasets: [
          {
            label: 'Monto',
            data: [resumen.total_ingresos, resumen.total_egresos],
            backgroundColor: ['rgba(40, 167, 69, 0.7)', 'rgba(220, 53, 69, 0.7)'],
            borderColor: ['rgba(40, 167, 69, 1)', 'rgba(220, 53, 69, 1)'],
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$' + value.toLocaleString('es-MX');
              }
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return '$' + context.raw.toLocaleString('es-MX');
              }
            }
          },
          legend: {
            display: false
          }
        }
      }
    });
    
    // Crear gráficos de distribución si hay datos
    if (egresos.length > 0) {
      this.initDistribucionEgresosChart(egresos);
    }
  }
  
  initDistribucionEgresosChart(egresos) {
    // Crear elemento para el gráfico si no existe
    if (!document.getElementById('distribucionEgresosChart')) {
      const chartRow = document.createElement('div');
      chartRow.className = 'row mb-4';
      chartRow.innerHTML = `
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white">
              <h5 class="card-title mb-0">Distribución de Egresos por Categoría</h5>
            </div>
            <div class="card-body">
              <canvas id="distribucionEgresosChart" height="250"></canvas>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white">
              <h5 class="card-title mb-0">Indicadores de Salud Financiera</h5>
            </div>
            <div class="card-body">
              <div id="indicadoresFinancieros"></div>
            </div>
          </div>
        </div>
      `;
      
      // Insertar después del gráfico principal
      const mainChartRow = document.getElementById('detalleCierreChart').closest('.row');
      mainChartRow.parentNode.insertBefore(chartRow, mainChartRow.nextSibling);
    }
    
    const ctx = document.getElementById('distribucionEgresosChart');
    if (!ctx) return;
    
    // Destruir gráfico existente si hay
    if (this.distribucionEgresosChart) {
      this.distribucionEgresosChart.destroy();
    }
    
    // Agrupar egresos por categoría
    const categorias = {};
    egresos.forEach(egreso => {
      if (!categorias[egreso.categoria]) {
        categorias[egreso.categoria] = 0;
      }
      categorias[egreso.categoria] += egreso.monto;
    });
    
    // Preparar datos para el gráfico
    const labels = Object.keys(categorias);
    const data = Object.values(categorias);
    
    // Colores para las categorías
    const backgroundColors = [
      'rgba(255, 99, 132, 0.7)',
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(153, 102, 255, 0.7)',
      'rgba(255, 159, 64, 0.7)',
      'rgba(199, 199, 199, 0.7)',
      'rgba(83, 102, 255, 0.7)',
      'rgba(40, 167, 69, 0.7)',
      'rgba(220, 53, 69, 0.7)'
    ];
    
    // Crear gráfico
    this.distribucionEgresosChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: backgroundColors.slice(0, labels.length),
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${context.label}: $${value.toLocaleString('es-MX')} (${percentage}%)`;
              }
            }
          },
          legend: {
            position: 'right',
            labels: {
              boxWidth: 15
            }
          }
        }
      }
    });
    
    // Calcular y mostrar indicadores financieros
    this.mostrarIndicadoresFinancieros();
  }
  
  mostrarIndicadoresFinancieros() {
    const indicadoresContainer = document.getElementById('indicadoresFinancieros');
    if (!indicadoresContainer) return;
    
    // Obtener datos necesarios
    const ingresosMes = this.cuotas
      .filter(c => c.estado === 'PAGADO')
      .reduce((total, cuota) => total + cuota.monto, 0);
    
    const egresosMes = this.gastos
      .reduce((total, gasto) => total + gasto.monto, 0);
    
    const balanceMes = ingresosMes - egresosMes;
    
    // Calcular indicadores
    const tasaCobertura = ingresosMes > 0 ? (ingresosMes / egresosMes) * 100 : 0;
    const porcentajeGastosFondos = this.fondos.patrimonioTotal > 0 ? 
      (egresosMes / this.fondos.patrimonioTotal) * 100 : 0;
    
    const cuotasPendientes = this.cuotas
      .filter(c => c.estado !== 'PAGADO')
      .length;
    
    const porcentajeCuotasPendientes = this.cuotas.length > 0 ? 
      (cuotasPendientes / this.cuotas.length) * 100 : 0;
    
    // Determinar estado de cada indicador
    const getEstadoIndicador = (valor, tipo) => {
      switch (tipo) {
        case 'tasaCobertura':
          return valor >= 120 ? 'success' : (valor >= 100 ? 'warning' : 'danger');
        case 'porcentajeGastosFondos':
          return valor <= 5 ? 'success' : (valor <= 10 ? 'warning' : 'danger');
        case 'porcentajeCuotasPendientes':
          return valor <= 10 ? 'success' : (valor <= 20 ? 'warning' : 'danger');
        default:
          return 'secondary';
      }
    };
    
    // Construir HTML
    indicadoresContainer.innerHTML = `
      <div class="mb-3">
        <h6>Tasa de Cobertura (Ingresos/Egresos)</h6>
        <div class="progress" style="height: 25px;">
          <div class="progress-bar bg-${getEstadoIndicador(tasaCobertura, 'tasaCobertura')}" 
               role="progressbar" 
               style="width: ${Math.min(tasaCobertura, 200)}%;" 
               aria-valuenow="${tasaCobertura}" 
               aria-valuemin="0" 
               aria-valuemax="200">
            ${tasaCobertura.toFixed(1)}%
          </div>
        </div>
        <small class="text-muted">
          ${tasaCobertura >= 100 ? 
            'Los ingresos cubren todos los gastos' : 
            'Los ingresos no cubren todos los gastos'}
        </small>
      </div>
      
      <div class="mb-3">
        <h6>Porcentaje de Gastos sobre Fondos</h6>
        <div class="progress" style="height: 25px;">
          <div class="progress-bar bg-${getEstadoIndicador(porcentajeGastosFondos, 'porcentajeGastosFondos')}" 
               role="progressbar" 
               style="width: ${Math.min(porcentajeGastosFondos, 100)}%;" 
               aria-valuenow="${porcentajeGastosFondos}" 
               aria-valuemin="0" 
               aria-valuemax="100">
            ${porcentajeGastosFondos.toFixed(1)}%
          </div>
        </div>
        <small class="text-muted">
          ${porcentajeGastosFondos <= 5 ? 
            'Nivel de gasto saludable' : 
            (porcentajeGastosFondos <= 10 ? 
              'Nivel de gasto moderado' : 
              'Nivel de gasto elevado')}
        </small>
      </div>
      
      <div class="mb-3">
        <h6>Porcentaje de Cuotas Pendientes</h6>
        <div class="progress" style="height: 25px;">
          <div class="progress-bar bg-${getEstadoIndicador(porcentajeCuotasPendientes, 'porcentajeCuotasPendientes')}" 
               role="progressbar" 
               style="width: ${Math.min(porcentajeCuotasPendientes, 100)}%;" 
               aria-valuenow="${porcentajeCuotasPendientes}" 
               aria-valuemin="0" 
               aria-valuemax="100">
            ${porcentajeCuotasPendientes.toFixed(1)}%
          </div>
        </div>
        <small class="text-muted">
          ${porcentajeCuotasPendientes <= 10 ? 
            'Excelente tasa de cobro' : 
            (porcentajeCuotasPendientes <= 20 ? 
              'Tasa de cobro aceptable' : 
              'Alta tasa de morosidad')}
        </small>
      </div>
      
      <div class="alert alert-${balanceMes >= 0 ? 'success' : 'warning'} mt-3 mb-0">
        <i class="bi bi-info-circle me-2"></i>
        <strong>Diagnóstico:</strong> 
        ${balanceMes >= 0 ? 
          'La situación financiera es estable. Los ingresos cubren los gastos del período.' : 
          'Situación financiera con déficit. Los gastos superan los ingresos del período.'}
      </div>
    `;
  }
  
  async exportCierre(cierreId) {
    try {
      // Obtener datos del cierre
      const cierre = this.cierres.find(c => c.id === cierreId);
      if (!cierre) {
        throw new Error('Cierre no encontrado');
      }
      
      // Guardar ID del cierre en el modal de opciones
      document.getElementById('exportCierreId').value = cierreId;
      
      // Mostrar modal de opciones de exportación
      const modal = new bootstrap.Modal(document.getElementById('exportOptionsModal'));
      modal.show();
    } catch (error) {
      console.error('Error preparando exportación:', error);
      this.showError(`Error al preparar la exportación: ${error.message}`);
    }
  }
  
  async handleExportOptionsSubmit() {
    try {
      // Mostrar loading state
      this.showLoading(true);
      
      // Obtener ID del cierre
      const cierreId = document.getElementById('exportCierreId').value;
      if (!cierreId) {
        throw new Error('ID de cierre no encontrado');
      }
      
      // Obtener cierre
      const cierre = this.cierres.find(c => c.id === cierreId);
      if (!cierre) {
        throw new Error('Cierre no encontrado');
      }
      
      // Obtener opciones de exportación
      const options = {
        formato: document.querySelector('input[name="formato"]:checked').value,
        incluirResumen: document.getElementById('incluirResumen').checked,
        incluirDetalleIngresos: document.getElementById('incluirDetalleIngresos').checked,
        incluirDetalleEgresos: document.getElementById('incluirDetalleEgresos').checked,
        incluirGraficos: document.getElementById('incluirGraficos').checked,
        incluirIndicadores: document.getElementById('incluirIndicadores').checked,
        tituloPersonalizado: document.getElementById('tituloPersonalizado').value,
        notasAdicionales: document.getElementById('notasAdicionales').value
      };
      
      // Cerrar modal
      bootstrap.Modal.getInstance(document.getElementById('exportOptionsModal')).hide();
      
      // Enviar a la API
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/cierres/${cierreId}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(options)
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      // Obtener blob
      const blob = await response.blob();
      
      // Determinar extensión según formato
      const extension = options.formato === 'excel' ? 'xlsx' : 'pdf';
      
      // Crear URL para el blob
      const url = window.URL.createObjectURL(blob);
      
      // Crear enlace para descargar
      const a = document.createElement('a');
      a.href = url;
      a.download = `cierre_${cierre.tipo}_${cierre.año}${cierre.mes ? '_' + cierre.mes : ''}.${extension}`;
      document.body.appendChild(a);
      
      // Simular clic para descargar
      a.click();
      
      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Mostrar mensaje de éxito
      this.showSuccess(`Cierre exportado correctamente en formato ${options.formato.toUpperCase()}`);
    } catch (error) {
      console.error('Error exportando cierre:', error);
      this.showError(`Error al exportar el cierre: ${error.message}`);
    } finally {
      this.showLoading(false);
    }
  }
  
  renderCierres() {
    const tbody = document.getElementById('cierresTableBody');
    if (!tbody) return;
    
    // Obtener filtros
    const filtroTipo = document.getElementById('filtroCierreTipo').value;
    const filtroAño = document.getElementById('filtroCierreAño').value;
    const filtroMes = document.getElementById('filtroCierreMes').value;
    
    // Aplicar filtros
    let cierresFiltrados = [...this.cierres];
    
    if (filtroTipo) {
      cierresFiltrados = cierresFiltrados.filter(c => c.tipo === filtroTipo);
    }
    
    if (filtroAño) {
      cierresFiltrados = cierresFiltrados.filter(c => c.año === parseInt(filtroAño));
    }
    
    if (filtroMes) {
      cierresFiltrados = cierresFiltrados.filter(c => c.mes === filtroMes);
    }
    
    // Ordenar por fecha (más recientes primero)
    cierresFiltrados.sort((a, b) => {
      // Primero por año (descendente)
      if (b.año !== a.año) {
        return b.año - a.año;
      }
      
      // Si es el mismo año, ordenar por mes (si tienen mes)
      if (a.mes && b.mes) {
        const meses = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        return meses.indexOf(b.mes) - meses.indexOf(a.mes);
      }
      
      // Si uno es anual y otro mensual, el anual va primero
      if (a.tipo !== b.tipo) {
        return a.tipo === 'anual' ? -1 : 1;
      }
      
      // Por fecha de creación
      return new Date(b.fechaCreacion || b.fecha) - new Date(a.fechaCreacion || a.fecha);
    });
    
    // Actualizar contador
    document.getElementById('totalCierres').textContent = cierresFiltrados.length;
    
    // Renderizar tabla
    if (cierresFiltrados.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-4">
            <p class="text-muted mb-0">No se encontraron cierres con los filtros seleccionados</p>
          </td>
        </tr>
      `;
      return;
    }
    
    tbody.innerHTML = cierresFiltrados.map(cierre => {
      // Formatear período
      const periodo = cierre.tipo === 'anual' ? 
        `Año ${cierre.año}` : 
        `${cierre.mes} ${cierre.año}`;
      
      // Determinar clase para el balance
      const resumen = cierre.resumen || {
        total_ingresos: 0,
        total_egresos: 0,
        balance: 0
      };
      
      const balanceClass = resumen.balance >= 0 ? 'success' : 'danger';
      
      // Formatear montos
      const formatMonto = (monto) => `$${monto.toLocaleString('es-MX')}`;
      
      return `
        <tr>
          <td>${cierre.id}</td>
          <td>
            <span class="badge bg-${cierre.tipo === 'anual' ? 'primary' : 'info'}">
              ${cierre.tipo === 'anual' ? 'ANUAL' : 'MENSUAL'}
            </span>
          </td>
          <td>${periodo}</td>
          <td class="text-end">${formatMonto(resumen.total_ingresos)}</td>
          <td class="text-end">${formatMonto(resumen.total_egresos)}</td>
          <td>
            <span class="badge bg-${balanceClass}">
              ${formatMonto(resumen.balance)}
            </span>
            <small class="d-block">${resumen.balance >= 0 ? 'Superávit' : 'Déficit'}</small>
          </td>
          <td>${new Date(cierre.fechaCreacion || cierre.fecha).toLocaleDateString('es-MX')}</td>
          <td>
            <div class="btn-group">
              <button type="button" class="btn btn-sm btn-outline-primary btn-view" data-id="${cierre.id}" title="Ver detalle">
                <i class="bi bi-eye"></i>
              </button>
              <button type="button" class="btn btn-sm btn-outline-secondary btn-export" data-id="${cierre.id}" title="Exportar PDF">
                <i class="bi bi-download"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }
  
  updateResumenFinanciero() {
    // Calcular ingresos del mes actual (cuotas pagadas)
    const ingresosMes = this.cuotas
      .filter(c => c.estado === 'PAGADO')
      .reduce((total, cuota) => total + cuota.monto, 0);
    
    // Calcular egresos del mes actual (gastos)
    const egresosMes = this.gastos
      .reduce((total, gasto) => total + gasto.monto, 0);
    
    // Calcular balance
    const balanceMes = ingresosMes - egresosMes;
    
    // Actualizar elementos en la UI
    document.getElementById('ingresosMesActual').textContent = `$${ingresosMes.toLocaleString('es-MX')}`;
    document.getElementById('egresosMesActual').textContent = `$${egresosMes.toLocaleString('es-MX')}`;
    document.getElementById('balanceMesActual').textContent = `$${balanceMes.toLocaleString('es-MX')}`;
  }
  
  initCharts() {
    const ctx = document.getElementById('cierresChart');
    if (!ctx) return;
    
    // Destruir gráfico existente si hay
    if (this.cierresChart) {
      this.cierresChart.destroy();
    }
    
    // Obtener datos de los últimos 6 meses
    const cierresMensuales = this.cierres
      .filter(c => c.tipo === 'mensual')
      .sort((a, b) => {
        // Ordenar por año y mes
        if (a.año !== b.año) {
          return a.año - b.año;
        }
        
        const meses = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        return meses.indexOf(a.mes) - meses.indexOf(b.mes);
      })
      .slice(-6); // Últimos 6 meses
    
    // Preparar datos para el gráfico
    const labels = cierresMensuales.map(c => `${c.mes.substring(0, 3)} ${c.año}`);
    const ingresosData = cierresMensuales.map(c => (c.resumen?.total_ingresos || 0));
    const egresosData = cierresMensuales.map(c => (c.resumen?.total_egresos || 0));
    
    // Crear gráfico
    this.cierresChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Ingresos',
            data: ingresosData,
            backgroundColor: 'rgba(40, 167, 69, 0.7)',
            borderColor: 'rgba(40, 167, 69, 1)',
            borderWidth: 1
          },
          {
            label: 'Egresos',
            data: egresosData,
            backgroundColor: 'rgba(220, 53, 69, 0.7)',
            borderColor: 'rgba(220, 53, 69, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$' + value.toLocaleString('es-MX');
              }
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': $' + context.raw.toLocaleString('es-MX');
              }
            }
          }
        }
      }
    });
  }
  
  resetFilters() {
    document.getElementById('filtroCierreTipo').value = '';
    document.getElementById('filtroCierreAño').value = '';
    document.getElementById('filtroCierreMes').value = '';
    this.renderCierres();
  }
  
  getNombreMes(numeroMes) {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[numeroMes - 1] || '';
  }
  
  showLoading(show, buttonId = null, loadingText = null) {
    // Spinner global
    const loadingSpinner = document.createElement('div');
    loadingSpinner.id = 'loadingSpinner';
    loadingSpinner.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75';
    loadingSpinner.style.zIndex = '9999';
    loadingSpinner.innerHTML = `
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    `;
    
    // Remover spinner existente
    document.getElementById('loadingSpinner')?.remove();
    
    // Mostrar u ocultar spinner
    if (show) {
      document.body.appendChild(loadingSpinner);
    }
    
    // Si se especificó un botón, actualizar su estado
    if (buttonId) {
      const button = document.getElementById(buttonId);
      if (button) {
        button.disabled = show;
        if (loadingText && show) {
          button.dataset.originalText = button.innerHTML;
          button.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ${loadingText}
          `;
        } else if (button.dataset.originalText) {
          button.innerHTML = button.dataset.originalText;
          delete button.dataset.originalText;
        }
      }
    }
  }

  showError(message) {
    // Crear alerta
    const alertElement = document.createElement('div');
    alertElement.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 end-0 m-3';
    alertElement.style.zIndex = '9999';
    alertElement.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Añadir a la página
    document.body.appendChild(alertElement);
    
    // Auto-cerrar después de 5 segundos
    setTimeout(() => {
      alertElement.remove();
    }, 5000);
  }

  showSuccess(message) {
    // Crear alerta
    const alertElement = document.createElement('div');
    alertElement.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 end-0 m-3';
    alertElement.style.zIndex = '9999';
    alertElement.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Añadir a la página
    document.body.appendChild(alertElement);
    
    // Auto-cerrar después de 3 segundos
    setTimeout(() => {
      alertElement.remove();
    }, 3000);
  }
}

// Inicializar cuando se carga la página o se cambia a la sección de cierres
document.addEventListener('DOMContentLoaded', () => {
  let cierresManager = null;
  
  // Función para inicializar el gestor de cierres
  const initCierresManager = () => {
    if (!cierresManager) {
      cierresManager = new CierresManager();
    }
  };
  
  // Inicializar si la sección de cierres está activa al cargar
  const cierresSection = document.getElementById('cierresSection');
  if (cierresSection && cierresSection.classList.contains('active')) {
    initCierresManager();
  }
  
  // Inicializar cuando se hace clic en el enlace de cierres
  document.querySelectorAll('a[data-section="cierres"]').forEach(link => {
    link.addEventListener('click', () => {
      initCierresManager();
    });
  });
  
  // Observar cambios en la visibilidad de la sección
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.target.id === 'cierresSection' && 
          mutation.attributeName === 'class' && 
          mutation.target.classList.contains('active')) {
        initCierresManager();
      }
    });
  });
  
  if (cierresSection) {
    observer.observe(cierresSection, { attributes: true });
  }
});