const express = require('express');
const { getEstablishmentStatistics } = require('../controllers/statsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Route pour obtenir les statistiques d'un établissement
router.get('/:establishmentId', protect, getEstablishmentStatistics);

module.exports = router;
