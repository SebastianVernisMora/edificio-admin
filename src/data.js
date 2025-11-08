import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, '../data.json');

// Función para leer datos del archivo JSON
export const readData = () => {
  try {
    if (!fs.existsSync(dataPath)) {
      // Si el archivo no existe, crear estructura inicial
      const initialData = {
        usuarios: [],
        cuotas: [],
        gastos: [],
        presupuestos: [],
        cierres: [],
        anuncios: [],
        fondos: {
          ahorroAcumulado: 67500,
          gastosMayores: 125000,
          dineroOperacional: 48000,
          patrimonioTotal: 240500
        },
        proyectos: [
          { id: 1, nombre: 'Legitimidad Legal', monto: 35000, prioridad: 'URGENTE' },
          { id: 2, nombre: 'Irregularidades Eléctricas', monto: 85000, prioridad: 'ALTA' },
          { id: 3, nombre: 'Bombas Base Inestable', monto: 45000, prioridad: 'MEDIA' },
          { id: 4, nombre: 'Estructura Castillos', monto: 120000, prioridad: 'ALTA' }
        ]
      };
      writeData(initialData);
      return initialData;
    }
    
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al leer datos:', error);
    return null;
  }
};

// Función para escribir datos en el archivo JSON
export const writeData = (data) => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error al escribir datos:', error);
    return false;
  }
};

// Función para obtener un elemento específico por ID
export const getById = (collection, id) => {
  const data = readData();
  if (!data || !data[collection]) return null;
  
  return data[collection].find(item => item.id === id);
};

// Función para agregar un nuevo elemento a una colección
export const addItem = (collection, item) => {
  const data = readData();
  if (!data) return false;
  
  // Generar ID único
  const newId = data[collection].length > 0 
    ? Math.max(...data[collection].map(i => i.id)) + 1 
    : 1;
  
  const newItem = { ...item, id: newId };
  data[collection].push(newItem);
  
  return writeData(data) ? newItem : null;
};

// Función para actualizar un elemento existente
export const updateItem = (collection, id, updates) => {
  const data = readData();
  if (!data) return false;
  
  const index = data[collection].findIndex(item => item.id === id);
  if (index === -1) return false;
  
  data[collection][index] = { ...data[collection][index], ...updates };
  
  return writeData(data) ? data[collection][index] : null;
};

// Función para eliminar un elemento
export const deleteItem = (collection, id) => {
  const data = readData();
  if (!data) return false;
  
  const initialLength = data[collection].length;
  data[collection] = data[collection].filter(item => item.id !== id);
  
  if (data[collection].length === initialLength) return false;
  
  return writeData(data);
};

// Función para actualizar fondos
export const updateFondos = (updates) => {
  const data = readData();
  if (!data) return false;
  
  data.fondos = { ...data.fondos, ...updates };
  
  // Actualizar patrimonio total
  data.fondos.patrimonioTotal = 
    data.fondos.ahorroAcumulado + 
    data.fondos.gastosMayores + 
    data.fondos.dineroOperacional;
  
  return writeData(data) ? data.fondos : null;
};

// Aliases for compatibility with models
export const getAll = (collection) => {
  const data = readData();
  return data ? data[collection] || [] : [];
};

export const create = addItem;
export const update = updateItem;
export const remove = deleteItem;
export const getFondos = () => {
  const data = readData();
  return data ? data.fondos : null;
};

export default {
  readData,
  writeData,
  getById,
  getAll,
  addItem,
  create,
  updateItem,
  update,
  deleteItem,
  remove,
  updateFondos,
  getFondos
};