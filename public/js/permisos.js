// permisos.js - Gestión centralizada de permisos

// Clase para manejar la gestión centralizada de permisos
class PermisosManager {
    constructor() {
        this.usuarios = [];
        this.actividad = [];
        this.permisoModal = new bootstrap.Modal(document.getElementById('permisoModal'));
    }

    // Inicializar gestor
    init() {
        this.setupEventListeners();
        this.loadUsuariosComite();
        this.loadActividad();
    }

    // Configurar listeners de eventos
    setupEventListeners() {
        // Botón guardar permisos
        const btnGuardarPermisos = document.getElementById('btnGuardarPermisos');
        if (btnGuardarPermisos) {
            btnGuardarPermisos.addEventListener('click', () => this.guardarPermisos());
        }
        
        // Botón para mostrar todos los usuarios
        const btnMostrarTodos = document.getElementById('btnMostrarTodosUsuarios');
        if (btnMostrarTodos) {
            btnMostrarTodos.addEventListener('click', () => this.loadUsuariosComite(true));
        }

        // Configurar botones de selección masiva de permisos
        this.setupMassPermissionButtons();
        
        // Configurar vista previa de cambios
        this.setupPreviewChanges();
        
        // Configurar toggles de permisos con actualización en tiempo real
        this.setupPermissionToggles();
    }

    // Configurar botones de selección masiva de permisos
    setupMassPermissionButtons() {
        const btnSeleccionarTodosPermisos = document.getElementById('btnSeleccionarTodosPermisos');
        if (btnSeleccionarTodosPermisos) {
            btnSeleccionarTodosPermisos.addEventListener('click', () => {
                document.querySelectorAll('.permission-toggle').forEach(toggle => {
                    toggle.checked = true;
                });
                this.updatePermissionsSummary();
            });
        }

        const btnDeseleccionarTodosPermisos = document.getElementById('btnDeseleccionarTodosPermisos');
        if (btnDeseleccionarTodosPermisos) {
            btnDeseleccionarTodosPermisos.addEventListener('click', () => {
                document.querySelectorAll('.permission-toggle').forEach(toggle => {
                    toggle.checked = false;
                });
                this.updatePermissionsSummary();
            });
        }
    }

    // Configurar vista previa de cambios
    setupPreviewChanges() {
        const btnPreviewCambios = document.getElementById('btnPreviewCambios');
        if (btnPreviewCambios) {
            btnPreviewCambios.addEventListener('click', () => {
                this.showPreviewChanges();
            });
        }
    }

    // Configurar toggles de permisos con actualización en tiempo real
    setupPermissionToggles() {
        document.querySelectorAll('.permission-toggle').forEach(toggle => {
            toggle.addEventListener('change', () => {
                this.updatePermissionsSummary();
            });
        });
    }

    // Actualizar resumen de permisos
    updatePermissionsSummary() {
        const activePermissions = document.querySelectorAll('.permission-toggle:checked').length;
        const totalPermissions = document.querySelectorAll('.permission-toggle').length;
        
        const progressBar = document.getElementById('permisosProgressBar');
        const activeCount = document.getElementById('permisosActivosCount');
        const activeLabel = document.getElementById('permisosActivosLabel');
        
        if (progressBar) {
            const percentage = totalPermissions > 0 ? (activePermissions / totalPermissions) * 100 : 0;
            progressBar.style.width = `${percentage}%`;
            progressBar.textContent = `${Math.round(percentage)}%`;
            progressBar.setAttribute('aria-valuenow', activePermissions);
        }
        
        if (activeCount) {
            activeCount.textContent = activePermissions;
        }
        
        if (activeLabel) {
            activeLabel.textContent = `${activePermissions}/${totalPermissions}`;
        }
    }

    // Mostrar vista previa de cambios
    showPreviewChanges() {
        const usuarioId = document.getElementById('permisoUsuarioId').value;
        const usuario = this.usuarios.find(u => u.id === parseInt(usuarioId));
        
        if (!usuario) return;

        // Obtener permisos actuales y nuevos
        const permisosActuales = usuario.permisos || {};
        const permisosNuevos = {
            anuncios: document.getElementById('permisoAnuncios').checked,
            gastos: document.getElementById('permisoGastos').checked,
            presupuestos: document.getElementById('permisoPresupuestos').checked,
            cuotas: document.getElementById('permisoCuotas').checked,
            usuarios: document.getElementById('permisoUsuarios').checked,
            cierres: document.getElementById('permisoCierres').checked
        };

        // Generar tabla de cambios
        const cambiosContainer = document.getElementById('cambiosPreviewContainer');
        const cambiosBody = document.getElementById('cambiosPreviewBody');
        
        if (!cambiosContainer || !cambiosBody) return;

        cambiosBody.innerHTML = '';
        let hayCambios = false;

        const permisoLabels = {
            anuncios: 'Anuncios',
            gastos: 'Gastos', 
            presupuestos: 'Presupuestos',
            cuotas: 'Cuotas',
            usuarios: 'Usuarios',
            cierres: 'Cierres'
        };

        Object.keys(permisoLabels).forEach(key => {
            const actual = permisosActuales[key] || false;
            const nuevo = permisosNuevos[key];
            
            if (actual !== nuevo) {
                hayCambios = true;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${permisoLabels[key]}</td>
                    <td>
                        <span class="badge ${actual ? 'bg-success' : 'bg-secondary'}">
                            ${actual ? 'Activo' : 'Inactivo'}
                        </span>
                    </td>
                    <td class="text-center">
                        <i class="bi bi-arrow-right change-arrow"></i>
                    </td>
                    <td>
                        <span class="badge ${nuevo ? 'bg-success' : 'bg-secondary'}">
                            ${nuevo ? 'Activo' : 'Inactivo'}
                        </span>
                    </td>
                `;
                cambiosBody.appendChild(tr);
            }
        });

        if (hayCambios) {
            cambiosContainer.classList.remove('d-none');
        } else {
            cambiosContainer.classList.add('d-none');
            // Mostrar mensaje de que no hay cambios
            const alert = document.getElementById('permisoModalAlert');
            if (alert) {
                alert.className = 'alert alert-info';
                alert.querySelector('#permisoModalAlertMessage').textContent = 'No hay cambios en los permisos';
                alert.classList.remove('d-none');
                
                setTimeout(() => {
                    alert.classList.add('d-none');
                }, 3000);
            }
        }
    }

    // Cargar usuarios con rol COMITE
    async loadUsuariosComite(mostrarTodos = false) {
        try {
            const response = await fetchAuth(`${API_URL}/permisos${mostrarTodos ? '?todos=true' : ''}`);
            this.usuarios = response.usuarios || [];
            this.renderUsuariosTable();
        } catch (error) {
            console.error('Error al cargar usuarios del comité:', error);
            showAlert('permisosAlertContainer', 'Error al cargar usuarios del comité', 'danger');
        }
    }

    // Cargar historial de actividad
    async loadActividad() {
        try {
            const response = await fetchAuth(`${API_URL}/permisos/actividad`);
            
            if (!response.success) {
                throw new Error(response.message || 'Error al cargar historial de actividad');
            }
            
            this.actividad = response.actividad || [];
            this.renderActividadTable();
        } catch (error) {
            console.error('Error al cargar historial de actividad:', error);
            showAlert('permisosAlertContainer', `Error: ${error.message || 'Error al cargar historial de actividad'}`, 'danger');
        }
    }

    // Renderizar tabla de usuarios
    renderUsuariosTable() {
        const tableBody = document.getElementById('permisosTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (this.usuarios.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="4" class="text-center">No hay usuarios con rol de comité</td>';
            tableBody.appendChild(tr);
            return;
        }
        
        this.usuarios.forEach(usuario => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${usuario.nombre}</td>
                <td>${usuario.email}</td>
                <td>${usuario.departamento || '-'}</td>
                <td>
                    ${this.renderPermisosIcons(usuario.permisos)}
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" data-action="edit" data-id="${usuario.id}">
                        <i class="bi bi-gear-fill me-1"></i> Configurar
                    </button>
                </td>
            `;
            
            tableBody.appendChild(tr);
        });
        
        // Configurar botones de acción
        tableBody.querySelectorAll('[data-action="edit"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(button.getAttribute('data-id'));
                this.editarPermisos(id);
            });
        });
    }

    // Renderizar tabla de actividad
    renderActividadTable() {
        const tableBody = document.getElementById('actividadTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (this.actividad.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="4" class="text-center">No hay registros de actividad</td>';
            tableBody.appendChild(tr);
            return;
        }
        
        this.actividad.forEach(item => {
            const tr = document.createElement('tr');
            
            // Formatear fecha
            const fecha = new Date(item.fecha);
            const fechaFormateada = `${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}`;
            
            tr.innerHTML = `
                <td>${fechaFormateada}</td>
                <td>${item.administrador}</td>
                <td>${item.usuario}</td>
                <td>${item.descripcion}</td>
            `;
            
            tableBody.appendChild(tr);
        });
    }

    // Mostrar modal de edición de permisos
    editarPermisos(id) {
        const usuario = this.usuarios.find(u => u.id === id);
        if (!usuario) return;
        
        // Configurar modal
        document.getElementById('permisoUsuarioId').value = usuario.id;
        document.getElementById('permisoUsuarioNombre').textContent = usuario.nombre;
        document.getElementById('permisoUsuarioEmail').textContent = usuario.email;
        
        // Configurar información adicional del usuario
        const userInitials = document.getElementById('permisoUsuarioInitials');
        if (userInitials) {
            userInitials.textContent = this.getInitials(usuario.nombre);
        }
        
        const userDepartamento = document.getElementById('permisoUsuarioDepartamento');
        if (userDepartamento) {
            userDepartamento.textContent = usuario.departamento ? `Depto ${usuario.departamento}` : 'Sin departamento';
        }
        
        // Configurar checkboxes de permisos
        document.getElementById('permisoAnuncios').checked = usuario.permisos?.anuncios || false;
        document.getElementById('permisoGastos').checked = usuario.permisos?.gastos || false;
        document.getElementById('permisoPresupuestos').checked = usuario.permisos?.presupuestos || false;
        document.getElementById('permisoCuotas').checked = usuario.permisos?.cuotas || false;
        document.getElementById('permisoUsuarios').checked = usuario.permisos?.usuarios || false;
        document.getElementById('permisoCierres').checked = usuario.permisos?.cierres || false;
        
        // Actualizar resumen de permisos
        this.updatePermissionsSummary();
        
        // Ocultar vista previa de cambios
        const cambiosContainer = document.getElementById('cambiosPreviewContainer');
        if (cambiosContainer) {
            cambiosContainer.classList.add('d-none');
        }
        
        // Mostrar modal
        this.permisoModal.show();
    }

    // Obtener iniciales del nombre
    getInitials(nombre) {
        return nombre.split(' ')
                    .map(word => word.charAt(0))
                    .join('')
                    .toUpperCase()
                    .substring(0, 2);
    }

    // Guardar permisos
    async guardarPermisos() {
        try {
            const usuarioId = document.getElementById('permisoUsuarioId').value;
            
            // Obtener permisos seleccionados
            const permisos = {
                anuncios: document.getElementById('permisoAnuncios').checked,
                gastos: document.getElementById('permisoGastos').checked,
                presupuestos: document.getElementById('permisoPresupuestos').checked,
                cuotas: document.getElementById('permisoCuotas').checked,
                usuarios: document.getElementById('permisoUsuarios').checked,
                cierres: document.getElementById('permisoCierres').checked
            };
            
            // Enviar actualización al servidor
            const response = await fetchAuth(`${API_URL}/permisos/${usuarioId}`, {
                method: 'PUT',
                body: JSON.stringify({ permisos })
            });
            
            // Registrar actividad
            const usuario = this.usuarios.find(u => u.id === parseInt(usuarioId));
            const descripcion = this.generarDescripcionCambios(usuario.permisos, permisos);
            
            if (descripcion) {
                await fetchAuth(`${API_URL}/permisos/actividad`, {
                    method: 'POST',
                    body: JSON.stringify({
                        usuarioId: parseInt(usuarioId),
                        descripcion
                    })
                });
            }
            
            // Cerrar modal y recargar datos
            this.permisoModal.hide();
            showAlert('permisosAlertContainer', 'Permisos actualizados exitosamente', 'success');
            
            // Recargar datos
            this.loadUsuariosComite();
            this.loadActividad();
        } catch (error) {
            console.error('Error al guardar permisos:', error);
            showAlert('permisosAlertContainer', error.message || 'Error al guardar permisos', 'danger');
        }
    }

    // Generar descripción de cambios para el registro de actividad
    generarDescripcionCambios(permisosAnteriores, permisosNuevos) {
        if (!permisosAnteriores) permisosAnteriores = {};
        
        const cambios = [];
        
        // Verificar cada permiso
        if (permisosAnteriores.anuncios !== permisosNuevos.anuncios) {
            cambios.push(`Anuncios: ${permisosAnteriores.anuncios ? 'Sí' : 'No'} → ${permisosNuevos.anuncios ? 'Sí' : 'No'}`);
        }
        
        if (permisosAnteriores.gastos !== permisosNuevos.gastos) {
            cambios.push(`Gastos: ${permisosAnteriores.gastos ? 'Sí' : 'No'} → ${permisosNuevos.gastos ? 'Sí' : 'No'}`);
        }
        
        if (permisosAnteriores.presupuestos !== permisosNuevos.presupuestos) {
            cambios.push(`Presupuestos: ${permisosAnteriores.presupuestos ? 'Sí' : 'No'} → ${permisosNuevos.presupuestos ? 'Sí' : 'No'}`);
        }
        
        if (permisosAnteriores.cuotas !== permisosNuevos.cuotas) {
            cambios.push(`Cuotas: ${permisosAnteriores.cuotas ? 'Sí' : 'No'} → ${permisosNuevos.cuotas ? 'Sí' : 'No'}`);
        }
        
        if (permisosAnteriores.usuarios !== permisosNuevos.usuarios) {
            cambios.push(`Usuarios: ${permisosAnteriores.usuarios ? 'Sí' : 'No'} → ${permisosNuevos.usuarios ? 'Sí' : 'No'}`);
        }
        
        if (permisosAnteriores.cierres !== permisosNuevos.cierres) {
            cambios.push(`Cierres: ${permisosAnteriores.cierres ? 'Sí' : 'No'} → ${permisosNuevos.cierres ? 'Sí' : 'No'}`);
        }
        
        return cambios.length > 0 ? cambios.join(', ') : '';
    }

    // Renderizar iconos de permisos
    renderPermisosIcons(permisos) {
        if (!permisos) return '<span class="text-muted">Sin permisos</span>';
        
        // Si no tiene ningún permiso
        if (!permisos.anuncios && !permisos.gastos && !permisos.presupuestos && 
            !permisos.cuotas && !permisos.usuarios && !permisos.cierres) {
            return '<span class="text-muted">Sin permisos</span>';
        }
        
        let html = '<div class="d-flex flex-wrap gap-2">';
        
        // Crear badges para cada permiso
        if (permisos.anuncios) {
            html += '<span class="badge bg-success">Anuncios</span>';
        }
        
        if (permisos.gastos) {
            html += '<span class="badge bg-success">Gastos</span>';
        }
        
        if (permisos.presupuestos) {
            html += '<span class="badge bg-success">Presupuestos</span>';
        }
        
        if (permisos.cuotas) {
            html += '<span class="badge bg-success">Cuotas</span>';
        }
        
        if (permisos.usuarios) {
            html += '<span class="badge bg-success">Usuarios</span>';
        }
        
        if (permisos.cierres) {
            html += '<span class="badge bg-success">Cierres</span>';
        }
        
        html += '</div>';
        
        return html;
    }
}

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si estamos en la página de admin y la sección de permisos existe
    const permisosSection = document.getElementById('permisosSection');
    
    if (permisosSection) {
        // Inicializar gestor de permisos
        const permisosManager = new PermisosManager();
        permisosManager.init();
        
        // Exponer para uso global si es necesario
        window.permisosManager = permisosManager;
    }
});