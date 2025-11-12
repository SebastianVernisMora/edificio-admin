// Inquilino Navigation Fix - Solución específica para navegación de inquilinos
document.addEventListener('DOMContentLoaded', () => {
  console.log('🏠 Inicializando navegación de inquilino...');
  
  // Verificar elementos necesarios
  const sidebar = document.querySelector('.sidebar-nav');
  const sections = document.querySelectorAll('.content-section');
  const pageTitle = document.getElementById('page-title');
  
  console.log('Elementos encontrados:');
  console.log('- Sidebar:', !!sidebar);
  console.log('- Secciones:', sections.length);
  console.log('- Page title:', !!pageTitle);
  
  if (!sidebar) {
    console.error('❌ Sidebar no encontrado');
    return;
  }
  
  // Configurar navegación con delegación de eventos
  sidebar.addEventListener('click', (e) => {
    console.log('🖱️ Click en sidebar detectado');
    
    const link = e.target.closest('a');
    if (!link) return;
    
    e.preventDefault();
    const href = link.getAttribute('href');
    const sectionId = href ? href.substring(1) : null;
    
    console.log('🎯 Navegando a:', sectionId);
    
    if (!sectionId) return;
    
    // Actualizar navegación
    updateInquilinoNavigation(sectionId);
  });
  
  // Función para actualizar navegación
  function updateInquilinoNavigation(sectionId) {
    // Actualizar sidebar activo
    const navItems = sidebar.querySelectorAll('li');
    navItems.forEach(item => {
      const link = item.querySelector('a');
      if (link && link.getAttribute('href') === `#${sectionId}`) {
        item.classList.add('active');
        console.log('✅ Activado:', sectionId);
      } else {
        item.classList.remove('active');
      }
    });
    
    // Mostrar/ocultar secciones
    sections.forEach(section => {
      if (section.id === `${sectionId}-section`) {
        section.style.display = 'block';
        section.classList.add('active');
        console.log('✅ Mostrada sección:', section.id);
        
        // Cargar datos específicos
        loadInquilinoSectionData(sectionId);
      } else {
        section.style.display = 'none';
        section.classList.remove('active');
      }
    });
    
    // Actualizar título
    if (pageTitle) {
      const titles = {
        'dashboard': 'Dashboard',
        'cuotas': 'Mis Cuotas',
        'anuncios': 'Anuncios',
        'parcialidades': 'Parcialidades 2026'
      };
      pageTitle.textContent = titles[sectionId] || sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
    }
  }
  
  // Función para cargar datos de sección
  async function loadInquilinoSectionData(sectionId) {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    console.log('📊 Cargando datos para:', sectionId);
    
    try {
      switch (sectionId) {
        case 'cuotas':
          await loadAndRenderCuotas();
          break;
        case 'anuncios':
          await loadAndRenderAnuncios();
          break;
        case 'parcialidades':
          await loadAndRenderParcialidades();
          break;
        case 'dashboard':
          await loadAndRenderDashboard();
          break;
      }
    } catch (error) {
      console.error(`Error cargando ${sectionId}:`, error);
    }
  }
  
  // Cargar y renderizar cuotas
  async function loadAndRenderCuotas() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/cuotas/mis-cuotas', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const cuotas = await response.json();
        renderCuotasTable(cuotas);
      }
    } catch (error) {
      console.error('Error cargando cuotas:', error);
    }
  }
  
  // Cargar y renderizar anuncios
  async function loadAndRenderAnuncios() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/anuncios', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const anuncios = await response.json();
        renderAnunciosContainer(anuncios.filter(a => a.activo));
      }
    } catch (error) {
      console.error('Error cargando anuncios:', error);
    }
  }
  
  // Renderizar tabla de cuotas
  function renderCuotasTable(cuotas) {
    const tbody = document.querySelector('#mis-cuotas-table tbody');
    if (!tbody) return;
    
    // Aplicar filtros
    const filtroAño = document.getElementById('cuotas-año')?.value;
    const filtroEstado = document.getElementById('cuotas-estado')?.value;
    
    let cuotasFiltradas = cuotas;
    
    if (filtroAño && filtroAño !== 'todos') {
      cuotasFiltradas = cuotasFiltradas.filter(c => c.año === parseInt(filtroAño));
    }
    
    if (filtroEstado && filtroEstado !== 'TODOS') {
      cuotasFiltradas = cuotasFiltradas.filter(c => c.estado.toUpperCase() === filtroEstado);
    }
    
    tbody.innerHTML = cuotasFiltradas.map(cuota => {
      const estadoClass = 
        cuota.estado === 'pagada' ? 'success' :
        cuota.estado === 'pendiente' ? 'warning' : 
        cuota.estado === 'reportada' ? 'info' : 'danger';
      
      return `
        <tr class="${cuota.estado === 'vencida' ? 'table-danger' : ''}">
          <td>${cuota.mes} ${cuota.año}</td>
          <td>$${cuota.monto.toLocaleString()}</td>
          <td>
            <span class="badge badge-${estadoClass}">
              ${cuota.estado.toUpperCase()}
            </span>
          </td>
          <td>${cuota.fecha_vencimiento ? new Date(cuota.fecha_vencimiento).toLocaleDateString() : '-'}</td>
          <td>${cuota.fecha_pago ? new Date(cuota.fecha_pago).toLocaleDateString() : '-'}</td>
          <td>
            ${cuota.estado === 'pendiente' ? 
              `<button class="btn btn-sm btn-primary" onclick="reportarPagoEspecifico(${cuota.id})">
                Reportar Pago
              </button>` : 
              cuota.estado === 'reportada' ? '⏳ En validación' : '-'
            }
          </td>
        </tr>
      `;
    }).join('');
    
    console.log(`✅ Renderizadas ${cuotasFiltradas.length} cuotas`);
  }
  
  // Renderizar anuncios
  function renderAnunciosContainer(anuncios) {
    const container = document.getElementById('anuncios-list') || document.getElementById('anuncios-container');
    if (!container) return;
    
    if (anuncios.length === 0) {
      container.innerHTML = '<div class="alert alert-info">No hay anuncios disponibles</div>';
      return;
    }
    
    container.innerHTML = anuncios.map(anuncio => `
      <div class="anuncio-card ${anuncio.tipo === 'urgente' ? 'urgent' : ''}">
        <div class="anuncio-header">
          <h4>${anuncio.titulo}</h4>
          <span class="badge badge-${anuncio.tipo === 'urgente' ? 'danger' : 'info'}">
            ${anuncio.tipo.toUpperCase()}
          </span>
        </div>
        <div class="anuncio-content">
          <p>${anuncio.contenido}</p>
        </div>
        <div class="anuncio-footer">
          <small class="text-muted">
            Publicado: ${new Date(anuncio.fecha_creacion).toLocaleDateString()}
            ${anuncio.fecha_fin ? `• Válido hasta: ${new Date(anuncio.fecha_fin).toLocaleDateString()}` : ''}
          </small>
        </div>
      </div>
    `).join('');
    
    console.log(`✅ Renderizados ${anuncios.length} anuncios`);
  }
  
  // Función global para reportar pago específico
  window.reportarPagoEspecifico = (cuotaId) => {
    console.log('💰 Reportar pago para cuota:', cuotaId);
    if (window.inquilinoController) {
      window.inquilinoController.showReportarPagoModal(cuotaId);
    } else {
      // Fallback si el controller no está disponible
      const modal = document.getElementById('reportar-pago-modal');
      if (modal) {
        modal.style.display = 'block';
      }
    }
  };
  
  // Cargar dashboard inicial
  async function loadAndRenderDashboard() {
    console.log('📊 Cargando dashboard inquilino...');
    
    try {
      const token = localStorage.getItem('token');
      
      // Cargar cuotas para estadísticas
      const cuotasRes = await fetch('/api/cuotas/mis-cuotas', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (cuotasRes.ok) {
        const cuotas = await cuotasRes.json();
        
        // Actualizar tarjetas del dashboard
        const cuotasPendientes = cuotas.filter(c => c.estado === 'pendiente').length;
        const totalAdeudado = cuotas.filter(c => c.estado === 'pendiente')
          .reduce((sum, c) => sum + c.monto, 0);
        
        // Cuota actual del mes
        const now = new Date();
        const cuotaActual = cuotas.find(c => {
          const mesNumero = getMesNumero(c.mes);
          return c.año === now.getFullYear() && mesNumero === now.getMonth() + 1;
        });
        
        // Actualizar elementos del DOM
        const cuotaActualEl = document.getElementById('cuota-actual-estado');
        if (cuotaActualEl && cuotaActual) {
          cuotaActualEl.textContent = cuotaActual.estado.toUpperCase();
          cuotaActualEl.className = `amount ${cuotaActual.estado === 'pagada' ? 'text-success' : 'text-warning'}`;
        }
        
        const totalAdeudadoEl = document.getElementById('total-adeudado');
        if (totalAdeudadoEl) {
          totalAdeudadoEl.textContent = `$${totalAdeudado.toLocaleString()}`;
        }
        
        const cuotasPendientesEl = document.getElementById('cuotas-pendientes-count');
        if (cuotasPendientesEl) {
          cuotasPendientesEl.textContent = cuotasPendientes;
        }
        
        console.log('✅ Dashboard actualizado');
      }
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    }
  }
  
  function getMesNumero(nombreMes) {
    const meses = {
      'Enero': 1, 'Febrero': 2, 'Marzo': 3, 'Abril': 4,
      'Mayo': 5, 'Junio': 6, 'Julio': 7, 'Agosto': 8,
      'Septiembre': 9, 'Octubre': 10, 'Noviembre': 11, 'Diciembre': 12
    };
    return meses[nombreMes] || 1;
  }
  
  // Configurar botones específicos
  setTimeout(() => {
    // Botón reportar pago principal
    const reportarPagoBtn = document.getElementById('reportar-pago-btn');
    if (reportarPagoBtn) {
      reportarPagoBtn.addEventListener('click', () => {
        const modal = document.getElementById('reportar-pago-modal');
        if (modal) {
          modal.style.display = 'block';
        }
      });
      console.log('✅ reportar-pago-btn configurado');
    }
    
    // Botón logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        Auth.logout();
        window.location.href = '/';
      });
      console.log('✅ logout-btn configurado');
    }
    
    // Configurar filtros
    const cuotasAño = document.getElementById('cuotas-año');
    const cuotasEstado = document.getElementById('cuotas-estado');
    
    if (cuotasAño) {
      cuotasAño.addEventListener('change', loadAndRenderCuotas);
    }
    
    if (cuotasEstado) {
      cuotasEstado.addEventListener('change', loadAndRenderCuotas);
    }
  }, 500);
  
  // Cargar datos iniciales
  setTimeout(() => {
    updateInquilinoNavigation('dashboard');
  }, 1000);
});

// Configurar cierre de modales
document.addEventListener('click', (e) => {
  // Cerrar modal con X
  if (e.target.classList.contains('close')) {
    const modal = e.target.closest('.modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }
  
  // Cerrar modal con botón cancelar
  if (e.target.classList.contains('modal-cancel') || e.target.textContent.includes('Cancelar')) {
    const modal = e.target.closest('.modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }
  
  // Cerrar modal haciendo clic fuera
  if (e.target.classList.contains('modal')) {
    e.target.style.display = 'none';
  }
});