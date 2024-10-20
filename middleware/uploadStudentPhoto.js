const multer = require('multer');
const path = require('path');

// Configuration de Multer pour stocker les fichiers des étudiants
const storageStudents = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/students');  // Assure-toi que ce chemin est correct
  },
  filename: function (req, file, cb) {
    const studentName = req.body.firstName ? req.body.firstName.replace(/\s+/g, '_').toLowerCase() : 'etudiant';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, studentName + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});


// Filtrer uniquement les images (formats jpg, jpeg, png)
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Seules les images (jpg, jpeg, png) sont autorisées.'));
  }
};

// Initialiser Multer avec la configuration pour les étudiants
const uploadStudentPhoto = multer({
  storage: storageStudents,
  limits: { fileSize: 2 * 1024 * 1024 },  // Limiter la taille des fichiers à 2 Mo
  fileFilter: fileFilter
});

module.exports = uploadStudentPhoto;
