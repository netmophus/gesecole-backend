
const multer = require('multer');
const path = require('path');

// Configuration du stockage de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/articles'); // Dossier pour les articles
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

// Filtrage des fichiers basés sur le type MIME
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'video/mp4'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Le fichier est accepté
  } else {
    cb(new Error('Only images and videos are allowed'), false); // Le fichier est rejeté
  }
};

// Configuration de multer avec limite de taille de fichier
const uploadArticle = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 10 } // Limite de taille de 10 Mo
}).single('imgContent'); // Un seul fichier image/vidéo

module.exports = uploadArticle;
