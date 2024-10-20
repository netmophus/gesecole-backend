const express = require('express');
const { protect, authorizeRole } = require('../middleware/authMiddleware');
const { 
  createPedagogicalSubject, 
  getPedagogicalSubjects, 
  updatePedagogicalSubject, 
  deletePedagogicalSubject,
  getSubjectsByLevel  
} = require('../controllers/PedagogicalSubjectController');

const router = express.Router();

// Route pour créer une matière pédagogique
router.post('/', protect, authorizeRole('Admin'), createPedagogicalSubject);

// Route pour récupérer toutes les matières par niveau et classe
router.get('/', protect, getPedagogicalSubjects);

// Route pour récupérer les matières par niveau et classe
router.get(
  '/by-level',
  protect, // Vérifie si l'utilisateur est authentifié
  authorizeRole('Admin'), // Optionnel : restreint l'accès à un rôle spécifique
  getSubjectsByLevel
);

// Route pour mettre à jour une matière spécifique
router.put('/:id', protect, authorizeRole('Admin'), updatePedagogicalSubject);

// Route pour supprimer une matière spécifique
router.delete('/:id', protect, authorizeRole('Admin'), deletePedagogicalSubject);


module.exports = router;

