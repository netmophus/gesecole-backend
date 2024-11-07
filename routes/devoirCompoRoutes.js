const express = require('express');
const { protect, authorizeRole } = require('../middleware/authMiddleware');
const {
  createDevoirCompo,
  getDevoirCompos,
  getDevoirCompoById,
  updateDevoirCompo,
  deleteDevoirCompo,
  getStudentNotes,
  calculateAverageForSubject,
  getAverageBySubjectAndSemester
} = require('../controllers/devoirCompoController');

const router = express.Router();

// Route pour créer un devoir ou une composition (accessible uniquement à l'enseignant ou admin par exemple)
router.route('/')
  .post(protect, authorizeRole('Etablissement'), createDevoirCompo)  // Autorisé uniquement aux enseignants ou aux administrateurs
  .get(protect, getDevoirCompos);  // Route pour obtenir la liste des devoirs et compositions (protégée mais accessible à tous les utilisateurs authentifiés)

// Route pour un devoir spécifique
router.route('/:id')
  .get(protect, getDevoirCompoById)  // Autorisé à tout utilisateur authentifié
  .put(protect, authorizeRole('Etablissement'), updateDevoirCompo)  // Mise à jour d'un devoir, autorisé uniquement à l'enseignant
  .delete(protect, authorizeRole('Etablissement'), deleteDevoirCompo);  // Suppression d'un devoir, autorisé uniquement à l'enseignant



  router.get('/student/:id', protect, getStudentNotes); // Récupère les notes d'un élève



  // Route pour calculer la moyenne d'un élève pour une matière et un semestre spécifique
router.get('/average/:studentId/:subjectId/:semester', protect, calculateAverageForSubject);

// Nouvelle route pour calculer la moyenne par matière et semestre
router.get('/average/:studentId/:subjectId/:semester', protect, getAverageBySubjectAndSemester);




module.exports = router;
