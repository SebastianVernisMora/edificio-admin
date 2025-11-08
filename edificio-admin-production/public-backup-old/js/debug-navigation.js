// Debug script for navigation
document.addEventListener('DOMContentLoaded', () => {
  console.log('🔍 Debug Navigation Script Loaded');
  
  // Check if elements exist
  const sidebar = document.querySelector('.sidebar-nav');
  const contentSections = document.querySelectorAll('.content-section');
  const pageTitle = document.getElementById('page-title');
  
  console.log('Sidebar:', sidebar);
  console.log('Content sections found:', contentSections.length);
  console.log('Page title element:', pageTitle);
  
  // List all content sections
  contentSections.forEach((section, index) => {
    console.log(`Section ${index}:`, section.id, 'visible:', section.style.display !== 'none');
  });
  
  // Add click handlers to navigation
  if (sidebar) {
    sidebar.addEventListener('click', (e) => {
      console.log('🖱️ Navigation clicked:', e.target);
      
      const link = e.target.closest('a');
      if (link) {
        e.preventDefault();
        const href = link.getAttribute('href');
        const sectionId = href ? href.substring(1) : null;
        
        console.log('🎯 Target section:', sectionId);
        
        if (sectionId) {
          // Simple navigation logic
          contentSections.forEach(section => {
            if (section.id === `${sectionId}-section`) {
              section.style.display = 'block';
              section.classList.add('active');
              console.log('✅ Showing section:', section.id);
            } else {
              section.style.display = 'none';
              section.classList.remove('active');
            }
          });
          
          // Update active nav item
          const navItems = sidebar.querySelectorAll('li');
          navItems.forEach(item => {
            const navLink = item.querySelector('a');
            if (navLink && navLink.getAttribute('href') === href) {
              item.classList.add('active');
            } else {
              item.classList.remove('active');
            }
          });
          
          // Update page title
          if (pageTitle) {
            const titles = {
              'dashboard': 'Dashboard',
              'usuarios': 'Gestión de Usuarios',
              'cuotas': 'Gestión de Cuotas',
              'gastos': 'Gestión de Gastos',
              'fondos': 'Gestión de Fondos',
              'anuncios': 'Gestión de Anuncios',
              'cierres': 'Cierres Contables',
              'parcialidades': 'Parcialidades 2026'
            };
            pageTitle.textContent = titles[sectionId] || sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
          }
        }
      }
    });
  } else {
    console.error('❌ Sidebar not found!');
  }
});