// Debug Script para verificar navegación
console.log('🔍 Iniciando diagnóstico de navegación...');

// Verificar que NavigationSystem esté definido
setTimeout(() => {
    console.log('1. NavigationSystem:', typeof NavigationSystem !== 'undefined' ? '✅ Definido' : '❌ No definido');
    
    // Verificar módulos
    const modules = [
        'DashboardModule',
        'UsuariosModule', 
        'CuotasModule',
        'GastosModule',
        'FondosModule',
        'AnunciosModule',
        'CierresModule',
        'ParcialidadesModule'
    ];
    
    console.log('2. Módulos disponibles:');
    modules.forEach(module => {
        console.log(`   ${module}:`, typeof window[module] !== 'undefined' ? '✅' : '❌');
    });
    
    // Verificar elementos del DOM
    const elements = [
        'page-title',
        'user-name',
        'logout-btn'
    ];
    
    console.log('3. Elementos DOM:');
    elements.forEach(id => {
        console.log(`   #${id}:`, document.getElementById(id) ? '✅' : '❌');
    });
    
    // Verificar secciones
    const sections = document.querySelectorAll('.content-section');
    console.log(`4. Secciones encontradas: ${sections.length}`);
    sections.forEach(section => {
        console.log(`   ${section.id}:`, section.classList.contains('active') ? '🟢 Activa' : '⚪ Inactiva');
    });
    
    // Verificar enlaces de navegación
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    console.log(`5. Enlaces de navegación: ${navLinks.length}`);
    
    // Probar navegación
    if (typeof NavigationSystem !== 'undefined' && NavigationSystem.showSection) {
        console.log('6. Probando navegación a usuarios...');
        try {
            NavigationSystem.showSection('usuarios');
            setTimeout(() => {
                const usuariosSection = document.getElementById('usuarios-section');
                console.log('   Resultado:', usuariosSection && usuariosSection.classList.contains('active') ? '✅ Éxito' : '❌ Fallo');
            }, 100);
        } catch (error) {
            console.log('   Error:', error.message);
        }
    }
    
}, 2000); // Esperar 2 segundos para que todo cargue

// Escuchar clics en el menú
document.addEventListener('click', (e) => {
    const navLink = e.target.closest('.sidebar-nav a');
    if (navLink) {
        console.log('🖱️ Clic en:', navLink.textContent.trim(), '→', navLink.getAttribute('href'));
    }
});