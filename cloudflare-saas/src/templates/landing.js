/**
 * Plantilla para la landing page
 * @param {object} data - Datos para renderizar la plantilla
 * @returns {string} - HTML de la landing page
 */
export default function landingTemplate(data = {}) {
  const { 
    title = 'EdificioAdmin - Gestión de condominios simplificada',
    description = 'Sistema integral para la administración eficiente de edificios y condominios',
    pricingPlans = [],
    testimonials = [],
    features = [],
    steps = []
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
      --primary-font: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    body {
      font-family: var(--primary-font);
      line-height: 1.6;
      color: #333;
    }
    .hero-section {
      background-color: #f8f9fb;
      padding: 100px 0;
      background-image: linear-gradient(135deg, rgba(74, 109, 229, 0.1) 0%, rgba(74, 109, 229, 0.05) 100%);
    }
    .navbar-brand img {
      height: 40px;
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
    .feature-card {
      padding: 30px;
      border-radius: 12px;
      border: 2px solid #e0e4e8;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
      background: white;
      height: 100%;
      transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
    }
    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      border-color: var(--primary-color);
    }
    .feature-icon {
      width: 60px;
      height: 60px;
      background-color: rgba(74, 109, 229, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }
    .feature-icon i {
      font-size: 24px;
      color: var(--primary-color);
    }
    .pricing-card {
      padding: 30px;
      border-radius: 12px;
      border: 2px solid #e0e4e8;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
      background: white;
      height: 100%;
      transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    .pricing-card.popular {
      border: 3px solid var(--primary-color);
      transform: scale(1.05);
      box-shadow: 0 8px 25px rgba(74, 109, 229, 0.2);
    }
    .pricing-card.popular:hover {
      transform: scale(1.08);
      box-shadow: 0 12px 35px rgba(74, 109, 229, 0.25);
    }
    .pricing-card:hover {
      transform: translateY(-5px);
      border-color: var(--primary-color);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
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
    .testimonial-card {
      padding: 30px;
      border-radius: 12px;
      border: 2px solid #e0e4e8;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
      background: white;
      margin-bottom: 30px;
      position: relative;
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
    }
    .testimonial-card:hover {
      border-color: var(--primary-color);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
    }
    .testimonial-card:after {
      content: """;
      position: absolute;
      top: 10px;
      right: 20px;
      font-size: 60px;
      color: rgba(74, 109, 229, 0.1);
      font-family: serif;
    }
    .testimonial-img {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      object-fit: cover;
      margin-right: 15px;
    }
    .step-number {
      font-size: 42px;
      font-weight: bold;
      color: var(--primary-color);
      opacity: 0.3;
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
            <a class="nav-link" href="/#pricing">Planes</a>
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

  <!-- Hero Section -->
  <section class="hero-section">
    <div class="container">
      <div class="row align-items-center">
        <div class="col-lg-6">
          <h1 class="display-4 fw-bold mb-4">Administra tu condominio de forma simple y eficiente</h1>
          <p class="lead mb-4">EdificioAdmin simplifica la gestión de condominios y edificios con una plataforma integral que mejora la comunicación, transparencia y organización.</p>
          <div class="d-flex flex-wrap gap-2">
            <a href="/registro" class="btn btn-primary btn-lg">Comenzar gratis</a>
            <a href="#pricing" class="btn btn-outline-primary btn-lg">Ver planes</a>
          </div>
        </div>
        <div class="col-lg-6">
          <img src="/img/dashboard-preview.png" alt="EdificioAdmin Dashboard" class="img-fluid rounded-3 shadow-lg">
        </div>
      </div>
    </div>
  </section>

  <!-- Estadísticas -->
  <section class="py-5 bg-light">
    <div class="container">
      <div class="row text-center">
        <div class="col-md-3 mb-4 mb-md-0">
          <h2 class="display-4 fw-bold text-primary">500+</h2>
          <p class="text-muted">Edificios gestionados</p>
        </div>
        <div class="col-md-3 mb-4 mb-md-0">
          <h2 class="display-4 fw-bold text-primary">15,000+</h2>
          <p class="text-muted">Usuarios activos</p>
        </div>
        <div class="col-md-3 mb-4 mb-md-0">
          <h2 class="display-4 fw-bold text-primary">98%</h2>
          <p class="text-muted">Satisfacción de clientes</p>
        </div>
        <div class="col-md-3">
          <h2 class="display-4 fw-bold text-primary">40%</h2>
          <p class="text-muted">Ahorro de tiempo administrativo</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Funcionalidades -->
  <section id="features" class="py-5 py-lg-7">
    <div class="container">
      <div class="text-center mb-5">
        <h6 class="text-primary text-uppercase fw-bold">Funcionalidades</h6>
        <h2 class="display-5 fw-bold">Todo lo que necesitas para administrar tu condominio</h2>
        <p class="lead mx-auto" style="max-width: 700px;">Nuestra plataforma integral ofrece herramientas para simplificar todas las tareas administrativas y mejorar la experiencia de residentes.</p>
      </div>
      
      <div class="row g-4">
        ${features.map(feature => `
          <div class="col-md-6 col-lg-4">
            <div class="feature-card bg-white">
              <div class="feature-icon">
                <i class="fas ${feature.icon}"></i>
              </div>
              <h4 class="mb-3">${feature.title}</h4>
              <p class="text-muted mb-0">${feature.description}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- Cómo funciona -->
  <section class="py-5 py-lg-7 bg-light">
    <div class="container">
      <div class="text-center mb-5">
        <h6 class="text-primary text-uppercase fw-bold">Cómo funciona</h6>
        <h2 class="display-5 fw-bold">Empieza a administrar tu condominio en 4 simples pasos</h2>
      </div>
      
      <div class="row">
        ${steps.map(step => `
          <div class="col-md-3 mb-4 text-center">
            <div class="step-number">${step.number}</div>
            <h4 class="mt-3 mb-2">${step.title}</h4>
            <p class="text-muted">${step.description}</p>
          </div>
        `).join('')}
      </div>
      
      <div class="text-center mt-5">
        <a href="/registro" class="btn btn-primary btn-lg">Comenzar ahora</a>
      </div>
    </div>
  </section>

  <!-- Planes -->
  <section id="pricing" class="py-5 py-lg-7">
    <div class="container">
      <div class="text-center mb-5">
        <h6 class="text-primary text-uppercase fw-bold">Planes</h6>
        <h2 class="display-5 fw-bold">Planes diseñados para cada tipo de condominio</h2>
        <p class="lead mx-auto" style="max-width: 700px;">Selecciona el plan que mejor se adapte a tus necesidades. Todos incluyen acceso ilimitado a las funcionalidades principales.</p>
      </div>
      
      <div class="row g-4 justify-content-center">
        ${pricingPlans.map(plan => `
          <div class="col-md-6 col-lg-4">
            <div class="pricing-card bg-white h-100 ${plan.popular ? 'popular' : ''}">
              ${plan.popular ? '<span class="popular-badge">Más Popular</span>' : ''}
              <h3 class="mb-0">${plan.name}</h3>
              <div class="text-muted mb-3">${plan.units} unidades</div>
              <div class="price">
                $${plan.price}<span class="price-period">/mes</span>
              </div>
              <ul class="feature-list">
                ${plan.features.map(feature => `
                  <li>${feature}</li>
                `).join('')}
              </ul>
              <a href="/registro?plan=${plan.name.toLowerCase()}" class="btn ${plan.popular ? 'btn-primary' : 'btn-outline-primary'} w-100">${plan.cta}</a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- Testimonios -->
  <section class="py-5 py-lg-7 bg-light">
    <div class="container">
      <div class="text-center mb-5">
        <h6 class="text-primary text-uppercase fw-bold">Testimonios</h6>
        <h2 class="display-5 fw-bold">Lo que dicen nuestros clientes</h2>
      </div>
      
      <div class="row">
        ${testimonials.map(testimonial => `
          <div class="col-lg-4">
            <div class="testimonial-card bg-white">
              <div class="d-flex align-items-center mb-4">
                <img src="${testimonial.image}" alt="${testimonial.name}" class="testimonial-img">
                <div>
                  <h5 class="mb-0">${testimonial.name}</h5>
                  <p class="text-muted mb-0">${testimonial.role}</p>
                </div>
              </div>
              <p class="mb-0">"${testimonial.text}"</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="py-5 py-lg-7 text-center">
    <div class="container">
      <h2 class="display-5 fw-bold mb-4">Comienza a simplificar la administración de tu condominio hoy</h2>
      <p class="lead mb-4 mx-auto" style="max-width: 700px;">Únete a miles de administradores que están transformando la gestión de sus condominios con nuestra plataforma.</p>
      <a href="/registro" class="btn btn-primary btn-lg px-5 py-3 me-3">Registrarse gratis</a>
      <a href="/contacto" class="btn btn-outline-primary btn-lg px-5 py-3">Contactar ventas</a>
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
            <li><a href="/#pricing">Planes</a></li>
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