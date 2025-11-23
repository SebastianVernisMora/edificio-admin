/**
 * API Client Centralizado
 * Maneja todas las peticiones HTTP con cache, deduplicación y retry
 */

class APIClient {
  constructor() {
    this.baseURL = '/api';
    this.cache = new Map();
    this.requestQueue = new Map();
    this.defaultOptions = {
      timeout: 10000,
      retries: 2,
      cache: true
    };
  }

  /**
   * Realizar petición HTTP
   * @param {string} endpoint - Ruta del endpoint
   * @param {Object} options - Opciones de la petición
   */
  async request(endpoint, options = {}) {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const method = options.method || 'GET';
    const cacheKey = `${method}:${endpoint}:${JSON.stringify(options.body || {})}`;
    
    // Verificar caché
    if (mergedOptions.cache && method === 'GET' && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 60000) { // 1 minuto
        console.log('📦 Cache hit:', endpoint);
        return cached.data;
      }
    }

    // Deduplicación de peticiones idénticas
    if (this.requestQueue.has(cacheKey)) {
      console.log('⏳ Request deduplication:', endpoint);
      return this.requestQueue.get(cacheKey);
    }

    // Nueva petición
    const requestPromise = this._executeRequest(endpoint, mergedOptions, cacheKey);
    this.requestQueue.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      
      // Guardar en caché (solo GET)
      if (method === 'GET' && mergedOptions.cache) {
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }

      return result;
    } finally {
      this.requestQueue.delete(cacheKey);
    }
  }

  /**
   * Ejecutar petición HTTP con retry
   */
  async _executeRequest(endpoint, options, cacheKey, attempt = 1) {
    const token = localStorage.getItem('edificio_token');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
          ...options.headers
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Si es 401, redirigir al login
        if (response.status === 401) {
          localStorage.removeItem('edificio_token');
          localStorage.removeItem('edificio_user');
          window.location.href = '/';
          throw new Error('Sesión expirada');
        }

        const error = await response.json();
        throw new Error(error.msg || `Error ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      clearTimeout(timeoutId);

      // Retry en caso de fallo de red
      if (attempt < options.retries && error.name === 'AbortError') {
        console.warn(`⚠️ Retry attempt ${attempt + 1} for ${endpoint}`);
        await this._delay(1000 * attempt); // Backoff exponencial
        return this._executeRequest(endpoint, options, cacheKey, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Prefetch de datos comunes
   */
  async prefetchCommon() {
    console.log('🚀 Prefetching common data...');
    
    try {
      await Promise.all([
        this.request('/fondos'),
        this.request('/cuotas?limit=10'),
        this.request('/anuncios?activo=true&limit=5')
      ]);
      console.log('✅ Common data prefetched');
    } catch (error) {
      console.error('❌ Prefetch error:', error);
    }
  }

  /**
   * Limpiar caché
   */
  clearCache(pattern = null) {
    if (pattern) {
      // Limpiar caché específico
      for (const [key] of this.cache) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Limpiar todo
      this.cache.clear();
    }
  }

  /**
   * Helper para delay
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============ API Methods ============

  // Auth
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
      cache: false
    });
  }

  async verifyAuth() {
    return this.request('/auth/verify', { cache: false });
  }

  // Cuotas
  async getCuotas(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/cuotas${params ? '?' + params : ''}`);
  }

  async createCuota(data) {
    const result = await this.request('/cuotas', {
      method: 'POST',
      body: data,
      cache: false
    });
    this.clearCache('cuotas');
    return result;
  }

  async updateCuota(id, data) {
    const result = await this.request(`/cuotas/${id}`, {
      method: 'PUT',
      body: data,
      cache: false
    });
    this.clearCache('cuotas');
    return result;
  }

  async verificarVencimientos() {
    const result = await this.request('/cuotas/verificar-vencimientos', {
      method: 'POST',
      cache: false
    });
    this.clearCache('cuotas');
    return result;
  }

  // Gastos
  async getGastos(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/gastos${params ? '?' + params : ''}`);
  }

  async createGasto(data) {
    const result = await this.request('/gastos', {
      method: 'POST',
      body: data,
      cache: false
    });
    this.clearCache('gastos');
    this.clearCache('fondos');
    return result;
  }

  // Fondos
  async getFondos() {
    return this.request('/fondos');
  }

  async transferirFondos(data) {
    const result = await this.request('/fondos/transferencia', {
      method: 'POST',
      body: data,
      cache: false
    });
    this.clearCache('fondos');
    return result;
  }

  // Anuncios
  async getAnuncios(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/anuncios${params ? '?' + params : ''}`);
  }

  async createAnuncio(data) {
    const result = await this.request('/anuncios', {
      method: 'POST',
      body: data,
      cache: false
    });
    this.clearCache('anuncios');
    return result;
  }

  // Parcialidades
  async getParcialidades(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/parcialidades${params ? '?' + params : ''}`);
  }

  async createParcialidad(data) {
    const result = await this.request('/parcialidades', {
      method: 'POST',
      body: data,
      cache: false
    });
    this.clearCache('parcialidades');
    return result;
  }
}

// Singleton
const apiClient = new APIClient();

export default apiClient;
