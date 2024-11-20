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

    const documents = {};
    if (req.files) {
      documents.certificatNaissance = req.files.certificatNaissance?.[0]?.path || '';
      documents.certificatResidence = req.files.certificatResidence?.[0]?.path || '';
      documents.certificatScolarite = req.files.certificatScolarite?.[0]?.path || '';
      documents.photoIdentite = req.files.photoIdentite?.[0]?.path || '';
      documents.pieceIdentiteParent = req.files.pieceIdentiteParent?.[0]?.path || '';
      documents.autresDocuments = req.files.autresDocuments?.[0]?.path || '';
    }

    const newInscription = new InscriptionCFEPD({
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
      directionRegionale: req.body.directionRegionale,
      inspectionRegionale: req.body.inspectionRegionale,
      montantPaiement: req.body.montantPaiement,
      documents,
      agentId: req.user._id, // Inclure l'ID de l'agent connecté
    });

    await newInscription.save();

    // Récupérer les détails de l'agent pour la réponse
    const populatedInscription = await InscriptionCFEPD.findById(newInscription._id).populate('agentId', 'name email');

    res.status(201).json(populatedInscription);
  } catch (error) {
    console.error('Erreur lors de la création de l\'inscription CFEPD:', error);


    if (error.code === 11000 && error.keyPattern?.matricule) {
      return res.status(409).json({ msg: 'Le matricule existe déjà. Veuillez vérifier vos informations.' });
    }



    res.status(400).json({ msg: 'Erreur lors de la validation des champs requis.', errors: error.errors });
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
