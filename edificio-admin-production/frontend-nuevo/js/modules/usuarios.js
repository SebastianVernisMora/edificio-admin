// Usuarios Module
const UsuariosModule = (() => {
  
  // Users data
  let usuariosData = [];
  
  // Load usuarios
  const loadUsuarios = async () => {
    try {
      Utils.showLoading('usuarios-table-body');
      
      const data = await Utils.apiRequest('/usuarios');
      usuariosData = data.usuarios || [];
      
      renderUsuarios();
      
    } catch (error) {
      console.error('Error loading usuarios:', error);
      Utils.showAlert('Error al cargar usuarios', 'error');
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
          <span class="badge ${Utils.getRoleBadgeClass(usuario.rol)}">
            ${Utils.getRoleName(usuario.rol)}
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
          <button class="btn btn-sm btn-outline" onclick="UsuariosModule.editUser(${usuario.id})" title="Editar usuario">
            <i class="fas fa-edit"></i>
          </button>
          ${usuario.rol === 'inquilino' ? `<button class="btn btn-sm btn-info" onclick="UsuariosModule.assignEditorRole(${usuario.id})" title="Asignar rol de editor">
            <i class="fas fa-user-cog"></i>
          </button>` : ''}
          ${usuario.rol !== 'superadmin' ? `<button class="btn btn-sm btn-danger" onclick="UsuariosModule.deleteUser(${usuario.id})" title="Eliminar usuario">
            <i class="fas fa-trash"></i>
          </button>` : ''}
        </td>
      </tr>
    `).join('');
  };

  // Get editor role name
  const getEditorRoleName = (rolEditor) => {
    const roles = {
      cuotas: 'Editor Cuotas',
      presupuestos: 'Editor Presupuestos', 
      gastos: 'Editor Gastos',
      anuncios: 'Editor Anuncios',
      solicitudes: 'Editor Solicitudes'
    };
    return roles[rolEditor] || rolEditor;
  };

  // Edit user
  const editUser = (userId) => {
    const user = usuariosData.find(u => u.id === userId);
    if (!user) return;

    // Show edit user modal
    showEditUserModal(user);
  };

  // Show edit user modal
  const showEditUserModal = (user) => {
    const modalHtml = `
      <div class="modal-overlay" id="editUserModal" style="display: block;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Editar Usuario</h3>
            <button class="modal-close" onclick="Utils.hideModal('editUserModal')">&times;</button>
          </div>
          <div class="modal-body">
            <form id="editUserForm">
              <div class="form-group">
                <label for="editUserName">Nombre:</label>
                <input type="text" id="editUserName" value="${user.nombre}" required>
              </div>
              
              <div class="form-group">
                <label for="editUserEmail">Email:</label>
                <input type="email" id="editUserEmail" value="${user.email}" required>
              </div>
              
              <div class="form-group">
                <label for="editUserDepartment">Departamento:</label>
                <input type="text" id="editUserDepartment" value="${user.departamento || ''}" placeholder="Ej: 101, 205">
              </div>
              
              <div class="form-group">
                <label for="editUserRole">Rol:</label>
                <select id="editUserRole">
                  <option value="inquilino" ${user.rol === 'inquilino' ? 'selected' : ''}>Inquilino</option>
                  <option value="admin" ${user.rol === 'admin' ? 'selected' : ''}>Administrador</option>
                  ${user.rol === 'superadmin' ? '<option value="superadmin" selected>Super Admin</option>' : ''}
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="Utils.hideModal('editUserModal')">Cancelar</button>
            <button class="btn btn-primary" onclick="UsuariosModule.saveUser(${user.id})">Guardar</button>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal
    const existingModal = document.getElementById('editUserModal');
    if (existingModal) existingModal.remove();

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  };

  // Save user
  const saveUser = async (userId) => {
    try {
      const form = document.getElementById('editUserForm');
      const formData = new FormData(form);
      
      const userData = {
        nombre: document.getElementById('editUserName').value,
        email: document.getElementById('editUserEmail').value,
        departamento: document.getElementById('editUserDepartment').value,
        rol: document.getElementById('editUserRole').value
      };

      await Utils.apiRequest(`/usuarios/${userId}`, 'PUT', userData);
      
      Utils.showAlert('Usuario actualizado correctamente', 'success');
      Utils.hideModal('editUserModal');
      loadUsuarios();
      
    } catch (error) {
      console.error('Error saving user:', error);
      Utils.showAlert('Error al guardar usuario', 'error');
    }
  };

  // Assign editor role
  const assignEditorRole = (userId) => {
    const user = usuariosData.find(u => u.id === userId);
    if (!user || user.rol !== 'inquilino') {
      Utils.showAlert('Solo se puede asignar roles de editor a inquilinos', 'error');
      return;
    }

    showEditorRoleModal(user);
  };

  // Show editor role modal
  const showEditorRoleModal = (user) => {
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
            <button class="modal-close" onclick="Utils.hideModal('editorRoleModal')">&times;</button>
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
            <button class="btn btn-secondary" onclick="Utils.hideModal('editorRoleModal')">Cancelar</button>
            <button class="btn btn-primary" onclick="UsuariosModule.saveEditorRole(${user.id})">Guardar</button>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal
    const existingModal = document.getElementById('editorRoleModal');
    if (existingModal) existingModal.remove();

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  };

  // Save editor role
  const saveEditorRole = async (userId) => {
    try {
      const editorRole = document.getElementById('editorRole').value;
      const permisoLectura = document.getElementById('permisoLectura').checked;
      const permisoEscritura = document.getElementById('permisoEscritura').checked;
      const permisoAprobacion = document.getElementById('permisoAprobacion').checked;

      const roleData = {
        rol_editor: editorRole === 'null' ? null : editorRole,
        permisos_editor: {
          lectura: permisoLectura,
          escritura: permisoEscritura,
          aprobacion: permisoAprobacion
        }
      };

      await Utils.apiRequest(`/usuarios/${userId}/editor-role`, 'PUT', roleData);

      Utils.showAlert('Rol de editor actualizado correctamente', 'success');
      Utils.hideModal('editorRoleModal');
      loadUsuarios();
      
    } catch (error) {
      console.error('Error al actualizar rol de editor:', error);
      Utils.showAlert('Error al actualizar rol de editor', 'error');
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    const user = usuariosData.find(u => u.id === userId);
    if (!user) return;

    if (user.rol === 'superadmin') {
      Utils.showAlert('No se puede eliminar el super administrador', 'error');
      return;
    }

    if (confirm(`¿Estás seguro de que quieres eliminar al usuario ${user.nombre}?`)) {
      try {
        await Utils.apiRequest(`/usuarios/${userId}`, 'DELETE');
        
        Utils.showAlert('Usuario eliminado correctamente', 'success');
        loadUsuarios();
        
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        Utils.showAlert('Error al eliminar usuario', 'error');
      }
    }
  };

  // Public API
  return {
    loadUsuarios,
    editUser,
    saveUser,
    assignEditorRole,
    saveEditorRole,
    deleteUser
  };
})();