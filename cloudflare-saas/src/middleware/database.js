/**
 * Database middleware for Cloudflare Workers
 */

// Middleware para añadir la base de datos a la solicitud
export function withDb(request, env) {
  request.db = env.DB;
  return request;
}

// Función para ejecutar migraciones de la base de datos
export async function runMigrations(env) {
  const migrations = [
    // Tabla de edificios/condominios
    `CREATE TABLE IF NOT EXISTS buildings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      units INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      owner_id INTEGER NOT NULL,
      subscription_id TEXT,
      subscription_status TEXT,
      settings TEXT,
      custom_domain TEXT,
      logo_url TEXT
    )`,

    // Tabla de usuarios
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      unit TEXT,
      phone TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP,
      email_verified BOOLEAN DEFAULT 0,
      verification_token TEXT,
      reset_token TEXT,
      reset_token_expires TIMESTAMP,
      active BOOLEAN DEFAULT 1
    )`,

    // Tabla de relación usuarios-edificios (para multi-tenant)
    `CREATE TABLE IF NOT EXISTS building_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      building_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      permissions TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (building_id) REFERENCES buildings (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE (building_id, user_id)
    )`,

    // Tabla de suscripciones
    `CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      building_id INTEGER NOT NULL,
      plan_id TEXT NOT NULL,
      status TEXT NOT NULL,
      current_period_start TIMESTAMP,
      current_period_end TIMESTAMP,
      cancel_at_period_end BOOLEAN DEFAULT 0,
      quantity INTEGER DEFAULT 1,
      price_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      custom_features TEXT,
      payment_method TEXT,
      FOREIGN KEY (building_id) REFERENCES buildings (id) ON DELETE CASCADE
    )`,

    // Tabla de facturación/pagos
    `CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      subscription_id TEXT NOT NULL,
      building_id INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL,
      status TEXT NOT NULL,
      payment_method TEXT,
      payment_date TIMESTAMP,
      invoice_url TEXT,
      receipt_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (subscription_id) REFERENCES subscriptions (id),
      FOREIGN KEY (building_id) REFERENCES buildings (id) ON DELETE CASCADE
    )`,

    // Tabla de notificaciones
    `CREATE TABLE IF NOT EXISTS notification_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      building_id INTEGER NOT NULL,
      email_enabled BOOLEAN DEFAULT 1,
      payment_notifications BOOLEAN DEFAULT 1,
      maintenance_notifications BOOLEAN DEFAULT 1,
      announcement_notifications BOOLEAN DEFAULT 1,
      custom_templates TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (building_id) REFERENCES buildings (id) ON DELETE CASCADE
    )`,

    // Tabla de cuotas (similar a la estructura actual)
    `CREATE TABLE IF NOT EXISTS fees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      building_id INTEGER NOT NULL,
      unit_id TEXT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      due_date TIMESTAMP NOT NULL,
      status TEXT NOT NULL,
      payment_date TIMESTAMP,
      payment_method TEXT,
      period TEXT NOT NULL,
      year INTEGER NOT NULL,
      month INTEGER,
      late_fee DECIMAL(10,2) DEFAULT 0,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (building_id) REFERENCES buildings (id) ON DELETE CASCADE
    )`,

    // Tabla de gastos (similar a la estructura actual)
    `CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      building_id INTEGER NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      date TIMESTAMP NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      receipt_url TEXT,
      created_by INTEGER NOT NULL,
      approved BOOLEAN DEFAULT 0,
      approved_by INTEGER,
      approved_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (building_id) REFERENCES buildings (id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users (id),
      FOREIGN KEY (approved_by) REFERENCES users (id)
    )`,

    // Índices para mejorar el rendimiento
    `CREATE INDEX IF NOT EXISTS idx_building_users_building_id ON building_users (building_id)`,
    `CREATE INDEX IF NOT EXISTS idx_building_users_user_id ON building_users (user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_fees_building_id ON fees (building_id)`,
    `CREATE INDEX IF NOT EXISTS idx_fees_unit_id ON fees (unit_id)`,
    `CREATE INDEX IF NOT EXISTS idx_expenses_building_id ON expenses (building_id)`,
    `CREATE INDEX IF NOT EXISTS idx_subscriptions_building_id ON subscriptions (building_id)`,
    `CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments (subscription_id)`,
  ];

  try {
    // Ejecutar cada migración en una transacción
    for (const migration of migrations) {
      await env.DB.prepare(migration).run();
    }
    console.log("Migraciones ejecutadas correctamente");
    return { success: true, message: 'Migraciones ejecutadas correctamente' };
  } catch (error) {
    console.error("Error ejecutando migraciones:", error);
    return { success: false, error: error.message };
  }
}