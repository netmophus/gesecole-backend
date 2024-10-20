const InscriptionBEPC = require('../../models/bepc/InscriptionBEPC'); // Modèle d'inscription BEPC
const User = require('../../models/User'); // Modèle utilisateur

// **Créer une inscription BEPC**
exports.createInscription = async (req, res) => {
  try {
    const { name, phone, email, paymentStatus } = req.body;

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ msg: 'Utilisateur déjà inscrit avec ce numéro de téléphone.' });
    }

    const newInscription = new InscriptionBEPC({
      name,
      phone,
      email,
      paymentStatus: paymentStatus || 'en attente',
    });

    await newInscription.save();
    res.status(201).json({ msg: 'Inscription créée avec succès.', inscription: newInscription });
  } catch (err) {
    console.error('Erreur lors de la création de l\'inscription:', err);
    res.status(500).json({ msg: 'Erreur serveur lors de la création de l\'inscription.' });
  }
};

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
