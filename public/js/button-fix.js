// Button Fix - Corrección específica para botones problemáticos
class ButtonFix {
  constructor() {
    this.init();
  }

  init() {
    console.log('🔧 Inicializando ButtonFix...');
    
    // Usar delegación de eventos en el documento para capturar todos los clics
    document.addEventListener('click', (e) => {
      this.handleGlobalClick(e);
    });

    // También configurar listeners específicos después de un delay para asegurar que el DOM esté listo
    setTimeout(() => {
      this.setupSpecificListeners();
    }, 1000);
  }

  handleGlobalClick(e) {
    const target = e.target;
    const buttonId = target.id;

    console.log('🖱️ Click detectado en:', buttonId, target);

    switch (buttonId) {
      case 'nuevo-pago-btn':
        e.preventDefault();
        this.handleNewPago();
        break;
      
      case 'cierre-mensual-btn':
        e.preventDefault();
        this.handleCierreMensual();
        break;
      
      case 'cierre-anual-btn':
        e.preventDefault();
        this.handleCierreAnual();
        break;
      
      case 'nuevo-anuncio-btn':
        e.preventDefault();
        this.handleNewAnuncio();
        break;
      
      case 'transferir-fondos-btn':
        e.preventDefault();
        this.handleTransferirFondos();
        break;
    }

    // Manejar botones de cancelar en modales
    if (target.classList.contains('modal-cancel') || target.textContent.includes('Cancelar')) {
      e.preventDefault();
      this.handleCancel(target);
    }

    // Manejar botones de cerrar modal (X)
    if (target.classList.contains('close') || target.innerHTML === '&times;') {
      e.preventDefault();
      this.handleCloseModal(target);
    }
  }

  setupSpecificListeners() {
    console.log('🔗 Configurando listeners específicos...');

    // Nuevo pago parcialidades
    const nuevoPagoBtn = document.getElementById('nuevo-pago-btn');
    if (nuevoPagoBtn) {
      nuevoPagoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleNewPago();
      });
      console.log('✅ nuevo-pago-btn conectado');
    }

    // Cierres
    const cierreMensualBtn = document.getElementById('cierre-mensual-btn');
    if (cierreMensualBtn) {
      cierreMensualBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleCierreMensual();
      });
      console.log('✅ cierre-mensual-btn conectado');
    }

    const cierreAnualBtn = document.getElementById('cierre-anual-btn');
    if (cierreAnualBtn) {
      cierreAnualBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleCierreAnual();
      });
      console.log('✅ cierre-anual-btn conectado');
    }

    // Anuncios
    const nuevoAnuncioBtn = document.getElementById('nuevo-anuncio-btn');
    if (nuevoAnuncioBtn) {
      nuevoAnuncioBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleNewAnuncio();
      });
      console.log('✅ nuevo-anuncio-btn conectado');
    }

    // Fondos
    const transferirFondosBtn = document.getElementById('transferir-fondos-btn');
    if (transferirFondosBtn) {
      transferirFondosBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleTransferirFondos();
      });
      console.log('✅ transferir-fondos-btn conectado');
    }
  }

  handleNewPago() {
    console.log('💰 Abriendo modal de nuevo pago...');
    this.showModal('parcialidad-modal');
  }

  handleCierreMensual() {
    console.log('📊 Generando cierre mensual...');
    this.showModal('cierre-mensual-modal');
  }

  handleCierreAnual() {
    console.log('📊 Generando cierre anual...');
    this.showModal('cierre-anual-modal');
  }

  handleNewAnuncio() {
    console.log('📢 Abriendo modal de nuevo anuncio...');
    this.showModal('anuncio-modal');
  }

  handleTransferirFondos() {
    console.log('💸 Abriendo modal de transferencia...');
    this.showModal('transferir-modal');
  }

  handleCancel(target) {
    console.log('❌ Botón cancelar presionado');
    const modal = target.closest('.modal');
    if (modal) {
      modal.style.display = 'none';
      console.log('✅ Modal cerrado:', modal.id);
    }
  }

  handleCloseModal(target) {
    console.log('❌ Botón cerrar modal presionado');
    const modal = target.closest('.modal');
    if (modal) {
      modal.style.display = 'none';
      console.log('✅ Modal cerrado:', modal.id);
    }
  }

  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'block';
      console.log('✅ Modal mostrado:', modalId);
      
      // Configurar botones de cerrar específicos del modal
      this.setupModalCloseButtons(modal);
    } else {
      console.error('❌ Modal no encontrado:', modalId);
      // Mostrar alerta como fallback
      alert(`Abriendo ${modalId.replace('-modal', '').replace('-', ' ')}...`);
    }
  }

  setupModalCloseButtons(modal) {
    // Botón X
    const closeBtn = modal.querySelector('.close');
    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.style.display = 'none';
      };
    }

    // Botones cancelar
    const cancelBtns = modal.querySelectorAll('.modal-cancel, .btn-secondary');
    cancelBtns.forEach(btn => {
      if (btn.textContent.includes('Cancelar')) {
        btn.onclick = (e) => {
          e.preventDefault();
          modal.style.display = 'none';
        };
      }
    });

    // Cerrar al hacer clic fuera del modal
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    };
  }
}

// Inicializar ButtonFix cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Esperar un poco para asegurar que todos los elementos estén cargados
  setTimeout(() => {
    window.buttonFix = new ButtonFix();
  }, 500);
});

// También inicializar si el script se carga después
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      if (!window.buttonFix) {
        window.buttonFix = new ButtonFix();
      }
    }, 500);
  });
} else {
  // DOM ya está listo
  setTimeout(() => {
    if (!window.buttonFix) {
      window.buttonFix = new ButtonFix();
    }
  }, 500);
}