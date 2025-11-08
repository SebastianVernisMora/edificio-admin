// Simple initialization for CierresManager
document.addEventListener('DOMContentLoaded', () => {
  let cierresManager = null;
  
  // Function to initialize CierresManager
  const initCierresManager = () => {
    if (!cierresManager && typeof CierresManager !== 'undefined') {
      try {
        cierresManager = new CierresManager();
        console.log('✅ CierresManager inicializado correctamente');
        return true;
      } catch (error) {
        console.error('❌ Error inicializando CierresManager:', error);
        return false;
      }
    }
    return cierresManager !== null;
  };
  
  // Initialize when clicking on Cierres section
  document.querySelectorAll('a[data-section="cierres"]').forEach(link => {
    link.addEventListener('click', () => {
      setTimeout(() => {
        initCierresManager();
      }, 100);
    });
  });
  
  // Initialize if cierres section is already active
  const cierresSection = document.getElementById('cierresSection');
  if (cierresSection && cierresSection.classList.contains('active')) {
    setTimeout(() => {
      initCierresManager();
    }, 100);
  }
  
  // Watch for section changes
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.target.id === 'cierresSection' && 
          mutation.attributeName === 'class' && 
          mutation.target.classList.contains('active')) {
        setTimeout(() => {
          initCierresManager();
        }, 100);
      }
    });
  });
  
  if (cierresSection) {
    observer.observe(cierresSection, { attributes: true });
  }
});