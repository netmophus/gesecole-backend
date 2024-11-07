const AcademicYear = require('../models/AcademicYear');
const Establishment = require('../models/Establishment');


// Récupérer toutes les années académiques
exports.getAcademicYears = async (req, res) => {
  try {
    const years = await AcademicYear.find();
    res.status(200).json(years);  // Renvoie toutes les années académiques
  } catch (err) {
    console.error('Erreur lors de la récupération des années académiques:', err);
    res.status(500).json({ msg: 'Erreur lors de la récupération des années académiques.' });
  }
};

// Créer une nouvelle année académique et désactiver les précédentes si nécessaire
exports.createAcademicYear = async (req, res) => {
  try {
    const { year, isActive } = req.body;

    // Sépare l'année en deux parties: startYear et endYear
    const [startYear, endYear] = year.split('-').map(Number);

    if (!startYear || !endYear) {
      return res.status(400).json({ msg: "L'année académique doit être au format 'YYYY-YYYY'." });
    }

    // Si une année est active, désactiver les autres années actives
    if (isActive) {
      await AcademicYear.updateMany({ isActive: true }, { isActive: false });
    }

    // Créer la nouvelle année académique
    const newYear = new AcademicYear({ startYear, endYear, isActive });
    await newYear.save();

    res.status(201).json(newYear);
  } catch (err) {
    console.error('Erreur lors de la création de l\'année académique:', err);
    res.status(500).json({ msg: 'Erreur lors de la création de l\'année académique.' });
  }
};

// Activer ou désactiver une année académique spécifique
// exports.toggleActiveAcademicYear = async (req, res) => {
//   try {
//     const year = await AcademicYear.findById(req.params.id);

//     if (!year) {
//       return res.status(404).json({ msg: "Année académique non trouvée" });
//     }

//     // Si l'année n'est pas déjà active, désactiver toutes les autres avant de l'activer
//     if (!year.isActive) {
//       await AcademicYear.updateMany({ isActive: true }, { isActive: false });
//     }

//     // Inverser l'état d'activité de l'année académique
//     year.isActive = !year.isActive;
//     await year.save();

//     res.json({ msg: 'Année académique mise à jour avec succès', year });
//   } catch (err) {
//     console.error('Erreur lors de la mise à jour de l\'année académique:', err);
//     res.status(500).json({ msg: 'Erreur du serveur.' });
//   }
// };

exports.toggleActiveAcademicYear = async (req, res) => {
  try {
    const year = await AcademicYear.findById(req.params.id);

    if (!year) {
      return res.status(404).json({ msg: "Année académique non trouvée." });
    }

    // Date actuelle
    const currentDate = new Date();
    const startAcademicDate = new Date(year.startYear, 8, 1); // 1er septembre de l'année de début
    const endAcademicDate = new Date(year.endYear, 5, 30); // 30 juin de l'année de fin

    // Empêcher l'activation d'une année académique qui est déjà passée
    if (!year.isActive && currentDate > endAcademicDate) {
      return res.status(400).json({ msg: "Impossible d'activer une année académique qui est déjà passée. Veuillez vérifier l'année académique sélectionnée." });
    }

    // Empêcher la désactivation d'une année académique en cours
    if (year.isActive && currentDate >= startAcademicDate && currentDate <= endAcademicDate) {
      return res.status(400).json({ msg: "Impossible de désactiver une année académique en cours avant sa fin prévue." });
    }

    // Inverser l'état d'activité de l'année académique
    year.isActive = !year.isActive;
    await year.save();

    res.json({ msg: 'Année académique mise à jour avec succès', year });
  } catch (err) {
    console.error('Erreur lors de la mise à jour de l\'année académique:', err);
    res.status(500).json({ msg: 'Erreur du serveur lors de la mise à jour de l\'année académique.' });
  }
};



// Récupérer l'année académique active


exports.getActiveAcademicYear = async (req, res) => {
  try {
    const activeYear = await AcademicYear.findOne({ isActive: true });

    if (!activeYear) {
      return res.status(404).json({ msg: "Aucune année académique active trouvée." });
    }

    res.status(200).json(activeYear);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'année académique active:", error.message);
    res.status(500).json({ msg: "Erreur serveur lors de la récupération de l'année académique active." });
  }
};


// Supprimer une année académique// Supprimer une année académique
exports.deleteAcademicYear = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si l'année académique est utilisée et active dans un établissement
    const isUsedInEstablishments = await Establishment.findOne({
      'academicYears.yearId': id,
      'academicYears.isActive': true
    });

    if (isUsedInEstablishments) {
      return res.status(400).json({ msg: "Impossible de supprimer l'année académique car elle est active dans un établissement." });
    }

    // Si l'année n'est pas active dans un établissement, procéder à la suppression
    const deletedYear = await AcademicYear.findByIdAndDelete(id);

    if (!deletedYear) {
      return res.status(404).json({ msg: "Année académique non trouvée" });
    }

    res.status(200).json({ msg: 'Année académique supprimée avec succès', deletedYear });
  } catch (err) {
    console.error('Erreur lors de la suppression de l\'année académique:', err);
    res.status(500).json({ msg: 'Erreur du serveur lors de la suppression de l\'année académique.' });
  }
};



