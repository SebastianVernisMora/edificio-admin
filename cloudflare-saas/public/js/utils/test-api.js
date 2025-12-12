// Simple API test
document.addEventListener('DOMContentLoaded', () => {
  // Test anuncios API
  const testAnunciosAPI = async () => {
    try {
      const token = localStorage.getItem('edificio_auth_token');
      console.log('🔍 Testing anuncios API with token:', token ? 'Present' : 'Missing');
      
      const response = await fetch('/api/anuncios', {
        headers: { 'x-auth-token': token }
      });
      
      console.log('📡 Anuncios API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Anuncios API working:', data);
        
        // Update counters manually
        const anuncios = data.anuncios || [];
        document.getElementById('totalAnuncios').textContent = anuncios.length;
        document.getElementById('anunciosActivos').textContent = anuncios.filter(a => a.activo).length;
        document.getElementById('anunciosUrgentes').textContent = anuncios.filter(a => a.tipo === 'URGENTE' && a.activo).length;
        
        // Render anuncios in table
        const tbody = document.getElementById('anunciosTableBody');
        if (tbody && anuncios.length > 0) {
          tbody.innerHTML = anuncios.map(anuncio => `
            <tr>
              <td>${anuncio.id}</td>
              <td>${anuncio.titulo}</td>
              <td><span class="badge bg-secondary">${anuncio.tipo || 'GENERAL'}</span></td>
              <td>${new Date(anuncio.fechaCreacion || anuncio.fecha).toLocaleDateString('es-MX')}</td>
              <td><span class="badge bg-${anuncio.activo ? 'success' : 'secondary'}">${anuncio.activo ? 'Activo' : 'Inactivo'}</span></td>
              <td>
                <button class="btn btn-sm btn-outline-primary" onclick="alert('Ver anuncio: ${anuncio.titulo}')">
                  <i class="bi bi-eye"></i>
                </button>
              </td>
            </tr>
          `).join('');
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Anuncios API error:', errorData);
      }
    } catch (error) {
      console.error('❌ Error testing anuncios API:', error);
    }
  };
  
  // Test cierres API
  const testCierresAPI = async () => {
    try {
      const token = localStorage.getItem('edificio_auth_token');
      console.log('🔍 Testing cierres API with token:', token ? 'Present' : 'Missing');
      
      const response = await fetch('/api/cierres', {
        headers: { 'x-auth-token': token }
      });
      
      console.log('📡 Cierres API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Cierres API working:', data);
        
        // Update counters manually
        const cierres = data.cierres || [];
        document.getElementById('totalCierres').textContent = cierres.length;
      } else {
        const errorData = await response.json();
        console.error('❌ Cierres API error:', errorData);
      }
    } catch (error) {
      console.error('❌ Error testing cierres API:', error);
    }
  };
  
  // Run tests when anuncios section is active
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.target.id === 'anunciosSection' && 
          mutation.attributeName === 'class' && 
          mutation.target.classList.contains('active')) {
        console.log('🎯 Anuncios section activated - running API test');
        testAnunciosAPI();
      }
      if (mutation.target.id === 'cierresSection' && 
          mutation.attributeName === 'class' && 
          mutation.target.classList.contains('active')) {
        console.log('🎯 Cierres section activated - running API test');
        testCierresAPI();
      }
    });
  });
  
  const anunciosSection = document.getElementById('anunciosSection');
  const cierresSection = document.getElementById('cierresSection');
  
  if (anunciosSection) {
    observer.observe(anunciosSection, { attributes: true });
  }
  if (cierresSection) {
    observer.observe(cierresSection, { attributes: true });
  }
});