
// const express = require('express');
// const router = express.Router();
// const teacherController = require('../controllers/teacherController');
// const { protect, authorize, authorizeRole } = require('../middleware/authMiddleware');
// //const uploadPhoto = require('../middleware/uploadPhoto');  // Importer le middleware Multer


// const { uploadTeacherPhoto } = require('../controllers/teacherController');
// const uploadPhoto = require('../middleware/uploadTeacherPhoto'); // Middleware pour gérer l'upload de fichiers
// // Créer un nouvel enseignant - Accessible uniquement aux utilisateurs avec le rôle "Etablissement" et la permission "create"



// // Créer un enseignant avec upload de photo
// router.post(
//   '/',
//   protect,
//   authorizeRole('Etablissement'),
//   authorize('create'),
//   uploadTeacherPhoto.single('photo'), // Middleware pour uploader la photo
//   teacherController.createTeacher
// );

// // Route pour uploader la photo séparément
// router.post('/:id/upload-photo', uploadTeacherPhoto.single('photo'), teacherController.uploadTeacherPhoto);


// // Récupérer tous les enseignants - Accessible uniquement aux utilisateurs avec le rôle "Etablissement" et la permission "read"
// router.get(
//   '/', 
//   protect, 
//   authorizeRole('Etablissement'), // Vérifie que l'utilisateur a le rôle "Etablissement"
//   authorize('read'), // Vérifie que l'utilisateur a la permission de lire
//   teacherController.getTeachers
// );

// // Récupérer les matières associées à un enseignant - Accessible uniquement aux utilisateurs avec le rôle "Etablissement" et la permission "read"
// router.get(
//   '/:teacherId/subjects', 
//   protect, 
//   authorizeRole('Etablissement'), // Vérifie que l'utilisateur a le rôle "Etablissement"
//   authorize('read'), // Vérifie que l'utilisateur a la permission de lire
//   teacherController.getTeacherSubjects
// );

// // Mettre à jour un enseignant existant - Accessible uniquement aux utilisateurs avec le rôle "Etablissement" et la permission "update"


// router.put(
//   '/:id', 
//   protect, 
//   authorizeRole('Etablissement'), 
//   authorize('update'), 
//   uploadPhoto.single('photo'),  // Ajoute le middleware pour gérer l'upload de la photo
//   teacherController.updateTeacher
// );

// // Supprimer un enseignant - Accessible uniquement aux utilisateurs avec le rôle "Etablissement" et la permission "delete"
// router.delete(
//   '/:id', 
//   protect, 
//   authorizeRole('Etablissement'), // Vérifie que l'utilisateur a le rôle "Etablissement"
//   authorize('delete'), // Vérifie que l'utilisateur a la permission de supprimer
//   teacherController.deleteTeacher
// );

// // Assigner des matières à un enseignant - Accessible uniquement aux utilisateurs avec le rôle "Etablissement" et la permission "create"
// router.post(
//   '/:id/assign-subjects', 
//   protect, 
//   authorizeRole('Etablissement'), // Vérifie que l'utilisateur a le rôle "Etablissement"
//   authorize('create'), // Vérifie que l'utilisateur a la permission de créer
//   teacherController.assignSubjectsToTeacher
// );

// // Supprimer une matière associée à un enseignant - Accessible uniquement aux utilisateurs avec le rôle "Etablissement" et la permission "delete"
// router.delete(
//   '/:teacherId/subjects/:subjectId', 
//   protect, 
//   authorizeRole('Etablissement'), // Vérifie que l'utilisateur a le rôle "Etablissement"
//   authorize('delete'), // Vérifie que l'utilisateur a la permission de supprimer
//   teacherController.removeSubjectFromTeacher
// );




// module.exports = router;





// const express = require('express');
// const router = express.Router();
// const teacherController = require('../controllers/teacherController');
// const { protect, authorize, authorizeRole } = require('../middleware/authMiddleware');
// const uploadPhoto = require('../middleware/uploadTeacherPhoto'); // Middleware pour gérer l'upload de fichiers

// // Créer un nouvel enseignant - Accessible uniquement aux utilisateurs avec le rôle "Etablissement" et la permission "create"
// router.post(
//   '/',
//   protect,
//   authorizeRole('Etablissement'),
//   authorize('create'),
//   uploadTeacherPhoto.single('photo'), // Le middleware d'upload de photo
//   teacherController.createTeacher
// );


// // Route pour uploader la photo séparément
// router.post(
//   '/:id/upload-photo', 
//   protect,
//   authorizeRole('Etablissement'),
//   authorize('update'), // Vérification pour permettre uniquement à ceux qui ont la permission de mettre à jour
//   uploadPhoto.single('photo'), 
//   teacherController.uploadTeacherPhoto
// );

// // Récupérer tous les enseignants - Accessible uniquement aux utilisateurs avec le rôle "Etablissement" et la permission "read"
// router.get(
//   '/', 
//   protect, 
//   authorizeRole('Etablissement'),
//   authorize('read'),
//   teacherController.getTeachers
// );

// // Récupérer les matières associées à un enseignant
// router.get(
//   '/:teacherId/subjects', 
//   protect, 
//   authorizeRole('Etablissement'),
//   authorize('read'),
//   teacherController.getTeacherSubjects
// );

// // Mettre à jour un enseignant existant - Accessible uniquement aux utilisateurs avec le rôle "Etablissement" et la permission "update"
// router.put(
//   '/:id', 
//   protect, 
//   authorizeRole('Etablissement'), 
//   authorize('update'), 
//   uploadPhoto.single('photo'),  // Ajoute le middleware pour gérer l'upload de la photo si elle est modifiée
//   teacherController.updateTeacher
// );

// // Supprimer un enseignant - Accessible uniquement aux utilisateurs avec le rôle "Etablissement" et la permission "delete"
// router.delete(
//   '/:id', 
//   protect, 
//   authorizeRole('Etablissement'),
//   authorize('delete'),
//   teacherController.deleteTeacher
// );

// // Assigner des matières à un enseignant - Accessible uniquement aux utilisateurs avec le rôle "Etablissement" et la permission "create"
// router.post(
//   '/:id/assign-subjects', 
//   protect, 
//   authorizeRole('Etablissement'),
//   authorize('create'),
//   teacherController.assignSubjectsToTeacher
// );

// // Supprimer une matière associée à un enseignant
// router.delete(
//   '/:teacherId/subjects/:subjectId', 
//   protect, 
//   authorizeRole('Etablissement'),
//   authorize('delete'),
//   teacherController.removeSubjectFromTeacher
// );

// module.exports = router;




const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { protect, authorize, authorizeRole } = require('../middleware/authMiddleware');
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


// Créer un nouvel enseignant - Accessible uniquement aux utilisateurs avec le rôle "Etablissement" et la permission "create"
// router.post(
//   '/',
//   protect,
//   authorizeRole('Etablissement'),
//   authorize('create'),
//   uploadTeacherPhoto.single('photo'), // Middleware d'upload de photo
//   teacherController.createTeacher
// );


// router.post(
//   '/',
//   uploadTeacherPhoto.single('photo'),  // Gère l'upload de la photo
//   protect,
//   authorizeRole('Etablissement'),
//   authorize('create'),
//   teacherController.createTeacher
// );


// router.post(
//   '/',
//   uploadTeacherPhoto.fields([{ name: 'photo', maxCount: 1 }]),  // Utilise fields pour gérer à la fois les champs et le fichier
//   protect,
//   authorizeRole('Etablissement'),
//   authorize('create'),
//   teacherController.createTeacher
// );





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
