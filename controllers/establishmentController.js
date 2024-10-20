const Establishment = require('../models/Establishment');
const User = require('../models/User');
const AcademicYear = require('../models/AcademicYear');  // Assurez-vous que le chemin est correct
const mongoose = require('mongoose');

// const mongoose = require('mongoose');
// const AcademicYear = require('../models/AcademicYear');
// const Establishment = require('../models/Establishment');
// const User = require('../models/User');



const configureEstablishment = async (req, res) => {
  const {
    codeRegion,
    codeEtablissement,
    region,
    maxStudents,
    contactEmail,
    phoneNumber,
    promoterName,
    yearOfCreation,
    authorization,
    academicYear  // L'ID de l'année académique active sélectionnée
  } = req.body;

  try {
    console.log('Données reçues pour la configuration :', req.body);

    // Vérification de l'ID de l'établissement pour l'utilisateur connecté
    if (!req.user.schoolId) {
      return res.status(400).json({ msg: "L'ID de l'établissement est manquant pour cet utilisateur." });
    }

    // Vérifier si l'ID de l'année académique est valide
    if (!mongoose.Types.ObjectId.isValid(academicYear)) {
      return res.status(400).json({ msg: "L'ID de l'année académique est invalide." });
    }

    // Vérifier si l'année académique existe dans la base de données
    const yearExists = await AcademicYear.findById(academicYear);
    if (!yearExists) {
      return res.status(404).json({ msg: "L'année académique sélectionnée est introuvable." });
    }

    console.log('Année académique trouvée:', yearExists.startYear, '-', yearExists.endYear);

    // Valider que les champs nécessaires sont remplis
    if (!codeRegion || !codeEtablissement || !region || !contactEmail || !promoterName) {
      return res.status(400).json({ msg: "Tous les champs requis doivent être remplis" });
    }

    // Générer le code d'établissement
    const code = `${codeRegion}-${codeEtablissement}`;

    // Rechercher l'établissement dans la base de données
    const establishment = await Establishment.findById(req.user.schoolId);
    if (!establishment) {
      return res.status(404).json({ msg: 'Établissement non trouvé' });
    }

    // Désactiver l'ancienne année active (si existante) avant d'ajouter la nouvelle année active
    establishment.academicYears.forEach((year) => {
      year.isActive = false;  // Désactiver toutes les autres années avant d'activer la nouvelle
    });

    // Vérifier si l'année académique est déjà associée à l'établissement
    const yearExistsInEstablishment = establishment.academicYears.some(
      (year) => year.yearId.toString() === String(academicYear)
    );

    if (!yearExistsInEstablishment) {
      // Ajouter la nouvelle année académique à l'établissement
      establishment.academicYears.push({
        yearId: academicYear,
        isActive: true,  // Marquer cette année académique comme active
      });
    } else {
      // Si l'année existe déjà, on la marque simplement comme active
      establishment.academicYears = establishment.academicYears.map((year) => ({
        ...year,
        isActive: year.yearId.toString() === String(academicYear),
      }));
    }

    // Mettre à jour les autres informations de l'établissement
    establishment.codeRegion = codeRegion;
    establishment.codeEtablissement = codeEtablissement;
    establishment.region = region;
    establishment.maxStudents = maxStudents;
    establishment.contactEmail = contactEmail;
    establishment.phoneNumber = phoneNumber;
    establishment.promoterName = promoterName;
    establishment.yearOfCreation = yearOfCreation;
    establishment.authorization = authorization;
    establishment.code = code;
    establishment.isConfigured = true;

    // Sauvegarder l'établissement avec les nouvelles données
    await establishment.save();

    console.log('Établissement mis à jour avec succès:', establishment);

    // Mettre à jour l'utilisateur pour définir isConfigured à true
    await User.findByIdAndUpdate(req.user.id, { isConfigured: true });

    // Retourner une réponse JSON avec les détails de l'établissement configuré
    res.json({ msg: 'Établissement configuré avec succès', establishment });

  } catch (err) {
    console.error('Erreur lors de la configuration de l\'établissement:', err.message);
    res.status(500).json({ msg: `Erreur lors de la configuration de l'établissement: ${err.message}` });
  }
};








const createEstablishment = async (req, res) => {
  const { name, type, address } = req.body;

  try {
    if (!name || !type || !address) {
      return res.status(400).json({ msg: 'Tous les champs requis doivent être remplis.' });
    }

    const newEstablishment = new Establishment({
      name,
      type,
      address,
    });

    await newEstablishment.save();

    res.status(201).json({ msg: 'Établissement créé avec succès', newEstablishment });
  } catch (err) {
    console.error('Erreur lors de la création de l\'établissement:', err.message);
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};




const checkEstablishmentConfig = async (req, res) => {
  try {
    const establishment = await Establishment.findById(req.params.id);

    if (!establishment) {
      return res.status(404).json({ msg: 'Établissement non trouvé' });
    }

    res.json({ isConfigured: establishment.isConfigured });
  } catch (err) {
    console.error('Erreur lors de la vérification de la configuration de l\'établissement', err.message);
    res.status(500).send('Erreur du serveur');
  }
};





// const getEstablishments = async (req, res) => {
//   try {
//     const establishments = await Establishment.find({ academicYear: req.query.academicYear || activeYear });
//     res.json(establishments);
    
//   } catch (err) {
//     console.error('Erreur lors de la récupération des établissements:', err.message);
//     res.status(500).send('Erreur du serveur');
//   }
// };

const getEstablishments = async (req, res) => {
  try {
    const { academicYearId } = req.query; // Récupérer l'ID de l'année académique

    console.log('ID année académique reçu :', academicYearId);

    const establishments = await Establishment.find({
      'academicYears.yearId': academicYearId,
      'academicYears.isActive': true,
    }).populate('academicYears.yearId', 'startYear endYear isActive');

    console.log('Établissements trouvés :', establishments);

    if (!establishments.length) {
      return res.status(404).json({ msg: 'Aucun établissement trouvé pour cette année académique' });
    }

    res.json(establishments);
  } catch (err) {
    console.error('Erreur lors de la récupération des établissements :', err.message);
    res.status(500).send('Erreur du serveur');
  }
};








const getEstablishmentById = async (req, res) => {
  try {
    // Utilisation de req.params.id pour récupérer l'ID de l'établissement depuis l'URL
    const establishmentId = req.params.id;

    // Récupération de l'établissement en fonction de l'ID et peuplement des années académiques
    const establishment = await Establishment.findById(establishmentId).populate('academicYears.yearId');
  
    if (!establishment) {
      return res.status(404).json({ msg: "Établissement non trouvé" });
    }

    res.json(establishment);
  } catch (err) {
    console.error("Erreur lors de la récupération de l'établissement:", err);
    res.status(500).send("Erreur du serveur");
  }
};




// Exportation des contrôleurs
module.exports = { 
  configureEstablishment,
  checkEstablishmentConfig,
  createEstablishment,
  getEstablishments,
  getEstablishmentById,
  // Ajoutez d'autres fonctions ici si nécessaire
};
