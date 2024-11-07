const express = require('express');
const router = express.Router();
const { loginCFEPD, registerCFEPD, logoutCFEPD, getProfileCFEPD } = require('../../controllers/cfepd/authCFEPDController'); // Contrôleurs CFEPD à créer
const { protectCFEPD } = require('../../middleware/authCFEPD'); // Middleware spécifique CFEPD

// **Route pour l'inscription des utilisateurs CFEPD**
router.post('/register', registerCFEPD);

// **Route pour la connexion des utilisateurs CFEPD**
router.post('/login', loginCFEPD);

// **Route pour la déconnexion des utilisateurs CFEPD**
router.post('/logout', protectCFEPD, logoutCFEPD);

// **Route pour obtenir le profil de l'utilisateur CFEPD**
// router.get('/profile', protectCFEPD, getProfileCFEPD);

module.exports = router;
