/**
 * Plantilla para la página de precios
 * @param {object} data - Datos para renderizar la plantilla
 * @returns {string} - HTML de la página de precios
 */
export default function pricingTemplate(data = {}) {
  const { 
    title = 'Planes y Precios - EdificioAdmin',
    description = 'Elige el plan perfecto para las necesidades de tu condominio',
    plans = [],
    faq = [],
    customPlan = {}
  } = data;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${description}">
  <title>${title}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
  <style>
    :root {
      --primary-color: #4a6de5;
      --secondary-color: #6c757d;
      --accent-color: #ff7b00;
      --light-color: #f8f9fa;
      --dark-color: #343a40;
      --success-color: #28a745;
      --danger-color: #dc3545;
      --primary-font: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    body {
      font-family: var(--primary-font);
      line-height: 1.6;
      color: #333;
    }
    .navbar-brand img {
      height: 40px;
    }
    .pricing-header {
      padding: 120px 0 60px;
      background-color: #f8f9fb;
      background-image: linear-gradient(135deg, rgba(74, 109, 229, 0.1) 0%, rgba(74, 109, 229, 0.05) 100%);
    }
    .btn-primary {
      background-color: var(--primary-color);
      border-color: var(--primary-color);
    }
    .btn-primary:hover {
      background-color: #3a5bd4;
      border-color: #3a5bd4;
    }
    .btn-outline-primary {
      color: var(--primary-color);
      border-color: var(--primary-color);
    }
    .btn-outline-primary:hover {
      background-color: var(--primary-color);
      color: white;
    }
    .pricing-card {
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
      height: 100%;
      transition: transform 0.3s ease;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .pricing-card.popular {
      border: 2px solid var(--primary-color);
      transform: scale(1.05);
    }
    .pricing-card.popular:hover {
      transform: scale(1.08);
    }
    .pricing-card:hover {
      transform: translateY(-5px);
    }
    .popular-badge {
      position: absolute;
      top: 0;
      right: 0;
      background-color: var(--primary-color);
      color: white;
      padding: 5px 15px;
      border-bottom-left-radius: 8px;
      font-weight: 500;
      font-size: 14px;
    }
    .price {
      font-size: 36px;
      font-weight: bold;
      color: var(--primary-color);
      margin: 15px 0;
    }
    .price-period {
      font-size: 16px;
      color: var(--secondary-color);
      font-weight: normal;
    }
    .feature-list {
      list-style: none;
      padding-left: 0;
      margin-bottom: 30px;
      flex-grow: 1;
    }
    .feature-list li {
      padding: 5px 0;
      position: relative;
      padding-left: 25px;
    }
    .feature-list li:before {
      content: "✓";
      color: var(--success-color);
      position: absolute;
      left: 0;
      font-weight: bold;
    }
    .feature-list li.disabled {
      color: var(--secondary-color);
      text-decoration: line-through;
    }
    .feature-list li.disabled:before {
      content: "✕";
      color: var(--danger-color);
    }
    .accordion-button:not(.collapsed) {
      background-color: rgba(74, 109, 229, 0.05);
      color: var(--primary-color);
    }
    .accordion-button:focus {
      box-shadow: 0 0 0 0.25rem rgba(74, 109, 229, 0.25);
    }
    .custom-plan-card {
      background-color: #f8f9fb;
      border: 2px dashed var(--primary-color);
      padding: 30px;
      border-radius: 12px;
      text-align: center;
    }
    .footer {
      background-color: var(--light-color);
      padding: 60px 0 30px;
    }
    .footer-links {
      list-style: none;
      padding-left: 0;
    }
    .footer-links li {
      margin-bottom: 10px;
    }
    .footer-links a {
      color: var(--secondary-color);
      text-decoration: none;
      transition: color 0.3s ease;
    }
    .footer-links a:hover {
      color: var(--primary-color);
    }
    .social-links a {
      display: inline-block;
      width: 36px;
      height: 36px;
      background-color: var(--light-color);
      border-radius: 50%;
      text-align: center;
      line-height: 36px;
      margin-right: 10px;
      color: var(--secondary-color);
      transition: all 0.3s ease;
    }
    .social-links a:hover {
      background-color: var(--primary-color);
      color: white;
    }
    .text-primary {
      color: var(--primary-color) !important;
    }
  </style>
</head>
<body>
  <!-- Navbar -->
  <nav class="navbar navbar-expand-lg navbar-light bg-white fixed-top shadow-sm">
    <div class="container">
      <a class="navbar-brand" href="/">
        <img src="/img/logo.svg" alt="EdificioAdmin Logo">
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <a class="nav-link" href="/#features">Funcionalidades</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/planes">Planes</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/nosotros">Nosotros</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/contacto">Contacto</a>
          </li>
          <li class="nav-item ms-3">
            <a href="/login.html" class="btn btn-outline-primary">Iniciar sesión</a>
          </li>
          <li class="nav-item ms-2">
            <a href="/registro" class="btn btn-primary">Registrarse</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <!-- Pricing Header -->
  <section class="pricing-header">
    <div class="container text-center">
      <h1 class="display-4 fw-bold mb-4">Planes y precios</h1>
      <p class="lead mb-0 mx-auto" style="max-width: 700px;">Elige el plan que mejor se adapte a las necesidades de tu condominio. Todos los planes incluyen acceso ilimitado a funcionalidades básicas y soporte al cliente.</p>
    </div>
  </section>

  <!-- Pricing Plans -->
  <section class="py-5">
    <div class="container">
      <div class="row g-4 justify-content-center">
        ${plans.map(plan => `
          <div class="col-md-6 col-lg-4">
            <div class="pricing-card bg-white h-100 ${plan.popular ? 'popular' : ''}">
              ${plan.popular ? '<span class="popular-badge">Más Popular</span>' : ''}
              <h3 class="mb-0">${plan.name}</h3>
              <div class="text-muted mb-3">${plan.unitsRange}</div>
              <div class="price">
                $${plan.price}<span class="price-period">/${plan.period}</span>
              </div>
              <ul class="feature-list">
                ${plan.features.map(feature => `
                  <li>${feature}</li>
                `).join('')}
                ${plan.limitations ? plan.limitations.map(limitation => `
                  <li class="disabled">${limitation}</li>
                `).join('') : ''}
              </ul>
              <a href="${plan.ctaLink}" class="btn ${plan.popular ? 'btn-primary' : 'btn-outline-primary'} w-100">${plan.ctaText}</a>
            </div>
          </div>
        `).join('')}
      </div>
      
      <!-- Custom Plan -->
      <div class="custom-plan-card mt-5">
        <h3 class="mb-3">${customPlan.title}</h3>
        <p class="mb-4">${customPlan.description}</p>
        <a href="${customPlan.ctaLink}" class="btn btn-primary btn-lg">${customPlan.ctaText}</a>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="py-5 bg-light">
    <div class="container">
      <h2 class="display-5 fw-bold text-center mb-5">Preguntas frecuentes</h2>
      
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="accordion" id="faqAccordion">
            ${faq.map((item, index) => `
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button class="accordion-button ${index !== 0 ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="${index === 0}" aria-controls="collapse${index}">
                    ${item.question}
                  </button>
                </h2>
                <div id="collapse${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" data-bs-parent="#faqAccordion">
                  <div class="accordion-body">
                    ${item.answer}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="py-5 text-center">
    <div class="container">
      <h2 class="display-5 fw-bold mb-4">¿Listo para comenzar?</h2>
      <p class="lead mb-4 mx-auto" style="max-width: 700px;">Únete a miles de administradores que están transformando la gestión de sus condominios con EdificioAdmin.</p>
      <a href="/registro" class="btn btn-primary btn-lg px-5 py-3 me-3">Comenzar ahora</a>
      <a href="/contacto" class="btn btn-outline-primary btn-lg px-5 py-3">Hablar con ventas</a>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <div class="row">
        <div class="col-lg-4 mb-4">
          <img src="/img/logo.svg" alt="EdificioAdmin Logo" class="mb-4" style="height: 40px;">
          <p>La plataforma integral para la administración eficiente de condominios y edificios.</p>
          <div class="social-links mt-3">
            <a href="#"><i class="fab fa-facebook-f"></i></a>
            <a href="#"><i class="fab fa-twitter"></i></a>
            <a href="#"><i class="fab fa-linkedin-in"></i></a>
            <a href="#"><i class="fab fa-instagram"></i></a>
          </div>
        </div>
        <div class="col-lg-2 col-md-4 mb-4">
          <h5 class="mb-4">Producto</h5>
          <ul class="footer-links">
            <li><a href="/#features">Funcionalidades</a></li>
            <li><a href="/planes">Planes</a></li>
            <li><a href="/registro">Registro</a></li>
            <li><a href="/login.html">Iniciar sesión</a></li>
          </ul>
        </div>
        <div class="col-lg-2 col-md-4 mb-4">
          <h5 class="mb-4">Recursos</h5>
          <ul class="footer-links">
            <li><a href="/blog">Blog</a></li>
            <li><a href="/ayuda">Centro de Ayuda</a></li>
            <li><a href="/tutoriales">Tutoriales</a></li>
            <li><a href="/api">API</a></li>
          </ul>
        </div>
        <div class="col-lg-2 col-md-4 mb-4">
          <h5 class="mb-4">Empresa</h5>
          <ul class="footer-links">
            <li><a href="/nosotros">Nosotros</a></li>
            <li><a href="/contacto">Contacto</a></li>
            <li><a href="/empleos">Empleos</a></li>
            <li><a href="/partners">Partners</a></li>
          </ul>
        </div>
        <div class="col-lg-2 mb-4">
          <h5 class="mb-4">Legal</h5>
          <ul class="footer-links">
            <li><a href="/terminos-condiciones">Términos de uso</a></li>
            <li><a href="/politica-privacidad">Política de privacidad</a></li>
            <li><a href="/cookies">Política de cookies</a></li>
            <li><a href="/seguridad">Seguridad</a></li>
          </ul>
        </div>
      </div>
      <hr>
      <div class="row align-items-center">
        <div class="col-md-6 text-md-start text-center mb-3 mb-md-0">
          <p class="mb-0">&copy; ${new Date().getFullYear()} EdificioAdmin. Todos los derechos reservados.</p>
        </div>
        <div class="col-md-6 text-md-end text-center">
          <p class="mb-0">Hecho con <i class="fas fa-heart text-danger"></i> en México</p>
        </div>
      </div>
    </div>
  </footer>

  <!-- Scripts -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
}