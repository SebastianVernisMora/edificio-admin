// Dashboard Module
const DashboardModule = (() => {
  // DOM Elements
  const patrimonioTotalEl = document.getElementById('patrimonio-total');
  const cuotasPendientesEl = document.getElementById('cuotas-pendientes');
  const gastosMesEl = document.getElementById('gastos-mes');
  const fondosChartEl = document.getElementById('fondos-chart');
  const cuotasChartEl = document.getElementById('cuotas-chart');
  const recentAnunciosEl = document.getElementById('recent-anuncios');
  const recentGastosEl = document.getElementById('recent-gastos');
  
  // Charts
  let fondosChart = null;
  let cuotasChart = null;
  
  // Initialize dashboard
  const init = () => {
    loadDashboardData();
  };
  
  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      // Load fondos data
      const fondosData = await AdminDashboard.apiRequest('/fondos');
      updateFondosData(fondosData.fondos);
      
      // Load cuotas data
      const cuotasData = await AdminDashboard.apiRequest('/cuotas');
      updateCuotasData(cuotasData.cuotas);
      
      // Load gastos data
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const gastosData = await AdminDashboard.apiRequest(`/gastos/fecha/${currentMonth}/${currentYear}`);
      updateGastosData(gastosData.gastos);
      
      // Load anuncios data
      const anunciosData = await AdminDashboard.apiRequest('/anuncios/recientes?limit=5');
      updateAnunciosData(anunciosData.anuncios);
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    }
  };
  
  // Update fondos data
  const updateFondosData = (fondos) => {
    // Update patrimonio total
    if (patrimonioTotalEl) {
      patrimonioTotalEl.textContent = AdminDashboard.formatCurrency(fondos.patrimonioTotal);
    }
    
    // Update fondos chart
    updateFondosChart(fondos);
  };
  
  // Update cuotas data
  const updateCuotasData = (cuotas) => {
    // Filter cuotas for current month
    const now = new Date();
    const currentMonth = now.toLocaleDateString('es-ES', { month: 'long' });
    const currentYear = now.getFullYear();
    
    const currentMonthCuotas = cuotas.filter(cuota => 
      cuota.mes === currentMonth && cuota.año === currentYear
    );
    
    const pendientes = currentMonthCuotas.filter(cuota => 
      cuota.estado === 'PENDIENTE' || cuota.estado === 'VENCIDO'
    ).length;
    
    // Update cuotas pendientes
    if (cuotasPendientesEl) {
      cuotasPendientesEl.textContent = pendientes;
    }
    
    // Update cuotas chart
    updateCuotasChart(currentMonthCuotas);
  };
  
  // Update gastos data
  const updateGastosData = (gastos) => {
    // Calculate total gastos
    const totalGastos = gastos.reduce((total, gasto) => total + gasto.monto, 0);
    
    // Update gastos mes
    if (gastosMesEl) {
      gastosMesEl.textContent = AdminDashboard.formatCurrency(totalGastos);
    }
    
    // Update recent gastos
    updateRecentGastos(gastos);
  };
  
  // Update anuncios data
  const updateAnunciosData = (anuncios) => {
    // Update recent anuncios
    if (recentAnunciosEl) {
      recentAnunciosEl.innerHTML = '';
      
      if (anuncios.length === 0) {
        recentAnunciosEl.innerHTML = '<p>No hay anuncios recientes</p>';
        return;
      }
      
      anuncios.forEach(anuncio => {
        const anuncioEl = document.createElement('div');
        anuncioEl.className = 'recent-item';
        
        const tipoClass = anuncio.tipo.toLowerCase();
        
        anuncioEl.innerHTML = `
          <div class="recent-item-header">
            <h4>${anuncio.titulo}</h4>
            <span class="anuncio-badge ${tipoClass}">${anuncio.tipo}</span>
          </div>
          <p class="recent-item-date">${AdminDashboard.formatDate(anuncio.createdAt)}</p>
        `;
        
        recentAnunciosEl.appendChild(anuncioEl);
      });
    }
  };
  
  // Update recent gastos
  const updateRecentGastos = (gastos) => {
    if (recentGastosEl) {
      recentGastosEl.innerHTML = '';
      
      if (gastos.length === 0) {
        recentGastosEl.innerHTML = '<p>No hay gastos recientes</p>';
        return;
      }
      
      // Sort by date (newest first)
      const sortedGastos = [...gastos].sort((a, b) => 
        new Date(b.fecha) - new Date(a.fecha)
      );
      
      // Take only the first 5
      const recentGastos = sortedGastos.slice(0, 5);
      
      recentGastos.forEach(gasto => {
        const gastoEl = document.createElement('div');
        gastoEl.className = 'recent-item';
        
        gastoEl.innerHTML = `
          <div class="recent-item-header">
            <h4>${gasto.concepto}</h4>
            <span class="amount">${AdminDashboard.formatCurrency(gasto.monto)}</span>
          </div>
          <p class="recent-item-date">${AdminDashboard.formatDate(gasto.fecha)} - ${gasto.categoria}</p>
        `;
        
        recentGastosEl.appendChild(gastoEl);
      });
    }
  };
  
  // Update fondos chart
  const updateFondosChart = (fondos) => {
    if (!fondosChartEl) return;
    
    const ctx = fondosChartEl.getContext('2d');
    
    // Destroy previous chart if exists
    if (fondosChart) {
      fondosChart.destroy();
    }
    
    // Create new chart
    fondosChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Ahorro Acumulado', 'Gastos Mayores', 'Dinero Operacional'],
        datasets: [{
          data: [fondos.ahorroAcumulado, fondos.gastosMayores, fondos.dineroOperacional],
          backgroundColor: ['#3498db', '#e74c3c', '#2ecc71'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                return `${label}: ${AdminDashboard.formatCurrency(value)}`;
              }
            }
          }
        }
      }
    });
  };
  
  // Update cuotas chart
  const updateCuotasChart = (cuotas) => {
    if (!cuotasChartEl) return;
    
    const ctx = cuotasChartEl.getContext('2d');
    
    // Count cuotas by estado
    const pendientes = cuotas.filter(cuota => cuota.estado === 'PENDIENTE').length;
    const pagadas = cuotas.filter(cuota => cuota.estado === 'PAGADO').length;
    const vencidas = cuotas.filter(cuota => cuota.estado === 'VENCIDO').length;
    
    // Destroy previous chart if exists
    if (cuotasChart) {
      cuotasChart.destroy();
    }
    
    // Create new chart
    cuotasChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Pendientes', 'Pagadas', 'Vencidas'],
        datasets: [{
          data: [pendientes, pagadas, vencidas],
          backgroundColor: ['#f39c12', '#2ecc71', '#e74c3c'],
          borderWidth: 0
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
  };
  
  // Public API
  return {
    init,
    loadDashboardData
  };
})();

// Initialize dashboard module
document.addEventListener('DOMContentLoaded', DashboardModule.init);