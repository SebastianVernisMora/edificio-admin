// Admin Buttons Handler - Funcionalidad completa para todos los botones
document.addEventListener('DOMContentLoaded', () => {
  console.log('🔧 Admin Buttons Handler cargado');
  
  // ========== USUARIOS ==========
  const nuevoUsuarioBtn = document.getElementById('nuevo-usuario-btn');
  if (nuevoUsuarioBtn) {
    nuevoUsuarioBtn.addEventListener('click', () => {
      console.log('👤 Nuevo Usuario');
      alert('Funcionalidad de Nuevo Usuario en desarrollo');
    });
  }
  
  // Filtros usuarios
  const usuariosRol = document.getElementById('usuarios-rol');
  const usuariosEstado = document.getElementById('usuarios-estado');
  
  if (usuariosRol) {
    usuariosRol.addEventListener('change', () => {
      console.log('🔍 Filtrando usuarios por rol:', usuariosRol.value);
      filtrarUsuarios();
    });
  }
  
  if (usuariosEstado) {
    usuariosEstado.addEventListener('change', () => {
      console.log('🔍 Filtrando usuarios por estado:', usuariosEstado.value);
      filtrarUsuarios();
    });
  }
  
  // ========== CUOTAS ==========
  const nuevaCuotaBtn = document.getElementById('nueva-cuota-btn');
  if (nuevaCuotaBtn) {
    nuevaCuotaBtn.addEventListener('click', () => {
      console.log('💰 Nueva Cuota');
      showModal('cuota-modal');
      resetCuotaForm();
    });
  }
  
  const verificarVencimientosBtn = document.getElementById('verificar-vencimientos-btn');
  if (verificarVencimientosBtn) {
    verificarVencimientosBtn.addEventListener('click', async () => {
      console.log('⏰ Verificando vencimientos...');
      await verificarVencimientos();
    });
  }
  
  // Filtros cuotas
  const cuotasMes = document.getElementById('cuotas-mes');
  const cuotasAnio = document.getElementById('cuotas-año');
  const cuotasEstado = document.getElementById('cuotas-estado');
  
  if (cuotasMes) {
    cuotasMes.addEventListener('change', () => {
      console.log('🔍 Filtrando cuotas por mes:', cuotasMes.value);
      filtrarCuotas();
    });
  }
  
  if (cuotasAnio) {
    cuotasAnio.addEventListener('change', () => {
      console.log('🔍 Filtrando cuotas por año:', cuotasAnio.value);
      filtrarCuotas();
    });
  }
  
  if (cuotasEstado) {
    cuotasEstado.addEventListener('change', () => {
      console.log('🔍 Filtrando cuotas por estado:', cuotasEstado.value);
      filtrarCuotas();
    });
  }
  
  // ========== GASTOS ==========
  const nuevoGastoBtn = document.getElementById('nuevo-gasto-btn');
  if (nuevoGastoBtn) {
    nuevoGastoBtn.addEventListener('click', () => {
      console.log('💸 Nuevo Gasto');
      showModal('gasto-modal');
      resetGastoForm();
    });
  }
  
  // Filtros gastos
  const gastosMes = document.getElementById('gastos-mes');
  const gastosAnio = document.getElementById('gastos-año');
  const gastosCategoria = document.getElementById('gastos-categoria');
  
  if (gastosMes) {
    gastosMes.addEventListener('change', () => {
      console.log('🔍 Filtrando gastos por mes:', gastosMes.value);
      filtrarGastos();
    });
  }
  
  if (gastosAnio) {
    gastosAnio.addEventListener('change', () => {
      console.log('🔍 Filtrando gastos por año:', gastosAnio.value);
      filtrarGastos();
    });
  }
  
  if (gastosCategoria) {
    gastosCategoria.addEventListener('change', () => {
      console.log('🔍 Filtrando gastos por categoría:', gastosCategoria.value);
      filtrarGastos();
    });
  }
  
  // ========== ANUNCIOS ==========
  // Filtros anuncios
  const anunciosTipo = document.getElementById('anuncios-tipo');
  if (anunciosTipo) {
    anunciosTipo.addEventListener('change', () => {
      console.log('🔍 Filtrando anuncios por tipo:', anunciosTipo.value);
      filtrarAnuncios();
    });
  }
  
  // ========== CIERRES ==========
  // Filtros cierres
  const cierresAnio = document.getElementById('cierres-año');
  if (cierresAnio) {
    cierresAnio.addEventListener('change', () => {
      console.log('🔍 Filtrando cierres por año:', cierresAnio.value);
      cargarCierres();
    });
  }
  
  const cierrePrintBtn = document.getElementById('cierre-print-btn');
  if (cierrePrintBtn) {
    cierrePrintBtn.addEventListener('click', () => {
      console.log('🖨️ Imprimiendo cierre...');
      window.print();
    });
  }
  
  // ========== FORMS SUBMIT ==========
  setupFormHandlers();
  setupModalClosers();
});

// ========== FUNCIONES AUXILIARES ==========

function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'block';
    console.log('✓ Modal abierto:', modalId);
  } else {
    console.error('❌ Modal no encontrado:', modalId);
  }
}

function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    console.log('✓ Modal cerrado:', modalId);
  }
}

function resetCuotaForm() {
  const form = document.getElementById('cuota-form');
  if (form) {
    form.reset();
    document.getElementById('cuota-id').value = '';
    document.getElementById('cuota-modal-title').textContent = 'Nueva Cuota';
    
    // Fecha vencimiento por defecto (final del mes actual)
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    document.getElementById('cuota-vencimiento').value = lastDay.toISOString().split('T')[0];
  }
}

function resetGastoForm() {
  const form = document.getElementById('gasto-form');
  if (form) {
    form.reset();
    document.getElementById('gasto-id').value = '';
    document.getElementById('gasto-modal-title').textContent = 'Nuevo Gasto';
    
    // Fecha actual
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('gasto-fecha').value = today;
  }
}

async function verificarVencimientos() {
  try {
    const token = localStorage.getItem('edificio_token');
    const response = await fetch('/api/cuotas/verificar-vencimientos', {
      method: 'POST',
      headers: {
        'x-auth-token': token
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      alert(`Vencimientos verificados:\n${data.actualizadas} cuotas actualizadas`);
      // Recargar cuotas
      if (window.location.hash === '#cuotas') {
        location.reload();
      }
    } else {
      throw new Error('Error al verificar vencimientos');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al verificar vencimientos');
  }
}

function filtrarUsuarios() {
  console.log('🔄 Filtrando usuarios...');
  // Por ahora solo log, la funcionalidad real requiere backend
  alert('Filtros aplicados (funcionalidad en desarrollo)');
}

function filtrarCuotas() {
  console.log('🔄 Filtrando cuotas...');
  const mes = document.getElementById('cuotas-mes')?.value;
  const anio = document.getElementById('cuotas-año')?.value;
  const estado = document.getElementById('cuotas-estado')?.value;
  
  console.log('Filtros:', { mes, anio, estado });
  alert(`Filtros aplicados: ${mes || 'todos'} / ${anio || 'todos'} / ${estado || 'todos'}`);
}

function filtrarGastos() {
  console.log('🔄 Filtrando gastos...');
  const mes = document.getElementById('gastos-mes')?.value;
  const anio = document.getElementById('gastos-año')?.value;
  const categoria = document.getElementById('gastos-categoria')?.value;
  
  console.log('Filtros:', { mes, anio, categoria });
  alert(`Filtros aplicados: ${mes || 'todos'} / ${anio || 'todos'} / ${categoria || 'todas'}`);
}

function filtrarAnuncios() {
  console.log('🔄 Filtrando anuncios...');
  const tipo = document.getElementById('anuncios-tipo')?.value;
  console.log('Tipo:', tipo);
  alert(`Filtro aplicado: ${tipo || 'todos'}`);
}

function cargarCierres() {
  console.log('🔄 Cargando cierres...');
  const anio = document.getElementById('cierres-año')?.value;
  console.log('Año:', anio);
  alert(`Cargando cierres del año ${anio}`);
}

function setupFormHandlers() {
  // Form cuota
  const cuotaForm = document.getElementById('cuota-form');
  if (cuotaForm) {
    cuotaForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('💾 Guardando cuota...');
      
      const formData = {
        mes: document.getElementById('cuota-mes').value,
        anio: document.getElementById('cuota-año').value,
        monto: document.getElementById('cuota-monto').value,
        departamento: document.getElementById('cuota-departamento').value,
        fechaVencimiento: document.getElementById('cuota-vencimiento').value
      };
      
      console.log('Datos cuota:', formData);
      alert('Guardando cuota... (conectar con API)');
      hideModal('cuota-modal');
    });
  }
  
  // Form gasto
  const gastoForm = document.getElementById('gasto-form');
  if (gastoForm) {
    gastoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('💾 Guardando gasto...');
      
      const formData = {
        concepto: document.getElementById('gasto-concepto').value,
        monto: document.getElementById('gasto-monto').value,
        categoria: document.getElementById('gasto-categoria').value,
        proveedor: document.getElementById('gasto-proveedor').value,
        fecha: document.getElementById('gasto-fecha').value,
        fondo: document.getElementById('gasto-fondo').value,
        comprobante: document.getElementById('gasto-comprobante').value,
        notas: document.getElementById('gasto-notas').value
      };
      
      console.log('Datos gasto:', formData);
      alert('Guardando gasto... (conectar con API)');
      hideModal('gasto-modal');
    });
  }
  
  // Form validar pago
  const validarPagoForm = document.getElementById('validar-pago-form');
  if (validarPagoForm) {
    validarPagoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('💾 Validando pago...');
      
      const formData = {
        id: document.getElementById('validar-cuota-id').value,
        estado: document.getElementById('validar-estado').value,
        fechaPago: document.getElementById('validar-fecha-pago').value,
        comprobante: document.getElementById('validar-comprobante').value
      };
      
      console.log('Datos validación:', formData);
      alert('Validando pago... (conectar con API)');
      hideModal('validar-pago-modal');
    });
  }
}

function setupModalClosers() {
  // Botones cerrar (X)
  document.querySelectorAll('.modal .close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
      const modal = this.closest('.modal');
      if (modal) {
        modal.style.display = 'none';
      }
    });
  });
  
  // Botones cancelar
  document.querySelectorAll('.modal-cancel').forEach(cancelBtn => {
    cancelBtn.addEventListener('click', function() {
      const modal = this.closest('.modal');
      if (modal) {
        modal.style.display = 'none';
      }
    });
  });
  
  // Click fuera del modal
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
    }
  });
}
