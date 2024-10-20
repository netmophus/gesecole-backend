

const express = require('express');
const { protect, authorizeRole } = require('../../middleware/authMiddleware');
const { getAllOnglets, createOnglet, updateOnglet, deleteOnglet } = require('../../controllers/Administrator/ongletCartesController');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configurer multer pour les fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Dossier de destination
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.mp4') {
    cb(null, true);
  } else {
    cb(new Error('Seules les images et vidéos sont autorisées'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 10 } // Limite de taille de 10 Mo
});

// Routes pour les onglets des activités
router.route('/')
  .get(getAllOnglets)
  .post(protect, authorizeRole('Admin'), upload.fields([
    { name: 'imgOnglet', maxCount: 1 }
  ]), createOnglet);

router.route('/:id')
  .put(protect, authorizeRole('Admin'), upload.fields([
    { name: 'imgOnglet', maxCount: 1 }
  ]), updateOnglet)
  .delete(protect, authorizeRole('Admin'), deleteOnglet);

module.exports = router;
