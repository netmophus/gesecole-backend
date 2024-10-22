// const multer = require('multer');
// const path = require('path');

// // Configuration de Multer pour stocker les fichiers des étudiants
// const storageStudents = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/students');  // Assure-toi que ce chemin est correct
//   },
//   filename: function (req, file, cb) {
//     const studentName = req.body.firstName ? req.body.firstName.replace(/\s+/g, '_').toLowerCase() : 'etudiant';
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, studentName + '-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });


// // Filtrer uniquement les images (formats jpg, jpeg, png)
// const fileFilter = (req, file, cb) => {
//   const filetypes = /jpeg|jpg|png/;
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = filetypes.test(file.mimetype);

//   if (mimetype && extname) {
//     return cb(null, true);
//   } else {
//     cb(new Error('Seules les images (jpg, jpeg, png) sont autorisées.'));
//   }
// };

// // Initialiser Multer avec la configuration pour les étudiants
// const uploadStudentPhoto = multer({
//   storage: storageStudents,
//   limits: { fileSize: 2 * 1024 * 1024 },  // Limiter la taille des fichiers à 2 Mo
//   fileFilter: fileFilter
// });

// module.exports = uploadStudentPhoto;




require('dotenv').config(); // Charger les variables d'environnement
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuration de CloudinaryStorage pour Multer
const storageStudents = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'students', // Dossier Cloudinary pour les photos des étudiants
    format: async (req, file) => 'png', // Vous pouvez forcer le format ou laisser Cloudinary gérer
    public_id: (req, file) => {
      const studentName = req.body.firstName ? req.body.firstName.replace(/\s+/g, '_').toLowerCase() : 'etudiant';
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `${studentName}-${uniqueSuffix}`;
    },
  },
});

// Filtrer uniquement les images (formats jpg, jpeg, png)
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(file.originalname.toLowerCase());
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
  limits: { fileSize: 2 * 1024 * 1024 }, // Limite de taille : 2 Mo
  fileFilter: fileFilter,
});

module.exports = uploadStudentPhoto;
