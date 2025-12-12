// Gestión de Anuncios - Admin Panel
class AnunciosManager {
  constructor() {
    this.anuncios = [];
    this.init();
  }

  async init() {
    try {
      // Mostrar loading state
      this.showLoading(true);
      
      // Cargar anuncios
      await this.loadAnuncios();
      
      // Configurar event listeners
      this.setupEventListeners();
      
      // Renderizar anuncios y actualizar contadores
      this.renderAnuncios();
      this.updateContadores();
      
      // Ocultar loading state
      this.showLoading(false);
    } catch (error) {
      console.error('Error inicializando AnunciosManager:', error);
      this.showError('Error al cargar los anuncios. Por favor, intente nuevamente.');
      this.showLoading(false);
    }
  }

  async loadAnuncios() {
    try {
      const token = localStorage.getItem('edificio_auth_token');
      const response = await fetch('/api/anuncios', {
        headers: { 'x-auth-token': token }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.anuncios = data.anuncios || [];
    } catch (error) {
      console.error('Error cargando anuncios:', error);
      throw error;
    }
  }

  setupEventListeners() {
    // Botón nuevo anuncio
    document.getElementById('btnNuevoAnuncio')?.addEventListener('click', () => {
      this.showAnuncioModal();
    });

    // Guardar anuncio
    document.getElementById('btnGuardarAnuncio')?.addEventListener('click', () => {
      this.handleAnuncioSubmit();
    });

    // Contador de caracteres para el contenido
    document.getElementById('anuncioContenido')?.addEventListener('input', (e) => {
      this.updateCharCounter(e.target.value);
      this.updatePreview();
    });
    
    // Actualizar vista previa cuando cambia el título
    document.getElementById('anuncioTitulo')?.addEventListener('input', () => {
      this.updatePreview();
    });
    
    // Actualizar vista previa cuando cambia el tipo
    document.getElementById('anuncioTipo')?.addEventListener('change', () => {
      this.updatePreview();
    });
    
    // Botones de formato de texto
    document.querySelectorAll('[data-format]').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const format = e.currentTarget.getAttribute('data-format');
        this.formatText(format);
      });
    });

    // Filtros de anuncios
    document.getElementById('filtroAnuncioTipo')?.addEventListener('change', () => {
      this.renderAnuncios();
    });

    document.getElementById('filtroAnuncioEstado')?.addEventListener('change', () => {
      this.renderAnuncios();
    });

    document.getElementById('filtroAnuncioBusqueda')?.addEventListener('input', () => {
      this.debounceSearch();
    });

    document.getElementById('btnLimpiarFiltrosAnuncios')?.addEventListener('click', () => {
      this.resetFilters();
    });

    document.getElementById('btnFiltrarAnuncios')?.addEventListener('click', () => {
      this.renderAnuncios();
    });

    // Delegación de eventos para botones de acción en la tabla
    document.getElementById('anunciosTableBody')?.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (!target) return;
      
      const anuncioId = target.dataset.id;
      
      if (target.classList.contains('btn-edit')) {
        this.editAnuncio(anuncioId);
      } else if (target.classList.contains('btn-delete')) {
        this.deleteAnuncio(anuncioId);
      } else if (target.classList.contains('btn-toggle')) {
        this.toggleAnuncioEstado(anuncioId);
      } else if (target.classList.contains('btn-view')) {
        this.viewAnuncio(anuncioId);
      }
    });
    
    // Cambiar estado de publicación inmediata
    document.getElementById('anuncioActivo')?.addEventListener('change', (e) => {
      const fechaPublicacionField = document.getElementById('anuncioFechaPublicacion');
      if (fechaPublicacionField) {
        fechaPublicacionField.disabled = e.target.checked;
        if (e.target.checked) {
          fechaPublicacionField.value = '';
        }
      }
    });
    
    // Fecha de publicación
    document.getElementById('anuncioFechaPublicacion')?.addEventListener('change', (e) => {
      if (e.target.value) {
        document.getElementById('anuncioActivo').checked = false;
      }
    });
  }
  
  updateCharCounter(text) {
    const contador = document.getElementById('contadorCaracteres');
    if (contador) {
      const length = text.length;
      contador.textContent = `${length}/1000`;
      
      // Cambiar color si se acerca al límite
      if (length > 900) {
        contador.classList.add('text-danger');
      } else {
        contador.classList.remove('text-danger');
      }
    }
  }
  
  updatePreview() {
    const titulo = document.getElementById('anuncioTitulo').value || 'Título del anuncio';
    const contenido = document.getElementById('anuncioContenido').value || 'Contenido del anuncio...';
    const tipo = document.getElementById('anuncioTipo').value || 'GENERAL';
    
    // Actualizar título
    document.getElementById('previewTitulo').textContent = titulo;
    
    // Actualizar contenido con formato
    const formattedContent = this.formatContentForPreview(contenido);
    document.getElementById('previewContenido').innerHTML = formattedContent;
    
    // Actualizar tipo (badge)
    const previewTipo = document.getElementById('previewTipo');
    previewTipo.textContent = this.getTipoLabel(tipo);
    
    // Actualizar clase del badge según tipo
    previewTipo.className = 'badge';
    switch (tipo) {
      case 'URGENTE':
        previewTipo.classList.add('bg-danger');
        break;
      case 'IMPORTANTE':
        previewTipo.classList.add('bg-warning', 'text-dark');
        break;
      case 'REUNION':
        previewTipo.classList.add('bg-primary');
        break;
      case 'MANTENIMIENTO':
        previewTipo.classList.add('bg-info', 'text-dark');
        break;
      default:
        previewTipo.classList.add('bg-secondary');
    }
    
    // Actualizar fecha
    document.getElementById('previewFecha').textContent = `Publicado: ${new Date().toLocaleDateString('es-MX')}`;
  }
  
  getTipoLabel(tipo) {
    switch (tipo) {
      case 'GENERAL': return 'General';
      case 'IMPORTANTE': return 'Importante';
      case 'URGENTE': return 'Urgente';
      case 'REUNION': return 'Reunión';
      case 'MANTENIMIENTO': return 'Mantenimiento';
      default: return tipo;
    }
  }
  
  formatContentForPreview(content) {
    // Convertir saltos de línea en <br>
    let formatted = content.replace(/
/g, '<br>');
    
    // Aplicar formato básico
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // **bold**
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>'); // *italic*
    formatted = formatted.replace(/__(.*?)__/g, '<u>$1</u>'); // __underline__
    formatted = formatted.replace(/##\s(.*?)(?:
|$)/g, '<h2>$1</h2>'); // ## Heading 2
    formatted = formatted.replace(/###\s(.*?)(?:
|$)/g, '<h3>$1</h3>'); // ### Heading 3
    
    // Listas
    formatted = formatted.replace(/^\s*-\s+(.*?)(?:
|$)/gm, '<li>$1</li>');
    if (formatted.includes('<li>')) {
      formatted = formatted.replace(/(<li>.*?<\/li>)+/g, '<ul>  setupEventListeners() {
    // Botón nuevo anuncio
    document.getElementById('btnNuevoAnuncio')?.addEventListener('click', () => {
      this.showAnuncioModal();
    });

    // Guardar anuncio
    document.getElementById('btnGuardarAnuncio')?.addEventListener('click', () => {
      this.handleAnuncioSubmit();
    });

    // Contador de caracteres para el contenido
    document.getElementById('anuncioContenido')?.addEventListener('input', (e) => {
      const contador = document.getElementById('contadorCaracteres');
      if (contador) {
        const length = e.target.value.length;
        contador.textContent = `${length}/1000`;
        
        // Cambiar color si se acerca al límite
        if (length > 900) {
          contador.classList.add('text-danger');
        } else {
          contador.classList.remove('text-danger');
        }
      }
    });

    // Filtros de anuncios
    document.getElementById('filtroAnuncioTipo')?.addEventListener('change', () => {
      this.renderAnuncios();
    });

    document.getElementById('filtroAnuncioEstado')?.addEventListener('change', () => {
      this.renderAnuncios();
    });

    document.getElementById('filtroAnuncioBusqueda')?.addEventListener('input', () => {
      this.debounceSearch();
    });

    document.getElementById('btnLimpiarFiltrosAnuncios')?.addEventListener('click', () => {
      this.resetFilters();
    });

    document.getElementById('btnFiltrarAnuncios')?.addEventListener('click', () => {
      this.renderAnuncios();
    });

    // Delegación de eventos para botones de acción en la tabla
    document.getElementById('anunciosTableBody')?.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (!target) return;
      
      const anuncioId = target.dataset.id;
      
      if (target.classList.contains('btn-edit')) {
        this.editAnuncio(anuncioId);
      } else if (target.classList.contains('btn-delete')) {
        this.deleteAnuncio(anuncioId);
      } else if (target.classList.contains('btn-toggle')) {
        this.toggleAnuncioEstado(anuncioId);
      } else if (target.classList.contains('btn-view')) {
        this.viewAnuncio(anuncioId);
      }
    });
  }</ul>');
    }
    
    return formatted;
  }
  
  formatText(format) {
    const textarea = document.getElementById('anuncioContenido');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selection = text.substring(start, end);
    
    let replacement = '';
    let newCursorPos = 0;
    
    switch (format) {
      case 'bold':
        replacement = `**${selection}**`;
        newCursorPos = start + 2;
        break;
      case 'italic':
        replacement = `*${selection}*`;
        newCursorPos = start + 1;
        break;
      case 'underline':
        replacement = `__${selection}__`;
        newCursorPos = start + 2;
        break;
      case 'h2':
        replacement = `## ${selection}`;
        newCursorPos = start + 3;
        break;
      case 'h3':
        replacement = `### ${selection}`;
        newCursorPos = start + 4;
        break;
      case 'list':
        // Si ya hay texto seleccionado, convertir cada línea en un ítem de lista
        if (selection) {
          const lines = selection.split('
');
          replacement = lines.map(line => `- ${line}`).join('
');
        } else {
          replacement = '- ';
        }
        newCursorPos = start + 2;
        break;
    }
    
    // Insertar el texto formateado
    textarea.value = text.substring(0, start) + replacement + text.substring(end);
    
    // Si había texto seleccionado, mantener la selección con el formato
    if (selection) {
      textarea.selectionStart = start;
      textarea.selectionEnd = start + replacement.length;
    } else {
      // Si no había selección, colocar el cursor en medio de las etiquetas
      textarea.selectionStart = textarea.selectionEnd = newCursorPos;
    }
    
    // Actualizar contador y vista previa
    this.updateCharCounter(textarea.value);
    this.updatePreview();
    
    // Mantener el foco en el textarea
    textarea.focus();
  }

  // Debounce para la búsqueda
  debounceSearch() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.searchTimeout = setTimeout(() => {
      this.renderAnuncios();
    }, 300);
  }

  resetFilters() {
    document.getElementById('filtroAnuncioTipo').value = '';
    document.getElementById('filtroAnuncioEstado').value = '';
    document.getElementById('filtroAnuncioBusqueda').value = '';
    this.renderAnuncios();
  }

  showAnuncioModal(anuncio = null) {
    const modal = new bootstrap.Modal(document.getElementById('anuncioModal'));
    const modalTitle = document.getElementById('anuncioModalLabel');
    const form = document.getElementById('anuncioForm');
    
    // Reset form
    form.reset();
    document.getElementById('contadorCaracteres').textContent = '0/1000';
    document.getElementById('contadorCaracteres').classList.remove('text-danger');
    
    // Limpiar archivos seleccionados
    if (window.fileUploadManager) {
      window.fileUploadManager.clearFiles();
    }
    
    // Ocultar sección de archivos existentes
    const existingSection = document.getElementById("existingFilesSection");
    if (existingSection) {
      existingSection.style.display = "none";
    }
    
    // Habilitar/deshabilitar campos según corresponda
    const fechaPublicacionField = document.getElementById('anuncioFechaPublicacion');
    fechaPublicacionField.disabled = true;
    
    if (anuncio) {
      // Editar anuncio existente
      modalTitle.textContent = 'Editar Anuncio';
      document.getElementById('anuncioId').value = anuncio.id;
      document.getElementById('anuncioTitulo').value = anuncio.titulo;
      document.getElementById('anuncioTipo').value = anuncio.tipo;
      document.getElementById('anuncioContenido').value = anuncio.contenido;
      document.getElementById('anuncioPrioridad').value = anuncio.prioridad || 0;
      
      if (anuncio.fechaFin) {
        document.getElementById('anuncioFechaFin').value = anuncio.fechaFin.split('T')[0];
      }
      
      document.getElementById('anuncioActivo').checked = anuncio.activo;
      
      // Si tiene fecha de publicación futura
      if (anuncio.fechaPublicacion && new Date(anuncio.fechaPublicacion) > new Date()) {
        const fechaPublicacion = new Date(anuncio.fechaPublicacion);
        // Formatear fecha y hora para input datetime-local
        const year = fechaPublicacion.getFullYear();
        const month = String(fechaPublicacion.getMonth() + 1).padStart(2, '0');
        const day = String(fechaPublicacion.getDate()).padStart(2, '0');
        const hours = String(fechaPublicacion.getHours()).padStart(2, '0');
        const minutes = String(fechaPublicacion.getMinutes()).padStart(2, '0');
        
        document.getElementById('anuncioFechaPublicacion').value = `${year}-${month}-${day}T${hours}:${minutes}`;
        document.getElementById('anuncioFechaPublicacion').disabled = false;
        document.getElementById('anuncioActivo').checked = false;
      }
      
      // Actualizar contador de caracteres
      const contador = document.getElementById('contadorCaracteres');
      const length = anuncio.contenido.length;
      contador.textContent = `${length}/1000`;
      
      // Mostrar archivos existentes si los hay
      if (anuncio.archivos && anuncio.archivos.length > 0 && window.fileUploadManager) {
        const existingSection = document.getElementById("existingFilesSection");
        if (existingSection) {
          existingSection.style.display = "block";
          window.fileUploadManager.displayExistingFiles(anuncio.archivos.map(archivo => ({
            ...archivo,
            anuncioId: anuncio.id
          })));
        }
      }
      
      if (length > 900) {
        contador.classList.add('text-danger');
      }
    } else {
      // Nuevo anuncio
      modalTitle.textContent = 'Nuevo Anuncio';
      document.getElementById('anuncioId').value = '';
      document.getElementById('anuncioActivo').checked = true;
      document.getElementById('anuncioPrioridad').value = 0;
      
      // Fecha fin por defecto: 30 días desde hoy
      const fechaFin = new Date();
      fechaFin.setDate(fechaFin.getDate() + 30);
      document.getElementById('anuncioFechaFin').value = fechaFin.toISOString().split('T')[0];
    }
    
    // Actualizar vista previa
    this.updatePreview();
    
    modal.show();
  }

  async handleAnuncioSubmit() {
    try {
      // Validar formulario
      if (!this.validateAnuncioForm()) {
        return;
      }
      
      // Mostrar loading state
      this.showLoading(true, 'btnGuardarAnuncio', 'Guardando...');
      
      const anuncioId = document.getElementById('anuncioId').value;
      const isNew = !anuncioId;
      
      // Determinar estado de publicación
      let activo = document.getElementById('anuncioActivo').checked;
      const fechaPublicacion = document.getElementById('anuncioFechaPublicacion').value;
      
      // Si hay fecha de publicación futura y es posterior a ahora, el anuncio no está activo inicialmente
      if (fechaPublicacion && new Date(fechaPublicacion) > new Date()) {
        activo = false;
      }
      
      // Preparar datos con archivos
      const formData = new FormData();
      formData.append("titulo", document.getElementById("anuncioTitulo").value);
      formData.append("contenido", document.getElementById("anuncioContenido").value);
      formData.append("tipo", document.getElementById("anuncioTipo").value);
      formData.append("prioridad", parseInt(document.getElementById("anuncioPrioridad").value) || 0);
      formData.append("activo", activo);
      
      if (document.getElementById("anuncioFechaFin").value) {
        formData.append("fechaFin", document.getElementById("anuncioFechaFin").value);
      }
      if (fechaPublicacion) {
        formData.append("fechaPublicacion", fechaPublicacion);
      }
      
      // Agregar archivos si existen
      if (window.fileUploadManager && window.fileUploadManager.getSelectedFiles().length > 0) {
        const files = window.fileUploadManager.getSelectedFiles();
        files.forEach(file => {
          formData.append("archivos", file);
        });
      }
      
      // Enviar a la API
      const token = localStorage.getItem("edificio_auth_token");
      const url = isNew ? "/api/anuncios" : `/api/anuncios/${anuncioId}`;
      const method = isNew ? "POST" : "PUT";
      
      const response = await fetch(url, {
        method,
        headers: {
          "x-auth-token": token
          // No incluir Content-Type para FormData, el navegador lo establece automáticamente
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || `Error ${response.status}: ${response.statusText}`);
      }
      
      // Cerrar modal y actualizar lista
      bootstrap.Modal.getInstance(document.getElementById('anuncioModal')).hide();
      
      // Limpiar archivos después de guardar exitosamente
      if (window.fileUploadManager) {
        window.fileUploadManager.clearFiles();
      }
      
      // Mostrar mensaje específico según el estado
      let mensaje = '';
      if (fechaPublicacion && new Date(fechaPublicacion) > new Date()) {
        const fechaFormateada = new Date(fechaPublicacion).toLocaleString('es-MX');
        mensaje = `Anuncio programado para publicarse el ${fechaFormateada}`;
      } else if (activo) {
        mensaje = `Anuncio ${isNew ? 'creado' : 'actualizado'} y publicado correctamente`;
      } else {
        mensaje = `Anuncio guardado como borrador`;
      }
      
      this.showSuccess(mensaje);
      
      // Recargar anuncios
      await this.loadAnuncios();
      this.renderAnuncios();
      this.updateContadores();
    } catch (error) {
      console.error('Error guardando anuncio:', error);
      this.showError(`Error al guardar el anuncio: ${error.message}`);
    } finally {
      this.showLoading(false, 'btnGuardarAnuncio', '<i class="bi bi-save me-2"></i> Guardar');
    }
  }

  validateAnuncioForm() {
    const titulo = document.getElementById('anuncioTitulo').value.trim();
    const contenido = document.getElementById('anuncioContenido').value.trim();
    const tipo = document.getElementById('anuncioTipo').value;
    
    if (!titulo) {
      this.showError('El título es obligatorio');
      return false;
    }
    
    if (titulo.length > 100) {
      this.showError('El título no puede exceder los 100 caracteres');
      return false;
    }
    
    if (!contenido) {
      this.showError('El contenido es obligatorio');
      return false;
    }
    
    if (contenido.length > 1000) {
      this.showError('El contenido no puede exceder los 1000 caracteres');
      return false;
    }
    
    if (!tipo) {
      this.showError('Debe seleccionar un tipo de anuncio');
      return false;
    }
    
    return true;
  }

  async editAnuncio(anuncioId) {
    try {
      const anuncio = this.anuncios.find(a => a.id === anuncioId);
      if (anuncio) {
        this.showAnuncioModal(anuncio);
      } else {
        throw new Error('Anuncio no encontrado');
      }
    } catch (error) {
      console.error('Error editando anuncio:', error);
      this.showError(`Error al editar el anuncio: ${error.message}`);
    }
  }

  async deleteAnuncio(anuncioId) {
    try {
      // Confirmar eliminación
      if (!confirm('¿Está seguro que desea eliminar este anuncio? Esta acción no se puede deshacer.')) {
        return;
      }
      
      // Mostrar loading state
      this.showLoading(true);
      
      const token = localStorage.getItem('edificio_auth_token');
      const response = await fetch(`/api/anuncios/${anuncioId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || `Error ${response.status}: ${response.statusText}`);
      }
      
      // Mostrar mensaje de éxito
      this.showSuccess('Anuncio eliminado correctamente');
      
      // Recargar anuncios
      await this.loadAnuncios();
      this.renderAnuncios();
      this.updateContadores();
    } catch (error) {
      console.error('Error eliminando anuncio:', error);
      this.showError(`Error al eliminar el anuncio: ${error.message}`);
    } finally {
      this.showLoading(false);
    }
  }

  async toggleAnuncioEstado(anuncioId) {
    try {
      // Mostrar loading state
      this.showLoading(true);
      
      const anuncio = this.anuncios.find(a => a.id === anuncioId);
      if (!anuncio) {
        throw new Error('Anuncio no encontrado');
      }
      
      const nuevoEstado = !anuncio.activo;
      const estadoTexto = nuevoEstado ? 'activado' : 'desactivado';
      
      // Confirmar cambio de estado
      if (!confirm(`¿Está seguro que desea ${estadoTexto === 'activado' ? 'activar' : 'desactivar'} este anuncio?`)) {
        this.showLoading(false);
        return;
      }
      
      const token = localStorage.getItem('edificio_auth_token');
      const response = await fetch(`/api/anuncios/${anuncioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          ...anuncio,
          activo: nuevoEstado
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || `Error ${response.status}: ${response.statusText}`);
      }
      
      // Mostrar mensaje de éxito
      this.showSuccess(`Anuncio ${estadoTexto} correctamente`);
      
      // Recargar anuncios
      await this.loadAnuncios();
      this.renderAnuncios();
      this.updateContadores();
    } catch (error) {
      console.error('Error cambiando estado del anuncio:', error);
      this.showError(`Error al cambiar el estado del anuncio: ${error.message}`);
    } finally {
      this.showLoading(false);
    }
  }

  viewAnuncio(anuncioId) {
    try {
      const anuncio = this.anuncios.find(a => a.id === anuncioId);
      if (!anuncio) {
        throw new Error('Anuncio no encontrado');
      }
      
      const modal = new bootstrap.Modal(document.getElementById('detalleAnuncioModal'));
      const modalTitle = document.getElementById('detalleAnuncioModalLabel');
      const modalContent = document.getElementById('detalleAnuncioContenido');
      
      modalTitle.textContent = anuncio.titulo;
      
      // Formatear fecha
      const fechaCreacion = new Date(anuncio.fechaCreacion).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Determinar clase de badge según tipo
      let badgeClass = 'bg-secondary';
      switch (anuncio.tipo) {
        case 'URGENTE':
          badgeClass = 'bg-danger';
          break;
        case 'IMPORTANTE':
          badgeClass = 'bg-warning text-dark';
          break;
        case 'REUNION':
          badgeClass = 'bg-primary';
          break;
        case 'MANTENIMIENTO':
          badgeClass = 'bg-info text-dark';
          break;
      }
      
      // Verificar si está vencido
      const fechaActual = new Date();
      const fechaFin = anuncio.fechaFin ? new Date(anuncio.fechaFin) : null;
      const vencido = fechaFin && fechaFin < fechaActual;
      
      // Verificar si está programado para publicación futura
      const fechaPublicacion = anuncio.fechaPublicacion ? new Date(anuncio.fechaPublicacion) : null;
      const programado = fechaPublicacion && fechaPublicacion > fechaActual;
      
      // Icono de prioridad
      let prioridadBadge = '';
      if (anuncio.prioridad > 0) {
        prioridadBadge = `
          <span class="badge bg-warning text-dark">
            ${anuncio.prioridad > 1 ? 'Muy destacado' : 'Destacado'}
          </span>
        `;
      }
      
      // Formatear contenido con formato
      const contenidoFormateado = this.formatContentForPreview(anuncio.contenido);
      
      // Construir contenido
      modalContent.innerHTML = `
        <div class="mb-3">
          <span class="badge ${badgeClass}">${this.getTipoLabel(anuncio.tipo)}</span>
          <span class="badge bg-${anuncio.activo ? 'success' : 'secondary'}">${anuncio.activo ? 'Activo' : 'Inactivo'}</span>
          ${vencido ? '<span class="badge bg-danger">Vencido</span>' : ''}
          ${programado ? '<span class="badge bg-info text-dark">Programado</span>' : ''}
          ${prioridadBadge}
        </div>
        
        <div class="card mb-3">
          <div class="card-body">
            ${contenidoFormateado}
          </div>
        </div>
        
        <div class="row">
          <div class="col-md-6">
            <p class="mb-1"><strong>Fecha de creación:</strong></p>
            <p>${fechaCreacion}</p>
          </div>
          <div class="col-md-6">
            <p class="mb-1"><strong>Fecha de expiración:</strong></p>
            <p>${anuncio.fechaFin ? new Date(anuncio.fechaFin).toLocaleDateString('es-MX') : 'Sin fecha de expiración'}</p>
          </div>
        </div>
        
        <div class="row">
          <div class="col-md-6">
            <p class="mb-1"><strong>Autor:</strong></p>
            <p>${anuncio.autorNombre || 'Administrador'}</p>
          </div>
          <div class="col-md-6">
            ${programado ? `
              <p class="mb-1"><strong>Fecha de publicación programada:</strong></p>
              <p>${new Date(fechaPublicacion).toLocaleString('es-MX')}</p>
            ` : ''}
          </div>
        </div>
      `;
      
      modal.show();
    } catch (error) {
      console.error('Error mostrando detalle del anuncio:', error);
      this.showError(`Error al mostrar el detalle del anuncio: ${error.message}`);
    }
  }

  renderAnuncios() {
    const tbody = document.getElementById('anunciosTableBody');
    if (!tbody) return;
    
    // Obtener filtros
    const filtroTipo = document.getElementById('filtroAnuncioTipo').value;
    const filtroEstado = document.getElementById('filtroAnuncioEstado').value;
    const filtroBusqueda = document.getElementById('filtroAnuncioBusqueda').value.toLowerCase();
    
    // Aplicar filtros
    let anunciosFiltrados = [...this.anuncios];
    
    if (filtroTipo) {
      anunciosFiltrados = anunciosFiltrados.filter(a => a.tipo === filtroTipo);
    }
    
    if (filtroEstado) {
      const activo = filtroEstado === 'activo';
      anunciosFiltrados = anunciosFiltrados.filter(a => a.activo === activo);
    }
    
    if (filtroBusqueda) {
      anunciosFiltrados = anunciosFiltrados.filter(a => 
        a.titulo.toLowerCase().includes(filtroBusqueda) || 
        a.contenido.toLowerCase().includes(filtroBusqueda)
      );
    }
    
    // Ordenar primero por prioridad (descendente) y luego por fecha de creación (más recientes primero)
    anunciosFiltrados.sort((a, b) => {
      // Primero por prioridad
      const prioridadA = a.prioridad || 0;
      const prioridadB = b.prioridad || 0;
      
      if (prioridadB !== prioridadA) {
        return prioridadB - prioridadA;
      }
      
      // Luego por fecha de creación
      return new Date(b.fechaCreacion) - new Date(a.fechaCreacion);
    });
    
    // Renderizar tabla
    if (anunciosFiltrados.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4">
            <p class="text-muted mb-0">No se encontraron anuncios con los filtros seleccionados</p>
          </td>
        </tr>
      `;
      return;
    }
    
    tbody.innerHTML = anunciosFiltrados.map(anuncio => {
      // Determinar si está vencido
      const fechaActual = new Date();
      const fechaFin = anuncio.fechaFin ? new Date(anuncio.fechaFin) : null;
      const vencido = fechaFin && fechaFin < fechaActual;
      
      // Determinar si está programado para publicación futura
      const fechaPublicacion = anuncio.fechaPublicacion ? new Date(anuncio.fechaPublicacion) : null;
      const programado = fechaPublicacion && fechaPublicacion > fechaActual;
      
      // Determinar clase de badge según tipo
      let badgeClass = 'bg-secondary';
      switch (anuncio.tipo) {
        case 'URGENTE':
          badgeClass = 'bg-danger';
          break;
        case 'IMPORTANTE':
          badgeClass = 'bg-warning text-dark';
          break;
        case 'REUNION':
          badgeClass = 'bg-primary';
          break;
        case 'MANTENIMIENTO':
          badgeClass = 'bg-info text-dark';
          break;
      }
      
      // Destacar anuncios con prioridad alta
      const rowClass = anuncio.prioridad > 0 ? `table-${anuncio.prioridad > 1 ? 'warning' : 'light'}` : '';
      
      // Icono de prioridad
      let prioridadIcon = '';
      if (anuncio.prioridad > 0) {
        const stars = anuncio.prioridad > 1 ? 
          '<i class="bi bi-star-fill text-warning"></i><i class="bi bi-star-fill text-warning"></i>' : 
          '<i class="bi bi-star-fill text-warning"></i>';
        prioridadIcon = `<span class="ms-2" title="Anuncio destacado">${stars}</span>`;
      }
      
      return `
        <tr class="${rowClass}">
          <td>${anuncio.id}</td>
          <td>
            <div class="d-flex align-items-center">
              <div>
                <h6 class="mb-0">${anuncio.titulo} ${prioridadIcon} ${anuncio.archivos <h6 class="mb-0">${anuncio.titulo} ${prioridadIcon}</h6><h6 class="mb-0">${anuncio.titulo} ${prioridadIcon}</h6> anuncio.archivos.length > 0 ? `<i class="bi bi-paperclip text-primary ms-1" title="${anuncio.archivos.length} archivo(s) adjunto(s)"></i>` : ""}</h6>
                <p class="text-muted small mb-0">
                  ${new Date(anuncio.fechaCreacion).toLocaleDateString('es-MX')}
                  ${fechaFin ? ` · Expira: ${new Date(fechaFin).toLocaleDateString('es-MX')}` : ''}
                </p>
              </div>
            </div>
          </td>
          <td>
            <span class="badge ${badgeClass}">${this.getTipoLabel(anuncio.tipo)}</span>
          </td>
          <td>
            <span class="badge bg-${anuncio.activo ? 'success' : 'secondary'}">
              ${anuncio.activo ? 'Activo' : 'Inactivo'}
            </span>
            ${vencido ? '<span class="badge bg-danger ms-1">Vencido</span>' : ''}
            ${programado ? `<span class="badge bg-info text-dark ms-1" title="Programado para: ${new Date(fechaPublicacion).toLocaleString('es-MX')}">Programado</span>` : ''}
          </td>
          <td>
            <div class="btn-group">
              <button type="button" class="btn btn-sm btn-outline-primary btn-view" data-id="${anuncio.id}" title="Ver detalle">
                <i class="bi bi-eye"></i>
              </button>
              <button type="button" class="btn btn-sm btn-outline-secondary btn-edit" data-id="${anuncio.id}" title="Editar">
                <i class="bi bi-pencil"></i>
              </button>
              <button type="button" class="btn btn-sm btn-outline-${anuncio.activo ? 'warning' : 'success'} btn-toggle" data-id="${anuncio.id}" title="${anuncio.activo ? 'Desactivar' : 'Activar'}">
                <i class="bi bi-${anuncio.activo ? 'toggle-off' : 'toggle-on'}"></i>
              </button>
              <button type="button" class="btn btn-sm btn-outline-danger btn-delete" data-id="${anuncio.id}" title="Eliminar">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  updateContadores() {
    // Total de anuncios
    const totalAnuncios = this.anuncios.length;
    document.getElementById('totalAnuncios').textContent = totalAnuncios;
    
    // Anuncios activos
    const anunciosActivos = this.anuncios.filter(a => a.activo).length;
    document.getElementById('anunciosActivos').textContent = anunciosActivos;
    
    // Anuncios urgentes
    const anunciosUrgentes = this.anuncios.filter(a => a.tipo === 'URGENTE' && a.activo).length;
    document.getElementById('anunciosUrgentes').textContent = anunciosUrgentes;
  }

  showLoading(show, buttonId = null, loadingText = null) {
    // Spinner global
    const loadingSpinner = document.createElement('div');
    loadingSpinner.id = 'loadingSpinner';
    loadingSpinner.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75';
    loadingSpinner.style.zIndex = '9999';
    loadingSpinner.innerHTML = `
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    `;
    
    // Remover spinner existente
    document.getElementById('loadingSpinner')?.remove();
    
    // Mostrar u ocultar spinner
    if (show) {
      document.body.appendChild(loadingSpinner);
    }
    
    // Si se especificó un botón, actualizar su estado
    if (buttonId) {
      const button = document.getElementById(buttonId);
      if (button) {
        button.disabled = show;
        if (loadingText && show) {
          button.dataset.originalText = button.innerHTML;
          button.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ${loadingText}
          `;
        } else if (button.dataset.originalText) {
          button.innerHTML = button.dataset.originalText;
          delete button.dataset.originalText;
        }
      }
    }
  }

  showError(message) {
    // Crear alerta
    const alertElement = document.createElement('div');
    alertElement.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 end-0 m-3';
    alertElement.style.zIndex = '9999';
    alertElement.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Añadir a la página
    document.body.appendChild(alertElement);
    
    // Auto-cerrar después de 5 segundos
    setTimeout(() => {
      alertElement.remove();
    }, 5000);
  }

  showSuccess(message) {
    // Crear alerta
    const alertElement = document.createElement('div');
    alertElement.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 end-0 m-3';
    alertElement.style.zIndex = '9999';
    alertElement.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Añadir a la página
    document.body.appendChild(alertElement);
    
    // Auto-cerrar después de 3 segundos
    setTimeout(() => {
      alertElement.remove();
    }, 3000);
  
  getFileIcon(mimeType) {
    if (mimeType.startsWith("image/")) {
      return "bi bi-file-earmark-image text-primary";
    } else if (mimeType === "application/pdf") {
      return "bi bi-file-earmark-pdf text-danger";
    } else if (mimeType.includes("word")) {
      return "bi bi-file-earmark-word text-primary";
    } else {
      return "bi bi-file-earmark text-secondary";
    }
  }
  
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  }
}

// Make AnunciosManager globally available
window.AnunciosManager = AnunciosManager;

// Initialize AnunciosManager when section becomes active
document.addEventListener('DOMContentLoaded', () => {
  // Listen for section changes
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.target.id === 'anunciosSection' && 
          mutation.attributeName === 'class' && 
          mutation.target.classList.contains('active')) {
        // Initialize if not already done
        if (!window.anunciosManagerInstance) {
          window.anunciosManagerInstance = new AnunciosManager();
        }
      }
    });
  });
  
  const anunciosSection = document.getElementById('anunciosSection');
  if (anunciosSection) {
    observer.observe(anunciosSection, { attributes: true });
    
    // Initialize immediately if section is already active
    if (anunciosSection.classList.contains('active')) {
      window.anunciosManagerInstance = new AnunciosManager();
    }
  }
});