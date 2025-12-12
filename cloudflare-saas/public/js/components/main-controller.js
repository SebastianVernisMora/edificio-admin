// main-controller.js - Controlador principal para la navegación y funcionalidad común

// Clase para manejar la navegación y funcionalidad común
class MainController {
    constructor() {
        this.currentSection = 'dashboard';
        this.sectionManagers = {};
    }

    // Inicializar controlador
    init() {
        this.setupNavigation();
        this.setupSidebar();
        this.setupSectionButtons();
        this.loadSectionManagers();
        this.setupPermissionBasedUI();
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

    // Configurar botones específicos de cada sección
    setupSectionButtons() {
        // Botones de Usuarios
        const btnNuevoUsuario = document.getElementById('btnNuevoUsuario');
        if (btnNuevoUsuario) {
            btnNuevoUsuario.addEventListener('click', () => {
                const manager = this.sectionManagers.usuarios;
                if (manager) {
                    manager.showUsuarioModal();
                } else {
                    console.warn('⚠️ Manager usuarios no disponible');
                }
            });
        }

        // Botones de Cuotas
        const btnGenerarCuotas = document.getElementById('btnGenerarCuotas');
        if (btnGenerarCuotas) {
            btnGenerarCuotas.addEventListener('click', () => {
                const manager = this.sectionManagers.cuotas;
                if (manager) {
                    manager.showCuotaModal();
                } else {
                    console.warn('⚠️ Manager cuotas no disponible');
                }
            });
        }

        // Botones de Gastos
        const btnNuevoGasto = document.getElementById('btnNuevoGasto');
        if (btnNuevoGasto) {
            btnNuevoGasto.addEventListener('click', () => {
                const manager = this.sectionManagers.gastos;
                if (manager) {
                    manager.showGastoModal();
                } else {
                    console.warn('⚠️ Manager gastos no disponible');
                }
            });
        }
        
        // Botones de Presupuestos
        const btnNuevoPresupuesto = document.getElementById('btnNuevoPresupuesto');
        if (btnNuevoPresupuesto) {
            btnNuevoPresupuesto.addEventListener('click', () => {
                const manager = this.sectionManagers.presupuestos;
                if (manager) {
                    manager.showPresupuestoModal();
                } else {
                    console.warn('⚠️ Manager presupuestos no disponible');
                }
            });
        }
    }

    // Cargar gestores de cada sección
    loadSectionManagers() {
        // Verificar si los gestores están disponibles
        if (typeof UsuariosManager !== 'undefined') {
            this.sectionManagers.usuarios = new UsuariosManager();
            this.sectionManagers.usuarios.init();
        } else {
            console.warn('⚠️ Manager usuarios no disponible');
        }

        if (typeof CuotasManager !== 'undefined') {
            this.sectionManagers.cuotas = new CuotasManager();
            this.sectionManagers.cuotas.init();
        }

        if (typeof GastosManager !== 'undefined') {
            this.sectionManagers.gastos = new GastosManager();
            this.sectionManagers.gastos.init();
        }
        
        if (typeof PresupuestosManager !== 'undefined') {
            this.sectionManagers.presupuestos = new PresupuestosManager();
            this.sectionManagers.presupuestos.init();
        } else {
            console.warn('⚠️ Manager presupuestos no disponible');
        }

        // Anuncios and Cierres managers will be initialized on-demand
        console.log('📋 Anuncios y Cierres managers se inicializarán bajo demanda');

        // Cargar gestor de configuración
        if (typeof ConfiguracionManager !== 'undefined') {
            this.sectionManagers.configuracion = new ConfiguracionManager();
            this.sectionManagers.configuracion.init();
            console.log('✅ Manager configuración inicializado');
        } else {
            console.warn('⚠️ Manager configuración no disponible');
        }
    }

    // Cambiar de sección
    changeSection(section) {
        // Verificar permisos para la sección
        if (!this.checkSectionPermission(section)) {
            this.showAccessDeniedMessage(section);
            return;
        }
        
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
    
    // Verificar permisos para acceder a una sección
    checkSectionPermission(section) {
        // Secciones que siempre son accesibles
        const alwaysAccessible = ['dashboard', 'perfil'];
        if (alwaysAccessible.includes(section)) {
            return true;
        }
        
        // Verificar si el usuario es administrador
        if (isAdmin()) {
            return true;
        }
        
        // Verificar permisos específicos para miembros del comité
        if (isComite()) {
            const sectionPermissions = {
                'anuncios': 'anuncios',
                'gastos': 'gastos',
                'presupuestos': 'presupuestos',
                'cuotas': 'cuotas',
                'usuarios': 'usuarios',
                'cierres': 'cierres',
                'solicitudes': 'anuncios', // Solicitudes requiere permiso de anuncios (comunicación)
                'configuracion': 'usuarios', // Configuración requiere permiso de usuarios
                'audit': 'usuarios' // Auditoría requiere permiso de usuarios (solo admin)
            };
            
            const requiredPermission = sectionPermissions[section];
            return requiredPermission ? hasPermission(requiredPermission) : false;
        }
        
        // Inquilinos no tienen acceso a secciones administrativas
        return false;
    }

    // Configurar interfaz basada en permisos
    setupPermissionBasedUI() {
        const user = getUser();
        if (!user) return;

        // Ocultar/mostrar elementos del menú según permisos
        this.hideUnauthorizedMenuItems();
        
        // Ocultar/mostrar botones según permisos
        this.hideUnauthorizedButtons();
        
        // Configurar elementos específicos por rol
        this.setupRoleSpecificElements();
        
        // Mostrar información de permisos en el perfil
        this.displayUserPermissions();
    }

    // Ocultar elementos del menú no autorizados
    hideUnauthorizedMenuItems() {
        const menuItems = [
            { section: 'usuarios', element: 'nav-usuarios' },
            { section: 'cuotas', element: 'nav-cuotas' },
            { section: 'gastos', element: 'nav-gastos' },
            { section: 'presupuestos', element: 'nav-presupuestos' },
            { section: 'cierres', element: 'nav-cierres' },
            { section: 'anuncios', element: 'nav-anuncios' },
            { section: 'configuracion', element: 'nav-configuracion' }
        ];

        menuItems.forEach(item => {
            const element = document.getElementById(item.element);
            if (element) {
                if (this.checkSectionPermission(item.section)) {
                    element.style.display = 'block';
                } else {
                    element.style.display = 'none';
                }
            }
        });
    }

    // Ocultar botones no autorizados
    hideUnauthorizedButtons() {
        const buttons = [
            { permission: 'usuarios', elements: ['btnNuevoUsuario'] },
            { permission: 'cuotas', elements: ['btnGenerarCuotas'] },
            { permission: 'gastos', elements: ['btnNuevoGasto'] },
            { permission: 'presupuestos', elements: ['btnNuevoPresupuesto'] }
        ];

        buttons.forEach(buttonGroup => {
            const hasAccess = isAdmin() || (isComite() && hasPermission(buttonGroup.permission));
            
            buttonGroup.elements.forEach(elementId => {
                const element = document.getElementById(elementId);
                if (element) {
                    if (hasAccess) {
                        element.style.display = 'inline-block';
                    } else {
                        element.style.display = 'none';
                    }
                }
            });
        });
    }

    // Configurar elementos específicos por rol
    setupRoleSpecificElements() {
        const user = getUser();
        
        // Elementos solo para administradores
        const adminOnlyElements = document.querySelectorAll('[data-admin-only]');
        adminOnlyElements.forEach(element => {
            if (isAdmin()) {
                element.style.display = element.dataset.originalDisplay || 'block';
            } else {
                element.dataset.originalDisplay = element.style.display;
                element.style.display = 'none';
            }
        });

        // Elementos para comité y admin
        const comiteElements = document.querySelectorAll('[data-comite-access]');
        comiteElements.forEach(element => {
            const requiredPermission = element.dataset.comiteAccess;
            if (isAdmin() || (isComite() && hasPermission(requiredPermission))) {
                element.style.display = element.dataset.originalDisplay || 'block';
            } else {
                element.dataset.originalDisplay = element.style.display;
                element.style.display = 'none';
            }
        });
    }

    // Mostrar permisos del usuario en el perfil
    displayUserPermissions() {
        const user = getUser();
        const permissionsContainer = document.getElementById('userPermissions');
        
        if (permissionsContainer && user) {
            let permissionsHTML = '<h6>Permisos del Usuario:</h6>';
            
            if (user.role === 'ADMIN') {
                permissionsHTML += '<span class="badge badge-success">Administrador - Acceso Total</span>';
            } else if (user.role === 'COMITE' && user.permisos) {
                const permissions = Object.entries(user.permisos)
                    .filter(([key, value]) => value)
                    .map(([key]) => key);
                
                if (permissions.length > 0) {
                    permissionsHTML += permissions.map(perm => 
                        `<span class="badge badge-info mr-1">${this.getPermissionDisplayName(perm)}</span>`
                    ).join('');
                } else {
                    permissionsHTML += '<span class="badge badge-warning">Sin permisos específicos</span>';
                }
            } else {
                permissionsHTML += '<span class="badge badge-secondary">Inquilino - Acceso Básico</span>';
            }
            
            permissionsContainer.innerHTML = permissionsHTML;
        }
    }

    // Obtener nombre de visualización para permisos
    getPermissionDisplayName(permission) {
        const displayNames = {
            'usuarios': 'Gestión de Usuarios',
            'cuotas': 'Gestión de Cuotas',
            'gastos': 'Gestión de Gastos',
            'presupuestos': 'Gestión de Presupuestos',
            'cierres': 'Gestión de Cierres',
            'anuncios': 'Gestión de Anuncios'
        };
        
        return displayNames[permission] || permission;
    }

    // Refrescar interfaz cuando cambien los permisos
    refreshPermissionBasedUI() {
        this.setupPermissionBasedUI();
        
        // Verificar si la sección actual sigue siendo accesible
        if (!this.checkSectionPermission(this.currentSection)) {
            this.changeSection('dashboard');
        }
    }

    // Verificar permisos de forma asíncrona (útil para validaciones en tiempo real)
    async validateCurrentPermissions() {
        try {
            const response = await fetchAuth(`${API_URL}/auth/perfil`);
            const userData = response.data;
            
            // Actualizar datos del usuario en localStorage
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Refrescar interfaz
            this.refreshPermissionBasedUI();
            
            return true;
        } catch (error) {
            console.error('Error validando permisos:', error);
            return false;
        }
    }

    // Mostrar mensaje de acceso denegado personalizado
    showAccessDeniedMessage(section, requiredPermission) {
        const messages = {
            'usuarios': 'Necesita permisos de gestión de usuarios para acceder a esta sección.',
            'cuotas': 'Necesita permisos de gestión de cuotas para acceder a esta sección.',
            'gastos': 'Necesita permisos de gestión de gastos para acceder a esta sección.',
            'presupuestos': 'Necesita permisos de gestión de presupuestos para acceder a esta sección.',
            'cierres': 'Necesita permisos de gestión de cierres para acceder a esta sección.',
            'anuncios': 'Necesita permisos de gestión de anuncios para acceder a esta sección.',
            'configuracion': 'Solo administradores pueden acceder a la configuración del sistema.'
        };
        
        const message = messages[section] || 'No tiene permisos suficientes para acceder a esta sección.';
        showAlert('alertContainer', message, 'warning');
    }

    // Obtener título de la sección
    getSectionTitle(section) {
        const titles = {
            dashboard: 'Dashboard',
            usuarios: 'Gestión de Usuarios',
            cuotas: 'Gestión de Cuotas',
            gastos: 'Gestión de Gastos',
            presupuestos: 'Gestión de Presupuestos',
            cierres: 'Gestión de Cierres',
            anuncios: 'Gestión de Anuncios',
            solicitudes: 'Gestión de Solicitudes',
            configuracion: 'Configuración del Sistema',
            perfil: 'Mi Perfil'
        };
        
        return titles[section] || 'Dashboard';
    }

    // Cargar datos específicos de la sección
    loadSectionData(section) {
        // Implementar carga de datos específicos según la sección
        switch (section) {
            case 'usuarios':
                if (this.sectionManagers.usuarios) {
                    this.sectionManagers.usuarios.loadUsuarios();
                }
                break;
            case 'cuotas':
                if (this.sectionManagers.cuotas) {
                    this.sectionManagers.cuotas.loadCuotas();
                }
                break;
            case 'gastos':
                if (this.sectionManagers.gastos) {
                    this.sectionManagers.gastos.loadGastos();
                }
                break;
            case 'presupuestos':
                if (this.sectionManagers.presupuestos) {
                    this.sectionManagers.presupuestos.loadPresupuestos();
                }
                break;
            case 'anuncios':
                if (!this.sectionManagers.anuncios && typeof AnunciosManager !== 'undefined') {
                    this.sectionManagers.anuncios = new AnunciosManager();
                    console.log('✅ Manager anuncios inicializado bajo demanda');
                }
                if (this.sectionManagers.anuncios) {
                    this.sectionManagers.anuncios.loadAnuncios();
                }
                break;
            case 'solicitudes':
                if (typeof initSolicitudesSection !== 'undefined') {
                    initSolicitudesSection();
                    console.log('✅ Sección solicitudes inicializada');
                }
                break;
            case 'cierres':
                if (!this.sectionManagers.cierres && typeof CierresManager !== 'undefined') {
                    this.sectionManagers.cierres = new CierresManager();
                    console.log('✅ Manager cierres inicializado bajo demanda');
                }
                if (this.sectionManagers.cierres) {
                    this.sectionManagers.cierres.loadCierres();
                }
                break;
            case 'configuracion':
                if (this.sectionManagers.configuracion) {
                    this.sectionManagers.configuracion.loadInitialData();
                }
                break;
            case 'perfil':
                this.loadPerfilData();
                break;
        }
    }

    // Cargar datos del perfil
    loadPerfilData() {
        const user = getUser();
        
        if (user) {
            document.getElementById('perfilNombre').value = user.nombre;
            document.getElementById('perfilEmail').value = user.email;
            
            // Mostrar rol correcto
            let rolText = 'Inquilino';
            if (user.role === 'ADMIN') {
                rolText = 'Administrador';
            } else if (user.role === 'COMITE') {
                rolText = 'Comité';
            }
            document.getElementById('perfilRol').value = rolText;
            
            if (user.departamento && document.getElementById('perfilDepartamento')) {
                document.getElementById('perfilDepartamento').value = user.departamento;
            }
        }
        
        // Configurar formulario de cambio de contraseña
        const cambiarPasswordForm = document.getElementById('cambiarPasswordForm');
        if (cambiarPasswordForm) {
            cambiarPasswordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const passwordActual = document.getElementById('passwordActual').value;
                const passwordNueva = document.getElementById('passwordNueva').value;
                const passwordConfirmar = document.getElementById('passwordConfirmar').value;
                
                if (passwordNueva !== passwordConfirmar) {
                    showAlert('alertContainer', 'Las contraseñas no coinciden', 'danger');
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
                    
                    showAlert('alertContainer', 'Contraseña actualizada exitosamente', 'success');
                    cambiarPasswordForm.reset();
                } catch (error) {
                    showAlert('alertContainer', error.message || 'Error al cambiar contraseña', 'danger');
                }
            });
        }
    }
}

// Inicializar controlador cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    const controller = new MainController();
    controller.init();
});