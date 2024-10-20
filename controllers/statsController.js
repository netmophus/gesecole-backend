const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');

// Obtenir les statistiques des élèves, enseignants et classes
const getEstablishmentStatistics = async (req, res) => {
  try {
    const { establishmentId } = req.params;

    // Calcul des statistiques
    const totalEleves = await Student.countDocuments({ establishmentId });
    const totalEnseignants = await Teacher.countDocuments({ establishmentId });
    //const totalClasses = await Class.countDocuments({ establishmentId });
    const totalClasses = await Class.countDocuments({ establishment: establishmentId });


    // Réponse JSON
    res.status(200).json({
      totalEleves,
      totalEnseignants,
      totalClasses,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
};


module.exports = { getEstablishmentStatistics };
