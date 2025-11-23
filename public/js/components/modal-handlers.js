// Simple modal handlers for Anuncios and Cierres
document.addEventListener('DOMContentLoaded', () => {
  
  // Handle Nuevo Anuncio button
  const btnNuevoAnuncio = document.getElementById('btnNuevoAnuncio');
  if (btnNuevoAnuncio) {
    btnNuevoAnuncio.addEventListener('click', () => {
      console.log('🎯 Opening Nuevo Anuncio modal');
      const modal = new bootstrap.Modal(document.getElementById('anuncioModal'));
      
      // Reset form
      const form = document.getElementById('anuncioForm');
      if (form) {
        form.reset();
        document.getElementById('anuncioId').value = '';
        document.getElementById('anuncioModalLabel').textContent = 'Nuevo Anuncio';
        
        // Set default values
        document.getElementById('anuncioActivo').checked = true;
        document.getElementById('anuncioPrioridad').value = 0;
        
        // Set default expiration date (30 days from now)
        const fechaFin = new Date();
        fechaFin.setDate(fechaFin.getDate() + 30);
        document.getElementById('anuncioFechaFin').value = fechaFin.toISOString().split('T')[0];
        
        // Update character counter
        document.getElementById('contadorCaracteres').textContent = '0/1000';
        document.getElementById('contadorCaracteres').classList.remove('text-danger');
        
        // Update preview
        updateAnuncioPreview();
      }
      
      modal.show();
    });
  }
  
  // Handle Guardar Anuncio button
  const btnGuardarAnuncio = document.getElementById('btnGuardarAnuncio');
  if (btnGuardarAnuncio) {
    btnGuardarAnuncio.addEventListener('click', async () => {
      await handleGuardarAnuncio();
    });
  }
  
  // Handle Cierre Mensual button
  const btnGenerarCierreMensual = document.getElementById('btnGenerarCierreMensual');
  if (btnGenerarCierreMensual) {
    btnGenerarCierreMensual.addEventListener('click', () => {
      console.log('🎯 Opening Cierre Mensual modal');
      const modal = new bootstrap.Modal(document.getElementById('cierreMensualModal'));
      
      // Reset form and set current month/year
      const form = document.getElementById('cierreMensualForm');
      if (form) {
        form.reset();
        
        const fecha = new Date();
        const meses = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        document.getElementById('cierreMensualMes').value = meses[fecha.getMonth()];
        document.getElementById('cierreMensualAño').value = fecha.getFullYear();
      }
      
      modal.show();
    });
  }
  
  // Handle Cierre Anual button
  const btnGenerarCierreAnual = document.getElementById('btnGenerarCierreAnual');
  if (btnGenerarCierreAnual) {
    btnGenerarCierreAnual.addEventListener('click', () => {
      console.log('🎯 Opening Cierre Anual modal');
      const modal = new bootstrap.Modal(document.getElementById('cierreAnualModal'));
      
      // Reset form and set current year
      const form = document.getElementById('cierreAnualForm');
      if (form) {
        form.reset();
        document.getElementById('cierreAnualAño').value = new Date().getFullYear();
      }
      
      modal.show();
    });
  }
  
  // Handle character counter for anuncio content
  const anuncioContenido = document.getElementById('anuncioContenido');
  if (anuncioContenido) {
    anuncioContenido.addEventListener('input', (e) => {
      const contador = document.getElementById('contadorCaracteres');
      if (contador) {
        const length = e.target.value.length;
        contador.textContent = `${length}/1000`;
        
        if (length > 900) {
          contador.classList.add('text-danger');
        } else {
          contador.classList.remove('text-danger');
        }
      }
      updateAnuncioPreview();
    });
  }
  
  // Handle preview updates
  const anuncioTitulo = document.getElementById('anuncioTitulo');
  const anuncioTipo = document.getElementById('anuncioTipo');
  
  if (anuncioTitulo) {
    anuncioTitulo.addEventListener('input', updateAnuncioPreview);
  }
  
  if (anuncioTipo) {
    anuncioTipo.addEventListener('change', updateAnuncioPreview);
  }
});

// Function to update anuncio preview
function updateAnuncioPreview() {
  const titulo = document.getElementById('anuncioTitulo')?.value || 'Título del anuncio';
  const contenido = document.getElementById('anuncioContenido')?.value || 'Contenido del anuncio...';
  const tipo = document.getElementById('anuncioTipo')?.value || 'GENERAL';
  
  // Update preview elements
  const previewTitulo = document.getElementById('previewTitulo');
  const previewContenido = document.getElementById('previewContenido');
  const previewTipo = document.getElementById('previewTipo');
  const previewFecha = document.getElementById('previewFecha');
  
  if (previewTitulo) previewTitulo.textContent = titulo;
  if (previewContenido) previewContenido.innerHTML = contenido.replace(/\n/g, '<br>');
  
  if (previewTipo) {
    previewTipo.textContent = getTipoLabel(tipo);
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
  }
  
  if (previewFecha) {
    previewFecha.textContent = `Publicado: ${new Date().toLocaleDateString('es-MX')}`;
  }
}

// Function to get tipo label
function getTipoLabel(tipo) {
  switch (tipo) {
    case 'GENERAL': return 'General';
    case 'IMPORTANTE': return 'Importante';
    case 'URGENTE': return 'Urgente';
    case 'REUNION': return 'Reunión';
    case 'MANTENIMIENTO': return 'Mantenimiento';
    default: return tipo;
  }
}

// Function to handle saving anuncio
async function handleGuardarAnuncio() {
  try {
    console.log('💾 Saving anuncio...');
    
    // Validate form
    const titulo = document.getElementById('anuncioTitulo').value.trim();
    const contenido = document.getElementById('anuncioContenido').value.trim();
    const tipo = document.getElementById('anuncioTipo').value;
    
    if (!titulo) {
      alert('El título es obligatorio');
      return;
    }
    
    if (!contenido) {
      alert('El contenido es obligatorio');
      return;
    }
    
    if (!tipo) {
      alert('Debe seleccionar un tipo de anuncio');
      return;
    }
    
    // Prepare data
    const anuncioData = {
      titulo: titulo,
      contenido: contenido,
      tipo: tipo,
      prioridad: parseInt(document.getElementById('anuncioPrioridad').value) || 0,
      activo: document.getElementById('anuncioActivo').checked,
      fechaFin: document.getElementById('anuncioFechaFin').value || null,
      fechaPublicacion: document.getElementById('anuncioFechaPublicacion').value || null
    };
    
    console.log('📤 Sending anuncio data:', anuncioData);
    
    // Send to API
    const token = localStorage.getItem('edificio_auth_token');
    const response = await fetch('/api/anuncios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify(anuncioData)
    });
    
    console.log('📡 Save anuncio response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Anuncio saved successfully:', result);
      
      // Close modal
      bootstrap.Modal.getInstance(document.getElementById('anuncioModal')).hide();
      
      // Show success message
      alert('Anuncio creado correctamente');
      
      // Refresh the anuncios section
      location.reload();
    } else {
      const errorData = await response.json();
      console.error('❌ Error saving anuncio:', errorData);
      alert(`Error al guardar el anuncio: ${errorData.msg || errorData.message}`);
    }
  } catch (error) {
    console.error('❌ Error in handleGuardarAnuncio:', error);
    alert(`Error al guardar el anuncio: ${error.message}`);
  }
}