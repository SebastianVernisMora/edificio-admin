// usuarios.js - Gestión de usuarios

/**
 * Función global para mostrar detalles de permisos en un modal
 * @param {Object} permisos - Objeto con los permisos del usuario
 */
function showPermisosDetails(permisos) {
    // Crear modal dinámicamente si no existe
    let permisosModal = document.getElementById('permisosDetalleModal');
    
    if (!permisosModal) {
        const modalHTML = `
            <div class="modal fade" id="permisosDetalleModal" tabindex="-1" aria-labelledby="permisosDetalleModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-light">
                            <h5 class="modal-title" id="permisosDetalleModalLabel">
                                <i class="bi bi-shield-check me-2"></i> Detalles de Permisos
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body" id="permisosDetalleBody">
                            <!-- Contenido dinámico -->
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        permisosModal = document.getElementById('permisosDetalleModal');
    }
    
    // Configurar contenido del modal
    const permisosBody = document.getElementById('permisosDetalleBody');
    
    // Definir todos los permisos posibles con sus descripciones
    const permisosConfig = [
        { key: 'anuncios', icon: 'bi-megaphone', title: 'Gestión de Anuncios', description: 'Puede crear, editar y eliminar anuncios', color: 'primary' },
        { key: 'gastos', icon: 'bi-credit-card', title: 'Gestión de Gastos', description: 'Puede registrar y administrar gastos', color: 'success' },
        { key: 'presupuestos', icon: 'bi-calculator', title: 'Gestión de Presupuestos', description: 'Puede crear y administrar presupuestos', color: 'warning' },
        { key: 'cuotas', icon: 'bi-cash-coin', title: 'Gestión de Cuotas', description: 'Puede gestionar cuotas y pagos', color: 'info' },
        { key: 'usuarios', icon: 'bi-people', title: 'Gestión de Usuarios', description: 'Puede administrar usuarios del sistema', color: 'danger' },
        { key: 'cierres', icon: 'bi-journal-check', title: 'Gestión de Cierres', description: 'Puede realizar cierres contables', color: 'secondary' }
    ];
    
    // Calcular número de permisos activos
    const permisosActivos = permisosConfig.filter(config => permisos[config.key]).length;
    
    // Generar resumen de permisos
    let permisosHTML = `
        <div class="alert ${permisosActivos > 0 ? 'alert-info' : 'alert-warning'} d-flex align-items-center mb-4">
            <div class="me-3">
                <i class="bi ${permisosActivos > 0 ? 'bi-info-circle-fill' : 'bi-exclamation-triangle-fill'} fs-4"></i>
            </div>
            <div>
                <h6 class="alert-heading mb-1">Resumen de Permisos</h6>
                <p class="mb-0">
                    ${permisosActivos > 0 
                        ? `Este usuario tiene <strong>${permisosActivos} de ${permisosConfig.length}</strong> permisos activos.` 
                        : 'Este usuario <strong>no tiene permisos activos</strong>.'}
                </p>
            </div>
        </div>
        
        <div class="progress mb-4" style="height: 20px;">
            <div class="progress-bar bg-success" role="progressbar" style="width: ${(permisosActivos / permisosConfig.length) * 100}%;" 
                 aria-valuenow="${permisosActivos}" aria-valuemin="0" aria-valuemax="${permisosConfig.length}">
                ${permisosActivos}/${permisosConfig.length}
            </div>
        </div>
        
        <div class="row">
    `;
    
    // Generar tarjetas de permisos
    permisosConfig.forEach(config => {
        const tienePermiso = permisos[config.key];
        permisosHTML += `
            <div class="col-md-6 mb-3">
                <div class="card h-100 ${tienePermiso ? 'border-' + config.color : 'border-light'}">
                    <div class="card-header ${tienePermiso ? 'bg-' + config.color + ' bg-opacity-10' : 'bg-light'}">
                        <div class="d-flex justify-content-between align-items-center">
                            <h6 class="mb-0">
                                <i class="bi ${config.icon} me-2 ${tienePermiso ? 'text-' + config.color : 'text-muted'}"></i>
                                ${config.title}
                            </h6>
                            <span class="badge ${tienePermiso ? 'bg-' + config.color : 'bg-secondary'}">
                                ${tienePermiso ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                    </div>
                    <div class="card-body">
                        <p class="card-text ${tienePermiso ? '' : 'text-muted'}">${config.description}</p>
                        <div class="d-flex flex-wrap gap-2">
                            ${getPermissionActions(config.key, tienePermiso)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    permisosHTML += '</div>';
    permisosBody.innerHTML = permisosHTML;
    
    // Mostrar modal
    const modal = new bootstrap.Modal(permisosModal);
    modal.show();
}

/**
 * Obtiene las acciones específicas para cada tipo de permiso
 * @param {string} permissionKey - Clave del permiso
 * @param {boolean} isActive - Si el permiso está activo
 * @returns {string} HTML con las acciones del permiso
 */
function getPermissionActions(permissionKey, isActive) {
    const opacity = isActive ? '' : 'opacity-50';
    let actions = '';
    
    switch (permissionKey) {
        case 'anuncios':
            actions = `
                <span class="badge bg-light text-dark ${opacity}">Crear anuncios</span>
                <span class="badge bg-light text-dark ${opacity}">Editar anuncios</span>
                <span class="badge bg-light text-dark ${opacity}">Eliminar anuncios</span>
            `;
            break;
        case 'gastos':
            actions = `
                <span class="badge bg-light text-dark ${opacity}">Registrar gastos</span>
                <span class="badge bg-light text-dark ${opacity}">Editar gastos</span>
                <span class="badge bg-light text-dark ${opacity}">Ver reportes</span>
            `;
            break;
        case 'presupuestos':
            actions = `
                <span class="badge bg-light text-dark ${opacity}">Crear presupuestos</span>
                <span class="badge bg-light text-dark ${opacity}">Editar presupuestos</span>
                <span class="badge bg-light text-dark ${opacity}">Ver reportes</span>
            `;
            break;
        case 'cuotas':
            actions = `
                <span class="badge bg-light text-dark ${opacity}">Generar cuotas</span>
                <span class="badge bg-light text-dark ${opacity}">Registrar pagos</span>
                <span class="badge bg-light text-dark ${opacity}">Ver reportes</span>
            `;
            break;
        case 'usuarios':
            actions = `
                <span class="badge bg-light text-dark ${opacity}">Ver usuarios</span>
                <span class="badge bg-light text-dark ${opacity}">Editar inquilinos</span>
            `;
            break;
        case 'cierres':
            actions = `
                <span class="badge bg-light text-dark ${opacity}">Generar cierres</span>
                <span class="badge bg-light text-dark ${opacity}">Ver reportes</span>
                <span class="badge bg-light text-dark ${opacity}">Exportar datos</span>
            `;
            break;
    }
    
    return actions;
}

// Clase para manejar la gestión de usuarios
class UsuariosManager {
    constructor() {
        this.usuarios = [];
        this.usuarioModal = new bootstrap.Modal(document.getElementById('usuarioModal'));
        this.searchTimeout = null; // Para búsqueda con retraso
    }

    // Inicializar gestor
    init() {
        this.setupEventListeners();
    }

    // Configurar listeners de eventos
    setupEventListeners() {
        // Botón guardar usuario
        const btnGuardarUsuario = document.getElementById('btnGuardarUsuario');
        if (btnGuardarUsuario) {
            btnGuardarUsuario.addEventListener('click', () => this.guardarUsuario());
        }
        
        // Cambio en el rol para mostrar/ocultar sección de permisos
        const rolSelect = document.getElementById('usuarioRol');
        if (rolSelect) {
            rolSelect.addEventListener('change', () => this.togglePermisosSection());
        }
        
        // Botón nuevo usuario
        const btnNuevoUsuario = document.getElementById('btnNuevoUsuario');
        if (btnNuevoUsuario) {
            btnNuevoUsuario.addEventListener('click', () => this.showUsuarioModal());
        }
        
        // Botón filtrar usuarios
        const btnFiltrarUsuarios = document.getElementById('btnFiltrarUsuarios');
        if (btnFiltrarUsuarios) {
            btnFiltrarUsuarios.addEventListener('click', () => this.filtrarUsuarios());
        }
        
        // Botón limpiar filtros
        const btnLimpiarFiltrosUsuarios = document.getElementById('btnLimpiarFiltrosUsuarios');
        if (btnLimpiarFiltrosUsuarios) {
            btnLimpiarFiltrosUsuarios.addEventListener('click', () => this.limpiarFiltrosUsuarios());
        }
        
        // Búsqueda en tiempo real
        const filtroUsuarioBusqueda = document.getElementById('filtroUsuarioBusqueda');
        if (filtroUsuarioBusqueda) {
            filtroUsuarioBusqueda.addEventListener('input', () => {
                // Aplicar filtro después de un breve retraso para evitar muchas actualizaciones
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => this.filtrarUsuarios(), 300);
            });
        }

        // Configurar botones de selección de permisos
        this.setupPermissionButtons();
        
        // Configurar toggle de password
        this.setupPasswordToggle();
        
        // Cargar departamentos en el filtro
        this.cargarDepartamentosEnFiltro();
    }

    // Configurar botones de selección de permisos
    setupPermissionButtons() {
        const btnSeleccionarTodos = document.getElementById('btnSeleccionarTodos');
        if (btnSeleccionarTodos) {
            btnSeleccionarTodos.addEventListener('click', () => {
                document.querySelectorAll('#permisosSection input[type="checkbox"]').forEach(checkbox => {
                    checkbox.checked = true;
                });
            });
        }

        const btnDeseleccionarTodos = document.getElementById('btnDeseleccionarTodos');
        if (btnDeseleccionarTodos) {
            btnDeseleccionarTodos.addEventListener('click', () => {
                document.querySelectorAll('#permisosSection input[type="checkbox"]').forEach(checkbox => {
                    checkbox.checked = false;
                });
            });
        }
    }

    // Configurar toggle de password
    setupPasswordToggle() {
        const togglePassword = document.getElementById('togglePassword');
        const passwordInput = document.getElementById('usuarioPassword');
        
        if (togglePassword && passwordInput) {
            togglePassword.addEventListener('click', () => {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                
                const icon = togglePassword.querySelector('i');
                if (icon) {
                    icon.className = type === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash';
                }
            });
        }
    }
    
    // Cargar departamentos en el filtro
    cargarDepartamentosEnFiltro() {
        const departamentosSelect = document.getElementById('filtroUsuarioDepartamento');
        if (!departamentosSelect) return;
        
        // Lista de departamentos disponibles
        const departamentos = [
            '101', '102', '103', '104',
            '201', '202', '203', '204',
            '301', '302', '303', '304',
            '401', '402', '403', '404',
            '501', '502', '503', '504'
        ];
        
        // Limpiar opciones existentes (excepto la primera)
        while (departamentosSelect.options.length > 1) {
            departamentosSelect.remove(1);
        }
        
        // Añadir opciones de departamentos
        departamentos.forEach(depto => {
            const option = document.createElement('option');
            option.value = depto;
            option.textContent = depto;
            departamentosSelect.appendChild(option);
        });
    }
    
    // Filtrar usuarios según criterios seleccionados
    filtrarUsuarios() {
        const rol = document.getElementById('filtroUsuarioRol')?.value || '';
        const estado = document.getElementById('filtroUsuarioEstado')?.value || '';
        const departamento = document.getElementById('filtroUsuarioDepartamento')?.value || '';
        const busqueda = document.getElementById('filtroUsuarioBusqueda')?.value.toLowerCase() || '';
        
        // Aplicar filtros a la lista completa de usuarios
        const usuariosFiltrados = this.usuarios.filter(usuario => {
            // Filtro por rol
            if (rol && usuario.rol !== rol) {
                return false;
            }
            
            // Filtro por estado
            if (estado !== '') {
                const estadoBoolean = estado === 'true';
                if (usuario.activo !== estadoBoolean) {
                    return false;
                }
            }
            
            // Filtro por departamento
            if (departamento && usuario.departamento !== departamento) {
                return false;
            }
            
            // Filtro por búsqueda (nombre o email)
            if (busqueda) {
                const nombreMatch = usuario.nombre.toLowerCase().includes(busqueda);
                const emailMatch = usuario.email.toLowerCase().includes(busqueda);
                if (!nombreMatch && !emailMatch) {
                    return false;
                }
            }
            
            return true;
        });
        
        // Renderizar tabla con usuarios filtrados
        this.renderUsuariosTableFiltered(usuariosFiltrados);
    }
    
    // Renderizar tabla con usuarios filtrados
    renderUsuariosTableFiltered(usuariosFiltrados) {
        const tableBody = document.getElementById('usuariosTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (usuariosFiltrados.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="7" class="text-center">No se encontraron usuarios con los filtros seleccionados</td>';
            tableBody.appendChild(tr);
            return;
        }
        
        usuariosFiltrados.forEach(usuario => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${usuario.id}</td>
                <td>${usuario.nombre}</td>
                <td>${usuario.email}</td>
                <td>${usuario.departamento || '-'}</td>
                <td>
                    <span class="badge ${
                        usuario.rol === 'ADMIN' ? 'bg-primary' : 
                        usuario.rol === 'COMITE' ? 'bg-info' : 
                        'bg-secondary'
                    }">${usuario.rol}</span>
                    ${usuario.rol === 'COMITE' ? this.renderPermisosIcons(usuario.permisos) : ''}
                </td>
                <td><span class="badge ${usuario.activo ? 'bg-success' : 'bg-danger'}">${usuario.activo ? 'Activo' : 'Inactivo'}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" data-action="edit" data-id="${usuario.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${usuario.id}">
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
                
                if (action === 'edit') {
                    this.editarUsuario(id);
                } else if (action === 'delete') {
                    this.eliminarUsuario(id);
                }
            });
        });
        
        // Inicializar tooltips
        const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltips.forEach(tooltip => {
            new bootstrap.Tooltip(tooltip);
        });
    }
    
    // Limpiar filtros de usuarios
    limpiarFiltrosUsuarios() {
        // Restablecer valores de los filtros
        const filtros = [
            'filtroUsuarioRol',
            'filtroUsuarioEstado',
            'filtroUsuarioDepartamento',
            'filtroUsuarioBusqueda'
        ];
        
        filtros.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                if (elemento.tagName === 'SELECT') {
                    elemento.selectedIndex = 0;
                } else if (elemento.tagName === 'INPUT') {
                    elemento.value = '';
                }
            }
        });
        
        // Volver a mostrar todos los usuarios
        this.renderUsuariosTable();
    }
    
    // Mostrar u ocultar sección de permisos según el rol seleccionado
    togglePermisosSection() {
        const rolSelect = document.getElementById('usuarioRol');
        const permisosSection = document.getElementById('permisosSection');
        
        if (rolSelect && permisosSection) {
            if (rolSelect.value === 'COMITE') {
                permisosSection.style.display = 'block';
            } else {
                permisosSection.style.display = 'none';
            }
        }
    }

    // Cargar usuarios
    async loadUsuarios() {
        try {
            const response = await fetchAuth(`${API_URL}/auth/usuarios`);
            this.usuarios = response.usuarios || [];
            
            // Verificar si hay filtros activos
            const hayFiltrosActivos = this.verificarFiltrosActivos();
            
            if (hayFiltrosActivos) {
                // Si hay filtros activos, aplicarlos
                this.filtrarUsuarios();
            } else {
                // Si no hay filtros, mostrar todos los usuarios
                this.renderUsuariosTable();
            }
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            showAlert('alertContainer', 'Error al cargar usuarios', 'danger');
        }
    }
    
    // Verificar si hay filtros activos
    verificarFiltrosActivos() {
        const rol = document.getElementById('filtroUsuarioRol')?.value || '';
        const estado = document.getElementById('filtroUsuarioEstado')?.value || '';
        const departamento = document.getElementById('filtroUsuarioDepartamento')?.value || '';
        const busqueda = document.getElementById('filtroUsuarioBusqueda')?.value || '';
        
        return rol !== '' || estado !== '' || departamento !== '' || busqueda !== '';
    }

    // Renderizar tabla de usuarios
    renderUsuariosTable() {
        const tableBody = document.getElementById('usuariosTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (this.usuarios.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="7" class="text-center">No hay usuarios registrados</td>';
            tableBody.appendChild(tr);
            return;
        }
        
        this.usuarios.forEach(usuario => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${usuario.id}</td>
                <td>${usuario.nombre}</td>
                <td>${usuario.email}</td>
                <td>${usuario.departamento || '-'}</td>
                <td>
                    <span class="badge ${
                        usuario.rol === 'ADMIN' ? 'bg-primary' : 
                        usuario.rol === 'COMITE' ? 'bg-info' : 
                        'bg-secondary'
                    }">${usuario.rol}</span>
                    ${usuario.rol === 'COMITE' ? this.renderPermisosIcons(usuario.permisos) : ''}
                </td>
                <td><span class="badge ${usuario.activo ? 'bg-success' : 'bg-danger'}">${usuario.activo ? 'Activo' : 'Inactivo'}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" data-action="edit" data-id="${usuario.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${usuario.id}">
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
                
                if (action === 'edit') {
                    this.editarUsuario(id);
                } else if (action === 'delete') {
                    this.eliminarUsuario(id);
                }
            });
        });
        
        // Inicializar tooltips
        const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltips.forEach(tooltip => {
            new bootstrap.Tooltip(tooltip);
        });
    }

    // Mostrar modal de usuario
    showUsuarioModal(usuario = null) {
        // Limpiar formulario
        document.getElementById('usuarioForm').reset();
        document.getElementById('usuarioId').value = '';
        document.getElementById('passwordHelp').style.display = 'none';
        document.getElementById('permisosSection').style.display = 'none';
        
        // Limpiar mensajes de validación
        this.clearValidationMessages();
        
        // Desmarcar todos los checkboxes de permisos
        document.querySelectorAll('#permisosSection input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Configurar modal según sea nuevo o edición
        if (usuario) {
            document.getElementById('usuarioModalLabel').textContent = 'Editar Usuario';
            document.getElementById('usuarioId').value = usuario.id;
            document.getElementById('usuarioNombre').value = usuario.nombre;
            document.getElementById('usuarioEmail').value = usuario.email;
            document.getElementById('usuarioDepartamento').value = usuario.departamento || '';
            document.getElementById('usuarioRol').value = usuario.rol;
            document.getElementById('passwordHelp').style.display = 'block';
            
            // Si es usuario de comité, mostrar y configurar permisos
            if (usuario.rol === 'COMITE' && usuario.permisos) {
                document.getElementById('permisosSection').style.display = 'block';
                
                // Marcar checkboxes según permisos
                if (usuario.permisos.anuncios) document.getElementById('permisoAnuncios').checked = true;
                if (usuario.permisos.gastos) document.getElementById('permisoGastos').checked = true;
                if (usuario.permisos.presupuestos) document.getElementById('permisoPresupuestos').checked = true;
                if (usuario.permisos.cuotas) document.getElementById('permisoCuotas').checked = true;
                if (usuario.permisos.usuarios) document.getElementById('permisoUsuarios').checked = true;
                if (usuario.permisos.cierres) document.getElementById('permisoCierres').checked = true;
            }
        } else {
            document.getElementById('usuarioModalLabel').textContent = 'Nuevo Usuario';
        }
        
        // Configurar validación en tiempo real
        this.setupRealtimeValidation();
        
        // Mostrar modal
        this.usuarioModal.show();
    }
    
    // Configurar validación en tiempo real
    setupRealtimeValidation() {
        const nombreInput = document.getElementById('usuarioNombre');
        const emailInput = document.getElementById('usuarioEmail');
        const passwordInput = document.getElementById('usuarioPassword');
        const departamentoSelect = document.getElementById('usuarioDepartamento');
        
        // Validar nombre
        if (nombreInput) {
            nombreInput.addEventListener('input', () => {
                this.validateNombre(nombreInput.value);
            });
        }
        
        // Validar email
        if (emailInput) {
            emailInput.addEventListener('blur', () => {
                this.validateEmail(emailInput.value);
            });
        }
        
        // Validar password
        if (passwordInput) {
            passwordInput.addEventListener('input', () => {
                const usuarioId = document.getElementById('usuarioId').value;
                if (!usuarioId || passwordInput.value) {
                    this.validatePassword(passwordInput.value);
                }
            });
        }
        
        // Validar departamento
        if (departamentoSelect) {
            departamentoSelect.addEventListener('change', () => {
                this.validateDepartamento(departamentoSelect.value);
            });
        }
    }
    
    // Validar nombre
    validateNombre(nombre) {
        const input = document.getElementById('usuarioNombre');
        
        if (!nombre || nombre.trim().length < 3) {
            this.showValidationError(input, 'El nombre debe tener al menos 3 caracteres');
            return false;
        }
        
        this.showValidationSuccess(input);
        return true;
    }
    
    // Validar email
    validateEmail(email) {
        const input = document.getElementById('usuarioEmail');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            this.showValidationError(input, 'El email es obligatorio');
            return false;
        }
        
        if (!emailRegex.test(email)) {
            this.showValidationError(input, 'El email no es válido');
            return false;
        }
        
        this.showValidationSuccess(input);
        return true;
    }
    
    // Validar password
    validatePassword(password) {
        const input = document.getElementById('usuarioPassword');
        const usuarioId = document.getElementById('usuarioId').value;
        
        // Si es edición y no se proporciona password, es válido
        if (usuarioId && !password) {
            this.clearValidationMessage(input);
            return true;
        }
        
        if (!password || password.length < 6) {
            this.showValidationError(input, 'La contraseña debe tener al menos 6 caracteres');
            return false;
        }
        
        this.showValidationSuccess(input);
        return true;
    }
    
    // Validar departamento
    validateDepartamento(departamento) {
        const select = document.getElementById('usuarioDepartamento');
        
        if (!departamento) {
            this.showValidationError(select, 'Debe seleccionar un departamento');
            return false;
        }
        
        this.showValidationSuccess(select);
        return true;
    }
    
    // Mostrar error de validación
    showValidationError(element, message) {
        element.classList.remove('is-valid');
        element.classList.add('is-invalid');
        
        // Buscar o crear elemento de feedback
        let feedback = element.nextElementSibling;
        if (!feedback || !feedback.classList.contains('invalid-feedback')) {
            feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            element.parentNode.insertBefore(feedback, element.nextSibling);
        }
        
        feedback.textContent = message;
    }
    
    // Mostrar éxito de validación
    showValidationSuccess(element) {
        element.classList.remove('is-invalid');
        element.classList.add('is-valid');
        
        // Remover mensaje de error si existe
        const feedback = element.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.remove();
        }
    }
    
    // Limpiar mensaje de validación
    clearValidationMessage(element) {
        element.classList.remove('is-valid', 'is-invalid');
        
        const feedback = element.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.remove();
        }
    }
    
    // Limpiar todos los mensajes de validación
    clearValidationMessages() {
        const form = document.getElementById('usuarioForm');
        if (form) {
            form.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
                el.classList.remove('is-valid', 'is-invalid');
            });
            
            form.querySelectorAll('.invalid-feedback').forEach(el => {
                el.remove();
            });
        }
    }

    // Guardar usuario (crear o actualizar)
    async guardarUsuario() {
        try {
            const usuarioId = document.getElementById('usuarioId').value;
            const nombre = document.getElementById('usuarioNombre').value.trim();
            const email = document.getElementById('usuarioEmail').value.trim();
            const password = document.getElementById('usuarioPassword').value;
            const departamento = document.getElementById('usuarioDepartamento').value;
            const rol = document.getElementById('usuarioRol').value;
            
            // Validar todos los campos
            let isValid = true;
            
            if (!this.validateNombre(nombre)) isValid = false;
            if (!this.validateEmail(email)) isValid = false;
            if (!this.validateDepartamento(departamento)) isValid = false;
            
            // Validar password solo si es nuevo usuario o si se proporciona
            if (!usuarioId || password) {
                if (!this.validatePassword(password)) isValid = false;
            }
            
            if (!isValid) {
                showAlert('alertContainer', 'Por favor corrija los errores en el formulario', 'danger');
                return;
            }
            
            // Validar que al menos un permiso esté seleccionado si es COMITE
            if (rol === 'COMITE') {
                const tienePermisos = 
                    document.getElementById('permisoAnuncios').checked ||
                    document.getElementById('permisoGastos').checked ||
                    document.getElementById('permisoPresupuestos').checked ||
                    document.getElementById('permisoCuotas').checked ||
                    document.getElementById('permisoUsuarios').checked ||
                    document.getElementById('permisoCierres').checked;
                
                if (!tienePermisos) {
                    showAlert('alertContainer', 'Debe seleccionar al menos un permiso para usuarios del comité', 'warning');
                    return;
                }
            }
            
            // Mostrar loading en el botón
            const btnGuardar = document.getElementById('btnGuardarUsuario');
            const originalText = btnGuardar.innerHTML;
            btnGuardar.disabled = true;
            btnGuardar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';
            
            const userData = {
                nombre,
                email,
                departamento,
                rol
            };
            
            // Agregar password solo si se proporciona (o es nuevo usuario)
            if (password) {
                userData.password = password;
            }
            
            // Si el rol es COMITE, agregar permisos
            if (rol === 'COMITE') {
                userData.permisos = {
                    anuncios: document.getElementById('permisoAnuncios').checked,
                    gastos: document.getElementById('permisoGastos').checked,
                    presupuestos: document.getElementById('permisoPresupuestos').checked,
                    cuotas: document.getElementById('permisoCuotas').checked,
                    usuarios: document.getElementById('permisoUsuarios').checked,
                    cierres: document.getElementById('permisoCierres').checked
                };
            }
            
            let response;
            
            if (usuarioId) {
                // Actualizar usuario existente
                response = await fetchAuth(`${API_URL}/auth/usuarios/${usuarioId}`, {
                    method: 'PUT',
                    body: JSON.stringify(userData)
                });
                
                showAlert('alertContainer', 'Usuario actualizado exitosamente', 'success');
            } else {
                // Crear nuevo usuario
                response = await fetchAuth(`${API_URL}/auth/registro`, {
                    method: 'POST',
                    body: JSON.stringify(userData)
                });
                
                showAlert('alertContainer', 'Usuario creado exitosamente', 'success');
            }
            
            // Cerrar modal y recargar usuarios
            this.usuarioModal.hide();
            this.loadUsuarios();
            
            // Restaurar botón
            btnGuardar.disabled = false;
            btnGuardar.innerHTML = originalText;
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            showAlert('alertContainer', error.message || 'Error al guardar usuario', 'danger');
            
            // Restaurar botón en caso de error
            const btnGuardar = document.getElementById('btnGuardarUsuario');
            btnGuardar.disabled = false;
            btnGuardar.innerHTML = 'Guardar';
        }
    }

    // Editar usuario
    editarUsuario(id) {
        const usuario = this.usuarios.find(u => u.id === id);
        if (usuario) {
            this.showUsuarioModal(usuario);
        }
    }

    // Eliminar usuario con confirmación mejorada
    async eliminarUsuario(id) {
        const usuario = this.usuarios.find(u => u.id === id);
        if (!usuario) return;
        
        // Crear modal de confirmación personalizado
        const confirmModal = this.createConfirmModal(
            'Confirmar Eliminación',
            `¿Está seguro de eliminar al usuario <strong>${usuario.nombre}</strong>?`,
            `<div class="alert alert-warning">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Esta acción no se puede deshacer. Se eliminarán todos los datos asociados al usuario.
            </div>
            <p><strong>Email:</strong> ${usuario.email}</p>
            <p><strong>Departamento:</strong> ${usuario.departamento || 'N/A'}</p>
            <p><strong>Rol:</strong> ${usuario.rol}</p>`,
            'danger'
        );
        
        confirmModal.show();
        
        // Esperar confirmación
        const confirmed = await new Promise((resolve) => {
            const btnConfirm = document.getElementById('btnConfirmAction');
            const btnCancel = document.getElementById('btnCancelAction');
            
            btnConfirm.onclick = () => {
                confirmModal.hide();
                resolve(true);
            };
            
            btnCancel.onclick = () => {
                confirmModal.hide();
                resolve(false);
            };
        });
        
        if (!confirmed) return;
        
        try {
            // Mostrar loading
            this.showLoading(true);
            
            const response = await fetchAuth(`${API_URL}/auth/usuarios/${id}`, {
                method: 'DELETE'
            });
            
            showAlert('alertContainer', 'Usuario eliminado exitosamente', 'success');
            this.loadUsuarios();
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            showAlert('alertContainer', error.message || 'Error al eliminar usuario', 'danger');
        } finally {
            this.showLoading(false);
        }
    }
    
    // Crear modal de confirmación personalizado
    createConfirmModal(title, message, details, type = 'warning') {
        // Verificar si el modal ya existe
        let confirmModalElement = document.getElementById('confirmActionModal');
        
        if (!confirmModalElement) {
            const modalHTML = `
                <div class="modal fade" id="confirmActionModal" tabindex="-1" aria-labelledby="confirmActionModalLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header bg-${type} text-white">
                                <h5 class="modal-title" id="confirmActionModalLabel"></h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <p id="confirmActionMessage"></p>
                                <div id="confirmActionDetails"></div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" id="btnCancelAction">Cancelar</button>
                                <button type="button" class="btn btn-${type}" id="btnConfirmAction">Confirmar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            confirmModalElement = document.getElementById('confirmActionModal');
        }
        
        // Actualizar contenido
        document.getElementById('confirmActionModalLabel').textContent = title;
        document.getElementById('confirmActionMessage').innerHTML = message;
        document.getElementById('confirmActionDetails').innerHTML = details;
        
        // Actualizar clases de color
        const header = confirmModalElement.querySelector('.modal-header');
        header.className = `modal-header bg-${type} text-white`;
        
        const btnConfirm = document.getElementById('btnConfirmAction');
        btnConfirm.className = `btn btn-${type}`;
        
        return new bootstrap.Modal(confirmModalElement);
    }
    
    // Mostrar/ocultar loading
    showLoading(show) {
        const loadingElement = document.getElementById('loadingUsuariosConfig');
        if (loadingElement) {
            loadingElement.style.display = show ? 'block' : 'none';
        }
    }
    
    // Renderizar iconos de permisos para usuarios de comité
    renderPermisosIcons(permisos) {
        if (!permisos) return '';
        
        // Definir todos los permisos posibles con sus iconos y descripciones
        const permisosConfig = [
            { key: 'anuncios', icon: 'bi-megaphone', title: 'Gestión de Anuncios', description: 'Puede crear, editar y eliminar anuncios' },
            { key: 'gastos', icon: 'bi-credit-card', title: 'Gestión de Gastos', description: 'Puede registrar y administrar gastos' },
            { key: 'presupuestos', icon: 'bi-calculator', title: 'Gestión de Presupuestos', description: 'Puede crear y administrar presupuestos' },
            { key: 'cuotas', icon: 'bi-cash-coin', title: 'Gestión de Cuotas', description: 'Puede gestionar cuotas y pagos' },
            { key: 'usuarios', icon: 'bi-people', title: 'Gestión de Usuarios', description: 'Puede administrar usuarios del sistema' },
            { key: 'cierres', icon: 'bi-journal-check', title: 'Gestión de Cierres', description: 'Puede realizar cierres contables' }
        ];
        
        // Crear contenedor con tooltip para mostrar resumen de permisos
        let icons = '<div class="mt-1 d-flex align-items-center">';
        
        // Contador de permisos activos
        let permisosActivos = 0;
        
        // Generar iconos para permisos activos
        permisosConfig.forEach(config => {
            if (permisos[config.key]) {
                permisosActivos++;
                icons += `<i class="bi ${config.icon} text-success me-1" 
                            data-bs-toggle="tooltip" 
                            data-bs-placement="top" 
                            title="${config.title}: ${config.description}"></i>`;
            }
        });
        
        // Mostrar resumen de permisos
        icons += `<span class="badge bg-success ms-1" 
                       data-bs-toggle="tooltip" 
                       data-bs-placement="top" 
                       title="Este usuario tiene ${permisosActivos} de ${permisosConfig.length} permisos activos">
                    ${permisosActivos}/${permisosConfig.length}
                  </span>`;
        
        // Botón para ver detalles completos
        icons += `<button class="btn btn-sm btn-outline-info ms-2" 
                         onclick="event.stopPropagation(); showPermisosDetails(${JSON.stringify(permisos).replace(/"/g, '&quot;')})">
                    <i class="bi bi-eye-fill"></i>
                  </button>`;
        
        icons += '</div>';
        
        return icons;
    }
}