const User = require('../../models/User');
const InscriptionCFEPD = require('../../models/cfepd/InscriptionCFEPD');
const mongoose = require('mongoose'); // Ajoutez cette ligne en haut de votre fichier



exports.getAgents = async (req, res) => {
  try {
    // Récupérer tous les agents 'cfepd'
    const agents = await User.find({ role: 'cfepd' }).select('name phone isActive');

    // Ajouter les statistiques pour chaque agent
    const agentsWithStats = await Promise.all(
      agents.map(async (agent) => {
        const saisies = await InscriptionCFEPD.countDocuments({ agentId: agent._id });
        const montantTotal = await InscriptionCFEPD.aggregate([
          { $match: { agentId: agent._id } },
          { $group: { _id: null, total: { $sum: '$montantPaiement' } } },
        ]);

        return {
          ...agent.toObject(),
          saisies,
          montantTotal: montantTotal[0]?.total || 0, // Si aucun montant, retournez 0
        };
      })
    );

    res.json(agentsWithStats);
  } catch (error) {
    console.error('Erreur lors de la récupération des agents et statistiques :', error);
    res.status(500).json({ msg: 'Erreur serveur.' });
  }
};






// 2. Tableau de bord des statistiques
exports.getDashboard = async (req, res) => {
  try {
    const totalInscriptions = await InscriptionCFEPD.countDocuments();
    const inscriptionsByRegion = await InscriptionCFEPD.aggregate([
      { $group: { _id: '$regionEtablissement', count: { $sum: 1 } } },
    ]);
    const inscriptionsByAgent = await InscriptionCFEPD.aggregate([
      { $group: { _id: '$agentId', count: { $sum: 1 } } },
    ]);
    res.json({ totalInscriptions, inscriptionsByRegion, inscriptionsByAgent });
  } catch (error) {
    res.status(500).json({ msg: 'Erreur lors de la récupération des statistiques.', error });
  }
};

// 3. Générer un rapport
exports.generateReport = async (req, res) => {
  const { agentId, region } = req.query; // Filtrage par agent ou région
  try {
    let filter = {};
    if (agentId) filter.agentId = agentId;
    if (region) filter.regionEtablissement = region;

    const inscriptions = await InscriptionCFEPD.find(filter).populate('agentId', 'name');
    res.json(inscriptions);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur lors de la génération du rapport.', error });
  }
};




// Contrôleur pour changer le statut d'un agent CFEPD
exports.toggleAgentStatus = async (req, res) => {
  const userId = req.params.id;
  console.log('ID reçu pour mise à jour :', userId);

  if (!userId) {
    return res.status(400).json({ msg: 'ID utilisateur manquant' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'Utilisateur non trouvé' });
    }

    // Basculer le statut
    user.isActive = !user.isActive;
    console.log('Nouveau statut :', user.isActive);

    // Sauvegarder dans la base de données
    await user.save();
    console.log('Mise à jour réussie pour l’utilisateur :', user);

    res.json({
      msg: 'Statut de l’utilisateur mis à jour avec succès',
      user,
    });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du statut :', err);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
};




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

    const inscriptions = await InscriptionCFEPD.find({ agentId });

    if (!inscriptions.length) {
      return res.status(404).json({ msg: 'Aucune saisie trouvée pour cet agent.' });
    }

    // Rassemblez et retournez les données
    const totalSaisies = inscriptions.length;
    const montantTotal = inscriptions.reduce((sum, inscription) => sum + inscription.montantPaiement, 0);

    const reportData = {
      agent: { name: agent.name, phone: agent.phone, totalSaisies, montantTotal },
      inscriptions: inscriptions.map((inscription) => ({
        nomComplet: `${inscription.prenom} ${inscription.nom}`,
        ...inscription._doc, // Retourner les autres champs automatiquement
      })),
    };

    res.json(reportData);
  } catch (error) {
    console.error('Erreur lors de la génération du rapport :', error);
    res.status(500).json({ msg: 'Erreur serveur lors de la génération du rapport.' });
  }
};




// exports.generateFilteredReport = async (req, res) => {
//   const { region, directionRegionale, inspectionRegionale, etablissement } = req.body;
//   const { id: agentId } = req.params; // Utilisez req.params pour obtenir l'ID de l'utilisateur

//   try {
//     if (!agentId) {
//       return res.status(400).json({ message: "L'ID de l'agent est requis." });
//     }

//     const filter = { agentId };

//     if (region) filter.regionEtablissement = region;
//     if (directionRegionale) filter.directionRegionale = directionRegionale;
//     if (inspectionRegionale) filter.inspectionRegionale = inspectionRegionale;
//     if (etablissement) filter.nomEtablissement = etablissement;

//     const inscriptions = await InscriptionCFEPD.find(filter);

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
//     console.error('Erreur lors de la génération du rapport filtré :', err);
//     res.status(500).json({ message: 'Erreur serveur.' });
//   }
// };





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

//     if (region) filter.regionEtablissement = region;
//     if (directionRegionale) filter.directionRegionale = directionRegionale;
//     if (inspectionRegionale) filter.inspectionRegionale = inspectionRegionale;
//     if (etablissement) filter.nomEtablissement = etablissement;

//     console.log("Filtre appliqué :", filter);

//     const inscriptions = await InscriptionCFEPD.find(filter);

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




exports.generateFilteredReport = async (req, res) => {
  console.log("Données reçues :", req.body);
  console.log("ID utilisateur reçu :", req.params.id);

  const { region, directionRegionale, inspectionRegionale, etablissement } = req.body;
  const { id: agentId } = req.params;

  if (!agentId) {
    return res.status(400).json({ message: "ID de l'utilisateur manquant." });
  }

  try {
    const filter = { agentId };

    if (region) {
      filter.regionEtablissement = { $regex: new RegExp(region, 'i') }; // Insensible à la casse
    }
    if (directionRegionale) {
      filter.directionRegionale = { $regex: new RegExp(directionRegionale, 'i') }; // Insensible à la casse
    }
    if (inspectionRegionale) {
      filter.inspectionRegionale = { $regex: new RegExp(inspectionRegionale, 'i') }; // Insensible à la casse
    }
    if (etablissement) {
      filter.nomEtablissement = { $regex: new RegExp(etablissement, 'i') }; // Insensible à la casse
    }

    console.log("Filtre appliqué :", filter);

    const inscriptions = await InscriptionCFEPD.find(filter);

    const totalSaisies = inscriptions.length;
    const montantTotal = inscriptions.reduce((sum, ins) => sum + ins.montantPaiement, 0);

    const agent = await User.findById(agentId).select('name phone');

    res.json({
      agent: {
        ...agent.toObject(),
        totalSaisies,
        montantTotal,
      },
      inscriptions,
    });
  } catch (err) {
    console.error("Erreur lors de la génération du rapport filtré :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};




