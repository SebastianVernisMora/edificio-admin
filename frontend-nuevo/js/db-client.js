// Database Client - Centralized data management
const DBClient = (() => {
  
  // API Configuration
  const API_BASE_URL = '/api';
  
  // Cache management
  const cache = new Map();
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  // Request queue for batch operations
  const requestQueue = [];
  let isProcessingQueue = false;

  // Generic API request with caching
  const request = async (endpoint, method = 'GET', body = null, options = {}) => {
    try {
      const { useCache = true, invalidateCache = false } = options;
      const cacheKey = `${method}:${endpoint}:${JSON.stringify(body)}`;
      
      // Invalidate cache if requested
      if (invalidateCache) {
        cache.delete(cacheKey);
      }
      
      // Check cache for GET requests
      if (method === 'GET' && useCache && cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
          return cached.data;
        }
        cache.delete(cacheKey);
      }

      const token = Auth.getToken();
      
      const requestOptions = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-token': token
        }
      };
      
      if (body && method !== 'GET') {
        requestOptions.body = JSON.stringify(body);
      }
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || data.message || 'Error en la solicitud');
      }
      
      // Cache GET responses
      if (method === 'GET' && useCache) {
        cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
      }
      
      return data;
      
    } catch (error) {
      console.error(`Error en ${method} ${endpoint}:`, error);
      throw error;
    }
  };

  // Batch request processing
  const batchRequest = async (requests) => {
    try {
      const promises = requests.map(req => 
        request(req.endpoint, req.method, req.body, req.options)
      );
      return await Promise.all(promises);
    } catch (error) {
      console.error('Error in batch request:', error);
      throw error;
    }
  };

  // Authentication methods
  const auth = {
    login: async (email, password) => {
      return await request('/auth/login', 'POST', { email, password }, { useCache: false });
    },
    
    register: async (userData) => {
      return await request('/auth/register', 'POST', userData, { useCache: false });
    },
    
    validateToken: async () => {
      return await request('/auth/validate', 'GET', null, { useCache: false });
    }
  };

  // Users methods
  const users = {
    getAll: async () => {
      return await request('/usuarios');
    },
    
    getById: async (id) => {
      return await request(`/usuarios/${id}`);
    },
    
    create: async (userData) => {
      const result = await request('/usuarios', 'POST', userData, { useCache: false });
      invalidateCache('usuarios');
      return result;
    },
    
    update: async (id, userData) => {
      const result = await request(`/usuarios/${id}`, 'PUT', userData, { useCache: false });
      invalidateCache('usuarios');
      return result;
    },
    
    delete: async (id) => {
      const result = await request(`/usuarios/${id}`, 'DELETE', null, { useCache: false });
      invalidateCache('usuarios');
      return result;
    },
    
    updateEditorRole: async (id, roleData) => {
      const result = await request(`/usuarios/${id}/editor-role`, 'PUT', roleData, { useCache: false });
      invalidateCache('usuarios');
      return result;
    }
  };

  // Cuotas methods
  const cuotas = {
    getAll: async (filters = {}) => {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/cuotas?${queryParams}` : '/cuotas';
      return await request(endpoint);
    },
    
    getByDepartment: async (departamento, year) => {
      return await request(`/cuotas/departamento/${departamento}/${year}`);
    },
    
    create: async (cuotaData) => {
      const result = await request('/cuotas', 'POST', cuotaData, { useCache: false });
      invalidateCache('cuotas');
      return result;
    },
    
    update: async (id, cuotaData) => {
      const result = await request(`/cuotas/${id}`, 'PUT', cuotaData, { useCache: false });
      invalidateCache('cuotas');
      return result;
    },
    
    markAsPaid: async (id, paymentData) => {
      const result = await request(`/cuotas/${id}/pagar`, 'PUT', paymentData, { useCache: false });
      invalidateCache('cuotas');
      return result;
    },
    
    batchMarkAsPaid: async (ids, paymentData) => {
      const result = await request('/cuotas/pagar-multiple', 'PUT', { ids, ...paymentData }, { useCache: false });
      invalidateCache('cuotas');
      return result;
    },
    
    generateMonthly: async (year, month) => {
      const result = await request('/cuotas/generar-mes', 'POST', { year, month }, { useCache: false });
      invalidateCache('cuotas');
      return result;
    },
    
    generateYearly: async (year) => {
      const result = await request('/cuotas/generar-año', 'POST', { year }, { useCache: false });
      invalidateCache('cuotas');
      return result;
    }
  };

  // Gastos methods
  const gastos = {
    getAll: async (filters = {}) => {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/gastos?${queryParams}` : '/gastos';
      return await request(endpoint);
    },
    
    create: async (gastoData) => {
      const result = await request('/gastos', 'POST', gastoData, { useCache: false });
      invalidateCache('gastos');
      return result;
    },
    
    update: async (id, gastoData) => {
      const result = await request(`/gastos/${id}`, 'PUT', gastoData, { useCache: false });
      invalidateCache('gastos');
      return result;
    },
    
    delete: async (id) => {
      const result = await request(`/gastos/${id}`, 'DELETE', null, { useCache: false });
      invalidateCache('gastos');
      return result;
    },
    
    getByCategory: async (categoria) => {
      return await request(`/gastos/categoria/${categoria}`);
    },
    
    getByDateRange: async (fechaInicio, fechaFin) => {
      return await request(`/gastos/rango/${fechaInicio}/${fechaFin}`);
    }
  };

  // Fondos methods
  const fondos = {
    getAll: async () => {
      return await request('/fondos');
    },
    
    getMovimientos: async (filters = {}) => {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/fondos/movimientos?${queryParams}` : '/fondos/movimientos';
      return await request(endpoint);
    },
    
    createMovimiento: async (movimientoData) => {
      const result = await request('/fondos/movimiento', 'POST', movimientoData, { useCache: false });
      invalidateCache('fondos');
      return result;
    },
    
    transfer: async (transferData) => {
      const result = await request('/fondos/transferencia', 'POST', transferData, { useCache: false });
      invalidateCache('fondos');
      return result;
    },
    
    getBalance: async () => {
      return await request('/fondos/balance');
    }
  };

  // Anuncios methods
  const anuncios = {
    getAll: async (filters = {}) => {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/anuncios?${queryParams}` : '/anuncios';
      return await request(endpoint);
    },
    
    getActive: async () => {
      return await request('/anuncios/activos');
    },
    
    create: async (anuncioData) => {
      const result = await request('/anuncios', 'POST', anuncioData, { useCache: false });
      invalidateCache('anuncios');
      return result;
    },
    
    update: async (id, anuncioData) => {
      const result = await request(`/anuncios/${id}`, 'PUT', anuncioData, { useCache: false });
      invalidateCache('anuncios');
      return result;
    },
    
    delete: async (id) => {
      const result = await request(`/anuncios/${id}`, 'DELETE', null, { useCache: false });
      invalidateCache('anuncios');
      return result;
    },
    
    toggleStatus: async (id) => {
      const result = await request(`/anuncios/${id}/toggle`, 'PUT', null, { useCache: false });
      invalidateCache('anuncios');
      return result;
    }
  };

  // Cierres methods
  const cierres = {
    getAll: async (filters = {}) => {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/cierres?${queryParams}` : '/cierres';
      return await request(endpoint);
    },
    
    createMensual: async (year, month) => {
      const result = await request('/cierres/mensual', 'POST', { year, month }, { useCache: false });
      invalidateCache('cierres');
      return result;
    },
    
    createAnual: async (year) => {
      const result = await request('/cierres/anual', 'POST', { year }, { useCache: false });
      invalidateCache('cierres');
      return result;
    },
    
    getById: async (id) => {
      return await request(`/cierres/${id}`);
    },
    
    getReport: async (id) => {
      return await request(`/cierres/${id}/reporte`);
    }
  };

  // Parcialidades methods
  const parcialidades = {
    getAll: async (filters = {}) => {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/parcialidades?${queryParams}` : '/parcialidades';
      return await request(endpoint);
    },
    
    create: async (parcialidadData) => {
      const result = await request('/parcialidades', 'POST', parcialidadData, { useCache: false });
      invalidateCache('parcialidades');
      invalidateCache('cuotas');
      return result;
    },
    
    update: async (id, parcialidadData) => {
      const result = await request(`/parcialidades/${id}`, 'PUT', parcialidadData, { useCache: false });
      invalidateCache('parcialidades');
      invalidateCache('cuotas');
      return result;
    },
    
    delete: async (id) => {
      const result = await request(`/parcialidades/${id}`, 'DELETE', null, { useCache: false });
      invalidateCache('parcialidades');
      invalidateCache('cuotas');
      return result;
    },
    
    getByCuota: async (cuotaId) => {
      return await request(`/parcialidades/cuota/${cuotaId}`);
    },
    
    getByDepartment: async (departamento, year) => {
      return await request(`/parcialidades/departamento/${departamento}/${year}`);
    },
    
    getSummary: async () => {
      return await request('/parcialidades/resumen');
    }
  };

  // Dashboard methods
  const dashboard = {
    getData: async () => {
      return await request('/dashboard');
    },
    
    getStats: async (period = 'month') => {
      return await request(`/dashboard/stats?period=${period}`);
    },
    
    getChartData: async (type) => {
      return await request(`/dashboard/charts/${type}`);
    }
  };

  // Cache management
  const invalidateCache = (pattern) => {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  };

  const clearCache = () => {
    cache.clear();
  };

  // Connection health check
  const healthCheck = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  // Initialize client
  const init = () => {
    // Set up periodic cache cleanup
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          cache.delete(key);
        }
      }
    }, CACHE_DURATION);

    console.log('DBClient initialized');
  };

  // Public API
  return {
    // Core methods
    init,
    request,
    batchRequest,
    
    // Entity methods
    auth,
    users,
    cuotas,
    gastos,
    fondos,
    anuncios,
    cierres,
    parcialidades,
    dashboard,
    
    // Utility methods
    invalidateCache,
    clearCache,
    healthCheck,
    
    // Cache stats (for debugging)
    getCacheSize: () => cache.size,
    getCacheKeys: () => Array.from(cache.keys())
  };
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', DBClient.init);