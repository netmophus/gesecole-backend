const express = require('express');
const router = express.Router();
const { protectBEPC } = require('../../middleware/authBEPC'); // Middleware pour protéger les routes BEPC
const inscriptionBEPCController = require('../../controllers/bepc/inscriptionBEPCController'); // Controller que nous allons créer après

// **Route : Inscription d’un candidat BEPC**
router.post('/inscription', protectBEPC, inscriptionBEPCController.createInscription);

// **Route : Mettre à jour le paiement pour une inscription spécifique**
router.put('/inscription/:id/paiement', protectBEPC, inscriptionBEPCController.updatePaiementStatus);

// **Route : Récupérer les inscriptions par numéro de téléphone**
router.get('/inscriptions', protectBEPC, inscriptionBEPCController.getInscriptionsByPhone);

// **Route : Récupérer les résultats BEPC**
router.get('/resultats', protectBEPC, inscriptionBEPCController.getResults);

// **Route : Accéder au tableau de bord BEPC**
router.get('/dashboard', protectBEPC, inscriptionBEPCController.getDashboard);

// **Route : Accéder au tableau de bord Admin BEPC**
router.get('/admin-dashboard', protectBEPC, inscriptionBEPCController.getAdminDashboard);

module.exports = router;
