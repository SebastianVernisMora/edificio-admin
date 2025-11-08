// inquilino-cuotas.js - Gestión de cuotas para inquilinos

// Clase para manejar las cuotas del inquilino
class InquilinoCuotasManager {
    constructor() {
        this.cuotas = [];
        this.filtros = {
            mes: '',
            anio: '',
            estado: ''
        };
    }

    // Inicializar gestor
    init() {
        this.setupFiltros();
        this.loadCuotas();
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
                
                this.filtros = {
                    mes: '',
                    anio: '',
                    estado: ''
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
            
            if (queryParams.length > 0) {
                url += `?${queryParams.join('&')}`;
            }
            
            const response = await fetchAuth(url);
            this.cuotas = response.cuotas || [];
            this.renderCuotasTable();
        } catch (error) {
            console.error('Error al cargar cuotas:', error);
            alert('Error al cargar cuotas');
        }
    }

    // Renderizar tabla de cuotas
    renderCuotasTable() {
        const tableBody = document.getElementById('cuotasTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (this.cuotas.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="6" class="text-center">No hay cuotas registradas</td>';
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
                <td>${cuota.mes}/${cuota.anio}</td>
                <td>$${cuota.monto.toLocaleString()}</td>
                <td>${fechaVencimientoStr}</td>
                <td><span class="badge ${estadoClass}">${cuota.estado}</span></td>
                <td>${fechaPagoStr}</td>
                <td>
                    ${cuota.estado === 'PENDIENTE' || cuota.estado === 'VENCIDO' ? 
                        `<button class="btn btn-sm btn-primary" data-action="pay" data-id="${cuota.id}">
                            <i class="bi bi-credit-card me-1"></i> Pagar
                        </button>` : 
                        `<button class="btn btn-sm btn-outline-secondary" disabled>
                            <i class="bi bi-check-circle me-1"></i> Pagado
                        </button>`
                    }
                </td>
            `;
            
            tableBody.appendChild(tr);
        });
        
        // Configurar botones de pago
        tableBody.querySelectorAll('[data-action="pay"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(button.getAttribute('data-id'));
                this.showRegistrarPagoModal(id);
            });
        });
    }

    // Mostrar modal para registrar pago
    showRegistrarPagoModal(cuotaId) {
        // Usar el controlador principal para mostrar el modal
        if (typeof controller !== 'undefined' && controller.showRegistrarPagoModal) {
            controller.showRegistrarPagoModal(cuotaId);
        } else {
            console.error('Controlador no disponible');
        }
    }
}

// Inicializar gestor cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si estamos en la página de inquilino
    if (document.getElementById('cuotasSection')) {
        const cuotasManager = new InquilinoCuotasManager();
        cuotasManager.init();
    }
});