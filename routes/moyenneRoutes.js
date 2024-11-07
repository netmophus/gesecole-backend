const express = require('express');
const { 
  protect, 
  authorize, 
  authorizeRole 
} = require('../middleware/authMiddleware');
const { 
  createMoyenne,
  getMoyennes,
  getMoyenneByStudent,
  updateMoyenne,
  deleteMoyenne,
  getMoyennesByClassAndSemester
} = require('../controllers/moyenneController');

const router = express.Router();

// Route pour créer une moyenne
router.post(
  '/', 
  protect, 
  authorizeRole('Etablissement'), 
  authorize('create'), 
  createMoyenne
);

// Route pour obtenir toutes les moyennes (possibilité de filtrer par classe et semestre)
router.get(
  '/', 
  protect, 
  authorizeRole('Etablissement'), 
  authorize('read'), 
  getMoyennes
);

// Route pour obtenir les moyennes d'un élève spécifique
router.get(
  '/student/:studentId', 
  protect, 
  authorizeRole('Etablissement'), 
  authorize('read'), 
  getMoyenneByStudent
);

// Route pour mettre à jour une moyenne spécifique
router.put(
  '/:id', 
  protect, 
  authorizeRole('Etablissement'), 
  authorize('update'), 
  updateMoyenne
);

// Route pour supprimer une moyenne spécifique
router.delete(
  '/:id', 
  protect, 
  authorizeRole('Etablissement'), 
  authorize('delete'), 
  deleteMoyenne
);

// Route pour récupérer les moyennes par classe et semestre
router.get(
  '/class/:classId/semester/:semester', 
  protect, 
  authorizeRole('Etablissement'), 
  authorize('read'), 
  getMoyennesByClassAndSemester
);

module.exports = router;
