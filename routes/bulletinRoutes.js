


// backend/routes/bulletinRoutes.js
const express = require('express');
const academicYearController = require('../controllers/academicYearController');

const { protect } = require('../middleware/authMiddleware');
const {
  createBulletin,
  getBulletins,
  getBulletinById,
  updateBulletin,
  deleteBulletin,
  getBulletinData,
  getClassStatistics,
  getStudentsByClass,
  getBulletinByStudent,
  getBulletinByParentPhone,
 //generateClassPDF,  // La méthode existante pour générer un PDF de classe
  //generateStudentPDF // Nouvelle méthode pour générer un PDF de bulletin pour un élève
} = require('../controllers/bulletinController');

const router = express.Router();

router.route('/')
    .post(protect, createBulletin)
    .get(protect, getBulletins);

router.route('/fetch-data')
    .get(protect, getBulletinData); 

router.route('/class-statistics')
    .get(protect, getClassStatistics);


router.route('/:id')
    .get(protect, getBulletinById)
    .put(protect, updateBulletin)
    .delete(protect, deleteBulletin);

    router.get('/class/:classId', protect, getStudentsByClass);


//===============





// Route pour obtenir l'année académique active
router.get('/academic-year/active', academicYearController.getActiveAcademicYear);


router.get('/student/:studentId', protect, getBulletinByStudent);

router.get('/parent-phone/:phone', protect, getBulletinByParentPhone);

    
module.exports = router;
