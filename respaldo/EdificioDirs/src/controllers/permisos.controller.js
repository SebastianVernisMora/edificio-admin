// Controladores básicos para permisos

export const getUsuariosComite = async (req, res) => {
  res.json({ ok: true, usuarios: [] });
};

export const updatePermisos = async (req, res) => {
  res.json({ ok: false, msg: 'Funcionalidad no implementada' });
};

export const registrarActividad = async (req, res) => {
  res.json({ ok: false, msg: 'Funcionalidad no implementada' });
};

export const getActividad = async (req, res) => {
  res.json({ ok: true, actividades: [] });
};