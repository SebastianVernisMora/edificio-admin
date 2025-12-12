/**
 * Script para sembrar datos iniciales en D1
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const SEEDS_DIR = path.join(process.cwd(), 'migrations', 'seeds');

// Verificar que el directorio de seeds existe
if (!fs.existsSync(SEEDS_DIR)) {
  console.error(`Error: No se encontró el directorio de seeds en ${SEEDS_DIR}`);
  process.exit(1);
}

// Leer todos los archivos de seed
console.log('Leyendo archivos de seed...');
const seedFiles = fs
  .readdirSync(SEEDS_DIR)
  .filter(file => file.endsWith('.sql'))
  .sort(); // Ordenar alfabéticamente para asegurar el orden correcto

if (seedFiles.length === 0) {
  console.warn('No se encontraron archivos de seed (.sql) para ejecutar');
  process.exit(0);
}

console.log(`Se encontraron ${seedFiles.length} archivos de seed:`);
seedFiles.forEach(file => console.log(`  - ${file}`));

// Ejecutar cada seed usando wrangler
console.log('\nEjecutando seeds...');
seedFiles.forEach(file => {
  const seedPath = path.join(SEEDS_DIR, file);
  console.log(`\nAplicando seed: ${file}`);
  
  try {
    // Usar wrangler para ejecutar el seed en D1
    execSync(`wrangler d1 execute edificio_admin_db --file=${seedPath}`, {
      stdio: 'inherit'
    });
    console.log(`✅ Seed aplicado correctamente: ${file}`);
  } catch (error) {
    console.error(`❌ Error aplicando seed ${file}:`);
    console.error(error.toString());
    process.exit(1);
  }
});

console.log('\n✅ Todos los seeds fueron aplicados correctamente');