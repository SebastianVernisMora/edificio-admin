// configuracion.js - Gestor unificado para la sección de configuración

/**
 * Clase principal para manejar la sección de configuración
 * Coordina la gestión de usuarios y permisos en una interfaz unificada
 */
class ConfiguracionManager {
    constructor() {
        this.usuariosManager = null;
        this.permisosManager = null;
        this.currentTab = 'usuarios';
        this.searchTimeout = null;
    }

    /**
     * Inicializar el gestor de configuración
     */
    init() {
        console.log('🔧 Inicializando ConfiguracionManager...');
        
        // Verificar que estamos en la sección correcta
        if (!document.getElementById('configuracionSection')) {
            console.warn('⚠️ Sección de configuración no encontrada');
            return;
        }

        // Inicializar gestores de subsecciones
        this.initializeSubManagers();
        
        // Configurar navegación por tabs
        this.setupTabNavigation();
        
        // Configurar eventos globales
        this.setupGlobalEvents();
        
        // Configurar búsqueda unificada
        this.setupUnifiedSearch();
        
        // Configurar tooltips y ayuda
        this.setupTooltipsAndHelp();
        
        // Cargar datos iniciales
        this.loadInitialData();
        
        console.log('✅ ConfiguracionManager inicializado correctamente');
    }

    /**
     * Inicializar gestores de subsecciones
     */
    initializeSubManagers() {
        try {
            // Inicializar gestor de usuarios para la configuración
            if (typeof UsuariosManager !== 'undefined') {
                this.usuariosManager = new UsuariosManager();
                this.usuariosManager.init();
                console.log('✅ UsuariosManager inicializado');
            } else {
                console.error('❌ UsuariosManager no disponible');
            }

            // Inicializar gestor de permisos para la configuración
            if (typeof PermisosManager !== 'undefined') {
                this.permisosManager = new PermisosManager();
                this.permisosManager.init();
                console.log('✅ PermisosManager inicializado');
            } else {
                console.error('❌ PermisosManager no disponible');
            }
        } catch (error) {
            console.error('❌ Error al inicializar gestores:', error);
        }
    }

    /**
     * Configurar navegación por tabs
     */
    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('#configTabs button[data-bs-toggle="tab"]');
        
        tabButtons.forEach(button => {
            button.addEventListener('shown.bs.tab', (event) => {
                const targetTab = event.target.getAttribute('data-bs-target');
                
                if (targetTab === '#usuarios-tab-pane') {
                    this.currentTab = 'usuarios';
                    this.onUsuariosTabShown();
                } else if (targetTab === '#permisos-tab-pane') {
                    this.currentTab = 'permisos';
                    this.onPermisosTabShown();
                }
                
                // Actualizar URL hash para mantener estado
                window.location.hash = `config-${this.currentTab}`;
            });
        });

        // Restaurar tab activo desde URL hash
        this.restoreActiveTab();
    }

    /**
     * Configurar eventos globales de la configuración
     */
    setupGlobalEvents() {
        // Botón nuevo usuario en configuración
        const btnNuevoUsuarioConfig = document.getElementById('btnNuevoUsuarioConfig');
        if (btnNuevoUsuarioConfig) {
            btnNuevoUsuarioConfig.addEventListener('click', () => {
                if (this.usuariosManager) {
                    this.usuariosManager.showUsuarioModal();
                }
            });
        }

        // Botones de filtros en configuración
        const btnFiltrarUsuariosConfig = document.getElementById('btnFiltrarUsuariosConfig');
        if (btnFiltrarUsuariosConfig) {
            btnFiltrarUsuariosConfig.addEventListener('click', () => {
                this.filtrarUsuariosConfig();
            });
        }

        const btnLimpiarFiltrosUsuariosConfig = document.getElementById('btnLimpiarFiltrosUsuariosConfig');
        if (btnLimpiarFiltrosUsuariosConfig) {
            btnLimpiarFiltrosUsuariosConfig.addEventListener('click', () => {
                this.limpiarFiltrosUsuariosConfig();
            });
        }

        // Botón exportar usuarios
        const btnExportarUsuarios = document.getElementById('btnExportarUsuarios');
        if (btnExportarUsuarios) {
            btnExportarUsuarios.addEventListener('click', () => {
                this.exportarUsuarios();
            });
        }

        // Botón mostrar todos los usuarios en permisos
        const btnMostrarTodosUsuariosConfig = document.getElementById('btnMostrarTodosUsuariosConfig');
        if (btnMostrarTodosUsuariosConfig) {
            btnMostrarTodosUsuariosConfig.addEventListener('click', () => {
                this.mostrarTodosUsuariosPermisos();
            });
        }

        // Configurar ordenamiento de columnas
        this.setupColumnSorting();
    }

    /**
     * Configurar búsqueda unificada
     */
    setupUnifiedSearch() {
        // Búsqueda en tiempo real para usuarios
        const busquedaUsuarios = document.getElementById('filtroUsuarioBusquedaConfig');
        if (busquedaUsuarios) {
            busquedaUsuarios.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.filtrarUsuariosConfig();
                }, 300);
            });
        }

        // Búsqueda rápida en permisos
        const busquedaPermisos = document.getElementById('busquedaRapidaPermisos');
        if (busquedaPermisos) {
            busquedaPermisos.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.filtrarUsuariosPermisos(e.target.value);
                }, 300);
            });
        }

        // Limpiar búsqueda rápida
        const btnLimpiarBusquedaRapida = document.getElementById('btnLimpiarBusquedaRapida');
        if (btnLimpiarBusquedaRapida) {
            btnLimpiarBusquedaRapida.addEventListener('click', () => {
                document.getElementById('busquedaRapidaPermisos').value = '';
                this.filtrarUsuariosPermisos('');
            });
        }
    }

    /**
     * Configurar tooltips y ayuda
     */
    setupTooltipsAndHelp() {
        // Inicializar todos los tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });

        // Configurar colapso de filtros
        const filtrosCollapseButtons = document.querySelectorAll('[data-bs-toggle="collapse"]');
        filtrosCollapseButtons.forEach(button => {
            button.addEventListener('click', function() {
                const icon = this.querySelector('i');
                if (icon) {
                    setTimeout(() => {
                        const isCollapsed = this.getAttribute('aria-expanded') === 'false';
                        icon.className = isCollapsed ? 'bi bi-chevron-down' : 'bi bi-chevron-up';
                    }, 150);
                }
            });
        });
    }

    /**
     * Cargar datos iniciales
     */
    async loadInitialData() {
        try {
            // Mostrar loading
            this.showLoading(true);

            // Cargar usuarios si el gestor está disponible
            if (this.usuariosManager) {
                await this.usuariosManager.loadUsuarios();
                this.updateUsuariosStats();
            }

            // Cargar datos de permisos si el gestor está disponible
            if (this.permisosManager) {
                await this.permisosManager.loadUsuariosComite();
                await this.permisosManager.loadActividad();
                this.updatePermisosStats();
            }

        } catch (error) {
            console.error('❌ Error al cargar datos iniciales:', error);
            this.showAlert('Error al cargar datos de configuración', 'danger');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Evento cuando se muestra el tab de usuarios
     */
    onUsuariosTabShown() {
        console.log('📋 Tab de usuarios activado');
        
        // Actualizar estadísticas
        this.updateUsuariosStats();
        
        // Refrescar datos si es necesario
        if (this.usuariosManager) {
            this.usuariosManager.loadUsuarios();
        }
    }

    /**
     * Evento cuando se muestra el tab de permisos
     */
    onPermisosTabShown() {
        console.log('🔐 Tab de permisos activado');
        
        // Actualizar estadísticas
        this.updatePermisosStats();
        
        // Refrescar datos si es necesario
        if (this.permisosManager) {
            this.permisosManager.loadUsuariosComite();
        }
    }

    /**
     * Restaurar tab activo desde URL hash
     */
    restoreActiveTab() {
        const hash = window.location.hash;
        if (hash === '#config-permisos') {
            const permisosTab = document.getElementById('permisos-tab');
            if (permisosTab) {
                const tab = new bootstrap.Tab(permisosTab);
                tab.show();
            }
        }
        // Por defecto se muestra el tab de usuarios
    }

    /**
     * Filtrar usuarios en la configuración
     */
    filtrarUsuariosConfig() {
        if (!this.usuariosManager) return;

        const filtros = {
            rol: document.getElementById('filtroUsuarioRolConfig')?.value || '',
            estado: document.getElementById('filtroUsuarioEstadoConfig')?.value || '',
            departamento: document.getElementById('filtroUsuarioDepartamentoConfig')?.value || '',
            busqueda: document.getElementById('filtroUsuarioBusquedaConfig')?.value.toLowerCase() || ''
        };

        // Aplicar filtros usando el gestor de usuarios
        const usuariosFiltrados = this.usuariosManager.usuarios.filter(usuario => {
            // Filtro por rol
            if (filtros.rol && usuario.rol !== filtros.rol) return false;
            
            // Filtro por estado
            if (filtros.estado !== '') {
                const estadoBoolean = filtros.estado === 'true';
                if (usuario.activo !== estadoBoolean) return false;
            }
            
            // Filtro por departamento
            if (filtros.departamento && usuario.departamento !== filtros.departamento) return false;
            
            // Filtro por búsqueda
            if (filtros.busqueda) {
                const nombreMatch = usuario.nombre.toLowerCase().includes(filtros.busqueda);
                const emailMatch = usuario.email.toLowerCase().includes(filtros.busqueda);
                if (!nombreMatch && !emailMatch) return false;
            }
            
            return true;
        });

        // Renderizar tabla filtrada
        this.renderUsuariosConfigTable(usuariosFiltrados);
        
        // Actualizar contador
        this.updateUsuariosCount(usuariosFiltrados.length);
    }

    /**
     * Limpiar filtros de usuarios en configuración
     */
    limpiarFiltrosUsuariosConfig() {
        const filtros = [
            'filtroUsuarioRolConfig',
            'filtroUsuarioEstadoConfig', 
            'filtroUsuarioDepartamentoConfig',
            'filtroUsuarioBusquedaConfig'
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

        // Mostrar todos los usuarios
        if (this.usuariosManager) {
            this.renderUsuariosConfigTable(this.usuariosManager.usuarios);
            this.updateUsuariosCount(this.usuariosManager.usuarios.length);
        }
    }

    /**
     * Renderizar tabla de usuarios en configuración
     */
    renderUsuariosConfigTable(usuarios) {
        const tableBody = document.getElementById('usuariosTableBodyConfig');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        if (usuarios.length === 0) {
            const emptyState = document.getElementById('emptyUsuariosConfig');
            if (emptyState) {
                emptyState.style.display = 'block';
            }
            return;
        }

        // Ocultar estado vacío
        const emptyState = document.getElementById('emptyUsuariosConfig');
        if (emptyState) {
            emptyState.style.display = 'none';
        }

        usuarios.forEach(usuario => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${usuario.id}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="avatar-circle me-2 bg-primary text-white" style="width: 32px; height: 32px; font-size: 0.8rem;">
                            ${this.getInitials(usuario.nombre)}
                        </div>
                        <div>
                            <div class="fw-medium">${usuario.nombre}</div>
                            <small class="text-muted">${usuario.departamento ? 'Depto ' + usuario.departamento : 'Sin departamento'}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <div>
                        ${usuario.email}
                        <div class="small text-muted">
                            <i class="bi bi-clock me-1"></i>
                            Último acceso: ${this.formatLastAccess(usuario.ultimoAcceso)}
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge bg-secondary">${usuario.departamento || 'N/A'}</span>
                </td>
                <td>
                    <span class="badge ${this.getRolBadgeClass(usuario.rol)}">${usuario.rol}</span>
                    ${usuario.rol === 'COMITE' ? this.renderPermisosResumen(usuario.permisos) : ''}
                </td>
                <td>
                    <span class="badge ${usuario.activo ? 'bg-success' : 'bg-danger'}">
                        <i class="bi ${usuario.activo ? 'bi-check-circle' : 'bi-x-circle'} me-1"></i>
                        ${usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" 
                                onclick="configuracionManager.editarUsuario(${usuario.id})"
                                data-bs-toggle="tooltip" 
                                data-bs-title="Editar usuario">
                            <i class="bi bi-pencil"></i>
                        </button>
                        ${usuario.rol === 'COMITE' ? `
                        <button class="btn btn-sm btn-outline-info" 
                                onclick="configuracionManager.editarPermisosUsuario(${usuario.id})"
                                data-bs-toggle="tooltip" 
                                data-bs-title="Configurar permisos">
                            <i class="bi bi-shield-lock"></i>
                        </button>
                        ` : ''}
                        <button class="btn btn-sm btn-outline-danger" 
                                onclick="configuracionManager.eliminarUsuario(${usuario.id})"
                                data-bs-toggle="tooltip" 
                                data-bs-title="Eliminar usuario">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        // Reinicializar tooltips
        this.setupTooltipsAndHelp();
    }

    /**
     * Configurar ordenamiento de columnas
     */
    setupColumnSorting() {
        const sortableColumns = document.querySelectorAll('.sortable-column');
        
        sortableColumns.forEach(column => {
            column.addEventListener('click', () => {
                const sortBy = column.getAttribute('data-sort');
                this.sortUsuarios(sortBy, column);
            });
        });
    }

    /**
     * Ordenar usuarios por columna
     */
    sortUsuarios(sortBy, columnElement) {
        if (!this.usuariosManager || !this.usuariosManager.usuarios) return;

        // Determinar dirección de ordenamiento
        const currentSort = columnElement.classList.contains('sort-asc') ? 'asc' : 
                           columnElement.classList.contains('sort-desc') ? 'desc' : 'none';
        
        let newSort = 'asc';
        if (currentSort === 'asc') newSort = 'desc';
        else if (currentSort === 'desc') newSort = 'asc';

        // Limpiar clases de ordenamiento de todas las columnas
        document.querySelectorAll('.sortable-column').forEach(col => {
            col.classList.remove('sort-asc', 'sort-desc');
        });

        // Aplicar nueva clase de ordenamiento
        columnElement.classList.add(`sort-${newSort}`);

        // Ordenar datos
        const usuariosOrdenados = [...this.usuariosManager.usuarios].sort((a, b) => {
            let valueA = a[sortBy];
            let valueB = b[sortBy];

            // Manejar valores nulos/undefined
            if (valueA == null) valueA = '';
            if (valueB == null) valueB = '';

            // Convertir a string para comparación
            valueA = valueA.toString().toLowerCase();
            valueB = valueB.toString().toLowerCase();

            if (newSort === 'asc') {
                return valueA.localeCompare(valueB);
            } else {
                return valueB.localeCompare(valueA);
            }
        });

        // Renderizar tabla ordenada
        this.renderUsuariosConfigTable(usuariosOrdenados);
    }

    /**
     * Actualizar estadísticas de usuarios
     */
    updateUsuariosStats() {
        if (!this.usuariosManager || !this.usuariosManager.usuarios) return;

        const totalUsuarios = this.usuariosManager.usuarios.length;
        this.updateUsuariosCount(totalUsuarios);
    }

    /**
     * Actualizar contador de usuarios
     */
    updateUsuariosCount(count) {
        const badge = document.getElementById('totalUsuariosBadge');
        if (badge) {
            badge.textContent = count;
        }
    }

    /**
     * Actualizar estadísticas de permisos
     */
    updatePermisosStats() {
        if (!this.permisosManager || !this.permisosManager.usuarios) return;

        const totalComite = this.permisosManager.usuarios.length;
        const badge = document.getElementById('totalUsuariosComite');
        if (badge) {
            badge.textContent = totalComite;
        }
    }

    /**
     * Exportar usuarios a Excel
     */
    async exportarUsuarios() {
        try {
            this.showLoading(true);
            
            // Preparar datos para exportación
            const datosExport = this.usuariosManager.usuarios.map(usuario => ({
                ID: usuario.id,
                Nombre: usuario.nombre,
                Email: usuario.email,
                Departamento: usuario.departamento || 'N/A',
                Rol: usuario.rol,
                Estado: usuario.activo ? 'Activo' : 'Inactivo',
                'Fecha Registro': usuario.fechaRegistro ? new Date(usuario.fechaRegistro).toLocaleDateString() : 'N/A',
                'Último Acceso': this.formatLastAccess(usuario.ultimoAcceso)
            }));

            // Crear y descargar archivo Excel
            this.downloadExcel(datosExport, 'usuarios_sistema');
            
            this.showAlert('Usuarios exportados exitosamente', 'success');
        } catch (error) {
            console.error('❌ Error al exportar usuarios:', error);
            this.showAlert('Error al exportar usuarios', 'danger');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Mostrar todos los usuarios en la sección de permisos
     */
    mostrarTodosUsuariosPermisos() {
        if (this.permisosManager) {
            this.permisosManager.loadUsuariosComite(true);
        }
    }

    /**
     * Filtrar usuarios en la sección de permisos
     */
    filtrarUsuariosPermisos(busqueda) {
        if (!this.permisosManager || !this.permisosManager.usuarios) return;

        const usuariosFiltrados = this.permisosManager.usuarios.filter(usuario => {
            if (!busqueda) return true;
            
            const searchTerm = busqueda.toLowerCase();
            return usuario.nombre.toLowerCase().includes(searchTerm) ||
                   usuario.email.toLowerCase().includes(searchTerm) ||
                   (usuario.departamento && usuario.departamento.toLowerCase().includes(searchTerm));
        });

        // Renderizar tabla filtrada (implementar en PermisosManager si es necesario)
        // this.permisosManager.renderUsuariosTable(usuariosFiltrados);
    }

    /**
     * Editar usuario (delegado al gestor de usuarios)
     */
    editarUsuario(id) {
        if (this.usuariosManager) {
            this.usuariosManager.editarUsuario(id);
        }
    }

    /**
     * Editar permisos de usuario
     */
    editarPermisosUsuario(id) {
        if (this.permisosManager) {
            this.permisosManager.editarPermisos(id);
        }
    }

    /**
     * Eliminar usuario (delegado al gestor de usuarios)
     */
    eliminarUsuario(id) {
        if (this.usuariosManager) {
            this.usuariosManager.eliminarUsuario(id);
        }
    }

    // ========================================
    // MÉTODOS AUXILIARES
    // ========================================

    /**
     * Obtener iniciales del nombre
     */
    getInitials(nombre) {
        return nombre.split(' ')
                    .map(word => word.charAt(0))
                    .join('')
                    .toUpperCase()
                    .substring(0, 2);
    }

    /**
     * Formatear último acceso
     */
    formatLastAccess(ultimoAcceso) {
        if (!ultimoAcceso) return 'Nunca';
        
        const fecha = new Date(ultimoAcceso);
        const ahora = new Date();
        const diffMs = ahora - fecha;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `Hace ${diffDays} días`;
        
        return fecha.toLocaleDateString();
    }

    /**
     * Obtener clase CSS para badge de rol
     */
    getRolBadgeClass(rol) {
        switch (rol) {
            case 'ADMIN': return 'bg-primary';
            case 'COMITE': return 'bg-info';
            case 'INQUILINO': return 'bg-secondary';
            default: return 'bg-secondary';
        }
    }

    /**
     * Renderizar resumen de permisos
     */
    renderPermisosResumen(permisos) {
        if (!permisos) return '';
        
        const permisosActivos = Object.values(permisos).filter(Boolean).length;
        const totalPermisos = 6; // Total de permisos disponibles
        
        return `
            <div class="mt-1">
                <span class="badge bg-success" data-bs-toggle="tooltip" 
                      data-bs-title="Permisos activos: ${permisosActivos} de ${totalPermisos}">
                    ${permisosActivos}/${totalPermisos}
                </span>
            </div>
        `;
    }

    /**
     * Descargar archivo Excel
     */
    downloadExcel(data, filename) {
        // Implementación básica de exportación a CSV (compatible con Excel)
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
        ].join('\
');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Mostrar/ocultar loading
     */
    showLoading(show) {
        const loadingElements = [
            'loadingUsuariosConfig',
            'loadingPermisosConfig',
            'loadingHistorialConfig'
        ];

        loadingElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = show ? 'block' : 'none';
            }
        });
    }

    /**
     * Mostrar alerta
     */
    showAlert(message, type = 'info') {
        const alertContainer = document.getElementById('configAlertContainer');
        if (!alertContainer) return;

        const alertId = 'alert-' + Date.now();
        const alertHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert" id="${alertId}">
                <i class="bi ${this.getAlertIcon(type)} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;

        alertContainer.insertAdjacentHTML('beforeend', alertHTML);

        // Auto-dismiss después de 5 segundos
        setTimeout(() => {
            const alert = document.getElementById(alertId);
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 5000);
    }

    /**
     * Obtener icono para alerta
     */
    getAlertIcon(type) {
        const icons = {
            success: 'bi-check-circle-fill',
            danger: 'bi-exclamation-triangle-fill',
            warning: 'bi-exclamation-triangle-fill',
            info: 'bi-info-circle-fill'
        };
        return icons[type] || icons.info;
    }
}

// ========================================
// INICIALIZACIÓN GLOBAL
// ========================================

// Variable global para el gestor de configuración
let configuracionManager = null;

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si estamos en la página de admin y la sección de configuración existe
    const configuracionSection = document.getElementById('configuracionSection');
    
    if (configuracionSection) {
        console.log('🔧 Inicializando sistema de configuración...');
        
        // Crear e inicializar gestor de configuración
        configuracionManager = new ConfiguracionManager();
        configuracionManager.init();
        
        // Exponer globalmente para uso desde HTML
        window.configuracionManager = configuracionManager;
        
        console.log('✅ Sistema de configuración inicializado correctamente');
    }
});

// Exponer clase para uso externo
window.ConfiguracionManager = ConfiguracionManager;