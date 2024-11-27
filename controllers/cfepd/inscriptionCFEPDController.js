const InscriptionCFEPD = require('../../models/cfepd/InscriptionCFEPD'); // Modèle d'inscription CFEPD
const User = require('../../models/User'); // Modèle utilisateur
const PDFDocument = require('pdfkit');

// **Créer une inscription CFEPD**

exports.createInscription = async (req, res) => {
  console.log("Données reçues dans req.body:", req.body);
  console.log("Fichiers reçus:", req.files);

  try {
    const timestamp = Date.now();
    const initiales = `${req.body.prenom.charAt(0)}${req.body.nom.charAt(0)}`.toUpperCase();
    const referencePaiement = `REF-${initiales}-${timestamp}`;

    // Vérification si la région d'établissement est fournie
    if (!req.body.regionEtablissement) {
      return res.status(400).json({ msg: "La région d'établissement est obligatoire." });
    }

  // Gestion des documents facultatifs (corrigé)
const documents = {};
const documentFields = [
  'certificatNaissance',
  'certificatScolarite',
  'photoIdentite',
  'certificatNationalite',
  'acteNaissance',
];

// Ajouter uniquement les fichiers réellement présents
documentFields.forEach((field) => {
  if (req.files?.[field]?.[0]?.path) {
    documents[field] = req.files[field][0].path;
  }
});

    // Fixer le montant à 1000
    const montantPaiement = 1000;

    // Créer une nouvelle inscription
    const newInscription = new InscriptionCFEPD({
   
      referencePaiement: referencePaiement,
      prenom: req.body.prenom,
      nom: req.body.nom,
      dateNaissance: req.body.dateNaissance,
      lieuNaissance: req.body.lieuNaissance,
      genre: req.body.genre,
      nationalite: req.body.nationalite,
      autreNationalite: req.body.nationalite === 'Autre' ? req.body.autreNationalite : undefined,
      typeEnseignement: req.body.typeEnseignement,
      regionEtablissement: req.body.regionEtablissement,
      centreExamen: req.body.centreExamen,
      nomEtablissement: req.body.nomEtablissement,
      montantPaiement: montantPaiement,
      matricule: req.body.matricule || null, // Facultatif
      jury: req.body.jury || null, // Facultatif
      numeroDeTable: req.body.numeroDeTable || null, // Facultatif
      documents, // Documents facultatifs
      agentId: req.user._id, // Inclure l'ID de l'agent connecté
    });

    await newInscription.save();

    // Récupérer les détails de l'agent pour la réponse
    const populatedInscription = await InscriptionCFEPD.findById(newInscription._id).populate(
      'agentId',
      'name phone'
    );

    res.status(201).json(populatedInscription);
  } catch (error) {
    console.error('Erreur lors de la création de l\'inscription CFEPD:', error);

    // Gestion des conflits de matricule
    if (error.code === 11000 && error.keyPattern?.matricule) {
      return res.status(409).json({ msg: 'Le matricule existe déjà. Veuillez vérifier vos informations.' });
    }

    res.status(400).json({ msg: 'Erreur lors de la validation des champs requis.', errors: error.errors });
  }
};

 // Modifier une inscription CFEPD


exports.updateInscription = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Récupérer l'inscription existante
    const existingInscription = await InscriptionCFEPD.findById(id);

    if (!existingInscription) {
      return res.status(404).json({ message: "Inscription non trouvée" });
    }


    if (updates.jury !== undefined) {
      existingInscription.jury = updates.jury;
    }
    if (updates.numeroDeTable !== undefined) {
      existingInscription.numeroDeTable = updates.numeroDeTable;
    }
    
    if (updates.matricule !== undefined) {
      existingInscription.matricule = updates.matricule || null; // Permet de rendre le matricule facultatif
    }
    

    // Fusionner les documents existants avec les nouvelles données
    let updatedDocuments = existingInscription.documents || {};
    if (updates.documents) {
      updatedDocuments = {
        certificatNaissance: updates.documents.certificatNaissance || existingInscription.documents.certificatNaissance,
        certificatScolarite: updates.documents.certificatScolarite || existingInscription.documents.certificatScolarite,
        certificatNationalite: updates.documents.certificatNationalite || existingInscription.documents.certificatNationalite,
        photoIdentite: updates.documents.photoIdentite || existingInscription.documents.photoIdentite,
      };
    }

    // Ajoutez `documents` à la mise à jour
    updates.documents = updatedDocuments;

    // Mettre à jour l'inscription
    const updatedInscription = await InscriptionCFEPD.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedInscription);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'inscription :", error);
    res.status(500).json({ message: "Erreur interne du serveur", error });
  }
};


// **Mettre à jour le statut de paiement d’une inscription CFEPD**
exports.updatePaiementStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const inscription = await InscriptionCFEPD.findById(id);
    if (!inscription) {
      return res.status(404).json({ msg: 'Inscription non trouvée.' });
    }

    inscription.paymentStatus = paymentStatus;
    await inscription.save();

    res.status(200).json({ msg: 'Statut de paiement mis à jour.', inscription });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du paiement:', err);
    res.status(500).json({ msg: 'Erreur serveur lors de la mise à jour du paiement.' });
  }
};

// **Récupérer les inscriptions par numéro de téléphone CFEPD**
exports.getInscriptionsByPhone = async (req, res) => {
  try {
    const { phone } = req.query;

    const inscriptions = await InscriptionCFEPD.find({ phone });
    if (!inscriptions.length) {
      return res.status(404).json({ msg: 'Aucune inscription trouvée pour ce numéro.' });
    }

    res.status(200).json({ inscriptions });
  } catch (err) {
    console.error('Erreur lors de la récupération des inscriptions:', err);
    res.status(500).json({ msg: 'Erreur serveur lors de la récupération des inscriptions.' });
  }
};

// **Récupérer les résultats CFEPD**
exports.getResults = async (req, res) => {
  try {
    const results = await InscriptionCFEPD.find({ result: { $exists: true } });

    res.status(200).json({ results });
  } catch (err) {
    console.error('Erreur lors de la récupération des résultats:', err);
    res.status(500).json({ msg: 'Erreur serveur lors de la récupération des résultats.' });
  }
};

// **Tableau de bord pour l’utilisateur CFEPD**
exports.getDashboard = async (req, res) => {
  try {
    const { user } = req;
    const inscriptions = await InscriptionCFEPD.find({ phone: user.phone });

    res.status(200).json({ msg: 'Tableau de bord CFEPD.', inscriptions });
  } catch (err) {
    console.error('Erreur lors de l\'accès au tableau de bord:', err);
    res.status(500).json({ msg: 'Erreur serveur lors de l\'accès au tableau de bord.' });
  }
};

// **Tableau de bord Admin CFEPD**
exports.getAdminDashboard = async (req, res) => {
  try {
    const inscriptions = await InscriptionCFEPD.find();
    const totalInscriptions = inscriptions.length;
    const pendingPayments = inscriptions.filter(ins => ins.paymentStatus === 'en attente').length;

    res.status(200).json({
      msg: 'Tableau de bord Admin CFEPD.',
      totalInscriptions,
      pendingPayments,
    });
  } catch (err) {
    console.error('Erreur lors de l\'accès au tableau de bord Admin:', err);
    res.status(500).json({ msg: 'Erreur serveur lors de l\'accès au tableau de bord Admin.' });
  }
};

// **Générer le rapport PDF des inscriptions payées CFEPD**
exports.generateReport = async (req, res) => {
  try {
    console.log('Début de la récupération des inscriptions avec paiement confirmé.');
    
    const inscriptions = await InscriptionCFEPD.find({
      referencePaiement: { $exists: true, $ne: null },
      montantPaiement: { $gt: 0 }
    });

    console.log(`Nombre d'inscriptions trouvées : ${inscriptions.length}`);
    res.status(200).json(inscriptions);
  } catch (error) {
    console.error('Erreur lors de la récupération des inscriptions :', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des inscriptions.' });
  }
};

// **Récupérer les informations de l'élève par matricule CFEPD**
exports.getInscriptionByMatricule = async (req, res) => {
  try {
    const { matricule } = req.params;
    const inscription = await InscriptionCFEPD.findOne({ matricule });

    if (!inscription) {
      return res.status(404).json({ message: "Aucun élève trouvé avec ce matricule." });
    }

    res.status(200).json(inscription);
  } catch (error) {
    console.error("Erreur lors de la récupération des informations de l'élève :", error);
    res.status(500).json({ message: "Erreur lors de la récupération des informations de l'élève." });
  }
};


// Récupérer toutes les inscriptions avec les centres peuplés
exports.getAllInscriptions = async (req, res) => {
  try {
    console.log("Début de la récupération des inscriptions...");
    const inscriptions = await InscriptionCFEPD.find().populate('centreExamen', 'nom region'); // Récupère uniquement `nom` et `region`
    console.log("Inscriptions trouvées :", inscriptions);
    res.status(200).json(inscriptions);
  } catch (error) {
    console.error('Erreur lors de la récupération des inscriptions :', error);
    res.status(500).json({
      msg: 'Erreur serveur lors de la récupération des inscriptions.',
      error: error.message,
    });
  }
};




// Supprimer une inscription CFEPD
exports.deleteInscription = async (req, res) => {
  try {
    const { id } = req.params; // ID de l'inscription à supprimer

    const deletedInscription = await InscriptionCFEPD.findByIdAndDelete(id);

    if (!deletedInscription) {
      return res.status(404).json({ msg: "Inscription non trouvée." });
    }

    res.status(200).json({
      msg: "Inscription supprimée avec succès.",
      inscription: deletedInscription,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'inscription CFEPD :", error);
    res.status(500).json({
      msg: "Erreur serveur lors de la suppression de l'inscription.",
      error: error.message,
    });
  }
};


exports.getInscriptionById = async (req, res) => {
  try {
    const inscription = await InscriptionCFEPD.findById(req.params.id)
      .populate('centreExamen', 'nom region'); // Popule le nom et la région du centre d'examen

    if (!inscription) {
      console.log("Inscription non trouvée pour l'ID :", req.params.id);
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
//     const inscription = await InscriptionCFEPD.findOne({ referencePaiement }).populate('centreExamen');

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
    const inscription = await InscriptionCFEPD.findOne({ referencePaiement })
      .populate('centreExamen') // Remplit les informations sur le centre d'examen
      .populate('agentId', 'name email'); // Remplit le nom et l'email de l'agent de saisie

    if (!inscription) {
      return res.status(404).json({ message: 'Reçu introuvable.' });
    }

    res.status(200).json(inscription); // Retourne les données peuplées
  } catch (error) {
    console.error('Erreur lors de la récupération du reçu :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

exports.getInscriptionsByUser = async (req, res) => {
  try {
    // Récupérer l'ID de l'utilisateur connecté depuis le token
    const userId = req.user.id;

    // Filtrer les inscriptions par agentId (ID de l'utilisateur)
    const inscriptions = await InscriptionCFEPD.find({ agentId: userId })
      .populate('centreExamen', 'nom region') // Populate pour inclure les détails du centre
      .exec();

    // Retourner les inscriptions au format JSON
    res.status(200).json(inscriptions);
  } catch (error) {
    console.error('Erreur lors de la récupération des inscriptions utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des inscriptions.' });
  }
};