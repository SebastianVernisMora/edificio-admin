// Navegación Simple para Admin Panel
document.addEventListener('DOMContentLoaded', () => {
  console.log('✓ Navegación simple cargada');
  
  // Mostrar sección por defecto
  showSection('cuotas');
  
  // Setup navigation links
  const navLinks = document.querySelectorAll('.sidebar-nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      const sectionId = href.replace('#', '');
      
      console.log('Navegando a:', sectionId);
      
      // Remover active de todos los links
      navLinks.forEach(l => l.parentElement.classList.remove('active'));
      
      // Agregar active al link clickeado
      link.parentElement.classList.add('active');
      
      // Mostrar sección
      showSection(sectionId);
      
      // Actualizar título
      const title = link.textContent.trim().replace(/.*\s/, '');
      document.getElementById('page-title').textContent = title;
    });
  });
});

function showSection(sectionId) {
  console.log('Mostrando sección:', sectionId);
  
  // Ocultar todas las secciones
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => {
    section.classList.remove('active');
    section.style.display = 'none';
  });
  
  // Mostrar sección solicitada
  const targetSection = document.getElementById(`${sectionId}-section`);
  if (targetSection) {
    targetSection.classList.add('active');
    targetSection.style.display = 'block';
    console.log('✓ Sección mostrada:', sectionId);
  } else {
    console.warn('Sección no encontrada:', sectionId);
    // Mostrar cuotas por defecto
    const cuotasSection = document.getElementById('cuotas-section');
    if (cuotasSection) {
      cuotasSection.classList.add('active');
      cuotasSection.style.display = 'block';
    }
  }
}
