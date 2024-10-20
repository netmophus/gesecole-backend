const PedagogicalSubject = require('../models/PedagogicalSubject');
//const PedagogicalSubject = require('../models/PedagogicalSubject');

// Créer une matière pédagogique


const createPedagogicalSubject = async (req, res) => {
  try {
    const { name, level, className, series } = req.body;
    console.log('Requête reçue:', req.body);

    const newSubject = new PedagogicalSubject({
      name,
      level,
      className,
      series: level === 'Lycee' ? series : undefined, // Série uniquement pour le lycée
    });

    await newSubject.save();
    res.status(201).json(newSubject);
  } catch (err) {
    console.error('Erreur lors de la création de la matière pédagogique:', err.message);
    res.status(500).json({ msg: 'Erreur du serveur lors de la création de la matière pédagogique' });
  }
};


// Récupérer toutes les matières pédagogiques par niveau et classe

const getPedagogicalSubjects = async (req, res) => {
  try {
    const { level, className, series } = req.query;
    console.log('Requête reçue:', { level, className, series });

    const query = {};
    if (level) query.level = level;
    if (className) query.className = className;
    if (series) query.series = series;

    console.log('Requête construite:', query);

    const subjects = await PedagogicalSubject.find(query);
    console.log('Matières trouvées:', subjects);

    res.status(200).json(subjects);
  } catch (err) {
    console.error('Erreur lors de la récupération des matières pédagogiques:', err.message);
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};




// Mettre à jour une matière pédagogique spécifique
const updatePedagogicalSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedSubject = await PedagogicalSubject.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedSubject) {
      return res.status(404).json({ msg: 'Matière pédagogique non trouvée' });
    }

    res.status(200).json(updatedSubject);
  } catch (err) {
    console.error('Erreur lors de la mise à jour de la matière pédagogique:', err.message);
    res.status(500).json({ msg: 'Erreur du serveur lors de la mise à jour de la matière pédagogique' });
  }
};

// Supprimer une matière pédagogique spécifique
const deletePedagogicalSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSubject = await PedagogicalSubject.findByIdAndDelete(id);

    if (!deletedSubject) {
      return res.status(404).json({ msg: 'Matière pédagogique non trouvée' });
    }

    res.status(200).json({ msg: 'Matière pédagogique supprimée avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression de la matière pédagogique:', err.message);
    res.status(500).json({ msg: 'Erreur du serveur lors de la suppression de la matière pédagogique' });
  }
};




// Fonction pour récupérer les matières par niveau et/ou classe





const getSubjectsByLevel = async (req, res) => {
  try {
    let { level, className } = req.query;

    console.log('Niveau reçu:', level);
    console.log('Classe reçue:', className);

    const filter = {};

    // Utilisez les valeurs sans accent pour correspondre à la base de données
    if (level) filter.level = level;  
    if (className) filter.className = className;

    console.log('Filtre appliqué:', filter);

    const subjects = await PedagogicalSubject.find(filter);
    console.log('Matières trouvées:', subjects);

    res.status(200).json(subjects);
  } catch (err) {
    console.error('Erreur lors de la récupération des matières:', err.message);
    res.status(500).json({ msg: 'Erreur lors de la récupération des matières' });
  }
};






module.exports = {
  createPedagogicalSubject,
  getPedagogicalSubjects,
  updatePedagogicalSubject,
  deletePedagogicalSubject,
  getSubjectsByLevel
};
