-- Schema inicial para Edificio Admin SAAS

-- Edificios (multi-tenant)
CREATE TABLE IF NOT EXISTS edificios (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    direccion TEXT,
    total_departamentos INTEGER DEFAULT 20,
    admin_user_id TEXT,
    plan TEXT DEFAULT 'BASIC',
    activo INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nombre TEXT NOT NULL,
    rol TEXT NOT NULL,
    departamento TEXT,
    telefono TEXT,
    edificio_id TEXT NOT NULL,
    activo INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (edificio_id) REFERENCES edificios(id)
);

-- Cuotas
CREATE TABLE IF NOT EXISTS cuotas (
    id TEXT PRIMARY KEY,
    edificio_id TEXT NOT NULL,
    usuario_id TEXT NOT NULL,
    departamento TEXT NOT NULL,
    mes TEXT NOT NULL,
    anio INTEGER NOT NULL,
    monto REAL NOT NULL,
    estado TEXT DEFAULT 'pendiente',
    fecha_vencimiento TEXT,
    fecha_pago TEXT,
    metodo_pago TEXT,
    referencia_pago TEXT,
    notas TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (edificio_id) REFERENCES edificios(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Gastos
CREATE TABLE IF NOT EXISTS gastos (
    id TEXT PRIMARY KEY,
    edificio_id TEXT NOT NULL,
    concepto TEXT NOT NULL,
    monto REAL NOT NULL,
    categoria TEXT NOT NULL,
    fecha TEXT NOT NULL,
    proveedor TEXT,
    comprobante_url TEXT,
    aprobado_por TEXT,
    estado TEXT DEFAULT 'pendiente',
    notas TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (edificio_id) REFERENCES edificios(id)
);

-- Fondos
CREATE TABLE IF NOT EXISTS fondos (
    id TEXT PRIMARY KEY,
    edificio_id TEXT NOT NULL,
    tipo TEXT NOT NULL,
    monto REAL DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (edificio_id) REFERENCES edificios(id)
);

-- Anuncios
CREATE TABLE IF NOT EXISTS anuncios (
    id TEXT PRIMARY KEY,
    edificio_id TEXT NOT NULL,
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    prioridad TEXT DEFAULT 'normal',
    tipo TEXT NOT NULL,
    publicado_por TEXT,
    archivo_url TEXT,
    activo INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (edificio_id) REFERENCES edificios(id)
);

-- Solicitudes
CREATE TABLE IF NOT EXISTS solicitudes (
    id TEXT PRIMARY KEY,
    edificio_id TEXT NOT NULL,
    usuario_id TEXT NOT NULL,
    tipo TEXT NOT NULL,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    prioridad TEXT DEFAULT 'media',
    estado TEXT DEFAULT 'pendiente',
    respuesta TEXT,
    imagen_url TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (edificio_id) REFERENCES edificios(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    edificio_id TEXT,
    usuario_id TEXT,
    accion TEXT NOT NULL,
    entidad TEXT,
    entidad_id TEXT,
    detalles TEXT,
    ip_address TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_edificio ON usuarios(edificio_id);
CREATE INDEX IF NOT EXISTS idx_cuotas_edificio ON cuotas(edificio_id);
CREATE INDEX IF NOT EXISTS idx_cuotas_fecha ON cuotas(anio, mes);
CREATE INDEX IF NOT EXISTS idx_gastos_edificio ON gastos(edificio_id);
CREATE INDEX IF NOT EXISTS idx_audit_edificio ON audit_log(edificio_id);
