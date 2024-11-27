

const express = require('express');
const router = express.Router();
const { protectBEPC } = require('../../middleware/authBEPC');
const inscriptionBEPCController = require('../../controllers/bepc/inscriptionBEPCController');
const uploadFilesJointBEPC = require('../../middleware/uploadFilesJointBEPC');

// Route : Inscription d’un candidat BEPC
router.post(
  '/',
  protectBEPC, // Vérifie l'authentification avant tout
  uploadFilesJointBEPC, // Gère les fichiers joints
  inscriptionBEPCController.createInscription // Exécute la logique métier
);

// Route : Récupérer les inscriptions associées à l'utilisateur connecté
router.get('/my-inscriptions', protectBEPC, inscriptionBEPCController.getMyInscriptions);


router.put('/:id', protectBEPC, uploadFilesJointBEPC, inscriptionBEPCController.updateInscription);
router.delete('/:id', protectBEPC, inscriptionBEPCController.deleteInscription);


// Route : Mettre à jour le paiement pour une inscription spécifique
router.put('/inscription/:id/paiement', protectBEPC, inscriptionBEPCController.updatePaiementStatus);



// Route : Accéder au tableau de bord BEPC
router.get('/dashboard', protectBEPC, inscriptionBEPCController.getDashboard);

// Route : Accéder au tableau de bord Admin BEPC
router.get('/admin-dashboard', protectBEPC, inscriptionBEPCController.getAdminDashboard);


// Route pour générer le rapport BEPC
router.get('/inscription/report/inscriptions', protectBEPC, inscriptionBEPCController.generateBEPCReport);




router.get('/all-inscriptions', protectBEPC, inscriptionBEPCController.getAllInscriptions);


router.get('/', protectBEPC, inscriptionBEPCController.getInscriptions);

//Pagination
router.get('/paginated', protectBEPC, inscriptionBEPCController.getPaginatedInscriptions);



// Route pour récupérer une inscription par ID
router.get('/:id', protectBEPC, inscriptionBEPCController.getInscriptionById);


// Route pour régénérer le reçu par référence de paiement
router.get('/recu/:referencePaiement', protectBEPC, inscriptionBEPCController.getRecuByReference);



module.exports = router;
