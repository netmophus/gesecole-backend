const express = require('express');
const router = express.Router();
const centreExamenController = require('../../controllers/cfepd/centreExamenController');
const { protectCFEPD, protectCFEPDAdmin } = require('../../middleware/authCFEPD');

// Routes publiques (lecture seule)
router.get('/', centreExamenController.getAllCentres); // Récupérer tous les centres
router.get('/:region', centreExamenController.getCentresByRegion); // Récupérer les centres d'une région

// Routes protégées (ajout/suppression/mise à jour)
router.post('/', protectCFEPD, protectCFEPDAdmin, centreExamenController.createCentreExamen); // Créer un centre
router.put('/:id', protectCFEPD, protectCFEPDAdmin, centreExamenController.updateCentreExamen); // Mettre à jour un centre
router.delete('/:id', protectCFEPD, protectCFEPDAdmin, centreExamenController.deleteCentreExamen); // Supprimer un centre

module.exports = router;

