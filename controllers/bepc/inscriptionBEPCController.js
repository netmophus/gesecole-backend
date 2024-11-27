const InscriptionBEPC = require('../../models/bepc/InscriptionBEPC'); // Modèle d'inscription BEPC
const User = require('../../models/User'); // Modèle utilisateur
const PDFDocument = require('pdfkit');
const mongoose = require('mongoose'); // Assurez-vous d'importer mongoose

// **Créer une inscription BEPC**


exports.createInscription = async (req, res) => {
  console.log("Données reçues dans req.body:", req.body);
  console.log("Fichiers reçus:", req.files);

  try {
    const {
      prenom,
      nom,
      dateNaissance,
      lieuNaissance,
      nationalite,
      autreNationalite,
      typeEnseignement,
      regionEtablissement,
      nomEtablissement,
      centreExamen,
      matricule,
      jury,
      numeroTable,
      typeCandidat,
    } = req.body;

    // Calculer le montant en fonction du type de candidat
    const montantPaiement =
      typeCandidat === "Ecole publique"
        ? 5000
        : typeCandidat === "Ecole privée"
        ? 5500
        : typeCandidat === "Candidat libre national"
        ? 7500
        : typeCandidat === "Candidat libre étranger"
        ? 25000
        : 0;

    if (montantPaiement === 0) {
      return res.status(400).json({ msg: "Type de candidat invalide." });
    }

 

    // Générer une référence de paiement unique
    const timestamp = Date.now();
    const initiales = `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
    const referencePaiement = `REF-${initiales}-${timestamp}`;

    // Construire les documents (s'il y a des fichiers)
    const documents = {};
    if (req.files) {
      documents.photoIdentite = req.files.photoIdentite?.[0]?.path || "";
      documents.acteNaissance = req.files.acteNaissance?.[0]?.path || "";
      documents.certificatNationalite = req.files.certificatNationalite?.[0]?.path || "";
    }

    // Créer l'inscription
    const newInscription = new InscriptionBEPC({
      prenom,
      nom,
      dateNaissance,
      lieuNaissance,
      nationalite,
      autreNationalite: nationalite === "Autre" ? autreNationalite : null,
      typeEnseignement,
      regionEtablissement,
      nomEtablissement,
      centreExamen,
      matricule,
      jury,
      numeroTable,
      typeCandidat,
      montantPaiement,
      referencePaiement,
      documents,
      agentId: req.user._id, // ID de l'utilisateur connecté
    });

    await newInscription.save();

    // Récupérer les informations complètes pour la réponse
    const populatedInscription = await InscriptionBEPC.findById(newInscription._id).populate(
      "agentId",
      "name email"
    );

    res.status(201).json(populatedInscription);
  } catch (error) {
    console.error("Erreur lors de la création de l'inscription BEPC:", error);

    if (error.code === 11000 && error.keyPattern?.matricule) {
      return res
        .status(409)
        .json({ msg: "Le matricule existe déjà. Veuillez vérifier vos informations." });
    }

    res.status(400).json({ msg: "Erreur lors de la validation des champs requis.", errors: error.errors });
  }
};



exports.updateInscription = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      prenom,
      nom,
      dateNaissance,
      lieuNaissance,
      nationalite,
      autreNationalite,
      typeEnseignement,
      regionEtablissement,
      nomEtablissement,
      centreExamen,
      matricule,
      jury,
      numeroTable,
      typeCandidat,
      montantPaiement,
    } = req.body;

    // Récupérer l'inscription existante
    const existingInscription = await InscriptionBEPC.findById(id);

    if (!existingInscription) {
      return res.status(404).json({ msg: "Inscription non trouvée." });
    }

    // Gestion des documents joints
    const documents = { ...existingInscription.documents };
    if (req.files) {
      documents.photoIdentite =
        req.files.photoIdentite?.[0]?.path || documents.photoIdentite;
      documents.acteNaissance =
        req.files.acteNaissance?.[0]?.path || documents.acteNaissance;
      documents.certificatNationalite =
        req.files.certificatNationalite?.[0]?.path || documents.certificatNationalite;
    }

    // Mise à jour de l'inscription
    const updatedInscription = await InscriptionBEPC.findByIdAndUpdate(
      id,
      {
        prenom,
        nom,
        dateNaissance,
        lieuNaissance,
        nationalite,
        autreNationalite: nationalite === "Autre" ? autreNationalite : null,
        typeEnseignement,
        regionEtablissement,
        nomEtablissement,
        centreExamen,
        matricule,
        jury,
        numeroTable,
        typeCandidat,
        montantPaiement,
        documents,
      },
      { new: true }
    );

    res.status(200).json(updatedInscription);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'inscription :", error);
    res.status(500).json({ msg: "Erreur serveur lors de la mise à jour de l'inscription." });
  }
};


exports.deleteInscription = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedInscription = await InscriptionBEPC.findByIdAndDelete(id);

    if (!deletedInscription) {
      return res.status(404).json({ msg: "Inscription non trouvée." });
    }

    res.status(200).json({ msg: "Inscription supprimée avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'inscription :", error);
    res.status(500).json({ msg: "Erreur serveur lors de la suppression." });
  }
};


// exports.createInscription = async (req, res) => {
//   try {
//     const {
//       prenom,
//       nom,
//       dateNaissance,
//       lieuNaissance,
//       genre,
//       telephoneParent,
//       emailParent,
//       adresseParent,
//       nomEtablissement,
//       regionEtablissement,
//       classe,
//       anneeScolaire,
//       langueVivante1,
//       langueVivante2,
//       matiereOptionnelle,
//       directionRegionale,
//       inspectionRegionale,
//       montantPaiement
//     } = req.body;

//     // Générer une date de paiement (si elle est manquante, mettez par défaut la date actuelle)
//     const datePaiement = req.body.datePaiement || new Date();

//     // Gestion des fichiers joints (s'ils sont inclus dans la requête)
//     const documents = {
//       certificatNaissance: req.files?.certificatNaissance?.[0]?.path || '',
//       certificatResidence: req.files?.certificatResidence?.[0]?.path || '',
//       certificatScolarite: req.files?.certificatScolarite?.[0]?.path || '',
//       photoIdentite: req.files?.photoIdentite?.[0]?.path || '',
//       pieceIdentiteParent: req.files?.pieceIdentiteParent?.[0]?.path || '',
//       autresDocuments: req.files?.autresDocuments?.[0]?.path || ''
//     };

//     // Création d'une nouvelle inscription avec les champs requis
//     const newInscription = new InscriptionBEPC({
//       prenom,
//       nom,
//       dateNaissance,
//       lieuNaissance,
//       genre,
//       telephoneParent,
//       emailParent,
//       adresseParent,
//       nomEtablissement,
//       regionEtablissement,
//       classe,
//       anneeScolaire,
//       langueVivante1,
//       langueVivante2,
//       matiereOptionnelle,
//       montantPaiement: montantPaiement || 10000, // Par défaut 10,000 FCFA si non spécifié
//       datePaiement,
//       directionRegionale,
//       inspectionRegionale,
//       documents,
//     });

//     await newInscription.save();
//     res.status(201).json({
//       msg: 'Inscription créée avec succès.',
//       inscription: newInscription
//     });
//   } catch (err) {
//     console.error('Erreur lors de la création de l\'inscription:', err);
//     res.status(500).json({ msg: 'Erreur serveur lors de la création de l\'inscription.' });
//   }
// };



// **Mettre à jour le statut de paiement d’une inscription**
exports.updatePaiementStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    // const inscription = await InscriptionBEPC.findById(id);
    // if (!inscription) {
    //   return res.status(404).json({ msg: 'Inscription non trouvée.' });
    // }




    const inscription = await InscriptionBEPC.findById(id).populate('agentId', 'name');
if (!inscription) {
  return res.status(404).json({ msg: 'Inscription non trouvée.' });
}

// Inclure le nom de l'agent dans la réponse
const response = {
  ...inscription.toObject(),
  agentName: inscription.agentId ? inscription.agentId.name : 'Non spécifié',
};

res.json(response);



    inscription.paymentStatus = paymentStatus;
    await inscription.save();

    res.status(200).json({ msg: 'Statut de paiement mis à jour.', inscription });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du paiement:', err);
    res.status(500).json({ msg: 'Erreur serveur lors de la mise à jour du paiement.' });
  }
};

// **Récupérer les inscriptions par numéro de téléphone**
// exports.getInscriptionsByPhone = async (req, res) => {
//   try {
//     const { phone } = req.query;

//     const inscriptions = await InscriptionBEPC.find({ phone });
//     if (!inscriptions.length) {
//       return res.status(404).json({ msg: 'Aucune inscription trouvée pour ce numéro.' });
//     }

//     res.status(200).json({ inscriptions });
//   } catch (err) {
//     console.error('Erreur lors de la récupération des inscriptions:', err);
//     res.status(500).json({ msg: 'Erreur serveur lors de la récupération des inscriptions.' });
//   }
// };

// **Récupérer les résultats BEPC**
// exports.getResults = async (req, res) => {
//   try {
//     const results = await InscriptionBEPC.find({ result: { $exists: true } });

//     res.status(200).json({ results });
//   } catch (err) {
//     console.error('Erreur lors de la récupération des résultats:', err);
//     res.status(500).json({ msg: 'Erreur serveur lors de la récupération des résultats.' });
//   }
// };

// **Tableau de bord pour l’utilisateur BEPC**
exports.getDashboard = async (req, res) => {
  try {
    const { user } = req;
    const inscriptions = await InscriptionBEPC.find({ phone: user.phone });

    res.status(200).json({ msg: 'Tableau de bord BEPC.', inscriptions });
  } catch (err) {
    console.error('Erreur lors de l\'accès au tableau de bord:', err);
    res.status(500).json({ msg: 'Erreur serveur lors de l\'accès au tableau de bord.' });
  }
};

// **Tableau de bord Admin BEPC**
exports.getAdminDashboard = async (req, res) => {
  try {
    const inscriptions = await InscriptionBEPC.find();
    const totalInscriptions = inscriptions.length;
    const pendingPayments = inscriptions.filter(ins => ins.paymentStatus === 'en attente').length;

    res.status(200).json({
      msg: 'Tableau de bord Admin BEPC.',
      totalInscriptions,
      pendingPayments,
    });
  } catch (err) {
    console.error('Erreur lors de l\'accès au tableau de bord Admin:', err);
    res.status(500).json({ msg: 'Erreur serveur lors de l\'accès au tableau de bord Admin.' });
  }
};


// Dans inscriptionBEPCController.js
exports.generateBEPCReport = async (req, res) => {
  try {
    // Récupérer toutes les inscriptions avec les champs nécessaires
    const inscriptions = await InscriptionBEPC.find({})
      .select('regionEtablissement directionRegionale inspectionRegionale nomEtablissement classe matricule nom prenom dateNaissance lieuNaissance genre telephoneParent montantPaiement')
      .lean();

    // Structurer les inscriptions par hiérarchie (région > direction > inspection > établissement > classe)
    const structuredData = inscriptions.reduce((acc, inscription) => {
      const { regionEtablissement, directionRegionale, inspectionRegionale, nomEtablissement, classe } = inscription;

      // Structure hiérarchique
      if (!acc[regionEtablissement]) acc[regionEtablissement] = {};
      if (!acc[regionEtablissement][directionRegionale]) acc[regionEtablissement][directionRegionale] = {};
      if (!acc[regionEtablissement][directionRegionale][inspectionRegionale]) acc[regionEtablissement][directionRegionale][inspectionRegionale] = {};
      if (!acc[regionEtablissement][directionRegionale][inspectionRegionale][nomEtablissement]) acc[regionEtablissement][directionRegionale][inspectionRegionale][nomEtablissement] = {};
      if (!acc[regionEtablissement][directionRegionale][inspectionRegionale][nomEtablissement][classe]) acc[regionEtablissement][directionRegionale][inspectionRegionale][nomEtablissement][classe] = [];

      // Ajouter l'inscription à la classe correspondante
      acc[regionEtablissement][directionRegionale][inspectionRegionale][nomEtablissement][classe].push(inscription);

      return acc;
    }, {});

    res.status(200).json(structuredData);
  } catch (error) {
    console.error('Erreur lors de la génération du rapport BEPC :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};




// exports.getInscriptionByMatricule = async (req, res) => {
//   try {
//     const { matricule } = req.params;
//     const inscription = await InscriptionBEPC.findOne({ matricule });

//     if (!inscription) {
//       return res.status(404).json({ message: "Aucun élève trouvé avec ce matricule." });
//     }

//     res.status(200).json(inscription);
//   } catch (error) {
//     console.error("Erreur lors de la récupération des informations de l'élève :", error);
//     res.status(500).json({ message: "Erreur lors de la récupération des informations de l'élève." });
//   }
// };


exports.getAllInscriptions = async (req, res) => {
  try {
    const { regionEtablissement, centreExamen, typeEnseignement } = req.query;

    // Construire la requête dynamique
    const query = {};
    if (regionEtablissement) query.regionEtablissement = regionEtablissement;
    if (centreExamen) query.centreExamen = centreExamen;
    if (typeEnseignement) query.typeEnseignement = typeEnseignement;

    // Récupérer les inscriptions
    const inscriptions = await InscriptionBEPC.find(query).populate("agentId", "name email");

    res.status(200).json(inscriptions);
  } catch (error) {
    console.error("Erreur lors de la récupération des inscriptions :", error);
    res.status(500).json({ msg: "Erreur lors de la récupération des inscriptions." });
  }
};


exports.getInscriptions = async (req, res) => {
  try {
    const inscriptions = await InscriptionBEPC.find()
      .populate('centreExamen', 'nom region') // Inclut les champs 'nom' et 'region' du centre
      .exec();

    res.status(200).json(inscriptions);
  } catch (error) {
    console.error("Erreur lors de la récupération des inscriptions :", error);
    res.status(500).json({ msg: "Erreur serveur lors de la récupération des inscriptions." });
  }
};






// exports.getInscriptionById = async (req, res) => {
//   try {
//     const inscription = await InscriptionBEPC.findById(req.params.id)
//       .populate('centreExamen', 'nom region'); // Popule le nom et la région du centre d'examen

//     if (!inscription) {
//       console.log("Inscription non trouvée pour l'ID :", req.params.id);
//       return res.status(404).json({ msg: 'Inscription non trouvée.' });
//     }

//     console.log("Données de l'inscription après populate :", inscription);
//     res.status(200).json(inscription);
//   } catch (error) {
//     console.error("Erreur lors de la récupération de l'inscription :", error);
//     res.status(500).json({ msg: 'Erreur serveur.', error: error.message });
//   }
// };

exports.getInscriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifiez si l'ID est un ObjectId valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("ID invalide :", id);
      return res.status(400).json({ msg: 'ID invalide.' });
    }

    const inscription = await InscriptionBEPC.findById(id)
      .populate('centreExamen', 'nom region'); // Popule le nom et la région du centre d'examen

    if (!inscription) {
      console.log("Inscription non trouvée pour l'ID :", id);
      return res.status(404).json({ msg: 'Inscription non trouvée.' });
    }

    console.log("Données de l'inscription après populate :", inscription);
    res.status(200).json(inscription);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'inscription :", error);
    res.status(500).json({ msg: 'Erreur serveur.', error: error.message });
  }
};

// exports.getRecuByReference = async (req, res) => {
//   try {
//     const { referencePaiement } = req.params;

//     // Rechercher l'inscription et remplir le centre d'examen
//     const inscription = await InscriptionBEPC.findOne({ referencePaiement }).populate('centreExamen');

//     if (!inscription) {
//       return res.status(404).json({ message: 'Reçu introuvable.' });
//     }

//     res.status(200).json(inscription); // Retourne l'inscription avec le centre d'examen peuplé
//   } catch (error) {
//     console.error('Erreur lors de la récupération du reçu :', error);
//     res.status(500).json({ message: 'Erreur interne du serveur.' });
//   }
// };

exports.getRecuByReference = async (req, res) => {
  try {
    const { referencePaiement } = req.params;

    // Rechercher l'inscription et remplir le centre d'examen et l'agent de saisie
    const inscription = await InscriptionBEPC.findOne({ referencePaiement })
      .populate('centreExamen') // Peupler les informations du centre d'examen
      .populate('agentId', 'name email'); // Peupler le nom et l'email de l'agent de saisie

    if (!inscription) {
      return res.status(404).json({ message: 'Reçu introuvable.' });
    }

    res.status(200).json(inscription); // Retourne l'inscription avec les données peuplées
  } catch (error) {
    console.error('Erreur lors de la récupération du reçu :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};


exports.getPaginatedInscriptions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    // Validation des paramètres
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
      return res.status(400).json({ msg: 'Paramètres de pagination invalides.' });
    }

    const query = search
      ? { $or: [{ nom: new RegExp(search, 'i') }, { prenom: new RegExp(search, 'i') }] }
      : {};

    const inscriptions = await InscriptionBEPC.find(query)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .populate('centreExamen', 'nom region');

    const totalDocuments = await InscriptionBEPC.countDocuments(query);

    res.status(200).json({
      totalDocuments,
      totalPages: Math.ceil(totalDocuments / limitNumber),
      currentPage: pageNumber,
      inscriptions,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des inscriptions paginées :', error);
    res.status(500).json({ msg: 'Erreur serveur lors de la récupération des inscriptions.' });
  }
};



exports.getMyInscriptions = async (req, res) => {
  try {
    console.log('Requête utilisateur connectée dans getMyInscriptions:', req.user);

    // Ajouter un log pour afficher l'ID de l'utilisateur connecté
    console.log('ID de l\'utilisateur connecté (req.user._id) :', req.user._id);

    // // Rechercher uniquement les inscriptions de l'utilisateur connecté
    // const inscriptions = await InscriptionBEPC.find({ agentId: req.user._id })
    //   .populate('agentId', 'name email');

    // Rechercher uniquement les inscriptions de l'utilisateur connecté
    const inscriptions = await InscriptionBEPC.find({ agentId: req.user._id })
    .populate('agentId', 'name email') // Inclut les informations de l'agent (nom et email)
    .populate('centreExamen', 'nom region'); // Inclut les informations du centre d'examen (nom et région)

    // Ajouter un log pour voir les inscriptions récupérées
    console.log('Inscriptions récupérées pour cet utilisateur :', inscriptions);

    res.status(200).json(inscriptions);
  } catch (error) {
    console.error('Erreur dans getMyInscriptions :', error);
    res.status(500).json({ msg: 'Erreur lors de la récupération des inscriptions.' });
  }
};
