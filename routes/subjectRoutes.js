

const express = require('express');
const { protect, authorize, authorizeRole } = require('../middleware/authMiddleware');
const { 
  createSubject, 
  getSubjects, 
  updateSubject, 
  deleteSubject, 
  toggleSubjectActivation,
  getSubjectsByLevel 
} = require('../controllers/subjectController');

const router = express.Router();

router.route('/')
  .post(protect, authorizeRole('Etablissement'), authorize('create'), createSubject)  // Seuls les établissements avec la permission de créer peuvent ajouter une matière
  .get(protect, authorizeRole('Etablissement'), authorize('read'), getSubjects);       // Seuls les établissements avec la permission de lire peuvent voir les matières

router.route('/:id')
  .put(protect, authorizeRole('Etablissement'), authorize('update'), updateSubject)    // Seuls les établissements avec la permission de mettre à jour
  .delete(protect, authorizeRole('Etablissement'), authorize('delete'), deleteSubject); // Seuls les établissements avec la permission de supprimer

// Nouvelle route pour basculer l'état d'une matière (activer/désactiver)
router.patch('/:id/toggle-active', protect, authorizeRole('Etablissement'), authorize('update'), toggleSubjectActivation);

// Récupérer les matières par niveau pour les ressources pedagogiques
router.get('/by-level', protect, authorizeRole('Etablissement'), getSubjectsByLevel);

module.exports = router;

