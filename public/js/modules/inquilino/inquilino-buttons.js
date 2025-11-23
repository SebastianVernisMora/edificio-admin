// Inquilino Buttons Handler - Funcionalidad para panel de inquilino
document.addEventListener('DOMContentLoaded', () => {
  console.log('🔧 Inquilino Buttons Handler cargado');
  
  // ========== CUOTAS ==========
  const cuotasAnio = document.getElementById('cuotas-año');
  const cuotasEstado = document.getElementById('cuotas-estado');
  
  if (cuotasAnio) {
    cuotasAnio.addEventListener('change', () => {
      console.log('🔍 Filtrando cuotas por año:', cuotasAnio.value);
      cargarCuotasInquilino();
    });
  }
  
  if (cuotasEstado) {
    cuotasEstado.addEventListener('change', () => {
      console.log('🔍 Filtrando cuotas por estado:', cuotasEstado.value);
      cargarCuotasInquilino();
    });
  }
  
  // ========== ANUNCIOS ==========
  const anunciosTipo = document.getElementById('anuncios-tipo');
  if (anunciosTipo) {
    anunciosTipo.addEventListener('change', () => {
      console.log('🔍 Filtrando anuncios por tipo:', anunciosTipo.value);
      cargarAnunciosInquilino();
    });
  }
  
  // ========== PARCIALIDADES ==========
  const reportarParcialidadBtn = document.getElementById('reportar-parcialidad-btn');
  if (reportarParcialidadBtn) {
    reportarParcialidadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log('💰 Reportar pago parcialidad');
      showModal('reportar-parcialidad-modal');
      resetParcialidadForm();
    });
  }
  
  // Form reportar parcialidad
  const reportarParcialidadForm = document.getElementById('reportar-parcialidad-form');
  if (reportarParcialidadForm) {
    reportarParcialidadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await reportarPagoParcialidad();
    });
  }
  
  // Setup modal closers
  setupModalClosers();
  
  // Cargar datos iniciales
  cargarDashboardInquilino();
});

// ========== FUNCIONES AUXILIARES ==========

function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'block';
    console.log('✓ Modal abierto:', modalId);
  }
}

function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    console.log('✓ Modal cerrado:', modalId);
  }
}

function resetParcialidadForm() {
  const form = document.getElementById('reportar-parcialidad-form');
  if (form) {
    form.reset();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('parcialidad-fecha').value = today;
  }
}

async function cargarDashboardInquilino() {
  console.log('📊 Cargando dashboard inquilino...');
  
  const user = Auth.getCurrentUser();
  if (!user) return;
  
  try {
    const token = localStorage.getItem('edificio_token');
    
    // Cargar datos en paralelo
    const [cuotasRes, parcialidadesRes, anunciosRes, fondosRes] = await Promise.all([
      fetch(`/api/cuotas?departamento=${user.departamento}`, { headers: { 'x-auth-token': token } }),
      fetch(`/api/parcialidades/pagos/departamento/${user.departamento}`, { headers: { 'x-auth-token': token } }),
      fetch('/api/anuncios?limit=5', { headers: { 'x-auth-token': token } }),
      fetch('/api/fondos', { headers: { 'x-auth-token': token } })
    ]);
    
    // Procesar cuotas
    if (cuotasRes.ok) {
      const cuotasData = await cuotasRes.json();
      actualizarDashboardCuotas(cuotasData.cuotas);
    }
    
    // Procesar parcialidades
    if (parcialidadesRes.ok) {
      const parcialidadesData = await parcialidadesRes.json();
      actualizarDashboardParcialidades(parcialidadesData);
      renderMisParcialidades(parcialidadesData.pagos || []);
    } else {
      console.log('⚠️ No se pudieron cargar parcialidades');
    }
    
    // Procesar anuncios
    if (anunciosRes.ok) {
      const anunciosData = await anunciosRes.json();
      renderAnunciosDashboard(anunciosData.anuncios || []);
    }
    
    // Procesar fondos
    if (fondosRes.ok) {
      const fondosData = await fondosRes.json();
      renderFondosChartInquilino(fondosData.fondos);
    }
    
  } catch (error) {
    console.error('Error cargando dashboard:', error);
  }
}

function actualizarDashboardCuotas(cuotas) {
  if (!cuotas || cuotas.length === 0) return;
  
  // Buscar cuota del mes actual
  const fecha = new Date();
  const mesActual = fecha.toLocaleString('es-MX', { month: 'long' });
  const anioActual = fecha.getFullYear();
  
  const cuotaActual = cuotas.find(c => 
    c.mes.toLowerCase() === mesActual.toLowerCase() && 
    c.anio === anioActual
  );
  
  if (cuotaActual) {
    const estadoElem = document.getElementById('cuota-actual-estado');
    const infoElem = document.getElementById('cuota-actual-info');
    
    if (estadoElem) {
      estadoElem.textContent = cuotaActual.estado;
      estadoElem.className = 'amount';
      
      if (cuotaActual.estado === 'PAGADO') {
        estadoElem.style.color = '#28a745';
      } else if (cuotaActual.estado === 'VENCIDO') {
        estadoElem.style.color = '#dc3545';
      } else {
        estadoElem.style.color = '#ffc107';
      }
    }
    
    if (infoElem) {
      infoElem.textContent = `${cuotaActual.mes} ${cuotaActual.anio} - $${cuotaActual.monto}`;
    }
    
    // Próximo vencimiento
    const vencimientoElem = document.getElementById('proximo-vencimiento');
    const diasElem = document.getElementById('dias-vencimiento');
    
    if (vencimientoElem && cuotaActual.fechaVencimiento) {
      const vencimiento = new Date(cuotaActual.fechaVencimiento);
      vencimientoElem.textContent = vencimiento.toLocaleDateString('es-MX');
      
      if (diasElem) {
        const hoy = new Date();
        const diff = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
        diasElem.textContent = diff > 0 ? diff : 0;
      }
    }
  }
}

function actualizarDashboardParcialidades(data) {
  const pagos = data.pagos || [];
  
  // Solo contar pagos VALIDADOS
  const pagosValidados = pagos.filter(p => p.estado === 'validado');
  const montoValidado = pagosValidados.reduce((sum, p) => sum + p.monto, 0);
  const objetivo = 14250;
  const porcentaje = Math.min((montoValidado / objetivo) * 100, 100);
  const pendiente = Math.max(objetivo - montoValidado, 0);
  
  console.log('💰 Pagos validados:', pagosValidados.length, 'Total:', montoValidado);
  
  // Actualizar dashboard
  const progresoElem = document.getElementById('parcialidades-progreso');
  if (progresoElem) {
    progresoElem.textContent = `${porcentaje.toFixed(1)}%`;
  }
  
  // Actualizar detalles en sección de parcialidades
  const progressBar = document.getElementById('mi-parcialidad-progress');
  if (progressBar) {
    progressBar.style.width = `${porcentaje}%`;
  }
  
  const pagadoElem = document.getElementById('mi-parcialidad-pagado');
  const pendienteElem = document.getElementById('mi-parcialidad-pendiente');
  const porcentajeElem = document.getElementById('mi-parcialidad-porcentaje');
  
  if (pagadoElem) {
    pagadoElem.textContent = `$${montoValidado.toLocaleString()}`;
  }
  
  if (pendienteElem) {
    pendienteElem.textContent = `$${pendiente.toLocaleString()}`;
  }
  
  if (porcentajeElem) {
    porcentajeElem.textContent = `${porcentaje.toFixed(1)}%`;
  }
}

async function cargarCuotasInquilino() {
  console.log('📋 Cargando cuotas inquilino...');
  
  const user = Auth.getCurrentUser();
  if (!user) return;
  
  const anio = document.getElementById('cuotas-año')?.value;
  const estado = document.getElementById('cuotas-estado')?.value;
  
  console.log('🔍 Filtros:', { anio, estado, departamento: user.departamento });
  
  try {
    const token = localStorage.getItem('edificio_token');
    const params = new URLSearchParams();
    
    // SIEMPRE filtrar por departamento del usuario
    params.append('departamento', user.departamento);
    
    if (anio) params.append('anio', anio);
    if (estado && estado !== 'TODOS') params.append('estado', estado);
    
    const url = `/api/cuotas?${params.toString()}`;
    console.log('📡 URL:', url);
    
    const response = await fetch(url, {
      headers: { 'x-auth-token': token }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 Cuotas recibidas:', data.cuotas?.length);
      renderCuotasTable(data.cuotas);
    }
  } catch (error) {
    console.error('Error cargando cuotas:', error);
  }
}

function renderCuotasTable(cuotas) {
  const tbody = document.querySelector('#mis-cuotas-table tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (!cuotas || cuotas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay cuotas registradas</td></tr>';
    return;
  }
  
  cuotas.forEach(cuota => {
    const tr = document.createElement('tr');
    
    const vencimiento = new Date(cuota.fechaVencimiento);
    const fechaPago = cuota.fechaPago ? new Date(cuota.fechaPago).toLocaleDateString('es-MX') : '-';
    
    let estadoClass = '';
    if (cuota.estado === 'PAGADO') estadoClass = 'text-success';
    else if (cuota.estado === 'VENCIDO') estadoClass = 'text-danger';
    else estadoClass = 'text-warning';
    
    tr.innerHTML = `
      <td>${cuota.mes} ${cuota.anio}</td>
      <td>$${cuota.monto.toLocaleString()}</td>
      <td class="${estadoClass}">${cuota.estado}</td>
      <td>${vencimiento.toLocaleDateString('es-MX')}</td>
      <td>${fechaPago}</td>
    `;
    
    tbody.appendChild(tr);
  });
}

async function cargarAnunciosInquilino() {
  console.log('📢 Cargando anuncios...');
  
  const tipo = document.getElementById('anuncios-tipo')?.value;
  
  try {
    const token = localStorage.getItem('edificio_token');
    let url = '/api/anuncios';
    
    if (tipo && tipo !== 'TODOS') url += `?tipo=${tipo}`;
    
    const response = await fetch(url, {
      headers: { 'x-auth-token': token }
    });
    
    if (response.ok) {
      const data = await response.json();
      renderAnuncios(data.anuncios);
    }
  } catch (error) {
    console.error('Error cargando anuncios:', error);
  }
}

function renderAnuncios(anuncios) {
  const container = document.getElementById('anuncios-list');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (!anuncios || anuncios.length === 0) {
    container.innerHTML = '<p class="text-center">No hay anuncios disponibles</p>';
    return;
  }
  
  anuncios.forEach(anuncio => {
    const div = document.createElement('div');
    div.className = 'anuncio-card';
    
    let tipoClass = 'bg-secondary';
    if (anuncio.tipo === 'URGENTE') tipoClass = 'bg-danger';
    else if (anuncio.tipo === 'IMPORTANTE') tipoClass = 'bg-warning';
    
    div.innerHTML = `
      <div class="anuncio-header">
        <h4>${anuncio.titulo}</h4>
        <span class="badge ${tipoClass}">${anuncio.tipo}</span>
      </div>
      <div class="anuncio-body">
        <p>${anuncio.contenido}</p>
      </div>
      <div class="anuncio-footer">
        <small>${new Date(anuncio.fechaPublicacion).toLocaleDateString('es-MX')}</small>
      </div>
    `;
    
    container.appendChild(div);
  });
}

async function reportarPagoParcialidad() {
  console.log('📤 Reportando pago de parcialidad...');
  
  const monto = document.getElementById('parcialidad-monto').value;
  const fecha = document.getElementById('parcialidad-fecha').value;
  const comprobante = document.getElementById('parcialidad-comprobante').value;
  const notas = document.getElementById('parcialidad-notas').value;
  
  console.log('📋 Datos:', { monto, fecha, comprobante, notas });
  
  if (!monto || !fecha || !comprobante) {
    alert('Por favor complete todos los campos obligatorios');
    return;
  }
  
  const user = Auth.getCurrentUser();
  if (!user) {
    console.error('❌ Usuario no encontrado');
    return;
  }
  
  console.log('👤 Usuario:', user.departamento);
  
  try {
    const token = localStorage.getItem('edificio_token');
    
    const bodyData = {
      departamento: user.departamento,
      monto: parseFloat(monto),
      fecha,
      comprobante,
      notas
    };
    
    console.log('📤 Enviando a API:', bodyData);
    
    const response = await fetch('/api/parcialidades', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify(bodyData)
    });
    
    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Respuesta:', result);
      alert('✅ Pago reportado exitosamente. Será validado por el administrador.');
      hideModal('reportar-parcialidad-modal');
      cargarDashboardInquilino();
    } else {
      const error = await response.json();
      console.error('❌ Error servidor:', error);
      alert(`❌ Error: ${error.msg || 'No se pudo reportar el pago'}`);
    }
  } catch (error) {
    console.error('❌ Exception:', error);
    alert('❌ Error al reportar el pago: ' + error.message);
  }
}

function renderMisParcialidades(pagos) {
  const tbody = document.querySelector('#mis-parcialidades-table tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (!pagos || pagos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hay pagos registrados</td></tr>';
    return;
  }
  
  pagos.forEach(pago => {
    const tr = document.createElement('tr');
    
    const fecha = new Date(pago.fecha).toLocaleDateString('es-MX');
    const estadoClass = pago.estado === 'validado' ? 'text-success' : 'text-warning';
    const estadoTexto = pago.estado === 'validado' ? 'Validado' : 'Pendiente de validación';
    
    tr.innerHTML = `
      <td>${fecha}</td>
      <td>$${pago.monto.toLocaleString()}</td>
      <td>${pago.comprobante || '-'}</td>
      <td class="${estadoClass}">${estadoTexto}</td>
    `;
    
    tbody.appendChild(tr);
  });
  
  console.log(`✅ ${pagos.length} pagos de parcialidades renderizados`);
}

function renderAnunciosDashboard(anuncios) {
  const container = document.getElementById('dashboard-anuncios-list');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (!anuncios || anuncios.length === 0) {
    container.innerHTML = '<p class="text-center">No hay anuncios importantes</p>';
    return;
  }
  
  // Solo mostrar anuncios importantes o urgentes
  const importantes = anuncios.filter(a => a.tipo === 'IMPORTANTE' || a.tipo === 'URGENTE');
  
  importantes.slice(0, 3).forEach(anuncio => {
    const div = document.createElement('div');
    div.className = 'anuncio-card-mini';
    
    const tipoClass = anuncio.tipo === 'URGENTE' ? 'bg-danger' : 'bg-warning';
    
    div.innerHTML = `
      <div class="anuncio-mini-header">
        <strong>${anuncio.titulo}</strong>
        <span class="badge ${tipoClass}">${anuncio.tipo}</span>
      </div>
      <p class="anuncio-mini-content">${anuncio.contenido.substring(0, 100)}${anuncio.contenido.length > 100 ? '...' : ''}</p>
    `;
    
    container.appendChild(div);
  });
  
  console.log(`✅ ${importantes.length} anuncios importantes en dashboard`);
}

let fondosChartInquilinoInstance = null;

function renderFondosChartInquilino(fondos) {
  // Buscar canvas en el dashboard (puede no existir, lo creamos)
  const dashboardSection = document.getElementById('dashboard-section');
  if (!dashboardSection) return;
  
  // Buscar o crear contenedor de gráfico
  let chartContainer = dashboardSection.querySelector('.dashboard-charts');
  if (!chartContainer) {
    chartContainer = document.createElement('div');
    chartContainer.className = 'dashboard-charts';
    chartContainer.innerHTML = `
      <div class="chart-container">
        <h3>Fondos del Edificio</h3>
        <div class="chart" id="fondos-chart-inquilino" style="position: relative; height: 250px;">
          <canvas></canvas>
        </div>
      </div>
    `;
    dashboardSection.querySelector('.dashboard-anuncios').insertAdjacentElement('beforebegin', chartContainer);
  }
  
  const canvas = dashboardSection.querySelector('#fondos-chart-inquilino canvas');
  if (!canvas) return;
  
  // Destruir chart anterior
  if (fondosChartInquilinoInstance) {
    fondosChartInquilinoInstance.destroy();
  }
  
  const ctx = canvas.getContext('2d');
  
  fondosChartInquilinoInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Ahorro Acumulado', 'Gastos Mayores', 'Dinero Operacional'],
      datasets: [{
        data: [
          fondos.ahorroAcumulado || 0,
          fondos.gastosMayores || 0,
          fondos.dineroOperacional || 0
        ],
        backgroundColor: ['#28a745', '#ffc107', '#007bff']
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
  
  console.log('✅ Gráfico de fondos (inquilino) renderizado');
}

function setupModalClosers() {
  // Botones cerrar (X)
  document.querySelectorAll('.modal .close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
      console.log('❌ Click en cerrar modal');
      const modal = this.closest('.modal');
      if (modal) {
        modal.style.display = 'none';
        console.log('✓ Modal cerrado:', modal.id);
      }
    });
  });
  
  // Botones cancelar
  document.querySelectorAll('.modal-cancel').forEach(cancelBtn => {
    cancelBtn.addEventListener('click', function(e) {
      console.log('❌ Click en cancelar');
      e.preventDefault();
      const modal = this.closest('.modal');
      if (modal) {
        modal.style.display = 'none';
        console.log('✓ Modal cerrado:', modal.id);
      }
    });
  });
  
  // Click fuera del modal (usar once para cada modal que se abre)
  // Removido para evitar conflictos - se maneja individualmente
}
