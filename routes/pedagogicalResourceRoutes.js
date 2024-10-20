const express = require('express');
const router = express.Router();
const {
  createResource,
  getAllResources,
  getResourceById,
  updateResource,
  deleteResource
} = require('../controllers/pedagogicalResourceController');
const { protect, authorize, authorizeRole } = require('../middleware/authMiddleware');

// Créer une ressource pédagogique
router.post('/', protect, authorizeRole('Admin'), authorize('create'), createResource);

// Récupérer toutes les ressources pédagogiques
router.get('/', protect, authorize('read'), getAllResources);

// Récupérer une ressource par ID
router.get('/:id', protect, authorize('read'), getResourceById);

// Modifier une ressource pédagogique
router.put('/:id', protect, authorizeRole('Admin'), authorize('update'), updateResource);

// Supprimer une ressource pédagogique
router.delete('/:id', protect, authorizeRole('Admin'), authorize('delete'), deleteResource);

module.exports = router;



