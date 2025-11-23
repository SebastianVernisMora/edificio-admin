// Navegación Simple para Admin Panel
document.addEventListener('DOMContentLoaded', () => {
  console.log('✓ Navegación simple cargada');
  
  // Mostrar sección por defecto
  showSection('cuotas');
  
  // Cargar datos de cuotas al inicio
  setTimeout(() => {
    if (typeof filtrarCuotas === 'function') {
      filtrarCuotas();
    }
    if (typeof cargarCuotasInquilino === 'function') {
      cargarCuotasInquilino();
    }
  }, 500);
  
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
      
      // Cargar datos de la sección
      loadSectionData(sectionId);
    });
  });
});

function loadSectionData(sectionId) {
  switch(sectionId) {
    case 'dashboard':
      if (typeof cargarDashboard === 'function') cargarDashboard();
      if (typeof cargarDashboardInquilino === 'function') cargarDashboardInquilino();
      break;
    case 'cuotas':
      if (typeof filtrarCuotas === 'function') filtrarCuotas();
      if (typeof cargarCuotasInquilino === 'function') cargarCuotasInquilino();
      break;
    case 'gastos':
      if (typeof filtrarGastos === 'function') filtrarGastos();
      break;
    case 'fondos':
      if (typeof cargarFondos === 'function') cargarFondos();
      if (typeof cargarMovimientosFondos === 'function') cargarMovimientosFondos();
      break;
    case 'anuncios':
      if (typeof filtrarAnuncios === 'function') filtrarAnuncios();
      if (typeof cargarAnunciosInquilino === 'function') cargarAnunciosInquilino();
      break;
    case 'cierres':
      if (typeof cargarCierres === 'function') cargarCierres();
      break;
    case 'usuarios':
      if (typeof filtrarUsuarios === 'function') filtrarUsuarios();
      break;
    case 'parcialidades':
      if (typeof cargarParcialidades === 'function') cargarParcialidades();
      break;
  }
}

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
