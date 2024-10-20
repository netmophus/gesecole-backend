


const express = require('express');
const { protect,  authorizeRole } = require('../../middleware/authMiddleware');
const { createOngletContent, updateOngletContent, getOngletContents, deleteOngletContent } = require('../../controllers/Administrator/ongletContentsController');
const uploadArticle = require('../../middleware/uploadArticle'); // Utilisation de la configuration spécifique

const router = express.Router();

// Routes pour la gestion des articles
router.post('/', protect, authorizeRole('Admin'), uploadArticle, createOngletContent);
router.put('/:id', protect, authorizeRole('Admin'), uploadArticle, updateOngletContent);
router.get('/', getOngletContents);
router.delete('/:id', protect, authorizeRole('Admin'), deleteOngletContent);

module.exports = router;

