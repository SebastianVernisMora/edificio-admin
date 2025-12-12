// Simple initialization for AnunciosManager
document.addEventListener('DOMContentLoaded', () => {
  let anunciosManager = null;
  
  // Function to initialize AnunciosManager
  const initAnunciosManager = () => {
    if (!anunciosManager && typeof AnunciosManager !== 'undefined') {
      try {
        anunciosManager = new AnunciosManager();
        console.log('✅ AnunciosManager inicializado correctamente');
        return true;
      } catch (error) {
        console.error('❌ Error inicializando AnunciosManager:', error);
        return false;
      }
    }
    return anunciosManager !== null;
  };
  
  // Initialize when clicking on Anuncios section
  document.querySelectorAll('a[data-section="anuncios"]').forEach(link => {
    link.addEventListener('click', () => {
      setTimeout(() => {
        initAnunciosManager();
      }, 100);
    });
  });
  
  // Initialize if anuncios section is already active
  const anunciosSection = document.getElementById('anunciosSection');
  if (anunciosSection && anunciosSection.classList.contains('active')) {
    setTimeout(() => {
      initAnunciosManager();
    }, 100);
  }
  
  // Watch for section changes
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.target.id === 'anunciosSection' && 
          mutation.attributeName === 'class' && 
          mutation.target.classList.contains('active')) {
        setTimeout(() => {
          initAnunciosManager();
        }, 100);
      }
    });
  });
  
  if (anunciosSection) {
    observer.observe(anunciosSection, { attributes: true });
  }
});