
// const multer = require('multer');
// const path = require('path');

// // Configuration de Multer pour stocker les fichiers des enseignants
// const storageTeachers = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/teachers');  // Dossier pour les photos des enseignants
//   },
//   filename: function (req, file, cb) {
//     const teacherName = req.body.nom ? req.body.nom.replace(/\s+/g, '_').toLowerCase() : 'enseignant';
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, teacherName + '-' + uniqueSuffix + path.extname(file.originalname));
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

// // Initialiser Multer avec la configuration pour les enseignants
// const uploadTeacherPhoto = multer({
//   storage: storageTeachers,
//   limits: { fileSize: 2 * 1024 * 1024 },  // Limiter la taille des fichiers à 2 Mo
//   fileFilter: fileFilter
// });

// module.exports = uploadTeacherPhoto;


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

// Configuration de Multer avec CloudinaryStorage
const storageTeachers = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'teachers', // Dossier Cloudinary où les images seront stockées
    format: async (req, file) => 'png', // Format des fichiers (ou laissez Cloudinary gérer le format)
    public_id: (req, file) => {
      const teacherName = req.body.nom ? req.body.nom.replace(/\s+/g, '_').toLowerCase() : 'enseignant';
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `${teacherName}-${uniqueSuffix}`;
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

// Initialiser Multer avec la configuration pour les enseignants
const uploadTeacherPhoto = multer({
  storage: storageTeachers,
  limits: { fileSize: 2 * 1024 * 1024 }, // Limiter la taille des fichiers à 2 Mo
  fileFilter: fileFilter,
});

module.exports = uploadTeacherPhoto;
