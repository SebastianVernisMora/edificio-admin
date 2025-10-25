let presupuestos = [];
let cuotas = [];
let anuncios = [];
let solicitudes = [];
let usuarios = [];
let gastos = [];
let cierres = [];
let estadisticasContables = {};
let parcialidades = {};
let cuotasFondoMayor = [];

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado');
    
    if (!checkAuth()) {
        console.log('Auth failed, redirecting...');
        return;
    }
    
    console.log('Auth successful, initializing...');
    initNavigation();
    cargarDashboard();
});

function initNavigation() {
    console.log('Inicializando navegación...');
    const navLinks = document.querySelectorAll('.nav-link');
    console.log('Enlaces encontrados:', navLinks.length);
    
    navLinks.forEach((link, index) => {
        console.log(`Enlace ${index}:`, link.getAttribute('href'));
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href').substring(1);
            console.log('Navegando a sección:', targetId);
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
                console.log('Sección activada:', targetId);
            } else {
                console.error('Sección no encontrada:', targetId);
            }
            
            switch(targetId) {
                case 'presupuestos':
                    cargarPresupuestos();
                    break;
                case 'cuotas':
                    cargarCuotas();
                    break;
                case 'usuarios':
                    cargarUsuarios();
                    break;
                case 'gastos':
                    cargarGastos();
                    break;
                case 'parcialidades':
                    cargarParcialidades();
                    break;
                case 'contabilidad':
                    cargarContabilidad();
                    break;
                case 'anuncios':
                    console.log('Cargando sección anuncios...');
                    cargarAnuncios();
                    break;
                case 'solicitudes':
                    console.log('Cargando sección solicitudes...');
                    cargarSolicitudes();
                    break;
                case 'dashboard':
                    cargarDashboard();
                    break;
                default:
                    console.log('Sección no encontrada:', targetId);
            }
        });
    });
}

async function cargarDashboard() {
    try {
        const [cuotasData, saldosFondos, gastosData] = await Promise.all([
            apiRequest('/cuotas'),
            apiRequest('/fondos/saldos'),
            apiRequest('/gastos')
        ]);

        // Cargar saldos de fondos
        if (saldosFondos) {
            document.getElementById('fondoAhorroSaldo').textContent = formatCurrency(saldosFondos.fondo_ahorro_acumulado);
            document.getElementById('fondoGastosMayoresSaldo').textContent = formatCurrency(saldosFondos.fondo_gastos_mayores_actual);
            document.getElementById('dineroOperacional').textContent = formatCurrency(saldosFondos.dinero_operacional);
            document.getElementById('patrimonioTotal').textContent = formatCurrency(saldosFondos.patrimonio_total_actual);
        }

        // Estado del cierre 2024
        const cuotasPendientes = cuotasData.filter(c => !c.pagado);
        const montoPendiente = cuotasPendientes.reduce((sum, c) => sum + c.monto, 0);
        const gastosNoviembre = gastosData
            .filter(g => (g.fecha_gasto || g.fecha || '').startsWith('2025-11'))
            .reduce((sum, g) => sum + g.monto, 0);

        const cuotasNoviembre = cuotasData.filter(c => c.concepto.includes('Noviembre 2025'));
        const cuotasDiciembre = cuotasData.filter(c => c.concepto.includes('Diciembre 2025'));
        
        document.getElementById('cuotasNoviembre').textContent = `${cuotasNoviembre.filter(c => c.pagado).length}/${cuotasNoviembre.length}`;
        document.getElementById('cuotasDiciembre').textContent = `${cuotasDiciembre.filter(c => c.pagado).length}/${cuotasDiciembre.length}`;
        document.getElementById('gastosNoviembre').textContent = formatCurrency(gastosNoviembre);

        cargarActividadesRecientes();
    } catch (error) {
        console.error('Error cargando dashboard:', error);
        // Cargar valores por defecto si no hay saldos
        document.getElementById('fondoAhorroSaldo').textContent = formatCurrency(67500);
        document.getElementById('fondoGastosMayoresSaldo').textContent = formatCurrency(125000);
        document.getElementById('dineroOperacional').textContent = formatCurrency(48000);
        document.getElementById('patrimonioTotal').textContent = formatCurrency(240500);
    }
}

async function cargarActividadesRecientes() {
    try {
        const [cuotasData, solicitudesData, anunciosData] = await Promise.all([
            apiRequest('/cuotas'),
            apiRequest('/solicitudes'),
            apiRequest('/anuncios')
        ]);

        const actividades = [];
        
        cuotasData.slice(0, 3).forEach(cuota => {
            actividades.push({
                tipo: 'cuota',
                titulo: `${cuota.usuario_nombre} - ${cuota.concepto}`,
                fecha: cuota.created_at,
                icono: '💰'
            });
        });

        solicitudesData.slice(0, 3).forEach(solicitud => {
            actividades.push({
                tipo: 'solicitud',
                titulo: `Nueva solicitud: ${solicitud.titulo}`,
                fecha: solicitud.created_at,
                icono: '📋'
            });
        });

        anunciosData.slice(0, 2).forEach(anuncio => {
            actividades.push({
                tipo: 'anuncio',
                titulo: `Anuncio: ${anuncio.titulo}`,
                fecha: anuncio.created_at,
                icono: '📢'
            });
        });

        actividades.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        const container = document.getElementById('actividadesRecientes');
        container.innerHTML = actividades.slice(0, 5).map(actividad => `
            <div class="activity-item">
                <div class="activity-icon ${actividad.tipo}">
                    ${actividad.icono}
                </div>
                <div class="activity-content">
                    <div class="activity-title">${actividad.titulo}</div>
                    <div class="activity-time">${formatDateTime(actividad.fecha)}</div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error cargando actividades:', error);
    }
}

async function cargarPresupuestos() {
    try {
        presupuestos = await apiRequest('/presupuestos');
        mostrarPresupuestos();
    } catch (error) {
        console.error('Error cargando presupuestos:', error);
    }
}

function mostrarPresupuestos() {
    const tbody = document.querySelector('#tablaPresupuestos tbody');
    tbody.innerHTML = presupuestos.map(presupuesto => `
        <tr>
            <td>${presupuesto.titulo}</td>
            <td>${formatCurrency(presupuesto.monto_total)}</td>
            <td><span class="badge ${presupuesto.estado}">${presupuesto.estado}</span></td>
            <td>${formatDate(presupuesto.created_at)}</td>
            <td>
                <button onclick="verPresupuesto(${presupuesto.id})" class="btn-secondary">Ver</button>
                ${presupuesto.estado === 'pendiente' ? `
                    <button onclick="aprobarPresupuesto(${presupuesto.id})" class="btn-success">Aprobar</button>
                    <button onclick="rechazarPresupuesto(${presupuesto.id})" class="btn-danger">Rechazar</button>
                ` : ''}
                <button onclick="eliminarPresupuesto(${presupuesto.id})" class="btn-danger">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

async function cargarCuotas() {
    try {
        console.log('Cargando cuotas...');
        cuotas = await apiRequest('/cuotas');
        console.log('Cuotas cargadas:', cuotas?.length || 0, 'cuotas');
        mostrarCuotas();
        cargarFiltrosMes();
    } catch (error) {
        console.error('Error cargando cuotas:', error);
        const tbody = document.querySelector('#tablaCuotas tbody');
        if (tbody) {
            tbody.innerHTML = `
                <tr><td colspan="8" style="text-align: center; color: #666;">
                    Error cargando cuotas: ${error.message}
                </td></tr>
            `;
        }
    }
}

function mostrarCuotas(cuotasFiltradas = null) {
    const cuotasAMostrar = cuotasFiltradas || cuotas;
    const tbody = document.querySelector('#tablaCuotas tbody');
    tbody.innerHTML = cuotasAMostrar.map(cuota => {
        const estado = cuota.pagado ? 'pagado' : (new Date(cuota.fecha_vencimiento) < new Date() ? 'vencido' : 'pendiente');
        const tipoLabel = cuota.tipo_cuota === 'mensual' ? 'Mensual' : 'Fondo Mayor';
        const montoParcial = cuota.tipo_cuota === 'fondo_mayor' && cuota.monto_pagado > 0 ? ` ($${cuota.monto_pagado} pagado)` : '';
        
        return `
            <tr>
                <td class="checkbox-column">
                    <input type="checkbox" class="cuota-checkbox" value="${cuota.id}" ${cuota.pagado ? 'disabled' : ''}>
                </td>
                <td>${cuota.usuario_nombre}</td>
                <td>${cuota.departamento}</td>
                <td>${cuota.concepto}</td>
                <td><span class="badge ${cuota.tipo_cuota}">${tipoLabel}</span></td>
                <td>${formatCurrency(cuota.monto)}${montoParcial}</td>
                <td>${formatDate(cuota.fecha_vencimiento)}</td>
                <td><span class="badge ${estado}">${estado}</span></td>
                <td>
                    ${cuota.tipo_cuota === 'fondo_mayor' && !cuota.pagado ? 
                        `<button onclick="gestionarParcialidades(${cuota.id})" class="btn-primary">Parcialidades</button>` : 
                        !cuota.pagado ? `<button onclick="marcarPagada(${cuota.id})" class="btn-success">Marcar Pagada</button>` : ''
                    }
                    <button onclick="eliminarCuota(${cuota.id})" class="btn-danger">Eliminar</button>
                </td>
            </tr>
        `;
    }).join('');
}

async function cargarAnuncios() {
    try {
        console.log('Cargando anuncios...');
        anuncios = await apiRequest('/anuncios');
        console.log('Anuncios cargados:', anuncios);
        mostrarAnuncios();
    } catch (error) {
        console.error('Error cargando anuncios:', error);
        document.querySelector('#tablaAnuncios tbody').innerHTML = `
            <tr><td colspan="5" style="text-align: center; color: #666;">
                Error cargando anuncios: ${error.message}
            </td></tr>
        `;
    }
}

function mostrarAnuncios() {
    const tbody = document.querySelector('#tablaAnuncios tbody');
    tbody.innerHTML = anuncios.map(anuncio => `
        <tr>
            <td>${anuncio.titulo}</td>
            <td><span class="badge ${anuncio.tipo}">${anuncio.tipo}</span></td>
            <td>${formatDate(anuncio.created_at)}</td>
            <td><span class="badge ${anuncio.activo ? 'activo' : 'inactivo'}">${anuncio.activo ? 'Activo' : 'Inactivo'}</span></td>
            <td>
                <button onclick="verAnuncio(${anuncio.id})" class="btn-secondary">Ver</button>
                ${anuncio.activo ? `<button onclick="desactivarAnuncio(${anuncio.id})" class="btn-danger">Desactivar</button>` : ''}
                <button onclick="eliminarAnuncio(${anuncio.id})" class="btn-danger">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

async function cargarSolicitudes() {
    try {
        console.log('Cargando solicitudes...');
        solicitudes = await apiRequest('/solicitudes');
        console.log('Solicitudes cargadas:', solicitudes);
        mostrarSolicitudes();
    } catch (error) {
        console.error('Error cargando solicitudes:', error);
        document.querySelector('#tablaSolicitudes tbody').innerHTML = `
            <tr><td colspan="7" style="text-align: center; color: #666;">
                Error cargando solicitudes: ${error.message}
            </td></tr>
        `;
    }
}

function mostrarSolicitudes() {
    const tbody = document.querySelector('#tablaSolicitudes tbody');
    tbody.innerHTML = solicitudes.map(solicitud => `
        <tr>
            <td>${solicitud.usuario_nombre}</td>
            <td>${solicitud.tipo}</td>
            <td>${solicitud.titulo}</td>
            <td><span class="badge ${solicitud.prioridad}">${solicitud.prioridad}</span></td>
            <td><span class="badge ${solicitud.estado}">${solicitud.estado}</span></td>
            <td>${formatDate(solicitud.created_at)}</td>
            <td>
                <button onclick="verSolicitud(${solicitud.id})" class="btn-secondary">Ver</button>
                ${solicitud.estado === 'pendiente' ? `<button onclick="responderSolicitud(${solicitud.id})" class="btn-primary">Responder</button>` : ''}
                <button onclick="eliminarSolicitud(${solicitud.id})" class="btn-danger">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

async function cargarUsuarios() {
    try {
        usuarios = await apiRequest('/auth/perfil');
    } catch (error) {
        console.error('Error cargando usuarios:', error);
    }
}

function mostrarFormPresupuesto() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3>Nuevo Presupuesto</h3>
        <form id="formPresupuesto">
            <div class="form-group">
                <label for="titulo">Título:</label>
                <input type="text" id="titulo" name="titulo" required>
            </div>
            <div class="form-group">
                <label for="descripcion">Descripción:</label>
                <textarea id="descripcion" name="descripcion"></textarea>
            </div>
            <div class="form-group">
                <label for="monto_total">Monto Total:</label>
                <input type="number" id="monto_total" name="monto_total" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="fecha_inicio">Fecha Inicio:</label>
                <input type="date" id="fecha_inicio" name="fecha_inicio">
            </div>
            <div class="form-group">
                <label for="fecha_fin">Fecha Fin:</label>
                <input type="date" id="fecha_fin" name="fecha_fin">
            </div>
            <button type="submit" class="btn-primary">Crear Presupuesto</button>
        </form>
    `;
    document.getElementById('modal').style.display = 'block';
    
    document.getElementById('formPresupuesto').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
            await apiRequest('/presupuestos', {
                method: 'POST',
                body: data
            });
            cerrarModal();
            cargarPresupuestos();
        } catch (error) {
            alert('Error al crear presupuesto: ' + error.message);
        }
    });
}

function mostrarFormCuota() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3>Nueva Cuota</h3>
        <form id="formCuota">
            <div class="form-group">
                <label for="tipo">Tipo:</label>
                <select id="tipo" name="tipo" required>
                    <option value="">Seleccionar...</option>
                    <option value="individual">Individual</option>
                    <option value="todos">Para todos los inquilinos</option>
                </select>
            </div>
            <div class="form-group" id="grupoUsuario" style="display: none;">
                <label for="usuario_id">Inquilino:</label>
                <select id="usuario_id" name="usuario_id">
                    <option value="">Cargando...</option>
                </select>
            </div>
            <div class="form-group">
                <label for="concepto">Concepto:</label>
                <input type="text" id="concepto" name="concepto" required>
            </div>
            <div class="form-group">
                <label for="monto">Monto:</label>
                <input type="number" id="monto" name="monto" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="fecha_vencimiento">Fecha Vencimiento:</label>
                <input type="date" id="fecha_vencimiento" name="fecha_vencimiento" required>
            </div>
            <button type="submit" class="btn-primary">Crear Cuota</button>
        </form>
    `;
    document.getElementById('modal').style.display = 'block';
    
    document.getElementById('tipo').addEventListener('change', (e) => {
        const grupoUsuario = document.getElementById('grupoUsuario');
        if (e.target.value === 'individual') {
            grupoUsuario.style.display = 'block';
            cargarInquilinosSelect();
        } else {
            grupoUsuario.style.display = 'none';
        }
    });
    
    document.getElementById('formCuota').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
            await apiRequest('/cuotas', {
                method: 'POST',
                body: data
            });
            cerrarModal();
            cargarCuotas();
        } catch (error) {
            alert('Error al crear cuota: ' + error.message);
        }
    });
}

function mostrarFormAnuncio() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3>Nuevo Anuncio</h3>
        <form id="formAnuncio">
            <div class="form-group">
                <label for="titulo">Título:</label>
                <input type="text" id="titulo" name="titulo" required>
            </div>
            <div class="form-group">
                <label for="contenido">Contenido:</label>
                <textarea id="contenido" name="contenido" required></textarea>
            </div>
            <div class="form-group">
                <label for="tipo">Tipo:</label>
                <select id="tipo" name="tipo" required>
                    <option value="general">General</option>
                    <option value="urgente">Urgente</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="reunion">Reunión</option>
                </select>
            </div>
            <div class="form-group">
                <label for="fecha_expiracion">Fecha Expiración (opcional):</label>
                <input type="date" id="fecha_expiracion" name="fecha_expiracion">
            </div>
            <button type="submit" class="btn-primary">Crear Anuncio</button>
        </form>
    `;
    document.getElementById('modal').style.display = 'block';
    
    document.getElementById('formAnuncio').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
            await apiRequest('/anuncios', {
                method: 'POST',
                body: data
            });
            cerrarModal();
            cargarAnuncios();
        } catch (error) {
            alert('Error al crear anuncio: ' + error.message);
        }
    });
}

async function cargarInquilinosSelect() {
    try {
        const response = await apiRequest('/auth/perfil');
        const select = document.getElementById('usuario_id');
        select.innerHTML = '<option value="">Seleccionar inquilino...</option>';
    } catch (error) {
        console.error('Error cargando inquilinos:', error);
    }
}

async function aprobarPresupuesto(id) {
    if (confirm('¿Está seguro de aprobar este presupuesto?')) {
        try {
            await apiRequest(`/presupuestos/${id}/aprobar`, { method: 'PATCH' });
            cargarPresupuestos();
        } catch (error) {
            alert('Error al aprobar presupuesto: ' + error.message);
        }
    }
}

async function rechazarPresupuesto(id) {
    if (confirm('¿Está seguro de rechazar este presupuesto?')) {
        try {
            await apiRequest(`/presupuestos/${id}/rechazar`, { method: 'PATCH' });
            cargarPresupuestos();
        } catch (error) {
            alert('Error al rechazar presupuesto: ' + error.message);
        }
    }
}

async function eliminarPresupuesto(id) {
    if (confirm('¿Está seguro de eliminar este presupuesto?')) {
        try {
            await apiRequest(`/presupuestos/${id}`, { method: 'DELETE' });
            cargarPresupuestos();
        } catch (error) {
            alert('Error al eliminar presupuesto: ' + error.message);
        }
    }
}

async function marcarPagada(id) {
    const metodo = prompt('Método de pago:');
    if (metodo) {
        try {
            await apiRequest(`/cuotas/${id}/pagar`, {
                method: 'PATCH',
                body: { metodo_pago: metodo }
            });
            cargarCuotas();
        } catch (error) {
            alert('Error al marcar cuota como pagada: ' + error.message);
        }
    }
}

async function eliminarCuota(id) {
    if (confirm('¿Está seguro de eliminar esta cuota?')) {
        try {
            await apiRequest(`/cuotas/${id}`, { method: 'DELETE' });
            cargarCuotas();
        } catch (error) {
            alert('Error al eliminar cuota: ' + error.message);
        }
    }
}

async function desactivarAnuncio(id) {
    if (confirm('¿Está seguro de desactivar este anuncio?')) {
        try {
            await apiRequest(`/anuncios/${id}/desactivar`, { method: 'PATCH' });
            cargarAnuncios();
        } catch (error) {
            alert('Error al desactivar anuncio: ' + error.message);
        }
    }
}

async function eliminarAnuncio(id) {
    if (confirm('¿Está seguro de eliminar este anuncio?')) {
        try {
            await apiRequest(`/anuncios/${id}`, { method: 'DELETE' });
            cargarAnuncios();
        } catch (error) {
            alert('Error al eliminar anuncio: ' + error.message);
        }
    }
}

async function responderSolicitud(id) {
    const respuesta = prompt('Respuesta a la solicitud:');
    if (respuesta) {
        try {
            await apiRequest(`/solicitudes/${id}/responder`, {
                method: 'POST',
                body: { respuesta, estado: 'completada' }
            });
            cargarSolicitudes();
        } catch (error) {
            alert('Error al responder solicitud: ' + error.message);
        }
    }
}

async function eliminarSolicitud(id) {
    if (confirm('¿Está seguro de eliminar esta solicitud?')) {
        try {
            await apiRequest(`/solicitudes/${id}`, { method: 'DELETE' });
            cargarSolicitudes();
        } catch (error) {
            alert('Error al eliminar solicitud: ' + error.message);
        }
    }
}

function verPresupuesto(id) {
    const presupuesto = presupuestos.find(p => p.id === id);
    alert(`Presupuesto: ${presupuesto.titulo}\nMonto: ${formatCurrency(presupuesto.monto_total)}\nDescripción: ${presupuesto.descripcion || 'N/A'}`);
}

function verAnuncio(id) {
    const anuncio = anuncios.find(a => a.id === id);
    alert(`Anuncio: ${anuncio.titulo}\nTipo: ${anuncio.tipo}\nContenido: ${anuncio.contenido}`);
}

function verSolicitud(id) {
    const solicitud = solicitudes.find(s => s.id === id);
    alert(`Solicitud: ${solicitud.titulo}\nTipo: ${solicitud.tipo}\nPrioridad: ${solicitud.prioridad}\nDescripción: ${solicitud.descripcion || 'N/A'}\nRespuesta: ${solicitud.respuesta || 'Sin respuesta'}`);
}

function cerrarModal() {
    document.getElementById('modal').style.display = 'none';
}

// Nuevas funciones para gastos
async function cargarGastos() {
    try {
        gastos = await apiRequest('/gastos');
        mostrarGastos();
    } catch (error) {
        console.error('Error cargando gastos:', error);
    }
}

function mostrarGastos() {
    const tbody = document.querySelector('#tablaGastos tbody');
    tbody.innerHTML = gastos.map(gasto => `
        <tr>
            <td>${formatDate(gasto.fecha_gasto || gasto.fecha)}</td>
            <td>${gasto.concepto}</td>
            <td><span class="badge ${gasto.categoria}">${gasto.categoria}</span></td>
            <td>${gasto.proveedor || 'N/A'}</td>
            <td>${formatCurrency(gasto.monto)}</td>
            <td>
                <button onclick="editarGasto(${gasto.id})" class="btn-secondary btn-sm">Editar</button>
                <button onclick="eliminarGasto(${gasto.id})" class="btn-danger btn-sm">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

function mostrarFormGasto() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3>Registrar Gasto</h3>
        <form id="formGasto">
            <div class="form-group">
                <label for="fecha">Fecha:</label>
                <input type="date" id="fecha" name="fecha" required value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
                <label for="concepto">Concepto:</label>
                <input type="text" id="concepto" name="concepto" required>
            </div>
            <div class="form-group">
                <label for="categoria">Categoría:</label>
                <select id="categoria" name="categoria" required>
                    <option value="">Seleccionar...</option>
                    <option value="limpieza_mantenimiento">Limpieza Áreas Comunes</option>
                    <option value="servicios_publicos">Servicios Públicos (CFE, Agua)</option>
                    <option value="recoleccion_basura">Recolección de Basura</option>
                    <option value="reparaciones_extraordinarias">Reparaciones Extraordinarias</option>
                    <option value="mantenimiento_preventivo">Mantenimiento Preventivo</option>
                    <option value="sistemas_electricos">Sistemas Eléctricos</option>
                    <option value="sistemas_hidraulicos">Sistemas Hidráulicos</option>
                    <option value="estructura_edificio">Estructura del Edificio</option>
                    <option value="administracion_legal">Administración y Legal</option>
                    <option value="fondo_contingencia">Fondo de Contingencia</option>
                    <option value="jardineria_areas_verdes">Jardinería (Macetas)</option>
                    <option value="otros">Otros</option>
                </select>
            </div>
            <div class="form-group">
                <label for="monto">Monto:</label>
                <input type="number" id="monto" name="monto" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="proveedor">Proveedor (opcional):</label>
                <input type="text" id="proveedor" name="proveedor">
            </div>
            <div class="form-group">
                <label for="descripcion">Descripción (opcional):</label>
                <textarea id="descripcion" name="descripcion"></textarea>
            </div>
            <button type="submit" class="btn-primary">Registrar Gasto</button>
        </form>
    `;
    document.getElementById('modal').style.display = 'block';
    
    document.getElementById('formGasto').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
            await apiRequest('/gastos', {
                method: 'POST',
                body: data
            });
            cerrarModal();
            cargarGastos();
        } catch (error) {
            alert('Error al registrar gasto: ' + error.message);
        }
    });
}

async function eliminarGasto(id) {
    if (confirm('¿Está seguro de eliminar este gasto?')) {
        try {
            await apiRequest(`/gastos/${id}`, { method: 'DELETE' });
            cargarGastos();
            alert('Gasto eliminado exitosamente');
        } catch (error) {
            alert('Error al eliminar gasto: ' + error.message);
        }
    }
}

async function editarGasto(id) {
    const gasto = gastos.find(g => g.id === id);
    if (!gasto) return;
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3>Editar Gasto</h3>
        <form id="formEditarGasto">
            <div class="form-group">
                <label for="fechaEdit">Fecha:</label>
                <input type="date" id="fechaEdit" name="fecha_gasto" required value="${gasto.fecha_gasto}">
            </div>
            <div class="form-group">
                <label for="conceptoEdit">Concepto:</label>
                <input type="text" id="conceptoEdit" name="concepto" required value="${gasto.concepto}">
            </div>
            <div class="form-group">
                <label for="categoriaEdit">Categoría:</label>
                <select id="categoriaEdit" name="categoria" required>
                    <option value="limpieza_mantenimiento" ${gasto.categoria === 'limpieza_mantenimiento' ? 'selected' : ''}>Limpieza Áreas Comunes</option>
                    <option value="servicios_publicos" ${gasto.categoria === 'servicios_publicos' ? 'selected' : ''}>Servicios Públicos</option>
                    <option value="recoleccion_basura" ${gasto.categoria === 'recoleccion_basura' ? 'selected' : ''}>Recolección de Basura</option>
                    <option value="reparaciones_extraordinarias" ${gasto.categoria === 'reparaciones_extraordinarias' ? 'selected' : ''}>Reparaciones Extraordinarias</option>
                    <option value="mantenimiento_preventivo" ${gasto.categoria === 'mantenimiento_preventivo' ? 'selected' : ''}>Mantenimiento Preventivo</option>
                    <option value="otros" ${gasto.categoria === 'otros' ? 'selected' : ''}>Otros</option>
                </select>
            </div>
            <div class="form-group">
                <label for="proveedorEdit">Proveedor:</label>
                <input type="text" id="proveedorEdit" name="proveedor" value="${gasto.proveedor || ''}">
            </div>
            <div class="form-group">
                <label for="montoEdit">Monto:</label>
                <input type="number" id="montoEdit" name="monto" step="0.01" required value="${gasto.monto}">
            </div>
            <div class="form-group">
                <label for="origenFondoEdit">Origen del Fondo:</label>
                <select id="origenFondoEdit" name="origen_fondo">
                    <option value="fondo_operacional" ${gasto.origen_fondo === 'fondo_operacional' ? 'selected' : ''}>Fondo Operacional</option>
                    <option value="fondo_gastos_mayores" ${gasto.origen_fondo === 'fondo_gastos_mayores' ? 'selected' : ''}>Fondo Gastos Mayores</option>
                </select>
            </div>
            <div class="form-buttons">
                <button type="submit" class="btn-primary">Actualizar Gasto</button>
                <button type="button" onclick="cerrarModal()" class="btn-secondary">Cancelar</button>
            </div>
        </form>
    `;
    
    document.getElementById('modal').style.display = 'block';
    
    document.getElementById('formEditarGasto').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
            await apiRequest(`/gastos/${id}`, {
                method: 'PUT',
                body: data
            });
            cerrarModal();
            cargarGastos();
            alert('Gasto actualizado exitosamente');
        } catch (error) {
            alert('Error al actualizar gasto: ' + error.message);
        }
    });
}

// Funciones para contabilidad
async function cargarContabilidad() {
    try {
        // Establecer período actual
        const ahora = new Date();
        const periodoActual = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
        document.getElementById('periodoContable').value = periodoActual;
        
        await cargarEstadisticasContables();
        await cargarCierres();
    } catch (error) {
        console.error('Error cargando contabilidad:', error);
    }
}

async function cargarEstadisticasContables() {
    try {
        const periodo = document.getElementById('periodoContable').value;
        const tipo = document.getElementById('tipoReporte').value;
        
        estadisticasContables = await apiRequest(`/cierres/estadisticas?periodo=${periodo}&tipo=${tipo}`);
        mostrarEstadisticasContables();
    } catch (error) {
        console.error('Error cargando estadísticas contables:', error);
    }
}

function mostrarEstadisticasContables() {
    const stats = estadisticasContables.resumen || {};
    
    document.getElementById('totalIngresos').textContent = formatCurrency(stats.total_ingresos || 0);
    document.getElementById('totalEgresos').textContent = formatCurrency(stats.total_egresos || 0);
    document.getElementById('saldoPeriodo').textContent = formatCurrency(stats.saldo || 0);
    document.getElementById('montoPendienteContable').textContent = formatCurrency(stats.monto_pendiente || 0);
    
    // Mostrar detalle de ingresos
    const tbodyIngresos = document.querySelector('#tablaIngresos tbody');
    tbodyIngresos.innerHTML = (estadisticasContables.detalle_ingresos || []).map(ingreso => `
        <tr>
            <td>${formatDate(ingreso.fecha)}</td>
            <td>${ingreso.concepto}</td>
            <td>${ingreso.usuario}</td>
            <td>${formatCurrency(ingreso.monto)}</td>
        </tr>
    `).join('');
    
    // Mostrar detalle de egresos
    const tbodyEgresos = document.querySelector('#tablaEgresos tbody');
    tbodyEgresos.innerHTML = (estadisticasContables.detalle_egresos || []).map(egreso => `
        <tr>
            <td>${formatDate(egreso.fecha)}</td>
            <td>${egreso.concepto}</td>
            <td><span class="badge ${egreso.categoria}">${egreso.categoria}</span></td>
            <td>${egreso.proveedor || 'N/A'}</td>
            <td>${formatCurrency(egreso.monto)}</td>
        </tr>
    `).join('');
    
    // Mostrar cuotas pendientes
    const tbodyPendientes = document.querySelector('#tablaPendientes tbody');
    tbodyPendientes.innerHTML = (estadisticasContables.cuotas_pendientes_detalle || []).map(pendiente => `
        <tr>
            <td>${pendiente.usuario}</td>
            <td>${pendiente.departamento}</td>
            <td>${pendiente.concepto}</td>
            <td>${formatDate(pendiente.fecha_vencimiento)}</td>
            <td>${formatCurrency(pendiente.monto)}</td>
        </tr>
    `).join('');
}

async function cargarCierres() {
    try {
        cierres = await apiRequest('/cierres');
        mostrarCierres();
    } catch (error) {
        console.error('Error cargando cierres:', error);
    }
}

function mostrarCierres() {
    const tbody = document.querySelector('#tablaCierres tbody');
    tbody.innerHTML = cierres.map(cierre => `
        <tr>
            <td>${cierre.periodo}</td>
            <td>${cierre.tipo}</td>
            <td>${formatDate(cierre.fecha_cierre)}</td>
            <td>${formatCurrency(cierre.total_ingresos)}</td>
            <td>${formatCurrency(cierre.total_egresos)}</td>
            <td>${formatCurrency(cierre.saldo)}</td>
            <td><span class="badge ${cierre.estado}">${cierre.estado}</span></td>
        </tr>
    `).join('');
}

async function generarCierre() {
    const periodo = document.getElementById('periodoContable').value;
    const tipo = document.getElementById('tipoReporte').value;
    
    if (!periodo) {
        alert('Por favor seleccione un período');
        return;
    }
    
    if (confirm(`¿Está seguro de generar el cierre ${tipo} para ${periodo}?`)) {
        try {
            await apiRequest('/cierres', {
                method: 'POST',
                body: { periodo, tipo }
            });
            cargarCierres();
            alert('Cierre generado exitosamente');
        } catch (error) {
            alert('Error al generar cierre: ' + error.message);
        }
    }
}

// Funciones para cuotas mejoradas
function mostrarFormCuotaMensual() {
    const modalBody = document.getElementById('modalBody');
    const ahora = new Date();
    const añoActual = ahora.getFullYear();
    const mesActual = ahora.getMonth() + 1;
    
    modalBody.innerHTML = `
        <h3>Generar Cuotas</h3>
        <div class="form-group">
            <label>Tipo de generación:</label>
            <select id="tipoGeneracion" onchange="cambiarTipoGeneracion()" style="width: 100%; padding: 8px; margin-bottom: 20px;">
                <option value="mensual">Mes individual</option>
                <option value="anual">Año completo (12 meses)</option>
            </select>
        </div>
        
        <form id="formCuotaMensual">
            <div id="seleccionMes" class="form-group">
                <label>Período:</label>
                <div class="month-year-input">
                    <select id="mesGenerar" name="mes" required>
                        ${Array.from({length: 12}, (_, i) => {
                            const mes = i + 1;
                            const nombre = new Date(2000, i, 1).toLocaleString('es', { month: 'long' });
                            return `<option value="${mes}" ${mes === mesActual ? 'selected' : ''}>${nombre.charAt(0).toUpperCase() + nombre.slice(1)}</option>`;
                        }).join('')}
                    </select>
                    <select id="añoGenerar" name="año" required>
                        ${Array.from({length: 5}, (_, i) => {
                            const año = añoActual + i;
                            return `<option value="${año}" ${año === añoActual ? 'selected' : ''}>${año}</option>`;
                        }).join('')}
                    </select>
                </div>
            </div>
            
            <div id="seleccionAño" class="form-group" style="display: none;">
                <label for="añoCompleto">Año:</label>
                <select id="añoCompleto" name="año">
                    ${Array.from({length: 5}, (_, i) => {
                        const año = añoActual + i;
                        return `<option value="${año}" ${año === añoActual ? 'selected' : ''}>${año}</option>`;
                    }).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label for="montoMensual">Monto cuota mensual:</label>
                <input type="number" id="montoMensual" name="monto" step="0.01" value="550" required>
                <small>$400 Mantenimiento + $150 Fondo Basura = $550 MXN</small>
            </div>
            
            <div id="resumenGeneracion">
                <p><strong>Se generarán cuotas para 20 departamentos</strong></p>
                <p id="totalCuotasInfo">Total: 20 cuotas</p>
            </div>
            
            <button type="submit" class="btn-primary">Generar Cuotas</button>
        </form>
    `;
    document.getElementById('modal').style.display = 'block';
    
    document.getElementById('formCuotaMensual').addEventListener('submit', async (e) => {
        e.preventDefault();
        const tipo = document.getElementById('tipoGeneracion').value;
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        const endpoint = tipo === 'anual' ? '/cuotas/generar-anual' : '/cuotas/generar-mensual';
        
        try {
            const response = await apiRequest(endpoint, {
                method: 'POST',
                body: data
            });
            cerrarModal();
            cargarCuotas();
            
            if (tipo === 'anual') {
                alert(`Cuotas anuales generadas exitosamente:\\n${response.totalCuotas} cuotas (12 meses × 20 departamentos)\\nMonto por cuota: ${formatCurrency(response.monto)}`);
            } else {
                alert(`Cuotas mensuales generadas exitosamente:\\n${response.cuotasCreadas} cuotas para ${response.periodo}\\nMonto por cuota: ${formatCurrency(response.monto)}`);
            }
        } catch (error) {
            alert('Error al generar cuotas: ' + error.message);
        }
    });
}

function cambiarTipoGeneracion() {
    const tipo = document.getElementById('tipoGeneracion').value;
    const seleccionMes = document.getElementById('seleccionMes');
    const seleccionAño = document.getElementById('seleccionAño');
    const totalInfo = document.getElementById('totalCuotasInfo');
    
    if (tipo === 'anual') {
        seleccionMes.style.display = 'none';
        seleccionAño.style.display = 'block';
        totalInfo.textContent = 'Total: 240 cuotas (12 meses × 20 departamentos)';
        document.getElementById('mesGenerar').required = false;
        document.getElementById('añoCompleto').required = true;
    } else {
        seleccionMes.style.display = 'block';
        seleccionAño.style.display = 'none';
        totalInfo.textContent = 'Total: 20 cuotas';
        document.getElementById('mesGenerar').required = true;
        document.getElementById('añoCompleto').required = false;
    }
}

function mostrarFormPagoMultiple() {
    const cuotasPendientes = cuotas.filter(c => !c.pagado);
    
    if (cuotasPendientes.length === 0) {
        alert('No hay cuotas pendientes');
        return;
    }
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3>Pago Múltiple de Cuotas</h3>
        <form id="formPagoMultiple">
            <div class="form-group">
                <label for="metodoPagoMultiple">Método de pago:</label>
                <select id="metodoPagoMultiple" name="metodo_pago" required>
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="cheque">Cheque</option>
                    <option value="debito">Débito automático</option>
                </select>
            </div>
            <div class="form-group">
                <label>Seleccionar cuotas a marcar como pagadas:</label>
                <div class="cuotas-list" style="max-height: 300px; overflow-y: auto; border: 1px solid #ddd; padding: 10px;">
                    ${cuotasPendientes.map(cuota => `
                        <div style="padding: 8px; border-bottom: 1px solid #eee;">
                            <label style="display: flex; align-items: center; gap: 10px;">
                                <input type="checkbox" name="cuotas" value="${cuota.id}">
                                <span>${cuota.usuario_nombre} - ${cuota.departamento} - ${cuota.concepto} - ${formatCurrency(cuota.monto)}</span>
                            </label>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div id="resumenPago" style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0; display: none;">
                <strong>Total a marcar como pagado: <span id="totalSeleccionado">$0</span></strong>
            </div>
            <button type="submit" class="btn-primary">Marcar como Pagadas</button>
        </form>
    `;
    document.getElementById('modal').style.display = 'block';
    
    // Agregar evento para actualizar el total
    const checkboxes = document.querySelectorAll('input[name="cuotas"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', actualizarTotalSeleccionado);
    });
    
    document.getElementById('formPagoMultiple').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const cuotasSeleccionadas = Array.from(document.querySelectorAll('input[name="cuotas"]:checked')).map(cb => cb.value);
        const metodoPago = document.getElementById('metodoPagoMultiple').value;
        
        if (cuotasSeleccionadas.length === 0) {
            alert('Debe seleccionar al menos una cuota');
            return;
        }
        
        try {
            const response = await apiRequest('/cuotas/pagar-multiple', {
                method: 'POST',
                body: {
                    cuotaIds: cuotasSeleccionadas,
                    metodo_pago: metodoPago
                }
            });
            cerrarModal();
            cargarCuotas();
            alert(`${response.cuotasPagadas} cuotas marcadas como pagadas por un total de ${formatCurrency(response.montoTotal)}`);
        } catch (error) {
            alert('Error al procesar pagos: ' + error.message);
        }
    });
}

function actualizarTotalSeleccionado() {
    const cuotasSeleccionadas = Array.from(document.querySelectorAll('input[name="cuotas"]:checked'));
    const total = cuotasSeleccionadas.reduce((sum, checkbox) => {
        const cuota = cuotas.find(c => c.id == checkbox.value);
        return sum + (cuota ? cuota.monto : 0);
    }, 0);
    
    document.getElementById('totalSeleccionado').textContent = formatCurrency(total);
    document.getElementById('resumenPago').style.display = cuotasSeleccionadas.length > 0 ? 'block' : 'none';
}

function cargarFiltrosMes() {
    const meses = [...new Set(cuotas.map(c => {
        const fecha = new Date(c.fecha_vencimiento);
        return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    }))].sort().reverse();
    
    const select = document.getElementById('filtroMesCuotas');
    select.innerHTML = '<option value="">Todos los períodos</option>' + 
        meses.map(mes => `<option value="${mes}">${mes}</option>`).join('');
}

function filtrarCuotasPorMes() {
    const mesSeleccionado = document.getElementById('filtroMesCuotas').value;
    const estadoSeleccionado = document.getElementById('filtroEstadoCuotas').value;
    
    let cuotasFiltradas = cuotas;
    
    if (mesSeleccionado) {
        cuotasFiltradas = cuotasFiltradas.filter(c => c.fecha_vencimiento.startsWith(mesSeleccionado));
    }
    
    if (estadoSeleccionado) {
        cuotasFiltradas = cuotasFiltradas.filter(c => {
            const estado = c.pagado ? 'pagado' : (new Date(c.fecha_vencimiento) < new Date() ? 'vencido' : 'pendiente');
            return estado === estadoSeleccionado;
        });
    }
    
    mostrarCuotas(cuotasFiltradas);
}

function filtrarCuotasPorEstado() {
    filtrarCuotasPorMes(); // Reutiliza la lógica de filtrado
}

function seleccionarTodasCuotas() {
    const selectAll = document.getElementById('selectAllCuotas');
    const checkboxes = document.querySelectorAll('.cuota-checkbox:not(:disabled)');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });
}

function filtrarCuotasPorTipo() {
    const tipoSeleccionado = document.getElementById('filtroTipoCuotas').value;
    const mesSeleccionado = document.getElementById('filtroMesCuotas').value;
    const estadoSeleccionado = document.getElementById('filtroEstadoCuotas').value;
    
    let cuotasFiltradas = cuotas;
    
    if (tipoSeleccionado) {
        cuotasFiltradas = cuotasFiltradas.filter(c => c.tipo_cuota === tipoSeleccionado);
    }
    
    if (mesSeleccionado) {
        cuotasFiltradas = cuotasFiltradas.filter(c => c.fecha_vencimiento.startsWith(mesSeleccionado));
    }
    
    if (estadoSeleccionado) {
        cuotasFiltradas = cuotasFiltradas.filter(c => {
            const estado = c.pagado ? 'pagado' : (new Date(c.fecha_vencimiento) < new Date() ? 'vencido' : 'pendiente');
            return estado === estadoSeleccionado;
        });
    }
    
    mostrarCuotas(cuotasFiltradas);
}

// Funciones para gestión de parcialidades
async function cargarParcialidades() {
    try {
        await cargarCuotas(); // Cargar cuotas primero
        cuotasFondoMayor = cuotas.filter(c => c.tipo_cuota === 'fondo_mayor');
        cargarSelectorDepartamentos();
        actualizarResumenFondo();
    } catch (error) {
        console.error('Error cargando parcialidades:', error);
    }
}

function cargarSelectorDepartamentos() {
    const selector = document.getElementById('selectorDepartamento');
    if (!selector) return;
    
    // Crear un mapa para eliminar duplicados por usuario_id
    const inquilinosMap = new Map();
    cuotas.forEach(c => {
        if (!inquilinosMap.has(c.usuario_id)) {
            inquilinosMap.set(c.usuario_id, {
                id: c.usuario_id,
                nombre: c.usuario_nombre,
                departamento: c.departamento
            });
        }
    });
    
    const inquilinos = Array.from(inquilinosMap.values())
        .sort((a, b) => a.departamento.localeCompare(b.departamento));
    
    selector.innerHTML = '<option value="">Seleccionar departamento...</option>' +
        inquilinos.map(inq => 
            `<option value="${inq.id}">${inq.departamento} - ${inq.nombre}</option>`
        ).join('');
}

async function cargarParcialidadesDepartamento() {
    const usuarioId = document.getElementById('selectorDepartamento').value;
    if (!usuarioId) {
        document.getElementById('detalleDepartamento').style.display = 'none';
        return;
    }

    try {
        const respuesta = await apiRequest(`/cuotas/fondo-mayor/${usuarioId}`);
        mostrarDetalleDepartamento(respuesta);
    } catch (error) {
        console.error('Error cargando parcialidades del departamento:', error);
    }
}

function mostrarDetalleDepartamento(data) {
    const detalle = document.getElementById('detalleDepartamento');
    detalle.style.display = 'block';
    
    document.getElementById('nombreDepartamento').textContent = 
        `${data.usuario.departamento} - ${data.usuario.nombre}`;
    document.getElementById('montoPagadoDepto').textContent = data.resumen_pago.monto_pagado;
    document.getElementById('saldoPendienteDepto').textContent = data.resumen_pago.saldo_pendiente;
    
    const statusDepto = document.getElementById('statusDepto');
    if (data.resumen_pago.completado) {
        statusDepto.textContent = 'COMPLETADO';
        statusDepto.className = 'status-badge COMPLETADO';
        document.getElementById('btnParcialidad').style.display = 'none';
        document.getElementById('btnCompleto').style.display = 'none';
    } else {
        statusDepto.textContent = data.resumen_pago.monto_pagado > 0 ? 'PARCIAL' : 'PENDIENTE';
        statusDepto.className = 'status-badge';
        document.getElementById('btnParcialidad').style.display = 'inline-block';
        document.getElementById('btnCompleto').style.display = 'inline-block';
    }
    
    // Mostrar historial de parcialidades
    const tbody = document.querySelector('#tablaParcialidades tbody');
    tbody.innerHTML = data.parcialidades.map(p => `
        <tr>
            <td>${formatDate(p.fecha_pago)}</td>
            <td>${formatCurrency(p.monto)}</td>
            <td>${p.metodo_pago}</td>
            <td>${p.observaciones || '-'}</td>
        </tr>
    `).join('');
    
    // Guardar datos para uso en formularios
    window.currentDepartamento = data;
}

function mostrarFormParcialidad() {
    if (!window.currentDepartamento) return;
    
    const saldoPendiente = window.currentDepartamento.resumen_pago.saldo_pendiente;
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <h3>Registrar Pago - Fondo Gastos Mayores</h3>
        <div class="info-card">
            <h4>${window.currentDepartamento.usuario.departamento} - ${window.currentDepartamento.usuario.nombre}</h4>
            <p>Saldo Pendiente: <strong>${formatCurrency(saldoPendiente)}</strong></p>
        </div>
        
        <form id="formParcialidad">
            <div class="form-group">
                <label for="montoParcialidad">Monto del Pago:</label>
                <input type="number" id="montoParcialidad" name="monto_parcialidad" 
                       step="0.01" min="1" max="${saldoPendiente}" required>
                <small>Máximo: $${saldoPendiente} MXN</small>
            </div>
            <div class="form-group">
                <label for="metodoPagoParcial">Método de Pago:</label>
                <select id="metodoPagoParcial" name="metodo_pago" required>
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="deposito">Depósito Bancario</option>
                    <option value="mercado_pago">Mercado Pago</option>
                    <option value="debito">Débito</option>
                </select>
            </div>
            <div class="form-group">
                <label for="fechaPagoParcial">Fecha del Pago:</label>
                <input type="date" id="fechaPagoParcial" name="fecha_pago" 
                       value="${new Date().toISOString().split('T')[0]}" required>
            </div>
            <div class="form-group">
                <label for="observacionesParcial">Observaciones (opcional):</label>
                <textarea id="observacionesParcial" name="observaciones" 
                          placeholder="Número de referencia, comprobante, etc."></textarea>
            </div>
            
            <div class="pago-buttons">
                <button type="submit" class="btn-primary">Registrar Pago</button>
                <button type="button" onclick="pagarCompleto(${saldoPendiente})" class="btn-success">Pagar Total (${formatCurrency(saldoPendiente)})</button>
            </div>
        </form>
    `;
    
    document.getElementById('modal').style.display = 'block';
    
    document.getElementById('formParcialidad').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
            await apiRequest(`/cuotas/${window.currentDepartamento.cuota.id}/parcialidad`, {
                method: 'POST',
                body: data
            });
            cerrarModal();
            cargarParcialidadesDepartamento(); // Recargar el departamento actual
            actualizarResumenFondo();
        } catch (error) {
            alert('Error al registrar pago: ' + error.message);
        }
    });
}

function pagarCompleto(saldoPendiente) {
    document.getElementById('montoParcialidad').value = saldoPendiente;
}

async function marcarFondoCompleto() {
    if (!window.currentDepartamento) return;
    
    const saldoPendiente = window.currentDepartamento.resumen_pago.saldo_pendiente;
    
    if (saldoPendiente <= 0) {
        alert('Esta cuota ya está completamente pagada');
        return;
    }
    
    if (confirm(`¿Marcar como pagado completo por $${saldoPendiente} MXN?`)) {
        const metodo = prompt('Método de pago:') || 'efectivo';
        
        try {
            await apiRequest(`/cuotas/${window.currentDepartamento.cuota.id}/parcialidad`, {
                method: 'POST',
                body: {
                    monto_parcialidad: saldoPendiente,
                    metodo_pago: metodo,
                    fecha_pago: new Date().toISOString().split('T')[0],
                    observaciones: 'Pago completo'
                }
            });
            cargarParcialidadesDepartamento();
            actualizarResumenFondo();
            alert('Fondo de Gastos Mayores marcado como completado');
        } catch (error) {
            alert('Error al marcar como completo: ' + error.message);
        }
    }
}

async function actualizarResumenFondo() {
    try {
        const cuotasFondo = cuotas.filter(c => c.tipo_cuota === 'fondo_mayor');
        const totalRecaudado = cuotasFondo.reduce((sum, c) => sum + (c.monto_pagado || 0), 0);
        const totalPendiente = 100000 - totalRecaudado;
        const deptosCompletos = cuotasFondo.filter(c => c.pagado).length;
        
        document.getElementById('totalRecaudadoFondo').textContent = formatCurrency(totalRecaudado);
        document.getElementById('totalPendienteFondo').textContent = formatCurrency(totalPendiente);
        document.getElementById('deptosAlDia').textContent = `${deptosCompletos}/20`;
    } catch (error) {
        console.error('Error actualizando resumen fondo:', error);
    }
}

function gestionarParcialidades(cuotaId) {
    const cuota = cuotas.find(c => c.id === cuotaId);
    if (cuota) {
        document.getElementById('selectorDepartamento').value = cuota.usuario_id;
        cargarParcialidadesDepartamento();
        
        // Cambiar a la pestaña de parcialidades
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.querySelector('a[href="#parcialidades"]').classList.add('active');
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById('parcialidades').classList.add('active');
    }
}

// Funciones para cierre 2024 y preparación 2025
async function generarCuotas2025() {
    if (confirm('¿Generar todas las cuotas para el año 2026? Esta acción creará 260 cuotas (12 mensuales + 1 fondo anual por cada uno de los 20 departamentos).')) {
        try {
            const response = await apiRequest('/cuotas/generar-2026', {
                method: 'POST'
            });
            
            alert(`Cuotas 2026 generadas exitosamente:\\n• ${response.estructura.cuotas_mensuales} cuotas mensuales\\n• ${response.estructura.cuotas_fondo_mayor} cuotas fondo gastos mayores\\n• Total: ${response.cuotasCreadas} cuotas\\n\\n📅 VENCIMIENTOS:\\n• Cuotas mensuales: 1 del mes siguiente\\n• Fondo gastos mayores: 1 abril 2026`);
            
            document.getElementById('preparacion2025').textContent = 'Completado';
            document.getElementById('preparacion2025').parentElement.classList.add('success');
            
        } catch (error) {
            alert('Error al generar cuotas 2026: ' + error.message);
        }
    }
}

async function procesarCierreMensual() {
    const mes = prompt('¿Qué mes desea cerrar? (2025-11 para noviembre, 2025-12 para diciembre):', '2025-11');
    
    if (mes && confirm(`¿Procesar cierre mensual de ${mes}? Esta acción generará el reporte mensual con ingresos, egresos y actualización de saldos.`)) {
        try {
            const response = await apiRequest('/cierres', {
                method: 'POST',
                body: { 
                    periodo: mes, 
                    tipo: 'mensual',
                    incluir_saldos_fondos: true
                }
            });
            
            alert(`Cierre mensual ${mes} procesado exitosamente`);
            cargarCierres();
            cargarDashboard();
            
        } catch (error) {
            alert('Error al procesar cierre mensual: ' + error.message);
        }
    }
}

async function procesarCierreAnual() {
    if (confirm('¿Procesar cierre anual 2025? Esta acción generará el reporte final del ejercicio con los saldos de fondos actualizados y preparará la base para 2026.')) {
        try {
            const response = await apiRequest('/cierres', {
                method: 'POST',
                body: { 
                    periodo: '2025', 
                    tipo: 'anual',
                    incluir_saldos_fondos: true
                }
            });
            
            alert('Cierre anual 2025 procesado exitosamente. Sistema preparado para 2026.');
            cargarCierres();
            cargarDashboard();
            
        } catch (error) {
            alert('Error al procesar cierre anual: ' + error.message);
        }
    }
}

async function mostrarResumenPatrimonial() {
    try {
        const saldos = await apiRequest('/fondos/saldos');
        
        const mensaje = `RESUMEN PATRIMONIAL AL ${saldos.fecha_corte}:\\n\\n` +
                       `💰 FONDOS ACUMULADOS:\\n` +
                       `• Fondo Ahorro: ${formatCurrency(saldos.fondo_ahorro_acumulado)}\\n` +
                       `• Fondo Gastos Mayores: ${formatCurrency(saldos.fondo_gastos_mayores_actual)}\\n` +
                       `• Dinero Operacional: ${formatCurrency(saldos.dinero_operacional)}\\n\\n` +
                       `💎 PATRIMONIO TOTAL: ${formatCurrency(saldos.patrimonio_total_actual)}\\n\\n` +
                       `📊 ANÁLISIS:\\n` +
                       `• Capital disponible para proyectos 2025\\n` +
                       `• Situación financiera sólida\\n` +
                       `• Fondos suficientes para contingencias`;
        
        alert(mensaje);
        
    } catch (error) {
        console.error('Error cargando resumen patrimonial:', error);
        alert('Error al cargar resumen patrimonial');
    }
}

// ===== GESTIÓN DE USUARIOS =====
let usuarios = [];

async function cargarUsuarios() {
    try {
        usuarios = await apiRequest('/usuarios');
        mostrarUsuarios();
    } catch (error) {
        console.error('Error cargando usuarios:', error);
    }
}

function mostrarUsuarios() {
    const tbody = document.querySelector('#tablaUsuarios tbody');
    tbody.innerHTML = usuarios.map(usuario => `
        <tr>
            <td>${usuario.nombre}</td>
            <td>${usuario.email}</td>
            <td>${usuario.departamento}</td>
            <td>${usuario.telefono || '-'}</td>
            <td>
                <span class="status-badge ${usuario.rol}">${usuario.rol.toUpperCase()}</span>
                ${usuario.rol === 'inquilino' ? `
                    <span class="status-badge ${usuario.estatus_validacion || 'pendiente'}">
                        ${(usuario.estatus_validacion || 'pendiente').toUpperCase()}
                    </span>
                ` : ''}
            </td>
            <td>
                <button onclick="editarUsuario(${usuario.id})" class="btn-secondary btn-sm">Editar</button>
                ${usuario.rol === 'inquilino' ? `
                    <button onclick="toggleValidacion(${usuario.id})" class="btn-primary btn-sm">
                        ${usuario.estatus_validacion === 'validado' ? 'Desvalidar' : 'Validar'}
                    </button>
                ` : ''}
                ${usuario.id !== 1 ? `
                    <button onclick="eliminarUsuario(${usuario.id})" class="btn-danger btn-sm">Eliminar</button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

function mostrarFormUsuario(usuario = null) {
    const modalBody = document.getElementById('modalBody');
    const isEdit = usuario !== null;
    
    modalBody.innerHTML = `
        <h3>${isEdit ? 'Editar' : 'Nuevo'} Usuario</h3>
        <form id="formUsuario">
            <div class="form-group">
                <label for="nombreUsuario">Nombre:</label>
                <input type="text" id="nombreUsuario" name="nombre" value="${usuario?.nombre || ''}" required>
            </div>
            <div class="form-group">
                <label for="emailUsuario">Email:</label>
                <input type="email" id="emailUsuario" name="email" value="${usuario?.email || ''}" required>
            </div>
            <div class="form-group">
                <label for="rolUsuario">Rol:</label>
                <select id="rolUsuario" name="rol" required>
                    <option value="inquilino" ${usuario?.rol === 'inquilino' ? 'selected' : ''}>Inquilino</option>
                    <option value="admin" ${usuario?.rol === 'admin' ? 'selected' : ''}>Administrador</option>
                </select>
            </div>
            <div class="form-group">
                <label for="departamentoUsuario">Departamento:</label>
                <input type="text" id="departamentoUsuario" name="departamento" 
                       value="${usuario?.departamento || ''}" placeholder="Ej: 101, 102, ..." required>
            </div>
            <div class="form-group">
                <label for="telefonoUsuario">Teléfono:</label>
                <input type="tel" id="telefonoUsuario" name="telefono" value="${usuario?.telefono || ''}">
            </div>
            ${!isEdit ? `
                <div class="form-group">
                    <label for="passwordUsuario">Contraseña:</label>
                    <input type="password" id="passwordUsuario" name="password" required>
                </div>
            ` : ''}
            <div class="form-buttons">
                <button type="submit" class="btn-primary">${isEdit ? 'Actualizar' : 'Crear'}</button>
                <button type="button" onclick="cerrarModal()" class="btn-secondary">Cancelar</button>
            </div>
        </form>
    `;
    
    document.getElementById('modal').style.display = 'block';
    
    document.getElementById('formUsuario').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
            if (isEdit) {
                await apiRequest(`/usuarios/${usuario.id}`, {
                    method: 'PUT',
                    body: data
                });
                alert('Usuario actualizado exitosamente');
            } else {
                await apiRequest('/usuarios', {
                    method: 'POST',
                    body: data
                });
                alert('Usuario creado exitosamente');
            }
            cerrarModal();
            cargarUsuarios();
        } catch (error) {
            alert('Error al ' + (isEdit ? 'actualizar' : 'crear') + ' usuario: ' + error.message);
        }
    });
}

async function editarUsuario(id) {
    const usuario = usuarios.find(u => u.id === id);
    if (usuario) {
        mostrarFormUsuario(usuario);
    }
}

async function eliminarUsuario(id) {
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) return;
    
    if (confirm(`¿Eliminar usuario ${usuario.nombre}? Esta acción no se puede deshacer.`)) {
        try {
            await apiRequest(`/usuarios/${id}`, { method: 'DELETE' });
            alert('Usuario eliminado exitosamente');
            cargarUsuarios();
        } catch (error) {
            alert('Error al eliminar usuario: ' + error.message);
        }
    }
}

async function toggleValidacion(id) {
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) return;
    
    const nuevoEstatus = usuario.estatus_validacion === 'validado' ? 'pendiente' : 'validado';
    
    try {
        await apiRequest(`/usuarios/${id}`, {
            method: 'PUT',
            body: { estatus_validacion: nuevoEstatus }
        });
        alert(`Usuario ${nuevoEstatus === 'validado' ? 'validado' : 'marcado como pendiente'} exitosamente`);
        cargarUsuarios();
    } catch (error) {
        alert('Error al actualizar validación: ' + error.message);
    }
}