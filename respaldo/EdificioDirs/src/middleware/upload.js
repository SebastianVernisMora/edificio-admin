import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/anuncios/';
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generar nombre único: timestamp_originalname
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    
    // Sanitizar nombre del archivo
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${uniqueSuffix}_${sanitizedBaseName}${extension}`;
    
    cb(null, fileName);
  }
});

// Filtro de archivos permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido. Solo se permiten: ${allowedExtensions.join(', ')}`), false);
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo por archivo
    files: 5 // Máximo 5 archivos por anuncio
  }
});

// Middleware para manejar errores de multer
export const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
    case 'LIMIT_FILE_SIZE':
      return res.status(400).json({
        ok: false,
        msg: 'El archivo es demasiado grande. Tamaño máximo: 5MB'
      });
    case 'LIMIT_FILE_COUNT':
      return res.status(400).json({
        ok: false,
        msg: 'Demasiados archivos. Máximo permitido: 5 archivos'
      });
    case 'LIMIT_UNEXPECTED_FILE':
      return res.status(400).json({
        ok: false,
        msg: 'Campo de archivo inesperado'
      });
    default:
      return res.status(400).json({
        ok: false,
        msg: `Error de upload: ${error.message}`
      });
    }
  }
  
  if (error.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({
      ok: false,
      msg: error.message
    });
  }
  
  next(error);
};

// Función para eliminar archivos
export const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error eliminando archivo:', error);
    return false;
  }
};

// Función para eliminar múltiples archivos
export const deleteFiles = (filePaths) => {
  const results = [];
  filePaths.forEach(filePath => {
    results.push(deleteFile(filePath));
  });
  return results;
};

// Función para validar archivos existentes
export const validateExistingFiles = (filePaths) => {
  return filePaths.filter(filePath => fs.existsSync(filePath));
};

export default upload;