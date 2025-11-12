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
            
            fileInfo.innerHTML = `\n                <i class=\"${icon} me-2 fs-4\"></i>\n                <div>\n                    <div class=\"fw-medium\">${file.name}</div>\n                    <small class=\"text-muted\">${size}</small>\n                </div>\n            `;\n            \n            const removeBtn = document.createElement('button');\n            removeBtn.type = 'button';\n            removeBtn.className = 'btn btn-sm btn-outline-danger';\n            removeBtn.innerHTML = '<i class=\"bi bi-trash\"></i>';\n            removeBtn.onclick = () => this.removeFile(index);\n            \n            fileItem.appendChild(fileInfo);\n            fileItem.appendChild(removeBtn);\n            container.appendChild(fileItem);\n        });\n    }\n    \n    getFileIcon(mimeType) {\n        if (mimeType.startsWith('image/')) {\n            return 'bi bi-file-earmark-image text-primary';\n        } else if (mimeType === 'application/pdf') {\n            return 'bi bi-file-earmark-pdf text-danger';\n        } else if (mimeType.includes('word')) {\n            return 'bi bi-file-earmark-word text-primary';\n        } else {\n            return 'bi bi-file-earmark text-secondary';\n        }\n    }\n    \n    formatFileSize(bytes) {\n        if (bytes === 0) return '0 Bytes';\n        const k = 1024;\n        const sizes = ['Bytes', 'KB', 'MB', 'GB'];\n        const i = Math.floor(Math.log(bytes) / Math.log(k));\n        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];\n    }\n    \n    getSelectedFiles() {\n        return this.selectedFiles;\n    }\n    \n    clearFiles() {\n        this.selectedFiles = [];\n        this.updateFilesList();\n        \n        // Limpiar input\n        const input = document.getElementById('anuncioArchivos');\n        if (input) {\n            input.value = '';\n        }\n    }\n    \n    // Método para mostrar archivos existentes (para edición)\n    displayExistingFiles(archivos) {\n        if (!archivos || archivos.length === 0) return;\n        \n        const container = document.getElementById('existingFilesContainer');\n        if (!container) return;\n        \n        container.innerHTML = '';\n        \n        archivos.forEach((archivo, index) => {\n            const fileItem = document.createElement('div');\n            fileItem.className = 'file-item d-flex align-items-center justify-content-between p-2 border rounded mb-2 bg-light';\n            \n            const fileInfo = document.createElement('div');\n            fileInfo.className = 'd-flex align-items-center';\n            \n            const icon = this.getFileIcon(archivo.mimetype);\n            const size = this.formatFileSize(archivo.size);\n            \n            fileInfo.innerHTML = `\n                <i class=\"${icon} me-2 fs-4\"></i>\n                <div>\n                    <div class=\"fw-medium\">${archivo.originalName}</div>\n                    <small class=\"text-muted\">${size} • Subido: ${new Date(archivo.uploadedAt).toLocaleDateString()}</small>\n                </div>\n            `;\n            \n            const actions = document.createElement('div');\n            actions.className = 'btn-group btn-group-sm';\n            \n            const downloadBtn = document.createElement('a');\n            downloadBtn.className = 'btn btn-outline-primary';\n            downloadBtn.href = `/api/anuncios/${archivo.anuncioId}/archivos/${archivo.filename}/download`;\n            downloadBtn.innerHTML = '<i class=\"bi bi-download\"></i>';\n            downloadBtn.title = 'Descargar';\n            \n            const deleteBtn = document.createElement('button');\n            deleteBtn.type = 'button';\n            deleteBtn.className = 'btn btn-outline-danger';\n            deleteBtn.innerHTML = '<i class=\"bi bi-trash\"></i>';\n            deleteBtn.title = 'Eliminar';\n            deleteBtn.onclick = () => this.deleteExistingFile(archivo.anuncioId, archivo.filename, fileItem);\n            \n            actions.appendChild(downloadBtn);\n            actions.appendChild(deleteBtn);\n            \n            fileItem.appendChild(fileInfo);\n            fileItem.appendChild(actions);\n            container.appendChild(fileItem);\n        });\n    }\n    \n    async deleteExistingFile(anuncioId, filename, fileElement) {\n        if (!confirm('¿Estás seguro de que quieres eliminar este archivo?')) {\n            return;\n        }\n        \n        try {\n            const response = await fetch(`/api/anuncios/${anuncioId}/archivos/${filename}`, {\n                method: 'DELETE',\n                headers: {\n                    'x-auth-token': localStorage.getItem('token')\n                }\n            });\n            \n            const data = await response.json();\n            \n            if (data.ok) {\n                fileElement.remove();\n                showAlert('Archivo eliminado correctamente.', 'success');\n            } else {\n                showAlert(data.msg || 'Error al eliminar el archivo.', 'error');\n            }\n        } catch (error) {\n            console.error('Error eliminando archivo:', error);\n            showAlert('Error al eliminar el archivo.', 'error');\n        }\n    }\n}\n\n// Instancia global del gestor de archivos\nlet fileUploadManager;\n\n// Inicializar cuando el DOM esté listo\ndocument.addEventListener('DOMContentLoaded', () => {\n    fileUploadManager = new FileUploadManager();\n    // Hacer disponible globalmente\n    window.fileUploadManager = fileUploadManager;\n});