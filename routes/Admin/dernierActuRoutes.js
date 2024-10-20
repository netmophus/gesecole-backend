const express = require('express');
const { 
  getAllArticles, 
  createDernierActuArticle, 
  getArticleById, 
  updateArticle, 
  deleteArticle 
} = require('../../controllers/Admin/dernierActuController');
const { protect, authorize } = require('../../middleware/authMiddleware');

const router = express.Router();

// Route pour obtenir tous les articles
router.get('/', protect, authorize('Admin'), getAllArticles);

// Route pour créer un nouvel article
router.post('/', protect, authorize('Admin'), createDernierActuArticle);

// Route pour obtenir un article par ID
router.get('/:id', protect, authorize('Admin'), getArticleById);

// Route pour mettre à jour un article
router.put('/:id', protect, authorize('Admin'), updateArticle);

// Route pour supprimer un article
router.delete('/:id', protect, authorize('Admin'), deleteArticle);

module.exports = router;

