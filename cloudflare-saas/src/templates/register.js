/**
 * Plantilla para la página de registro
 * @param {object} data - Datos para renderizar la plantilla
 * @returns {string} - HTML de la página de registro
 */
export default function registerTemplate(data = {}) {
  const { 
    title = 'Registro - EdificioAdmin',
    description = 'Crea tu cuenta en EdificioAdmin para comenzar a administrar tu condominio',
    plans = [],
    defaultPlan = null
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
      background-color: #f8f9fb;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
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
    main {
      flex: 1;
      padding: 80px 0;
    }
    .register-container {
      max-width: 1000px;
      margin: 0 auto;
    }
    .register-card {
      background-color: white;
      border-radius: 12px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }
    .register-header {
      background-color: var(--primary-color);
      color: white;
      padding: 20px 30px;
    }
    .register-content {
      padding: 30px;
    }
    .register-form {
      max-width: 500px;
    }
    .steps {
      display: flex;
      margin-bottom: 30px;
    }
    .step {
      flex: 1;
      text-align: center;
      padding: 15px 10px;
      position: relative;
      font-weight: 500;
    }
    .step:not(:last-child):after {
      content: '';
      position: absolute;
      top: 50%;
      right: -10%;
      width: 20%;
      height: 2px;
      background-color: #dee2e6;
    }
    .step.active {
      color: var(--primary-color);
    }
    .step.active .step-number {
      background-color: var(--primary-color);
    }
    .step.completed .step-number {
      background-color: var(--success-color);
    }
    .step.completed:not(:last-child):after {
      background-color: var(--success-color);
    }
    .step-number {
      width: 32px;
      height: 32px;
      background-color: #dee2e6;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 10px;
      color: white;
    }
    .step.completed .step-number:before {
      content: "✓";
    }
    .form-step {
      display: none;
    }
    .form-step.active {
      display: block;
    }
    .plan-card {
      border: 2px solid #d0d5dd;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      background: white;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }
    .plan-card:hover {
      border-color: var(--primary-color);
      box-shadow: 0 4px 16px rgba(74, 109, 229, 0.2);
      transform: translateY(-2px);
    }
    .plan-card.selected {
      border-color: var(--primary-color);
      border-width: 3px;
      background-color: rgba(74, 109, 229, 0.05);
      box-shadow: 0 4px 16px rgba(74, 109, 229, 0.25);
    }
    .plan-card .radio-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .form-footer {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
    }
    .custom-plan-card {
      background-color: #f8f9fb;
      border: 2px dashed var(--primary-color);
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .custom-plan-card:hover {
      background-color: rgba(74, 109, 229, 0.05);
      border-width: 3px;
    }
    .custom-feature-check {
      border: 2px solid #e0e4e8;
      padding: 15px;
      border-radius: 8px;
      background: white;
      transition: all 0.3s ease;
    }
    .custom-feature-check:hover {
      border-color: var(--primary-color);
      box-shadow: 0 2px 8px rgba(74, 109, 229, 0.15);
    }
    .custom-feature-check input:checked ~ label {
      color: var(--primary-color);
      font-weight: 600;
    }
    .card {
      border: 2px solid #e0e4e8;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }
    .footer {
      background-color: var(--light-color);
      padding: 30px 0;
      margin-top: auto;
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
        </ul>
      </div>
    </div>
  </nav>

  <main>
    <div class="container register-container">
      <div class="register-card">
        <div class="register-header">
          <h1 class="h3 mb-0">Registro en EdificioAdmin</h1>
        </div>
        <div class="register-content">
          <!-- Steps -->
          <div class="steps">
            <div class="step active" data-step="1">
              <div class="step-number">1</div>
              <div class="step-label">Cuenta</div>
            </div>
            <div class="step" data-step="2">
              <div class="step-number">2</div>
              <div class="step-label">Plan</div>
            </div>
            <div class="step" data-step="3">
              <div class="step-number">3</div>
              <div class="step-label">Confirmar</div>
            </div>
            <div class="step" data-step="4">
              <div class="step-number">4</div>
              <div class="step-label">Pago</div>
            </div>
            <div class="step" data-step="5">
              <div class="step-number">5</div>
              <div class="step-label">Edificio</div>
            </div>
          </div>

          <!-- Registration Form -->
          <form id="registerForm">
            <!-- Step 1: Account Details -->
            <div id="step1" class="form-step active">
              <h3 class="mb-4">Información de tu cuenta</h3>
              <div class="mb-3">
                <label for="name" class="form-label">Nombre completo</label>
                <input type="text" class="form-control" id="name" name="name" required>
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">Correo electrónico</label>
                <input type="email" class="form-control" id="email" name="email" required>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Contraseña</label>
                <input type="password" class="form-control" id="password" name="password" required>
                <div class="form-text">La contraseña debe tener al menos 8 caracteres.</div>
              </div>
              <div class="mb-3">
                <label for="confirmPassword" class="form-label">Confirmar contraseña</label>
                <input type="password" class="form-control" id="confirmPassword" name="confirmPassword" required>
              </div>
              <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="termsCheck" required>
                <label class="form-check-label" for="termsCheck">
                  Acepto los <a href="/terminos-condiciones" target="_blank">Términos y Condiciones</a> y la <a href="/politica-privacidad" target="_blank">Política de Privacidad</a>
                </label>
              </div>
              <div class="form-footer">
                <div></div>
                <button type="button" class="btn btn-primary next-step" data-next="2">Siguiente</button>
              </div>
            </div>

            <!-- Step 2: Plan Selection -->
            <div id="step2" class="form-step">
              <h3 class="mb-4">Selecciona tu plan</h3>
              ${plans.map((plan, index) => `
                <div class="plan-card ${defaultPlan === plan.id ? 'selected' : ''}" data-plan="${plan.id}">
                  <div class="radio-container">
                    <div>
                      <input type="radio" name="plan" id="plan${index}" value="${plan.id}" ${defaultPlan === plan.id ? 'checked' : ''}>
                      <label for="plan${index}" class="ms-2 fw-bold">${plan.name}</label>
                    </div>
                    <div class="price">
                      <span class="fw-bold">$${plan.price}</span><span class="text-muted">/${plan.period}</span>
                    </div>
                  </div>
                  <div class="mt-2">
                    <p class="mb-1">${plan.description}</p>
                    <span class="badge bg-primary">${plan.units}</span>
                    <ul class="mt-2 mb-0">
                      ${plan.features.slice(0, 3).map(feature => `
                        <li>${feature}</li>
                      `).join('')}
                      ${plan.features.length > 3 ? `<li>Y ${plan.features.length - 3} más...</li>` : ''}
                    </ul>
                  </div>
                </div>
              `).join('')}

              <div class="custom-plan-card" data-plan="custom">
                <div class="radio-container">
                  <div>
                    <input type="radio" name="plan" id="planCustom" value="custom">
                    <label for="planCustom" class="ms-2 fw-bold">Plan personalizado</label>
                  </div>
                </div>
                <div class="mt-2">
                  <p class="mb-0">Configura un plan a la medida de tus necesidades específicas.</p>
                </div>
              </div>

              <div class="form-footer">
                <button type="button" class="btn btn-outline-primary prev-step" data-prev="1">Anterior</button>
                <button type="button" class="btn btn-primary next-step" data-next="3">Siguiente</button>
              </div>
            </div>

            <!-- Step 3: Confirmación y Personalización -->
            <div id="step3" class="form-step">
              <h3 class="mb-4">Confirma tu selección</h3>
              
              <!-- Resumen del plan estándar -->
              <div id="standardPlanSummary" style="display: none;">
                <div class="card mb-4">
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h5 class="mb-1" id="selectedPlanName">Plan Profesional</h5>
                        <p class="text-muted mb-0" id="selectedPlanUnits">Hasta 50 unidades</p>
                      </div>
                      <div class="text-end">
                        <h4 class="mb-0 text-primary">$<span id="selectedPlanPrice">999</span></h4>
                        <small class="text-muted">por mes</small>
                      </div>
                    </div>
                    
                    <hr>
                    
                    <h6 class="mb-3">Características incluidas:</h6>
                    <ul id="selectedPlanFeatures" class="list-unstyled">
                      <!-- Se llenará dinámicamente -->
                    </ul>
                    
                    <div class="alert alert-success mt-3">
                      <i class="fas fa-check-circle me-2"></i>
                      <strong>Prueba gratuita de 14 días</strong> - Sin compromiso, cancela cuando quieras
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Constructor de plan personalizado -->
              <div id="customPlanBuilder" style="display: none;">
                <div class="alert alert-info mb-4">
                  <i class="fas fa-info-circle me-2"></i>
                  Selecciona las características que necesitas para tu condominio
                </div>
                
                <div class="card mb-4">
                  <div class="card-header bg-primary text-white">
                    <h5 class="mb-0">Construye tu plan personalizado</h5>
                  </div>
                  <div class="card-body">
                    <!-- Número de unidades -->
                    <div class="mb-4">
                      <label for="customUnits" class="form-label fw-bold">¿Cuántas unidades/departamentos tiene tu edificio?</label>
                      <select class="form-select" id="customUnits" name="customUnits">
                        <option value="20">1-20 unidades ($499/mes)</option>
                        <option value="50">21-50 unidades ($999/mes)</option>
                        <option value="100">51-100 unidades ($1,499/mes)</option>
                        <option value="200">101-200 unidades ($1,999/mes)</option>
                        <option value="500">201-500 unidades ($2,999/mes)</option>
                        <option value="1000">Más de 500 unidades (Cotizar)</option>
                      </select>
                    </div>
                    
                    <hr>
                    
                    <!-- Características opcionales -->
                    <h6 class="mb-3">Características adicionales:</h6>
                    
                    <div class="row">
                      <div class="col-md-6 mb-3">
                        <div class="form-check custom-feature-check">
                          <input class="form-check-input" type="checkbox" id="feat_notifications" value="notifications" data-price="199">
                          <label class="form-check-label" for="feat_notifications">
                            <strong>Notificaciones por Email</strong>
                            <small class="d-block text-muted">Envía avisos automáticos a residentes</small>
                            <span class="badge bg-primary">+$199/mes</span>
                          </label>
                        </div>
                      </div>
                      
                      <div class="col-md-6 mb-3">
                        <div class="form-check custom-feature-check">
                          <input class="form-check-input" type="checkbox" id="feat_reports" value="reports" data-price="149">
                          <label class="form-check-label" for="feat_reports">
                            <strong>Reportes Avanzados</strong>
                            <small class="d-block text-muted">Análisis financiero y estadísticas</small>
                            <span class="badge bg-primary">+$149/mes</span>
                          </label>
                        </div>
                      </div>
                      
                      <div class="col-md-6 mb-3">
                        <div class="form-check custom-feature-check">
                          <input class="form-check-input" type="checkbox" id="feat_multibuilding" value="multibuilding" data-price="499">
                          <label class="form-check-label" for="feat_multibuilding">
                            <strong>Múltiples Edificios</strong>
                            <small class="d-block text-muted">Administra varios condominios</small>
                            <span class="badge bg-primary">+$499/mes</span>
                          </label>
                        </div>
                      </div>
                      
                      <div class="col-md-6 mb-3">
                        <div class="form-check custom-feature-check">
                          <input class="form-check-input" type="checkbox" id="feat_api" value="api" data-price="299">
                          <label class="form-check-label" for="feat_api">
                            <strong>Acceso API</strong>
                            <small class="d-block text-muted">Integra con otros sistemas</small>
                            <span class="badge bg-primary">+$299/mes</span>
                          </label>
                        </div>
                      </div>
                      
                      <div class="col-md-6 mb-3">
                        <div class="form-check custom-feature-check">
                          <input class="form-check-input" type="checkbox" id="feat_priority" value="priority" data-price="399">
                          <label class="form-check-label" for="feat_priority">
                            <strong>Soporte Prioritario</strong>
                            <small class="d-block text-muted">Atención telefónica 24/7</small>
                            <span class="badge bg-primary">+$399/mes</span>
                          </label>
                        </div>
                      </div>
                      
                      <div class="col-md-6 mb-3">
                        <div class="form-check custom-feature-check">
                          <input class="form-check-input" type="checkbox" id="feat_documents" value="documents" data-price="199">
                          <label class="form-check-label" for="feat_documents">
                            <strong>Gestor Documental</strong>
                            <small class="d-block text-muted">Almacena y comparte documentos</small>
                            <span class="badge bg-primary">+$199/mes</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <hr>
                    
                    <!-- Resumen de precio personalizado -->
                    <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                      <div>
                        <h6 class="mb-0">Total mensual:</h6>
                        <small class="text-muted">Precio base + características adicionales</small>
                      </div>
                      <h3 class="mb-0 text-primary">$<span id="customPlanTotal">499</span>/mes</h3>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="form-footer">
                <button type="button" class="btn btn-outline-primary prev-step" data-prev="2">Anterior</button>
                <button type="button" class="btn btn-primary next-step" data-next="4">Continuar al pago</button>
              </div>
            </div>

            <!-- Step 4: Payment Information -->
            <div id="step4" class="form-step">
              <h3 class="mb-4">Información de pago</h3>
              <div class="alert alert-info">
                <div class="d-flex align-items-center">
                  <i class="fas fa-info-circle me-3 fs-4"></i>
                  <div>Esta es una demostración. No se realizará ningún cargo real.</div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Método de pago</label>
                <div class="form-check mb-2">
                  <input class="form-check-input" type="radio" name="paymentMethod" id="creditCard" value="card" checked>
                  <label class="form-check-label" for="creditCard">
                    <i class="far fa-credit-card me-2"></i>Tarjeta de crédito/débito
                  </label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="paymentMethod" id="paypal" value="paypal">
                  <label class="form-check-label" for="paypal">
                    <i class="fab fa-paypal me-2"></i>PayPal
                  </label>
                </div>
              </div>

              <div id="cardDetails">
                <div class="mb-3">
                  <label for="cardName" class="form-label">Nombre en la tarjeta</label>
                  <input type="text" class="form-control" id="cardName" name="cardName">
                </div>
                <div class="mb-3">
                  <label for="cardNumber" class="form-label">Número de tarjeta</label>
                  <input type="text" class="form-control" id="cardNumber" name="cardNumber" placeholder="XXXX XXXX XXXX XXXX">
                </div>
                <div class="row mb-3">
                  <div class="col-md-6">
                    <label for="expiry" class="form-label">Fecha de expiración</label>
                    <input type="text" class="form-control" id="expiry" name="expiry" placeholder="MM/YY">
                  </div>
                  <div class="col-md-6">
                    <label for="cvv" class="form-label">CVV</label>
                    <input type="text" class="form-control" id="cvv" name="cvv" placeholder="123">
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label for="billingAddress" class="form-label">Dirección de facturación</label>
                <input type="text" class="form-control" id="billingAddress" name="billingAddress">
              </div>

              <div class="form-footer">
                <button type="button" class="btn btn-outline-primary prev-step" data-prev="3">Anterior</button>
                <button type="button" class="btn btn-primary next-step" data-next="5">Procesar pago</button>
              </div>
            </div>

            <!-- Step 5: Building Information -->
            <div id="step5" class="form-step">
              <h3 class="mb-4">Información del edificio</h3>
              <div class="alert alert-success mb-4">
                <div class="d-flex align-items-center">
                  <i class="fas fa-check-circle me-3 fs-4"></i>
                  <div>
                    <strong>¡Pago procesado correctamente!</strong><br>
                    Ahora configura la información de tu edificio o condominio.
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label for="buildingName" class="form-label">Nombre del edificio/condominio</label>
                <input type="text" class="form-control" id="buildingName" name="buildingName" required>
              </div>
              <div class="mb-3">
                <label for="buildingAddress" class="form-label">Dirección</label>
                <input type="text" class="form-control" id="buildingAddress" name="buildingAddress" required>
              </div>
              <div class="mb-3">
                <label for="units" class="form-label">Número de unidades/departamentos</label>
                <input type="number" class="form-control" id="units" name="units" required min="1">
              </div>
              <div class="mb-3">
                <label for="adminName" class="form-label">Nombre del administrador</label>
                <input type="text" class="form-control" id="adminName" name="adminName">
              </div>
              <div class="mb-3">
                <label for="adminEmail" class="form-label">Email del administrador</label>
                <input type="email" class="form-control" id="adminEmail" name="adminEmail">
                <div class="form-text">Dejar en blanco si eres el administrador.</div>
              </div>

              <div class="form-footer">
                <button type="button" class="btn btn-outline-primary prev-step" data-prev="4">Anterior</button>
                <button type="submit" class="btn btn-success">Completar registro</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="footer">
    <div class="container text-center">
      <p class="mb-0">&copy; ${new Date().getFullYear()} EdificioAdmin. Todos los derechos reservados.</p>
      <div class="mt-2">
        <a href="/terminos-condiciones" class="text-secondary me-3">Términos de uso</a>
        <a href="/politica-privacidad" class="text-secondary me-3">Política de privacidad</a>
        <a href="/contacto" class="text-secondary">Contacto</a>
      </div>
    </div>
  </footer>

  <!-- Scripts -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Handle steps navigation
      const steps = document.querySelectorAll('.step');
      const formSteps = document.querySelectorAll('.form-step');
      const nextButtons = document.querySelectorAll('.next-step');
      const prevButtons = document.querySelectorAll('.prev-step');
      const planCards = document.querySelectorAll('.plan-card, .custom-plan-card');
      
      // Next step buttons
      nextButtons.forEach(button => {
        button.addEventListener('click', function() {
          const nextStep = this.getAttribute('data-next');
          
          // Simple validation
          let canProceed = true;
          
          // Validate step 1
          if (nextStep === '2') {
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const termsCheck = document.getElementById('termsCheck').checked;
            
            if (!name || !email || !password || !confirmPassword || !termsCheck) {
              canProceed = false;
              alert('Por favor completa todos los campos requeridos.');
            } else if (password !== confirmPassword) {
              canProceed = false;
              alert('Las contraseñas no coinciden.');
            } else if (password.length < 8) {
              canProceed = false;
              alert('La contraseña debe tener al menos 8 caracteres.');
            }
          }
          
          // Validate step 2
          if (nextStep === '3') {
            const selectedPlan = document.querySelector('input[name="plan"]:checked');
            if (!selectedPlan) {
              canProceed = false;
              alert('Por favor selecciona un plan.');
            }
          }
          
          // Validate step 3
          if (nextStep === '4') {
            const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
            
            if (paymentMethod === 'card') {
              const cardName = document.getElementById('cardName').value;
              const cardNumber = document.getElementById('cardNumber').value;
              const expiry = document.getElementById('expiry').value;
              const cvv = document.getElementById('cvv').value;
              
              if (!cardName || !cardNumber || !expiry || !cvv) {
                canProceed = false;
                alert('Por favor completa los detalles de la tarjeta.');
              }
            }
          }
          
          if (canProceed) {
            // Update active step
            steps.forEach(step => {
              if (parseInt(step.getAttribute('data-step')) < parseInt(nextStep)) {
                step.classList.add('completed');
              } else {
                step.classList.remove('completed');
              }
              
              if (parseInt(step.getAttribute('data-step')) === parseInt(nextStep)) {
                step.classList.add('active');
              } else {
                step.classList.remove('active');
              }
            });
            
            // Show active form step
            formSteps.forEach(formStep => {
              formStep.classList.remove('active');
            });
            document.getElementById('step' + nextStep).classList.add('active');
          }
        });
      });
      
      // Previous step buttons
      prevButtons.forEach(button => {
        button.addEventListener('click', function() {
          const prevStep = this.getAttribute('data-prev');
          
          // Update active step
          steps.forEach(step => {
            if (parseInt(step.getAttribute('data-step')) === parseInt(prevStep)) {
              step.classList.add('active');
            } else {
              step.classList.remove('active');
            }
            
            if (parseInt(step.getAttribute('data-step')) > parseInt(prevStep)) {
              step.classList.remove('completed');
            }
          });
          
          // Show active form step
          formSteps.forEach(formStep => {
            formStep.classList.remove('active');
          });
          document.getElementById('step' + prevStep).classList.add('active');
        });
      });
      
      // Plan selection
      planCards.forEach(card => {
        card.addEventListener('click', function() {
          const planId = this.getAttribute('data-plan');
          const radioInput = document.querySelector('input[value="' + planId + '"]');
          
          // Clear previous selection
          planCards.forEach(c => c.classList.remove('selected'));
          
          // Set new selection
          this.classList.add('selected');
          radioInput.checked = true;
        });
      });
      
      // Payment method toggle
      document.querySelectorAll('input[name="paymentMethod"]').forEach(input => {
        input.addEventListener('change', function() {
          const cardDetails = document.getElementById('cardDetails');
          if (this.value === 'card') {
            cardDetails.style.display = 'block';
          } else {
            cardDetails.style.display = 'none';
          }
        });
      });
      
      // Form submission
      document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // In a real application, this would send data to the server
        // For this demo, we'll just show a success message
        alert('¡Registro completado exitosamente! Redirigiendo al dashboard...');
        
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      });
      
      // Plan selection handling - mostrar resumen en step 3
      const planRadios = document.querySelectorAll('input[name="plan"]');
      const standardPlanSummary = document.getElementById('standardPlanSummary');
      const customPlanBuilder = document.getElementById('customPlanBuilder');
      
      planRadios.forEach(radio => {
        radio.addEventListener('change', function() {
          const selectedPlan = this.value;
          
          if (selectedPlan === 'custom') {
            // Mostrar constructor de plan personalizado
            standardPlanSummary.style.display = 'none';
            customPlanBuilder.style.display = 'block';
          } else {
            // Mostrar resumen del plan estándar
            standardPlanSummary.style.display = 'block';
            customPlanBuilder.style.display = 'none';
            
            // Llenar datos del plan seleccionado
            const planData = ${JSON.stringify(plans || [])};
            const plan = planData.find(p => p.id === selectedPlan);
            
            if (plan) {
              document.getElementById('selectedPlanName').textContent = plan.name;
              document.getElementById('selectedPlanUnits').textContent = plan.units;
              document.getElementById('selectedPlanPrice').textContent = plan.price;
              
              const featuresList = document.getElementById('selectedPlanFeatures');
              featuresList.innerHTML = plan.features.map(f => 
                '<li><i class="fas fa-check-circle text-success me-2"></i>' + f + '</li>'
              ).join('');
            }
          }
        });
      });
      
      // Calculadora de plan personalizado
      const customUnitsSelect = document.getElementById('customUnits');
      const featureCheckboxes = document.querySelectorAll('.custom-feature-check input[type="checkbox"]');
      const customPlanTotalSpan = document.getElementById('customPlanTotal');
      
      function calculateCustomPlan() {
        let basePrice = parseInt(customUnitsSelect.value);
        let total = basePrice;
        
        featureCheckboxes.forEach(checkbox => {
          if (checkbox.checked) {
            total += parseInt(checkbox.getAttribute('data-price'));
          }
        });
        
        customPlanTotalSpan.textContent = total.toLocaleString();
      }
      
      if (customUnitsSelect) {
        customUnitsSelect.addEventListener('change', calculateCustomPlan);
      }
      
      featureCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', calculateCustomPlan);
      });
      
      // Inicializar con el plan por defecto si existe
      const defaultPlan = '${defaultPlan || ''}';
      if (defaultPlan && defaultPlan !== 'custom') {
        const defaultRadio = document.querySelector('input[value="' + defaultPlan + '"]');
        if (defaultRadio) {
          defaultRadio.checked = true;
          defaultRadio.dispatchEvent(new Event('change'));
        }
      }
    });
  </script>
</body>
</html>`;
}