-- Datos iniciales para el entorno de pruebas

-- Insertar usuario administrador (contraseña: Gemelo1)
INSERT INTO users (name, email, password, role, email_verified, active)
VALUES ('Admin Demo', 'admin@edificio-admin.com', '$2a$10$aCXh3JkJcYQwAITLQoWQl.kTXFpQ8LbDyQJ2hYaGpAJlXjO1.F/eS', 'owner', 1, 1);

-- Insertar un edificio de ejemplo
INSERT INTO buildings (name, address, units, owner_id, subscription_status)
VALUES ('Edificio Demo', 'Av. Ejemplo 123, Ciudad Demo', 20, 1, 'active');

-- Vincular al admin con el edificio
INSERT INTO building_users (building_id, user_id, role)
VALUES (1, 1, 'admin');

-- Insertar usuarios residentes
INSERT INTO users (name, email, password, role, unit, email_verified, active)
VALUES 
('María García', 'maria.garcia@edificio-admin.com', '$2a$10$aCXh3JkJcYQwAITLQoWQl.kTXFpQ8LbDyQJ2hYaGpAJlXjO1.F/eS', 'user', '101', 1, 1),
('Carlos López', 'carlos.lopez@edificio-admin.com', '$2a$10$aCXh3JkJcYQwAITLQoWQl.kTXFpQ8LbDyQJ2hYaGpAJlXjO1.F/eS', 'user', '102', 1, 1),
('Ana Martínez', 'ana.martinez@edificio-admin.com', '$2a$10$aCXh3JkJcYQwAITLQoWQl.kTXFpQ8LbDyQJ2hYaGpAJlXjO1.F/eS', 'user', '201', 1, 1),
('Roberto Silva', 'roberto.silva@edificio-admin.com', '$2a$10$aCXh3JkJcYQwAITLQoWQl.kTXFpQ8LbDyQJ2hYaGpAJlXjO1.F/eS', 'user', '202', 1, 1);

-- Vincular residentes al edificio
INSERT INTO building_users (building_id, user_id, role)
VALUES 
(1, 2, 'resident'),
(1, 3, 'resident'),
(1, 4, 'resident'),
(1, 5, 'resident');

-- Insertar configuración de notificaciones para el edificio
INSERT INTO notification_settings (building_id)
VALUES (1);

-- Insertar suscripción
INSERT INTO subscriptions (id, building_id, plan_id, status, current_period_start, current_period_end)
VALUES ('sub_demo123', 1, 'plan_basico', 'active', datetime('now'), datetime('now', '+30 days'));

-- Insertar cuotas de ejemplo
INSERT INTO fees (building_id, unit_id, amount, due_date, status, period, year, month)
VALUES 
(1, '101', 1200.00, datetime('now', '+15 days'), 'pending', 'monthly', strftime('%Y','now'), strftime('%m','now')),
(1, '102', 1200.00, datetime('now', '+15 days'), 'pending', 'monthly', strftime('%Y','now'), strftime('%m','now')),
(1, '201', 1200.00, datetime('now', '+15 days'), 'paid', 'monthly', strftime('%Y','now'), strftime('%m','now')),
(1, '202', 1200.00, datetime('now', '+15 days'), 'pending', 'monthly', strftime('%Y','now'), strftime('%m','now'));

-- Insertar gastos de ejemplo
INSERT INTO expenses (building_id, amount, date, category, description, created_by)
VALUES 
(1, 2500.00, datetime('now', '-5 days'), 'Mantenimiento', 'Reparación de bomba de agua', 1),
(1, 800.00, datetime('now', '-10 days'), 'Limpieza', 'Limpieza mensual de áreas comunes', 1),
(1, 1200.00, datetime('now', '-15 days'), 'Servicios', 'Pago de electricidad áreas comunes', 1);