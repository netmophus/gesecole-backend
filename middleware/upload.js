
const multer = require('multer');
const path = require('path');

// Configuration de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Dossier où les fichiers seront stockés
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

// Filtrage des fichiers pour accepter les images, vidéos, et PDF
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Acceptation des fichiers images, vidéos et PDFs
  if (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.mp4' || ext === '.avi' || ext === '.pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only images, videos, and PDFs are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 10 } // Limite de taille de fichier à 10 Mo
}).fields([
  { name: 'imgArticle', maxCount: 1 },   // 1 image
  { name: 'videoArticles', maxCount: 3 }, // Jusqu'à 3 vidéos
  { name: 'pdfArticles', maxCount: 5 }    // Jusqu'à 5 PDFs
]);

module.exports = upload;
