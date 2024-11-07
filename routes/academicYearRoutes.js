

const express = require('express');
const { getAcademicYears, createAcademicYear, toggleActiveAcademicYear, getActiveAcademicYear, deleteAcademicYear } = require('../controllers/academicYearController');
const router = express.Router();

router.get('/', getAcademicYears);  // Endpoint pour récupérer les années académiques
router.post('/', createAcademicYear);  // Endpoint pour créer une nouvelle année académique
router.patch('/:id/toggle-active', toggleActiveAcademicYear);  // Endpoint pour activer une année académique
router.get('/active', getActiveAcademicYear);  // Endpoint pour récupérer l'année académique active
router.delete('/:id', deleteAcademicYear);

module.exports = router;
