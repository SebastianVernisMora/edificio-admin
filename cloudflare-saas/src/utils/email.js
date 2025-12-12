/**
 * Utilidades para envío de correos electrónicos
 */

// Configuración base para emails
const EMAIL_CONFIG = {
  from: {
    email: 'notificaciones@edificio-admin.com',
    name: 'EdificioAdmin'
  },
  templateBase: {
    header: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{{title}}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #eee;
          }
          .logo {
            max-width: 150px;
            margin-bottom: 10px;
          }
          .content {
            padding: 20px 0;
          }
          .footer {
            text-align: center;
            padding: 20px 0;
            color: #777;
            font-size: 14px;
            border-top: 1px solid #eee;
          }
          .button {
            display: inline-block;
            background-color: #4a6de5;
            color: white;
            text-decoration: none;
            padding: 12px 25px;
            border-radius: 4px;
            font-weight: 600;
            margin: 20px 0;
          }
          .info-box {
            background-color: #f8f9fa;
            border-radius: 4px;
            padding: 15px;
            margin: 15px 0;
            border-left: 4px solid #4a6de5;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://edificio-admin.com/img/logo.png" alt="EdificioAdmin Logo" class="logo">
            <h1 style="color: #4a6de5;">{{title}}</h1>
          </div>
          <div class="content">
    `,
    footer: `
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} EdificioAdmin. Todos los derechos reservados.</p>
            <p>
              <a href="https://edificio-admin.com/terms" style="color: #777; text-decoration: underline;">Términos y Condiciones</a> | 
              <a href="https://edificio-admin.com/privacy" style="color: #777; text-decoration: underline;">Política de Privacidad</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }
};

/**
 * Enviar email de verificación
 */
export async function sendVerificationEmail(env, email, name, token) {
  const verificationUrl = `${env.ENVIRONMENT === 'development' ? 'http://localhost:8787' : 'https://edificio-admin.com'}/api/auth/verify-email/${token}`;
  
  const content = `
    <p>Hola ${name},</p>
    <p>Gracias por registrarte en EdificioAdmin. Para verificar tu cuenta, haz clic en el siguiente enlace:</p>
    <p style="text-align: center;">
      <a href="${verificationUrl}" class="button">Verificar Email</a>
    </p>
    <p>O copia y pega el siguiente enlace en tu navegador:</p>
    <div class="info-box">
      ${verificationUrl}
    </div>
    <p>Si no te registraste en EdificioAdmin, puedes ignorar este correo.</p>
    <p>Saludos,<br>El equipo de EdificioAdmin</p>
  `;
  
  return await sendEmail(env, {
    to: email,
    subject: 'Verifica tu cuenta de EdificioAdmin',
    template: {
      title: 'Verificación de Cuenta',
      content
    }
  });
}

/**
 * Enviar email de restablecimiento de contraseña
 */
export async function sendPasswordResetEmail(env, email, token) {
  const resetUrl = `${env.ENVIRONMENT === 'development' ? 'http://localhost:8787' : 'https://edificio-admin.com'}/reset-password?token=${token}`;
  
  const content = `
    <p>Hola,</p>
    <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en EdificioAdmin. Para continuar con el proceso, haz clic en el siguiente enlace:</p>
    <p style="text-align: center;">
      <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
    </p>
    <p>O copia y pega el siguiente enlace en tu navegador:</p>
    <div class="info-box">
      ${resetUrl}
    </div>
    <p>El enlace expirará en 24 horas. Si no solicitaste restablecer tu contraseña, puedes ignorar este correo.</p>
    <p>Saludos,<br>El equipo de EdificioAdmin</p>
  `;
  
  return await sendEmail(env, {
    to: email,
    subject: 'Restablecimiento de Contraseña - EdificioAdmin',
    template: {
      title: 'Restablecimiento de Contraseña',
      content
    }
  });
}

/**
 * Enviar email de invitación a un nuevo usuario
 */
export async function sendInvitationEmail(env, { email, name, buildingName, role, tempPassword, invitedBy }) {
  // Traducir rol a español
  const roleNames = {
    'admin': 'Administrador',
    'committee': 'Miembro del Comité',
    'resident': 'Residente'
  };
  
  const roleName = roleNames[role] || role;
  const loginUrl = `${env.ENVIRONMENT === 'development' ? 'http://localhost:8787' : 'https://edificio-admin.com'}/login`;
  
  const content = `
    <p>Hola ${name},</p>
    <p>${invitedBy} te ha invitado a unirte a <strong>${buildingName}</strong> en EdificioAdmin como <strong>${roleName}</strong>.</p>
    <p>EdificioAdmin es la plataforma para la gestión integral de condominios y edificios, permitiéndote acceder a información importante y mantenerte conectado con tu comunidad.</p>
    <div class="info-box">
      <p><strong>Tus credenciales de acceso:</strong></p>
      <p>Email: ${email}</p>
      <p>Contraseña temporal: ${tempPassword}</p>
    </div>
    <p>Por seguridad, te recomendamos cambiar tu contraseña después del primer inicio de sesión.</p>
    <p style="text-align: center;">
      <a href="${loginUrl}" class="button">Iniciar Sesión</a>
    </p>
    <p>Saludos,<br>El equipo de EdificioAdmin</p>
  `;
  
  return await sendEmail(env, {
    to: email,
    subject: `Invitación a ${buildingName} - EdificioAdmin`,
    template: {
      title: 'Bienvenido a EdificioAdmin',
      content
    }
  });
}

/**
 * Enviar notificación de pago de cuota
 */
export async function sendFeePaymentNotification(env, { email, name, buildingName, amount, date, unit }) {
  const content = `
    <p>Hola ${name},</p>
    <p>Hemos registrado el pago de tu cuota correspondiente a la unidad <strong>${unit}</strong> en <strong>${buildingName}</strong>.</p>
    <div class="info-box">
      <p><strong>Detalles del pago:</strong></p>
      <p>Monto: $${amount.toFixed(2)} MXN</p>
      <p>Fecha: ${new Date(date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
    <p>Gracias por tu puntualidad. Si tienes alguna pregunta sobre este pago, por favor contacta a la administración.</p>
    <p>Saludos,<br>Administración de ${buildingName}</p>
  `;
  
  return await sendEmail(env, {
    to: email,
    subject: `Confirmación de Pago - ${buildingName}`,
    template: {
      title: 'Confirmación de Pago',
      content
    }
  });
}

/**
 * Enviar recordatorio de pago pendiente
 */
export async function sendPaymentReminder(env, { email, name, buildingName, amount, dueDate, unit }) {
  const content = `
    <p>Hola ${name},</p>
    <p>Este es un recordatorio amistoso sobre el pago pendiente de la cuota de mantenimiento para la unidad <strong>${unit}</strong> en <strong>${buildingName}</strong>.</p>
    <div class="info-box">
      <p><strong>Detalles del pago:</strong></p>
      <p>Monto: $${amount.toFixed(2)} MXN</p>
      <p>Fecha límite: ${new Date(dueDate).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
    <p>Te agradecemos realizar el pago lo antes posible para mantener al día las finanzas del condominio. Si ya realizaste el pago, por favor ignora este mensaje.</p>
    <p>Saludos,<br>Administración de ${buildingName}</p>
  `;
  
  return await sendEmail(env, {
    to: email,
    subject: `Recordatorio de Pago Pendiente - ${buildingName}`,
    template: {
      title: 'Recordatorio de Pago',
      content
    }
  });
}

/**
 * Enviar notificación de nuevo anuncio
 */
export async function sendAnnouncementNotification(env, { email, name, buildingName, title, content: announcementContent }) {
  const content = `
    <p>Hola ${name},</p>
    <p>Se ha publicado un nuevo anuncio en <strong>${buildingName}</strong>:</p>
    <div class="info-box">
      <h3 style="margin-top: 0;">${title}</h3>
      <p>${announcementContent}</p>
    </div>
    <p>Para ver todos los anuncios y más información, inicia sesión en tu cuenta de EdificioAdmin.</p>
    <p>Saludos,<br>Administración de ${buildingName}</p>
  `;
  
  return await sendEmail(env, {
    to: email,
    subject: `Nuevo Anuncio: ${title} - ${buildingName}`,
    template: {
      title: 'Nuevo Anuncio',
      content
    }
  });
}

/**
 * Función base para envío de emails
 */
async function sendEmail(env, { to, subject, template }) {
  // Aplicar plantilla
  const { title, content } = template;
  const htmlContent = EMAIL_CONFIG.templateBase.header.replace(/{{title}}/g, title) + 
                     content + 
                     EMAIL_CONFIG.templateBase.footer;
  
  // En producción, integraríamos con un servicio como Mailjet, SendGrid, etc.
  if (env.ENVIRONMENT === 'production') {
    try {
      // Aquí iría la integración con el servicio de email
      console.log('Enviando email en producción:', { to, subject });
      
      // Ejemplo de integración con Mailjet (ficticio)
      /*
      const response = await fetch('https://api.mailjet.com/v3.1/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${env.MAILJET_API_KEY}:${env.MAILJET_SECRET_KEY}`)
        },
        body: JSON.stringify({
          Messages: [
            {
              From: {
                Email: EMAIL_CONFIG.from.email,
                Name: EMAIL_CONFIG.from.name
              },
              To: [
                {
                  Email: to,
                  Name: ''
                }
              ],
              Subject: subject,
              HTMLPart: htmlContent
            }
          ]
        })
      });
      
      const result = await response.json();
      return result;
      */
      
      // Por ahora simulamos éxito
      return { success: true };
    } catch (error) {
      console.error('Error al enviar email:', error);
      throw error;
    }
  } else {
    // En desarrollo, solo mostramos el email en logs
    console.log('==== EMAIL SIMULADO EN DESARROLLO ====');
    console.log(`Para: ${to}`);
    console.log(`Asunto: ${subject}`);
    console.log('Contenido HTML:', htmlContent.substring(0, 200) + '...');
    console.log('=====================================');
    return { success: true, development: true };
  }
}