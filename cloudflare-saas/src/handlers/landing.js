/**
 * Landing page handlers
 */

import { addCorsHeaders } from '../middleware/cors';
import landingTemplate from '../templates/landing.js';
import registerTemplate from '../templates/register.js';
import pricingTemplate from '../templates/pricing.js';
import termsTemplate from '../templates/terms.js';
import privacyTemplate from '../templates/privacy.js';

// Helper para renderizar HTML desde plantillas
const renderHtml = (template, data = {}) => {
  try {
    return new Response(template(data), {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
      },
    });
  } catch (error) {
    console.error(`Error rendering template:`, error);
    return new Response(`Error rendering template: ${error.message}`, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
      },
    });
  }
};

// Página de inicio (landing page)
export async function home(request, env) {
  try {
    const pricingPlans = [
      {
        name: 'Básico',
        price: 499,
        units: 'hasta 20',
        features: [
          'Gestión de cuotas',
          'Registro de gastos',
          'Comunicados',
          'Acceso para residentes'
        ],
        popular: false,
        cta: 'Comenzar ahora'
      },
      {
        name: 'Profesional',
        price: 999,
        units: 'hasta 50',
        features: [
          'Todo en Plan Básico',
          'Gestión de presupuestos',
          'Notificaciones por email',
          'Reportes mensuales',
          'Roles personalizados'
        ],
        popular: true,
        cta: 'Prueba 14 días gratis'
      },
      {
        name: 'Empresarial',
        price: 1999,
        units: '50+',
        features: [
          'Todo en Plan Profesional',
          'Múltiples condominios',
          'Dashboard personalizado',
          'API para integraciones',
          'Soporte prioritario'
        ],
        popular: false,
        cta: 'Contactar ventas'
      }
    ];

    const testimonials = [
      {
        name: 'Carlos Ramírez',
        role: 'Administrador de Torre Esmeralda',
        image: '/img/testimonial-1.jpg',
        text: 'Desde que implementamos EdificioAdmin, hemos reducido en un 40% el tiempo dedicado a gestiones administrativas y los residentes están mucho más satisfechos.'
      },
      {
        name: 'Ana García',
        role: 'Tesorera de Condominio Las Palmas',
        image: '/img/testimonial-2.jpg',
        text: 'La transparencia en las finanzas ha mejorado notablemente. Ahora los residentes pueden ver exactamente cómo se utilizan sus cuotas de mantenimiento.'
      },
      {
        name: 'Miguel Sánchez',
        role: 'Presidente de Junta de Propietarios',
        image: '/img/testimonial-3.jpg',
        text: 'La gestión de cuotas y la comunicación con los residentes nunca había sido tan eficiente. Recomiendo EdificioAdmin sin dudarlo.'
      }
    ];

    const landingData = {
      title: 'EdificioAdmin - Gestión de condominios simplificada',
      description: 'Sistema integral para la administración eficiente de edificios y condominios',
      pricingPlans,
      testimonials,
      features: [
        {
          icon: 'fa-money-bill-wave',
          title: 'Gestión financiera',
          description: 'Administra cuotas, gastos, fondos y presupuestos con total transparencia.'
        },
        {
          icon: 'fa-users',
          title: 'Control de acceso',
          description: 'Diferentes niveles de acceso para administradores, comité y residentes.'
        },
        {
          icon: 'fa-bell',
          title: 'Notificaciones',
          description: 'Sistema integrado de avisos y notificaciones por email para mantener informados a todos.'
        },
        {
          icon: 'fa-chart-line',
          title: 'Reportes detallados',
          description: 'Informes financieros y administrativos para la toma de decisiones.'
        },
        {
          icon: 'fa-mobile-alt',
          title: 'Acceso móvil',
          description: 'Interfaz responsive para gestionar desde cualquier dispositivo.'
        },
        {
          icon: 'fa-shield-alt',
          title: 'Datos seguros',
          description: 'Seguridad avanzada para proteger la información de tu condominio.'
        }
      ],
      steps: [
        {
          number: '01',
          title: 'Regístrate',
          description: 'Crea tu cuenta en menos de 2 minutos.'
        },
        {
          number: '02',
          title: 'Configura',
          description: 'Ingresa los datos de tu edificio o condominio.'
        },
        {
          number: '03',
          title: 'Invita',
          description: 'Agrega administradores y residentes al sistema.'
        },
        {
          number: '04',
          title: 'Gestiona',
          description: 'Comienza a administrar tu condominio eficientemente.'
        }
      ]
    };

    return renderHtml(landingTemplate, landingData);
  } catch (error) {
    console.error('Error en página de inicio:', error);
    return new Response('Error interno del servidor', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Página de precios/planes
export async function pricing(request, env) {
  try {
    const pricingData = {
      title: 'Planes y Precios - EdificioAdmin',
      description: 'Elige el plan perfecto para las necesidades de tu condominio',
      plans: [
        {
          name: 'Básico',
          price: 499,
          period: 'mensual',
          unitsRange: '1-20 unidades',
          features: [
            'Gestión básica de cuotas',
            'Registro de gastos',
            'Panel para residentes',
            'Comunicados',
            'Respaldo automático',
            'Soporte por email'
          ],
          limitations: [
            'Sin notificaciones por email',
            'Sin reportes avanzados',
            'Sin roles personalizados'
          ],
          ctaText: 'Comenzar ahora',
          ctaLink: '/registro?plan=basico',
          popular: false
        },
        {
          name: 'Profesional',
          price: 999,
          period: 'mensual',
          unitsRange: '21-50 unidades',
          features: [
            'Todo lo del Plan Básico',
            'Notificaciones por email',
            'Gestión de presupuestos',
            'Reportes financieros',
            'Roles personalizables',
            'Fondos de reserva',
            'Soporte prioritario'
          ],
          limitations: [],
          ctaText: 'Prueba 14 días gratis',
          ctaLink: '/registro?plan=profesional',
          popular: true
        },
        {
          name: 'Empresarial',
          price: 1999,
          period: 'mensual',
          unitsRange: 'Más de 50 unidades',
          features: [
            'Todo lo del Plan Profesional',
            'Múltiples condominios',
            'Dashboard personalizado',
            'Exportación de datos',
            'API para integraciones',
            'Capacitación para administradores',
            'Soporte telefónico',
            'Gestor de documentos'
          ],
          limitations: [],
          ctaText: 'Contactar ventas',
          ctaLink: '/contacto?plan=empresarial',
          popular: false
        }
      ],
      faq: [
        {
          question: '¿Puedo cambiar de plan después?',
          answer: 'Sí, puedes actualizar o downgrade tu plan en cualquier momento. Los cambios se reflejarán en tu próximo ciclo de facturación.'
        },
        {
          question: '¿Cómo se cuentan las unidades?',
          answer: 'Las unidades son departamentos, casas o locales dentro del condominio. Cada unidad puede tener su propia cuenta de residente.'
        },
        {
          question: '¿Hay contrato de permanencia?',
          answer: 'No, nuestros planes son mensuales y puedes cancelar en cualquier momento sin penalizaciones.'
        },
        {
          question: '¿Ofrecen planes anuales con descuento?',
          answer: 'Sí, al pagar anualmente obtienes un 15% de descuento sobre el precio mensual.'
        },
        {
          question: '¿Puedo tener una demo personalizada?',
          answer: 'Por supuesto, agenda una demostración con nuestro equipo y te mostraremos cómo EdificioAdmin puede adaptarse a tus necesidades.'
        }
      ],
      customPlan: {
        title: '¿Necesitas un plan personalizado?',
        description: 'Si ninguno de nuestros planes se ajusta a tus necesidades, podemos crear un plan a medida para tu condominio.',
        ctaText: 'Contactar para plan personalizado',
        ctaLink: '/contacto?asunto=plan-personalizado'
      }
    };

    return renderHtml(pricingTemplate, pricingData);
  } catch (error) {
    console.error('Error en página de precios:', error);
    return new Response('Error interno del servidor', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Página Acerca de nosotros
export async function about(request, env) {
  try {
    const aboutData = {
      title: 'Acerca de EdificioAdmin',
      description: 'Conoce más sobre nuestra misión y equipo',
      mission: 'Simplificar la administración de condominios a través de tecnología intuitiva y accesible para todos.',
      vision: 'Transformar la gestión de condominios con herramientas que promuevan la transparencia, eficiencia y comunicación efectiva.',
      team: [
        {
          name: 'Roberto Méndez',
          position: 'CEO & Fundador',
          bio: 'Con más de 15 años de experiencia en administración de propiedades, Roberto fundó EdificioAdmin para resolver los problemas que él mismo enfrentaba como administrador.',
          image: '/img/team-1.jpg'
        },
        {
          name: 'Laura Guzmán',
          position: 'CTO',
          bio: 'Ingeniera de software con especialidad en desarrollo web y aplicaciones móviles. Lidera el equipo técnico para crear soluciones robustas y escalables.',
          image: '/img/team-2.jpg'
        },
        {
          name: 'Daniel Rojas',
          position: 'Director de Operaciones',
          bio: 'Experto en procesos administrativos de condominios. Asegura que nuestras soluciones se alineen con las necesidades reales de administradores y residentes.',
          image: '/img/team-3.jpg'
        }
      ],
      history: 'EdificioAdmin nació en 2020 cuando un grupo de administradores de condominios, frustrados con las soluciones existentes, decidió crear un sistema que realmente facilitara su trabajo diario. Desde entonces, hemos crecido para servir a cientos de edificios y condominios en toda Latinoamérica.',
      values: [
        {
          title: 'Transparencia',
          description: 'Creemos que la gestión transparente de los recursos comunitarios construye confianza.'
        },
        {
          title: 'Simplicidad',
          description: 'Nos esforzamos por hacer que tareas complejas sean simples a través de un diseño intuitivo.'
        },
        {
          title: 'Comunidad',
          description: 'Fomentamos el sentido de comunidad y cooperación entre residentes y administradores.'
        },
        {
          title: 'Innovación',
          description: 'Constantemente buscamos mejorar nuestros servicios a través de nuevas tecnologías.'
        }
      ]
    };

    return renderHtml(landingTemplate, aboutData);
  } catch (error) {
    console.error('Error en página acerca de nosotros:', error);
    return new Response('Error interno del servidor', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Página de contacto
export async function contact(request, env) {
  try {
    const contactData = {
      title: 'Contacto - EdificioAdmin',
      description: 'Estamos aquí para ayudarte con cualquier consulta sobre nuestro servicio',
      email: 'contacto@edificioadmin.com',
      phone: '+52 (55) 1234-5678',
      address: 'Av. Reforma 222, Col. Juárez, CDMX, México',
      mapUrl: 'https://maps.google.com/?q=Av.+Reforma+222,+Col.+Juárez,+CDMX,+México',
      socialMedia: {
        facebook: 'https://facebook.com/edificioadmin',
        twitter: 'https://twitter.com/edificioadmin',
        instagram: 'https://instagram.com/edificioadmin',
        linkedin: 'https://linkedin.com/company/edificioadmin'
      },
      contactReasons: [
        {
          value: 'sales',
          label: 'Información sobre planes y precios'
        },
        {
          value: 'demo',
          label: 'Solicitar una demostración'
        },
        {
          value: 'support',
          label: 'Soporte técnico'
        },
        {
          value: 'feature',
          label: 'Sugerir una funcionalidad'
        },
        {
          value: 'partnership',
          label: 'Asociaciones y alianzas'
        },
        {
          value: 'other',
          label: 'Otro'
        }
      ],
      faqs: [
        {
          question: '¿Cuánto tiempo toma implementar el sistema?',
          answer: 'El proceso de implementación básica toma de 1 a 2 días. Para configuraciones más complejas puede tomar hasta una semana.'
        },
        {
          question: '¿Ofrecen capacitación para administradores?',
          answer: 'Sí, todos nuestros planes incluyen capacitación básica para administradores. Los planes Profesional y Empresarial incluyen sesiones adicionales para comités y usuarios avanzados.'
        },
        {
          question: '¿Cómo migro desde mi sistema actual?',
          answer: 'Ofrecemos asistencia para migrar datos desde otros sistemas o formatos. Nuestro equipo te guiará en el proceso de importación de residentes, historial de pagos y otra información relevante.'
        }
      ]
    };

    // Si es una solicitud POST, procesar el formulario de contacto
    if (request.method === 'POST') {
      try {
        const formData = await request.formData();
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');
        
        // Aquí procesaríamos el envío del formulario
        // Por ahora solo simularemos una respuesta exitosa
        
        return Response.redirect(`${new URL(request.url).origin}/contacto?success=true`, 302);
      } catch (error) {
        console.error('Error procesando formulario de contacto:', error);
        return Response.redirect(`${new URL(request.url).origin}/contacto?error=true`, 302);
      }
    }
    
    // Para solicitudes GET, mostrar la página de contacto
    return renderHtml(landingTemplate, contactData);
  } catch (error) {
    console.error('Error en página de contacto:', error);
    return new Response('Error interno del servidor', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Página de términos y condiciones
export async function terms(request, env) {
  try {
    const termsData = {
      title: 'Términos y Condiciones - EdificioAdmin',
      description: 'Términos legales de uso de nuestra plataforma',
      lastUpdated: '1 de noviembre de 2023',
      sections: [
        {
          title: '1. Aceptación de los Términos',
          content: `
            <p>Al acceder y utilizar los servicios de EdificioAdmin, usted acepta estar legalmente vinculado por estos Términos y Condiciones. Si no está de acuerdo con alguno de estos términos, no debe utilizar nuestros servicios.</p>
            <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en la plataforma. El uso continuado de nuestros servicios después de cualquier cambio constituye su aceptación de los nuevos términos.</p>
          `
        },
        {
          title: '2. Descripción del Servicio',
          content: `
            <p>EdificioAdmin proporciona una plataforma de gestión de condominios que permite a administradores y residentes gestionar diversos aspectos de la administración de propiedades, incluyendo pero no limitado a: gestión de cuotas, registro de gastos, comunicaciones, y administración de usuarios.</p>
            <p>Ofrecemos diferentes planes de suscripción con distintas funcionalidades. Las características específicas de cada plan están detalladas en nuestra sección de Planes y Precios.</p>
          `
        },
        {
          title: '3. Cuentas de Usuario',
          content: `
            <p>Para utilizar nuestros servicios, debe crear una cuenta proporcionando información precisa y completa. Usted es responsable de mantener la confidencialidad de su contraseña y de todas las actividades que ocurran bajo su cuenta.</p>
            <p>Nos reservamos el derecho de suspender o terminar cuentas que violen estos términos o que permanezcan inactivas por un período prolongado.</p>
          `
        },
        {
          title: '4. Política de Pagos y Reembolsos',
          content: `
            <p>Las suscripciones se cobran por adelantado según el ciclo de facturación elegido (mensual o anual). Los pagos no son reembolsables, excepto en circunstancias específicas detalladas en nuestra Política de Reembolsos.</p>
            <p>Nos reservamos el derecho de cambiar nuestros precios con un aviso previo de 30 días. Los cambios de precio no afectarán los ciclos de facturación en curso.</p>
          `
        },
        {
          title: '5. Propiedad Intelectual',
          content: `
            <p>Todo el contenido y software proporcionado a través de EdificioAdmin está protegido por derechos de autor, marcas registradas y otras leyes de propiedad intelectual. No puede copiar, modificar, distribuir, vender o arrendar ninguna parte de nuestros servicios sin nuestro permiso explícito.</p>
          `
        },
        {
          title: '6. Privacidad de Datos',
          content: `
            <p>Nuestra recopilación y uso de información personal está regida por nuestra <a href="/politica-privacidad">Política de Privacidad</a>. Al utilizar nuestros servicios, usted consiente a nuestras prácticas de recopilación y procesamiento de datos como se describe en dicha política.</p>
          `
        },
        {
          title: '7. Limitación de Responsabilidad',
          content: `
            <p>EdificioAdmin proporciona su plataforma "tal cual" y "según disponibilidad", sin garantías de ningún tipo, ya sean expresas o implícitas.</p>
            <p>En ningún caso seremos responsables por daños indirectos, incidentales, especiales, consecuentes o punitivos, incluidos, entre otros, la pérdida de beneficios, datos, uso, buena voluntad u otras pérdidas intangibles.</p>
          `
        },
        {
          title: '8. Indemnización',
          content: `
            <p>Usted acepta indemnizar y mantener indemne a EdificioAdmin y sus afiliados, funcionarios, agentes y empleados de cualquier reclamación, responsabilidad, daño, pérdida y gasto, incluidos honorarios y costos legales razonables, que surjan de o estén relacionados con su uso de nuestros servicios o cualquier violación de estos Términos.</p>
          `
        },
        {
          title: '9. Terminación',
          content: `
            <p>Podemos terminar o suspender su acceso a nuestros servicios inmediatamente, sin previo aviso ni responsabilidad, por cualquier razón, incluido, sin limitación, si incumple los Términos.</p>
            <p>Al terminar su cuenta, su derecho a utilizar los servicios cesará inmediatamente. Sin embargo, todas las disposiciones de los Términos que por su naturaleza deberían sobrevivir a la terminación sobrevivirán.</p>
          `
        },
        {
          title: '10. Ley Aplicable',
          content: `
            <p>Estos Términos se regirán e interpretarán de acuerdo con las leyes mexicanas, sin tener en cuenta sus conflictos de disposiciones legales.</p>
            <p>Cualquier disputa legal que surja de o en relación con estos Términos estará sujeta a la jurisdicción exclusiva de los tribunales de la Ciudad de México.</p>
          `
        },
        {
          title: '11. Contacto',
          content: `
            <p>Si tiene alguna pregunta sobre estos Términos, por favor contáctenos en <a href="mailto:legal@edificioadmin.com">legal@edificioadmin.com</a>.</p>
          `
        }
      ]
    };

    return renderHtml(termsTemplate, termsData);
  } catch (error) {
    console.error('Error en página de términos y condiciones:', error);
    return new Response('Error interno del servidor', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Página de registro
export async function register(request, env) {
  try {
    const url = new URL(request.url);
    const plan = url.searchParams.get('plan');
    
    const registerData = {
      title: 'Registro - EdificioAdmin',
      description: 'Crea tu cuenta en EdificioAdmin',
      defaultPlan: plan,
      plans: [
        { 
          id: 'basico', 
          name: 'Plan Básico', 
          price: 499,
          period: 'mes',
          units: 'Hasta 20 unidades',
          description: 'Ideal para edificios pequeños',
          features: ['Gestión de cuotas', 'Registro de gastos', 'Comunicados', 'Acceso residentes']
        },
        { 
          id: 'profesional', 
          name: 'Plan Profesional', 
          price: 999,
          period: 'mes',
          units: 'Hasta 50 unidades',
          description: 'Para edificios medianos',
          features: ['Todo en Básico', 'Notificaciones email', 'Reportes', 'Roles personalizados']
        },
        { 
          id: 'empresarial', 
          name: 'Plan Empresarial', 
          price: 1999,
          period: 'mes',
          units: 'Más de 50 unidades',
          description: 'Para múltiples condominios',
          features: ['Todo en Profesional', 'Múltiples edificios', 'API', 'Soporte prioritario']
        }
      ]
    };

    return new Response(registerTemplate(registerData), {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
      },
    });
  } catch (error) {
    console.error('Error en página de registro:', error);
    return new Response('Error interno del servidor', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Página de política de privacidad
export async function privacy(request, env) {
  try {
    const privacyData = {
      title: 'Política de Privacidad - EdificioAdmin',
      description: 'Cómo recopilamos, utilizamos y protegemos tu información',
      lastUpdated: '1 de noviembre de 2023',
      sections: [
        {
          title: '1. Introducción',
          content: `
            <p>En EdificioAdmin, respetamos su privacidad y nos comprometemos a proteger sus datos personales. Esta Política de Privacidad describe cómo recopilamos, utilizamos, procesamos y protegemos su información cuando utiliza nuestra plataforma.</p>
            <p>Al utilizar nuestros servicios, usted acepta las prácticas descritas en esta política. Le recomendamos que la lea detenidamente para entender nuestro enfoque respecto a su información.</p>
          `
        },
        {
          title: '2. Información que Recopilamos',
          content: `
            <p><strong>2.1. Información de Registro:</strong> Cuando crea una cuenta, recopilamos su nombre, dirección de correo electrónico, número telefónico, y en el caso de administradores, información sobre el condominio que administra.</p>
            <p><strong>2.2. Información de Uso:</strong> Recopilamos datos sobre cómo interactúa con nuestra plataforma, incluyendo acciones realizadas, funcionalidades utilizadas, y tiempo de uso.</p>
            <p><strong>2.3. Información de Pago:</strong> Para procesar pagos, recopilamos detalles de facturación y método de pago. Tenga en cuenta que no almacenamos información completa de tarjetas de crédito; esta información es procesada por nuestros proveedores de pago seguros.</p>
            <p><strong>2.4. Información del Condominio:</strong> Los administradores proporcionan datos sobre el condominio, incluyendo dirección, número de unidades, y potencialmente información sobre residentes y pagos.</p>
            <p><strong>2.5. Comunicaciones:</strong> Guardamos registros de sus comunicaciones con nosotros y otros usuarios dentro de la plataforma.</p>
          `
        },
        {
          title: '3. Cómo Utilizamos su Información',
          content: `
            <p>Utilizamos la información recopilada para:</p>
            <ul>
              <li>Proporcionar, mantener y mejorar nuestros servicios</li>
              <li>Procesar transacciones y enviar notificaciones relacionadas</li>
              <li>Comunicarnos con usted, incluyendo soporte al cliente</li>
              <li>Enviar actualizaciones, alertas de seguridad y mensajes administrativos</li>
              <li>Personalizar su experiencia en la plataforma</li>
              <li>Detectar, investigar y prevenir actividades fraudulentas o no autorizadas</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>
          `
        },
        {
          title: '4. Compartición de Información',
          content: `
            <p>No vendemos, alquilamos ni compartimos su información personal con terceros excepto en las siguientes circunstancias:</p>
            <ul>
              <li><strong>Proveedores de Servicios:</strong> Compartimos información con terceros que nos ayudan a operar nuestra plataforma (por ejemplo, procesadores de pago, servicios de almacenamiento en la nube).</li>
              <li><strong>Dentro del Condominio:</strong> Cierta información puede ser visible para otros usuarios dentro del mismo condominio, según los permisos configurados por los administradores.</li>
              <li><strong>Cumplimiento Legal:</strong> Podemos divulgar información cuando creemos de buena fe que la divulgación es necesaria para cumplir con la ley, proteger nuestros derechos o la seguridad de nuestros usuarios.</li>
              <li><strong>Con su Consentimiento:</strong> Compartiremos su información personal con terceros cuando tengamos su consentimiento para hacerlo.</li>
            </ul>
          `
        },
        {
          title: '5. Seguridad de Datos',
          content: `
            <p>Implementamos medidas de seguridad técnicas y organizativas diseñadas para proteger sus datos contra acceso no autorizado, alteración, divulgación o destrucción. Estas medidas incluyen, pero no se limitan a:</p>
            <ul>
              <li>Encriptación de datos sensibles</li>
              <li>Acceso restringido a información personal</li>
              <li>Monitoreo de sistemas para detectar vulnerabilidades</li>
              <li>Respaldos regulares de datos</li>
            </ul>
            <p>Sin embargo, ningún sistema de seguridad es impenetrable y no podemos garantizar la seguridad absoluta de su información.</p>
          `
        },
        {
          title: '6. Sus Derechos de Privacidad',
          content: `
            <p>Dependiendo de su ubicación, puede tener ciertos derechos relacionados con sus datos personales, incluyendo:</p>
            <ul>
              <li>Acceder a los datos personales que tenemos sobre usted</li>
              <li>Corregir datos inexactos</li>
              <li>Eliminar sus datos personales</li>
              <li>Restringir u oponerse al procesamiento de sus datos</li>
              <li>Recibir sus datos en un formato portable</li>
              <li>Retirar su consentimiento en cualquier momento</li>
            </ul>
            <p>Para ejercer estos derechos, póngase en contacto con nosotros a través de <a href="mailto:privacidad@edificioadmin.com">privacidad@edificioadmin.com</a>.</p>
          `
        },
        {
          title: '7. Retención de Datos',
          content: `
            <p>Conservamos su información personal mientras su cuenta esté activa o según sea necesario para proporcionarle nuestros servicios. También podemos retener y utilizar su información según sea necesario para:</p>
            <ul>
              <li>Cumplir con nuestras obligaciones legales</li>
              <li>Resolver disputas</li>
              <li>Hacer cumplir nuestros acuerdos</li>
              <li>Proteger nuestros intereses legales</li>
            </ul>
            <p>Cuando su información ya no sea necesaria para estos propósitos, la eliminaremos o anonimizaremos.</p>
          `
        },
        {
          title: '8. Cambios a esta Política',
          content: `
            <p>Podemos actualizar esta Política de Privacidad periódicamente. La versión más reciente siempre estará disponible en nuestra plataforma. Notificaremos cambios significativos mediante un aviso visible en nuestro sitio web o enviando un correo electrónico.</p>
            <p>Le recomendamos revisar esta política regularmente para estar informado sobre cómo protegemos su información.</p>
          `
        },
        {
          title: '9. Contacto',
          content: `
            <p>Si tiene preguntas o inquietudes sobre esta Política de Privacidad o nuestras prácticas de datos, por favor contáctenos en:</p>
            <p>Email: <a href="mailto:privacidad@edificioadmin.com">privacidad@edificioadmin.com</a><br>
            Dirección: Av. Reforma 222, Col. Juárez, CDMX, México<br>
            Teléfono: +52 (55) 1234-5678</p>
          `
        }
      ]
    };

    return renderHtml(privacyTemplate, privacyData);
  } catch (error) {
    console.error('Error en página de política de privacidad:', error);
    return new Response('Error interno del servidor', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}