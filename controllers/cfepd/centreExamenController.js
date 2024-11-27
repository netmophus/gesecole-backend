const CentreExamen = require('../../models/cfepd/CentreExamenCFPED');

// Créer un nouveau centre d'examen
exports.createCentreExamen = async (req, res) => {
  try {
    const { nom, region } = req.body;

    if (!nom || !region) {
      return res.status(400).json({ msg: 'Le nom et la région sont obligatoires.' });
    }

    const newCentre = new CentreExamen({ nom, region });
    await newCentre.save();

    res.status(201).json({ msg: 'Centre d\'examen créé avec succès.', centre: newCentre });
  } catch (error) {
    console.error('Erreur lors de la création du centre d\'examen:', error);
    res.status(500).json({ msg: 'Erreur serveur lors de la création du centre.', error: error.message });
  }
};


// Mettre à jour un centre d'examen
exports.updateCentreExamen = async (req, res) => {
  try {
    const { id } = req.params; // Récupération de l'ID depuis les paramètres de la requête
    const { nom, region } = req.body; // Récupération des données du corps de la requête

    console.log("ID reçu pour mise à jour :", id);
    console.log("Données reçues :", req.body);

    // Vérifiez si les champs obligatoires sont fournis
    if (!id) {
      return res.status(400).json({ msg: "L'ID du centre est obligatoire." });
    }
    if (!nom || !region) {
      return res.status(400).json({ msg: "Le nom et la région sont obligatoires." });
    }

    // Mise à jour du centre
    const updatedCentre = await CentreExamen.findByIdAndUpdate(
      id,
      { nom, region },
      { new: true, runValidators: true } // Renvoie le document mis à jour
    );

    // Vérifiez si le centre existe
    if (!updatedCentre) {
      return res.status(404).json({ msg: "Centre d'examen introuvable." });
    }

    res.status(200).json({ msg: "Centre d'examen mis à jour avec succès.", centre: updatedCentre });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du centre d'examen:", error);
    res.status(500).json({ msg: "Erreur serveur lors de la mise à jour du centre.", error: error.message });
  }
};


// Récupérer tous les centres d'examen
exports.getAllCentres = async (req, res) => {
  try {
    const centres = await CentreExamen.find();
    res.status(200).json(centres);
  } catch (error) {
    console.error('Erreur lors de la récupération des centres d\'examen:', error);
    res.status(500).json({ msg: 'Erreur serveur lors de la récupération des centres.', error: error.message });
  }
};

// Récupérer les centres par région
exports.getCentresByRegion = async (req, res) => {
  try {
    const { region } = req.params;

    if (!region) {
      return res.status(400).json({ msg: 'La région est obligatoire.' });
    }

    const centres = await CentreExamen.find({ region });
    res.status(200).json(centres);
  } catch (error) {
    console.error('Erreur lors de la récupération des centres par région:', error);
    res.status(500).json({ msg: 'Erreur serveur lors de la récupération des centres par région.', error: error.message });
  }
};

// Supprimer un centre d'examen
exports.deleteCentreExamen = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCentre = await CentreExamen.findByIdAndDelete(id);
    if (!deletedCentre) {
      return res.status(404).json({ msg: 'Centre d\'examen introuvable.' });
    }

    res.status(200).json({ msg: 'Centre d\'examen supprimé avec succès.', centre: deletedCentre });
  } catch (error) {
    console.error('Erreur lors de la suppression du centre d\'examen:', error);
    res.status(500).json({ msg: 'Erreur serveur lors de la suppression du centre.', error: error.message });
  }
};
