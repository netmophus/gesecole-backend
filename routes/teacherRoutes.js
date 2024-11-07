


const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
//const { protect, authorize, authorizeRole } = require('../middleware/authMiddleware');
const { protect, authorizeRole, authorize } = require('../middleware/authMiddleware');
const uploadTeacherPhoto = require('../middleware/uploadTeacherPhoto');  // Import du middleware multer pour les enseignants


// Route pour créer un nouvel enseignant avec une photo
router.post(
  '/',
  protect,
  authorizeRole('Etablissement'),
  authorize('create'),
  uploadTeacherPhoto.single('photo'),  // Middleware pour gérer l'upload de la photo
  teacherController.createTeacher
);


// Récupérer tous les enseignants - Accessible uniquement aux utilisateurs avec le rôle "Etablissement" et la permission "read"
router.get(
  '/', 
  protect, 
  authorizeRole('Etablissement'),
  authorize('read'),
  teacherController.getTeachers
);

// Récupérer les matières associées à un enseignant - Accessible uniquement aux utilisateurs avec le rôle "Etablissement" et la permission "read"
router.get(
  '/:teacherId/subjects', 
  protect, 
  authorizeRole('Etablissement'),
  authorize('read'),
  teacherController.getTeacherSubjects
);

// Mettre à jour un enseignant existant - Accessible uniquement aux utilisateurs avec le rôle "Etablissement" et la permission "update"
router.put(
  '/:id', 
  protect, 
  authorizeRole('Etablissement'), 
  authorize('update'), 
  uploadTeacherPhoto.single('photo'),  // Middleware pour gérer l'upload de la photo si elle est modifiée
  teacherController.updateTeacher
);

// Supprimer un enseignant - Accessible uniquement aux utilisateurs avec le rôle "Etablissement" et la permission "delete"
router.delete(
  '/:id', 
  protect, 
  authorizeRole('Etablissement'),
  authorize('delete'),
  teacherController.deleteTeacher
);

// Assigner des matières à un enseignant - Accessible uniquement aux utilisateurs avec le rôle "Etablissement" et la permission "create"
router.post(
  '/:id/assign-subjects', 
  protect, 
  authorizeRole('Etablissement'),
  authorize('create'),
  teacherController.assignSubjectsToTeacher
);

// Supprimer une matière associée à un enseignant
router.delete(
  '/:teacherId/subjects/:subjectId', 
  protect, 
  authorizeRole('Etablissement'),
  authorize('delete'),
  teacherController.removeSubjectFromTeacher
);

module.exports = router;
