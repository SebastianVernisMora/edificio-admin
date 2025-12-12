-- Tabla de relación usuario-edificio (para multi-tenancy)

CREATE TABLE IF NOT EXISTS building_users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    building_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'resident',
    permissions TEXT, -- JSON string
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (building_id) REFERENCES edificios(id),
    FOREIGN KEY (user_id) REFERENCES usuarios(id),
    UNIQUE(building_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_building_users_building ON building_users(building_id);
CREATE INDEX IF NOT EXISTS idx_building_users_user ON building_users(user_id);
