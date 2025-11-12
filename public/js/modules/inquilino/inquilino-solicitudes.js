// Gestión de Solicitudes - Panel Inquilino
class InquilinoSolicitudesManager {
    constructor() {
        this.misSolicitudes = [];
        this.filtros = {
            estado: '',
            categoria: '',
            busqueda: ''
        };
        this.init();
    }

    init() {
        this.bindEvents();
        this.cargarMisSolicitudes();
    }

    bindEvents() {
        // Botón nueva solicitud
        document.getElementById('btnNuevaSolicitud')?.addEventListener('click', () => {
            this.mostrarModalNuevaSolicitud();
        });

        // Botón enviar solicitud
        document.getElementById('btnEnviarSolicitud')?.addEventListener('click', () => {
            this.enviarNuevaSolicitud();
        });

        // Botón eliminar mi solicitud
        document.getElementById('btnEliminarMiSolicitud')?.addEventListener('click', () => {
            this.eliminarMiSolicitud();
        });

        // Filtros
        document.getElementById('filtroMisSolicitudesEstado')?.addEventListener('change', (e) => {
            this.filtros.estado = e.target.value;
            this.aplicarFiltros();
        });

        document.getElementById('filtroMisSolicitudesCategoria')?.addEventListener('change', (e) => {
            this.filtros.categoria = e.target.value;
            this.aplicarFiltros();
        });

        document.getElementById('filtroMisSolicitudesBusqueda')?.addEventListener('input', (e) => {
            this.filtros.busqueda = e.target.value.toLowerCase();
            this.aplicarFiltros();
        });

        // Validación en tiempo real del formulario
        document.getElementById('solicitudTituloNueva')?.addEventListener('input', this.validarFormulario.bind(this));
        document.getElementById('solicitudDescripcionNueva')?.addEventListener('input', this.validarFormulario.bind(this));
        document.getElementById('solicitudCategoriaNueva')?.addEventListener('change', this.validarFormulario.bind(this));
    }

    async cargarMisSolicitudes() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/solicitudes', {
                headers: {
                    'x-auth-token': token
                }
            });

            if (response.ok) {
                this.misSolicitudes = await response.json();
                this.actualizarEstadisticas();
                this.renderizarMisSolicitudes();
            } else {
                throw new Error('Error al cargar solicitudes');
            }
        } catch (error) {
            console.error('Error al cargar mis solicitudes:', error);
            this.mostrarError('Error al cargar las solicitudes');
        }
    }

    actualizarEstadisticas() {
        const stats = {
            total: this.misSolicitudes.length,
            pendientes: this.misSolicitudes.filter(s => s.estado === 'pendiente').length,
            enProceso: this.misSolicitudes.filter(s => s.estado === 'en_proceso').length,
            completadas: this.misSolicitudes.filter(s => s.estado === 'completada').length
        };

        document.getElementById('totalMisSolicitudes').textContent = stats.total;
        document.getElementById('misSolicitudesPendientes').textContent = stats.pendientes;
        document.getElementById('misSolicitudesEnProceso').textContent = stats.enProceso;
        document.getElementById('misSolicitudesCompletadas').textContent = stats.completadas;
    }

    renderizarMisSolicitudes(solicitudesFiltradas = null) {
        const solicitudes = solicitudesFiltradas || this.misSolicitudes;
        const container = document.getElementById('listaMisSolicitudes');
        
        if (!container) return;

        container.innerHTML = '';

        if (solicitudes.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-inbox fs-1 text-muted"></i>
                    <p class="text-muted mt-3">No tienes solicitudes</p>
                    <button class="btn btn-primary" onclick="inquilinoSolicitudesManager.mostrarModalNuevaSolicitud()">
                        <i class="bi bi-plus-circle me-2"></i> Crear Primera Solicitud
                    </button>
                </div>
            `;
            return;
        }

        solicitudes.forEach(solicitud => {
            const solicitudCard = document.createElement('div');
            solicitudCard.className = 'border-bottom p-3';
            solicitudCard.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <div class="d-flex align-items-center mb-2">
                            <h6 class="mb-0 me-3">${solicitud.titulo}</h6>
                            <span class="badge ${this.getEstadoBadgeClass(solicitud.estado)} me-2">
                                ${this.formatearEstado(solicitud.estado)}
                            </span>
                            <span class="badge bg-secondary">
                                ${this.formatearCategoria(solicitud.categoria)}
                            </span>
                        </div>
                        <p class="text-muted mb-2 small">${solicitud.descripcion.substring(0, 100)}...</p>
                        <div class="d-flex align-items-center text-muted small">
                            <i class="bi bi-calendar me-1"></i>
                            <span class="me-3">${this.formatearFecha(solicitud.fecha_creacion)}</span>
                            <i class="bi bi-hash me-1"></i>
                            <span>ID: ${solicitud.id}</span>
                        </div>
                    </div>
                    <div class="ms-3">
                        <button class="btn btn-sm btn-outline-primary" onclick="inquilinoSolicitudesManager.verSolicitud(${solicitud.id})">
                            <i class="bi bi-eye"></i> Ver
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(solicitudCard);
        });
    }

    aplicarFiltros() {
        let solicitudesFiltradas = [...this.misSolicitudes];

        // Filtro por estado
        if (this.filtros.estado) {
            solicitudesFiltradas = solicitudesFiltradas.filter(s => s.estado === this.filtros.estado);
        }

        // Filtro por categoría
        if (this.filtros.categoria) {
            solicitudesFiltradas = solicitudesFiltradas.filter(s => s.categoria === this.filtros.categoria);
        }

        // Filtro por búsqueda
        if (this.filtros.busqueda) {
            solicitudesFiltradas = solicitudesFiltradas.filter(s => 
                s.titulo.toLowerCase().includes(this.filtros.busqueda)
            );
        }

        this.renderizarMisSolicitudes(solicitudesFiltradas);
    }

    mostrarModalNuevaSolicitud() {
        // Limpiar formulario
        document.getElementById('formNuevaSolicitud').reset();
        this.validarFormulario();
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('modalNuevaSolicitud'));
        modal.show();
    }

    validarFormulario() {
        const titulo = document.getElementById('solicitudTituloNueva').value.trim();
        const descripcion = document.getElementById('solicitudDescripcionNueva').value.trim();
        const categoria = document.getElementById('solicitudCategoriaNueva').value;
        
        const btnEnviar = document.getElementById('btnEnviarSolicitud');
        
        const esValido = titulo.length >= 5 && 
                        descripcion.length >= 10 && 
                        categoria !== '';
        
        btnEnviar.disabled = !esValido;
        
        return esValido;
    }

    async enviarNuevaSolicitud() {
        if (!this.validarFormulario()) {
            this.mostrarError('Por favor complete todos los campos correctamente');
            return;
        }

        try {
            const datos = {
                titulo: document.getElementById('solicitudTituloNueva').value.trim(),
                descripcion: document.getElementById('solicitudDescripcionNueva').value.trim(),
                categoria: document.getElementById('solicitudCategoriaNueva').value
            };

            const token = localStorage.getItem('token');
            const response = await fetch('/api/solicitudes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(datos)
            });

            if (response.ok) {
                this.mostrarExito('Solicitud enviada correctamente');
                this.cargarMisSolicitudes();
                
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalNuevaSolicitud'));
                modal.hide();
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Error al enviar solicitud');
            }
        } catch (error) {
            console.error('Error al enviar solicitud:', error);
            this.mostrarError('Error al enviar la solicitud: ' + error.message);
        }
    }

    verSolicitud(id) {
        const solicitud = this.misSolicitudes.find(s => s.id === id);
        if (!solicitud) return;

        // Llenar el modal con los datos
        document.getElementById('verSolicitudId').textContent = solicitud.id;
        document.getElementById('verSolicitudTitulo').textContent = solicitud.titulo;
        document.getElementById('verSolicitudCategoria').textContent = this.formatearCategoria(solicitud.categoria);
        document.getElementById('verSolicitudDescripcion').textContent = solicitud.descripcion;
        document.getElementById('verSolicitudFecha').textContent = this.formatearFecha(solicitud.fecha_creacion);
        
        // Estado con badge
        const estadoBadge = document.getElementById('verSolicitudEstado');
        estadoBadge.textContent = this.formatearEstado(solicitud.estado);
        estadoBadge.className = `badge ${this.getEstadoBadgeClass(solicitud.estado)}`;

        // Respuesta del administrador
        const respuestaContainer = document.getElementById('respuestaContainer');
        const respuestaDiv = document.getElementById('verSolicitudRespuesta');
        
        if (solicitud.respuesta) {
            respuestaDiv.textContent = solicitud.respuesta;
            respuestaContainer.style.display = 'block';
        } else {
            respuestaContainer.style.display = 'none';
        }

        // Botón eliminar (solo para solicitudes pendientes)
        const btnEliminar = document.getElementById('btnEliminarMiSolicitud');
        if (solicitud.estado === 'pendiente') {
            btnEliminar.style.display = 'inline-block';
            btnEliminar.setAttribute('data-solicitud-id', solicitud.id);
        } else {
            btnEliminar.style.display = 'none';
        }

        // Mostrar el modal
        const modal = new bootstrap.Modal(document.getElementById('modalVerSolicitud'));
        modal.show();
    }

    async eliminarMiSolicitud() {
        const btnEliminar = document.getElementById('btnEliminarMiSolicitud');
        const id = btnEliminar.getAttribute('data-solicitud-id');
        
        if (!confirm('¿Está seguro de que desea eliminar esta solicitud?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/solicitudes/${id}`, {
                method: 'DELETE',
                headers: {
                    'x-auth-token': token
                }
            });

            if (response.ok) {
                this.mostrarExito('Solicitud eliminada correctamente');
                this.cargarMisSolicitudes();
                
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalVerSolicitud'));
                modal.hide();
            } else {
                throw new Error('Error al eliminar solicitud');
            }
        } catch (error) {
            console.error('Error al eliminar solicitud:', error);
            this.mostrarError('Error al eliminar la solicitud');
        }
    }

    // Métodos de utilidad
    formatearCategoria(categoria) {
        const categorias = {
            'mantenimiento': 'Mantenimiento',
            'seguridad': 'Seguridad',
            'limpieza': 'Limpieza',
            'administracion': 'Administración',
            'general': 'General'
        };
        return categorias[categoria] || categoria;
    }

    formatearEstado(estado) {
        const estados = {
            'pendiente': 'Pendiente',
            'en_proceso': 'En Proceso',
            'completada': 'Completada',
            'rechazada': 'Rechazada'
        };
        return estados[estado] || estado;
    }

    getEstadoBadgeClass(estado) {
        const clases = {
            'pendiente': 'bg-warning',
            'en_proceso': 'bg-info',
            'completada': 'bg-success',
            'rechazada': 'bg-danger'
        };
        return clases[estado] || 'bg-secondary';
    }

    formatearFecha(fecha) {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    mostrarExito(mensaje) {
        // Implementar notificación de éxito
        console.log('Éxito:', mensaje);
        // Aquí podrías usar una librería de notificaciones como Toastr
        alert('✅ ' + mensaje);
    }

    mostrarError(mensaje) {
        // Implementar notificación de error
        console.error('Error:', mensaje);
        // Aquí podrías usar una librería de notificaciones como Toastr
        alert('❌ ' + mensaje);
    }
}

// Inicializar el manager cuando se carga la sección
let inquilinoSolicitudesManager;

// Función para inicializar cuando se navega a la sección
function initInquilinoSolicitudesSection() {
    if (!inquilinoSolicitudesManager) {
        inquilinoSolicitudesManager = new InquilinoSolicitudesManager();
    } else {
        inquilinoSolicitudesManager.cargarMisSolicitudes();
    }
}