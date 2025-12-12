// inquilino-controller.js - Controlador para el panel de inquilino

// Clase para manejar la navegación y funcionalidad del panel de inquilino
class InquilinoController {
    constructor() {
        this.currentSection = 'dashboard';
    }

    // Inicializar controlador
    init() {
        this.setupNavigation();
        this.setupSidebar();
        this.setupButtons();
        this.loadUserData();
    }

    // Configurar navegación entre secciones
    setupNavigation() {
        const navLinks = document.querySelectorAll('[data-section]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.changeSection(section);
            });
        });
    }

    // Configurar comportamiento del sidebar
    setupSidebar() {
        const sidebarCollapse = document.getElementById('sidebarCollapse');
        const sidebar = document.getElementById('sidebar');
        
        if (sidebarCollapse && sidebar) {
            sidebarCollapse.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }
    }

    // Configurar botones específicos
    setupButtons() {
        // Botón registrar pago
        const btnRegistrarPago = document.getElementById('btnRegistrarPago');
        if (btnRegistrarPago) {
            btnRegistrarPago.addEventListener('click', () => {
                this.showRegistrarPagoModal();
            });
        }

        // Botón enviar pago
        const btnEnviarPago = document.getElementById('btnEnviarPago');
        if (btnEnviarPago) {
            btnEnviarPago.addEventListener('click', () => {
                this.registrarPago();
            });
        }

        // Botón nueva solicitud

        // Botón ver acumulado anual
        const btnVerAcumulado = document.getElementById('btnVerAcumulado');
        if (btnVerAcumulado) {
            btnVerAcumulado.addEventListener('click', () => {
                this.showAcumuladoAnualModal();
            });
        }

        // Botón enviar solicitud
        const btnEnviarSolicitud = document.getElementById('btnEnviarSolicitud');
        if (btnEnviarSolicitud) {
            btnEnviarSolicitud.addEventListener('click', async () => {
                await this.enviarSolicitud();
            });
        }
    }
    
    async enviarSolicitud() {
        const tipo = document.getElementById('solicitudTipo')?.value;
        const descripcion = document.getElementById('solicitudDescripcion')?.value;
        
        if (!tipo || !descripcion) {
            alert('Por favor complete todos los campos');
            return;
        }
        
        const user = getUser();
        if (!user) return;
        
        try {
            const token = localStorage.getItem('edificio_token');
            const response = await fetch('/api/solicitudes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    tipo,
                    descripcion,
                    departamento: user.departamento
                })
            });
            
            if (response.ok) {
                alert('Solicitud enviada exitosamente');
                const solicitudModal = bootstrap.Modal.getInstance(document.getElementById('solicitudModal'));
                if (solicitudModal) solicitudModal.hide();
                this.cargarSolicitudes();
            } else {
                const error = await response.json();
                alert(`Error: ${error.msg || 'No se pudo enviar la solicitud'}`);
            }
        } catch (error) {
            console.error('Error enviando solicitud:', error);
            alert('Error al enviar la solicitud');
        }
    }

    // Cargar datos del usuario
    loadUserData() {
        const user = getUser();
        
        if (user) {
            // Actualizar nombre de usuario en la interfaz
            const userNameElements = document.querySelectorAll('#userName');
            userNameElements.forEach(element => {
                element.textContent = user.nombre;
            });
            
            // Cargar datos del perfil
            document.getElementById('perfilNombre').value = user.nombre;
            document.getElementById('perfilEmail').value = user.email;
            document.getElementById('perfilDepartamento').value = user.departamento;
            
            // Configurar formulario de cambio de contraseña
            const cambiarPasswordForm = document.getElementById('cambiarPasswordForm');
            if (cambiarPasswordForm) {
                cambiarPasswordForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    const passwordActual = document.getElementById('passwordActual').value;
                    const passwordNueva = document.getElementById('passwordNueva').value;
                    const passwordConfirmar = document.getElementById('passwordConfirmar').value;
                    
                    if (passwordNueva !== passwordConfirmar) {
                        alert('Las contraseñas no coinciden');
                        return;
                    }
                    
                    try {
                        const response = await fetchAuth(`${API_URL}/auth/cambiar-password`, {
                            method: 'POST',
                            body: JSON.stringify({
                                passwordActual,
                                passwordNueva
                            })
                        });
                        
                        alert('Contraseña actualizada exitosamente');
                        cambiarPasswordForm.reset();
                    } catch (error) {
                        alert(error.message || 'Error al cambiar contraseña');
                    }
                });
            }
        }
    }

    // Cambiar de sección
    changeSection(section) {
        // Ocultar todas las secciones
        document.querySelectorAll('.content-section').forEach(el => {
            el.classList.remove('active');
        });
        
        // Mostrar la sección seleccionada
        const sectionElement = document.getElementById(`${section}Section`);
        if (sectionElement) {
            sectionElement.classList.add('active');
        }
        
        // Actualizar título de la sección
        const sectionTitle = document.getElementById('sectionTitle');
        if (sectionTitle) {
            sectionTitle.textContent = this.getSectionTitle(section);
        }
        
        // Actualizar navegación
        document.querySelectorAll('[data-section]').forEach(el => {
            el.parentElement.classList.remove('active');
            
            if (el.getAttribute('data-section') === section) {
                el.parentElement.classList.add('active');
            }
        });
        
        // Guardar sección actual
        this.currentSection = section;
        
        // Cargar datos específicos de la sección si es necesario
        this.loadSectionData(section);
    }

    // Obtener título de la sección
    getSectionTitle(section) {
        const titles = {
            dashboard: 'Dashboard',
            cuotas: 'Mis Cuotas',
            anuncios: 'Anuncios',
            solicitudes: 'Mis Solicitudes',
            perfil: 'Mi Perfil'
        };
        
        return titles[section] || 'Dashboard';
    }

    // Cargar datos específicos de la sección
    loadSectionData(section) {
        switch (section) {
            case 'cuotas':
                this.loadCuotas();
                break;
            case 'anuncios':
                this.loadAnuncios();
                break;
            case 'solicitudes':
                if (typeof initInquilinoSolicitudesSection !== 'undefined') {
                    initInquilinoSolicitudesSection();
                    console.log('✅ Sección solicitudes inquilino inicializada');
                }
                break;
        }
    }

    // Cargar cuotas del inquilino
    async loadCuotas() {
        try {
            const response = await fetchAuth(`${API_URL}/cuotas`);
            const cuotas = response.cuotas || [];
            
            this.renderCuotasTable(cuotas);
        } catch (error) {
            console.error('Error al cargar cuotas:', error);
            alert('Error al cargar cuotas');
        }
    }

    // Renderizar tabla de cuotas
    renderCuotasTable(cuotas) {
        const tableBody = document.getElementById('cuotasTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (cuotas.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="6" class="text-center">No hay cuotas registradas</td>';
            tableBody.appendChild(tr);
            return;
        }
        
        cuotas.forEach(cuota => {
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
    showRegistrarPagoModal(cuotaId = null) {
        const registrarPagoModal = new bootstrap.Modal(document.getElementById('registrarPagoModal'));
        
        // Si no se proporciona ID, usar la cuota actual
        if (!cuotaId) {
            // Obtener datos de la cuota actual del dashboard
            document.getElementById('pagoDetallePeriodo').value = document.getElementById('cuotaActualPeriodo').textContent;
            document.getElementById('pagoDetalleMonto').value = document.getElementById('cuotaActualMonto').textContent;
            
            // Usar fecha actual para el pago
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('pagoFecha').value = today;
            
            // Limpiar otros campos
            document.getElementById('pagoComprobante').value = '';
            document.getElementById('pagoComentarios').value = '';
            
            registrarPagoModal.show();
            return;
        }
        
        // Buscar la cuota por ID
        fetchAuth(`${API_URL}/cuotas/${cuotaId}`)
            .then(response => {
                const cuota = response.cuota;
                
                if (cuota) {
                    document.getElementById('cuotaId').value = cuota.id;
                    document.getElementById('pagoDetallePeriodo').value = `${cuota.mes}/${cuota.anio}`;
                    document.getElementById('pagoDetalleMonto').value = `$${cuota.monto.toLocaleString()}`;
                    
                    // Usar fecha actual para el pago
                    const today = new Date().toISOString().split('T')[0];
                    document.getElementById('pagoFecha').value = today;
                    
                    // Limpiar otros campos
                    document.getElementById('pagoComprobante').value = '';
                    document.getElementById('pagoComentarios').value = '';
                    
                    registrarPagoModal.show();
                }
            })
            .catch(error => {
                console.error('Error al obtener detalles de cuota:', error);
                alert('Error al obtener detalles de cuota');
            });
    }

    // Registrar pago de cuota
    async registrarPago() {
        try {
            const cuotaId = document.getElementById('cuotaId').value;
            const comprobante = document.getElementById('pagoComprobante').value;
            const fecha = document.getElementById('pagoFecha').value;
            
            if (!comprobante || !fecha) {
                alert('Todos los campos son obligatorios');
                return;
            }
            
            const response = await fetchAuth(`${API_URL}/cuotas/${cuotaId}/pago`, {
                method: 'POST',
                body: JSON.stringify({
                    comprobantePago: comprobante,
                    fechaPago: fecha,
                    comentarios: document.getElementById('pagoComentarios').value
                })
            });
            
            alert('Pago registrado exitosamente');
            
            // Cerrar modal
            const registrarPagoModal = bootstrap.Modal.getInstance(document.getElementById('registrarPagoModal'));
            registrarPagoModal.hide();
            
            // Recargar datos
            if (this.currentSection === 'cuotas') {
                this.loadCuotas();
            } else {
                // Recargar dashboard
                location.reload();
            }
        } catch (error) {
            console.error('Error al registrar pago:', error);
            alert(error.message || 'Error al registrar pago');
        }
    }

    // Cargar anuncios
    async loadAnuncios() {
        try {
            const response = await fetchAuth(`${API_URL}/anuncios`);
            const anuncios = response.anuncios || [];
            
            // Implementar renderizado de anuncios
        } catch (error) {
            console.error('Error al cargar anuncios:', error);
            alert('Error al cargar anuncios');
        }
    }

    // Mostrar modal de acumulado anual
    async showAcumuladoAnualModal() {
        try {
            const user = getUser();
            if (!user) {
                alert('Error: Usuario no encontrado');
                return;
            }

            const currentYear = new Date().getFullYear();
            
            // Mostrar modal con loading
            const modal = new bootstrap.Modal(document.getElementById('acumuladoAnualModal'));
            modal.show();
            
            // Mostrar loading
            document.getElementById('totalPagadoAnual').textContent = 'Cargando...';
            document.getElementById('totalCuotasPagadas').textContent = 'Cargando...';
            
            // Obtener datos del acumulado anual
            const response = await fetchAuth(`${API_URL}/cuotas/acumulado-anual/${user.id}/${currentYear}`);
            const acumulado = response.acumulado;
            
            this.renderAcumuladoAnual(acumulado);
            
        } catch (error) {
            console.error('Error al cargar acumulado anual:', error);
            alert('Error al cargar datos del acumulado anual');
            
            // Cerrar modal en caso de error
            const modal = bootstrap.Modal.getInstance(document.getElementById('acumuladoAnualModal'));
            if (modal) {
                modal.hide();
            }
        }
    }

    // Renderizar datos del acumulado anual en el modal
    renderAcumuladoAnual(acumulado) {
        // Actualizar totales
        document.getElementById('totalPagadoAnual').textContent = `${acumulado.totalPagado.toLocaleString()}`;
        document.getElementById('totalCuotasPagadas').textContent = acumulado.totalCuotas;
        document.getElementById('yearActual').textContent = acumulado.year;
        document.getElementById('departamentoInfo').textContent = acumulado.departamento;
        
        // Mostrar comparativa si hay datos del año anterior
        const comparativaSection = document.getElementById('comparativaSection');
        if (acumulado.comparativaAnioAnterior.total > 0) {
            comparativaSection.style.display = 'block';
            document.getElementById('yearAnterior').textContent = acumulado.comparativaAnioAnterior.year;
            document.getElementById('totalAnioAnterior').textContent = `${acumulado.comparativaAnioAnterior.total.toLocaleString()}`;
            
            const diferencia = acumulado.comparativaAnioAnterior.diferencia;
            const diferenciaPagos = document.getElementById('diferenciaPagos');
            diferenciaPagos.textContent = `${Math.abs(diferencia).toLocaleString()}`;
            
            if (diferencia > 0) {
                diferenciaPagos.className = 'fw-bold text-success';
                diferenciaPagos.textContent = `+${diferencia.toLocaleString()}`;
            } else if (diferencia < 0) {
                diferenciaPagos.className = 'fw-bold text-danger';
                diferenciaPagos.textContent = `-${Math.abs(diferencia).toLocaleString()}`;
            } else {
                diferenciaPagos.className = 'fw-bold text-muted';
                diferenciaPagos.textContent = '$0';
            }
        } else {
            comparativaSection.style.display = 'none';
        }
        
        // Renderizar desglose mensual
        this.renderDesgloseMensual(acumulado.desgloseMensual);
    }

    // Renderizar desglose mensual
    renderDesgloseMensual(desgloseMensual) {
        const tableBody = document.getElementById('desgloseMensualTable');
        tableBody.innerHTML = '';
        
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        meses.forEach(mes => {
            const data = desgloseMensual[mes];
            const tr = document.createElement('tr');
            
            let estadoClass = '';
            let estadoText = '';
            let fechaText = '-';
            
            switch (data.estado) {
                case 'PAGADO':
                    estadoClass = 'text-success';
                    estadoText = 'Pagado';
                    if (data.fechaPago) {
                        fechaText = new Date(data.fechaPago).toLocaleDateString();
                    }
                    break;
                case 'PENDIENTE':
                    estadoClass = 'text-warning';
                    estadoText = 'Pendiente';
                    if (data.fechaVencimiento) {
                        fechaText = `Vence: ${new Date(data.fechaVencimiento).toLocaleDateString()}`;
                    }
                    break;
                case 'VENCIDO':
                    estadoClass = 'text-danger';
                    estadoText = 'Vencido';
                    if (data.fechaVencimiento) {
                        fechaText = `Venció: ${new Date(data.fechaVencimiento).toLocaleDateString()}`;
                    }
                    break;
                default:
                    estadoClass = 'text-muted';
                    estadoText = 'No generada';
                    break;
            }
            
            tr.innerHTML = `
                <td>${mes}</td>
                <td>${data.monto ? data.monto.toLocaleString() : '0'}</td>
                <td><span class="${estadoClass}">${estadoText}</span></td>
                <td><small>${fechaText}</small></td>
            `;
            
            tableBody.appendChild(tr);
        });
    }
}

// Inicializar controlador cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    const controller = new InquilinoController();
    controller.init();
});