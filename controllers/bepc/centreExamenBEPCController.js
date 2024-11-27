const CentreExamenBEPC = require('../../models/bepc/CentreExamenBEPC');

// Créer un nouveau centre d'examen
exports.createCentreExamen = async (req, res) => {
  try {
    const { nom, region } = req.body;

    // Vérification des champs obligatoires
    if (!nom || !region) {
      return res.status(400).json({ msg: 'Veuillez fournir tous les champs obligatoires (nom, région).' });
    }

    const newCentre = new CentreExamenBEPC({ nom, region });
    await newCentre.save();

    res.status(201).json(newCentre);
  } catch (error) {
    console.error("Erreur lors de la création du centre d'examen BEPC :", error);
    res.status(500).json({ msg: "Erreur serveur lors de la création du centre d'examen." });
  }
};


// Modifier un centre d'examen
exports.updateCentreExamen = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedCentre = await CentreExamenBEPC.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedCentre) {
      return res.status(404).json({ msg: 'Centre d\'examen non trouvé.' });
    }

    res.status(200).json(updatedCentre);
  } catch (error) {
    console.error('Erreur lors de la modification du centre d\'examen BEPC :', error);
    res.status(500).json({ msg: 'Erreur serveur lors de la modification du centre d\'examen.' });
  }
};

// Supprimer un centre d'examen
exports.deleteCentreExamen = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCentre = await CentreExamenBEPC.findByIdAndDelete(id);

    if (!deletedCentre) {
      return res.status(404).json({ msg: 'Centre d\'examen non trouvé.' });
    }

    res.status(200).json({ msg: 'Centre d\'examen supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression du centre d\'examen BEPC :', error);
    res.status(500).json({ msg: 'Erreur serveur lors de la suppression du centre d\'examen.' });
  }
};

// Récupérer tous les centres d'examen
exports.getAllCentres = async (req, res) => {
  try {
    const { region } = req.query; // Obtenir la région à partir des paramètres de requête
    const query = region ? { region } : {}; // Si la région est fournie, ajouter un filtre
    const centres = await CentreExamenBEPC.find(query);
    res.status(200).json(centres);
  } catch (error) {
    console.error("Erreur lors de la récupération des centres :", error);
    res.status(500).json({ msg: "Erreur lors de la récupération des centres d'examen." });
  }
};
