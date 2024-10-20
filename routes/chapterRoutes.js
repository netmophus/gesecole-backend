const express = require('express');
const { createChapter, getChapters, updateChapter, deleteChapter, getAllClasses} = require('../controllers/ChapterController');
const { protect, authorizeRole } = require('../middleware/authMiddleware');
const router = express.Router();

// Route pour créer un nouveau chapitre
router.post('/', protect, authorizeRole('Admin'), createChapter);

// Route pour récupérer tous les chapitres (optionnellement filtrés par classe)
router.get('/', protect, authorizeRole('Admin'), getChapters);

// Route pour mettre à jour un chapitre
router.put('/:id', protect, authorizeRole('Admin'), updateChapter);

// Route pour supprimer un chapitre
router.delete('/:id', protect, authorizeRole('Admin'), deleteChapter);

// Nouvelle route pour récupérer toutes les classes
router.get('/classes', protect, authorizeRole('Admin'), getAllClasses);

module.exports = router;
