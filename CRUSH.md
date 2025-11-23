# Edificio Admin - Code Guidelines

## Commands
```bash
npm run dev                        # Start dev server (port 3000)
npm test                          # Run all tests
node tests/permisos.test.js       # Run single test file
node tests/security.test.js       # Run specific test
```

## Code Style

### Naming
- Variables/functions: `camelCase` (`usuarioActual`, `validarToken`)
- Classes/Models: `PascalCase` (`Usuario`, `CuotaController`)
- Files: `camelCase` with suffix (`authController.js` NOT `auth.controller.js`)
- API routes: `kebab-case` (`/api/auth/login`, `/api/cuotas-mensuales`)

### Imports (ES6 Modules)
```javascript
import express from 'express';                          // External first
import { handleControllerError } from '../middleware/error-handler.js';  // Local second
// Always include .js extension in relative imports
```

### Response Format (CRITICAL - Only Allowed Format)
```javascript
// Success: ALWAYS use ok: true
res.json({ ok: true, data: usuario });

// Error: ALWAYS use ok: false, msg
res.status(400).json({ ok: false, msg: 'Error description' });

// FORBIDDEN: { success: true }, { error: "msg" }, { status: "ok" }
```

### Error Handling (MANDATORY)
```javascript
import { handleControllerError } from '../middleware/error-handler.js';

export const controller = async (req, res) => {
    try {
        const result = await Model.operation();
        res.json({ ok: true, data: result });
    } catch (error) {
        return handleControllerError(error, res, 'controller');  // REQUIRED
        // FORBIDDEN: console.error or manual error responses
    }
};
```

### Authentication
- Header: `x-auth-token` (ONLY allowed auth header - NO Authorization Bearer)
- Middleware: `verifyToken`, `isAdmin`, `isComite` for role validation
- Passwords: bcryptjs hash before saving

## Non-Negotiable Rules
1. Only `x-auth-token` for auth
2. Only `{ok: boolean}` response format
3. Zero duplicate files
4. No console.log/error in controllers (use handleControllerError)
5. Role validation on ALL sensitive endpoints
6. Strict naming conventions
