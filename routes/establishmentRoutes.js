

const express = require('express');
const {configureEstablishment, getEstablishmentById, createEstablishment, checkEstablishmentConfig, getEstablishments } = require('../controllers/establishmentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getEstablishments);

// Route pour créer un nouvel établissement
router.post('/', protect, createEstablishment);

router.get('/:id', getEstablishmentById);

// Route pour vérifier si l'établissement est déjà configuré
router.get('/:id/check-config', protect, checkEstablishmentConfig);

// Route pour configurer l'établissement
router.post('/configure', protect, configureEstablishment);



module.exports = router;
