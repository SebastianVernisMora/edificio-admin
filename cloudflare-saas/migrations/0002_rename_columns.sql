-- Migración para renombrar columnas a inglés

-- Recrear tabla usuarios con nombres en inglés
CREATE TABLE usuarios_new (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    unit TEXT,
    phone TEXT,
    building_id TEXT NOT NULL,
    active INTEGER DEFAULT 1,
    email_verified INTEGER DEFAULT 0,
    verification_token TEXT,
    reset_token TEXT,
    reset_token_expires TEXT,
    last_login TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (building_id) REFERENCES edificios(id)
);

-- Copiar datos existentes
INSERT INTO usuarios_new (id, email, password, name, role, unit, phone, building_id, active, created_at, updated_at)
SELECT id, email, password, nombre, rol, departamento, telefono, edificio_id, activo, created_at, updated_at
FROM usuarios;

-- Eliminar tabla antigua y renombrar
DROP TABLE usuarios;
ALTER TABLE usuarios_new RENAME TO usuarios;

-- Recrear índices
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_building ON usuarios(building_id);
