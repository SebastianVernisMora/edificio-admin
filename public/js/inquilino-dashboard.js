// inquilino-dashboard.js - Funcionalidad del dashboard de inquilino

// Clase para manejar el dashboard de inquilino
class InquilinoDashboard {
    constructor() {
        this.cuotas = {
            pagadas: 0,
            pendientes: 1,
            vencidas: 0
        };
        this.cuotaActual = {
            periodo: 'Noviembre 2025',
            monto: 550,
            vencimiento: '01/12/2025',
            estado: 'PENDIENTE'
        };
    }

    // Inicializar dashboard
    init() {
        this.loadDashboardData();
    }

    // Cargar datos del dashboard
    async loadDashboardData() {
        try {
            // Cargar resumen de cuotas
            await this.loadResumenCuotas();
            
            // Cargar cuota actual
            await this.loadCuotaActual();
            
            // Cargar anuncios recientes
            await this.loadAnunciosRecientes();
        } catch (error) {
            console.error('Error al cargar datos del dashboard:', error);
        }
    }

    // Cargar resumen de cuotas
    async loadResumenCuotas() {
        try {
            const response = await fetchAuth(`${API_URL}/cuotas/resumen`);
            
            if (response.resumen) {
                this.cuotas = response.resumen;
            }
            
            // Actualizar contadores
            document.getElementById('cuotasPagadas').textContent = this.cuotas.pagadas;
            document.getElementById('cuotasPendientes').textContent = this.cuotas.pendientes;
            document.getElementById('cuotasVencidas').textContent = this.cuotas.vencidas;
        } catch (error) {
            console.error('Error al cargar resumen de cuotas:', error);
            // Usar datos por defecto
            document.getElementById('cuotasPagadas').textContent = this.cuotas.pagadas;
            document.getElementById('cuotasPendientes').textContent = this.cuotas.pendientes;
            document.getElementById('cuotasVencidas').textContent = this.cuotas.vencidas;
        }
    }

    // Cargar cuota actual
    async loadCuotaActual() {
        try {
            const response = await fetchAuth(`${API_URL}/cuotas/actual`);
            
            if (response.cuota) {
                this.cuotaActual = {
                    periodo: `${response.cuota.mes} ${response.cuota.anio}`,
                    monto: response.cuota.monto,
                    vencimiento: new Date(response.cuota.fechaVencimiento).toLocaleDateString(),
                    estado: response.cuota.estado
                };
            }
            
            // Actualizar información de cuota actual
            document.getElementById('cuotaActualPeriodo').textContent = this.cuotaActual.periodo;
            document.getElementById('cuotaActualMonto').textContent = `$${this.cuotaActual.monto.toLocaleString()} MXN`;
            document.getElementById('cuotaActualVencimiento').textContent = this.cuotaActual.vencimiento;
            
            // Actualizar estado
            const estadoElement = document.getElementById('cuotaActualEstado');
            estadoElement.textContent = this.cuotaActual.estado;
            
            // Cambiar clase según estado
            estadoElement.className = 'badge';
            switch (this.cuotaActual.estado) {
                case 'PAGADO':
                    estadoElement.classList.add('bg-success');
                    break;
                case 'PENDIENTE':
                    estadoElement.classList.add('bg-warning');
                    break;
                case 'VENCIDO':
                    estadoElement.classList.add('bg-danger');
                    break;
            }
            
            // Habilitar/deshabilitar botón de pago
            const btnRegistrarPago = document.getElementById('btnRegistrarPago');
            if (this.cuotaActual.estado === 'PAGADO') {
                btnRegistrarPago.disabled = true;
                btnRegistrarPago.innerHTML = '<i class="bi bi-check-circle me-2"></i> Pagado';
                btnRegistrarPago.classList.remove('btn-primary');
                btnRegistrarPago.classList.add('btn-success');
            } else {
                btnRegistrarPago.disabled = false;
                btnRegistrarPago.innerHTML = '<i class="bi bi-credit-card me-2"></i> Registrar Pago';
                btnRegistrarPago.classList.remove('btn-success');
                btnRegistrarPago.classList.add('btn-primary');
            }
        } catch (error) {
            console.error('Error al cargar cuota actual:', error);
            // Usar datos por defecto
            document.getElementById('cuotaActualPeriodo').textContent = this.cuotaActual.periodo;
            document.getElementById('cuotaActualMonto').textContent = `$${this.cuotaActual.monto.toLocaleString()} MXN`;
            document.getElementById('cuotaActualVencimiento').textContent = this.cuotaActual.vencimiento;
            
            const estadoElement = document.getElementById('cuotaActualEstado');
            estadoElement.textContent = this.cuotaActual.estado;
            estadoElement.className = 'badge bg-warning';
        }
    }

    // Cargar anuncios recientes
    async loadAnunciosRecientes() {
        try {
            const response = await fetchAuth(`${API_URL}/anuncios/recientes`);
            const anuncios = response.anuncios || [];
            
            const anunciosRecientesList = document.getElementById('anunciosRecientesList');
            if (!anunciosRecientesList) return;
            
            // Si no hay anuncios, usar los predeterminados
            if (anuncios.length === 0) return;
            
            anunciosRecientesList.innerHTML = '';
            
            anuncios.forEach(anuncio => {
                const div = document.createElement('div');
                div.className = 'card mb-3 border-0 bg-light';
                div.innerHTML = `
                    <div class="card-body">
                        <h6 class="card-title">${anuncio.titulo}</h6>
                        <p class="card-text">${anuncio.contenido}</p>
                        <p class="card-text"><small class="text-muted">Publicado: ${new Date(anuncio.fecha).toLocaleDateString()}</small></p>
                    </div>
                `;
                
                anunciosRecientesList.appendChild(div);
            });
        } catch (error) {
            console.error('Error al cargar anuncios recientes:', error);
            // Usar anuncios predeterminados
        }
    }
}

// Inicializar dashboard cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si estamos en la página de inquilino
    if (document.getElementById('dashboardSection')) {
        const dashboard = new InquilinoDashboard();
        dashboard.init();
    }
});