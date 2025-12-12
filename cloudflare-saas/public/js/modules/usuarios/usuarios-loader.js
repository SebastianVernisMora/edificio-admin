// Usuarios Loader - Sistema específico para cargar y mostrar usuarios
class UsuariosLoader {
  constructor() {
    this.usuarios = [];
    this.departamentosOcupados = new Set();
  }

  async loadAllUsers() {
    try {
      console.log('📡 Cargando todos los usuarios...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch('/api/usuarios', {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Respuesta API usuarios:', response.status, response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const usuarios = await response.json();
      console.log('✅ Usuarios recibidos:', usuarios.length);

      this.usuarios = usuarios;
      this.updateDepartamentosOcupados();
      
      return usuarios;
    } catch (error) {
      console.error('❌ Error cargando usuarios:', error);
      throw error;
    }
  }

  updateDepartamentosOcupados() {
    this.departamentosOcupados.clear();
    this.usuarios.forEach(u => {
      if (u.rol === 'inquilino' && u.departamento && u.departamento !== 'Admin') {
        this.departamentosOcupados.add(u.departamento);
      }
    });
    console.log('🏠 Departamentos ocupados:', Array.from(this.departamentosOcupados));
  }

  renderUsersInTable() {
    const tbody = document.getElementById('usuarios-table-body');
    if (!tbody) {
      console.error('❌ Tbody usuarios-table-body no encontrado');
      return;
    }

    console.log('📋 Renderizando', this.usuarios.length, 'usuarios en tabla...');

    // Aplicar filtros
    const filtroRol = document.getElementById('usuarios-rol')?.value || 'todos';
    const filtroEstado = document.getElementById('usuarios-estado')?.value || 'todos';

    let usuariosFiltrados = this.usuarios;

    if (filtroRol !== 'todos') {
      usuariosFiltrados = usuariosFiltrados.filter(u => u.rol === filtroRol);
    }

    if (filtroEstado !== 'todos') {
      usuariosFiltrados = usuariosFiltrados.filter(u => u.estatus_validacion === filtroEstado);
    }

    usuariosFiltrados.sort((a, b) => a.id - b.id);

    tbody.innerHTML = usuariosFiltrados.map(usuario => {
      const rolClass = 
        usuario.rol === 'admin' ? 'primary' :
        usuario.rol === 'inquilino' ? 'info' : 'secondary';
      
      const estatusClass = 
        usuario.estatus_validacion === 'validado' ? 'success' :
        usuario.estatus_validacion === 'pendiente' ? 'warning' : 'danger';
      
      return `
        <tr>
          <td>${usuario.id}</td>
          <td><strong>${usuario.nombre}</strong></td>
          <td>${usuario.email}</td>
          <td>
            <span class="badge badge-${rolClass}">
              ${usuario.rol.toUpperCase()}
            </span>
          </td>
          <td>${usuario.departamento}</td>
          <td>${usuario.telefono || '-'}</td>
          <td>
            <span class="badge badge-${estatusClass}">
              ${usuario.estatus_validacion.toUpperCase()}
            </span>
          </td>
          <td>${usuario.legitimidad_entregada ? '✅' : '❌'}</td>
          <td>${new Date(usuario.created_at).toLocaleDateString()}</td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="editarUsuario(${usuario.id})">
              Editar
            </button>
            ${usuario.id !== 1 ? `
              <button class="btn btn-sm btn-${usuario.estatus_validacion === 'validado' ? 'warning' : 'success'}" 
                      onclick="toggleValidacion(${usuario.id})">
                ${usuario.estatus_validacion === 'validado' ? 'Invalidar' : 'Validar'}
              </button>
              <button class="btn btn-sm btn-danger" onclick="eliminarUsuario(${usuario.id})">
                Eliminar
              </button>
            ` : ''}
          </td>
        </tr>
      `;
    }).join('');

    console.log('✅ Tabla renderizada con', usuariosFiltrados.length, 'usuarios filtrados');

    // Actualizar estadísticas
    this.updateUserStats(usuariosFiltrados);
  }

  updateUserStats(usuarios) {
    const totalUsuarios = usuarios.length;
    const admins = usuarios.filter(u => u.rol === 'admin').length;
    const inquilinos = usuarios.filter(u => u.rol === 'inquilino').length;
    const validados = usuarios.filter(u => u.estatus_validacion === 'validado').length;
    const pendientes = usuarios.filter(u => u.estatus_validacion === 'pendiente').length;

    // Actualizar elementos si existen
    const elements = {
      'total-usuarios': totalUsuarios,
      'total-admins': admins,
      'total-inquilinos': inquilinos,
      'usuarios-validados': validados,
      'usuarios-pendientes': pendientes
    };

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    });

    console.log('📊 Estadísticas actualizadas:', elements);
  }

  getDepartamentosDisponibles() {
    const todos = [];
    for (let piso = 1; piso <= 5; piso++) {
      for (let depto = 1; depto <= 4; depto++) {
        if (piso === 5 && depto > 4) continue;
        const numero = `${piso}0${depto}`;
        if (!this.departamentosOcupados.has(numero)) {
          todos.push(numero);
        }
      }
    }
    return todos;
  }
}

// Funciones globales para botones
window.editarUsuario = (id) => {
  console.log('✏️ Editando usuario:', id);
  if (window.usuariosLoader) {
    const usuario = window.usuariosLoader.usuarios.find(u => u.id === id);
    if (usuario && window.usuariosManager) {
      window.usuariosManager.showUsuarioModal(usuario);
    }
  }
};

window.eliminarUsuario = async (id) => {
  console.log('🗑️ Eliminando usuario:', id);
  if (window.usuariosManager) {
    await window.usuariosManager.deleteUsuario(id);
  }
};

window.toggleValidacion = async (id) => {
  console.log('🔄 Toggle validación usuario:', id);
  if (window.usuariosManager) {
    await window.usuariosManager.toggleValidacion(id);
  }
};

// Crear instancia global
window.usuariosLoader = new UsuariosLoader();

// Inicializar cuando se muestra la sección de usuarios
document.addEventListener('DOMContentLoaded', () => {
  let usuariosManager = null;
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        const usuariosSection = document.getElementById('usuarios-section');
        if (usuariosSection && usuariosSection.style.display !== 'none' && !usuariosManager) {
          console.log('👥 Creando UsuariosManager por observer...');
          usuariosManager = new UsuariosManager();
          window.usuariosManager = usuariosManager;
          
          // Cargar y mostrar usuarios inmediatamente
          setTimeout(async () => {
            try {
              await window.usuariosLoader.loadAllUsers();
              window.usuariosLoader.renderUsersInTable();
            } catch (error) {
              console.error('Error loading users on section show:', error);
            }
          }, 100);
        }
      }
    });
  });

  const usuariosSection = document.getElementById('usuarios-section');
  if (usuariosSection) {
    observer.observe(usuariosSection, { attributes: true });
  }
});