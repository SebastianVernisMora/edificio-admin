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
    reportarParcialidadBtn.addEventListener('click', () => {
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
    
    // Cargar cuota actual
    const cuotasRes = await fetch(`/api/cuotas?departamento=${user.departamento}`, {
      headers: { 'x-auth-token': token }
    });
    
    if (cuotasRes.ok) {
      const cuotasData = await cuotasRes.json();
      actualizarDashboardCuotas(cuotasData.cuotas);
    }
    
    // Cargar parcialidades
    const parcialidadesRes = await fetch(`/api/parcialidades?departamento=${user.departamento}`, {
      headers: { 'x-auth-token': token }
    });
    
    if (parcialidadesRes.ok) {
      const parcialidadesData = await parcialidadesRes.json();
      actualizarDashboardParcialidades(parcialidadesData);
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
  if (!data || !data.progreso) return;
  
  const progresoElem = document.getElementById('parcialidades-progreso');
  if (progresoElem) {
    progresoElem.textContent = `${data.progreso.porcentaje}%`;
  }
  
  // Actualizar detalles en sección de parcialidades
  const progressBar = document.getElementById('mi-parcialidad-progress');
  if (progressBar) {
    progressBar.style.width = `${data.progreso.porcentaje}%`;
  }
  
  const pagadoElem = document.getElementById('mi-parcialidad-pagado');
  const pendienteElem = document.getElementById('mi-parcialidad-pendiente');
  const porcentajeElem = document.getElementById('mi-parcialidad-porcentaje');
  
  if (pagadoElem) {
    pagadoElem.textContent = `$${data.progreso.monto_pagado.toLocaleString()}`;
  }
  
  if (pendienteElem) {
    const objetivo = 14250; // Por departamento
    const pendiente = objetivo - data.progreso.monto_pagado;
    pendienteElem.textContent = `$${pendiente.toLocaleString()}`;
  }
  
  if (porcentajeElem) {
    porcentajeElem.textContent = `${data.progreso.porcentaje}%`;
  }
}

async function cargarCuotasInquilino() {
  console.log('📋 Cargando cuotas inquilino...');
  
  const user = Auth.getCurrentUser();
  if (!user) return;
  
  const anio = document.getElementById('cuotas-año')?.value;
  const estado = document.getElementById('cuotas-estado')?.value;
  
  try {
    const token = localStorage.getItem('edificio_token');
    let url = `/api/cuotas?departamento=${user.departamento}`;
    
    if (anio && anio !== '2025') url += `&anio=${anio}`;
    if (estado && estado !== 'TODOS') url += `&estado=${estado}`;
    
    const response = await fetch(url, {
      headers: { 'x-auth-token': token }
    });
    
    if (response.ok) {
      const data = await response.json();
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
  const monto = document.getElementById('parcialidad-monto').value;
  const fecha = document.getElementById('parcialidad-fecha').value;
  const comprobante = document.getElementById('parcialidad-comprobante').value;
  const notas = document.getElementById('parcialidad-notas').value;
  
  if (!monto || !fecha || !comprobante) {
    alert('Por favor complete todos los campos obligatorios');
    return;
  }
  
  const user = Auth.getCurrentUser();
  if (!user) return;
  
  try {
    const token = localStorage.getItem('edificio_token');
    const response = await fetch('/api/parcialidades', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({
        departamento: user.departamento,
        monto: parseFloat(monto),
        fecha,
        comprobante,
        notas
      })
    });
    
    if (response.ok) {
      alert('Pago reportado exitosamente. Será validado por el administrador.');
      hideModal('reportar-parcialidad-modal');
      cargarDashboardInquilino();
    } else {
      const error = await response.json();
      alert(`Error: ${error.msg || 'No se pudo reportar el pago'}`);
    }
  } catch (error) {
    console.error('Error reportando pago:', error);
    alert('Error al reportar el pago');
  }
}

function setupModalClosers() {
  // Botones cerrar (X)
  document.querySelectorAll('.modal .close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
      const modal = this.closest('.modal');
      if (modal) modal.style.display = 'none';
    });
  });
  
  // Botones cancelar
  document.querySelectorAll('.modal-cancel').forEach(cancelBtn => {
    cancelBtn.addEventListener('click', function() {
      const modal = this.closest('.modal');
      if (modal) modal.style.display = 'none';
    });
  });
  
  // Click fuera del modal
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
    }
  });
}
