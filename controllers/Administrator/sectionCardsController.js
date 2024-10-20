const SectionCard = require('../../models/Administrator/SectionCardModel');

// Obtenir toutes les cartes des sections
exports.getAllSectionCards = async (req, res) => {
  try {
    const sectionCards = await SectionCard.find();
    res.json(sectionCards);
  } catch (err) {
    res.status(500).json({ message: 'Erreur du serveur: ' + err.message });
  }
};

// Créer une nouvelle carte de section
exports.createSectionCard = async (req, res) => {
  const { titleCard, bodyCard, btnCard, titlePage } = req.body;

  // Vérifier que tous les champs requis sont présents
  if (!titleCard || !bodyCard || !btnCard || !titlePage) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }


  // Limiter le texte de bodyCard à 670 caractères
  const truncatedBodyCard = bodyCard && bodyCard.length > 100 
  ? bodyCard.substring(0, 100) + '...' 
  : bodyCard;


  // Log pour vérifier la troncature
  console.log("Longueur du bodyCard original :", bodyCard.length);
  console.log("Longueur du bodyCard tronqué :", truncatedBodyCard.length);

  const newSectionCard = new SectionCard({
    titleCard,
    bodyCard: truncatedBodyCard, // Utiliser la version tronquée
    btnCard,
    titlePage, // Ajouter le titre de la page ici
  });

  try {
    const savedCard = await newSectionCard.save();
    console.log("Carte enregistrée :", savedCard);
    res.status(201).json(savedCard);
  } catch (err) {
    console.log("Erreur lors de la création :", err.message);
    res.status(400).json({ message: 'Erreur lors de la création: ' + err.message });
  }
};



// Mettre à jour une carte de section
// exports.updateSectionCard = async (req, res) => {
//   const { titleCard, bodyCard, btnCard } = req.body;

//   try {
//     let sectionCard = await SectionCard.findById(req.params.id);

//     if (!sectionCard) {
//       return res.status(404).json({ message: 'Carte non trouvée' });
//     }

//     sectionCard.titleCard = titleCard || sectionCard.titleCard;
//     sectionCard.bodyCard = bodyCard || sectionCard.bodyCard;
//     sectionCard.btnCard = btnCard || sectionCard.btnCard;

//     const updatedCard = await sectionCard.save();
//     res.json(updatedCard);
//   } catch (err) {
//     res.status(400).json({ message: 'Erreur lors de la mise à jour: ' + err.message });
//   }
// };

exports.updateSectionCard = async (req, res) => {
  const { titleCard, bodyCard, btnCard, titlePage } = req.body;

  try {
    let sectionCard = await SectionCard.findById(req.params.id);

    if (!sectionCard) {
      return res.status(404).json({ message: 'Carte non trouvée' });
    }

    // Vérifier si le titre de la page est mis à jour et s'il existe déjà un autre document avec ce titre
    if (titlePage && titlePage !== sectionCard.titlePage) {
      const existingCard = await SectionCard.findOne({ titlePage });
      if (existingCard) {
        return res.status(400).json({ message: 'Ce titre de page existe déjà, il doit être unique.' });
      }
      sectionCard.titlePage = titlePage; // Mettre à jour le titre de la page
    }

    sectionCard.titleCard = titleCard || sectionCard.titleCard;
    sectionCard.bodyCard = bodyCard || sectionCard.bodyCard;
    sectionCard.btnCard = btnCard || sectionCard.btnCard;

    const updatedCard = await sectionCard.save();
    res.json(updatedCard);
  } catch (err) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour: ' + err.message });
  }
};

// Fonction pour supprimer une carte
exports.deleteSectionCard = async (req, res) => {
  try {
    const card = await SectionCard.findByIdAndDelete(req.params.id);
    
    if (!card) {
      return res.status(404).json({ msg: 'Carte non trouvée' });
    }

    res.json({ msg: 'Carte supprimée avec succès' });
  } catch (error) {
    console.error(error.message); // Afficher les détails de l'erreur côté serveur
    res.status(500).json({ msg: 'Erreur serveur lors de la suppression de la carte' });
  }
};


// Ajouter la fonction pour récupérer une carte par ID
exports.getSectionCardById = async (req, res) => {
  try {
    const card = await SectionCard.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ msg: 'Carte non trouvée' });
    }
    res.json(card);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur serveur' });
  }
};