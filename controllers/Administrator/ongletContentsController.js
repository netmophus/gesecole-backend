const OngletContent = require('../../models/Administrator/OngletContentModel');


// Récupérer les articles pour un onglet spécifique
exports.getOngletContents = async (req, res) => {
  try {
    const ongletId = req.query.ongletId; // Récupérer ongletId depuis la requête

    const contents = await OngletContent.find({ ongletId: ongletId }); // Filtrer les articles par ongletId
    res.json(contents);
  } catch (err) {
    res.status(500).json({ message: 'Erreur du serveur: ' + err.message });
  }
};


// Créer un nouveau contenu pour un onglet
// Création d'un nouveau contenu pour un onglet
exports.createOngletContent = async (req, res) => {
  // Ajout des logs pour vérifier les données reçues
  console.log('Requête reçue avec les données:', req.body);
  console.log('Fichiers reçus:', req.files);
  
  const { titleContent, subtitleContent, bodyContent, imgContent, videoContent, ongletId } = req.body;

  // Vérification que tous les champs obligatoires sont bien présents
  if (!titleContent || !bodyContent || !ongletId) {
    return res.status(400).json({ message: 'Les champs obligatoires doivent être remplis' });
  }

  try {
    const newContent = new OngletContent({
      titleContent,
      subtitleContent,
      bodyContent,
      imgContent: req.file ? req.file.filename : null,  // Ajout du fichier image s'il existe
      videoContent,
      ongletId,
    });

    const savedContent = await newContent.save();
    console.log('Nouveau contenu sauvegardé:', savedContent);
    res.status(201).json(savedContent);
  } catch (err) {
    console.error('Erreur lors de la création:', err);
    res.status(500).json({ message: 'Erreur du serveur: ' + err.message });
  }
};



// Mettre à jour un contenu d'onglet
exports.updateOngletContent = async (req, res) => {
  console.log("Request body:", req.body); // Log body data
  console.log("Uploaded file:", req.file); // Log the uploaded file

  const { titleContent, subtitleContent, bodyContent, videoContent, removeImage, removeVideo } = req.body;

  try {
    let ongletContent = await OngletContent.findById(req.params.id);

    if (!ongletContent) {
      return res.status(404).json({ message: 'Contenu non trouvé' });
    }

    ongletContent.titleContent = titleContent || ongletContent.titleContent;
    ongletContent.subtitleContent = subtitleContent || ongletContent.subtitleContent;
    ongletContent.bodyContent = bodyContent || ongletContent.bodyContent;

    // Gestion de l'image : suppression ou mise à jour
    if (removeImage === 'true') {
      ongletContent.imgContent = null; // Supprimer l'image si l'utilisateur a choisi de la retirer
    } else if (req.file) {
      ongletContent.imgContent = req.file.filename; // Mettre à jour l'image si un nouveau fichier a été téléchargé
    }

    // Gestion de la vidéo : suppression ou mise à jour
    if (removeVideo === 'true') {
      ongletContent.videoContent = null; // Supprimer la vidéo si l'utilisateur a choisi de la retirer
    } else if (videoContent) {
      ongletContent.videoContent = videoContent;
    }

    const updatedContent = await ongletContent.save();
    res.json(updatedContent);
  } catch (err) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour: ' + err.message });
  }
};




// Supprimer un contenu d'onglet
exports.deleteOngletContent = async (req, res) => {
  try {
    console.log('Requête de suppression reçue');
    console.log('ID de l\'article à supprimer:', req.params.id);

    const ongletContent = await OngletContent.findById(req.params.id);

    if (!ongletContent) {
      console.log('Contenu non trouvé avec cet ID:', req.params.id);
      return res.status(404).json({ message: 'Contenu non trouvé' });
    }

    // Utilisation de deleteOne() pour supprimer le document
    await OngletContent.deleteOne({ _id: req.params.id });
    console.log('Contenu supprimé avec succès:', ongletContent);
    res.json({ message: 'Contenu supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression:', err.message);
    res.status(500).json({ message: 'Erreur du serveur: ' + err.message });
  }
};


