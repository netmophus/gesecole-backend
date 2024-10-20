const Chapter = require('../models/Chapter');
const Class = require('../models/Class');
// Créer un nouveau chapitre

exports.createChapter = async (req, res) => {
  try {
    console.log('Création de chapitre demandée'); // Log pour confirmer que la requête est reçue
    console.log('Utilisateur connecté:', req.user); // Log pour voir les informations de l'utilisateur connecté

    const { title, class: classId, order } = req.body;
    
    console.log('Données reçues:', { title, classId, order }); // Log des données reçues pour la création

    const newChapter = new Chapter({
      title,
      class: classId,
      order,
    });

    await newChapter.save();
    console.log('Chapitre créé avec succès:', newChapter); // Log du chapitre créé
    res.status(201).json({ msg: 'Chapitre créé avec succès', chapter: newChapter });
  } catch (err) {
    console.error('Erreur lors de la création du chapitre:', err); // Log des erreurs si la création échoue
    res.status(500).json({ msg: 'Erreur lors de la création du chapitre' });
  }
};



// Récupérer tous les chapitres (optionnellement filtrés par classe)
exports.getChapters = async (req, res) => {
  try {
    const chapters = await Chapter.find().populate('class');  // Récupère les chapitres et les classes associées
    console.log("Chapitres récupérés :", chapters);  // Ajoute ce log pour vérifier
    res.status(200).json(chapters);
  } catch (err) {
    console.error("Erreur lors de la récupération des chapitres :", err);
    res.status(500).json({ msg: 'Erreur lors de la récupération des chapitres' });
  }
};


// Mettre à jour un chapitre
exports.updateChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedChapter = await Chapter.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ msg: 'Chapitre mis à jour avec succès', chapter: updatedChapter });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du chapitre:', err);
    res.status(500).json({ msg: 'Erreur lors de la mise à jour du chapitre' });
  }
};

// Supprimer un chapitre
exports.deleteChapter = async (req, res) => {
  try {
    const { id } = req.params;
    await Chapter.findByIdAndDelete(id);
    res.status(200).json({ msg: 'Chapitre supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression du chapitre:', err);
    res.status(500).json({ msg: 'Erreur lors de la suppression du chapitre' });
  }
};



// classController.js

exports.getAllClasses = async (req, res) => {
  try {
    console.log("Requête reçue pour récupérer les classes"); // Log pour voir si la requête arrive

    const classes = await Class.find(); // Récupérer toutes les classes

    if (!classes || classes.length === 0) {
      console.log("Aucune classe trouvée."); // Log si aucune classe n'est trouvée
      return res.status(404).json({ msg: 'Aucune classe trouvée' });
    }

    console.log("Classes récupérées:", classes); // Log pour afficher les classes récupérées

    res.status(200).json(classes);
  } catch (err) {
    console.error("Erreur lors de la récupération des classes:", err); // Log en cas d'erreur
    res.status(500).json({ msg: 'Erreur du serveur lors de la récupération des classes' });
  }
};
