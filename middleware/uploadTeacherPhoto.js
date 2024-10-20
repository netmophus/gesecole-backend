// const multer = require('multer');
// const path = require('path');

// // Configuration de Multer pour stocker les fichiers sur le serveur local
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/teachers');  // Dossier où seront stockées les photos
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // Générer un nom unique pour chaque fichier
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

// // Initialiser Multer avec la configuration
// const uploadPhoto = multer({
//   storage: storage,
//   limits: { fileSize: 2 * 1024 * 1024 },  // Limiter la taille des fichiers à 2 Mo
//   fileFilter: fileFilter
// });

// module.exports = uploadPhoto;














// const multer = require('multer');
// const path = require('path');

// // Configuration de Multer pour stocker les fichiers sur le serveur local
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/teachers');  // Dossier où seront stockées les photos
//   },
//   filename: function (req, file, cb) {
//     // Utiliser l'ID de l'enseignant (disponible dans req.params.id)
//     const teacherId = req.params.id;
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    
//     // Remplacer les espaces dans le nom par des tirets et ajouter l'ID enseignant
//     const teacherName = req.body.nom ? req.body.nom.replace(/\s+/g, '-').toLowerCase() : 'enseignant';
    
//     cb(null, `${teacherName}-${teacherId}-${uniqueSuffix}${path.extname(file.originalname)}`);
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

// // Initialiser Multer avec la configuration
// const uploadPhoto = multer({
//   storage: storage,
//   limits: { fileSize: 2 * 1024 * 1024 },  // Limiter la taille des fichiers à 2 Mo
//   fileFilter: fileFilter
// });

// module.exports = uploadPhoto;






// const multer = require('multer');
// const path = require('path');

// // Configuration de Multer pour stocker les fichiers sur le serveur local
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/teachers');  // Dossier où seront stockées les photos
//   },
//   filename: function (req, file, cb) {
//     // Utiliser le nom de l'enseignant à la place de l'ID dans le nom du fichier
//     const teacherName = req.body.nom ? req.body.nom.replace(/\s+/g, '_').toLowerCase() : 'enseignant';
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, teacherName + '-' + uniqueSuffix + path.extname(file.originalname)); // Générer un nom unique avec le nom de l'enseignant
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

// // Initialiser Multer avec la configuration
// const uploadPhoto = multer({
//   storage: storage,
//   limits: { fileSize: 2 * 1024 * 1024 },  // Limiter la taille des fichiers à 2 Mo
//   fileFilter: fileFilter
// });

// module.exports = uploadPhoto;






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




const multer = require('multer');
const path = require('path');

// Configuration de Multer pour stocker les fichiers des enseignants
const storageTeachers = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/teachers');  // Dossier pour les photos des enseignants
  },
  filename: function (req, file, cb) {
    const teacherName = req.body.nom ? req.body.nom.replace(/\s+/g, '_').toLowerCase() : 'enseignant';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, teacherName + '-' + uniqueSuffix + path.extname(file.originalname));
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

// Initialiser Multer avec la configuration pour les enseignants
const uploadTeacherPhoto = multer({
  storage: storageTeachers,
  limits: { fileSize: 2 * 1024 * 1024 },  // Limiter la taille des fichiers à 2 Mo
  fileFilter: fileFilter
});

module.exports = uploadTeacherPhoto;
