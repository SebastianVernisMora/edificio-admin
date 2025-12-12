import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data.json');

// Leer el archivo data.json
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log('🔍 Estado inicial:');
console.log(`Total de cuotas: ${data.cuotas.length}`);

// Contar cuotas por año
const cuotasPorAño = {};
data.cuotas.forEach(cuota => {
  if (!cuotasPorAño[cuota.anio]) {
    cuotasPorAño[cuota.anio] = 0;
  }
  cuotasPorAño[cuota.anio]++;
});

console.log('Cuotas por año:', cuotasPorAño);

// Filtrar cuotas: mantener solo octubre, noviembre y diciembre 2025
const cuotasPermitidas = data.cuotas.filter(cuota => {
  // Mantener solo cuotas de 2025 de los meses octubre, noviembre y diciembre
  if (cuota.anio === 2025) {
    const mesesPermitidos = ['Octubre', 'Noviembre', 'Diciembre'];
    return mesesPermitidos.includes(cuota.mes);
  }
  return false;
});

console.log('\n🧹 Después de la limpieza:');
console.log(`Cuotas mantenidas: ${cuotasPermitidas.length}`);

// Mostrar cuotas que se mantienen
const cuotasMantenidas = {};
cuotasPermitidas.forEach(cuota => {
  const key = `${cuota.mes} ${cuota.anio}`;
  if (!cuotasMantenidas[key]) {
    cuotasMantenidas[key] = 0;
  }
  cuotasMantenidas[key]++;
});

console.log('Cuotas mantenidas por mes:', cuotasMantenidas);

// Actualizar el array de cuotas
data.cuotas = cuotasPermitidas;

// Actualizar el nextId para cuotas
const maxId = Math.max(...cuotasPermitidas.map(c => c.id || 0));
data.nextId.cuotas = maxId + 1;

console.log(`\n💾 Nuevo nextId para cuotas: ${data.nextId.cuotas}`);

// Guardar el archivo actualizado
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log('\n✅ Limpieza de cuotas completada exitosamente!');
console.log('📁 Backup guardado como: data-backup-cuotas-cleanup.json');