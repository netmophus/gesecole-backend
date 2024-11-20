const express = require('express');
const router = express.Router();
const { protectCFEPDAdmin, protectCFEPD } = require('../../middleware/authCFEPD');
const cfepdAdminController = require('../../controllers/cfepd/cfepdAdminController');

router.get('/agents', protectCFEPD, protectCFEPDAdmin, cfepdAdminController.getAgents);


router.put('/agents/:id/toggle', protectCFEPD, protectCFEPDAdmin, cfepdAdminController.toggleAgentStatus);

router.get('/agents/:agentId/report', protectCFEPD, protectCFEPDAdmin, cfepdAdminController.generateAgentReport);


router.post(
  '/agents/:id/report/filtered',
  protectCFEPD,
  protectCFEPDAdmin,
  cfepdAdminController.generateFilteredReport
);




// Route pour récupérer les statistiques globales
router.get('/dashboard', protectCFEPDAdmin, cfepdAdminController.getDashboard);

// Route pour générer un rapport des saisies par agent ou région
router.get('/report', protectCFEPDAdmin, cfepdAdminController.generateReport);

module.exports = router;
