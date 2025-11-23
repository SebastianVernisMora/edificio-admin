// Admin Buttons Handler - Funcionalidad completa para todos los botones
document.addEventListener('DOMContentLoaded', () => {
  console.log('🔧 Admin Buttons Handler cargado');
  
  // ========== USUARIOS ==========
  const nuevoUsuarioBtn = document.getElementById('nuevo-usuario-btn');
  if (nuevoUsuarioBtn) {
    nuevoUsuarioBtn.addEventListener('click', () => {
      console.log('👤 Nuevo Usuario');
      showNuevoUsuarioModal();
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
  
  // Cargar cuotas al inicio si estamos en la sección
  const cuotasSection = document.getElementById('cuotas-section');
  if (cuotasSection && cuotasSection.classList.contains('active')) {
    filtrarCuotas();
  }
  
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
  
  // ========== FONDOS ==========
  const transferirFondosBtn = document.getElementById('transferir-fondos-btn');
  if (transferirFondosBtn) {
    transferirFondosBtn.addEventListener('click', () => {
      console.log('💸 Transferir Fondos');
      showModal('transferir-modal');
    });
  }
  
  // ========== ANUNCIOS ==========
  const nuevoAnuncioBtn = document.getElementById('nuevo-anuncio-btn');
  if (nuevoAnuncioBtn) {
    nuevoAnuncioBtn.addEventListener('click', () => {
      console.log('📢 Nuevo Anuncio');
      showModal('anuncio-modal');
      resetAnuncioForm();
    });
  }
  
  // Filtros anuncios
  const anunciosTipo = document.getElementById('anuncios-tipo');
  if (anunciosTipo) {
    anunciosTipo.addEventListener('change', () => {
      console.log('🔍 Filtrando anuncios por tipo:', anunciosTipo.value);
      filtrarAnuncios();
    });
  }
  
  // ========== PARCIALIDADES ==========
  const nuevoPagoBtn = document.getElementById('nuevo-pago-btn');
  if (nuevoPagoBtn) {
    nuevoPagoBtn.addEventListener('click', () => {
      console.log('💰 Registrar Pago Parcialidad');
      showModal('parcialidad-modal');
      resetParcialidadForm();
    });
  }
  
  // ========== CIERRES ==========
  const cierreMensualBtn = document.getElementById('cierre-mensual-btn');
  if (cierreMensualBtn) {
    cierreMensualBtn.addEventListener('click', () => {
      console.log('📊 Cierre Mensual');
      showModal('cierre-mensual-modal');
      resetCierreMensualForm();
    });
  }
  
  const cierreAnualBtn = document.getElementById('cierre-anual-btn');
  if (cierreAnualBtn) {
    cierreAnualBtn.addEventListener('click', () => {
      console.log('📅 Cierre Anual');
      showModal('cierre-anual-modal');
      resetCierreAnualForm();
    });
  }
  
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
  
  // ========== EVENT DELEGATION ==========
  document.addEventListener('click', handleDynamicButtons);
});

function handleDynamicButtons(e) {
  const target = e.target.closest('button');
  if (!target) return;
  
  const action = target.dataset.action;
  const id = target.dataset.id;
  
  if (action === 'validar-cuota') {
    e.preventDefault();
    console.log('🎯 Click en validar cuota:', id);
    abrirModalValidarPago(id);
  }
  else if (action === 'editar-usuario') {
    e.preventDefault();
    console.log('✏️ Editar usuario:', id);
    editarUsuario(id);
  }
  else if (action === 'eliminar-usuario') {
    e.preventDefault();
    console.log('🗑️ Eliminar usuario:', id);
    eliminarUsuario(id);
  }
  else if (action === 'editar-gasto') {
    e.preventDefault();
    console.log('✏️ Editar gasto:', id);
    editarGasto(id);
  }
  else if (action === 'eliminar-gasto') {
    e.preventDefault();
    console.log('🗑️ Eliminar gasto:', id);
    eliminarGasto(id);
  }
  else if (action === 'editar-anuncio') {
    e.preventDefault();
    console.log('✏️ Editar anuncio:', id);
    editarAnuncio(id);
  }
  else if (action === 'eliminar-anuncio') {
    e.preventDefault();
    console.log('🗑️ Eliminar anuncio:', id);
    eliminarAnuncio(id);
  }
  else if (action === 'ver-detalle-cierre') {
    e.preventDefault();
    console.log('👁️ Ver detalle cierre:', id);
    verDetalleCierre(id);
  }
  else if (action === 'validar-parcialidad') {
    e.preventDefault();
    console.log('✅ Validar parcialidad:', id);
    validarParcialidad(id);
  }
  else if (action === 'rechazar-parcialidad') {
    e.preventDefault();
    console.log('❌ Rechazar parcialidad:', id);
    rechazarParcialidad(id);
  }
}

function abrirModalValidarPago(cuotaId) {
  console.log('📝 Abriendo modal validar pago para cuota:', cuotaId);
  
  const modal = document.getElementById('validar-pago-modal');
  if (!modal) {
    console.error('❌ Modal validar-pago-modal no encontrado');
    return;
  }
  
  // Guardar ID de cuota
  document.getElementById('validar-cuota-id').value = cuotaId;
  
  // Reset form con valores por defecto
  document.getElementById('validar-estado').value = 'PAGADO';
  document.getElementById('validar-fecha-pago').value = new Date().toISOString().split('T')[0];
  document.getElementById('validar-comprobante').value = '';
  
  modal.style.display = 'block';
  console.log('✓ Modal abierto');
}

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

function resetAnuncioForm() {
  const form = document.getElementById('anuncio-form');
  if (form) {
    form.reset();
    document.getElementById('anuncio-id').value = '';
    document.getElementById('anuncio-modal-title').textContent = 'Nuevo Anuncio';
  }
}

function resetCierreMensualForm() {
  const form = document.getElementById('cierre-mensual-form');
  if (form) {
    form.reset();
    const fecha = new Date();
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    document.getElementById('cierre-mes').value = meses[fecha.getMonth()];
    document.getElementById('cierre-año').value = fecha.getFullYear();
  }
}

function resetCierreAnualForm() {
  const form = document.getElementById('cierre-anual-form');
  if (form) {
    form.reset();
    document.getElementById('cierre-anual-año').value = new Date().getFullYear();
  }
}

async function resetParcialidadForm() {
  const form = document.getElementById('parcialidad-form');
  if (form) {
    form.reset();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('parcialidad-fecha').value = today;
    
    // Cargar departamentos
    await cargarDepartamentosSelect('parcialidad-departamento');
  }
}

async function cargarDepartamentosSelect(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;
  
  try {
    const token = localStorage.getItem('edificio_token');
    const response = await fetch('/api/usuarios', {
      headers: { 'x-auth-token': token }
    });
    
    if (response.ok) {
      const data = await response.json();
      const inquilinos = data.usuarios.filter(u => u.rol === 'INQUILINO' && u.departamento);
      
      // Limpiar opciones existentes excepto la primera
      select.innerHTML = '<option value="">Seleccionar...</option>';
      
      // Añadir departamentos
      inquilinos.forEach(inquilino => {
        const option = document.createElement('option');
        option.value = inquilino.departamento;
        option.textContent = `${inquilino.departamento} - ${inquilino.nombre}`;
        select.appendChild(option);
      });
      
      console.log(`✅ ${inquilinos.length} departamentos cargados`);
    }
  } catch (error) {
    console.error('Error cargando departamentos:', error);
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

async function showNuevoUsuarioModal() {
  const modalHTML = `
    <div id="usuario-modal" class="modal" style="display: block;">
      <div class="modal-content">
        <span class="close" onclick="document.getElementById('usuario-modal').remove()">&times;</span>
        <h2>Nuevo Usuario</h2>
        
        <form id="usuario-form">
          <div class="form-group">
            <label for="usuario-nombre">Nombre:</label>
            <input type="text" id="usuario-nombre" required>
          </div>
          
          <div class="form-group">
            <label for="usuario-email">Email:</label>
            <input type="email" id="usuario-email" required>
          </div>
          
          <div class="form-group">
            <label for="usuario-password">Contraseña:</label>
            <input type="password" id="usuario-password" required minlength="6">
          </div>
          
          <div class="form-group">
            <label for="usuario-rol">Rol:</label>
            <select id="usuario-rol" required>
              <option value="INQUILINO">Inquilino</option>
              <option value="ADMIN">Administrador</option>
              <option value="COMITE">Comité</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="usuario-departamento">Departamento:</label>
            <input type="text" id="usuario-departamento" placeholder="101-504" required>
          </div>
          
          <div class="form-group">
            <label for="usuario-telefono">Teléfono:</label>
            <input type="tel" id="usuario-telefono" placeholder="Opcional">
          </div>
          
          <div class="form-group">
            <button type="submit" class="btn btn-primary">Crear Usuario</button>
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('usuario-modal').remove()">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  const form = document.getElementById('usuario-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await crearNuevoUsuario(form);
  });
}

async function crearNuevoUsuario(form) {
  const formData = {
    nombre: document.getElementById('usuario-nombre').value,
    email: document.getElementById('usuario-email').value,
    password: document.getElementById('usuario-password').value,
    rol: document.getElementById('usuario-rol').value,
    departamento: document.getElementById('usuario-departamento').value,
    telefono: document.getElementById('usuario-telefono').value || null
  };
  
  try {
    const token = localStorage.getItem('edificio_token');
    const response = await fetch('/api/usuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      alert('Usuario creado exitosamente');
      document.getElementById('usuario-modal').remove();
      location.reload();
    } else {
      const error = await response.json();
      alert(`Error: ${error.msg || 'No se pudo crear el usuario'}`);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al crear usuario');
  }
}

async function filtrarUsuarios() {
  console.log('🔄 Filtrando usuarios...');
  
  const rol = document.getElementById('usuarios-rol')?.value;
  const estado = document.getElementById('usuarios-estado')?.value;
  
  try {
    const token = localStorage.getItem('edificio_token');
    let url = '/api/usuarios';
    const params = new URLSearchParams();
    
    if (rol && rol !== 'todos') params.append('rol', rol);
    if (estado && estado !== 'todos') params.append('estado', estado);
    
    if (params.toString()) url += '?' + params.toString();
    
    const response = await fetch(url, {
      headers: { 'x-auth-token': token }
    });
    
    if (response.ok) {
      const data = await response.json();
      renderUsuariosTable(data.usuarios);
    }
  } catch (error) {
    console.error('Error filtrando usuarios:', error);
  }
}

function renderUsuariosTable(usuarios) {
  const tbody = document.getElementById('usuarios-table-body');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (!usuarios || usuarios.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay usuarios</td></tr>';
    return;
  }
  
  usuarios.forEach(user => {
    const tr = document.createElement('tr');
    
    const estadoClass = user.estatus_validacion === 'validado' ? 'text-success' : 'text-warning';
    const editor = user.esEditor ? 'Sí' : 'No';
    
    tr.innerHTML = `
      <td>${user.nombre}</td>
      <td>${user.email}</td>
      <td>${user.departamento || '-'}</td>
      <td><span class="badge badge-${user.rol.toLowerCase()}">${user.rol}</span></td>
      <td>${editor}</td>
      <td class="${estadoClass}">${user.estatus_validacion}</td>
      <td>
        <button class="btn btn-sm btn-secondary" data-action="editar-usuario" data-id="${user.id}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger" data-action="eliminar-usuario" data-id="${user.id}">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    
    tbody.appendChild(tr);
  });
}

async function filtrarCuotas() {
  console.log('🔄 Filtrando cuotas...');
  
  const mes = document.getElementById('cuotas-mes')?.value;
  const anio = document.getElementById('cuotas-año')?.value;
  const estado = document.getElementById('cuotas-estado')?.value;
  
  try {
    const token = localStorage.getItem('edificio_token');
    let url = '/api/cuotas';
    const params = new URLSearchParams();
    
    if (mes) params.append('mes', mes);
    if (anio) params.append('anio', anio);
    if (estado && estado !== 'TODOS') params.append('estado', estado);
    
    if (params.toString()) url += '?' + params.toString();
    
    const response = await fetch(url, {
      headers: { 'x-auth-token': token }
    });
    
    if (response.ok) {
      const data = await response.json();
      renderCuotasTable(data.cuotas);
    }
  } catch (error) {
    console.error('Error filtrando cuotas:', error);
  }
}

function renderCuotasTable(cuotas) {
  const tbody = document.querySelector('#cuotas-table tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (!cuotas || cuotas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay cuotas</td></tr>';
    return;
  }
  
  cuotas.forEach(cuota => {
    const tr = document.createElement('tr');
    
    let estadoClass = '';
    if (cuota.estado === 'PAGADO') estadoClass = 'text-success';
    else if (cuota.estado === 'VENCIDO') estadoClass = 'text-danger';
    else estadoClass = 'text-warning';
    
    const vencimiento = new Date(cuota.fechaVencimiento).toLocaleDateString('es-MX');
    const fechaPago = cuota.fechaPago ? new Date(cuota.fechaPago).toLocaleDateString('es-MX') : '-';
    
    tr.innerHTML = `
      <td>${cuota.departamento}</td>
      <td>${cuota.mes} ${cuota.anio}</td>
      <td>$${cuota.monto.toLocaleString()}</td>
      <td class="${estadoClass}">${cuota.estado}</td>
      <td>${vencimiento}</td>
      <td>${fechaPago}</td>
      <td>
        <button class="btn btn-sm btn-primary" data-action="validar-cuota" data-id="${cuota.id}">
          Validar
        </button>
      </td>
    `;
    
    tbody.appendChild(tr);
  });
}

async function filtrarGastos() {
  console.log('🔄 Filtrando gastos...');
  
  const mes = document.getElementById('gastos-mes')?.value;
  const anio = document.getElementById('gastos-año')?.value;
  const categoria = document.getElementById('gastos-categoria')?.value;
  
  try {
    const token = localStorage.getItem('edificio_token');
    let url = '/api/gastos';
    const params = new URLSearchParams();
    
    if (mes) params.append('mes', mes);
    if (anio) params.append('anio', anio);
    if (categoria && categoria !== 'TODOS') params.append('categoria', categoria);
    
    if (params.toString()) url += '?' + params.toString();
    
    const response = await fetch(url, {
      headers: { 'x-auth-token': token }
    });
    
    if (response.ok) {
      const data = await response.json();
      renderGastosTable(data.gastos);
    }
  } catch (error) {
    console.error('Error filtrando gastos:', error);
  }
}

function renderGastosTable(gastos) {
  const tbody = document.querySelector('#gastos-table tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (!gastos || gastos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay gastos</td></tr>';
    return;
  }
  
  gastos.forEach(gasto => {
    const tr = document.createElement('tr');
    
    const fecha = new Date(gasto.fecha).toLocaleDateString('es-MX');
    
    tr.innerHTML = `
      <td>${fecha}</td>
      <td>${gasto.concepto}</td>
      <td>$${gasto.monto.toLocaleString()}</td>
      <td><span class="badge badge-${gasto.categoria.toLowerCase()}">${gasto.categoria}</span></td>
      <td>${gasto.proveedor || '-'}</td>
      <td>
        <button class="btn btn-sm btn-secondary" data-action="editar-gasto" data-id="${gasto.id}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger" data-action="eliminar-gasto" data-id="${gasto.id}">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    
    tbody.appendChild(tr);
  });
}

async function filtrarAnuncios() {
  console.log('🔄 Filtrando anuncios...');
  
  const tipo = document.getElementById('anuncios-tipo')?.value;
  console.log('Tipo seleccionado:', tipo);
  
  try {
    const token = localStorage.getItem('edificio_token');
    let url = '/api/anuncios';
    
    if (tipo && tipo !== 'TODOS') {
      url += '?tipo=' + tipo;
    }
    
    console.log('📡 URL:', url);
    
    const response = await fetch(url, {
      headers: { 'x-auth-token': token }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 Anuncios recibidos:', data.anuncios?.length, 'anuncios');
      console.log('📋 Tipos:', data.anuncios?.map(a => a.tipo));
      renderAnunciosContainer(data.anuncios);
    }
  } catch (error) {
    console.error('Error filtrando anuncios:', error);
  }
}

function renderAnunciosContainer(anuncios) {
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
    
    const fecha = new Date(anuncio.fechaPublicacion || anuncio.createdAt).toLocaleDateString('es-MX');
    
    div.innerHTML = `
      <div class="anuncio-header">
        <div>
          <h4>${anuncio.titulo}</h4>
          <span class="badge ${tipoClass}">${anuncio.tipo}</span>
        </div>
        <div class="anuncio-actions">
          <button class="btn btn-sm btn-secondary" data-action="editar-anuncio" data-id="${anuncio.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger" data-action="eliminar-anuncio" data-id="${anuncio.id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="anuncio-body">
        <p>${anuncio.contenido}</p>
        ${anuncio.imagen ? `
          <div class="anuncio-imagen">
            ${anuncio.imagen.endsWith('.pdf') ? 
              `<a href="${anuncio.imagen}" target="_blank" class="btn btn-sm btn-outline-primary">
                <i class="fas fa-file-pdf"></i> Ver PDF
              </a>` :
              `<img src="${anuncio.imagen}" alt="${anuncio.titulo}" style="max-width: 100%; margin-top: 10px; border-radius: 4px;">`
            }
          </div>
        ` : ''}
      </div>
      <div class="anuncio-footer">
        <small>Publicado: ${fecha}</small>
      </div>
    `;
    
    container.appendChild(div);
  });
}

async function cargarCierres() {
  console.log('🔄 Cargando cierres...');
  
  const anio = document.getElementById('cierres-año')?.value;
  
  try {
    const token = localStorage.getItem('edificio_token');
    let url = '/api/cierres';
    
    if (anio) {
      url += '?anio=' + anio;
    }
    
    const response = await fetch(url, {
      headers: { 'x-auth-token': token }
    });
    
    if (response.ok) {
      const data = await response.json();
      renderCierresTable(data.cierres);
    }
  } catch (error) {
    console.error('Error cargando cierres:', error);
  }
}

function renderCierresTable(cierres) {
  const tbodyMensual = document.querySelector('#cierres-table tbody');
  const tbodyAnual = document.querySelector('#cierres-anuales-table tbody');
  
  if (!cierres || cierres.length === 0) {
    if (tbodyMensual) tbodyMensual.innerHTML = '<tr><td colspan="6" class="text-center">No hay cierres mensuales</td></tr>';
    if (tbodyAnual) tbodyAnual.innerHTML = '<tr><td colspan="6" class="text-center">No hay cierres anuales</td></tr>';
    return;
  }
  
  // Separar cierres mensuales y anuales
  const cierresMensuales = cierres.filter(c => c.tipo !== 'ANUAL' && c.mes);
  const cierresAnuales = cierres.filter(c => c.tipo === 'ANUAL');
  
  // Renderizar cierres mensuales
  if (tbodyMensual) {
    tbodyMensual.innerHTML = '';
    
    if (cierresMensuales.length === 0) {
      tbodyMensual.innerHTML = '<tr><td colspan="6" class="text-center">No hay cierres mensuales</td></tr>';
    } else {
      cierresMensuales.forEach(cierre => {
        const tr = document.createElement('tr');
        
        const fechaCierre = new Date(cierre.fecha || cierre.createdAt).toLocaleDateString('es-MX');
        const ingresos = typeof cierre.ingresos === 'object' ? cierre.ingresos.total : cierre.ingresos || 0;
        const gastos = typeof cierre.gastos === 'object' ? cierre.gastos.total : cierre.gastos || 0;
        const balance = cierre.balance || (ingresos - gastos);
        const balanceClass = balance >= 0 ? 'text-success' : 'text-danger';
        
        tr.innerHTML = `
          <td>${cierre.mes} ${cierre.año || cierre.anio}</td>
          <td>$${ingresos.toLocaleString()}</td>
          <td>$${gastos.toLocaleString()}</td>
          <td class="${balanceClass}">$${balance.toLocaleString()}</td>
          <td>${fechaCierre}</td>
          <td>
            <button class="btn btn-sm btn-primary" data-action="ver-detalle-cierre" data-id="${cierre.id}">
              Ver Detalle
            </button>
          </td>
        `;
        
        tbodyMensual.appendChild(tr);
      });
    }
  }
  
  // Renderizar cierres anuales
  if (tbodyAnual) {
    tbodyAnual.innerHTML = '';
    
    if (cierresAnuales.length === 0) {
      tbodyAnual.innerHTML = '<tr><td colspan="6" class="text-center">No hay cierres anuales</td></tr>';
    } else {
      cierresAnuales.forEach(cierre => {
        const tr = document.createElement('tr');
        
        const fechaCierre = new Date(cierre.fecha || cierre.createdAt).toLocaleDateString('es-MX');
        const ingresos = typeof cierre.ingresos === 'object' ? cierre.ingresos.total : cierre.ingresos || 0;
        const gastos = typeof cierre.gastos === 'object' ? cierre.gastos.total : cierre.gastos || 0;
        const balance = cierre.balance || (ingresos - gastos);
        const balanceClass = balance >= 0 ? 'text-success' : 'text-danger';
        
        tr.innerHTML = `
          <td>${cierre.año || cierre.anio}</td>
          <td>$${ingresos.toLocaleString()}</td>
          <td>$${gastos.toLocaleString()}</td>
          <td class="${balanceClass}">$${balance.toLocaleString()}</td>
          <td>${fechaCierre}</td>
          <td>
            <button class="btn btn-sm btn-primary" data-action="ver-detalle-cierre" data-id="${cierre.id}">
              Ver Detalle
            </button>
          </td>
        `;
        
        tbodyAnual.appendChild(tr);
      });
    }
  }
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
        anio: parseInt(document.getElementById('cuota-año').value),
        monto: parseFloat(document.getElementById('cuota-monto').value),
        departamento: 'TODOS',
        fechaVencimiento: document.getElementById('cuota-vencimiento').value
      };
      
      console.log('Datos cuota:', formData);
      
      try {
        const token = localStorage.getItem('edificio_token');
        const response = await fetch('/api/cuotas/generar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          const data = await response.json();
          alert(`✅ Cuotas generadas: ${data.cuotasGeneradas || data.generadas || 0} cuotas creadas`);
          hideModal('cuota-modal');
          filtrarCuotas();
        } else {
          const error = await response.json();
          alert(`❌ Error: ${error.msg || error.message || 'No se pudieron generar las cuotas'}`);
        }
      } catch (error) {
        console.error('Error creando cuota:', error);
        alert('❌ Error al crear cuota: ' + error.message);
      }
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
        monto: parseFloat(document.getElementById('gasto-monto').value),
        categoria: document.getElementById('gasto-categoria').value,
        proveedor: document.getElementById('gasto-proveedor').value,
        fecha: document.getElementById('gasto-fecha').value,
        fondo: document.getElementById('gasto-fondo').value,
        comprobante: document.getElementById('gasto-comprobante').value,
        notas: document.getElementById('gasto-notas').value
      };
      
      console.log('Datos gasto:', formData);
      
      try {
        const token = localStorage.getItem('edificio_token');
        const response = await fetch('/api/gastos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          const data = await response.json();
          alert('✅ Gasto creado exitosamente');
          hideModal('gasto-modal');
          filtrarGastos();
        } else {
          const error = await response.json();
          alert(`❌ Error: ${error.msg || 'No se pudo crear el gasto'}`);
        }
      } catch (error) {
        console.error('Error creando gasto:', error);
        alert('❌ Error al crear gasto');
      }
    });
  }
  
  // Form validar pago
  const validarPagoForm = document.getElementById('validar-pago-form');
  if (validarPagoForm) {
    validarPagoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('💾 Validando pago...');
      
      const cuotaId = document.getElementById('validar-cuota-id').value;
      const formData = {
        estado: document.getElementById('validar-estado').value,
        fechaPago: document.getElementById('validar-fecha-pago').value,
        comprobante: document.getElementById('validar-comprobante').value
      };
      
      console.log('Datos validación:', formData);
      
      try {
        const token = localStorage.getItem('edificio_token');
        const response = await fetch(`/api/cuotas/${cuotaId}/estado`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          alert('✅ Pago validado exitosamente');
          hideModal('validar-pago-modal');
          filtrarCuotas();
        } else {
          const error = await response.json();
          alert(`❌ Error: ${error.msg || 'No se pudo validar el pago'}`);
        }
      } catch (error) {
        console.error('Error validando pago:', error);
        alert('❌ Error al validar pago');
      }
    });
  }
  
  // Form transferir fondos
  const transferirForm = document.getElementById('transferir-form');
  if (transferirForm) {
    transferirForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('💾 Transfiriendo fondos...');
      
      const formData = {
        origen: document.getElementById('transferir-origen').value,
        destino: document.getElementById('transferir-destino').value,
        monto: parseFloat(document.getElementById('transferir-monto').value)
      };
      
      console.log('📤 Datos transferencia:', formData);
      
      // Validaciones
      if (formData.origen === formData.destino) {
        alert('❌ El fondo origen y destino no pueden ser el mismo');
        return;
      }
      
      if (formData.monto <= 0) {
        alert('❌ El monto debe ser mayor a 0');
        return;
      }
      
      try {
        const token = localStorage.getItem('edificio_token');
        const response = await fetch('/api/fondos/transferencia', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify(formData)
        });
        
        console.log('📡 Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Transferencia exitosa:', data);
          alert('✅ Transferencia realizada exitosamente');
          hideModal('transferir-modal');
          
          // Actualizar valores en el DOM directamente
          if (data.fondos) {
            const elemAhorro = document.getElementById('ahorro-acumulado');
            const elemGastosMayores = document.getElementById('gastos-mayores');
            const elemDineroOp = document.getElementById('dinero-operacional');
            const elemPatrimonio = document.getElementById('patrimonio-total-fondos');
            
            if (elemAhorro) elemAhorro.textContent = `$${(data.fondos.ahorroAcumulado || 0).toLocaleString()}`;
            if (elemGastosMayores) elemGastosMayores.textContent = `$${(data.fondos.gastosMayores || 0).toLocaleString()}`;
            if (elemDineroOp) elemDineroOp.textContent = `$${(data.fondos.dineroOperacional || 0).toLocaleString()}`;
            if (elemPatrimonio) elemPatrimonio.textContent = `$${(data.fondos.patrimonioTotal || 0).toLocaleString()}`;
            
            console.log('✅ Fondos actualizados en UI');
          }
          
          // Recargar movimientos
          cargarMovimientosFondos();
        } else {
          const error = await response.json();
          console.error('❌ Error del servidor:', error);
          alert(`❌ Error: ${error.msg || 'No se pudo realizar la transferencia'}`);
        }
      } catch (error) {
        console.error('❌ Exception:', error);
        alert('❌ Error al transferir fondos: ' + error.message);
      }
    });
  }
  
  // Form anuncio
  const anuncioForm = document.getElementById('anuncio-form');
  if (anuncioForm) {
    anuncioForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('💾 Guardando anuncio...');
      
      const anuncioId = document.getElementById('anuncio-id').value;
      const imagenFile = document.getElementById('anuncio-imagen').files[0];
      
      try {
        const token = localStorage.getItem('edificio_token');
        let imagenUrl = null;
        
        // Si hay imagen, subirla primero
        if (imagenFile) {
          console.log('📤 Subiendo archivo:', imagenFile.name);
          
          const uploadFormData = new FormData();
          uploadFormData.append('imagen', imagenFile);
          
          const uploadResponse = await fetch('/api/anuncios/upload', {
            method: 'POST',
            headers: {
              'x-auth-token': token
            },
            body: uploadFormData
          });
          
          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            imagenUrl = uploadData.url || uploadData.filename;
            console.log('✅ Archivo subido:', imagenUrl);
          } else {
            const error = await uploadResponse.json();
            alert(`⚠️ Error al subir archivo: ${error.msg}. El anuncio se creará sin imagen.`);
          }
        }
        
        // Crear/actualizar anuncio
        const anuncioData = {
          titulo: document.getElementById('anuncio-titulo').value,
          tipo: document.getElementById('anuncio-tipo').value,
          contenido: document.getElementById('anuncio-contenido').value,
          imagen: imagenUrl
        };
        
        console.log('📝 Datos anuncio a enviar:', anuncioData);
        console.log('🖼️ URL de imagen:', imagenUrl);
        
        const url = anuncioId ? `/api/anuncios/${anuncioId}` : '/api/anuncios';
        const method = anuncioId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify(anuncioData)
        });
        
        if (response.ok) {
          alert(`✅ Anuncio ${anuncioId ? 'actualizado' : 'creado'} exitosamente${imagenUrl ? ' con archivo adjunto' : ''}`);
          hideModal('anuncio-modal');
          filtrarAnuncios();
        } else {
          const error = await response.json();
          alert(`❌ Error: ${error.msg || 'No se pudo guardar el anuncio'}`);
        }
      } catch (error) {
        console.error('Error guardando anuncio:', error);
        alert('❌ Error al guardar anuncio');
      }
    });
  }
  
  // Form cierre mensual
  const cierreMensualForm = document.getElementById('cierre-mensual-form');
  if (cierreMensualForm) {
    cierreMensualForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('💾 Generando cierre mensual...');
      
      const formData = {
        mes: document.getElementById('cierre-mes').value,
        año: parseInt(document.getElementById('cierre-año').value)
      };
      
      console.log('Datos cierre mensual:', formData);
      
      if (!confirm(`¿Generar cierre mensual para ${formData.mes} ${formData.anio}?`)) {
        return;
      }
      
      try {
        const token = localStorage.getItem('edificio_token');
        const response = await fetch('/api/cierres/mensual', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          const data = await response.json();
          alert('✅ Cierre mensual generado exitosamente');
          hideModal('cierre-mensual-modal');
          cargarCierres();
        } else {
          const error = await response.json();
          alert(`❌ Error: ${error.msg || 'No se pudo generar el cierre'}`);
        }
      } catch (error) {
        console.error('Error generando cierre:', error);
        alert('❌ Error al generar cierre mensual');
      }
    });
  }
  
  // Form cierre anual
  const cierreAnualForm = document.getElementById('cierre-anual-form');
  if (cierreAnualForm) {
    cierreAnualForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('💾 Generando cierre anual...');
      
      const año = parseInt(document.getElementById('cierre-anual-año').value);
      
      console.log('Año cierre anual:', año);
      
      if (!confirm(`¿Generar cierre anual para ${año}? Esta acción requiere que todos los cierres mensuales estén completos.`)) {
        return;
      }
      
      try {
        const token = localStorage.getItem('edificio_token');
        const response = await fetch('/api/cierres/anual', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify({ año })
        });
        
        if (response.ok) {
          const data = await response.json();
          alert('✅ Cierre anual generado exitosamente');
          hideModal('cierre-anual-modal');
          cargarCierres();
        } else {
          const error = await response.json();
          alert(`❌ Error: ${error.msg || 'No se pudo generar el cierre anual'}`);
        }
      } catch (error) {
        console.error('Error generando cierre anual:', error);
        alert('❌ Error al generar cierre anual');
      }
    });
  }
  
  // Form parcialidad
  const parcialidadForm = document.getElementById('parcialidad-form');
  if (parcialidadForm) {
    parcialidadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('💾 Registrando pago parcialidad...');
      
      const formData = {
        departamento: document.getElementById('parcialidad-departamento').value,
        monto: parseFloat(document.getElementById('parcialidad-monto').value),
        fecha: document.getElementById('parcialidad-fecha').value,
        comprobante: document.getElementById('parcialidad-comprobante').value,
        notas: document.getElementById('parcialidad-notas').value
      };
      
      console.log('Datos parcialidad:', formData);
      
      try {
        const token = localStorage.getItem('edificio_token');
        const response = await fetch('/api/parcialidades', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          alert('✅ Pago de parcialidad registrado exitosamente');
          hideModal('parcialidad-modal');
          cargarParcialidades();
        } else {
          const error = await response.json();
          alert(`❌ Error: ${error.msg || 'No se pudo registrar el pago'}`);
        }
      } catch (error) {
        console.error('Error registrando pago:', error);
        alert('❌ Error al registrar pago');
      }
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

async function editarUsuario(userId) {
  console.log('✏️ Editando usuario:', userId);
  
  try {
    const token = localStorage.getItem('edificio_token');
    const response = await fetch('/api/usuarios', {
      headers: { 'x-auth-token': token }
    });
    
    if (!response.ok) {
      alert('Error al cargar usuarios');
      return;
    }
    
    const data = await response.json();
    const user = data.usuarios.find(u => u.id === parseInt(userId));
    
    if (!user) {
      alert('Usuario no encontrado');
      return;
    }
    
    // Crear modal de edición
    const modalHTML = `
      <div id="editar-usuario-modal" class="modal" style="display: block;">
        <div class="modal-content">
          <span class="close" onclick="document.getElementById('editar-usuario-modal').remove()">&times;</span>
          <h2>Editar Usuario</h2>
          
          <form id="editar-usuario-form">
            <input type="hidden" id="editar-usuario-id" value="${user.id}">
            
            <div class="form-group">
              <label for="editar-usuario-nombre">Nombre:</label>
              <input type="text" id="editar-usuario-nombre" value="${user.nombre}" required>
            </div>
            
            <div class="form-group">
              <label for="editar-usuario-email">Email:</label>
              <input type="email" id="editar-usuario-email" value="${user.email}" required>
            </div>
            
            <div class="form-group">
              <label for="editar-usuario-rol">Rol:</label>
              <select id="editar-usuario-rol" required>
                <option value="INQUILINO" ${user.rol === 'INQUILINO' ? 'selected' : ''}>Inquilino</option>
                <option value="ADMIN" ${user.rol === 'ADMIN' ? 'selected' : ''}>Administrador</option>
                <option value="COMITE" ${user.rol === 'COMITE' ? 'selected' : ''}>Comité</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="editar-usuario-departamento">Departamento:</label>
              <input type="text" id="editar-usuario-departamento" value="${user.departamento || ''}" required>
            </div>
            
            <div class="form-group">
              <label for="editar-usuario-telefono">Teléfono:</label>
              <input type="tel" id="editar-usuario-telefono" value="${user.telefono || ''}">
            </div>
            
            <div class="form-group">
              <label for="editar-usuario-estatus">Estado de Validación:</label>
              <select id="editar-usuario-estatus" required>
                <option value="pendiente" ${user.estatus_validacion === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                <option value="validado" ${user.estatus_validacion === 'validado' ? 'selected' : ''}>Validado</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>
                <input type="checkbox" id="editar-usuario-editor" ${user.esEditor ? 'checked' : ''}>
                Es Editor
              </label>
            </div>
            
            <div class="form-group">
              <button type="submit" class="btn btn-primary">Actualizar Usuario</button>
              <button type="button" class="btn btn-secondary" onclick="document.getElementById('editar-usuario-modal').remove()">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const form = document.getElementById('editar-usuario-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await actualizarUsuario(userId);
    });
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar datos del usuario');
  }
}

async function actualizarUsuario(userId) {
  const formData = {
    nombre: document.getElementById('editar-usuario-nombre').value,
    email: document.getElementById('editar-usuario-email').value,
    rol: document.getElementById('editar-usuario-rol').value,
    departamento: document.getElementById('editar-usuario-departamento').value,
    telefono: document.getElementById('editar-usuario-telefono').value || null,
    estatus_validacion: document.getElementById('editar-usuario-estatus').value,
    esEditor: document.getElementById('editar-usuario-editor').checked
  };
  
  try {
    const token = localStorage.getItem('edificio_token');
    const response = await fetch(`/api/usuarios/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      alert('✅ Usuario actualizado exitosamente');
      document.getElementById('editar-usuario-modal').remove();
      filtrarUsuarios();
    } else {
      const error = await response.json();
      alert(`❌ Error: ${error.msg || 'No se pudo actualizar el usuario'}`);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al actualizar usuario');
  }
}

async function eliminarUsuario(userId) {
  if (!confirm('¿Está seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
    return;
  }
  
  try {
    const token = localStorage.getItem('edificio_token');
    const response = await fetch(`/api/usuarios/${userId}`, {
      method: 'DELETE',
      headers: {
        'x-auth-token': token
      }
    });
    
    if (response.ok) {
      alert('✅ Usuario eliminado exitosamente');
      filtrarUsuarios();
    } else {
      const error = await response.json();
      alert(`❌ Error: ${error.msg || 'No se pudo eliminar el usuario'}`);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al eliminar usuario');
  }
}

async function cargarFondos() {
  console.log('💰 Cargando fondos...');
  
  try {
    const token = localStorage.getItem('edificio_token');
    const response = await fetch('/api/fondos', {
      headers: { 'x-auth-token': token }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 Fondos recibidos:', data.fondos);
      
      const fondos = data.fondos;
      
      // Actualizar las 4 tarjetas
      const elemAhorro = document.getElementById('ahorro-acumulado');
      const elemGastosMayores = document.getElementById('gastos-mayores');
      const elemDineroOp = document.getElementById('dinero-operacional');
      const elemPatrimonio = document.getElementById('patrimonio-total-fondos');
      
      if (elemAhorro) elemAhorro.textContent = `$${(fondos.ahorroAcumulado || 0).toLocaleString()}`;
      if (elemGastosMayores) elemGastosMayores.textContent = `$${(fondos.gastosMayores || 0).toLocaleString()}`;
      if (elemDineroOp) elemDineroOp.textContent = `$${(fondos.dineroOperacional || 0).toLocaleString()}`;
      if (elemPatrimonio) elemPatrimonio.textContent = `$${(fondos.patrimonioTotal || 0).toLocaleString()}`;
      
      console.log('✅ Fondos actualizados en tarjetas');
    }
  } catch (error) {
    console.error('Error cargando fondos:', error);
  }
}

async function cargarMovimientosFondos() {
  console.log('📋 Cargando movimientos de fondos...');
  
  try {
    const token = localStorage.getItem('edificio_token');
    const response = await fetch('/api/fondos', {
      headers: { 'x-auth-token': token }
    });
    
    if (response.ok) {
      const data = await response.json();
      renderMovimientosTable(data.movimientos || []);
    }
  } catch (error) {
    console.error('Error cargando movimientos:', error);
  }
}

function renderMovimientosTable(movimientos) {
  const tbody = document.querySelector('#movimientos-table tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (!movimientos || movimientos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay movimientos registrados</td></tr>';
    return;
  }
  
  // Últimos 20 movimientos más recientes
  const recientes = movimientos.slice(-20).reverse();
  
  recientes.forEach(mov => {
    const tr = document.createElement('tr');
    
    const fecha = new Date(mov.fecha).toLocaleDateString('es-MX');
    const tipoClass = mov.tipo === 'ingreso' ? 'text-success' : mov.tipo === 'egreso' ? 'text-danger' : '';
    
    tr.innerHTML = `
      <td>${fecha}</td>
      <td class="${tipoClass}">${(mov.tipo || 'transferencia').toUpperCase()}</td>
      <td>${formatFondoName(mov.origen)}</td>
      <td>${formatFondoName(mov.destino)}</td>
      <td>$${mov.monto.toLocaleString()}</td>
      <td>${mov.descripcion || '-'}</td>
    `;
    
    tbody.appendChild(tr);
  });
  
  console.log(`✅ ${recientes.length} movimientos renderizados`);
}

function formatFondoName(fondo) {
  const nombres = {
    'ahorroAcumulado': 'Ahorro Acumulado',
    'gastosMayores': 'Gastos Mayores',
    'dineroOperacional': 'Dinero Operacional'
  };
  return nombres[fondo] || fondo || '-';
}

async function cargarDashboard() {
  console.log('📊 Cargando dashboard...');
  
  try {
    const token = localStorage.getItem('edificio_token');
    
    // Cargar datos en paralelo
    const [fondosRes, cuotasRes, gastosRes, anunciosRes] = await Promise.all([
      fetch('/api/fondos', { headers: { 'x-auth-token': token } }),
      fetch('/api/cuotas', { headers: { 'x-auth-token': token } }),
      fetch('/api/gastos', { headers: { 'x-auth-token': token } }),
      fetch('/api/anuncios?limit=5', { headers: { 'x-auth-token': token } })
    ]);
    
    // Procesar fondos
    if (fondosRes.ok) {
      const fondosData = await fondosRes.json();
      console.log('💰 Fondos data:', fondosData);
      const fondos = fondosData.fondos;
      const patrimonioTotal = fondos.patrimonioTotal || 
        (fondos.ahorroAcumulado + fondos.gastosMayores + fondos.dineroOperacional);
      
      console.log('💵 Patrimonio total calculado:', patrimonioTotal);
      
      const elemPatrimonio = document.getElementById('patrimonio-total');
      console.log('🎯 Elemento patrimonio-total:', elemPatrimonio);
      
      if (elemPatrimonio) {
        elemPatrimonio.textContent = `$${patrimonioTotal.toLocaleString()}`;
        console.log('✅ Patrimonio actualizado en DOM');
      } else {
        console.error('❌ Elemento patrimonio-total no encontrado');
      }
      
      // Gráfico de distribución de fondos con datos actualizados
      renderFondosChart(fondos);
      
      // También actualizar el patrimonio en fondos si existe
      const elemPatrimonioFondos = document.getElementById('patrimonio-total-fondos');
      if (elemPatrimonioFondos) {
        elemPatrimonioFondos.textContent = `$${patrimonioTotal.toLocaleString()}`;
      }
    }
    
    // Procesar cuotas
    if (cuotasRes.ok) {
      const cuotasData = await cuotasRes.json();
      const cuotas = cuotasData.cuotas || [];
      console.log('📋 Total cuotas:', cuotas.length);
      
      // Contar cuotas pendientes del mes actual
      const fecha = new Date();
      const mesActual = fecha.toLocaleString('es-MX', { month: 'long' });
      const anioActual = fecha.getFullYear();
      
      console.log('📅 Mes actual:', mesActual, anioActual);
      
      const cuotasPendientes = cuotas.filter(c => 
        c.estado === 'PENDIENTE' && 
        c.mes.toLowerCase() === mesActual.toLowerCase() && 
        c.anio === anioActual
      ).length;
      
      console.log('⏳ Cuotas pendientes:', cuotasPendientes);
      
      const elemCuotasPendientes = document.getElementById('cuotas-pendientes');
      console.log('🎯 Elemento cuotas-pendientes:', elemCuotasPendientes);
      
      if (elemCuotasPendientes) {
        elemCuotasPendientes.textContent = cuotasPendientes;
        console.log('✅ Cuotas pendientes actualizado en DOM');
      } else {
        console.error('❌ Elemento cuotas-pendientes no encontrado');
      }
      
      // Gráfico de estado de cuotas
      renderCuotasChart(cuotas);
    }
    
    // Procesar gastos del mes
    if (gastosRes.ok) {
      const gastosData = await gastosRes.json();
      const gastos = gastosData.gastos || [];
      
      // Gastos del mes actual
      const fecha = new Date();
      const gastosMes = gastos.filter(g => {
        const fechaGasto = new Date(g.fecha);
        return fechaGasto.getMonth() === fecha.getMonth() && 
               fechaGasto.getFullYear() === fecha.getFullYear();
      });
      
      const totalGastosMes = gastosMes.reduce((sum, g) => sum + g.monto, 0);
      
      const elemGastosMes = document.getElementById('gastos-mes');
      if (elemGastosMes) {
        elemGastosMes.textContent = `$${totalGastosMes.toLocaleString()}`;
      }
      
      // Últimos gastos
      const recentGastos = document.getElementById('recent-gastos');
      if (recentGastos) {
        const ultimos = gastos.slice(-5).reverse();
        recentGastos.innerHTML = ultimos.map(g => `
          <div class="recent-item">
            <span>${g.concepto}</span>
            <span class="amount">$${g.monto.toLocaleString()}</span>
          </div>
        `).join('');
      }
    }
    
    // Procesar anuncios
    if (anunciosRes.ok) {
      const anunciosData = await anunciosRes.json();
      const anuncios = anunciosData.anuncios || [];
      
      const recentAnuncios = document.getElementById('recent-anuncios');
      if (recentAnuncios) {
        recentAnuncios.innerHTML = anuncios.slice(0, 5).map(a => `
          <div class="recent-item">
            <span>${a.titulo}</span>
            <span class="badge badge-${a.tipo?.toLowerCase() || 'secondary'}">${a.tipo || 'GENERAL'}</span>
          </div>
        `).join('');
      }
    }
    
    console.log('✅ Dashboard cargado');
    
  } catch (error) {
    console.error('Error cargando dashboard:', error);
  }
}

async function editarAnuncio(anuncioId) {
  console.log('✏️ Editando anuncio:', anuncioId);
  
  try {
    const token = localStorage.getItem('edificio_token');
    const response = await fetch('/api/anuncios', {
      headers: { 'x-auth-token': token }
    });
    
    if (!response.ok) {
      alert('Error al cargar anuncios');
      return;
    }
    
    const data = await response.json();
    const anuncio = data.anuncios?.find(a => a.id === parseInt(anuncioId));
    
    if (!anuncio) {
      alert('Anuncio no encontrado');
      return;
    }
    
    // Llenar form del modal existente
    document.getElementById('anuncio-id').value = anuncio.id;
    document.getElementById('anuncio-titulo').value = anuncio.titulo;
    document.getElementById('anuncio-tipo').value = anuncio.tipo;
    document.getElementById('anuncio-contenido').value = anuncio.contenido;
    document.getElementById('anuncio-modal-title').textContent = 'Editar Anuncio';
    
    showModal('anuncio-modal');
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar datos del anuncio');
  }
}

async function eliminarAnuncio(anuncioId) {
  if (!confirm('¿Está seguro de eliminar este anuncio?')) {
    return;
  }
  
  try {
    const token = localStorage.getItem('edificio_token');
    const response = await fetch(`/api/anuncios/${anuncioId}`, {
      method: 'DELETE',
      headers: {
        'x-auth-token': token
      }
    });
    
    if (response.ok) {
      alert('✅ Anuncio eliminado exitosamente');
      filtrarAnuncios();
    } else {
      const error = await response.json();
      alert(`❌ Error: ${error.msg || 'No se pudo eliminar el anuncio'}`);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al eliminar anuncio');
  }
}

async function cargarParcialidades() {
  console.log('📋 Cargando parcialidades...');
  
  try {
    const token = localStorage.getItem('edificio_token');
    
    // Cargar pagos
    const responsePagos = await fetch('/api/parcialidades/pagos', {
      headers: { 'x-auth-token': token }
    });
    
    if (responsePagos.ok) {
      const data = await responsePagos.json();
      renderParcialidadesTable(data.pagos || []);
    }
    
    // Cargar estado de pagos
    const responseEstado = await fetch('/api/parcialidades/estado', {
      headers: { 'x-auth-token': token }
    });
    
    console.log('📡 Estado response status:', responseEstado.status);
    
    if (responseEstado.ok) {
      const estado = await responseEstado.json();
      console.log('📊 Estado recibido:', estado);
      renderProgresoParcialidades(estado);
    } else {
      console.error('❌ Error al cargar estado:', responseEstado.status);
    }
    
  } catch (error) {
    console.error('Error cargando parcialidades:', error);
  }
}

function renderParcialidadesTable(pagos) {
  const tbody = document.querySelector('#parcialidades-table tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (!pagos || pagos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay pagos registrados</td></tr>';
    return;
  }
  
  pagos.forEach(pago => {
    const tr = document.createElement('tr');
    
    const fecha = new Date(pago.fecha).toLocaleDateString('es-MX');
    const estadoClass = pago.estado === 'validado' ? 'text-success' : 'text-warning';
    const estadoTexto = pago.estado === 'validado' ? 'Validado' : 'Pendiente';
    
    tr.innerHTML = `
      <td>${fecha}</td>
      <td>${pago.departamento}</td>
      <td>$${pago.monto.toLocaleString()}</td>
      <td>${pago.comprobante || '-'}</td>
      <td class="${estadoClass}">${estadoTexto}</td>
      <td>
        ${pago.estado !== 'validado' ? `
          <button class="btn btn-sm btn-success" data-action="validar-parcialidad" data-id="${pago.id}">
            <i class="fas fa-check"></i> Validar
          </button>
        ` : `
          <button class="btn btn-sm btn-secondary" data-action="rechazar-parcialidad" data-id="${pago.id}">
            <i class="fas fa-times"></i> Rechazar
          </button>
        `}
      </td>
    `;
    
    tbody.appendChild(tr);
  });
  
  console.log(`✅ ${pagos.length} pagos de parcialidades renderizados`);
}

function renderProgresoParcialidades(data) {
  const container = document.getElementById('parcialidades-progress-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  const estadoPagos = data.estadoPagos || data;
  
  console.log('📊 Procesando estado pagos:', estadoPagos);
  
  if (!estadoPagos || estadoPagos.length === 0) {
    container.innerHTML = '<p class="text-center">No hay datos de progreso</p>';
    return;
  }
  
  const objetivoPorDepto = 14250; // $285,000 / 20 departamentos
  
  // estadoPagos es un array con objetos {departamento, pagado, porcentaje}
  estadoPagos.forEach(item => {
    const monto = item.pagado || 0;
    const porcentaje = item.porcentaje || Math.min((monto / objetivoPorDepto) * 100, 100);
    const faltante = Math.max(objetivoPorDepto - monto, 0);
    
    console.log(`Depto ${item.departamento}: $${monto} (${porcentaje.toFixed(1)}%)`);
    
    const div = document.createElement('div');
    div.className = 'progress-item';
    div.style.marginBottom = '15px';
    div.innerHTML = `
      <div class="progress-header" style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <span><strong>Depto ${item.departamento}</strong></span>
        <span>${porcentaje.toFixed(1)}% ($${monto.toLocaleString()} / $${objetivoPorDepto.toLocaleString()})</span>
      </div>
      <div class="progress-bar-container" style="width: 100%; height: 25px; background-color: #e9ecef; border-radius: 4px; overflow: hidden;">
        <div class="progress-bar" style="width: ${porcentaje}%; height: 100%; background-color: ${porcentaje >= 100 ? '#28a745' : porcentaje >= 50 ? '#ffc107' : '#dc3545'}; transition: width 0.3s;">
        </div>
      </div>
      <div class="progress-footer" style="text-align: right; margin-top: 3px;">
        <small>Faltante: $${faltante.toLocaleString()}</small>
      </div>
    `;
    
    container.appendChild(div);
  });
  
  console.log(`✅ Progreso de ${estadoPagos.length} departamentos renderizado`);
}

// Variables globales para los charts
let fondosChartInstance = null;
let cuotasChartInstance = null;

function renderFondosChart(fondos) {
  const container = document.getElementById('fondos-chart');
  if (!container) {
    console.log('⚠️ Container fondos-chart no encontrado');
    return;
  }
  
  // Crear canvas si no existe
  let canvas = container.querySelector('canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    container.innerHTML = '';
    container.appendChild(canvas);
  }
  
  // Destruir chart anterior si existe
  if (fondosChartInstance) {
    fondosChartInstance.destroy();
  }
  
  const ctx = canvas.getContext('2d');
  
  fondosChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Ahorro Acumulado', 'Gastos Mayores', 'Dinero Operacional'],
      datasets: [{
        data: [
          fondos.ahorroAcumulado || 0,
          fondos.gastosMayores || 0,
          fondos.dineroOperacional || 0
        ],
        backgroundColor: [
          '#28a745',
          '#ffc107',
          '#007bff'
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
  
  console.log('✅ Gráfico de fondos renderizado');
}

function renderCuotasChart(cuotas) {
  const container = document.getElementById('cuotas-chart');
  if (!container) {
    console.log('⚠️ Container cuotas-chart no encontrado');
    return;
  }
  
  // Crear canvas si no existe
  let canvas = container.querySelector('canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    container.innerHTML = '';
    container.appendChild(canvas);
  }
  
  // Destruir chart anterior si existe
  if (cuotasChartInstance) {
    cuotasChartInstance.destroy();
  }
  
  // Contar cuotas por estado
  const pagadas = cuotas.filter(c => c.estado === 'PAGADO').length;
  const pendientes = cuotas.filter(c => c.estado === 'PENDIENTE').length;
  const vencidas = cuotas.filter(c => c.estado === 'VENCIDO').length;
  
  const ctx = canvas.getContext('2d');
  
  cuotasChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Pagadas', 'Pendientes', 'Vencidas'],
      datasets: [{
        data: [pagadas, pendientes, vencidas],
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
  
  console.log('✅ Gráfico de cuotas renderizado');
}

async function validarParcialidad(pagoId) {
  if (!confirm('¿Validar este pago de parcialidad? Se actualizará el fondo de Ahorro Acumulado.')) {
    return;
  }
  
  try {
    const token = localStorage.getItem('edificio_token');
    const response = await fetch(`/api/parcialidades/pagos/${pagoId}/validar`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({ estado: 'validado' })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Pago validado:', result);
      
      // Recargar parcialidades
      await cargarParcialidades();
      
      // Recargar fondos para ver el cambio
      console.log('🔄 Recargando fondos...');
      await cargarFondos();
      
      alert('✅ Pago validado exitosamente. Ahorro Acumulado actualizado.');
    } else {
      const error = await response.json();
      alert(`❌ Error: ${error.msg || 'No se pudo validar el pago'}`);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al validar pago');
  }
}

async function rechazarParcialidad(pagoId) {
  if (!confirm('¿Rechazar este pago de parcialidad? Se revertirá el monto del Ahorro Acumulado.')) {
    return;
  }
  
  try {
    const token = localStorage.getItem('edificio_token');
    const response = await fetch(`/api/parcialidades/pagos/${pagoId}/validar`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({ estado: 'pendiente' })
    });
    
    if (response.ok) {
      alert('✅ Pago rechazado. Ahorro Acumulado actualizado.');
      
      // Recargar parcialidades
      cargarParcialidades();
      
      // Recargar fondos para ver el cambio
      if (typeof cargarFondos === 'function') {
        await cargarFondos();
      }
    } else {
      const error = await response.json();
      alert(`❌ Error: ${error.msg || 'No se pudo rechazar el pago'}`);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al rechazar pago');
  }
}

async function verDetalleCierre(cierreId) {
  console.log('👁️ Viendo detalle de cierre:', cierreId);
  
  try {
    const token = localStorage.getItem('edificio_token');
    const response = await fetch('/api/cierres', {
      headers: { 'x-auth-token': token }
    });
    
    if (!response.ok) {
      alert('Error al cargar cierres');
      return;
    }
    
    const data = await response.json();
    const cierre = data.cierres?.find(c => c.id === cierreId || c.id === parseInt(cierreId));
    
    if (!cierre) {
      alert('Cierre no encontrado');
      return;
    }
    
    // Formatear detalle del cierre
    const ingresos = typeof cierre.ingresos === 'object' ? cierre.ingresos.total : cierre.ingresos || 0;
    const gastos = typeof cierre.gastos === 'object' ? cierre.gastos.total : cierre.gastos || 0;
    const balance = cierre.balance || (ingresos - gastos);
    const fecha = new Date(cierre.fecha || cierre.createdAt).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const detalle = `
      <div class="cierre-detalle printable-cierre">
        <div class="cierre-header">
          <h2>Edificio 205 - Administración de Condominio</h2>
          <h3>${cierre.tipo === 'ANUAL' ? `Cierre Contable Anual ${cierre.año}` : `Cierre Contable ${cierre.mes} ${cierre.año}`}</h3>
          <p class="fecha-impresion">Fecha de cierre: ${fecha}</p>
        </div>
        
        <hr>
        
        <div class="cierre-resumen">
          <table class="tabla-resumen">
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr class="ingreso-row">
                <td><strong>INGRESOS</strong></td>
                <td class="text-success"><strong>$${ingresos.toLocaleString()}</strong></td>
              </tr>
              ${cierre.ingresos?.cuotas ? `
                <tr>
                  <td style="padding-left: 20px;">- Cuotas pagadas</td>
                  <td>$${cierre.ingresos.cuotas.toLocaleString()}</td>
                </tr>
              ` : ''}
              ${cierre.ingresos?.otros ? `
                <tr>
                  <td style="padding-left: 20px;">- Otros ingresos</td>
                  <td>$${cierre.ingresos.otros.toLocaleString()}</td>
                </tr>
              ` : ''}
              <tr class="gasto-row">
                <td><strong>GASTOS</strong></td>
                <td class="text-danger"><strong>$${gastos.toLocaleString()}</strong></td>
              </tr>
              ${cierre.gastos?.desglose?.length ? 
                cierre.gastos.desglose.slice(0, 5).map(g => `
                  <tr>
                    <td style="padding-left: 20px;">- ${g.concepto}</td>
                    <td>$${g.monto.toLocaleString()}</td>
                  </tr>
                `).join('') : ''}
              ${cierre.gastos?.desglose?.length > 5 ? `
                <tr>
                  <td colspan="2" style="padding-left: 20px; font-style: italic;">
                    ... y ${cierre.gastos.desglose.length - 5} gastos más
                  </td>
                </tr>
              ` : ''}
              <tr class="balance-row">
                <td><strong>BALANCE</strong></td>
                <td class="${balance >= 0 ? 'text-success' : 'text-danger'}">
                  <strong>$${balance.toLocaleString()}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        ${cierre.fondos ? `
          <hr>
          <div class="cierre-fondos">
            <h4>Estado de Fondos al Cierre</h4>
            <table class="tabla-fondos">
              <thead>
                <tr>
                  <th>Fondo</th>
                  <th>Saldo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Ahorro Acumulado</td>
                  <td>$${cierre.fondos.ahorroAcumulado?.toLocaleString() || 0}</td>
                </tr>
                <tr>
                  <td>Gastos Mayores</td>
                  <td>$${cierre.fondos.gastosMayores?.toLocaleString() || 0}</td>
                </tr>
                <tr>
                  <td>Dinero Operacional</td>
                  <td>$${cierre.fondos.dineroOperacional?.toLocaleString() || 0}</td>
                </tr>
                <tr class="total-row">
                  <td><strong>PATRIMONIO TOTAL</strong></td>
                  <td><strong>$${cierre.fondos.patrimonioTotal?.toLocaleString() || 0}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        ` : ''}
        
        ${cierre.cuotasPagadas !== undefined ? `
          <hr>
          <div class="cierre-cuotas">
            <h4>Estado de Cuotas</h4>
            <p>✅ Cuotas Pagadas: <strong>${cierre.cuotasPagadas}</strong></p>
            <p>⏳ Cuotas Pendientes/Vencidas: <strong>${cierre.cuotasPendientes || 0}</strong></p>
          </div>
        ` : ''}
        
        ${cierre.cuotasSiguienteAño ? `
          <hr>
          <div class="cierre-siguiente-año">
            <h4>Cuotas Generadas para ${cierre.cuotasSiguienteAño.año}</h4>
            <p>✅ ${cierre.cuotasSiguienteAño.mensaje || 'Cuotas generadas correctamente'}</p>
          </div>
        ` : ''}
        
        <div class="cierre-footer">
          <p><em>Documento generado automáticamente - Edificio 205</em></p>
          <p><small>Fecha de impresión: ${new Date().toLocaleDateString('es-MX')}</small></p>
        </div>
      </div>
      
      <style>
        .cierre-header { text-align: center; margin-bottom: 20px; }
        .tabla-resumen, .tabla-fondos { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 20px 0; 
        }
        .tabla-resumen th, .tabla-resumen td,
        .tabla-fondos th, .tabla-fondos td { 
          border: 1px solid #ddd; 
          padding: 10px; 
          text-align: left; 
        }
        .tabla-resumen th, .tabla-fondos th { 
          background-color: #f0f0f0; 
          font-weight: bold; 
        }
        .ingreso-row, .gasto-row, .balance-row, .total-row {
          background-color: #f9f9f9;
        }
        .cierre-footer { 
          margin-top: 40px; 
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center; 
          font-size: 12px;
        }
        
        @media print {
          .sidebar, .main-header, .filter-controls, .section-header,
          .modal-content .btn, .modal-content .close { 
            display: none !important; 
          }
          .modal-content {
            box-shadow: none !important;
            max-width: 100% !important;
          }
          .printable-cierre { 
            padding: 20px;
            font-family: Arial, sans-serif;
          }
          .cierre-header h2 { font-size: 18px; }
          .cierre-header h3 { font-size: 16px; }
          .tabla-resumen, .tabla-fondos { page-break-inside: avoid; }
        }
      </style>
    `;
    
    document.getElementById('cierre-detalle-content').innerHTML = detalle;
    document.getElementById('cierre-detalle-titulo').textContent = 
      cierre.tipo === 'ANUAL' ? `Detalle Cierre Anual ${cierre.año}` : `Detalle Cierre ${cierre.mes} ${cierre.año}`;
    
    showModal('cierre-detalle-modal');
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar detalle del cierre');
  }
}

async function editarGasto(gastoId) {
  console.log('✏️ Editando gasto:', gastoId);
  
  try {
    const token = localStorage.getItem('edificio_token');
    const response = await fetch('/api/gastos', {
      headers: { 'x-auth-token': token }
    });
    
    if (!response.ok) {
      alert('Error al cargar gastos');
      return;
    }
    
    const data = await response.json();
    console.log('📊 Datos recibidos:', data);
    console.log('🔍 Buscando gasto ID:', gastoId, 'tipo:', typeof gastoId);
    console.log('📋 Gastos disponibles:', data.gastos?.map(g => ({id: g.id, tipo: typeof g.id})));
    
    const gasto = data.gastos?.find(g => g.id === parseInt(gastoId));
    
    console.log('✓ Gasto encontrado:', gasto);
    
    if (!gasto) {
      alert('Gasto no encontrado');
      console.error('❌ No se encontró gasto con ID:', gastoId);
      return;
    }
    
    // Crear modal de edición
    const modalHTML = `
      <div id="editar-gasto-modal" class="modal" style="display: block;">
        <div class="modal-content">
          <span class="close" onclick="document.getElementById('editar-gasto-modal').remove()">&times;</span>
          <h2>Editar Gasto</h2>
          
          <form id="editar-gasto-form">
            <input type="hidden" id="editar-gasto-id" value="${gasto.id}">
            
            <div class="form-group">
              <label for="editar-gasto-concepto">Concepto:</label>
              <input type="text" id="editar-gasto-concepto" value="${gasto.concepto}" required>
            </div>
            
            <div class="form-group">
              <label for="editar-gasto-monto">Monto:</label>
              <input type="number" id="editar-gasto-monto" value="${gasto.monto}" min="0" step="0.01" required>
            </div>
            
            <div class="form-group">
              <label for="editar-gasto-categoria">Categoría:</label>
              <select id="editar-gasto-categoria" required>
                <option value="MANTENIMIENTO" ${gasto.categoria === 'MANTENIMIENTO' ? 'selected' : ''}>Mantenimiento</option>
                <option value="SERVICIOS" ${gasto.categoria === 'SERVICIOS' ? 'selected' : ''}>Servicios</option>
                <option value="REPARACIONES" ${gasto.categoria === 'REPARACIONES' ? 'selected' : ''}>Reparaciones</option>
                <option value="ADMINISTRATIVO" ${gasto.categoria === 'ADMINISTRATIVO' ? 'selected' : ''}>Administrativo</option>
                <option value="OTROS" ${gasto.categoria === 'OTROS' ? 'selected' : ''}>Otros</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="editar-gasto-proveedor">Proveedor:</label>
              <input type="text" id="editar-gasto-proveedor" value="${gasto.proveedor || ''}" required>
            </div>
            
            <div class="form-group">
              <label for="editar-gasto-fecha">Fecha:</label>
              <input type="date" id="editar-gasto-fecha" value="${gasto.fecha.split('T')[0]}" required>
            </div>
            
            <div class="form-group">
              <label for="editar-gasto-fondo">Fondo:</label>
              <select id="editar-gasto-fondo" required>
                <option value="dineroOperacional" ${gasto.fondo === 'dineroOperacional' ? 'selected' : ''}>Dinero Operacional</option>
                <option value="ahorroAcumulado" ${gasto.fondo === 'ahorroAcumulado' ? 'selected' : ''}>Ahorro Acumulado</option>
                <option value="gastosMayores" ${gasto.fondo === 'gastosMayores' ? 'selected' : ''}>Gastos Mayores</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="editar-gasto-comprobante">Comprobante:</label>
              <input type="text" id="editar-gasto-comprobante" value="${gasto.comprobante || ''}">
            </div>
            
            <div class="form-group">
              <label for="editar-gasto-notas">Notas:</label>
              <textarea id="editar-gasto-notas" rows="3">${gasto.notas || ''}</textarea>
            </div>
            
            <div class="form-group">
              <button type="submit" class="btn btn-primary">Actualizar Gasto</button>
              <button type="button" class="btn btn-secondary" onclick="document.getElementById('editar-gasto-modal').remove()">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const form = document.getElementById('editar-gasto-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('📝 Submit form editar gasto');
        await actualizarGasto(gastoId);
      });
    } else {
      console.error('❌ Form editar-gasto-form no encontrado');
    }
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar datos del gasto');
  }
}

async function actualizarGasto(gastoId) {
  console.log('💾 Actualizando gasto:', gastoId);
  
  const formData = {
    concepto: document.getElementById('editar-gasto-concepto').value,
    monto: parseFloat(document.getElementById('editar-gasto-monto').value),
    categoria: document.getElementById('editar-gasto-categoria').value,
    proveedor: document.getElementById('editar-gasto-proveedor').value,
    fecha: document.getElementById('editar-gasto-fecha').value,
    fondo: document.getElementById('editar-gasto-fondo').value,
    comprobante: document.getElementById('editar-gasto-comprobante').value,
    notas: document.getElementById('editar-gasto-notas').value
  };
  
  console.log('📤 Datos a enviar:', formData);
  
  try {
    const token = localStorage.getItem('edificio_token');
    console.log('🔑 Token:', token ? 'presente' : 'ausente');
    
    const response = await fetch(`/api/gastos/${gastoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify(formData)
    });
    
    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Respuesta exitosa:', result);
      alert('✅ Gasto actualizado exitosamente');
      document.getElementById('editar-gasto-modal').remove();
      filtrarGastos();
    } else {
      const error = await response.json();
      console.error('❌ Error del servidor:', error);
      alert(`❌ Error: ${error.msg || 'No se pudo actualizar el gasto'}`);
    }
  } catch (error) {
    console.error('❌ Exception:', error);
    alert('❌ Error al actualizar gasto: ' + error.message);
  }
}

async function eliminarGasto(gastoId) {
  if (!confirm('¿Está seguro de eliminar este gasto? Esta acción no se puede deshacer.')) {
    return;
  }
  
  try {
    const token = localStorage.getItem('edificio_token');
    const response = await fetch(`/api/gastos/${gastoId}`, {
      method: 'DELETE',
      headers: {
        'x-auth-token': token
      }
    });
    
    if (response.ok) {
      alert('✅ Gasto eliminado exitosamente');
      filtrarGastos();
    } else {
      const error = await response.json();
      alert(`❌ Error: ${error.msg || 'No se pudo eliminar el gasto'}`);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al eliminar gasto');
  }
}
