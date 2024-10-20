const multer = require('multer');
const path = require('path');

// Configuration de multer pour les ressources pédagogiques
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/resources/'); // Dossier où les ressources pédagogiques seront stockées
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

// Filtrage des fichiers pour accepter uniquement les images et les PDFs
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Seules les images et les PDFs sont acceptés
  if (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.pdf') {
    cb(null, true);
  } else {
    cb(new Error('Seules les images et les fichiers PDF sont acceptés'), false);
  }
};

// Limitation de la taille des fichiers à 10 Mo
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 10 } // Taille maximale de fichier : 10 Mo
}).fields([
  { name: 'pdfFiles', maxCount: 5 },   // Jusqu'à 5 fichiers PDF
  { name: 'imageFiles', maxCount: 3 }  // Jusqu'à 3 images
]);

module.exports = upload;
