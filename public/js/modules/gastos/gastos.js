// gastos.js - Gestión de gastos

// Clase para manejar la gestión de gastos
class GastosManager {
    constructor() {
        this.gastos = [];
        this.gastoModal = new bootstrap.Modal(document.getElementById('gastoModal'));
    }

    // Inicializar gestor
    init() {
        this.setupEventListeners();
    }

    // Configurar listeners de eventos
    setupEventListeners() {
        // Botón guardar gasto
        const btnGuardarGasto = document.getElementById('btnGuardarGasto');
        if (btnGuardarGasto) {
            btnGuardarGasto.addEventListener('click', () => this.guardarGasto());
        }
    }

    // Cargar gastos
    async loadGastos() {
        try {
            const response = await fetchAuth(`${API_URL}/gastos`);
            this.gastos = response.gastos || [];
            this.renderGastosTable();
        } catch (error) {
            console.error('Error al cargar gastos:', error);
            showAlert('alertContainer', 'Error al cargar gastos', 'danger');
        }
    }

    // Renderizar tabla de gastos
    renderGastosTable() {
        const tableBody = document.getElementById('gastosTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (this.gastos.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="7" class="text-center">No hay gastos registrados</td>';
            tableBody.appendChild(tr);
            return;
        }
        
        this.gastos.forEach(gasto => {
            const tr = document.createElement('tr');
            
            // Formatear fecha
            const fecha = new Date(gasto.fecha);
            const fechaStr = fecha.toLocaleDateString();
            
            tr.innerHTML = `
                <td>${gasto.id}</td>
                <td>${gasto.concepto}</td>
                <td><span class="badge bg-secondary">${gasto.categoria}</span></td>
                <td>${gasto.proveedor}</td>
                <td>${fechaStr}</td>
                <td>$${gasto.monto.toLocaleString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" data-action="edit" data-id="${gasto.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${gasto.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(tr);
        });
        
        // Configurar botones de acción
        tableBody.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = button.getAttribute('data-action');
                const id = parseInt(button.getAttribute('data-id'));
                
                if (action === 'edit') {
                    this.editarGasto(id);
                } else if (action === 'delete') {
                    this.eliminarGasto(id);
                }
            });
        });
    }

    // Mostrar modal de gasto
    showGastoModal(gasto = null) {
        // Limpiar formulario
        document.getElementById('gastoForm').reset();
        document.getElementById('gastoId').value = '';
        
        // Configurar fecha actual por defecto
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('gastoFecha').value = today;
        
        // Configurar modal según sea nuevo o edición
        if (gasto) {
            document.getElementById('gastoModalLabel').textContent = 'Editar Gasto';
            document.getElementById('gastoId').value = gasto.id;
            document.getElementById('gastoConcepto').value = gasto.concepto;
            document.getElementById('gastoCategoria').value = gasto.categoria;
            document.getElementById('gastoProveedor').value = gasto.proveedor;
            document.getElementById('gastoFecha').value = new Date(gasto.fecha).toISOString().split('T')[0];
            document.getElementById('gastoMonto').value = gasto.monto;
            document.getElementById('gastoDescripcion').value = gasto.descripcion || '';
        } else {
            document.getElementById('gastoModalLabel').textContent = 'Nuevo Gasto';
        }
        
        // Mostrar modal
        this.gastoModal.show();
    }

    // Guardar gasto (crear o actualizar)
    async guardarGasto() {
        try {
            const gastoId = document.getElementById('gastoId').value;
            const concepto = document.getElementById('gastoConcepto').value;
            const categoria = document.getElementById('gastoCategoria').value;
            const proveedor = document.getElementById('gastoProveedor').value;
            const fecha = document.getElementById('gastoFecha').value;
            const monto = document.getElementById('gastoMonto').value;
            const descripcion = document.getElementById('gastoDescripcion').value;
            
            if (!concepto || !categoria || !proveedor || !fecha || !monto) {
                showAlert('alertContainer', 'Todos los campos son obligatorios excepto la descripción', 'danger');
                return;
            }
            
            const gastoData = {
                concepto,
                categoria,
                proveedor,
                fecha,
                monto: parseFloat(monto),
                descripcion
            };
            
            let response;
            
            if (gastoId) {
                // Actualizar gasto existente
                response = await fetchAuth(`${API_URL}/gastos/${gastoId}`, {
                    method: 'PUT',
                    body: JSON.stringify(gastoData)
                });
                
                showAlert('alertContainer', 'Gasto actualizado exitosamente', 'success');
            } else {
                // Crear nuevo gasto
                response = await fetchAuth(`${API_URL}/gastos`, {
                    method: 'POST',
                    body: JSON.stringify(gastoData)
                });
                
                showAlert('alertContainer', 'Gasto registrado exitosamente', 'success');
            }
            
            // Cerrar modal y recargar gastos
            this.gastoModal.hide();
            this.loadGastos();
        } catch (error) {
            console.error('Error al guardar gasto:', error);
            showAlert('alertContainer', error.message || 'Error al guardar gasto', 'danger');
        }
    }

    // Editar gasto
    editarGasto(id) {
        const gasto = this.gastos.find(g => g.id === id);
        if (gasto) {
            this.showGastoModal(gasto);
        }
    }

    // Eliminar gasto
    async eliminarGasto(id) {
        if (!confirm('¿Está seguro de eliminar este gasto?')) {
            return;
        }
        
        try {
            const response = await fetchAuth(`${API_URL}/gastos/${id}`, {
                method: 'DELETE'
            });
            
            showAlert('alertContainer', 'Gasto eliminado exitosamente', 'success');
            this.loadGastos();
        } catch (error) {
            console.error('Error al eliminar gasto:', error);
            showAlert('alertContainer', error.message || 'Error al eliminar gasto', 'danger');
        }
    }
}