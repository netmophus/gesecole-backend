// utils/multerConfig.js
const multer = require('multer');
const path = require('path');

// Configuration de multer pour la gestion des fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');  // Répertoire où les fichiers seront sauvegardés
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));  // Renommer les fichiers avec un timestamp
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
