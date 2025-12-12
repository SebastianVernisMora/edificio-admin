// Admin Dashboard Module
const AdminDashboard = (() => {
  // Constants
  const API_BASE_URL = '/api';
  
  // DOM Elements
  const sidebar = document.querySelector('.sidebar-nav');
  const contentSections = document.querySelectorAll('.content-section');
  const pageTitle = document.getElementById('page-title');
  const currentDateEl = document.getElementById('current-date');
  const userNameEl = document.getElementById('user-name');
  
  // Current user
  let currentUser = null;
  
  // Initialize dashboard
  const init = () => {
    // Get current user
    currentUser = Auth.getCurrentUser();
    
    // Check if user has admin privileges
    if (!currentUser || (currentUser.rol !== 'ADMIN' && currentUser.rol !== 'admin' && currentUser.rol !== 'superadmin')) {
      window.location.href = '/';
      return;
    }
    
    if (currentUser) {
      userNameEl.textContent = currentUser.nombre;
    }
    
    // Set current date
    const now = new Date();
    const options = { year: 'numeric', month: 'long' };
    currentDateEl.textContent = now.toLocaleDateString('es-ES', options);
    
    // Setup navigation
    setupNavigation();
    
    // Load initial data
    loadDashboardData();
  };
  
  // Setup navigation
  const setupNavigation = () => {
    // Handle sidebar navigation
    sidebar.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link) {
        e.preventDefault();
        
        // Get section ID from href
        const sectionId = link.getAttribute('href').substring(1);
        
        // Update active section
        updateActiveSection(sectionId);
      }
    });
  };
  
  // Update active section
  const updateActiveSection = (sectionId) => {
    // Update sidebar active item
    const navItems = sidebar.querySelectorAll('li');
    navItems.forEach(item => {
      const link = item.querySelector('a');
      if (link.getAttribute('href') === `#${sectionId}`) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
    
    // Update content section
    contentSections.forEach(section => {
      if (section.id === `${sectionId}-section`) {
        section.classList.add('active');
        
        // Update page title
        pageTitle.textContent = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
        
        // Load section data if needed
        loadSectionData(sectionId);
      } else {
        section.classList.remove('active');
      }
    });
  };
  
  // Load dashboard data
  const loadDashboardData = () => {
    // This will be called when the dashboard is first loaded
    // Each module will handle its own data loading
  };
  
  // Load section data
  const loadSectionData = (sectionId) => {
    // This will be called when a section is activated
    // Each module will handle its own data loading
    switch (sectionId) {
      case 'dashboard':
        // Dashboard data is loaded by dashboard.js
        break;
      case 'usuarios':
        // Usuarios data is loaded by usuarios.js
        if (typeof UsuariosModule !== 'undefined') {
          UsuariosModule.loadUsuarios();
        } else {
          loadUsuarios();
        }
        break;
      case 'cuotas':
        // Cuotas data is loaded by cuotas.js
        if (typeof CuotasModule !== 'undefined') {
          CuotasModule.loadCuotas();
        }
        break;
      case 'gastos':
        // Gastos data is loaded by gastos.js
        if (typeof GastosModule !== 'undefined') {
          GastosModule.loadGastos();
        }
        break;
      case 'fondos':
        // Fondos data is loaded by fondos.js
        if (typeof FondosModule !== 'undefined') {
          FondosModule.loadFondos();
        }
        break;
      case 'anuncios':
        // Anuncios data is loaded by anuncios.js
        if (typeof AnunciosModule !== 'undefined') {
          AnunciosModule.loadAnuncios();
        }
        break;
      case 'cierres':
        // Cierres data is loaded by cierres.js
        if (typeof CierresModule !== 'undefined') {
          CierresModule.loadCierres();
        }
        break;
      case 'parcialidades':
        // Parcialidades data is loaded by parcialidades.js
        if (typeof ParcialidadesModule !== 'undefined') {
          ParcialidadesModule.loadParcialidades();
        }
        break;
    }
  };
  
  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };
  
  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX');
  };
  
  // Helper function for API requests
  const apiRequest = async (endpoint, method = 'GET', body = null) => {
    try {
      const token = Auth.getToken();
      
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-token': token
        }
      };
      
      if (body) {
        options.body = JSON.stringify(body);
      }
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Error en la solicitud');
      }
      
      return data;
    } catch (error) {
      console.error(`Error en solicitud a ${endpoint}:`, error);
      throw error;
    }
  };
  
  // Helper function to show modal
  const showModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'block';
    }
  };
  
  // Helper function to hide modal
  const hideModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
    }
  };
  
  // Helper function to setup modal close buttons
  const setupModalCloseButtons = () => {
    // Close buttons
    document.querySelectorAll('.modal .close, .modal .modal-cancel').forEach(button => {
      button.addEventListener('click', () => {
        const modal = button.closest('.modal');
        if (modal) {
          modal.style.display = 'none';
        }
      });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
      }
    });
  };
  
  // Setup modal close buttons
  setupModalCloseButtons();
  
  // Public API
  return {
    init,
    updateActiveSection,
    formatCurrency,
    formatDate,
    apiRequest,
    showModal,
    hideModal,
    getCurrentUser: () => currentUser
  };
})();

// Helper functions for roles (global)
const getRoleName = (rol) => {
  switch(rol) {
    case 'superadmin': return 'Super Admin';
    case 'admin': return 'Administrador';
    case 'inquilino': return 'Inquilino';
    default: return rol;
  }
};

const getRoleBadgeClass = (rol) => {
  switch(rol) {
    case 'superadmin': return 'badge-danger';
    case 'admin': return 'badge-primary';
    case 'inquilino': return 'badge-secondary';
    default: return 'badge-secondary';
  }
};

const getEditorRoleName = (rolEditor) => {
  switch(rolEditor) {
    case 'cuotas': return 'Editor Cuotas';
    case 'presupuestos': return 'Editor Presupuestos';
    case 'gastos': return 'Editor Gastos';
    case 'anuncios': return 'Editor Anuncios';
    case 'solicitudes': return 'Editor Solicitudes';
    default: return rolEditor;
  }
};

// Function to assign editor role
window.assignEditorRole = async (userId) => {
  const user = usuariosData.find(u => u.id === userId);
  if (!user || user.rol !== 'inquilino') {
    showAlert('Solo se puede asignar roles de editor a inquilinos', 'error');
    return;
  }

  const editorRoles = [
    { value: 'null', label: 'Ninguno' },
    { value: 'cuotas', label: 'Editor de Cuotas' },
    { value: 'presupuestos', label: 'Editor de Presupuestos' },
    { value: 'gastos', label: 'Editor de Gastos' },
    { value: 'anuncios', label: 'Editor de Anuncios' },
    { value: 'solicitudes', label: 'Editor de Solicitudes' }
  ];

  const currentRole = user.rol_editor || 'null';
  
  const modalHtml = `
    <div class="modal-overlay" id="editorRoleModal" style="display: block;">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Asignar Rol de Editor</h3>
          <button class="modal-close" onclick="closeEditorRoleModal()">&times;</button>
        </div>
        <div class="modal-body">
          <p><strong>Usuario:</strong> ${user.nombre} (${user.email})</p>
          <p><strong>Departamento:</strong> ${user.departamento}</p>
          
          <div class="form-group">
            <label for="editorRole">Rol de Editor:</label>
            <select id="editorRole" class="form-control">
              ${editorRoles.map(role => `
                <option value="${role.value}" ${role.value === currentRole ? 'selected' : ''}>${role.label}</option>
              `).join('')}
            </select>
          </div>
          
          <div class="form-group">
            <label>Permisos:</label>
            <div class="checkbox-group">
              <label style="display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" id="permisoLectura" ${user.permisos_editor?.lectura ? 'checked' : ''}> Lectura
              </label>
              <label style="display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" id="permisoEscritura" ${user.permisos_editor?.escritura ? 'checked' : ''}> Escritura
              </label>
              <label style="display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" id="permisoAprobacion" ${user.permisos_editor?.aprobacion ? 'checked' : ''}> Aprobación
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeEditorRoleModal()">Cancelar</button>
          <button class="btn btn-primary" onclick="saveEditorRole(${userId})">Guardar</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.closeEditorRoleModal = () => {
  const modal = document.getElementById('editorRoleModal');
  if (modal) {
    modal.remove();
  }
};

window.saveEditorRole = async (userId) => {
  try {
    const editorRole = document.getElementById('editorRole').value;
    const permisoLectura = document.getElementById('permisoLectura').checked;
    const permisoEscritura = document.getElementById('permisoEscritura').checked;
    const permisoAprobacion = document.getElementById('permisoAprobacion').checked;

    const response = await fetch(`/api/usuarios/${userId}/editor-role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-token': Auth.getToken()
      },
      body: JSON.stringify({
        rol_editor: editorRole === 'null' ? null : editorRole,
        permisos_editor: {
          lectura: permisoLectura,
          escritura: permisoEscritura,
          aprobacion: permisoAprobacion
        }
      })
    });

    if (!response.ok) {
      throw new Error('Error al actualizar rol de editor');
    }

    showAlert('Rol de editor actualizado correctamente', 'success');
    closeEditorRoleModal();
    await loadUsuarios();
  } catch (error) {
    console.error('Error al actualizar rol de editor:', error);
    showAlert('Error al actualizar rol de editor', 'error');
  }
};

// Global variables for usuarios
let usuariosData = [];

// Load usuarios data
const loadUsuarios = async () => {
  try {
    const response = await fetch('/api/usuarios', {
      headers: {
        'x-token': Auth.getToken()
      }
    });

    if (!response.ok) {
      throw new Error('Error al cargar usuarios');
    }

    const data = await response.json();
    usuariosData = data.usuarios || [];
    renderUsuarios();
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
    showAlert('Error al cargar usuarios', 'error');
  }
};

// Render usuarios table
const renderUsuarios = () => {
  const tbody = document.getElementById('usuarios-table-body');
  if (!tbody) return;

  tbody.innerHTML = usuariosData.map(usuario => `
    <tr>
      <td>${usuario.nombre}</td>
      <td>${usuario.email}</td>
      <td>${usuario.departamento || 'N/A'}</td>
      <td>
        <span class="badge ${getRoleBadgeClass(usuario.rol)}">
          ${getRoleName(usuario.rol)}
        </span>
      </td>
      <td>
        ${usuario.rol_editor ? `<span class="badge badge-info">${getEditorRoleName(usuario.rol_editor)}</span>` : '<span class="text-muted">-</span>'}
      </td>
      <td>
        <span class="badge ${usuario.estatus_validacion === 'validado' ? 'badge-success' : 'badge-warning'}">
          ${usuario.estatus_validacion || 'pendiente'}
        </span>
      </td>
      <td class="actions">
        <button class="btn btn-sm btn-outline" onclick="editUser(${usuario.id})" title="Editar usuario">
          <i class="fas fa-edit"></i>
        </button>
        ${usuario.rol === 'inquilino' ? `<button class="btn btn-sm btn-info" onclick="assignEditorRole(${usuario.id})" title="Asignar rol de editor">
          <i class="fas fa-user-cog"></i>
        </button>` : ''}
        ${usuario.rol !== 'superadmin' ? `<button class="btn btn-sm btn-danger" onclick="deleteUser(${usuario.id})" title="Eliminar usuario">
          <i class="fas fa-trash"></i>
        </button>` : ''}
      </td>
    </tr>
  `).join('');
};

// Show alert function (if not defined elsewhere)
const showAlert = (message, type = 'info') => {
  console.log(`[${type.toUpperCase()}] ${message}`);
  // You can implement a proper alert system here
  alert(message);
};

// Edit user function
window.editUser = (userId) => {
  // Implement edit user functionality
  console.log('Edit user:', userId);
  showAlert('Función de editar usuario en desarrollo', 'info');
};

// Delete user function
window.deleteUser = async (userId) => {
  const user = usuariosData.find(u => u.id === userId);
  if (!user) return;

  if (user.rol === 'superadmin') {
    showAlert('No se puede eliminar el super administrador', 'error');
    return;
  }

  if (confirm(`¿Estás seguro de que quieres eliminar al usuario ${user.nombre}?`)) {
    try {
      const response = await fetch(`/api/usuarios/${userId}`, {
        method: 'DELETE',
        headers: {
          'x-token': Auth.getToken()
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar usuario');
      }

      showAlert('Usuario eliminado correctamente', 'success');
      await loadUsuarios();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      showAlert('Error al eliminar usuario', 'error');
    }
  }
};

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', AdminDashboard.init);