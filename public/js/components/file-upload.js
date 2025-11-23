// Gestión de archivos adjuntos para anuncios
class FileUploadManager {
    constructor() {
        this.selectedFiles = [];
        this.maxFiles = 5;
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp'
        ];
        this.allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        // Botón para seleccionar archivos
        document.addEventListener('click', (e) => {
            if (e.target.id === 'selectFilesBtn') {
                e.preventDefault();
                document.getElementById('anuncioArchivos').click();
            }
        });
        
        // Input de archivos
        document.addEventListener('change', (e) => {
            if (e.target.id === 'anuncioArchivos') {
                this.handleFileSelection(e.target.files);
            }
        });
        
        // Drag and drop
        document.addEventListener('dragover', (e) => {
            if (e.target.closest('#fileUploadArea')) {
                e.preventDefault();
                e.target.closest('#fileUploadArea').classList.add('drag-over');
            }
        });
        
        document.addEventListener('dragleave', (e) => {
            if (e.target.closest('#fileUploadArea')) {
                e.target.closest('#fileUploadArea').classList.remove('drag-over');
            }
        });
        
        document.addEventListener('drop', (e) => {
            if (e.target.closest('#fileUploadArea')) {
                e.preventDefault();
                e.target.closest('#fileUploadArea').classList.remove('drag-over');
                this.handleFileSelection(e.dataTransfer.files);
            }
        });
    }
    
    handleFileSelection(files) {
        const fileArray = Array.from(files);
        
        // Validar número total de archivos
        if (this.selectedFiles.length + fileArray.length > this.maxFiles) {
            showAlert(`Solo se pueden adjuntar máximo ${this.maxFiles} archivos. Actualmente tienes ${this.selectedFiles.length} archivos.`, 'warning');
            return;
        }
        
        // Validar cada archivo
        const validFiles = [];
        for (const file of fileArray) {
            if (this.validateFile(file)) {
                validFiles.push(file);
            }
        }
        
        // Agregar archivos válidos
        this.selectedFiles.push(...validFiles);
        this.updateFilesList();
        
        if (validFiles.length > 0) {
            showAlert(`${validFiles.length} archivo(s) agregado(s) correctamente.`, 'success');
        }
    }
    
    validateFile(file) {
        // Validar tamaño
        if (file.size > this.maxFileSize) {
            showAlert(`El archivo "${file.name}" es demasiado grande. Máximo 5MB.`, 'error');
            return false;
        }
        
        // Validar tipo
        if (!this.allowedTypes.includes(file.type)) {
            showAlert(`El archivo "${file.name}" no es de un tipo permitido.`, 'error');
            return false;
        }
        
        // Validar extensión
        const extension = '.' + file.name.split('.').pop().toLowerCase();
        if (!this.allowedExtensions.includes(extension)) {
            showAlert(`La extensión del archivo "${file.name}" no está permitida.`, 'error');
            return false;
        }
        
        // Validar duplicados
        if (this.selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
            showAlert(`El archivo "${file.name}" ya está seleccionado.`, 'warning');
            return false;
        }
        
        return true;
    }
    
    removeFile(index) {
        this.selectedFiles.splice(index, 1);
        this.updateFilesList();
        showAlert('Archivo eliminado de la selección.', 'info');
    }
    
    updateFilesList() {
        const container = document.getElementById('filesContainer');
        const listDiv = document.getElementById('selectedFilesList');
        
        if (!container || !listDiv) return;
        
        if (this.selectedFiles.length === 0) {
            listDiv.style.display = 'none';
            return;
        }
        
        listDiv.style.display = 'block';
        container.innerHTML = '';
        
        this.selectedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item d-flex align-items-center justify-content-between p-2 border rounded mb-2';
            
            const fileInfo = document.createElement('div');
            fileInfo.className = 'd-flex align-items-center';
            
            const icon = this.getFileIcon(file.type);
            const size = this.formatFileSize(file.size);
            
            fileInfo.innerHTML = `
                <i class=\"${icon} me-2 fs-4\"></i>
                <div>
                    <div class=\"fw-medium\">${file.name}</div>
                    <small class=\"text-muted\">${size}</small>
                </div>
            `;
            
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'btn btn-sm btn-outline-danger';
            removeBtn.innerHTML = '<i class=\"bi bi-trash\"></i>';
            removeBtn.onclick = () => this.removeFile(index);
            
            fileItem.appendChild(fileInfo);
            fileItem.appendChild(removeBtn);
            container.appendChild(fileItem);
        });
    }
    
    getFileIcon(mimeType) {
        if (mimeType.startsWith('image/')) {
            return 'bi bi-file-earmark-image text-primary';
        } else if (mimeType === 'application/pdf') {
            return 'bi bi-file-earmark-pdf text-danger';
        } else if (mimeType.includes('word')) {
            return 'bi bi-file-earmark-word text-primary';
        } else {
            return 'bi bi-file-earmark text-secondary';
        }
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    getSelectedFiles() {
        return this.selectedFiles;
    }
    
    clearFiles() {
        this.selectedFiles = [];
        this.updateFilesList();
        
        // Limpiar input
        const input = document.getElementById('anuncioArchivos');
        if (input) {
            input.value = '';
        }
    }
    
    // Método para mostrar archivos existentes (para edición)
    displayExistingFiles(archivos) {
        if (!archivos || archivos.length === 0) return;
        
        const container = document.getElementById('existingFilesContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        archivos.forEach((archivo, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item d-flex align-items-center justify-content-between p-2 border rounded mb-2 bg-light';
            
            const fileInfo = document.createElement('div');
            fileInfo.className = 'd-flex align-items-center';
            
            const icon = this.getFileIcon(archivo.mimetype);
            const size = this.formatFileSize(archivo.size);
            
            fileInfo.innerHTML = `
                <i class=\"${icon} me-2 fs-4\"></i>
                <div>
                    <div class=\"fw-medium\">${archivo.originalName}</div>
                    <small class=\"text-muted\">${size} • Subido: ${new Date(archivo.uploadedAt).toLocaleDateString()}</small>
                </div>
            `;
            
            const actions = document.createElement('div');
            actions.className = 'btn-group btn-group-sm';
            
            const downloadBtn = document.createElement('a');
            downloadBtn.className = 'btn btn-outline-primary';
            downloadBtn.href = `/api/anuncios/${archivo.anuncioId}/archivos/${archivo.filename}/download`;
            downloadBtn.innerHTML = '<i class=\"bi bi-download\"></i>';
            downloadBtn.title = 'Descargar';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'btn btn-outline-danger';
            deleteBtn.innerHTML = '<i class=\"bi bi-trash\"></i>';
            deleteBtn.title = 'Eliminar';
            deleteBtn.onclick = () => this.deleteExistingFile(archivo.anuncioId, archivo.filename, fileItem);
            
            actions.appendChild(downloadBtn);
            actions.appendChild(deleteBtn);
            
            fileItem.appendChild(fileInfo);
            fileItem.appendChild(actions);
            container.appendChild(fileItem);
        });
    }
    
    async deleteExistingFile(anuncioId, filename, fileElement) {
        if (!confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/anuncios/${anuncioId}/archivos/${filename}`, {
                method: 'DELETE',
                headers: {
                    'x-auth-token': localStorage.getItem('token')
                }
            });
            
            const data = await response.json();
            
            if (data.ok) {
                fileElement.remove();
                showAlert('Archivo eliminado correctamente.', 'success');
            } else {
                showAlert(data.msg || 'Error al eliminar el archivo.', 'error');
            }
        } catch (error) {
            console.error('Error eliminando archivo:', error);
            showAlert('Error al eliminar el archivo.', 'error');
        }
    }
}

// Instancia global del gestor de archivos
let fileUploadManager;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    fileUploadManager = new FileUploadManager();
    // Hacer disponible globalmente
    window.fileUploadManager = fileUploadManager;
});