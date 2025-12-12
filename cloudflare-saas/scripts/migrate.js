/**
 * Script para ejecutar migraciones en D1
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const MIGRATIONS_DIR = path.join(process.cwd(), 'migrations');

// Verificar que el directorio de migraciones existe
if (!fs.existsSync(MIGRATIONS_DIR)) {
  console.error(`Error: No se encontró el directorio de migraciones en ${MIGRATIONS_DIR}`);
  process.exit(1);
}

// Leer todas las migraciones
console.log('Leyendo migraciones...');
const migrationFiles = fs
  .readdirSync(MIGRATIONS_DIR)
  .filter(file => file.endsWith('.sql'))
  .sort(); // Ordenar alfabéticamente para asegurar el orden correcto

if (migrationFiles.length === 0) {
  console.warn('No se encontraron archivos de migración (.sql) para ejecutar');
  process.exit(0);
}

console.log(`Se encontraron ${migrationFiles.length} archivos de migración:`);
migrationFiles.forEach(file => console.log(`  - ${file}`));

// Ejecutar cada migración usando wrangler
console.log('\nEjecutando migraciones...');
migrationFiles.forEach(file => {
  const migrationPath = path.join(MIGRATIONS_DIR, file);
  console.log(`\nAplicando migración: ${file}`);
  
  try {
    // Usar wrangler para ejecutar la migración en D1
    execSync(`wrangler d1 execute edificio_admin_db --file=${migrationPath}`, {
      stdio: 'inherit'
    });
    console.log(`✅ Migración aplicada correctamente: ${file}`);
  } catch (error) {
    console.error(`❌ Error aplicando migración ${file}:`);
    console.error(error.toString());
    process.exit(1);
  }
});

console.log('\n✅ Todas las migraciones fueron aplicadas correctamente');