// // **Route : Inscription d’un candidat CFEPD avec fichiers joints**
// router.post('/', uploadFilesJointCFEPD, inscriptionCFEPDController.createInscription);

// // **Route : Inscription d’un candidat CFEPD avec protection**
// router.post('/', protectCFEPD, upload.any(), inscriptionCFEPDController.createInscription);

// // **Route : Mettre à jour le paiement pour une inscription spécifique**
// router.put('/inscription/:id/paiement', protectCFEPD, inscriptionCFEPDController.updatePaiementStatus);

// // **Route : Récupérer les inscriptions par numéro de téléphone**
// router.get('/inscriptions', protectCFEPD, inscriptionCFEPDController.getInscriptionsByPhone);

// // **Route : Récupérer les résultats CFEPD**
// router.get('/resultats', protectCFEPD, inscriptionCFEPDController.getResults);

// // **Route : Accéder au tableau de bord CFEPD**
// router.get('/dashboard', protectCFEPD, inscriptionCFEPDController.getDashboard);

// // **Route : Accéder au tableau de bord Admin CFEPD**
// router.get('/admin-dashboard', protectCFEPD, inscriptionCFEPDController.getAdminDashboard);

// // **Route : Générer le rapport PDF des inscriptions payées**
// router.get('/report/inscriptions', protectCFEPD, inscriptionCFEPDController.generateReport);

// // Route pour récupérer les informations de l'élève par matricule
// router.get('/inscription/:matricule', protectCFEPD, inscriptionCFEPDController.getInscriptionByMatricule);










const express = require('express');
const router = express.Router();
const { protectCFEPD } = require('../../middleware/authCFEPD'); // Middleware pour protéger les routes CFEPD
const inscriptionCFEPDController = require('../../controllers/cfepd/inscriptionCFEPDController'); // Controller CFEPD
const multer = require('multer');
const upload = multer(); // Configuration simple pour recevoir les données `FormData`
const uploadFilesJointCFEPD = require('../../middleware/uploadFilesJointCFEPD');



// **Routes d'inscription**
router.post('/', protectCFEPD, uploadFilesJointCFEPD, inscriptionCFEPDController.createInscription);
router.put('/inscription/:id/paiement', protectCFEPD, inscriptionCFEPDController.updatePaiementStatus);

// Route pour récupérer uniquement les inscriptions de l'utilisateur connecté
router.get('/inscriptions/mine', protectCFEPD, inscriptionCFEPDController.getInscriptionsByUser);


// **Routes pour modification et suppression**
router.put('/:id', protectCFEPD, uploadFilesJointCFEPD, inscriptionCFEPDController.updateInscription); // Modification d'une inscription
router.delete('/:id', protectCFEPD, inscriptionCFEPDController.deleteInscription); // Suppression d'une inscription



// **Routes de récupération d'informations**
router.get('/inscriptions', protectCFEPD, inscriptionCFEPDController.getInscriptionsByPhone);
router.get('/inscription/:matricule', protectCFEPD, inscriptionCFEPDController.getInscriptionByMatricule);

// **Routes administratives**
router.get('/resultats', protectCFEPD, inscriptionCFEPDController.getResults);
router.get('/dashboard', protectCFEPD, inscriptionCFEPDController.getDashboard);
router.get('/admin-dashboard', protectCFEPD, inscriptionCFEPDController.getAdminDashboard);

// **Routes pour les rapports**
router.get('/report/inscriptions', protectCFEPD, inscriptionCFEPDController.generateReport);

router.get('/', protectCFEPD, inscriptionCFEPDController.getAllInscriptions);

// **Route pour récupérer une inscription par ID**
router.get('/:id', protectCFEPD, inscriptionCFEPDController.getInscriptionById);


// Route pour régénérer le reçu par ID
router.get('/recu/:referencePaiement', protectCFEPD, inscriptionCFEPDController.getRecuByReference);

module.exports = router;
