// Gestión de Solicitudes - Admin Panel
class SolicitudesManager {
    constructor() {
        this.solicitudes = [];
        this.usuarios = [];
        this.filtros = {
            estado: '',
            categoria: '',
            busqueda: ''
        };
        this.init();
    }

    init() {
        this.bindEvents();
        this.cargarUsuarios();
        this.cargarSolicitudes();
    }

    bindEvents() {
        // Botón actualizar
        document.getElementById('btnActualizarSolicitudes')?.addEventListener('click', () => {
            this.cargarSolicitudes();
        });

        // Filtros
        document.getElementById('filtroSolicitudEstado')?.addEventListener('change', (e) => {
            this.filtros.estado = e.target.value;
            this.aplicarFiltros();
        });

        document.getElementById('filtroSolicitudCategoria')?.addEventListener('change', (e) => {
            this.filtros.categoria = e.target.value;
            this.aplicarFiltros();
        });

        document.getElementById('filtroSolicitudBusqueda')?.addEventListener('input', (e) => {
            this.filtros.busqueda = e.target.value.toLowerCase();
            this.aplicarFiltros();
        });

        // Modal events
        document.getElementById('btnGuardarSolicitud')?.addEventListener('click', () => {
            this.guardarCambiosSolicitud();
        });

        document.getElementById('btnEliminarSolicitud')?.addEventListener('click', () => {
            this.eliminarSolicitud();
        });
    }

    async cargarUsuarios() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/usuarios', {
                headers: {
                    'x-auth-token': token
                }
            });

            if (response.ok) {
                this.usuarios = await response.json();
            }
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        }
    }

    async cargarSolicitudes() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/solicitudes', {
                headers: {
                    'x-auth-token': token
                }
            });

            if (response.ok) {
                this.solicitudes = await response.json();
                this.actualizarEstadisticas();
                this.renderizarTablaSolicitudes();
            } else {
                throw new Error('Error al cargar solicitudes');
            }
        } catch (error) {
            console.error('Error al cargar solicitudes:', error);
            this.mostrarError('Error al cargar las solicitudes');
        }
    }

    actualizarEstadisticas() {
        const stats = {
            total: this.solicitudes.length,
            pendientes: this.solicitudes.filter(s => s.estado === 'pendiente').length,
            enProceso: this.solicitudes.filter(s => s.estado === 'en_proceso').length,
            completadas: this.solicitudes.filter(s => s.estado === 'completada').length
        };

        document.getElementById('totalSolicitudes').textContent = stats.total;
        document.getElementById('solicitudesPendientes').textContent = stats.pendientes;
        document.getElementById('solicitudesEnProceso').textContent = stats.enProceso;
        document.getElementById('solicitudesCompletadas').textContent = stats.completadas;
    }

    renderizarTablaSolicitudes(solicitudesFiltradas = null) {
        const solicitudes = solicitudesFiltradas || this.solicitudes;
        const tbody = document.getElementById('tablaSolicitudes');
        
        if (!tbody) return;

        tbody.innerHTML = '';

        if (solicitudes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <i class="bi bi-inbox fs-1 text-muted"></i>
                        <p class="text-muted mt-2">No hay solicitudes disponibles</p>
                    </td>
                </tr>
            `;
            return;
        }

        solicitudes.forEach(solicitud => {
            const usuario = this.usuarios.find(u => u.id === solicitud.usuario_id);
            const nombreUsuario = usuario ? `${usuario.nombre} (Depto ${usuario.departamento})` : 'Usuario desconocido';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${solicitud.id}</td>
                <td>
                    <div class="fw-bold">${solicitud.titulo}</div>
                    <small class="text-muted">${solicitud.descripcion.substring(0, 50)}...</small>
                </td>
                <td>${nombreUsuario}</td>
                <td>
                    <span class="badge bg-secondary">${this.formatearCategoria(solicitud.categoria)}</span>
                </td>
                <td>
                    <span class="badge ${this.getEstadoBadgeClass(solicitud.estado)}">
                        ${this.formatearEstado(solicitud.estado)}
                    </span>
                </td>
                <td>${this.formatearFecha(solicitud.fecha_creacion)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="solicitudesManager.verSolicitud(${solicitud.id})">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    aplicarFiltros() {
        let solicitudesFiltradas = [...this.solicitudes];

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
                s.titulo.toLowerCase().includes(this.filtros.busqueda) ||
                s.descripcion.toLowerCase().includes(this.filtros.busqueda)
            );
        }

        this.renderizarTablaSolicitudes(solicitudesFiltradas);
    }

    verSolicitud(id) {
        const solicitud = this.solicitudes.find(s => s.id === id);
        if (!solicitud) return;

        const usuario = this.usuarios.find(u => u.id === solicitud.usuario_id);
        const nombreUsuario = usuario ? `${usuario.nombre} (Depto ${usuario.departamento})` : 'Usuario desconocido';

        // Llenar el modal con los datos
        document.getElementById('solicitudId').textContent = solicitud.id;
        document.getElementById('solicitudUsuario').textContent = nombreUsuario;
        document.getElementById('solicitudCategoria').textContent = this.formatearCategoria(solicitud.categoria);
        document.getElementById('solicitudTitulo').textContent = solicitud.titulo;
        document.getElementById('solicitudDescripcion').textContent = solicitud.descripcion;
        document.getElementById('solicitudFecha').textContent = this.formatearFecha(solicitud.fecha_creacion);
        document.getElementById('solicitudEstado').value = solicitud.estado;
        document.getElementById('solicitudRespuesta').value = solicitud.respuesta || '';

        // Mostrar el modal
        const modal = new bootstrap.Modal(document.getElementById('modalSolicitud'));
        modal.show();
    }

    async guardarCambiosSolicitud() {
        try {
            const id = document.getElementById('solicitudId').textContent;
            const estado = document.getElementById('solicitudEstado').value;
            const respuesta = document.getElementById('solicitudRespuesta').value;

            const token = localStorage.getItem('token');
            
            // Actualizar estado
            const responseEstado = await fetch(`/api/solicitudes/${id}/estado`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ estado })
            });

            if (!responseEstado.ok) {
                throw new Error('Error al actualizar estado');
            }

            // Si hay respuesta, enviarla
            if (respuesta.trim()) {
                const responseRespuesta = await fetch(`/api/solicitudes/${id}/responder`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    },
                    body: JSON.stringify({ respuesta, estado })
                });

                if (!responseRespuesta.ok) {
                    throw new Error('Error al enviar respuesta');
                }
            }

            this.mostrarExito('Solicitud actualizada correctamente');
            this.cargarSolicitudes();
            
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalSolicitud'));
            modal.hide();

        } catch (error) {
            console.error('Error al guardar cambios:', error);
            this.mostrarError('Error al guardar los cambios');
        }
    }

    async eliminarSolicitud() {
        const id = document.getElementById('solicitudId').textContent;
        
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
                this.cargarSolicitudes();
                
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalSolicitud'));
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
    }

    mostrarError(mensaje) {
        // Implementar notificación de error
        console.error('Error:', mensaje);
        // Aquí podrías usar una librería de notificaciones como Toastr
    }
}

// Inicializar el manager cuando se carga la sección
let solicitudesManager;

// Función para inicializar cuando se navega a la sección
function initSolicitudesSection() {
    if (!solicitudesManager) {
        solicitudesManager = new SolicitudesManager();
    } else {
        solicitudesManager.cargarSolicitudes();
    }
}