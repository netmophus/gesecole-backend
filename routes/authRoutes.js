const express = require('express');
const {
  loginUser,
  deleteUser,
  getUserProfile,
  getUserById,
  getAllUsers,
  deactivateUser,
  activateUser,
  updateUser,
  teacherLogin,
  selectEstablishment,
  registerUser // Assurez-vous que cette fonction est importée
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();
const multer = require('multer');

// Configuration de multer pour traiter les fichiers
const upload = multer({ dest: 'uploads/' });

// Route pour l'enregistrement d'un utilisateur
router.post('/register', registerUser);

// Route pour la connexion
router.post('/login', loginUser);

// Route pour récupérer le profil utilisateur (protégée par middleware)
router.get('/profile', protect, getUserProfile);

// Route pour obtenir tous les utilisateurs (protégée)
router.get('/users', protect, authorize('read'), getAllUsers);

// Route pour mettre à jour un utilisateur (protégée)
router.put('/:id', protect, authorize('update'), updateUser);

// Route pour désactiver un utilisateur (protégée)
router.patch('/:id/deactivate', protect, authorize('update'), deactivateUser);

// Route pour activer un utilisateur (protégée)
router.patch('/:id/activate', protect, authorize('update'), activateUser);

// Route pour obtenir un utilisateur par ID (protégée)
router.get('/users/:id', protect, authorize('read'), getUserById);

// Route pour supprimer un utilisateur (protégée)
router.delete('/users/:id', protect, authorize('delete'), deleteUser);


// Route pour la connexion des enseignants (pas de protection nécessaire)
router.post('/teacher-login', teacherLogin);

// Route pour sélectionner l'établissement après la connexion (doit être protégée)
router.post('/select-establishment', protect, selectEstablishment);



module.exports = router;
