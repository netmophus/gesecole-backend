


const express = require('express');
const { protect, authorizeRole } = require('../../middleware/authMiddleware');
const { 
  getAllSectionCards, 
  getSectionCardById, 
  createSectionCard, 
  updateSectionCard, 
  deleteSectionCard 
} = require('../../controllers/Administrator/sectionCardsController');

const router = express.Router();

// Routes for section cards
router.route('/')
  .get(getAllSectionCards) // Open to everyone
  .post(protect, authorizeRole('Admin'), createSectionCard); // Only accessible to admins

router.route('/:id')
  .get(getSectionCardById) // Open to everyone
  .put(protect, authorizeRole('Admin'), updateSectionCard) // Only accessible to admins
  .delete(protect, authorizeRole('Admin'), deleteSectionCard); // Only accessible to admins

module.exports = router;
