// cuotas.js - Gestión de cuotas

// Clase para manejar la gestión de cuotas
class CuotasManager {
    constructor() {
        this.cuotas = [];
        this.filtros = {
            mes: '',
            anio: '',
            estado: '',
            departamento: ''
        };
        this.generarCuotasModal = new bootstrap.Modal(document.getElementById('generarCuotasModal'));
        this.cuotaModal = new bootstrap.Modal(document.getElementById('cuotaModal'));
    }

    // Inicializar gestor
    init() {
        this.setupEventListeners();
        this.setupFiltros();
    }

    // Configurar listeners de eventos
    setupEventListeners() {
        // Botón guardar cuotas generadas
        const btnGuardarCuotas = document.getElementById('btnGuardarCuotas');
        if (btnGuardarCuotas) {
            btnGuardarCuotas.addEventListener('click', () => this.generarCuotas());
        }

        // Botón guardar cambios de cuota
        const btnGuardarCuota = document.getElementById('btnGuardarCuota');
        if (btnGuardarCuota) {
            btnGuardarCuota.addEventListener('click', () => this.guardarCuota());
        }

        // Cambio de estado de cuota
        const cuotaDetalleEstado = document.getElementById('cuotaDetalleEstado');
        if (cuotaDetalleEstado) {
            cuotaDetalleEstado.addEventListener('change', () => this.toggleFechaPagoFields());
        }
    }

    // Configurar filtros
    setupFiltros() {
        // Botón filtrar
        const btnFiltrarCuotas = document.getElementById('btnFiltrarCuotas');
        if (btnFiltrarCuotas) {
            btnFiltrarCuotas.addEventListener('click', () => {
                this.filtros.mes = document.getElementById('filtroCuotaMes').value;
                this.filtros.anio = document.getElementById('filtroCuotaAnio').value;
                this.filtros.estado = document.getElementById('filtroCuotaEstado').value;
                this.filtros.departamento = document.getElementById('filtroCuotaDepartamento')?.value || '';
                
                this.loadCuotas();
            });
        }

        // Botón limpiar filtros
        const btnLimpiarFiltrosCuotas = document.getElementById('btnLimpiarFiltrosCuotas');
        if (btnLimpiarFiltrosCuotas) {
            btnLimpiarFiltrosCuotas.addEventListener('click', () => {
                document.getElementById('filtroCuotaMes').value = '';
                document.getElementById('filtroCuotaAnio').value = '';
                document.getElementById('filtroCuotaEstado').value = '';
                if (document.getElementById('filtroCuotaDepartamento')) {
                    document.getElementById('filtroCuotaDepartamento').value = '';
                }
                
                this.filtros = {
                    mes: '',
                    anio: '',
                    estado: '',
                    departamento: ''
                };
                
                this.loadCuotas();
            });
        }
    }

    // Cargar cuotas
    async loadCuotas() {
        try {
            // Construir URL con filtros
            let url = `${API_URL}/cuotas`;
            const queryParams = [];
            
            if (this.filtros.mes) queryParams.push(`mes=${this.filtros.mes}`);
            if (this.filtros.anio) queryParams.push(`anio=${this.filtros.anio}`);
            if (this.filtros.estado) queryParams.push(`estado=${this.filtros.estado}`);
            if (this.filtros.departamento) queryParams.push(`departamento=${this.filtros.departamento}`);
            
            if (queryParams.length > 0) {
                url += `?${queryParams.join('&')}`;
            }
            
            const response = await fetchAuth(url);
            this.cuotas = response.cuotas || [];
            this.renderCuotasTable();
        } catch (error) {
            console.error('Error al cargar cuotas:', error);
            showAlert('alertContainer', 'Error al cargar cuotas', 'danger');
        }
    }

    // Renderizar tabla de cuotas
    renderCuotasTable() {
        const tableBody = document.getElementById('cuotasTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (this.cuotas.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="8" class="text-center">No hay cuotas registradas</td>';
            tableBody.appendChild(tr);
            return;
        }
        
        this.cuotas.forEach(cuota => {
            const tr = document.createElement('tr');
            
            // Determinar clase según estado
            let estadoClass = '';
            switch (cuota.estado) {
                case 'PAGADO':
                    estadoClass = 'bg-success';
                    break;
                case 'PENDIENTE':
                    estadoClass = 'bg-warning';
                    break;
                case 'VENCIDO':
                    estadoClass = 'bg-danger';
                    break;
            }
            
            // Formatear fecha de vencimiento
            const fechaVencimiento = new Date(cuota.fechaVencimiento);
            const fechaVencimientoStr = fechaVencimiento.toLocaleDateString();
            
            // Formatear fecha de pago si existe
            let fechaPagoStr = '-';
            if (cuota.fechaPago) {
                const fechaPago = new Date(cuota.fechaPago);
                fechaPagoStr = fechaPago.toLocaleDateString();
            }
            
            tr.innerHTML = `
                <td>${cuota.id}</td>
                <td>${cuota.departamento}</td>
                <td>${cuota.mes}/${cuota.anio}</td>
                <td>$${cuota.monto.toLocaleString()}</td>
                <td>${fechaVencimientoStr}</td>
                <td><span class="badge ${estadoClass}">${cuota.estado}</span></td>
                <td>${fechaPagoStr}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" data-action="view" data-id="${cuota.id}">
                        <i class="bi bi-eye"></i>
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
                    this.verCuota(id);
                }
            });
        });
    }

    // Mostrar modal para generar cuotas
    showGenerarModal() {
        // Configurar fecha de vencimiento por defecto (primer día del mes siguiente)
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const formattedDate = nextMonth.toISOString().split('T')[0];
        
        const title = document.getElementById('generarCuotasModalLabel');
        if (title) {
            title.textContent = 'Generar Cuotas Mensuales';
        }
        
        document.getElementById('generarCuotasForm').reset();
        document.getElementById('cuotaFechaVencimiento').value = formattedDate;
        
        // Seleccionar mes actual por defecto
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        document.getElementById('cuotaMes').value = meses[today.getMonth()];
        
        // Seleccionar año actual por defecto
        document.getElementById('cuotaAnio').value = today.getFullYear().toString();
        
        this.generarCuotasModal.show();
    }

    // Generar cuotas mensuales
    async generarCuotas() {
        try {
            const mes = document.getElementById('cuotaMes').value;
            const anio = document.getElementById('cuotaAnio').value;
            const monto = document.getElementById('cuotaMonto').value;
            const fechaVencimiento = document.getElementById('cuotaFechaVencimiento').value;
            
            if (!mes || !anio || !monto || !fechaVencimiento) {
                showAlert('alertContainer', 'Todos los campos son obligatorios', 'danger');
                return;
            }
            
            const response = await fetchAuth(`${API_URL}/cuotas/generar`, {
                method: 'POST',
                body: JSON.stringify({
                    mes,
                    anio,
                    monto: parseFloat(monto),
                    fechaVencimiento
                })
            });
            
            showAlert('alertContainer', response.message || 'Cuotas generadas exitosamente', 'success');
            
            // Cerrar modal y recargar cuotas
            this.generarCuotasModal.hide();
            this.loadCuotas();
        } catch (error) {
            console.error('Error al generar cuotas:', error);
            showAlert('alertContainer', error.message || 'Error al generar cuotas', 'danger');
        }
    }

    // Ver detalles de cuota
    verCuota(id) {
        const cuota = this.cuotas.find(c => c.id === id);
        if (!cuota) return;
        
        document.getElementById('cuotaDetalleDepartamento').value = cuota.departamento;
        document.getElementById('cuotaDetalleMesAnio').value = `${cuota.mes}/${cuota.anio}`;
        document.getElementById('cuotaDetalleMonto').value = `$${cuota.monto.toLocaleString()}`;
        
        const fechaVencimiento = new Date(cuota.fechaVencimiento);
        document.getElementById('cuotaDetalleFechaVencimiento').value = fechaVencimiento.toLocaleDateString();
        
        document.getElementById('cuotaDetalleEstado').value = cuota.estado;
        
        if (cuota.fechaPago) {
            const fechaPago = new Date(cuota.fechaPago);
            document.getElementById('cuotaDetalleFechaPago').value = fechaPago.toISOString().split('T')[0];
        } else {
            document.getElementById('cuotaDetalleFechaPago').value = '';
        }
        
        document.getElementById('cuotaDetalleComprobantePago').value = cuota.comprobantePago || '';
        
        // Mostrar/ocultar campos según estado
        this.toggleFechaPagoFields();
        
        this.cuotaModal.show();
    }

    // Mostrar/ocultar campos de fecha de pago según estado
    toggleFechaPagoFields() {
        const estado = document.getElementById('cuotaDetalleEstado').value;
        const fechaPagoGroup = document.getElementById('fechaPagoGroup');
        const comprobantePagoGroup = document.getElementById('comprobantePagoGroup');
        
        if (estado === 'PAGADO') {
            fechaPagoGroup.style.display = 'block';
            comprobantePagoGroup.style.display = 'block';
        } else {
            fechaPagoGroup.style.display = 'none';
            comprobantePagoGroup.style.display = 'none';
        }
    }

    // Guardar cambios de cuota
    async guardarCuota() {
        try {
            const cuotaId = this.cuotaModal._element.querySelector('[data-id]')?.getAttribute('data-id');
            if (!cuotaId) return;
            
            const estado = document.getElementById('cuotaDetalleEstado').value;
            const fechaPago = document.getElementById('cuotaDetalleFechaPago').value;
            const comprobantePago = document.getElementById('cuotaDetalleComprobantePago').value;
            
            const updates = { estado };
            
            if (estado === 'PAGADO') {
                if (!fechaPago) {
                    showAlert('alertContainer', 'La fecha de pago es obligatoria', 'danger');
                    return;
                }
                updates.fechaPago = fechaPago;
                updates.comprobantePago = comprobantePago;
            }
            
            const response = await fetchAuth(`${API_URL}/cuotas/${cuotaId}/estado`, {
                method: 'PUT',
                body: JSON.stringify(updates)
            });
            
            showAlert('alertContainer', 'Estado de cuota actualizado exitosamente', 'success');
            
            // Cerrar modal y recargar cuotas
            this.cuotaModal.hide();
            this.loadCuotas();
        } catch (error) {
            console.error('Error al actualizar cuota:', error);
            showAlert('alertContainer', error.message || 'Error al actualizar cuota', 'danger');
        }
    }

    // Mostrar modal de cuota (para botón generar cuotas)
    showCuotaModal() {
        this.showGenerarModal();
    }
}