// const PedagogicalResource = require('../models/PedagogicalResource');
// const Class = require('../models/Class');
// const Subject = require('../models/Subject');


// exports.createResource = async (req, res) => {
//   try {
//     console.log('Données reçues:', req.body); // Log des données reçues pour le debug

//     const { title, class: classId, subject: subjectId, chapter, resourceType, videoUrl, resourceFiles } = req.body;

//     let filesToSave = [];
//     if (resourceType !== 'VIDEO' && resourceFiles.length > 0) {
//       filesToSave = resourceFiles.map(file => ({
//         url: file.url || '',
//         description: file.description || '',  // Description du fichier PDF
//       }));
//     }

//     const newResource = new PedagogicalResource({
//       title,
//       description: req.body.description,
//       class: classId,
//       subject: subjectId,
//       chapter,
//       resourceType,
//       videoUrl: resourceType === 'VIDEO' ? videoUrl : undefined, // Ajouter l'URL de la vidéo si c'est une vidéo
//       resourceFiles: filesToSave, // Ajouter les fichiers si ce n'est pas une vidéo
//       createdBy: req.user._id,
//     });

//     await newResource.save();

//     res.status(201).json({ msg: 'Ressource pédagogique créée avec succès', resource: newResource });
//   } catch (err) {
//     console.error('Erreur lors de la création de la ressource pédagogique:', err);
//     res.status(500).json({ msg: 'Erreur du serveur lors de la création de la ressource' });
//   }
// };

// // Obtenir les ressources pédagogiques par classe
// exports.getResourcesByClass = async (req, res) => {
//   try {
//     const { classId } = req.params;
//     const { series } = req.query;

//     const query = { class: classId };
//     if (series) query.series = series;

//     const resources = await PedagogicalResource.find(query).populate('subject', 'name');

//     if (resources.length === 0) {
//       return res.status(404).json({ msg: 'Aucune ressource trouvée pour cette classe' });
//     }

//     res.status(200).json(resources);
//   } catch (err) {
//     console.error('Erreur lors de la récupération des ressources pédagogiques:', err.message);
//     res.status(500).json({ msg: 'Erreur du serveur lors de la récupération des ressources' });
//   }
// };
// // Mettre à jour une ressource pédagogique
// exports.updateResource = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, description, classId, subjectId, series, resourceType, fileUrl } = req.body;

//     const updatedResource = await PedagogicalResource.findByIdAndUpdate(
//       id,
//       {
//         title,
//         description,
//         class: classId,
//         subject: subjectId,
//         series,
//         resourceType,
//         fileUrl,
//       },
//       { new: true }
//     );

//     if (!updatedResource) {
//       return res.status(404).json({ msg: 'Ressource pédagogique non trouvée' });
//     }

//     res.status(200).json({ msg: 'Ressource mise à jour avec succès', resource: updatedResource });
//   } catch (err) {
//     console.error('Erreur lors de la mise à jour de la ressource pédagogique:', err.message);
//     res.status(500).json({ msg: 'Erreur du serveur lors de la mise à jour de la ressource' });
//   }
// };

// // Supprimer une ressource pédagogique
// exports.deleteResource = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const deletedResource = await PedagogicalResource.findByIdAndDelete(id);

//     if (!deletedResource) {
//       return res.status(404).json({ msg: 'Ressource pédagogique non trouvée' });
//     }

//     res.status(200).json({ msg: 'Ressource supprimée avec succès' });
//   } catch (err) {
//     console.error('Erreur lors de la suppression de la ressource pédagogique:', err.message);
//     res.status(500).json({ msg: 'Erreur du serveur lors de la suppression de la ressource' });
//   }
// };


// // Obtenir toutes les classes
// exports.getAllClasses = async (req, res) => {
//   try {
//     console.log('Début de la récupération des classes'); // Log avant le début de l'opération
//     const classes = await Class.find();
    
//     // Log des classes récupérées
//     console.log('Classes récupérées:', classes);
    
//     res.status(200).json(classes);
//   } catch (err) {
//     // Log de l'erreur si quelque chose ne va pas
//     console.error('Erreur lors de la récupération des classes:', err);
    
//     res.status(500).json({ msg: 'Erreur du serveur lors de la récupération des classes' });
//   }
// };

// // Obtenir toutes les matières (subjects)
// exports.getAllSubjects = async (req, res) => {
//   try {
//     console.log('Début de la récupération des matières'); // Log avant le début de l'opération
//     const subjects = await Subject.find();
    
//     // Log des matières récupérées
//     console.log('Matières récupérées:', subjects);
    
//     res.status(200).json(subjects);
//   } catch (err) {
//     // Log de l'erreur si quelque chose ne va pas
//     console.error('Erreur lors de la récupération des matières:', err);
    
//     res.status(500).json({ msg: 'Erreur du serveur lors de la récupération des matières' });
//   }
// };



// // // Fonction pour obtenir toutes les ressources pédagogiques
// // exports.getAllResources = async (req, res) => {
// //   try {
// //     console.log("Requête reçue pour récupérer toutes les ressources pédagogiques"); // Log de la requête
// //     const resources = await PedagogicalResource.find().populate('class').populate('subject');
    
// //     if (!resources || resources.length === 0) {
// //       console.log("Aucune ressource trouvée."); // Log si aucune ressource
// //       return res.status(404).json({ msg: 'Aucune ressource pédagogique trouvée' });
// //     }

// //     console.log("Ressources pédagogiques récupérées:", resources); // Log pour afficher les ressources
// //     res.status(200).json(resources);
// //   } catch (err) {
// //     console.error("Erreur lors de la récupération des ressources pédagogiques:", err.message); // Log en cas d'erreur
// //     res.status(500).json({ msg: 'Erreur du serveur lors de la récupération des ressources pédagogiques' });
// //   }
// // };

// exports.getAllResources = async (req, res) => {
//   console.log('Requête reçue pour récupérer les ressources pédagogiques');
//   try {
//     // Log pour la recherche
//     console.log('Requête paramètres:', req.query);

//     // Récupération des ressources pédagogiques
//     const resources = await PedagogicalResource.find()
//     .populate('class', 'name level')
//     .populate('subject', 'name level')
//     .populate('chapter', 'title');  // Assure-toi que le chapitre est bien récupéré
  
//     if (!resources || resources.length === 0) {
//       console.log("Aucune ressource trouvée.");
//       return res.status(404).json({ msg: 'Aucune ressource pédagogique trouvée' });
//     }

//     res.status(200).json(resources);
//   } catch (err) {
//     console.error('Erreur lors de la récupération des ressources:', err);
//     res.status(500).json({ msg: 'Erreur serveur lors de la récupération des ressources pédagogiques' });
//   }
// };







const PedagogicalResource = require('../models/PedagogicalResource');

exports.createResource = async (req, res) => {
  try {
    const { level, series, class: className, subject, chapter, resources } = req.body;

    // Vérification des champs obligatoires
    if (!level || !className || !subject || !chapter || !chapter.number || !chapter.title) {
      return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis.' });
    }

    // Si niveau est 'lycee', la série est obligatoire
    if (level === 'Lycee' && !series) {
      return res.status(400).json({ error: 'La série est obligatoire pour le lycée.' });
    }

    // Vérification du format des ressources
    const validResources = resources.every((resource) =>
      resource.type === 'video' ? resource.link && resource.description : 
      resource.type === 'pdf' ? resource.file && resource.description : false
    );

    if (!validResources) {
      return res.status(400).json({ error: 'Les ressources doivent avoir un format valide.' });
    }

    // Création de la ressource pédagogique
    const resource = new PedagogicalResource({
      ...req.body,
      createdBy: req.user._id, // Associe l'utilisateur créateur
    });

    await resource.save();
    res.status(201).json(resource);
  } catch (error) {
    console.error('Erreur lors de la création de la ressource:', error.message);
    res.status(500).json({ error: 'Erreur du serveur lors de la création de la ressource.' });
  }
};


// Récupérer toutes les ressources
exports.getAllResources = async (req, res) => {
  try {
    const resources = await PedagogicalResource.find();
    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupérer une ressource par ID
exports.getResourceById = async (req, res) => {
  try {
    const resource = await PedagogicalResource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ msg: 'Ressource non trouvée' });
    }
    res.status(200).json(resource);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Modifier une ressource pédagogique
exports.updateResource = async (req, res) => {
  try {
    const resource = await PedagogicalResource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!resource) {
      return res.status(404).json({ msg: 'Ressource non trouvée' });
    }
    res.status(200).json(resource);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Supprimer une ressource pédagogique
exports.deleteResource = async (req, res) => {
  try {
    const resource = await PedagogicalResource.findByIdAndDelete(req.params.id);
    if (!resource) {
      return res.status(404).json({ msg: 'Ressource non trouvée' });
    }
    res.status(200).json({ msg: 'Ressource supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
