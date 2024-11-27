const express = require('express');
const router = express.Router();
const centreExamenBEPCController = require('../../controllers/bepc/centreExamenBEPCController');
const { protectBEPC } = require('../../middleware/authBEPC'); // Middleware pour protéger les routes

// Route pour créer un centre d'examen
router.post('/', protectBEPC, centreExamenBEPCController.createCentreExamen);

// Route pour modifier un centre d'examen
router.put('/:id', protectBEPC, centreExamenBEPCController.updateCentreExamen);

// Route pour supprimer un centre d'examen
router.delete('/:id', protectBEPC, centreExamenBEPCController.deleteCentreExamen);

// Route pour récupérer tous les centres d'examen
router.get('/', protectBEPC, centreExamenBEPCController.getAllCentres);

module.exports = router;
