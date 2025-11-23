// presupuestos.js - Gestión de presupuestos

// Clase para manejar la gestión de presupuestos
class PresupuestosManager {
    constructor() {
        this.presupuestos = [];
        this.estadisticas = null;
        this.alertas = [];
        this.presupuestoModal = new bootstrap.Modal(document.getElementById('presupuestoModal'));
        this.detallePresupuestoModal = new bootstrap.Modal(document.getElementById('detallePresupuestoModal'));
        this.charts = {};
    }

    // Inicializar gestor
    init() {
        this.setupEventListeners();
    }

    // Configurar listeners de eventos
    setupEventListeners() {
        // Botón guardar presupuesto
        const btnGuardarPresupuesto = document.getElementById('btnGuardarPresupuesto');
        if (btnGuardarPresupuesto) {
            btnGuardarPresupuesto.addEventListener('click', () => this.guardarPresupuesto());
        }

        // Botón filtrar presupuestos
        const btnFiltrarPresupuestos = document.getElementById('btnFiltrarPresupuestos');
        if (btnFiltrarPresupuestos) {
            btnFiltrarPresupuestos.addEventListener('click', () => this.filtrarPresupuestos());
        }

        // Botón limpiar filtros
        const btnLimpiarFiltrosPresupuestos = document.getElementById('btnLimpiarFiltrosPresupuestos');
        if (btnLimpiarFiltrosPresupuestos) {
            btnLimpiarFiltrosPresupuestos.addEventListener('click', () => this.limpiarFiltros());
        }

        // Botón exportar presupuesto
        const btnExportarPresupuesto = document.getElementById('btnExportarPresupuesto');
        if (btnExportarPresupuesto) {
            btnExportarPresupuesto.addEventListener('click', () => this.exportarPresupuesto());
        }
    }

    // Cargar presupuestos
    async loadPresupuestos() {
        try {
            // Mostrar indicador de carga
            const tableBody = document.getElementById('presupuestosTableBody');
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="8" class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div><p class="mt-2 text-muted">Cargando presupuestos...</p></td></tr>';
            }

            // Obtener filtros actuales
            const anio = document.getElementById('filtroPresupuestoAnio')?.value || '';
            const categoria = document.getElementById('filtroPresupuestoCategoria')?.value || '';
            const estado = document.getElementById('filtroPresupuestoEstado')?.value || '';

            // Construir URL con filtros
            let url = `${API_URL}/presupuestos`;
            const params = new URLSearchParams();
            if (anio) params.append('anio', anio);
            if (categoria) params.append('categoria', categoria);
            if (estado) params.append('estado', estado);
            if (params.toString()) url += `?${params.toString()}`;

            // Cargar presupuestos
            const response = await fetchAuth(url);
            this.presupuestos = response.presupuestos || [];
            
            // Cargar estadísticas
            await this.loadEstadisticas(anio || new Date().getFullYear());
            
            // Cargar alertas
            await this.loadAlertas();
            
            // Renderizar tabla y estadísticas
            this.renderPresupuestosTable();
            this.renderEstadisticas();
            this.renderAlertas();
            this.renderGraficos();
        } catch (error) {
            console.error('Error al cargar presupuestos:', error);
            showAlert('alertContainer', 'Error al cargar presupuestos', 'danger');
        }
    }

    // Cargar estadísticas de presupuestos
    async loadEstadisticas(anio) {
        try {
            const url = `${API_URL}/presupuestos/estadisticas/resumen${anio ? `?anio=${anio}` : ''}`;
            const response = await fetchAuth(url);
            this.estadisticas = response.estadisticas || null;
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
            this.estadisticas = null;
        }
    }

    // Cargar alertas de presupuestos
    async loadAlertas() {
        try {
            const response = await fetchAuth(`${API_URL}/presupuestos/alertas/exceso`);
            this.alertas = response.alertas || [];
        } catch (error) {
            console.error('Error al cargar alertas:', error);
            this.alertas = [];
        }
    }

    // Renderizar tabla de presupuestos
    renderPresupuestosTable() {
        const tableBody = document.getElementById('presupuestosTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (this.presupuestos.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="8" class="text-center">No hay presupuestos registrados</td>';
            tableBody.appendChild(tr);
            return;
        }
        
        this.presupuestos.forEach(presupuesto => {
            const tr = document.createElement('tr');
            
            // Formatear fecha
            const fecha = new Date(presupuesto.fecha_creacion);
            const fechaStr = fecha.toLocaleDateString();
            
            // Determinar clase de estado
            let estadoClass = 'bg-secondary';
            if (presupuesto.estado === 'aprobado') estadoClass = 'bg-success';
            else if (presupuesto.estado === 'rechazado') estadoClass = 'bg-danger';
            else if (presupuesto.estado === 'borrador') estadoClass = 'bg-warning';
            
            // Calcular porcentaje de ejecución
            const porcentajeEjecucion = presupuesto.porcentaje_ejecucion;
            
            // Determinar clase de progreso
            let progressClass = 'bg-info';
            if (porcentajeEjecucion > 90) progressClass = 'bg-danger';
            else if (porcentajeEjecucion > 70) progressClass = 'bg-warning';
            
            tr.innerHTML = `
                <td>${presupuesto.id}</td>
                <td>${presupuesto.titulo}</td>
                <td><span class="badge bg-secondary">${presupuesto.categoria}</span></td>
                <td>$${presupuesto.monto.toLocaleString()}</td>
                <td>
                    <div class="progress" style="height: 10px;">
                        <div class="progress-bar ${progressClass}" role="progressbar" style="width: ${porcentajeEjecucion}%;" 
                            aria-valuenow="${porcentajeEjecucion}" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    <small class="d-block mt-1">$${presupuesto.monto_ejecutado.toLocaleString()} (${porcentajeEjecucion}%)</small>
                </td>
                <td>${presupuesto.anio}</td>
                <td><span class="badge ${estadoClass}">${this.formatEstado(presupuesto.estado)}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" data-action="view" data-id="${presupuesto.id}" title="Ver detalles">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-primary me-1" data-action="edit" data-id="${presupuesto.id}" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${presupuesto.id}" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(tr);
        });
        
        // Configurar botones de acción
        tableBody.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = button.getAttribute('data-action');
                const id = parseInt(button.getAttribute('data-id'));
                
                if (action === 'view') {
                    this.verDetallePresupuesto(id);
                } else if (action === 'edit') {
                    this.editarPresupuesto(id);
                } else if (action === 'delete') {
                    this.eliminarPresupuesto(id);
                }
            });
        });
    }

    // Renderizar estadísticas
    renderEstadisticas() {
        if (!this.estadisticas) return;
        
        // Actualizar tarjetas de resumen
        const totalPresupuestado = document.getElementById('totalPresupuestado');
        const totalEjecutado = document.getElementById('totalEjecutado');
        const totalDisponible = document.getElementById('totalDisponible');
        const porcentajeEjecucionTotal = document.getElementById('porcentajeEjecucionTotal');
        
        if (totalPresupuestado) totalPresupuestado.textContent = `$${this.estadisticas.total.toLocaleString()}`;
        if (totalEjecutado) totalEjecutado.textContent = `$${this.estadisticas.ejecutado.toLocaleString()}`;
        if (totalDisponible) totalDisponible.textContent = `$${this.estadisticas.disponible.toLocaleString()}`;
        if (porcentajeEjecucionTotal) {
            porcentajeEjecucionTotal.textContent = `${this.estadisticas.porcentajeEjecucion}%`;
            
            // Actualizar clase según porcentaje
            porcentajeEjecucionTotal.className = 'mb-0';
            if (parseFloat(this.estadisticas.porcentajeEjecucion) > 90) {
                porcentajeEjecucionTotal.classList.add('text-danger');
            } else if (parseFloat(this.estadisticas.porcentajeEjecucion) > 70) {
                porcentajeEjecucionTotal.classList.add('text-warning');
            } else {
                porcentajeEjecucionTotal.classList.add('text-success');
            }
        }
    }

    // Renderizar alertas
    renderAlertas() {
        const alertasContainer = document.getElementById('alertasPresupuestoContainer');
        if (!alertasContainer) return;
        
        alertasContainer.innerHTML = '';
        
        if (this.alertas.length === 0) {
            alertasContainer.innerHTML = `
                <div class="alert alert-success">
                    <i class="bi bi-check-circle me-2"></i> No hay alertas de presupuesto
                </div>
            `;
            return;
        }
        
        this.alertas.forEach(alerta => {
            const alertaEl = document.createElement('div');
            alertaEl.className = `alert alert-${alerta.tipo === 'critico' ? 'danger' : 'warning'} mb-2`;
            alertaEl.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <i class="bi bi-${alerta.tipo === 'critico' ? 'exclamation-triangle' : 'exclamation-circle'} me-2"></i>
                        ${alerta.mensaje}
                    </div>
                    <button class="btn btn-sm btn-outline-${alerta.tipo === 'critico' ? 'danger' : 'warning'}" 
                        data-action="view-alerta" data-id="${alerta.presupuesto.id}">
                        Ver detalles
                    </button>
                </div>
            `;
            
            alertasContainer.appendChild(alertaEl);
        });
        
        // Configurar botones de acción
        alertasContainer.querySelectorAll('[data-action="view-alerta"]').forEach(button => {
            button.addEventListener('click', () => {
                const id = parseInt(button.getAttribute('data-id'));
                this.verDetallePresupuesto(id);
            });
        });
    }

    // Renderizar gráficos
    renderGraficos() {
        this.renderGraficoEjecucion();
        this.renderGraficoCategoria();
    }

    // Renderizar gráfico de ejecución presupuestaria
    renderGraficoEjecucion() {
        const canvas = document.getElementById('presupuestoEjecucionChart');
        if (!canvas || !this.estadisticas) return;
        
        // Destruir gráfico existente si hay
        if (this.charts.ejecucion) {
            this.charts.ejecucion.destroy();
        }
        
        // Crear datos para el gráfico
        const data = {
            labels: ['Ejecutado', 'Disponible'],
            datasets: [{
                data: [this.estadisticas.ejecutado, this.estadisticas.disponible],
                backgroundColor: ['#dc3545', '#0d6efd'],
                hoverBackgroundColor: ['#bb2d3b', '#0a58ca']
            }]
        };
        
        // Configuración del gráfico
        const config = {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `$${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '70%'
            }
        };
        
        // Crear gráfico
        this.charts.ejecucion = new Chart(canvas, config);
    }

    // Renderizar gráfico por categoría
    renderGraficoCategoria() {
        const canvas = document.getElementById('presupuestoCategoriaChart');
        if (!canvas || !this.estadisticas || !this.estadisticas.porCategoria) return;
        
        // Destruir gráfico existente si hay
        if (this.charts.categoria) {
            this.charts.categoria.destroy();
        }
        
        // Preparar datos para el gráfico
        const categorias = Object.keys(this.estadisticas.porCategoria);
        const presupuestados = categorias.map(cat => this.estadisticas.porCategoria[cat].presupuestado);
        const ejecutados = categorias.map(cat => this.estadisticas.porCategoria[cat].ejecutado);
        
        // Crear datos para el gráfico
        const data = {
            labels: categorias,
            datasets: [
                {
                    label: 'Presupuestado',
                    data: presupuestados,
                    backgroundColor: '#0d6efd',
                    borderColor: '#0a58ca',
                    borderWidth: 1
                },
                {
                    label: 'Ejecutado',
                    data: ejecutados,
                    backgroundColor: '#dc3545',
                    borderColor: '#bb2d3b',
                    borderWidth: 1
                }
            ]
        };
        
        // Configuración del gráfico
        const config = {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                return `$${value.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        };
        
        // Crear gráfico
        this.charts.categoria = new Chart(canvas, config);
    }

    // Mostrar modal de presupuesto
    showPresupuestoModal(presupuesto = null) {
        // Limpiar formulario
        document.getElementById('presupuestoForm').reset();
        document.getElementById('presupuestoId').value = '';
        
        // Configurar modal según sea nuevo o edición
        if (presupuesto) {
            document.getElementById('presupuestoModalLabel').textContent = 'Editar Presupuesto';
            document.getElementById('presupuestoId').value = presupuesto.id;
            document.getElementById('presupuestoTitulo').value = presupuesto.titulo;
            document.getElementById('presupuestoMonto').value = presupuesto.monto;
            document.getElementById('presupuestoCategoria').value = presupuesto.categoria;
            document.getElementById('presupuestoDescripcion').value = presupuesto.descripcion || '';
            document.getElementById('presupuestoAnio').value = presupuesto.anio;
            
            // Mostrar campos adicionales para edición
            document.getElementById('presupuestoEstadoGroup').style.display = 'block';
            document.getElementById('presupuestoEstado').value = presupuesto.estado;
            document.getElementById('presupuestoMontoEjecutadoGroup').style.display = 'block';
            document.getElementById('presupuestoMontoEjecutado').value = presupuesto.monto_ejecutado;
        } else {
            document.getElementById('presupuestoModalLabel').textContent = 'Nuevo Presupuesto';
            
            // Establecer año actual por defecto
            document.getElementById('presupuestoAnio').value = new Date().getFullYear();
            
            // Ocultar campos adicionales para nuevo presupuesto
            document.getElementById('presupuestoEstadoGroup').style.display = 'none';
            document.getElementById('presupuestoMontoEjecutadoGroup').style.display = 'none';
        }
        
        // Mostrar modal
        this.presupuestoModal.show();
    }

    // Ver detalle de presupuesto
    verDetallePresupuesto(id) {
        const presupuesto = this.presupuestos.find(p => p.id === id);
        if (!presupuesto) return;
        
        const detalleContainer = document.getElementById('detallePresupuestoContenido');
        if (!detalleContainer) return;
        
        // Formatear fecha
        const fecha = new Date(presupuesto.fecha_creacion);
        const fechaStr = fecha.toLocaleDateString();
        
        // Determinar clase de estado
        let estadoClass = 'bg-secondary';
        if (presupuesto.estado === 'aprobado') estadoClass = 'bg-success';
        else if (presupuesto.estado === 'rechazado') estadoClass = 'bg-danger';
        else if (presupuesto.estado === 'borrador') estadoClass = 'bg-warning';
        
        // Calcular porcentaje de ejecución
        const porcentajeEjecucion = presupuesto.porcentaje_ejecucion;
        
        // Determinar clase de progreso
        let progressClass = 'bg-info';
        if (porcentajeEjecucion > 90) progressClass = 'bg-danger';
        else if (porcentajeEjecucion > 70) progressClass = 'bg-warning';
        
        detalleContainer.innerHTML = `
            <div class="row mb-4">
                <div class="col-md-6">
                    <h5 class="mb-3">${presupuesto.titulo}</h5>
                    <p class="mb-1"><strong>Categoría:</strong> <span class="badge bg-secondary">${presupuesto.categoria}</span></p>
                    <p class="mb-1"><strong>Año:</strong> ${presupuesto.anio}</p>
                    <p class="mb-1"><strong>Fecha de creación:</strong> ${fechaStr}</p>
                    <p class="mb-1"><strong>Estado:</strong> <span class="badge ${estadoClass}">${this.formatEstado(presupuesto.estado)}</span></p>
                </div>
                <div class="col-md-6">
                    <div class="card border-0 bg-light h-100">
                        <div class="card-body">
                            <h6 class="card-title">Ejecución Presupuestaria</h6>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Monto presupuestado:</span>
                                <strong>$${presupuesto.monto.toLocaleString()}</strong>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Monto ejecutado:</span>
                                <strong>$${presupuesto.monto_ejecutado.toLocaleString()}</strong>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Monto disponible:</span>
                                <strong>$${presupuesto.monto_disponible.toLocaleString()}</strong>
                            </div>
                            <div class="progress mt-3" style="height: 15px;">
                                <div class="progress-bar ${progressClass}" role="progressbar" style="width: ${porcentajeEjecucion}%;" 
                                    aria-valuenow="${porcentajeEjecucion}" aria-valuemin="0" aria-valuemax="100">
                                    ${porcentajeEjecucion}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-white">
                    <h6 class="card-title mb-0">Descripción</h6>
                </div>
                <div class="card-body">
                    <p class="mb-0">${presupuesto.descripcion || 'Sin descripción'}</p>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6">
                    <div class="card border-0 shadow-sm">
                        <div class="card-header bg-white">
                            <h6 class="card-title mb-0">Acciones</h6>
                        </div>
                        <div class="card-body">
                            <div class="d-flex gap-2">
                                <button class="btn btn-primary" id="btnEditarPresupuestoDetalle" data-id="${presupuesto.id}">
                                    <i class="bi bi-pencil me-2"></i> Editar
                                </button>
                                ${presupuesto.estado === 'borrador' ? `
                                <button class="btn btn-success" id="btnAprobarPresupuesto" data-id="${presupuesto.id}">
                                    <i class="bi bi-check-circle me-2"></i> Aprobar
                                </button>
                                <button class="btn btn-danger" id="btnRechazarPresupuesto" data-id="${presupuesto.id}">
                                    <i class="bi bi-x-circle me-2"></i> Rechazar
                                </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card border-0 shadow-sm">
                        <div class="card-header bg-white">
                            <h6 class="card-title mb-0">Actualizar Ejecución</h6>
                        </div>
                        <div class="card-body">
                            <form id="actualizarEjecucionForm">
                                <div class="mb-3">
                                    <label for="montoEjecutadoActualizar" class="form-label">Monto Ejecutado</label>
                                    <div class="input-group">
                                        <span class="input-group-text">$</span>
                                        <input type="number" class="form-control" id="montoEjecutadoActualizar" value="${presupuesto.monto_ejecutado}">
                                    </div>
                                </div>
                                <button type="button" class="btn btn-primary" id="btnActualizarEjecucion" data-id="${presupuesto.id}">
                                    <i class="bi bi-arrow-repeat me-2"></i> Actualizar
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Configurar botones de acción
        const btnEditarPresupuestoDetalle = document.getElementById('btnEditarPresupuestoDetalle');
        if (btnEditarPresupuestoDetalle) {
            btnEditarPresupuestoDetalle.addEventListener('click', () => {
                this.detallePresupuestoModal.hide();
                this.editarPresupuesto(presupuesto.id);
            });
        }
        
        const btnAprobarPresupuesto = document.getElementById('btnAprobarPresupuesto');
        if (btnAprobarPresupuesto) {
            btnAprobarPresupuesto.addEventListener('click', () => {
                this.aprobarPresupuesto(presupuesto.id);
            });
        }
        
        const btnRechazarPresupuesto = document.getElementById('btnRechazarPresupuesto');
        if (btnRechazarPresupuesto) {
            btnRechazarPresupuesto.addEventListener('click', () => {
                this.rechazarPresupuesto(presupuesto.id);
            });
        }
        
        const btnActualizarEjecucion = document.getElementById('btnActualizarEjecucion');
        if (btnActualizarEjecucion) {
            btnActualizarEjecucion.addEventListener('click', () => {
                this.actualizarEjecucion(presupuesto.id);
            });
        }
        
        // Mostrar modal
        this.detallePresupuestoModal.show();
    }

    // Guardar presupuesto (crear o actualizar)
    async guardarPresupuesto() {
        try {
            const presupuestoId = document.getElementById('presupuestoId').value;
            const titulo = document.getElementById('presupuestoTitulo').value;
            const monto = document.getElementById('presupuestoMonto').value;
            const categoria = document.getElementById('presupuestoCategoria').value;
            const descripcion = document.getElementById('presupuestoDescripcion').value;
            const anio = document.getElementById('presupuestoAnio').value;
            
            if (!titulo || !monto || !categoria || !anio) {
                showAlert('alertContainer', 'Todos los campos marcados con * son obligatorios', 'danger');
                return;
            }
            
            const presupuestoData = {
                titulo,
                monto: parseFloat(monto),
                categoria,
                descripcion,
                anio: parseInt(anio)
            };
            
            // Si es edición, agregar campos adicionales
            if (presupuestoId) {
                presupuestoData.estado = document.getElementById('presupuestoEstado').value;
                presupuestoData.monto_ejecutado = parseFloat(document.getElementById('presupuestoMontoEjecutado').value || 0);
            }
            
            let response;
            
            if (presupuestoId) {
                // Actualizar presupuesto existente
                response = await fetchAuth(`${API_URL}/presupuestos/${presupuestoId}`, {
                    method: 'PUT',
                    body: JSON.stringify(presupuestoData)
                });
                
                showAlert('alertContainer', 'Presupuesto actualizado exitosamente', 'success');
            } else {
                // Crear nuevo presupuesto
                response = await fetchAuth(`${API_URL}/presupuestos`, {
                    method: 'POST',
                    body: JSON.stringify(presupuestoData)
                });
                
                showAlert('alertContainer', 'Presupuesto creado exitosamente', 'success');
            }
            
            // Cerrar modal y recargar presupuestos
            this.presupuestoModal.hide();
            this.loadPresupuestos();
        } catch (error) {
            console.error('Error al guardar presupuesto:', error);
            showAlert('alertContainer', error.message || 'Error al guardar presupuesto', 'danger');
        }
    }

    // Editar presupuesto
    editarPresupuesto(id) {
        const presupuesto = this.presupuestos.find(p => p.id === id);
        if (presupuesto) {
            this.showPresupuestoModal(presupuesto);
        }
    }

    // Eliminar presupuesto
    async eliminarPresupuesto(id) {
        if (!confirm('¿Está seguro de eliminar este presupuesto?')) {
            return;
        }
        
        try {
            const response = await fetchAuth(`${API_URL}/presupuestos/${id}`, {
                method: 'DELETE'
            });
            
            showAlert('alertContainer', 'Presupuesto eliminado exitosamente', 'success');
            this.loadPresupuestos();
        } catch (error) {
            console.error('Error al eliminar presupuesto:', error);
            showAlert('alertContainer', error.message || 'Error al eliminar presupuesto', 'danger');
        }
    }

    // Aprobar presupuesto
    async aprobarPresupuesto(id) {
        if (!confirm('¿Está seguro de aprobar este presupuesto?')) {
            return;
        }
        
        try {
            const response = await fetchAuth(`${API_URL}/presupuestos/${id}/aprobar`, {
                method: 'PATCH'
            });
            
            showAlert('alertContainer', 'Presupuesto aprobado exitosamente', 'success');
            this.detallePresupuestoModal.hide();
            this.loadPresupuestos();
        } catch (error) {
            console.error('Error al aprobar presupuesto:', error);
            showAlert('alertContainer', error.message || 'Error al aprobar presupuesto', 'danger');
        }
    }

    // Rechazar presupuesto
    async rechazarPresupuesto(id) {
        if (!confirm('¿Está seguro de rechazar este presupuesto?')) {
            return;
        }
        
        try {
            const response = await fetchAuth(`${API_URL}/presupuestos/${id}/rechazar`, {
                method: 'PATCH'
            });
            
            showAlert('alertContainer', 'Presupuesto rechazado exitosamente', 'success');
            this.detallePresupuestoModal.hide();
            this.loadPresupuestos();
        } catch (error) {
            console.error('Error al rechazar presupuesto:', error);
            showAlert('alertContainer', error.message || 'Error al rechazar presupuesto', 'danger');
        }
    }

    // Actualizar ejecución de presupuesto
    async actualizarEjecucion(id) {
        const montoEjecutado = parseFloat(document.getElementById('montoEjecutadoActualizar').value || 0);
        
        try {
            const response = await fetchAuth(`${API_URL}/presupuestos/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ monto_ejecutado: montoEjecutado })
            });
            
            showAlert('alertContainer', 'Ejecución actualizada exitosamente', 'success');
            this.detallePresupuestoModal.hide();
            this.loadPresupuestos();
        } catch (error) {
            console.error('Error al actualizar ejecución:', error);
            showAlert('alertContainer', error.message || 'Error al actualizar ejecución', 'danger');
        }
    }

    // Filtrar presupuestos
    filtrarPresupuestos() {
        this.loadPresupuestos();
    }

    // Limpiar filtros
    limpiarFiltros() {
        const filtroAnio = document.getElementById('filtroPresupuestoAnio');
        const filtroCategoria = document.getElementById('filtroPresupuestoCategoria');
        const filtroEstado = document.getElementById('filtroPresupuestoEstado');
        
        if (filtroAnio) filtroAnio.value = '';
        if (filtroCategoria) filtroCategoria.value = '';
        if (filtroEstado) filtroEstado.value = '';
        
        this.loadPresupuestos();
    }

    // Exportar presupuesto a Excel
    exportarPresupuesto() {
        const presupuesto = this.presupuestoActual;
        if (!presupuesto) {
            alert('No hay presupuesto seleccionado para exportar');
            return;
        }
        
        // Generar CSV simple
        let csv = 'Categoría,Monto Asignado,Monto Gastado,Disponible\n';
        
        Object.entries(presupuesto.categorias || {}).forEach(([cat, valores]) => {
            csv += `${cat},${valores.asignado},${valores.gastado},${valores.disponible}\n`;
        });
        
        csv += `\nTOTAL,${presupuesto.monto_total},${presupuesto.monto_gastado},${presupuesto.monto_disponible}\n`;
        
        // Descargar
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `presupuesto-${presupuesto.anio}-${presupuesto.mes}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        alert('Presupuesto exportado correctamente');
    }

    // Formatear estado para mostrar
    formatEstado(estado) {
        const estados = {
            'borrador': 'Borrador',
            'aprobado': 'Aprobado',
            'rechazado': 'Rechazado'
        };
        
        return estados[estado] || estado;
    }
}