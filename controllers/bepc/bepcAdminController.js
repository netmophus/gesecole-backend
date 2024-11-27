const User = require('../../models/User');
const InscriptionBEPC = require('../../models/bepc/InscriptionBEPC');
const mongoose = require('mongoose'); // Ajoutez mongoose pour la gestion des ObjectId


// 1. Récupérer les agents BEPC avec statistiques
exports.getAgents = async (req, res) => {
  try {
    // Récupérer tous les agents avec le rôle 'bepc'
    const agents = await User.find({ role: 'bepc' }).select('name phone isActive');

    // Ajouter les statistiques pour chaque agent
    const agentsWithStats = await Promise.all(
      agents.map(async (agent) => {
        const saisies = await InscriptionBEPC.countDocuments({ agentId: agent._id });
        const montantTotal = await InscriptionBEPC.aggregate([
          { $match: { agentId: agent._id } },
          { $group: { _id: null, total: { $sum: '$montantPaiement' } } },
        ]);

        return {
          ...agent.toObject(),
          saisies,
          montantTotal: montantTotal[0]?.total || 0, // Si aucun montant, retourne 0
        };
      })
    );

    res.json(agentsWithStats);
  } catch (error) {
    console.error('Erreur lors de la récupération des agents et statistiques BEPC :', error);
    res.status(500).json({ msg: 'Erreur serveur.' });
  }
};

// 2. Tableau de bord des statistiques BEPC
exports.getDashboard = async (req, res) => {
  try {
    const totalInscriptions = await InscriptionBEPC.countDocuments();
    const inscriptionsByRegion = await InscriptionBEPC.aggregate([
      { $group: { _id: '$regionEtablissement', count: { $sum: 1 } } },
    ]);
    const inscriptionsByAgent = await InscriptionBEPC.aggregate([
      { $group: { _id: '$agentId', count: { $sum: 1 } } },
    ]);
    res.json({ totalInscriptions, inscriptionsByRegion, inscriptionsByAgent });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques BEPC :', error);
    res.status(500).json({ msg: 'Erreur serveur.' });
  }
};

// 3. Générer un rapport global
exports.generateReport = async (req, res) => {
  const { agentId, region } = req.query; // Filtrage par agent ou région
  try {
    let filter = {};
    if (agentId) filter.agentId = agentId;
    if (region) filter.regionEtablissement = region;

    const inscriptions = await InscriptionBEPC.find(filter).populate('agentId', 'name');
    res.json(inscriptions);
  } catch (error) {
    console.error('Erreur lors de la génération du rapport BEPC :', error);
    res.status(500).json({ msg: 'Erreur serveur.' });
  }
};

// 4. Changer le statut d'un agent BEPC
exports.toggleAgentStatus = async (req, res) => {
  const userId = req.params.id;
  console.log('ID reçu pour mise à jour :', userId);

  if (!userId) {
    return res.status(400).json({ msg: 'ID utilisateur manquant.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'Utilisateur non trouvé.' });
    }

    // Basculer le statut
    user.isActive = !user.isActive;
    await user.save();

    res.json({
      msg: 'Statut de l’utilisateur mis à jour avec succès.',
      user,
    });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du statut BEPC :', err);
    res.status(500).json({ msg: 'Erreur serveur.' });
  }
};

// 5. Générer un rapport complet pour un agent BEPC
exports.generateAgentReport = async (req, res) => {
  const { agentId } = req.params;

  if (!agentId || !mongoose.Types.ObjectId.isValid(agentId)) {
    return res.status(400).json({ msg: 'ID d\'agent invalide ou non fourni.' });
  }

  try {
    const agent = await User.findById(agentId).select('name phone');
    if (!agent) {
      return res.status(404).json({ msg: 'Agent non trouvé.' });
    }

    const inscriptions = await InscriptionBEPC.find({ agentId });

    if (!inscriptions.length) {
      return res.status(404).json({ msg: 'Aucune saisie trouvée pour cet agent.' });
    }

    const totalSaisies = inscriptions.length;
    const montantTotal = inscriptions.reduce((sum, inscription) => sum + inscription.montantPaiement, 0);

    const reportData = {
      agent: { name: agent.name, phone: agent.phone, totalSaisies, montantTotal },
      inscriptions: inscriptions.map((inscription) => ({
        nomComplet: `${inscription.prenom} ${inscription.nom}`,
        ...inscription._doc,
      })),
    };

    res.json(reportData);
  } catch (error) {
    console.error('Erreur lors de la génération du rapport complet BEPC :', error);
    res.status(500).json({ msg: 'Erreur serveur.' });
  }
};



// exports.generateFilteredReport = async (req, res) => {
//   console.log("Données reçues :", req.body);
//   console.log("ID utilisateur reçu :", req.params.id);

//   const { region, directionRegionale, inspectionRegionale, etablissement } = req.body;
//   const { id: agentId } = req.params;

//   if (!agentId) {
//     return res.status(400).json({ message: "ID de l'utilisateur manquant." });
//   }

//   try {
//     const filter = { agentId };

//     if (region) {
//       filter.regionEtablissement = { $regex: new RegExp(region, 'i') }; // Insensible à la casse
//     }
//     if (directionRegionale) {
//       filter.directionRegionale = { $regex: new RegExp(directionRegionale, 'i') }; // Insensible à la casse
//     }
//     if (inspectionRegionale) {
//       filter.inspectionRegionale = { $regex: new RegExp(inspectionRegionale, 'i') }; // Insensible à la casse
//     }
//     if (etablissement) {
//       filter.nomEtablissement = { $regex: new RegExp(etablissement, 'i') }; // Insensible à la casse
//     }

//     console.log("Filtre appliqué :", filter);

//     const inscriptions = await InscriptionBEPC.find(filter);

//     const totalSaisies = inscriptions.length;
//     const montantTotal = inscriptions.reduce((sum, ins) => sum + ins.montantPaiement, 0);

//     const agent = await User.findById(agentId).select('name phone');

//     res.json({
//       agent: {
//         ...agent.toObject(),
//         totalSaisies,
//         montantTotal,
//       },
//       inscriptions,
//     });
//   } catch (err) {
//     console.error("Erreur lors de la génération du rapport filtré :", err);
//     res.status(500).json({ message: "Erreur serveur." });
//   }
// };



exports.generateReport = async (req, res) => {
  try {
    const inscriptions = await InscriptionBEPC.find()
      .populate("centreExamen", "nom region") // Popule les champs `nom` et `region` du centre d'examen
      .lean();

    res.status(200).json(inscriptions); // Envoie les inscriptions enrichies au frontend
  } catch (err) {
    console.error("Erreur lors de la génération du rapport :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};


