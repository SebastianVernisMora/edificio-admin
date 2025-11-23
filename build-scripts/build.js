#!/usr/bin/env node

/**
 * Build Script para Frontend Optimizado
 * Usa esbuild para bundling y minificación
 */

import esbuild from 'esbuild';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const isDev = process.argv.includes('--dev');
const watch = process.argv.includes('--watch');

console.log('🔨 Building frontend...');
console.log(`   Mode: ${isDev ? 'development' : 'production'}`);
console.log(`   Watch: ${watch ? 'enabled' : 'disabled'}`);

/**
 * Build Core modules
 */
async function buildCore() {
  console.log('\n📦 Building core modules...');
  
  const config = {
    entryPoints: [
      path.join(rootDir, 'src-optimized/core/api-client.js'),
      path.join(rootDir, 'src-optimized/core/state-manager.js'),
      path.join(rootDir, 'src-optimized/core/module-loader.js'),
      path.join(rootDir, 'src-optimized/core/router.js')
    ],
    bundle: true,
    minify: !isDev,
    sourcemap: isDev,
    format: 'esm',
    outdir: path.join(rootDir, 'dist/js/core'),
    target: ['es2020'],
    logLevel: 'info'
  };

  if (watch) {
    const context = await esbuild.context(config);
    await context.watch();
    console.log('👀 Watching core modules...');
  } else {
    await esbuild.build(config);
    console.log('✅ Core modules built');
  }
}

/**
 * Build Application modules
 */
async function buildModules() {
  console.log('\n📦 Building application modules...');
  
  const modulesDir = path.join(rootDir, 'src-optimized/modules');
  
  try {
    const files = await fs.readdir(modulesDir);
    const jsFiles = files.filter(f => f.endsWith('.js'));
    
    if (jsFiles.length === 0) {
      console.log('⚠️  No modules to build yet');
      return;
    }

    const entryPoints = jsFiles.map(f => path.join(modulesDir, f));
    
    const config = {
      entryPoints,
      bundle: true,
      minify: !isDev,
      sourcemap: isDev,
      format: 'esm',
      outdir: path.join(rootDir, 'dist/js/modules'),
      target: ['es2020'],
      logLevel: 'info'
    };

    if (watch) {
      const context = await esbuild.context(config);
      await context.watch();
      console.log('👀 Watching application modules...');
    } else {
      await esbuild.build(config);
      console.log(`✅ ${jsFiles.length} application modules built`);
    }
  } catch (error) {
    console.error('❌ Error building modules:', error);
  }
}

/**
 * Build CSS
 */
async function buildCSS() {
  console.log('\n📦 Building CSS...');
  
  try {
    // Por ahora solo copiar, después agregar PostCSS
    const sourceCss = path.join(rootDir, 'public/css/styles.css');
    const destCss = path.join(rootDir, 'dist/css/styles.min.css');
    
    await fs.mkdir(path.dirname(destCss), { recursive: true });
    await fs.copyFile(sourceCss, destCss);
    
    console.log('✅ CSS built (copied)');
  } catch (error) {
    console.error('❌ Error building CSS:', error);
  }
}

/**
 * Copy static assets
 */
async function copyAssets() {
  console.log('\n📦 Copying assets...');
  
  try {
    // Crear directorios
    await fs.mkdir(path.join(rootDir, 'dist/js'), { recursive: true });
    await fs.mkdir(path.join(rootDir, 'dist/css'), { recursive: true });
    
    console.log('✅ Assets directories created');
  } catch (error) {
    console.error('❌ Error copying assets:', error);
  }
}

/**
 * Generate build info
 */
async function generateBuildInfo() {
  const buildInfo = {
    version: '1.0.0',
    buildTime: new Date().toISOString(),
    mode: isDev ? 'development' : 'production',
    modules: []
  };

  try {
    const modulesDir = path.join(rootDir, 'dist/js/modules');
    const files = await fs.readdir(modulesDir).catch(() => []);
    buildInfo.modules = files;
  } catch (error) {
    // Ignore
  }

  const infoPath = path.join(rootDir, 'dist/build-info.json');
  await fs.writeFile(infoPath, JSON.stringify(buildInfo, null, 2));
  
  console.log('\n📄 Build info generated');
}

/**
 * Clean dist directory
 */
async function clean() {
  console.log('\n🧹 Cleaning dist directory...');
  
  try {
    await fs.rm(path.join(rootDir, 'dist'), { recursive: true, force: true });
    console.log('✅ Dist directory cleaned');
  } catch (error) {
    console.error('❌ Error cleaning:', error);
  }
}

/**
 * Main build function
 */
async function build() {
  const startTime = Date.now();
  
  try {
    // Clean en producción
    if (!isDev && !watch) {
      await clean();
    }

    // Build tasks en paralelo
    await Promise.all([
      copyAssets(),
      buildCore(),
      buildModules(),
      buildCSS()
    ]);

    await generateBuildInfo();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✨ Build complete in ${duration}s`);
    
    if (watch) {
      console.log('\n👀 Watching for changes...');
    }

  } catch (error) {
    console.error('\n❌ Build failed:', error);
    process.exit(1);
  }
}

// Run build
build();
