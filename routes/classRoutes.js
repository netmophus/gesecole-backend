const express = require('express');
const { createClass, getClasses, updateClass, deleteClass } = require('../controllers/classController');


const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Route pour créer une nouvelle classe
router.post('/', protect, createClass);

// Route pour récupérer les classes avec pagination et recherche
router.get('/', protect, getClasses);

// Route pour mettre à jour une classe
router.put('/:id', protect, updateClass);

// Route pour supprimer une classe
router.delete('/:id', protect, deleteClass);


module.exports = router;



