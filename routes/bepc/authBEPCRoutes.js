const express = require('express');
const router = express.Router();
const { loginBEPC, registerBEPC, logoutBEPC, getProfileBEPC } = require('../../controllers/bepc/authBEPCController'); // Contrôleurs à créer
const { protectBEPC } = require('../../middleware/authBEPC'); // Middleware spécifique

// **Route pour l'inscription des utilisateurs BEPC**
router.post('/register', registerBEPC);

// **Route pour la connexion des utilisateurs BEPC**
router.post('/login', loginBEPC);

// **Route pour la déconnexion des utilisateurs BEPC**
router.post('/logout', protectBEPC, logoutBEPC);

// router.get('/profile', protectBEPC, getProfileBEPC);


module.exports = router;
