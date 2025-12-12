/**
 * Plantilla para la página de términos y condiciones
 * @param {object} data - Datos para renderizar la plantilla
 * @returns {string} - HTML de la página de términos y condiciones
 */
export default function termsTemplate(data = {}) {
  const { 
    title = 'Términos y Condiciones - EdificioAdmin',
    description = 'Términos legales de uso de nuestra plataforma',
    lastUpdated = '1 de noviembre de 2023',
    sections = []
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
    .terms-header {
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
    .terms-content {
      max-width: 800px;
      margin: 0 auto;
      padding: 50px 20px;
    }
    .terms-section {
      margin-bottom: 40px;
    }
    .terms-section h2 {
      color: var(--primary-color);
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }
    .terms-toc {
      background-color: #f8f9fb;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 40px;
    }
    .terms-toc-list {
      list-style: none;
      padding-left: 0;
      margin-bottom: 0;
    }
    .terms-toc-list li {
      margin-bottom: 10px;
    }
    .terms-toc-list a {
      color: var(--primary-color);
      text-decoration: none;
    }
    .terms-toc-list a:hover {
      text-decoration: underline;
    }
    .last-updated {
      color: var(--secondary-color);
      font-style: italic;
      margin-bottom: 30px;
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
        <img src="/img/logo.png" alt="EdificioAdmin Logo">
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
            <a href="/login" class="btn btn-outline-primary">Iniciar sesión</a>
          </li>
          <li class="nav-item ms-2">
            <a href="/registro" class="btn btn-primary">Registrarse</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <!-- Header -->
  <header class="terms-header">
    <div class="container text-center">
      <h1 class="display-4 fw-bold mb-4">Términos y Condiciones</h1>
      <p class="lead mb-0">Última actualización: ${lastUpdated}</p>
    </div>
  </header>

  <!-- Content -->
  <div class="terms-content">
    <div class="terms-toc">
      <h4>Contenido</h4>
      <ul class="terms-toc-list">
        ${sections.map((section, index) => `
          <li>
            <a href="#section-${index+1}">${section.title}</a>
          </li>
        `).join('')}
      </ul>
    </div>

    <p class="last-updated">Estos términos fueron actualizados por última vez el ${lastUpdated}.</p>

    ${sections.map((section, index) => `
      <div id="section-${index+1}" class="terms-section">
        <h2>${section.title}</h2>
        <div>${section.content}</div>
      </div>
    `).join('')}

    <div class="mt-5 text-center">
      <p class="mb-4">Si tienes alguna pregunta sobre nuestros términos y condiciones, por favor contáctanos.</p>
      <a href="/contacto" class="btn btn-primary">Contactar</a>
    </div>
  </div>

  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <div class="row">
        <div class="col-lg-4 mb-4">
          <img src="/img/logo.png" alt="EdificioAdmin Logo" class="mb-4" style="height: 40px;">
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
            <li><a href="/login">Iniciar sesión</a></li>
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
            <li><a href="/terminos-condiciones" class="active">Términos de uso</a></li>
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