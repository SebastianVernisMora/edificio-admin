// Gestión de Parcialidades 2026 - Admin Panel
class ParcialidadesManager {
  constructor() {
    this.parcialidades = [];
    this.progreso = null;
    this.init();
  }

  async init() {
    await this.loadData();
    this.setupEventListeners();
    this.renderParcialidades();
    this.renderProgreso();
  }

  async loadData() {
    try {
      const token = localStorage.getItem('token');
      
      // Cargar parcialidades
      const parcialidadesRes = await fetch('/api/parcialidades', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (parcialidadesRes.ok) {
        const data = await parcialidadesRes.json();
        this.parcialidades = data.parcialidades || [];
      }

      // Cargar progreso
      const progresoRes = await fetch('/api/parcialidades/progreso', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (progresoRes.ok) {
        this.progreso = await progresoRes.json();
      }
    } catch (error) {
      console.error('Error loading parcialidades data:', error);
    }
  }

  setupEventListeners() {
    // Botón inicializar parcialidades
    document.getElementById('inicializar-parcialidades-btn')?.addEventListener('click', () => {
      this.inicializarParcialidades();
    });

    // Botón nueva parcialidad
    document.getElementById('nueva-parcialidad-btn')?.addEventListener('click', () => {
      this.showParcialidadModal();
    });

    // Form de parcialidad
    document.getElementById('parcialidad-form')?.addEventListener('submit', (e) => {
      this.handleParcialidadSubmit(e);
    });

    // Cerrar modal
    document.querySelector('#parcialidad-modal .close')?.addEventListener('click', () => {
      document.getElementById('parcialidad-modal').style.display = 'none';
    });

    // Filtros
    document.getElementById('filtro-usuario-parcialidad')?.addEventListener('change', () => {
      this.renderParcialidades();
    });

    document.getElementById('filtro-estado-parcialidad')?.addEventListener('change', () => {
      this.renderParcialidades();
    });

    // Botones de acciones
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('validar-parcialidad-btn')) {
        const parcialidadId = parseInt(e.target.dataset.parcialidadId);
        this.validarParcialidad(parcialidadId);
      }
      
      if (e.target.classList.contains('rechazar-parcialidad-btn')) {
        const parcialidadId = parseInt(e.target.dataset.parcialidadId);
        this.rechazarParcialidad(parcialidadId);
      }

      if (e.target.classList.contains('edit-parcialidad-btn')) {
        const parcialidadId = parseInt(e.target.dataset.parcialidadId);
        this.editParcialidad(parcialidadId);
      }
    });
  }

  async inicializarParcialidades() {
    if (!confirm('¿Inicializar el sistema de parcialidades 2026? Esto creará las estructuras necesarias para todos los usuarios.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/parcialidades/inicializar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ Sistema inicializado correctamente

Usuarios procesados: ${result.usuarios_procesados}`);
        await this.loadData();
        this.renderParcialidades();
        this.renderProgreso();
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.mensaje}`);
      }
    } catch (error) {
      console.error('Error inicializando parcialidades:', error);
      alert('❌ Error al inicializar sistema');
    }
  }

  showParcialidadModal(parcialidad = null) {
    const modal = document.getElementById('parcialidad-modal');
    const title = document.getElementById('parcialidad-modal-title');
    const form = document.getElementById('parcialidad-form');
    
    if (parcialidad) {
      title.textContent = 'Editar Parcialidad';
      document.getElementById('parcialidad-id').value = parcialidad.id;
      document.getElementById('parcialidad-usuario-id').value = parcialidad.usuario_id;
      document.getElementById('parcialidad-monto').value = parcialidad.monto;
      document.getElementById('parcialidad-fecha').value = parcialidad.fecha_pago.split('T')[0];
      document.getElementById('parcialidad-observaciones').value = parcialidad.observaciones || '';
    } else {
      title.textContent = 'Nueva Parcialidad';
      form.reset();
      document.getElementById('parcialidad-id').value = '';
      document.getElementById('parcialidad-fecha').value = new Date().toISOString().split('T')[0];
    }

    modal.style.display = 'block';
  }

  async handleParcialidadSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const parcialidadId = formData.get('parcialidad-id');
    
    const parcialidadData = {
      usuario_id: parseInt(formData.get('usuario_id')),
      monto: parseFloat(formData.get('monto')),
      fecha_pago: formData.get('fecha'),
      observaciones: formData.get('observaciones') || ''
    };

    try {
      const token = localStorage.getItem('token');
      const url = parcialidadId ? `/api/parcialidades/${parcialidadId}` : '/api/parcialidades';
      const method = parcialidadId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(parcialidadData)
      });

      if (response.ok) {
        alert(`✅ Parcialidad ${parcialidadId ? 'actualizada' : 'registrada'} correctamente`);
        document.getElementById('parcialidad-modal').style.display = 'none';
        await this.loadData();
        this.renderParcialidades();
        this.renderProgreso();
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.mensaje}`);
      }
    } catch (error) {
      console.error('Error saving parcialidad:', error);
      alert('❌ Error al guardar parcialidad');
    }
  }

  async validarParcialidad(parcialidadId) {
    if (!confirm('¿Validar esta parcialidad?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/parcialidades/${parcialidadId}/validar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('✅ Parcialidad validada correctamente');
        await this.loadData();
        this.renderParcialidades();
        this.renderProgreso();
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.mensaje}`);
      }
    } catch (error) {
      console.error('Error validating parcialidad:', error);
      alert('❌ Error al validar parcialidad');
    }
  }

  async rechazarParcialidad(parcialidadId) {
    const motivo = prompt('Ingrese el motivo del rechazo:');
    if (!motivo) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/parcialidades/${parcialidadId}/rechazar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ motivo })
      });

      if (response.ok) {
        alert('✅ Parcialidad rechazada');
        await this.loadData();
        this.renderParcialidades();
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.mensaje}`);
      }
    } catch (error) {
      console.error('Error rechazando parcialidad:', error);
      alert('❌ Error al rechazar parcialidad');
    }
  }

  editParcialidad(parcialidadId) {
    const parcialidad = this.parcialidades.find(p => p.id === parcialidadId);
    if (parcialidad) {
      this.showParcialidadModal(parcialidad);
    }
  }

  renderProgreso() {
    if (!this.progreso) return;

    // Actualizar tarjetas de progreso
    const elemTotalObjetivo = document.getElementById('total-objetivo'); 
    if (elemTotalObjetivo) elemTotalObjetivo.textContent = `$${this.progreso.objetivo_total.toLocaleString()}`;
    
    const elemMontoRecaudado = document.getElementById('monto-recaudado'); 
    if (elemMontoRecaudado) elemMontoRecaudado.textContent = `$${this.progreso.monto_recaudado.toLocaleString()}`;
    
    const elemPorcentajeProgreso = document.getElementById('porcentaje-progreso'); 
    if (elemPorcentajeProgreso) elemPorcentajeProgreso.textContent = `${this.progreso.porcentaje}%`;
    
    const elemFaltanteObjetivo = document.getElementById('faltante-objetivo'); 
    if (elemFaltanteObjetivo) elemFaltanteObjetivo.textContent = `$${this.progreso.faltante.toLocaleString()}`;

    // Actualizar barra de progreso
    const progressBar = document.getElementById('progress-bar-parcialidades');
    if (progressBar) {
      progressBar.style.width = `${this.progreso.porcentaje}%`;
      progressBar.setAttribute('aria-valuenow', this.progreso.porcentaje);
    }

    // Actualizar gráfico de progreso por usuario
    this.updateProgresoChart();
  }

  updateProgresoChart() {
    const canvas = document.getElementById('progreso-usuarios-chart');
    if (!canvas || !this.progreso.progreso_por_usuario) return;

    const ctx = canvas.getContext('2d');
    
    if (window.progresoUsuariosChart) {
      window.progresoUsuariosChart.destroy();
    }

    const usuarios = Object.keys(this.progreso.progreso_por_usuario);
    const porcentajes = Object.values(this.progreso.progreso_por_usuario).map(p => p.porcentaje);

    window.progresoUsuariosChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: usuarios,
        datasets: [{
          label: 'Progreso (%)',
          data: porcentajes,
          backgroundColor: porcentajes.map(p => 
            p >= 100 ? '#28a745' : 
            p >= 75 ? '#ffc107' : 
            p >= 50 ? '#fd7e14' : '#dc3545'
          ),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.parsed.y}% completado`;
              }
            }
          }
        }
      }
    });
  }

  renderParcialidades() {
    const tbody = document.querySelector('#parcialidades-table tbody');
    if (!tbody) return;

    const filtroUsuario = document.getElementById('filtro-usuario-parcialidad')?.value || 'todos';
    const filtroEstado = document.getElementById('filtro-estado-parcialidad')?.value || 'todos';

    let parcialidadesFiltradas = this.parcialidades;

    // Aplicar filtros
    if (filtroUsuario !== 'todos') {
      parcialidadesFiltradas = parcialidadesFiltradas.filter(p => p.usuario_id === parseInt(filtroUsuario));
    }

    if (filtroEstado !== 'todos') {
      parcialidadesFiltradas = parcialidadesFiltradas.filter(p => p.estado === filtroEstado);
    }

    // Ordenar por fecha descendente
    parcialidadesFiltradas.sort((a, b) => new Date(b.fecha_pago) - new Date(a.fecha_pago));

    tbody.innerHTML = parcialidadesFiltradas.map(parcialidad => {
      const estadoClass = 
        parcialidad.estado === 'validada' ? 'success' :
        parcialidad.estado === 'rechazada' ? 'danger' : 'warning';
      
      return `
        <tr>
          <td>${parcialidad.id}</td>
          <td>Usuario ${parcialidad.usuario_id}</td>
          <td>$${parcialidad.monto.toLocaleString()}</td>
          <td>${new Date(parcialidad.fecha_pago).toLocaleDateString()}</td>
          <td>
            <span class="badge badge-${estadoClass}">
              ${parcialidad.estado.toUpperCase()}
            </span>
          </td>
          <td>${parcialidad.observaciones || '-'}</td>
          <td>${parcialidad.fecha_validacion ? new Date(parcialidad.fecha_validacion).toLocaleDateString() : '-'}</td>
          <td>
            ${parcialidad.estado === 'pendiente' ? `
              <button class="btn btn-sm btn-success validar-parcialidad-btn" data-parcialidad-id="${parcialidad.id}">
                Validar
              </button>
              <button class="btn btn-sm btn-danger rechazar-parcialidad-btn" data-parcialidad-id="${parcialidad.id}">
                Rechazar
              </button>
              <button class="btn btn-sm btn-primary edit-parcialidad-btn" data-parcialidad-id="${parcialidad.id}">
                Editar
              </button>
            ` : '-'}
          </td>
        </tr>
      `;
    }).join('');

    // Actualizar estadísticas
    this.updateEstadisticas(parcialidadesFiltradas);
  }

  updateEstadisticas(parcialidades) {
    const totalParcialidades = parcialidades.length;
    const validadas = parcialidades.filter(p => p.estado === 'validada').length;
    const pendientes = parcialidades.filter(p => p.estado === 'pendiente').length;
    const rechazadas = parcialidades.filter(p => p.estado === 'rechazada').length;
    const montoTotal = parcialidades.reduce((sum, p) => sum + (p.estado === 'validada' ? p.monto : 0), 0);

    const elemTotalParcialidades = document.getElementById('total-parcialidades'); 
    if (elemTotalParcialidades) elemTotalParcialidades.textContent = totalParcialidades;
    
    const elemParcialidadesValidadas = document.getElementById('parcialidades-validadas'); 
    if (elemParcialidadesValidadas) elemParcialidadesValidadas.textContent = validadas;
    
    const elemParcialidadesPendientes = document.getElementById('parcialidades-pendientes'); 
    if (elemParcialidadesPendientes) elemParcialidadesPendientes.textContent = pendientes;
    
    const elemParcialidadesRechazadas = document.getElementById('parcialidades-rechazadas'); 
    if (elemParcialidadesRechazadas) elemParcialidadesRechazadas.textContent = rechazadas;
    
    const elemMontoTotalParcialidades = document.getElementById('monto-total-parcialidades'); 
    if (elemMontoTotalParcialidades) elemMontoTotalParcialidades.textContent = `$${montoTotal.toLocaleString()}`;
  }
}

// Hacer la clase global
window.ParcialidadesManager = ParcialidadesManager;

// Inicializar cuando se muestra la sección de parcialidades
document.addEventListener('DOMContentLoaded', () => {
  let parcialidadesManager = null;
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        const parcialidadesSection = document.getElementById('parcialidades-section');
        if (parcialidadesSection && parcialidadesSection.style.display !== 'none' && !parcialidadesManager) {
          parcialidadesManager = new ParcialidadesManager();
        }
      }
    });
  });

  const parcialidadesSection = document.getElementById('parcialidades-section');
  if (parcialidadesSection) {
    observer.observe(parcialidadesSection, { attributes: true });
  }
});