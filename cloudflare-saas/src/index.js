/**
 * Edificio Admin SaaS - Cloudflare Workers Implementation
 * Main entry point for the application
 */

import { Router } from 'itty-router';
import { handleCors } from './middleware/cors';
import { verifyToken } from './middleware/auth';
import { withDb } from './middleware/database';
import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

// Import route handlers
import * as auth from './handlers/auth';
import * as subscription from './handlers/subscription';
import * as buildings from './handlers/buildings';
import * as users from './handlers/users';
import * as landing from './handlers/landing';

// Create a new router
const router = Router();

// CORS middleware - debe manejar OPTIONS
router.all('*', (request) => {
  const response = handleCors(request);
  if (response instanceof Response) {
    return response;
  }
});

// Landing pages (public)
router.get('/', landing.home);
router.get('/registro', landing.register);
router.get('/precios', landing.pricing);
router.get('/acerca', landing.about);
router.get('/contacto', landing.contact);
router.post('/contacto', landing.contact);
router.get('/terminos', landing.terms);
router.get('/politica-privacidad', landing.privacy);

// Authentication routes
router.post('/api/auth/register', auth.register);
router.post('/api/auth/login', auth.login);
router.post('/api/auth/reset-password', auth.resetPassword);
router.get('/api/auth/verify-email/:token', auth.verifyEmail);

// Subscription and onboarding routes
router.post('/api/subscription/select-plan', subscription.selectPlan);
router.post('/api/subscription/custom-plan', subscription.customPlan);
router.post('/api/subscription/checkout', subscription.checkout);
router.post('/api/subscription/confirm', subscription.confirm);

// Protected routes (require authentication)
router.get('/api/me', verifyToken, auth.getProfile);
router.post('/api/logout', verifyToken, auth.logout);

// Building/Condominium management
router.post('/api/buildings', verifyToken, buildings.create);
router.get('/api/buildings', verifyToken, buildings.list);
router.get('/api/buildings/:id', verifyToken, buildings.getDetails);
router.put('/api/buildings/:id', verifyToken, buildings.update);
router.delete('/api/buildings/:id', verifyToken, buildings.remove);

// User management
router.post('/api/buildings/:id/users', verifyToken, users.create);
router.get('/api/buildings/:id/users', verifyToken, users.list);
router.put('/api/buildings/:id/users/:userId', verifyToken, users.update);
router.delete('/api/buildings/:id/users/:userId', verifyToken, users.remove);

// Export a default function that handles incoming HTTP requests
export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      
      // Manejar rutas de landing pages ANTES de los assets
      const landingPaths = ['/', '/registro', '/precios', '/acerca', '/contacto', '/terminos', '/politica-privacidad'];
      if (landingPaths.includes(url.pathname)) {
        const requestWithDb = withDb(request, env);
        return await router.handle(requestWithDb, env, ctx);
      }
      
      // Manejar rutas de API con el router
      if (url.pathname.startsWith('/api/')) {
        // Add database and environment to the request
        const requestWithDb = withDb(request, env);
        
        // Handle the request with the router
        return await router.handle(requestWithDb, env, ctx);
      }
      
      // Servir archivos estáticos
      // En desarrollo, wrangler dev con [site] sirve automáticamente desde public/
      // En producción, usar getAssetFromKV
      if (env.__STATIC_CONTENT) {
        try {
          const manifest = env.__STATIC_CONTENT_MANIFEST ? JSON.parse(env.__STATIC_CONTENT_MANIFEST) : {};
          return await getAssetFromKV(
            {
              request,
              waitUntil: ctx.waitUntil.bind(ctx),
            },
            {
              ASSET_NAMESPACE: env.__STATIC_CONTENT,
              ASSET_MANIFEST: manifest,
            }
          );
        } catch (e) {
          if (e.status === 404) {
            try {
              const manifest = env.__STATIC_CONTENT_MANIFEST ? JSON.parse(env.__STATIC_CONTENT_MANIFEST) : {};
              return await getAssetFromKV(
                {
                  request: new Request(`${url.origin}/index.html`, request),
                  waitUntil: ctx.waitUntil.bind(ctx),
                },
                {
                  ASSET_NAMESPACE: env.__STATIC_CONTENT,
                  ASSET_MANIFEST: manifest,
                }
              );
            } catch (e2) {
              return new Response('Not Found', { status: 404 });
            }
          }
          throw e;
        }
      }
      
      // Fallback para desarrollo sin assets configurados
      return new Response('Página no encontrada. Configura los assets en wrangler.toml', { 
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    } catch (error) {
      // General error handler
      console.error('Unhandled error:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Error interno del servidor',
        error: env.ENVIRONMENT === 'development' ? error.message : undefined
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  },

  // Scheduled event handler for periodic tasks
  async scheduled(event, env, ctx) {
    switch (event.cron) {
      case '0 0 * * *':
        console.log('Running daily maintenance tasks');
        break;
      case '0 9 * * MON':
        console.log('Generating weekly reports');
        break;
      case '0 0 1 * *':
        console.log('Processing monthly billing');
        break;
    }
  }
};
