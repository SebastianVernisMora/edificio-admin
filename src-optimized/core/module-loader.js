/**
 * Module Loader Dinámico
 * Carga lazy de módulos con gestión de dependencias
 */

class ModuleLoader {
  constructor() {
    this.modules = new Map();
    this.loading = new Map();
    this.dependencies = new Map();
    this.baseUrl = '/dist/js/modules';
  }

  /**
   * Registrar módulo con sus dependencias
   */
  register(moduleName, config) {
    this.dependencies.set(moduleName, {
      path: config.path || `${this.baseUrl}/${moduleName}.js`,
      deps: config.deps || [],
      preload: config.preload || false
    });
  }

  /**
   * Cargar módulo
   */
  async load(moduleName) {
    // Ya cargado
    if (this.modules.has(moduleName)) {
      console.log(`✓ Module "${moduleName}" already loaded`);
      return this.modules.get(moduleName);
    }

    // Ya está cargando
    if (this.loading.has(moduleName)) {
      console.log(`⏳ Module "${moduleName}" is loading...`);
      return this.loading.get(moduleName);
    }

    console.log(`📦 Loading module "${moduleName}"...`);

    // Cargar dependencias primero
    const config = this.dependencies.get(moduleName);
    if (config && config.deps.length > 0) {
      console.log(`  ↳ Loading dependencies: ${config.deps.join(', ')}`);
      await Promise.all(config.deps.map(dep => this.load(dep)));
    }

    // Cargar módulo
    const loadPromise = this._loadModule(moduleName);
    this.loading.set(moduleName, loadPromise);

    try {
      const module = await loadPromise;
      
      // Inicializar si tiene método init
      if (module.init && typeof module.init === 'function') {
        console.log(`  ↳ Initializing module "${moduleName}"...`);
        await module.init();
      }

      this.modules.set(moduleName, module);
      this.loading.delete(moduleName);
      
      console.log(`✅ Module "${moduleName}" loaded`);
      return module;

    } catch (error) {
      this.loading.delete(moduleName);
      console.error(`❌ Error loading module "${moduleName}":`, error);
      throw error;
    }
  }

  /**
   * Cargar el módulo desde el servidor
   */
  async _loadModule(moduleName) {
    const config = this.dependencies.get(moduleName);
    
    if (!config) {
      throw new Error(`Module "${moduleName}" not registered`);
    }

    try {
      const module = await import(config.path);
      return module.default || module;
    } catch (error) {
      throw new Error(`Failed to load module "${moduleName}": ${error.message}`);
    }
  }

  /**
   * Precargar módulos
   */
  async preload(moduleNames) {
    console.log(`🚀 Preloading modules: ${moduleNames.join(', ')}`);
    
    const results = await Promise.allSettled(
      moduleNames.map(name => this.load(name))
    );

    const failed = results.filter(r => r.status === 'rejected');
    if (failed.length > 0) {
      console.warn(`⚠️ Some modules failed to preload:`, failed);
    }

    return results;
  }

  /**
   * Descargar módulo
   */
  unload(moduleName) {
    if (this.modules.has(moduleName)) {
      const module = this.modules.get(moduleName);
      
      // Llamar cleanup si existe
      if (module.cleanup && typeof module.cleanup === 'function') {
        console.log(`🧹 Cleaning up module "${moduleName}"...`);
        try {
          module.cleanup();
        } catch (error) {
          console.error(`Error during cleanup of "${moduleName}":`, error);
        }
      }

      this.modules.delete(moduleName);
      console.log(`✓ Module "${moduleName}" unloaded`);
    }
  }

  /**
   * Verificar si un módulo está cargado
   */
  isLoaded(moduleName) {
    return this.modules.has(moduleName);
  }

  /**
   * Obtener módulo cargado
   */
  get(moduleName) {
    return this.modules.get(moduleName);
  }

  /**
   * Listar módulos cargados
   */
  getLoadedModules() {
    return Array.from(this.modules.keys());
  }

  /**
   * Reload de un módulo
   */
  async reload(moduleName) {
    console.log(`🔄 Reloading module "${moduleName}"...`);
    this.unload(moduleName);
    return this.load(moduleName);
  }

  /**
   * Limpiar todos los módulos
   */
  clear() {
    const modules = Array.from(this.modules.keys());
    modules.forEach(name => this.unload(name));
    console.log('🧹 All modules cleared');
  }
}

// Singleton
const moduleLoader = new ModuleLoader();

// Registrar módulos disponibles
moduleLoader.register('cuotas', {
  path: '/dist/js/modules/cuotas-optimized.js',
  deps: []
});

moduleLoader.register('gastos', {
  path: '/dist/js/modules/gastos-optimized.js',
  deps: []
});

moduleLoader.register('fondos', {
  path: '/dist/js/modules/fondos-optimized.js',
  deps: []
});

moduleLoader.register('anuncios', {
  path: '/dist/js/modules/anuncios-optimized.js',
  deps: []
});

moduleLoader.register('cierres', {
  path: '/dist/js/modules/cierres-optimized.js',
  deps: ['cuotas', 'gastos']
});

// Exponer en window para debugging
if (typeof window !== 'undefined') {
  window.__MODULES__ = moduleLoader;
}

export default moduleLoader;
