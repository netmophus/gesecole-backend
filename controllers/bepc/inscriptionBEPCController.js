const InscriptionBEPC = require('../../models/bepc/InscriptionBEPC'); // Modèle d'inscription BEPC
const User = require('../../models/User'); // Modèle utilisateur
const PDFDocument = require('pdfkit');

// **Créer une inscription BEPC**

exports.createInscription = async (req, res) => {
  console.log("Données reçues dans req.body:", req.body);
  console.log("Fichiers reçus:", req.files); // si vous attendez des fichiers



  console.log("Utilisateur connecté (agent de saisie) dans createInscription :", {
    id: req.user._id,
    name: req.user.name,
    role: req.user.role,
  });
  try {
    // Générer la référence de paiement unique
    const timestamp = Date.now();
    const initiales = `${req.body.prenom.charAt(0)}${req.body.nom.charAt(0)}`.toUpperCase();
    const referencePaiement = `REF-${initiales}-${timestamp}`;

    // Construire l'objet documents avec les URLs des fichiers si présents
    const documents = {};
    if (req.files) {
      documents.certificatNaissance = req.files.certificatNaissance?.[0]?.path || '';
      documents.certificatResidence = req.files.certificatResidence?.[0]?.path || '';
      documents.certificatScolarite = req.files.certificatScolarite?.[0]?.path || '';
      documents.photoIdentite = req.files.photoIdentite?.[0]?.path || '';
      documents.pieceIdentiteParent = req.files.pieceIdentiteParent?.[0]?.path || '';
      documents.autresDocuments = req.files.autresDocuments?.[0]?.path || '';
    }

    // Créer une nouvelle inscription en incluant les documents et la référence de paiement
    const newInscription = new InscriptionBEPC({
      matricule: req.body.matricule,
      referencePaiement: referencePaiement,
      prenom: req.body.prenom,
      nom: req.body.nom,
      dateNaissance: req.body.dateNaissance,
      lieuNaissance: req.body.lieuNaissance,
      genre: req.body.genre,
      telephoneParent: req.body.telephoneParent,
      adresseParent: req.body.adresseParent,
      nomEtablissement: req.body.nomEtablissement,
      regionEtablissement: req.body.regionEtablissement,
      classe: req.body.classe,
      langueVivante1: req.body.langueVivante1,
      directionRegionale: req.body.directionRegionale,
      inspectionRegionale: req.body.inspectionRegionale,
      montantPaiement: req.body.montantPaiement,
      documents, // Inclure les documents ici
      agentId: req.user.id, // Ajouter l'ID de l'agent connecté
    });


    console.log('Nouvelle inscription avec agentId:', newInscription);


    await newInscription.save();

    // Ajouter manuellement les informations de l'agent à la réponse
const inscriptionResponse = {
  ...newInscription.toObject(),
  agentName: req.user.name, // Ajoute le nom de l'agent
};


    res.status(201).json(inscriptionResponse);
  } catch (error) {
    console.error('Erreur lors de la création de l\'inscription:', error);
    res.status(400).json({ msg: 'Erreur lors de la validation des champs requis.', errors: error.errors });
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

    const inscription = await InscriptionBEPC.findById(id);
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

// **Récupérer les inscriptions par numéro de téléphone**
exports.getInscriptionsByPhone = async (req, res) => {
  try {
    const { phone } = req.query;

    const inscriptions = await InscriptionBEPC.find({ phone });
    if (!inscriptions.length) {
      return res.status(404).json({ msg: 'Aucune inscription trouvée pour ce numéro.' });
    }

    res.status(200).json({ inscriptions });
  } catch (err) {
    console.error('Erreur lors de la récupération des inscriptions:', err);
    res.status(500).json({ msg: 'Erreur serveur lors de la récupération des inscriptions.' });
  }
};

// **Récupérer les résultats BEPC**
exports.getResults = async (req, res) => {
  try {
    const results = await InscriptionBEPC.find({ result: { $exists: true } });

    res.status(200).json({ results });
  } catch (err) {
    console.error('Erreur lors de la récupération des résultats:', err);
    res.status(500).json({ msg: 'Erreur serveur lors de la récupération des résultats.' });
  }
};

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

exports.generateReport = async (req, res) => {
  try {
    console.log('Début de la récupération des inscriptions avec paiement confirmé.');
    
    // Récupérer les inscriptions avec paiement confirmé
    const inscriptions = await InscriptionBEPC.find({
      referencePaiement: { $exists: true, $ne: null },
      montantPaiement: { $gt: 0 }
    });

    console.log(`Nombre d'inscriptions trouvées : ${inscriptions.length}`);

    // Renvoyer les inscriptions sous forme de JSON pour utilisation dans le frontend
    res.status(200).json(inscriptions);
  } catch (error) {
    console.error('Erreur lors de la récupération des inscriptions :', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des inscriptions.' });
  }
};



exports.getInscriptionByMatricule = async (req, res) => {
  try {
    const { matricule } = req.params;
    const inscription = await InscriptionBEPC.findOne({ matricule });

    if (!inscription) {
      return res.status(404).json({ message: "Aucun élève trouvé avec ce matricule." });
    }

    res.status(200).json(inscription);
  } catch (error) {
    console.error("Erreur lors de la récupération des informations de l'élève :", error);
    res.status(500).json({ message: "Erreur lors de la récupération des informations de l'élève." });
  }
};






