/**
 * Router con Lazy Loading
 * Navegación SPA con carga dinámica de módulos
 */

import ModuleLoader from './module-loader.js';
import State from './state-manager.js';

class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.currentModule = null;
    this.history = [];
    this.setupNavigationListeners();
  }

  /**
   * Registrar ruta
   */
  register(path, config) {
    this.routes.set(path, {
      moduleName: config.module,
      title: config.title || path,
      requiresAuth: config.requiresAuth !== false,
      beforeEnter: config.beforeEnter || null,
      afterEnter: config.afterEnter || null
    });
  }

  /**
   * Configurar listeners de navegación
   */
  setupNavigationListeners() {
    // Click en links
    document.addEventListener('click', async (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      e.preventDefault();
      const path = link.getAttribute('href').substring(1);
      await this.navigate(path);
    });

    // Popstate (navegación browser)
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.path) {
        this.navigate(e.state.path, false);
      }
    });

    // Click en sidebar nav items
    document.addEventListener('click', (e) => {
      const navItem = e.target.closest('.sidebar-nav li');
      if (!navItem) return;

      // Actualizar clase active
      document.querySelectorAll('.sidebar-nav li').forEach(li => {
        li.classList.remove('active');
      });
      navItem.classList.add('active');
    });
  }

  /**
   * Navegar a ruta
   */
  async navigate(path, pushState = true) {
    console.log(`🧭 Navigating to: ${path}`);

    const route = this.routes.get(path);
    
    if (!route) {
      console.error(`Route "${path}" not found`);
      this.showError(`Página no encontrada: ${path}`);
      return;
    }

    // Verificar autenticación
    if (route.requiresAuth && !this.isAuthenticated()) {
      console.warn('User not authenticated, redirecting to login');
      window.location.href = '/';
      return;
    }

    // beforeEnter hook
    if (route.beforeEnter) {
      const canEnter = await route.beforeEnter();
      if (!canEnter) {
        console.log('Navigation cancelled by beforeEnter hook');
        return;
      }
    }

    // Mostrar loader
    this.showLoader();

    try {
      // Descargar módulo anterior si es diferente
      if (this.currentModule && this.currentModule !== route.moduleName) {
        await this.unloadCurrentModule();
      }

      // Cargar nuevo módulo
      await ModuleLoader.load(route.moduleName);
      this.currentModule = route.moduleName;
      this.currentRoute = path;

      // Mostrar sección
      this.showSection(path);

      // Actualizar título
      document.title = `Edificio Admin | ${route.title}`;

      // Actualizar history
      if (pushState) {
        window.history.pushState({ path }, '', `#${path}`);
      }

      this.history.push({
        path,
        timestamp: Date.now()
      });

      // afterEnter hook
      if (route.afterEnter) {
        await route.afterEnter();
      }

      console.log(`✅ Navigation complete: ${path}`);

    } catch (error) {
      console.error('Navigation error:', error);
      this.showError(`Error al cargar: ${error.message}`);
    } finally {
      this.hideLoader();
    }
  }

  /**
   * Descargar módulo actual
   */
  async unloadCurrentModule() {
    if (this.currentModule) {
      console.log(`🗑️ Unloading module: ${this.currentModule}`);
      ModuleLoader.unload(this.currentModule);
    }
  }

  /**
   * Mostrar sección
   */
  showSection(sectionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(section => {
      section.classList.remove('active');
      section.style.display = 'none';
    });

    // Mostrar sección target
    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) {
      targetSection.classList.add('active');
      targetSection.style.display = 'block';
      
      // Actualizar título de página
      const pageTitle = document.getElementById('page-title');
      if (pageTitle) {
        const route = this.routes.get(sectionId);
        pageTitle.textContent = route ? route.title : sectionId;
      }
    } else {
      console.warn(`Section "${sectionId}-section" not found in DOM`);
    }
  }

  /**
   * Verificar autenticación
   */
  isAuthenticated() {
    return !!localStorage.getItem('edificio_token');
  }

  /**
   * Mostrar loader
   */
  showLoader() {
    document.body.classList.add('loading');
    
    // Crear loader si no existe
    if (!document.getElementById('router-loader')) {
      const loader = document.createElement('div');
      loader.id = 'router-loader';
      loader.className = 'router-loader';
      loader.innerHTML = `
        <div class="spinner"></div>
        <p>Cargando...</p>
      `;
      document.body.appendChild(loader);
    }
  }

  /**
   * Ocultar loader
   */
  hideLoader() {
    document.body.classList.remove('loading');
    const loader = document.getElementById('router-loader');
    if (loader) {
      loader.remove();
    }
  }

  /**
   * Mostrar error
   */
  showError(message) {
    // Implementar toast o notificación
    alert(message);
  }

  /**
   * Obtener ruta actual
   */
  getCurrentRoute() {
    return this.currentRoute;
  }

  /**
   * Navegar hacia atrás
   */
  back() {
    window.history.back();
  }

  /**
   * Navegar hacia adelante
   */
  forward() {
    window.history.forward();
  }

  /**
   * Precargar rutas
   */
  async preloadRoutes(paths) {
    const modules = paths
      .map(path => this.routes.get(path))
      .filter(route => route)
      .map(route => route.moduleName);

    await ModuleLoader.preload(modules);
  }
}

// Singleton
const router = new Router();

// Registrar rutas
router.register('dashboard', {
  module: 'dashboard',
  title: 'Dashboard'
});

router.register('usuarios', {
  module: 'usuarios',
  title: 'Usuarios'
});

router.register('cuotas', {
  module: 'cuotas',
  title: 'Cuotas'
});

router.register('gastos', {
  module: 'gastos',
  title: 'Gastos'
});

router.register('fondos', {
  module: 'fondos',
  title: 'Fondos'
});

router.register('anuncios', {
  module: 'anuncios',
  title: 'Anuncios'
});

router.register('cierres', {
  module: 'cierres',
  title: 'Cierres'
});

router.register('parcialidades', {
  module: 'parcialidades',
  title: 'Parcialidades 2026'
});

// Exponer en window
if (typeof window !== 'undefined') {
  window.__ROUTER__ = router;
}

export default router;
