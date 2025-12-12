/**
 * Funciones de utilidad general para la aplicación
 */

/**
 * Genera un ID aleatorio para usar en diferentes situaciones
 * @param {number} length - Longitud del ID (por defecto 8 caracteres)
 * @returns {string} - ID aleatorio
 */
export function generateRandomId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Formatea una fecha a un formato específico
 * @param {Date|string|number} date - Fecha a formatear
 * @param {string} format - Formato deseado (default, short, long, iso)
 * @param {string} locale - Localización (por defecto 'es-MX')
 * @returns {string} - Fecha formateada
 */
export function formatDate(date, format = 'default', locale = 'es-MX') {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Verificar que la fecha sea válida
  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString(locale, { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
      
    case 'long':
      return dateObj.toLocaleDateString(locale, { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        weekday: 'long'
      });
      
    case 'time':
      return dateObj.toLocaleTimeString(locale, { 
        hour: '2-digit', 
        minute: '2-digit'
      });
      
    case 'datetime':
      return dateObj.toLocaleString(locale, { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
      });
      
    case 'iso':
      return dateObj.toISOString();
      
    case 'default':
    default:
      return dateObj.toLocaleDateString(locale, { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric'
      });
  }
}

/**
 * Formatea un valor monetario
 * @param {number} amount - Monto a formatear
 * @param {string} currency - Moneda (por defecto 'MXN')
 * @param {string} locale - Localización (por defecto 'es-MX')
 * @returns {string} - Valor formateado como moneda
 */
export function formatCurrency(amount, currency = 'MXN', locale = 'es-MX') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Trunca un texto a una longitud máxima
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @param {string} suffix - Sufijo a agregar (por defecto '...')
 * @returns {string} - Texto truncado
 */
export function truncateText(text, maxLength, suffix = '...') {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  return text.slice(0, maxLength) + suffix;
}

/**
 * Convierte un string a slug (para URLs)
 * @param {string} text - Texto a convertir
 * @returns {string} - Texto convertido a slug
 */
export function slugify(text) {
  return text
    .toString()
    .normalize('NFD')                // Normaliza caracteres Unicode
    .replace(/[\u0300-\u036f]/g, '') // Elimina diacríticos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Reemplaza espacios con guiones
    .replace(/[^\w-]+/g, '')        // Elimina caracteres no alfanuméricos
    .replace(/--+/g, '-');          // Reemplaza múltiples guiones por uno solo
}

/**
 * Comprueba si un objeto está vacío
 * @param {object} obj - Objeto a comprobar
 * @returns {boolean} - true si el objeto está vacío
 */
export function isEmptyObject(obj) {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
}

/**
 * Realiza deep merge de dos objetos
 * @param {object} target - Objeto destino
 * @param {object} source - Objeto fuente
 * @returns {object} - Objeto combinado
 */
export function deepMerge(target, source) {
  // Si source no es un objeto o es null, devolver directamente
  if (typeof source !== 'object' || source === null) {
    return source;
  }
  
  const output = Object.assign({}, target);
  
  if (target && typeof target === 'object') {
    Object.keys(source).forEach(key => {
      if (typeof source[key] === 'object' && source[key] !== null &&
          Object.prototype.toString.call(source[key]) !== '[object Array]') {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

/**
 * Valida una dirección de correo electrónico
 * @param {string} email - Correo electrónico a validar
 * @returns {boolean} - true si el correo es válido
 */
export function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Genera colores basados en un texto (útil para avatares)
 * @param {string} text - Texto para generar el color
 * @returns {string} - Color en formato hexadecimal
 */
export function stringToColor(text) {
  let hash = 0;
  
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = '#';
  
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  
  return color;
}

/**
 * Convierte bytes a un formato legible por humanos
 * @param {number} bytes - Bytes a formatear
 * @param {number} decimals - Decimales a mostrar (por defecto 2)
 * @returns {string} - Tamaño formateado
 */
export function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}