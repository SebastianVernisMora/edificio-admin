// Gestión de Fondos - Admin Panel
class FondosManager {
  constructor() {
    this.fondos = [];
    this.movimientos = [];
    this.init();
  }

  async init() {
    await this.loadData();
    this.setupEventListeners();
    this.renderFondos();
    this.renderMovimientos();
  }

  async loadData() {
    try {
      const token = localStorage.getItem('token');
      
      // Cargar estado de fondos
      const fondosRes = await fetch('/api/fondos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (fondosRes.ok) {
        const data = await fondosRes.json();
        this.fondos = data.fondos || [];
        this.movimientos = data.movimientos || [];
      }
    } catch (error) {
      console.error('Error loading fondos data:', error);
    }
  }

  setupEventListeners() {
    // Botón nueva transferencia
    document.getElementById('nueva-transferencia-btn')?.addEventListener('click', () => {
      this.showTransferenciaModal();
    });

    // Form de transferencia
    document.getElementById('transferencia-form')?.addEventListener('submit', (e) => {
      this.handleTransferenciaSubmit(e);
    });

    // Cerrar modal - Adaptado a IDs del HTML
    document.querySelector('#transferir-modal .close')?.addEventListener('click', () => {
      const modal = document.getElementById('transferir-modal') || document.getElementById('transferencia-modal');
      if (modal) modal.style.display = 'none';
    });
    
    // También mantener compatibilidad con ID anterior
    document.querySelector('#transferencia-modal .close')?.addEventListener('click', () => {
      const modal = document.getElementById('transferir-modal') || document.getElementById('transferencia-modal');
      if (modal) modal.style.display = 'none';
    });

    // Filtros de movimientos
    document.getElementById('filtro-tipo-movimiento')?.addEventListener('change', () => {
      this.renderMovimientos();
    });

    document.getElementById('filtro-periodo-movimiento')?.addEventListener('change', () => {
      this.renderMovimientos();
    });
  }

  showTransferenciaModal() {
    const modal = document.getElementById('transferir-modal') || document.getElementById('transferencia-modal');
    const form = document.getElementById('transferir-form') || document.getElementById('transferencia-form');
    
    form.reset();
    document.getElementById('transferencia-fecha').value = new Date().toISOString().split('T')[0];
    
    modal.style.display = 'block';
  }

  async handleTransferenciaSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    const transferenciaData = {
      tipo: formData.get('tipo'),
      origen: formData.get('origen'),
      destino: formData.get('destino'),
      monto: parseFloat(formData.get('monto')),
      concepto: formData.get('concepto'),
      fecha: formData.get('fecha'),
      descripcion: formData.get('descripcion') || ''
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/fondos/transferencia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(transferenciaData)
      });

      if (response.ok) {
        alert('✅ Transferencia registrada correctamente');
        document.getElementById('transferencia-modal').style.display = 'none';
        await this.loadData();
        this.renderFondos();
        this.renderMovimientos();
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.mensaje}`);
      }
    } catch (error) {
      console.error('Error registering transferencia:', error);
      alert('❌ Error al registrar transferencia');
    }
  }

  renderFondos() {
    // Calcular totales
    const fondoGeneral = this.fondos.find(f => f.tipo === 'general')?.monto || 0;
    const fondoReserva = this.fondos.find(f => f.tipo === 'reserva')?.monto || 0;
    const fondoMantenimiento = this.fondos.find(f => f.tipo === 'mantenimiento')?.monto || 0;
    const totalFondos = fondoGeneral + fondoReserva + fondoMantenimiento;

    // Actualizar elementos del DOM
    const fondoGeneralEl = document.getElementById('fondo-general');
    const fondoReservaEl = document.getElementById('fondo-reserva');
    const fondoMantenimientoEl = document.getElementById('fondo-mantenimiento');
    const totalFondosEl = document.getElementById('total-fondos');

    if (fondoGeneralEl) fondoGeneralEl.textContent = `$${fondoGeneral.toLocaleString()}`;
    if (fondoReservaEl) fondoReservaEl.textContent = `$${fondoReserva.toLocaleString()}`;
    if (fondoMantenimientoEl) fondoMantenimientoEl.textContent = `$${fondoMantenimiento.toLocaleString()}`;
    if (totalFondosEl) totalFondosEl.textContent = `$${totalFondos.toLocaleString()}`;

    // Actualizar gráfico si existe
    this.updateFondosChart([fondoGeneral, fondoReserva, fondoMantenimiento]);
  }

  updateFondosChart(data) {
    const canvas = document.getElementById('fondos-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    if (window.fondosChart) {
      window.fondosChart.destroy();
    }

    window.fondosChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Fondo General', 'Fondo Reserva', 'Fondo Mantenimiento'],
        datasets: [{
          data: data,
          backgroundColor: [
            '#4CAF50',
            '#FF9800',
            '#2196F3'
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  renderMovimientos() {
    const tbody = document.querySelector('#movimientos-table tbody');
    if (!tbody) return;

    const filtroTipo = document.getElementById('filtro-tipo-movimiento')?.value || 'todos';
    const filtroPeriodo = document.getElementById('filtro-periodo-movimiento')?.value || 'todos';

    let movimientosFiltrados = this.movimientos;

    // Aplicar filtros
    if (filtroTipo !== 'todos') {
      movimientosFiltrados = movimientosFiltrados.filter(m => m.tipo === filtroTipo);
    }

    if (filtroPeriodo !== 'todos') {
      const ahora = new Date();
      const filtroDate = new Date();
      
      switch (filtroPeriodo) {
        case 'hoy':
          filtroDate.setHours(0, 0, 0, 0);
          break;
        case 'semana':
          filtroDate.setDate(ahora.getDate() - 7);
          break;
        case 'mes':
          filtroDate.setMonth(ahora.getMonth() - 1);
          break;
        case 'año':
          filtroDate.setFullYear(ahora.getFullYear() - 1);
          break;
      }

      movimientosFiltrados = movimientosFiltrados.filter(m => 
        new Date(m.fecha) >= filtroDate
      );
    }

    // Ordenar por fecha descendente
    movimientosFiltrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    tbody.innerHTML = movimientosFiltrados.map(movimiento => {
      const tipoClass = movimiento.tipo === 'ingreso' ? 'success' : 
                      movimiento.tipo === 'egreso' ? 'danger' : 'info';
      const montoPrefix = movimiento.tipo === 'ingreso' ? '+' : 
                         movimiento.tipo === 'egreso' ? '-' : '';
      
      return `
        <tr>
          <td>${movimiento.id}</td>
          <td>
            <span class="badge badge-${tipoClass}">
              ${movimiento.tipo.toUpperCase()}
            </span>
          </td>
          <td>${movimiento.concepto}</td>
          <td>${movimiento.origen || '-'}</td>
          <td>${movimiento.destino || '-'}</td>
          <td class="text-${tipoClass}">
            ${montoPrefix}$${movimiento.monto.toLocaleString()}
          </td>
          <td>${new Date(movimiento.fecha).toLocaleDateString()}</td>
          <td>${movimiento.descripcion || '-'}</td>
        </tr>
      `;
    }).join('');
  }
}

// Hacer la clase global
window.FondosManager = FondosManager;

// Inicializar cuando se muestra la sección de fondos
document.addEventListener('DOMContentLoaded', () => {
  let fondosManager = null;
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        const fondosSection = document.getElementById('fondos-section');
        if (fondosSection && fondosSection.style.display !== 'none' && !fondosManager) {
          fondosManager = new FondosManager();
        }
      }
    });
  });

  const fondosSection = document.getElementById('fondos-section');
  if (fondosSection) {
    observer.observe(fondosSection, { attributes: true });
  }
});