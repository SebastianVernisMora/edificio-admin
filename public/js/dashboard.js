// dashboard.js - Funcionalidad del dashboard de administrador

// Clase para manejar el dashboard
class AdminDashboard {
    constructor() {
        this.charts = {};
        this.fondos = {
            ahorroAcumulado: 67500,
            gastosMayores: 125000,
            dineroOperacional: 48000,
            patrimonioTotal: 240500
        };
        this.proyectos = [
            { id: 1, nombre: "Legitimidad Legal", monto: 35000, prioridad: "URGENTE" },
            { id: 2, nombre: "Irregularidades Eléctricas", monto: 85000, prioridad: "ALTA" },
            { id: 3, nombre: "Bombas Base Inestable", monto: 45000, prioridad: "MEDIA" },
            { id: 4, nombre: "Estructura Castillos", monto: 120000, prioridad: "ALTA" }
        ];
    }

    // Inicializar dashboard
    init() {
        this.loadDashboardData();
        this.initCharts();
    }

    // Cargar datos del dashboard
    async loadDashboardData() {
        try {
            // Cargar datos de fondos
            this.updateFondosDisplay();
            
            // Cargar datos de proyectos
            this.updateProyectosDisplay();
            
            // Cargar últimos gastos
            await this.loadUltimosGastos();
            
            // Cargar anuncios recientes
            await this.loadAnunciosRecientes();
        } catch (error) {
            console.error('Error al cargar datos del dashboard:', error);
        }
    }

    // Actualizar visualización de fondos
    updateFondosDisplay() {
        document.getElementById('fondoAhorro').textContent = `$${this.fondos.ahorroAcumulado.toLocaleString()}`;
        document.getElementById('fondoGastosMayores').textContent = `$${this.fondos.gastosMayores.toLocaleString()}`;
        document.getElementById('dineroOperacional').textContent = `$${this.fondos.dineroOperacional.toLocaleString()}`;
        document.getElementById('patrimonioTotal').textContent = `$${this.fondos.patrimonioTotal.toLocaleString()}`;
    }

    // Actualizar visualización de proyectos
    updateProyectosDisplay() {
        const proyectosList = document.getElementById('proyectosList');
        if (!proyectosList) return;

        proyectosList.innerHTML = '';
        
        this.proyectos.forEach(proyecto => {
            const badgeClass = this.getPrioridadBadgeClass(proyecto.prioridad);
            
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                <div>
                    <span class="badge ${badgeClass} me-2">${proyecto.prioridad}</span>
                    ${proyecto.nombre}
                </div>
                <span class="fw-bold">$${proyecto.monto.toLocaleString()}</span>
            `;
            
            proyectosList.appendChild(li);
        });
    }

    // Obtener clase de badge según prioridad
    getPrioridadBadgeClass(prioridad) {
        switch (prioridad) {
            case 'URGENTE':
                return 'bg-danger';
            case 'ALTA':
                return 'bg-warning';
            case 'MEDIA':
                return 'bg-info';
            case 'BAJA':
                return 'bg-secondary';
            default:
                return 'bg-secondary';
        }
    }

    // Cargar últimos gastos
    async loadUltimosGastos() {
        // Simulación de datos (en producción se cargarían desde la API)
        const ultimosGastos = [
            { concepto: 'Mantenimiento Elevador', categoria: 'Mantenimiento', fecha: '25/10/2025', monto: 3500 },
            { concepto: 'Servicio Limpieza', categoria: 'Limpieza', fecha: '20/10/2025', monto: 2800 },
            { concepto: 'Reparación Bomba Agua', categoria: 'Reparación', fecha: '15/10/2025', monto: 4200 }
        ];
        
        const ultimosGastosList = document.getElementById('ultimosGastosList');
        if (!ultimosGastosList) return;
        
        ultimosGastosList.innerHTML = '';
        
        ultimosGastos.forEach(gasto => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${gasto.concepto}</td>
                <td><span class="badge bg-secondary">${gasto.categoria}</span></td>
                <td>${gasto.fecha}</td>
                <td class="fw-bold">$${gasto.monto.toLocaleString()}</td>
            `;
            
            ultimosGastosList.appendChild(tr);
        });
    }

    // Cargar anuncios recientes
    async loadAnunciosRecientes() {
        // Simulación de datos (en producción se cargarían desde la API)
        const anunciosRecientes = [
            { 
                titulo: 'Reunión de Condominio', 
                contenido: 'Se convoca a reunión de condominio el día 15 de noviembre a las 19:00 hrs en el área común.', 
                fecha: '28/10/2025' 
            },
            { 
                titulo: 'Mantenimiento Cisterna', 
                contenido: 'Se realizará mantenimiento a la cisterna el día 5 de noviembre. Habrá corte de agua de 9:00 a 14:00 hrs.', 
                fecha: '25/10/2025' 
            }
        ];
        
        const anunciosRecientesList = document.getElementById('anunciosRecientesList');
        if (!anunciosRecientesList) return;
        
        anunciosRecientesList.innerHTML = '';
        
        anunciosRecientes.forEach(anuncio => {
            const div = document.createElement('div');
            div.className = 'card mb-3 border-0 bg-light';
            div.innerHTML = `
                <div class="card-body">
                    <h6 class="card-title">${anuncio.titulo}</h6>
                    <p class="card-text small">${anuncio.contenido}</p>
                    <p class="card-text"><small class="text-muted">Publicado: ${anuncio.fecha}</small></p>
                </div>
            `;
            
            anunciosRecientesList.appendChild(div);
        });
    }

    // Inicializar gráficos
    initCharts() {
        this.initCuotasChart();
    }

    // Inicializar gráfico de cuotas
    initCuotasChart() {
        const ctx = document.getElementById('cuotasChart');
        if (!ctx) return;
        
        // Datos simulados (en producción se cargarían desde la API)
        const data = {
            labels: ['Pagadas', 'Pendientes', 'Vencidas'],
            datasets: [{
                label: 'Estado de Cuotas',
                data: [12, 5, 3],
                backgroundColor: [
                    'rgba(76, 175, 80, 0.2)',
                    'rgba(255, 152, 0, 0.2)',
                    'rgba(244, 67, 54, 0.2)'
                ],
                borderColor: [
                    'rgba(76, 175, 80, 1)',
                    'rgba(255, 152, 0, 1)',
                    'rgba(244, 67, 54, 1)'
                ],
                borderWidth: 1
            }]
        };
        
        this.charts.cuotas = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }
}

// Inicializar dashboard cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si estamos en la página de admin
    if (document.getElementById('dashboardSection')) {
        const dashboard = new AdminDashboard();
        dashboard.init();
    }
});