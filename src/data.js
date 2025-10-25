import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFile = path.join(__dirname, '../data.json');

let data = {
  usuarios: [],
  presupuestos: [],
  cuotas: [],
  parcialidades: [],
  anuncios: [],
  solicitudes: [],
  gastos: [],
  cierres: [],
  nextId: { usuarios: 1, presupuestos: 1, cuotas: 1, parcialidades: 1, anuncios: 1, solicitudes: 1, gastos: 1, cierres: 1 }
};

export async function loadData() {
  try {
    const fileContent = await fs.readFile(dataFile, 'utf-8');
    data = JSON.parse(fileContent);
  } catch (error) {
    console.log('Archivo de datos no encontrado, usando datos por defecto');
    await initializeData();
  }
  return data;
}

export async function saveData() {
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
}

export function getData() {
  return data;
}

export function setData(newData) {
  data = { ...data, ...newData };
}

async function initializeData() {
  const bcrypt = (await import('bcryptjs')).default;
  
  // Usuario administrador
  data.usuarios = [
    {
      id: 1,
      nombre: 'Administrador Condominio',
      email: 'admin@edificio205.com',
      password: await bcrypt.hash('admin2025', 10),
      rol: 'admin',
      departamento: 'Administración',
      telefono: '+525555000000',
      created_at: '2025-11-01T00:00:00.000Z'
    }
  ];

  // Inquilinos basados en el censo real del edificio
  const inquilinos = [
    { nombre: 'Felipe', departamento: '101', email: 'felipe@edificio205.com', telefono: '+525555000101' },
    { nombre: 'Profe', departamento: '102', email: 'profe@edificio205.com', telefono: '+525555000102' },
    { nombre: 'Melndez', departamento: '103', email: 'melendez1@edificio205.com', telefono: '+525555000103' }, // Propietario múltiple
    { nombre: 'Rosita', departamento: '104', email: 'rosita@edificio205.com', telefono: '+525555000104' },
    { nombre: 'Krosty', departamento: '105', email: 'krosty@edificio205.com', telefono: '+525555000105' },
    
    { nombre: 'Melndez', departamento: '201', email: 'melendez2@edificio205.com', telefono: '+525555000201' }, // Propietario múltiple
    { nombre: 'Melndez', departamento: '202', email: 'melendez3@edificio205.com', telefono: '+525555000202' }, // Propietario múltiple
    { nombre: 'Krosty Moms', departamento: '203', email: 'krostymoms1@edificio205.com', telefono: '+525555000203' },
    { nombre: 'Lucy', departamento: '204', email: 'lucy@edificio205.com', telefono: '+525555000204' },
    
    { nombre: 'Gaby', departamento: '301', email: 'gaby@edificio205.com', telefono: '+525555000301' },
    { nombre: 'Graciela', departamento: '302', email: 'graciela@edificio205.com', telefono: '+525555000302' },
    { nombre: 'Lupe', departamento: '303', email: 'lupe@edificio205.com', telefono: '+525555000303' },
    { nombre: 'Gemelos', departamento: '304', email: 'gemelos1@edificio205.com', telefono: '+525555000304' },
    { nombre: 'Melndez', departamento: '305', email: 'melendez4@edificio205.com', telefono: '+525555000305' }, // Propietario múltiple
    
    { nombre: 'Krosty Moms', departamento: '2', email: 'krostymoms2@edificio205.com', telefono: '+525555000002' }, // Número especial
    { nombre: 'Rosalinda', departamento: '3', email: 'rosalinda@edificio205.com', telefono: '+525555000003' }, // Número especial
    { nombre: 'Fernando', departamento: '4', email: 'fernando@edificio205.com', telefono: '+525555000004' }, // Número especial
    { nombre: 'Laura', departamento: '5', email: 'laura@edificio205.com', telefono: '+525555000005' }, // Número especial
    { nombre: 'Patricia', departamento: '1', email: 'patricia@edificio205.com', telefono: '+525555000001' }, // Número especial
    { nombre: 'Gemelos', departamento: '205', email: 'gemelos2@edificio205.com', telefono: '+525555000205' }
  ];

  for (let index = 0; index < inquilinos.length; index++) {
    const inquilino = inquilinos[index];
    data.usuarios.push({
      id: index + 2,
      nombre: inquilino.nombre,
      email: inquilino.email,
      password: await bcrypt.hash('inquilino2025', 10),
      rol: 'inquilino',
      departamento: inquilino.departamento,
      telefono: inquilino.telefono,
      legitimidad_entregada: false, // Basado en el análisis - ninguno ha entregado legitimidad
      estatus_validacion: 'pendiente', // Todos pendientes según el análisis
      created_at: '2025-11-01T00:00:00.000Z'
    });
  }

  // Presupuestos para 2026 (planificación desde noviembre 2025)
  data.presupuestos = [
    {
      id: 1,
      titulo: 'Corrección de Irregularidades Eléctricas',
      descripcion: 'Reparación y normalización del sistema eléctrico del edificio para corregir las fallas recurrentes identificadas',
      monto_total: 85000,
      fecha_inicio: '2026-02-01',
      fecha_fin: '2026-03-31',
      estado: 'pendiente',
      created_at: '2025-11-15T00:00:00.000Z'
    },
    {
      id: 2,
      titulo: 'Reparación Bombas de Agua y Base Inestable',
      descripcion: 'Corrección estructural de la base inestable de las bombas de agua y mantenimiento integral del sistema hidráulico',
      monto_total: 45000,
      fecha_inicio: '2026-03-01',
      fecha_fin: '2026-04-15',
      estado: 'pendiente',
      created_at: '2025-11-20T00:00:00.000Z'
    },
    {
      id: 3,
      titulo: 'Formalización Legal - Legitimidad de Propiedad',
      descripcion: 'Trámites legales para obtener la legitimidad de propiedad, Acta PROSOC y primer reglamento firmado',
      monto_total: 35000,
      fecha_inicio: '2026-01-15',
      fecha_fin: '2026-06-30',
      estado: 'urgente',
      created_at: '2025-11-10T00:00:00.000Z'
    }
  ];

  // Generar cuotas de noviembre y diciembre 2025 (inicio del sistema)
  const año2025 = 2025;
  const mesesActuales = ['Noviembre', 'Diciembre'];
  let cuotaId = 1;
  
  // Generar cuotas para noviembre y diciembre 2025
  for (let i = 2; i <= 21; i++) {
    for (let mesIndex = 0; mesIndex < mesesActuales.length; mesIndex++) {
      const mes = mesIndex + 10; // Noviembre = 10, Diciembre = 11
      // Las cuotas se vencen el 1 del mes siguiente
      const fechaVencimiento = new Date(año2025, mes + 1, 1);
      
      data.cuotas.push({
        id: cuotaId++,
        usuario_id: i,
        concepto: `Cuota Mensual ${mesesActuales[mesIndex]} ${año2025}`,
        descripcion: 'Mantenimiento Operacional ($400) + Fondo Ahorro Basura ($150)',
        monto: 550,
        tipo_cuota: 'mensual',
        fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0],
        pagado: false,
        fecha_pago: null,
        metodo_pago: null,
        validado_por: null,
        created_at: '2025-11-01T00:00:00.000Z'
      });
    }
  }

  // Saldos iniciales del condominio (cierre octubre 2025)
  data.saldos_fondos = {
    fondo_ahorro_acumulado: 67500, // Saldo acumulado del fondo de ahorro/basura
    fondo_gastos_mayores_acumulado: 125000, // Saldo acumulado del fondo de gastos mayores  
    dinero_operacional: 48000, // Dinero operacional disponible
    fecha_corte: '2025-10-31',
    ejercicio: '2025'
  };

  // Tabla para parcialidades (inicialmente vacía)
  data.parcialidades = [];

  data.anuncios = [
    {
      id: 1,
      titulo: 'Cierre Mensual Noviembre y Diciembre 2025',
      contenido: 'Estimados propietarios: Iniciamos el cierre de los últimos dos meses de 2025. CUOTAS NOVIEMBRE: Vencen 1 diciembre. CUOTAS DICIEMBRE: Vencen 1 enero 2026. Se solicita puntualidad para facilitar los cierres mensuales correspondientes.',
      tipo: 'general',
      autor_id: 1,
      activo: true,
      fecha_expiracion: '2025-12-31',
      created_at: '2025-11-01T00:00:00.000Z'
    },
    {
      id: 2,
      titulo: 'Asamblea Preparación 2026 y Proyectos Críticos',
      contenido: 'ASAMBLEA ORDINARIA: 28 noviembre 2025, 19:00 hrs. AGENDA: 1) Cierre contable 2025, 2) Saldos fondos acumulados ($240,500), 3) Presupuesto proyectos 2026, 4) Legitimidad propiedad URGENTE, 5) Reparaciones críticas. ASISTENCIA OBLIGATORIA.',
      tipo: 'reunion',
      autor_id: 1,
      activo: true,
      fecha_expiracion: '2025-11-29',
      created_at: '2025-11-05T00:00:00.000Z'
    },
    {
      id: 3,
      titulo: 'URGENTE: Legitimidad de Propiedad 2026',
      contenido: 'ATENCIÓN PROPIETARIOS: Para 2026 es OBLIGATORIO entregar documentos de legitimidad de propiedad. Sin esta documentación NO se podrán cobrar cuotas de forma vinculante ni ejecutar proyectos. Plazo máximo: 31 enero 2026. Contactar administración INMEDIATAMENTE.',
      tipo: 'urgente',
      autor_id: 1,
      activo: true,
      fecha_expiracion: '2026-01-31',
      created_at: '2025-11-03T00:00:00.000Z'
    },
    {
      id: 4,
      titulo: 'Patrimonio Condominio - Excelente Estado Financiero',
      contenido: 'BUENAS NOTICIAS: Al 31 octubre 2025 nuestro patrimonio total es de $240,500 MXN. Fondo Ahorro: $67,500 | Fondo Gastos Mayores: $125,000 | Operacional: $48,000. Estamos en excelente posición para ejecutar proyectos críticos 2026.',
      tipo: 'general',
      autor_id: 1,
      activo: true,
      fecha_expiracion: '2025-12-31',
      created_at: '2025-11-02T00:00:00.000Z'
    }
  ];

  // Gastos de noviembre 2025 
  data.gastos = [
    {
      id: 1,
      concepto: 'Limpieza áreas comunes - Noviembre',
      monto: 3900,
      categoria: 'limpieza_mantenimiento',
      fecha: '2025-11-05',
      proveedor: 'Personal de Limpieza',
      descripcion: 'Limpieza de escaleras, pasillos y riego de macetas (3 veces por semana)',
      created_at: '2025-11-05T00:00:00.000Z'
    },
    {
      id: 2,
      concepto: 'Electricidad CFE - Noviembre',
      monto: 1650,
      categoria: 'servicios_publicos',
      fecha: '2025-11-15',
      proveedor: 'CFE',
      descripcion: 'Consumo eléctrico de áreas comunes noviembre 2025',
      created_at: '2025-11-15T00:00:00.000Z'
    },
    {
      id: 3,
      concepto: 'Recolección de basura - Noviembre',
      monto: 180,
      categoria: 'servicios_publicos',
      fecha: '2025-11-10',
      proveedor: 'Servicios Municipales',
      descripcion: 'Servicio de recolección de basura noviembre 2025',
      created_at: '2025-11-10T00:00:00.000Z'
    },
    {
      id: 4,
      concepto: 'Agua SACMEX - Noviembre',
      monto: 820,
      categoria: 'servicios_publicos',
      fecha: '2025-11-20',
      proveedor: 'SACMEX',
      descripcion: 'Consumo de agua para riego y limpieza noviembre 2025',
      created_at: '2025-11-20T00:00:00.000Z'
    },
    {
      id: 5,
      concepto: 'Mantenimiento preventivo interfón',
      monto: 1500,
      categoria: 'mantenimiento_preventivo',
      fecha: '2025-11-25',
      proveedor: 'Técnico en Comunicaciones',
      descripcion: 'Mantenimiento anual programado del sistema de intercomunicación',
      created_at: '2025-11-25T00:00:00.000Z'
    }
  ];

  // Cierres contables previos (hasta octubre 2025)
  data.cierres_contables = [
    {
      id: 1,
      periodo: '2025-10',
      tipo: 'mensual',
      fecha_cierre: '2025-10-31',
      total_ingresos: 11000, // Ingresos octubre 2025
      total_egresos: 7150, // Gastos operacionales octubre
      saldo_mensual: 3850,
      saldo_acumulado_operacional: 48000, // Dinero disponible para operación
      saldo_fondo_ahorro: 67500, // Fondo de ahorro acumulado 
      saldo_fondo_gastos_mayores: 125000, // Fondo gastos mayores acumulado
      estado: 'cerrado',
      notas: 'Cierre octubre 2025 - Base para inicio noviembre',
      created_at: '2025-10-31T23:59:59.000Z'
    },
    {
      id: 2,
      periodo: '2025',
      tipo: 'anual',
      fecha_cierre: '2025-10-31',
      total_ingresos: 220000, // Ingresos enero-octubre 2025
      total_egresos: 155000, // Gastos enero-octubre 2025
      saldo_anual: 65000,
      patrimonio_total: 240500, // Suma de todos los fondos
      estado: 'proyectado',
      notas: 'Proyección anual hasta octubre - pendiente cierre nov/dic',
      created_at: '2025-10-31T23:59:59.000Z'
    }
  ];

  // Sin solicitudes iniciales - sistema limpio para 2026
  data.solicitudes = [];

  data.nextId = {
    usuarios: 22, // 1 admin + 20 inquilinos + 1 para el próximo
    presupuestos: 4,
    cuotas: cuotaId, // 40 cuotas (20 inquilinos × 2 meses: nov y dic 2025)
    anuncios: 5,
    solicitudes: 1, // Sistema limpio
    gastos: 6,
    cierres_contables: 3,
    parcialidades: 1
  };

  await saveData();
}