let misCuotas = [];
let anuncios = [];
let misSolicitudes = [];
let presupuestos = [];

document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;
    
    initNavigation();
    cargarDashboard();
});

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href').substring(1);
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            
            document.getElementById(targetId).classList.add('active');
            
            switch(targetId) {
                case 'cuotas':
                    cargarMisCuotas();
                    break;
                case 'anuncios':
                    cargarAnuncios();
                    break;
                case 'solicitudes':
                    cargarMisSolicitudes();
                    break;
                case 'presupuestos':
                    cargarPresupuestos();
                    break;
                case 'dashboard':
                    cargarDashboard();
                    break;
            }
        });
    });
}

async function cargarDashboard() {
    try {
        const [cuotasData, anunciosData, solicitudesData] = await Promise.all([
            apiRequest('/cuotas'),
            apiRequest('/anuncios'),
            apiRequest('/solicitudes')
        ]);

        // Separar cuotas mensuales del fondo de gastos mayores
        const cuotasMensuales = cuotasData.filter(c => c.tipo_cuota === 'mensual');
        const cuotaFondoMayor = cuotasData.find(c => c.tipo_cuota === 'fondo_mayor');
        
        // Cuotas mensuales pendientes
        const cuotasMensualesPendientes = cuotasMensuales.filter(c => !c.pagado);
        const montoCuotasPendientes = cuotasMensualesPendientes.reduce((sum, c) => sum + c.monto, 0);
        
        // Saldo restante del fondo de gastos mayores (si no está completamente pagado)
        let saldoFondo = 0;
        let estadoFondo = 'PAGADO';
        let detallesFondo = 'Fondo completo';
        
        if (cuotaFondoMayor && !cuotaFondoMayor.pagado) {
            saldoFondo = cuotaFondoMayor.monto - (cuotaFondoMayor.monto_pagado || 0);
            const montoPagado = cuotaFondoMayor.monto_pagado || 0;
            
            if (montoPagado > 0) {
                estadoFondo = 'PARCIAL';
                detallesFondo = `$${montoPagado} pagado de $5,000`;
            } else {
                estadoFondo = 'PENDIENTE';
                detallesFondo = 'Sin pagos registrados';
            }
        }
        
        // Total a pagar = cuotas mensuales pendientes + saldo del fondo (si aplica)
        const totalAPagar = montoCuotasPendientes + saldoFondo;
        
        // Crear desglose detallado del total a pagar
        let desglose = '';
        const partes = [];
        
        if (montoCuotasPendientes > 0) {
            partes.push(`${formatCurrency(montoCuotasPendientes)} (${cuotasMensualesPendientes.length} cuota${cuotasMensualesPendientes.length > 1 ? 's' : ''} mensual${cuotasMensualesPendientes.length > 1 ? 'es' : ''})`);
        }
        
        if (saldoFondo > 0) {
            partes.push(`${formatCurrency(saldoFondo)} (saldo fondo gastos)`);
        }
        
        if (partes.length > 0) {
            desglose = partes.join(' + ');
        } else {
            desglose = 'Todo pagado al día 🎉';
        }

        // Actualizar dashboard
        document.getElementById('misCuotasPendientes').textContent = cuotasMensualesPendientes.length;
        document.getElementById('miMontoPendiente').textContent = formatCurrency(totalAPagar);
        document.getElementById('desglosePago').textContent = desglose;
        document.getElementById('misSolicitudes').textContent = solicitudesData.length;
        document.getElementById('estadoFondoDashboard').textContent = estadoFondo;
        document.getElementById('saldoFondoDashboard').textContent = detallesFondo;

        mostrarAnunciosImportantes(anunciosData);
    } catch (error) {
        console.error('Error cargando dashboard:', error);
    }
}

function mostrarAnunciosImportantes(anunciosData) {
    const anunciosImportantes = anunciosData
        .filter(a => a.activo && (a.tipo === 'urgente' || a.tipo === 'mantenimiento'))
        .slice(0, 3);

    const container = document.getElementById('anunciosImportantes');
    
    if (anunciosImportantes.length === 0) {
        container.innerHTML = '<p>No hay anuncios importantes en este momento.</p>';
        return;
    }

    container.innerHTML = anunciosImportantes.map(anuncio => `
        <div class="announcement-card ${anuncio.tipo}">
            <h4>${anuncio.titulo}</h4>
            <div class="announcement-meta">
                <span class="badge ${anuncio.tipo}">${anuncio.tipo}</span>
                <span>${formatDate(anuncio.created_at)}</span>
            </div>
            <div class="announcement-content">
                ${anuncio.contenido}
            </div>
        </div>
    `).join('');
}

async function cargarMisCuotas() {
    try {
        misCuotas = await apiRequest('/cuotas');
        mostrarMisCuotas();
        actualizarResumenCuotas();
        cargarEstadoFondoMayor();
    } catch (error) {
        console.error('Error cargando cuotas:', error);
    }
}

function mostrarMisCuotas(cuotasFiltradas = null) {
    // Mostrar solo cuotas mensuales en esta tabla
    const cuotasMensuales = (cuotasFiltradas || misCuotas).filter(c => c.tipo_cuota === 'mensual');
    
    // Ordenar por mes (fecha de vencimiento)
    const cuotasOrdenadas = cuotasMensuales.sort((a, b) => 
        new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento)
    );
    
    const tbody = document.querySelector('#tablaCuotasInquilino tbody');
    tbody.innerHTML = cuotasOrdenadas.map(cuota => {
        const estado = cuota.pagado ? 'pagado' : (new Date(cuota.fecha_vencimiento) < new Date() ? 'vencido' : 'pendiente');
        const mesNombre = cuota.concepto.replace('Cuota Mensual ', '').split(' ')[0];
        
        return `
            <tr class="cuota-row ${estado}">
                <td><strong>${mesNombre}</strong></td>
                <td>${formatCurrency(cuota.monto)}</td>
                <td>${formatDate(cuota.fecha_vencimiento)}</td>
                <td><span class="badge ${estado}">${estado.toUpperCase()}</span></td>
                <td>${cuota.fecha_pago ? formatDate(cuota.fecha_pago) : '-'}</td>
                <td>${cuota.metodo_pago || '-'}</td>
            </tr>
        `;
    }).join('');
}

function mostrarCuotasTipo(tipo) {
    // Cambiar pestaña activa
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tipo === 'mensual' ? 'tabMensual' : 'tabFondo').classList.add('active');
    
    // Cambiar contenido activo
    document.querySelectorAll('.cuotas-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tipo === 'mensual' ? 'cuotasMensuales' : 'fondoMayor').classList.add('active');
    
    if (tipo === 'fondo_mayor') {
        cargarEstadoFondoMayor();
    }
}

// Función cargarEstadoFondoMayor movida más abajo en el archivo
// Función mostrarEstadoFondoMayor movida más abajo en el archivo
// Eliminada duplicación aquí

function actualizarResumenCuotas() {
    const cuotasMensuales = misCuotas.filter(c => c.tipo_cuota === 'mensual');
    const cuotasFondo = misCuotas.filter(c => c.tipo_cuota === 'fondo_mayor');
    
    const cuotasMensualesPendientes = cuotasMensuales.filter(c => !c.pagado);
    const cuotasMensualesPagadas = cuotasMensuales.filter(c => c.pagado);
    
    const totalPendienteMensual = cuotasMensualesPendientes.reduce((sum, c) => sum + c.monto, 0);
    
    document.getElementById('cuotasMensualesPendientes').textContent = formatCurrency(totalPendienteMensual);
    document.getElementById('cuotasMensualesPagadas').textContent = `${cuotasMensualesPagadas.length}/12`;
    
    // Estado del fondo de gastos mayores
    const fondoMayor = cuotasFondo[0];
    if (fondoMayor) {
        const montoPagado = fondoMayor.monto_pagado || 0;
        document.getElementById('fondoGastosMayores').textContent = `$${montoPagado} / $5,000`;
    }
    
    // Próximo vencimiento (solo cuotas mensuales)
    if (cuotasMensualesPendientes.length > 0) {
        const cuotasFuturas = cuotasMensualesPendientes
            .filter(c => new Date(c.fecha_vencimiento) >= new Date())
            .sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento));
            
        if (cuotasFuturas.length > 0) {
            const proximaFecha = cuotasFuturas[0].fecha_vencimiento;
            const nombreMes = cuotasFuturas[0].concepto.replace('Cuota Mensual ', '').split(' ')[0];
            document.getElementById('proximoVencimiento').textContent = `${nombreMes} - ${formatDate(proximaFecha)}`;
        } else {
            const cuotaVencida = cuotasMensualesPendientes
                .sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento))[0];
            const nombreMes = cuotaVencida.concepto.replace('Cuota Mensual ', '').split(' ')[0];
            document.getElementById('proximoVencimiento').textContent = `${nombreMes} - VENCIDA`;
        }
    } else {
        document.getElementById('proximoVencimiento').textContent = 'Cuotas mensuales al día';
    }
}

async function cargarAnuncios() {
    try {
        anuncios = await apiRequest('/anuncios');
        mostrarAnuncios('todos');
    } catch (error) {
        console.error('Error cargando anuncios:', error);
    }
}

function mostrarAnuncios(filtro = 'todos') {
    let anunciosFiltrados = anuncios;
    
    if (filtro !== 'todos') {
        anunciosFiltrados = anuncios.filter(a => a.tipo === filtro);
    }

    const container = document.getElementById('listaAnuncios');
    
    if (anunciosFiltrados.length === 0) {
        container.innerHTML = '<p>No hay anuncios disponibles.</p>';
        return;
    }

    container.innerHTML = anunciosFiltrados.map(anuncio => `
        <div class="announcement-card ${anuncio.tipo}">
            <h4>${anuncio.titulo}</h4>
            <div class="announcement-meta">
                <span class="badge ${anuncio.tipo}">${anuncio.tipo}</span>
                <span>Por: ${anuncio.autor_nombre} - ${formatDate(anuncio.created_at)}</span>
            </div>
            <div class="announcement-content">
                ${anuncio.contenido}
            </div>
            ${anuncio.fecha_expiracion ? `
                <div style="margin-top: 10px; font-size: 12px; color: #666;">
                    Válido hasta: ${formatDate(anuncio.fecha_expiracion)}
                </div>
            ` : ''}
        </div>
    `).join('');
}

function filtrarAnuncios(tipo) {
    document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    mostrarAnuncios(tipo);
}

async function cargarMisSolicitudes() {
    try {
        misSolicitudes = await apiRequest('/solicitudes');
        mostrarMisSolicitudes();
    } catch (error) {
        console.error('Error cargando solicitudes:', error);
    }
}

function mostrarMisSolicitudes() {
    const tbody = document.querySelector('#tablaSolicitudesInquilino tbody');
    tbody.innerHTML = misSolicitudes.map(solicitud => `
        <tr>
            <td>${solicitud.titulo}</td>
            <td>${solicitud.tipo}</td>
            <td><span class="badge ${solicitud.prioridad}">${solicitud.prioridad}</span></td>
            <td><span class="badge ${solicitud.estado}">${solicitud.estado}</span></td>
            <td>${formatDate(solicitud.created_at)}</td>
            <td>
                <button onclick="verSolicitud(${solicitud.id})" class="btn-secondary">Ver</button>
                ${solicitud.estado === 'pendiente' ? `<button onclick="eliminarSolicitud(${solicitud.id})" class="btn-danger">Eliminar</button>` : ''}
            </td>
        </tr>
    `).join('');
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
    const tbody = document.querySelector('#tablaPresupuestosInquilino tbody');
    tbody.innerHTML = presupuestos.map(presupuesto => `
        <tr>
            <td>${presupuesto.titulo}</td>
            <td>${formatCurrency(presupuesto.monto_total)}</td>
            <td><span class="badge ${presupuesto.estado}">${presupuesto.estado}</span></td>
            <td>${formatDate(presupuesto.fecha_inicio || presupuesto.created_at)}</td>
            <td>
                <button onclick="verPresupuestoDetalle(${presupuesto.id})" class="btn-secondary">Ver Detalle</button>
            </td>
        </tr>
    `).join('');
}

function mostrarFormSolicitud() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3>Nueva Solicitud</h3>
        <form id="formSolicitud">
            <div class="form-group">
                <label for="tipo">Tipo:</label>
                <select id="tipo" name="tipo" required>
                    <option value="">Seleccionar...</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="reclamo">Reclamo</option>
                    <option value="mejora">Mejora</option>
                    <option value="consulta">Consulta</option>
                    <option value="otro">Otro</option>
                </select>
            </div>
            <div class="form-group">
                <label for="titulo">Título:</label>
                <input type="text" id="titulo" name="titulo" required>
            </div>
            <div class="form-group">
                <label for="descripcion">Descripción:</label>
                <textarea id="descripcion" name="descripcion" required></textarea>
            </div>
            <div class="form-group">
                <label for="prioridad">Prioridad:</label>
                <select id="prioridad" name="prioridad" required>
                    <option value="baja">Baja</option>
                    <option value="media" selected>Media</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                </select>
            </div>
            <button type="submit" class="btn-primary">Enviar Solicitud</button>
        </form>
    `;
    document.getElementById('modal').style.display = 'block';
    
    document.getElementById('formSolicitud').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
            await apiRequest('/solicitudes', {
                method: 'POST',
                body: data
            });
            cerrarModal();
            cargarMisSolicitudes();
            alert('Solicitud enviada exitosamente');
        } catch (error) {
            alert('Error al enviar solicitud: ' + error.message);
        }
    });
}

function filtrarMisCuotas() {
    const estado = document.getElementById('filtroEstadoCuotasInquilino').value;
    
    if (!estado) {
        mostrarMisCuotas();
        return;
    }
    
    const cuotasFiltradas = misCuotas.filter(cuota => {
        if (cuota.tipo_cuota !== 'mensual') return false; // Solo cuotas mensuales en esta vista
        const estadoCuota = cuota.pagado ? 'pagado' : (new Date(cuota.fecha_vencimiento) < new Date() ? 'vencido' : 'pendiente');
        return estadoCuota === estado;
    });
    
    mostrarMisCuotas(cuotasFiltradas);
}

async function cargarEstadoFondoMayor() {
    try {
        const userInfo = getUserInfo();
        const respuesta = await apiRequest(`/cuotas/fondo-mayor/${userInfo.id}`);
        mostrarEstadoFondoMayor(respuesta);
    } catch (error) {
        console.error('Error cargando fondo mayor:', error);
    }
}

function mostrarEstadoFondoMayor(data) {
    const montoPagado = data.resumen_pago.monto_pagado;
    const saldoPendiente = data.resumen_pago.saldo_pendiente;
    const porcentaje = (montoPagado / 5000) * 100;
    
    document.getElementById('progressFondo').style.width = porcentaje + '%';
    document.getElementById('montoPagadoFondo').textContent = montoPagado;
    document.getElementById('saldoPendienteFondo').textContent = saldoPendiente;
    
    const estadoFondo = document.getElementById('estadoFondo');
    if (data.resumen_pago.completado) {
        estadoFondo.textContent = 'COMPLETADO';
        estadoFondo.className = 'badge pagado';
    } else if (montoPagado > 0) {
        estadoFondo.textContent = 'PARCIAL';
        estadoFondo.className = 'badge en_progreso';
    } else {
        estadoFondo.textContent = 'PENDIENTE';
        estadoFondo.className = 'badge pendiente';
    }
    
    // Mostrar historial de parcialidades
    const tbody = document.querySelector('#tablaParcialidadesInquilino tbody');
    if (data.parcialidades.length > 0) {
        tbody.innerHTML = data.parcialidades.map(p => `
            <tr>
                <td>${formatDate(p.fecha_pago)}</td>
                <td>${formatCurrency(p.monto)}</td>
                <td>${p.metodo_pago}</td>
                <td>${p.observaciones || '-'}</td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: #666;">
                    Aún no hay pagos registrados para el fondo 2026
                </td>
            </tr>
        `;
    }
}



function verSolicitud(id) {
    const solicitud = misSolicitudes.find(s => s.id === id);
    let mensaje = `Solicitud: ${solicitud.titulo}
`;
    mensaje += `Tipo: ${solicitud.tipo}
`;
    mensaje += `Prioridad: ${solicitud.prioridad}
`;
    mensaje += `Estado: ${solicitud.estado}
`;
    mensaje += `Fecha: ${formatDate(solicitud.created_at)}
`;
    mensaje += `Descripción: ${solicitud.descripcion}
`;
    
    if (solicitud.respuesta) {
        mensaje += `
Respuesta del administrador:
${solicitud.respuesta}`;
        mensaje += `
Fecha de respuesta: ${formatDateTime(solicitud.fecha_respuesta)}`;
    }
    
    alert(mensaje);
}

function verPresupuestoDetalle(id) {
    const presupuesto = presupuestos.find(p => p.id === id);
    let mensaje = `Presupuesto: ${presupuesto.titulo}
`;
    mensaje += `Monto Total: ${formatCurrency(presupuesto.monto_total)}
`;
    mensaje += `Estado: ${presupuesto.estado}
`;
    mensaje += `Descripción: ${presupuesto.descripcion || 'No disponible'}
`;
    
    if (presupuesto.fecha_inicio) {
        mensaje += `Fecha inicio: ${formatDate(presupuesto.fecha_inicio)}
`;
    }
    if (presupuesto.fecha_fin) {
        mensaje += `Fecha fin: ${formatDate(presupuesto.fecha_fin)}`;
    }
    
    alert(mensaje);
}

async function eliminarSolicitud(id) {
    if (confirm('¿Está seguro de eliminar esta solicitud?')) {
        try {
            await apiRequest(`/solicitudes/${id}`, { method: 'DELETE' });
            cargarMisSolicitudes();
        } catch (error) {
            alert('Error al eliminar solicitud: ' + error.message);
        }
    }
}

function cerrarModal() {
    document.getElementById('modal').style.display = 'none';
}

function mostrarFormPropuesta() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3>Nueva Propuesta</h3>
        <p><em>Esta funcionalidad estará disponible próximamente para permitir que los inquilinos propongan mejoras al edificio.</em></p>
        <form id="formPropuesta">
            <div class="form-group">
                <label for="tituloPropuesta">Título:</label>
                <input type="text" id="tituloPropuesta" name="titulo" required placeholder="Ej: Instalación de cámaras de seguridad">
            </div>
            <div class="form-group">
                <label for="descripcionPropuesta">Descripción:</label>
                <textarea id="descripcionPropuesta" name="descripcion" required 
                         placeholder="Describe detalladamente tu propuesta..."></textarea>
            </div>
            <div class="form-group">
                <label for="costoEstimado">Costo Estimado (opcional):</label>
                <input type="number" id="costoEstimado" name="costo_estimado" step="0.01" 
                       placeholder="Ej: 15000.00">
            </div>
            <div class="form-group">
                <label for="beneficiosPropuesta">Beneficios:</label>
                <textarea id="beneficiosPropuesta" name="beneficios" 
                         placeholder="¿Qué beneficios traería esta propuesta?"></textarea>
            </div>
            <div class="form-buttons">
                <button type="submit" class="btn-primary">Enviar Propuesta</button>
                <button type="button" onclick="cerrarModal()" class="btn-secondary">Cancelar</button>
            </div>
        </form>
        <div class="info-card" style="margin-top: 20px;">
            <h4>ℹ️ Proceso de Propuestas</h4>
            <ol>
                <li>Envías tu propuesta con detalles</li>
                <li>El administrador la revisa</li>
                <li>Se abre período de votación</li>
                <li>Los inquilinos votan</li>
                <li>Se implementa si es aprobada</li>
            </ol>
        </div>
    `;
    
    document.getElementById('modal').style.display = 'block';
    
    document.getElementById('formPropuesta').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Por ahora solo mostrar mensaje
        alert('Funcionalidad de propuestas estará disponible próximamente. Su propuesta ha sido registrada para desarrollo futuro.');
        cerrarModal();
        
        /* Implementación futura:
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
            await apiRequest('/propuestas', {
                method: 'POST',
                body: data
            });
            alert('Propuesta enviada exitosamente');
            cerrarModal();
            // cargarPropuestas(); // Función futura
        } catch (error) {
            alert('Error al enviar propuesta: ' + error.message);
        }
        */
    });
}