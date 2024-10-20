const AcademicYear = require('../models/AcademicYear');

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
exports.toggleActiveAcademicYear = async (req, res) => {
  try {
    const year = await AcademicYear.findById(req.params.id);

    if (!year) {
      return res.status(404).json({ msg: "Année académique non trouvée" });
    }

    // Si l'année n'est pas déjà active, désactiver toutes les autres avant de l'activer
    if (!year.isActive) {
      await AcademicYear.updateMany({ isActive: true }, { isActive: false });
    }

    // Inverser l'état d'activité de l'année académique
    year.isActive = !year.isActive;
    await year.save();

    res.json({ msg: 'Année académique mise à jour avec succès', year });
  } catch (err) {
    console.error('Erreur lors de la mise à jour de l\'année académique:', err);
    res.status(500).json({ msg: 'Erreur du serveur.' });
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


