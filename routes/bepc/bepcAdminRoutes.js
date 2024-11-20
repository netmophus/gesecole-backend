const express = require('express');
const router = express.Router();
const { protectBEPCAdmin, protectBEPC } = require('../../middleware/authBEPC');
const bepcAdminController = require('../../controllers/bepc/bepcAdminController');

// Route pour récupérer la liste des agents avec le rôle 'bepc'
router.get('/agents', protectBEPC, protectBEPCAdmin, bepcAdminController.getAgents);

// Route pour activer/désactiver un agent
router.put('/agents/:id/toggle', protectBEPC, protectBEPCAdmin, bepcAdminController.toggleAgentStatus);

// Route pour générer un rapport complet pour un agent
router.get('/agents/:agentId/report', protectBEPC, protectBEPCAdmin, bepcAdminController.generateAgentReport);

// Route pour générer un rapport filtré pour un agent
router.post(
  '/agents/:id/report/filtered',
  protectBEPC,
  protectBEPCAdmin,
  bepcAdminController.generateFilteredReport
);

// Route pour récupérer les statistiques globales du tableau de bord
router.get('/dashboard', protectBEPCAdmin, bepcAdminController.getDashboard);

// Route pour générer un rapport global des saisies
router.get('/report', protectBEPCAdmin, bepcAdminController.generateReport);

module.exports = router;
