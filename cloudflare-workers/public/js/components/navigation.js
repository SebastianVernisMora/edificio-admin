// Navigation System - Centralized navigation logic
const NavigationSystem = (() => {
  // Navigation state
  let currentSection = 'dashboard';
  
  // Initialize navigation system
  const init = () => {
    setupEventListeners();
    showSection('dashboard');
  };

  // Setup all event listeners
  const setupEventListeners = () => {
    // Sidebar navigation
    document.addEventListener('click', (e) => {
      const navLink = e.target.closest('.sidebar-nav a');
      if (navLink) {
        e.preventDefault();
        const sectionId = navLink.getAttribute('href').substring(1);
        showSection(sectionId);
      }
    });

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }
  };

  // Show specific section
  const showSection = (sectionId) => {
    // Hide all sections
    const allSections = document.querySelectorAll('.content-section');
    allSections.forEach(section => {
      section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    // Update sidebar active state
    updateSidebarActive(sectionId);

    // Update page title
    updatePageTitle(sectionId);

    // Load section data
    loadSectionData(sectionId);

    // Update current section
    currentSection = sectionId;
  };

  // Update sidebar active state
  const updateSidebarActive = (sectionId) => {
    const sidebarItems = document.querySelectorAll('.sidebar-nav li');
    sidebarItems.forEach(item => {
      const link = item.querySelector('a');
      if (link && link.getAttribute('href') === `#${sectionId}`) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  };

  // Update page title
  const updatePageTitle = (sectionId) => {
    const titleElement = document.getElementById('page-title');
    if (titleElement) {
      const titles = {
        dashboard: 'Dashboard',
        usuarios: 'Usuarios',
        cuotas: 'Cuotas',
        gastos: 'Gastos',
        fondos: 'Fondos',
        anuncios: 'Anuncios',
        cierres: 'Cierres',
        parcialidades: 'Parcialidades 2026'
      };
      titleElement.textContent = titles[sectionId] || sectionId;
    }
  };

  // Load section data
  const loadSectionData = (sectionId) => {
    switch (sectionId) {
      case 'dashboard':
        if (typeof DashboardModule !== 'undefined') {
          DashboardModule.loadDashboard();
        }
        break;
      case 'usuarios':
        if (typeof UsuariosModule !== 'undefined') {
          UsuariosModule.loadUsuarios();
        }
        break;
      case 'cuotas':
        if (typeof CuotasModule !== 'undefined') {
          CuotasModule.loadCuotas();
        }
        break;
      case 'gastos':
        if (typeof GastosModule !== 'undefined') {
          GastosModule.loadGastos();
        }
        break;
      case 'fondos':
        if (typeof FondosModule !== 'undefined') {
          FondosModule.loadFondos();
        }
        break;
      case 'anuncios':
        if (typeof AnunciosModule !== 'undefined') {
          AnunciosModule.loadAnuncios();
        }
        break;
      case 'cierres':
        if (typeof CierresModule !== 'undefined') {
          CierresModule.loadCierres();
        }
        break;
      case 'parcialidades':
        if (typeof ParcialidadesModule !== 'undefined') {
          ParcialidadesModule.loadParcialidades();
        }
        break;
    }
  };

  // Handle logout
  const handleLogout = () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      Auth.logout();
      window.location.href = '/';
    }
  };

  // Get current section
  const getCurrentSection = () => currentSection;

  // Public API
  return {
    init,
    showSection,
    getCurrentSection
  };
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Verify user authentication
  const currentUser = Auth.getCurrentUser();
  if (!currentUser || (currentUser.rol !== 'admin' && currentUser.rol !== 'superadmin')) {
    window.location.href = '/';
    return;
  }

  // Set user name
  const userNameEl = document.getElementById('user-name');
  if (userNameEl && currentUser) {
    userNameEl.textContent = currentUser.nombre;
  }

  // Set current date
  const currentDateEl = document.getElementById('current-date');
  if (currentDateEl) {
    const now = new Date();
    const options = { year: 'numeric', month: 'long' };
    currentDateEl.textContent = now.toLocaleDateString('es-ES', options);
  }

  // Initialize navigation
  NavigationSystem.init();
});