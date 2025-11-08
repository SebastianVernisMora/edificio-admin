// Dashboard Module
const DashboardModule = (() => {
  
  // Dashboard data
  let dashboardData = {};

  // Load dashboard data
  const loadDashboard = async () => {
    try {
      Utils.showLoading('dashboard-content');
      
      // Fetch dashboard data
      const data = await Utils.apiRequest('/dashboard');
      dashboardData = data;
      
      // Render dashboard
      renderDashboard();
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
      Utils.showAlert('Error al cargar el dashboard', 'error');
    }
  };

  // Render dashboard
  const renderDashboard = () => {
    // Update summary cards
    updateSummaryCards();
    
    // Update charts
    updateCharts();
  };

  // Update summary cards
  const updateSummaryCards = () => {
    const patrimonioEl = document.getElementById('patrimonio-total');
    const cuotasPendientesEl = document.getElementById('cuotas-pendientes');
    const gastosMesEl = document.getElementById('gastos-mes');

    if (patrimonioEl) {
      patrimonioEl.textContent = Utils.formatCurrency(dashboardData.patrimonio || 0);
    }
    
    if (cuotasPendientesEl) {
      cuotasPendientesEl.textContent = dashboardData.cuotasPendientes || 0;
    }
    
    if (gastosMesEl) {
      gastosMesEl.textContent = Utils.formatCurrency(dashboardData.gastosMes || 0);
    }
  };

  // Update charts
  const updateCharts = () => {
    // Fondos chart
    updateFondosChart();
    
    // Cuotas chart
    updateCuotasChart();
  };

  // Update fondos chart
  const updateFondosChart = () => {
    const canvas = document.getElementById('fondos-chart-canvas');
    if (!canvas || !window.Chart) return;

    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart
    if (window.fondosChart) {
      window.fondosChart.destroy();
    }

    const fondosData = dashboardData.fondos || {};
    
    window.fondosChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Fondo Reserva', 'Fondo Reparaciones', 'Fondo Extraordinario', 'Disponible'],
        datasets: [{
          data: [
            fondosData.reserva || 0,
            fondosData.reparaciones || 0,
            fondosData.extraordinario || 0,
            fondosData.disponible || 0
          ],
          backgroundColor: [
            '#007bff',
            '#28a745',
            '#ffc107',
            '#6c757d'
          ]
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

  // Update cuotas chart
  const updateCuotasChart = () => {
    const canvas = document.getElementById('cuotas-chart-canvas');
    if (!canvas || !window.Chart) return;

    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart
    if (window.cuotasChart) {
      window.cuotasChart.destroy();
    }

    const cuotasData = dashboardData.cuotas || {};
    
    window.cuotasChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Pagadas', 'Pendientes', 'Vencidas'],
        datasets: [{
          data: [
            cuotasData.pagadas || 0,
            cuotasData.pendientes || 0,
            cuotasData.vencidas || 0
          ],
          backgroundColor: [
            '#28a745',
            '#ffc107',
            '#dc3545'
          ]
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
    loadDashboard
  };
})();