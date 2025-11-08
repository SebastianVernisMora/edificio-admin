import './database.js';
import { Usuario } from './models/Usuario.js';
import { Presupuesto } from './models/Presupuesto.js';
import { Cuota } from './models/Cuota.js';
import { Anuncio } from './models/Anuncio.js';
import { Solicitud } from './models/Solicitud.js';

async function seed() {
  try {
    console.log('Iniciando seeder...');

    const admin = await Usuario.crear({
      nombre: 'Administrador',
      email: 'admin@edificio.com',
      password: '123456',
      rol: 'admin',
      departamento: 'Administración',
      telefono: '+54911234567'
    });
    console.log('Usuario administrador creado');

    const inquilinos = [];
    for (let i = 1; i <= 20; i++) {
      const inquilino = await Usuario.crear({
        nombre: `Inquilino ${i}`,
        email: `inquilino${i}@email.com`,
        password: '123456',
        rol: 'inquilino',
        departamento: `${i}A`,
        telefono: `+5491123456${i.toString().padStart(2, '0')}`
      });
      inquilinos.push(inquilino);
    }
    console.log('20 inquilinos creados');

    const presupuesto1 = Presupuesto.crear({
      titulo: 'Reparación de ascensor',
      descripcion: 'Mantenimiento y reparación del ascensor principal',
      monto_total: 150000,
      fecha_inicio: '2024-01-15',
      fecha_fin: '2024-02-15',
      items: [
        { concepto: 'Repuestos', monto: 80000 },
        { concepto: 'Mano de obra', monto: 50000 },
        { concepto: 'Certificación', monto: 20000 }
      ]
    });

    const presupuesto2 = Presupuesto.crear({
      titulo: 'Pintura de fachada',
      descripcion: 'Repintado completo de la fachada del edificio',
      monto_total: 300000,
      fecha_inicio: '2024-03-01',
      fecha_fin: '2024-04-30',
      items: [
        { concepto: 'Pintura', monto: 120000 },
        { concepto: 'Andamios', monto: 80000 },
        { concepto: 'Mano de obra', monto: 100000 }
      ]
    });
    console.log('Presupuestos creados');

    Cuota.crearParaTodos({
      concepto: 'Expensas Enero 2024',
      monto: 45000,
      fecha_vencimiento: '2024-01-10'
    });

    Cuota.crearParaTodos({
      concepto: 'Expensas Febrero 2024',
      monto: 47000,
      fecha_vencimiento: '2024-02-10'
    });
    console.log('Cuotas creadas para todos los inquilinos');

    const anuncio1 = Anuncio.crear({
      titulo: 'Corte de agua programado',
      contenido: 'Se informa que el día 15/01/2024 de 9:00 a 17:00 hs se realizarán trabajos de mantenimiento en las cañerías. Habrá corte de agua en todo el edificio.',
      tipo: 'urgente',
      autor_id: admin.id,
      fecha_expiracion: '2024-01-16'
    });

    const anuncio2 = Anuncio.crear({
      titulo: 'Reunión de consorcio',
      contenido: 'Se convoca a todos los propietarios a la reunión mensual que se realizará el día 25/01/2024 a las 19:00 hs en el salón de usos múltiples.',
      tipo: 'reunion',
      autor_id: admin.id,
      fecha_expiracion: '2024-01-26'
    });

    const anuncio3 = Anuncio.crear({
      titulo: 'Horarios de limpieza',
      contenido: 'Se recuerda que los días de limpieza son lunes, miércoles y viernes de 8:00 a 12:00 hs. Por favor mantener libres los espacios comunes en esos horarios.',
      tipo: 'general',
      autor_id: admin.id
    });
    console.log('Anuncios creados');

    const solicitud1 = Solicitud.crear({
      usuario_id: inquilinos[0].id,
      tipo: 'mantenimiento',
      titulo: 'Problema con la cerradura',
      descripcion: 'La cerradura de la puerta principal no está funcionando correctamente. A veces no se puede abrir desde adentro.',
      prioridad: 'alta'
    });

    const solicitud2 = Solicitud.crear({
      usuario_id: inquilinos[1].id,
      tipo: 'mejora',
      titulo: 'Instalación de cámaras de seguridad',
      descripcion: 'Solicito evaluar la posibilidad de instalar cámaras de seguridad en el hall de entrada para mejorar la seguridad del edificio.',
      prioridad: 'media'
    });

    const solicitud3 = Solicitud.crear({
      usuario_id: inquilinos[2].id,
      tipo: 'reclamo',
      titulo: 'Ruidos molestos',
      descripcion: 'El departamento de arriba hace mucho ruido por las noches. Solicito que se hable con los inquilinos.',
      prioridad: 'media'
    });
    console.log('Solicitudes creadas');

    console.log('Seeder completado exitosamente!');
    console.log('\nCredenciales de prueba:');
    console.log('Administrador - Email: admin@edificio.com, Password: 123456');
    console.log('Inquilinos - Email: inquilino1@email.com a inquilino20@email.com, Password: 123456');

  } catch (error) {
    console.error('Error en seeder:', error);
  }
}

seed();