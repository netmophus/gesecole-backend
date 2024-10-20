

const express = require('express');
const { protect, authorizeRole } = require('../../middleware/authMiddleware');
const { getAllSectionArticles, createSectionArticle, updateSectionArticle, deleteSectionArticle } = require('../../controllers/Administrator/sectionArticlesController');
const upload = require('../../utils/multerConfig');  // Importer la configuration de multer

const router = express.Router();

router.route('/')
  .get(getAllSectionArticles)
  .post(protect, authorizeRole('Admin'), upload.fields([
    { name: 'imgArticle', maxCount: 1 },
    { name: 'videoArticles', maxCount: 3 },
    { name: 'pdfArticles', maxCount: 5 }  // Utilise 'pdfArticles' ici et non 'pdfArticle'
  ]), createSectionArticle);


  router.route('/:id')
  .put(protect, authorizeRole('Admin'), upload.fields([
    { name: 'imgArticle', maxCount: 1 },
    { name: 'videoArticles', maxCount: 3 },
    { name: 'pdfArticles', maxCount: 5 }  // Gérer plusieurs PDF lors de la mise à jour
  ]), updateSectionArticle)
  .delete(protect, authorizeRole('Admin'), deleteSectionArticle);

module.exports = router;
