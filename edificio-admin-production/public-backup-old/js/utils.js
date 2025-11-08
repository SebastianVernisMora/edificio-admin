// Utility functions for the admin panel
const Utils = (() => {
  
  // API Configuration
  const API_BASE_URL = '/api';

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX');
  };

  // API Request helper
  const apiRequest = async (endpoint, method = 'GET', body = null) => {
    try {
      const token = Auth.getToken();
      
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-token': token
        }
      };
      
      if (body) {
        options.body = JSON.stringify(body);
      }
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Error en la solicitud');
      }
      
      return data;
    } catch (error) {
      console.error(`Error en solicitud a ${endpoint}:`, error);
      throw error;
    }
  };

  // Show modal
  const showModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'block';
      document.body.style.overflow = 'hidden';
    }
  };

  // Hide modal
  const hideModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  };

  // Show alert (improved)
  const showAlert = (message, type = 'info', duration = 3000) => {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert-notification');
    existingAlerts.forEach(alert => alert.remove());

    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert-notification alert-${type}`;
    alert.innerHTML = `
      <i class="fas fa-${getAlertIcon(type)}"></i>
      <span>${message}</span>
      <button class="alert-close">&times;</button>
    `;

    // Add styles
    alert.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      padding: 12px 16px;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      gap: 8px;
      max-width: 400px;
      animation: slideInRight 0.3s ease;
      background: ${getAlertColor(type)};
      color: white;
      font-size: 14px;
    `;

    // Add close functionality
    const closeBtn = alert.querySelector('.alert-close');
    closeBtn.addEventListener('click', () => alert.remove());

    // Add to document
    document.body.appendChild(alert);

    // Auto remove
    if (duration > 0) {
      setTimeout(() => {
        if (alert.parentNode) {
          alert.style.animation = 'slideOutRight 0.3s ease';
          setTimeout(() => alert.remove(), 300);
        }
      }, duration);
    }
  };

  // Get alert icon
  const getAlertIcon = (type) => {
    const icons = {
      success: 'check-circle',
      error: 'exclamation-triangle',
      warning: 'exclamation-circle',
      info: 'info-circle'
    };
    return icons[type] || 'info-circle';
  };

  // Get alert color
  const getAlertColor = (type) => {
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8'
    };
    return colors[type] || '#17a2b8';
  };

  // Setup modal close functionality
  const setupModalCloseButtons = () => {
    // Close buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('.modal .close, .modal .modal-cancel')) {
        const modal = e.target.closest('.modal');
        if (modal) {
          modal.style.display = 'none';
          document.body.style.overflow = 'auto';
        }
      }
    });
    
    // Close modal when clicking outside
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    });
  };

  // Loading state management
  const showLoading = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Cargando...</span>
        </div>
      `;
    }
  };

  const hideLoading = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      const spinner = element.querySelector('.loading-spinner');
      if (spinner) {
        spinner.remove();
      }
    }
  };

  // Role helper functions
  const getRoleName = (rol) => {
    const roles = {
      superadmin: 'Super Admin',
      admin: 'Administrador',
      inquilino: 'Inquilino'
    };
    return roles[rol] || rol;
  };

  const getRoleBadgeClass = (rol) => {
    const classes = {
      superadmin: 'badge-danger',
      admin: 'badge-primary',
      inquilino: 'badge-secondary'
    };
    return classes[rol] || 'badge-secondary';
  };

  // Initialize utility functions
  const init = () => {
    setupModalCloseButtons();
    
    // Add CSS animations
    if (!document.getElementById('utils-styles')) {
      const style = document.createElement('style');
      style.id = 'utils-styles';
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        .loading-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 20px;
          color: #666;
        }
        .alert-close {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          font-size: 16px;
          padding: 0;
          margin-left: auto;
        }
      `;
      document.head.appendChild(style);
    }
  };

  // Public API
  return {
    init,
    formatCurrency,
    formatDate,
    apiRequest,
    showModal,
    hideModal,
    showAlert,
    showLoading,
    hideLoading,
    getRoleName,
    getRoleBadgeClass
  };
})();

// Initialize utils when DOM is loaded
document.addEventListener('DOMContentLoaded', Utils.init);