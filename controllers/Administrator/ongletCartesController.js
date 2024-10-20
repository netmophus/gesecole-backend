const OngletCarte = require('../../models/Administrator/OngletCarteModel');
//const upload = require('../../middleware/upload'); // Importer la configuration Multer

// Obtenir tous les onglets des activités hebdomadaires
exports.getAllOnglets = async (req, res) => {
  try {
    const onglets = await OngletCarte.find();
    res.json(onglets);
  } catch (err) {
    res.status(500).json({ message: 'Erreur du serveur: ' + err.message });
  }
};

// Créer un nouvel onglet
exports.createOnglet = (req, res) => {
  console.log('Requête reçue pour la création d\'un onglet');
  console.log('Données reçues:', req.body); // Afficher les données envoyées par le client
  console.log('Fichiers reçus:', req.files); // Afficher les fichiers uploadés

  const { titleOnglet, bodyOnglet, btnOnglet, videoOnglet } = req.body; // Assurez-vous que videoOnglet est récupéré du body

  // Vérifiez que les champs obligatoires sont bien remplis
  if (!titleOnglet || !bodyOnglet || !btnOnglet) {
    return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis' });
  }

  // Gestion des fichiers pour les images
  const imgOnglet = req.files && req.files['imgOnglet'] ? req.files['imgOnglet'][0].path : null;

  // Utilisez directement videoOnglet pour les vidéos sous forme d'URL
  const newOnglet = new OngletCarte({
    titleOnglet,
    bodyOnglet,
    imgOnglet,
    videoOnglet, // Assurez-vous de bien stocker l'URL de la vidéo
    btnOnglet,
  });

  newOnglet.save()
    .then((savedOnglet) => {
      console.log('Onglet créé avec succès:', savedOnglet); // Log pour vérifier que l'onglet est bien créé
      res.status(201).json(savedOnglet);
    })
    .catch((err) => {
      console.error('Erreur lors de la création de l\'onglet:', err);
      res.status(500).json({ message: 'Erreur lors de la création de l\'onglet' });
    });
};


// Mise à jour d'un onglet
exports.updateOnglet = async (req, res) => {
  console.log('Requête reçue pour la mise à jour d\'un onglet');
  console.log('Données reçues:', req.body);
  console.log('Fichiers reçus:', req.files);

  const { titleOnglet, bodyOnglet, btnOnglet, videoOnglet } = req.body;

  try {
    let onglet = await OngletCarte.findById(req.params.id);

    if (!onglet) {
      return res.status(404).json({ message: 'Onglet non trouvé' });
    }

    // Mise à jour des champs textuels
    onglet.titleOnglet = titleOnglet || onglet.titleOnglet;
    onglet.bodyOnglet = bodyOnglet || onglet.bodyOnglet;
    onglet.btnOnglet = btnOnglet || onglet.btnOnglet;

    // Gestion de l'image (si un fichier image est envoyé)
    if (req.files['imgOnglet']) {
      onglet.imgOnglet = req.files['imgOnglet'][0].path;
      console.log('Image mise à jour:', onglet.imgOnglet);
      // Si une image est ajoutée, on supprime la vidéo
      onglet.videoOnglet = null;
    }

    // Gestion de la vidéo (URL reçue dans req.body)
    if (videoOnglet) {
      onglet.videoOnglet = videoOnglet;
      console.log('Vidéo mise à jour:', onglet.videoOnglet);
      // Si une vidéo est ajoutée, on supprime l'image
      onglet.imgOnglet = null;
    }

    const updatedOnglet = await onglet.save();
    console.log('Onglet mis à jour:', updatedOnglet);
    res.json(updatedOnglet);
  } catch (err) {
    console.error('Erreur lors de la mise à jour:', err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour: ' + err.message });
  }
};




// Supprimer un onglet
exports.deleteOnglet = async (req, res) => {
  try {
    console.log('ID reçu pour suppression:', req.params.id); // Log de l'ID reçu

    const onglet = await OngletCarte.findById(req.params.id);

    if (!onglet) {
      console.log('Onglet non trouvé'); // Log si l'onglet n'est pas trouvé
      return res.status(404).json({ message: 'Onglet non trouvé' });
    }

    await OngletCarte.findByIdAndDelete(req.params.id); // Utilisation de findByIdAndDelete

    console.log('Onglet supprimé avec succès'); // Log après suppression
    res.status(200).json({ message: 'Onglet supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression de l\'onglet:', err.message); // Log l'erreur détaillée
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'onglet' });
  }
};

