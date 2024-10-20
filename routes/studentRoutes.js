
// const express = require('express');
// const { 
//     createStudent,
//     getStudents,
//     updateStudent,
//     deleteStudent,
//     getStudentById,
//     generateSchoolCards,
//     getSchoolCards,
//     getStudentsByClass,
//     deleteAllSchoolCards,
   
// } = require('../controllers/studentController');
// const { protect, authorizeRole, authorize } = require('../middleware/authMiddleware');
// const uploadStudentPhotoMiddleware = require('../middleware/uploadStudentPhoto'); // Import du middleware spécifique pour les photos des étudiants

// const router = express.Router();

// // Route pour générer et récupérer les cartes scolaires (spécifique)
// router.post(
//   '/generate-school-cards', 
//   protect, 
//   authorizeRole('Etablissement'), 
//   authorize('create'), 
//   generateSchoolCards
// );

// router.get(
//   '/school-cards', 
//   protect, 
//   authorizeRole('Etablissement'), 
//   authorize('read'), 
//   getSchoolCards
// );

// // Route pour créer un étudiant avec la gestion de la photo
// router.post(
//   '/', 
//   protect, 
//   authorizeRole('Etablissement'), 
//   authorize('create'), 
//   uploadStudentPhotoMiddleware.single('photo'),  // Utilisation du middleware spécifique pour l'upload de la photo
//   createStudent
// );

// // Route pour récupérer les étudiants
// router.get(
//   '/', 
//   protect, 
//   authorizeRole('Etablissement'), 
//   authorize('read'), 
//   getStudents
// );

// router.get(
//   '/:id', 
//   protect, 
//   authorizeRole('Etablissement'), 
//   authorize('read'),   
//   getStudentById
// );

// // Route pour mettre à jour un étudiant
// router.put(
//   '/:id', 
//   protect, 
//   authorizeRole('Etablissement'), 
//   authorize('update'), 
//   uploadStudentPhotoMiddleware.single('photo'),  // Utilisation du middleware spécifique pour l'upload de la photo
//   updateStudent
// );

// // Route pour supprimer un étudiant
// router.delete(
//   '/:id', 
//   protect, 
//   authorizeRole('Etablissement'), 
//   authorize('delete'), 
//   deleteStudent
// );


// // Route pour récupérer les élèves d'une classe spécifique
// router.get(
//   '/class/:classId/students', 
//   protect, 
//   authorizeRole('Etablissement'), 
//   authorize('read'), 
//   getStudentsByClass
// );



// // Route pour supprimer toutes les cartes scolaires
// router.delete(
//   '/school-cards',
//   protect,
//   authorizeRole('Etablissement'),
//   authorize('delete'),
//   deleteAllSchoolCards
// );

// module.exports = router;



const express = require('express');
const { 
    createStudent,
    getStudents,
    updateStudent,
    deleteStudent,
    getStudentById,
    generateSchoolCards,
    getSchoolCards,
    getStudentsByClass,
    deleteAllSchoolCards // Ajout de l'import pour la suppression de toutes les cartes
} = require('../controllers/studentController');
const { protect, authorizeRole, authorize } = require('../middleware/authMiddleware');
const uploadStudentPhotoMiddleware = require('../middleware/uploadStudentPhoto'); // Import du middleware spécifique pour les photos des étudiants
const { getStudentNotes } = require('../controllers/devoirCompoController');

const router = express.Router();

// Route pour générer et récupérer les cartes scolaires (spécifique)
router.post(
  '/generate-school-cards', 
  protect, 
  authorizeRole('Etablissement'), 
  authorize('create'), 
  generateSchoolCards
);

router.get(
  '/school-cards', 
  protect, 
  authorizeRole('Etablissement'), 
  authorize('read'), 
  getSchoolCards
);

// Route pour supprimer toutes les cartes scolaires
router.delete(
  '/school-cards',
  protect,
  authorizeRole('Etablissement'),
  authorize('delete'),
  deleteAllSchoolCards
);

// Route pour créer un étudiant avec la gestion de la photo
router.post(
  '/', 
  protect, 
  authorizeRole('Etablissement'), 
  authorize('create'), 
  uploadStudentPhotoMiddleware.single('photo'),  // Utilisation du middleware spécifique pour l'upload de la photo
  createStudent
);

// Route pour récupérer les étudiants
router.get(
  '/', 
  protect, 
  authorizeRole('Etablissement'), 
  authorize('read'), 
  getStudents
);

router.get(
  '/:id', 
  protect, 
  authorizeRole('Etablissement'), 
  authorize('read'),   
  getStudentById
);

// Route pour mettre à jour un étudiant
router.put(
  '/:id', 
  protect, 
  authorizeRole('Etablissement'), 
  authorize('update'), 
  uploadStudentPhotoMiddleware.single('photo'),  // Utilisation du middleware spécifique pour l'upload de la photo
  updateStudent
);

// Route pour supprimer un étudiant
router.delete(
  '/:id', 
  protect, 
  authorizeRole('Etablissement'), 
  authorize('delete'), 
  deleteStudent
);

// Route pour récupérer les élèves d'une classe spécifique
router.get(
  '/class/:classId/students', 
  protect, 
  authorizeRole('Etablissement'), 
  authorize('read'), 
  getStudentsByClass
);



// Route pour récupérer les notes d'un élève spécifique
router.get(
  '/:id/notes', 
  protect, 
  authorizeRole('Etablissement'), 
  authorize('read'), 
  getStudentNotes
);


module.exports = router;
