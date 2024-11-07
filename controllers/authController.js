
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Establishment = require('../models/Establishment'); // Assurez-vous d'importer le modèle d'établissement
const logger = require('../utils/logger'); // Importez le logger
const Student = require('../models/Student');
const AcademicYear = require('../models/AcademicYear')

// Récupérer un utilisateur par ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password'); // Exclure le mot de passe
    if (!user) {
      return res.status(404).json({ msg: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', err);
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Mettre à jour un utilisateur


exports.updateUser = async (req, res) => {
  const { id } = req.params; // ID de l'utilisateur à mettre à jour
  const { name, phone, email, role, isActive, permissions } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ msg: 'Utilisateur non trouvé' });
    }

    // Mise à jour des informations utilisateur
    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.email = email || user.email;
    user.role = role || user.role;
    user.isActive = typeof isActive === 'boolean' ? isActive : user.isActive;

    // Mise à jour des permissions
    if (permissions) {
      user.permissions = {
        create: permissions.create !== undefined ? permissions.create : user.permissions.create,
        read: permissions.read !== undefined ? permissions.read : user.permissions.read,
        update: permissions.update !== undefined ? permissions.update : user.permissions.update,
        delete: permissions.delete !== undefined ? permissions.delete : user.permissions.delete,
      };
    }

    await user.save();
    res.status(200).json({ msg: 'Utilisateur mis à jour avec succès', user });
  } catch (err) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};


exports.registerUser = async (req, res) => {
  const { name, phone, email, password, role, establishmentName, establishmentType, establishmentAddress } = req.body;
  
  // Validation des données
  if (!name || !phone || !password || !role) {
    return res.status(400).json({ msg: 'Tous les champs requis doivent être remplis.' });
  }
  
  let establishmentId;
  console.log('Données reçues pour l\'inscription:', { name, phone, email, password, role, establishmentName, establishmentType, establishmentAddress });

  try {
    // 1. Vérifier si un utilisateur avec le même téléphone existe déjà dans la base de données
    let user = await User.findOne({ phone });

    if (user) {
      return res.status(400).json({ msg: 'Utilisateur déjà existant avec ce numéro de téléphone.' });
    }

    // 2. Création de l'établissement s'il s'agit d'un rôle "Etablissement"
    if (role === 'Etablissement') {
      if (!establishmentName || !establishmentType || !establishmentAddress) {
        return res.status(400).json({ msg: 'Les informations de l\'établissement sont requises.' });
      }

      console.log('Création de l\'établissement pour l\'utilisateur:', establishmentName);
      
      const establishment = new Establishment({
        name: establishmentName,
        type: establishmentType,
        address: establishmentAddress,
      });

      await establishment.save(); // Sauvegarder l'établissement dans la base de données
      establishmentId = establishment._id; // Récupérer l'ID de l'établissement pour l'associer à l'utilisateur
      console.log('Établissement créé avec succès:', establishmentId);
    }

    // 3. Création d'un nouvel utilisateur et association avec l'établissement
    user = new User({
      name,
      phone,
      email,
      password,
      role,
      schoolId: establishmentId || undefined, // Associe l'établissement créé si présent
    });

    await user.save(); // Sauvegarder l'utilisateur dans la base de données
    console.log('Nouvel utilisateur créé avec succès:', user._id);

    // 4. Générer un token JWT pour l'utilisateur nouvellement créé
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        schoolId: user.schoolId,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET, // Secret pour la génération du token JWT
      { expiresIn: '1h' }, // Le token expire dans une heure
      (err, token) => {
        if (err) {
          throw err;
        }
        res.json({ token, role: user.role, schoolId: user.schoolId });
      }
    );
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement de l\'utilisateur:', err);
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};








exports.loginUser = async (req, res) => {
  const { identifier, password } = req.body;
  console.log('Identifiant reçu pour la connexion:', identifier);

  const phoneRegex = /^\+\d{3}\d{8}$/;
  let user;

  try {
    if (phoneRegex.test(identifier)) {
      user = await User.findOne({ phone: identifier });
      if (!user) {
        logger.warn(`Tentative de connexion échouée : utilisateur non trouvé avec le numéro de téléphone - ${identifier}`);
        return res.status(400).json({ msg: 'Numéro de téléphone ou mot de passe incorrect' });
      }
    } else {
      console.log(`Recherche d'un élève avec le matricule : ${identifier}`);
      
      const student = await Student.findOne({ matricule: identifier });
      if (!student) {
        logger.warn(`Tentative de connexion échouée : élève non trouvé avec le matricule - ${identifier}`);
        return res.status(400).json({ msg: 'Matricule ou mot de passe incorrect' });
      }

      console.log(`Récupération de l'utilisateur associé au studentId : ${student._id}`);
      user = await User.findOne({ studentId: student._id });

      if (!user) {
        logger.warn(`Tentative de connexion échouée : utilisateur non trouvé pour l'élève avec le matricule - ${identifier}`);
        return res.status(400).json({ msg: 'Matricule ou mot de passe incorrect' });
      }
    }

    if (!user.isActive) {
      logger.warn(`Tentative de connexion échouée : compte désactivé pour - ${identifier}`);
      return res.status(403).json({ msg: 'Votre compte a été désactivé. Veuillez contacter l\'administrateur.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.loginAttempts += 1;
      await user.save();
      logger.warn(`Tentative de connexion échouée : mot de passe incorrect pour - ${identifier}`);
      return res.status(400).json({ msg: 'Identifiant ou mot de passe incorrect' });
    }

    console.log('Mot de passe reçu pour la connexion:', password);


    user.loginAttempts = 0;
    await user.save();

    const activeYear = await AcademicYear.findOne({ isActive: true });
    const formattedAcademicYear = activeYear ? `${activeYear.startYear} - ${activeYear.endYear}` : null;

    const payload = {
      user: {
        id: user.id,
        role: user.role,
        schoolId: user.schoolId,
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '4h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          role: user.role,
          schoolId: user.schoolId,
          isConfigured: user.isConfigured,
          academicYear: formattedAcademicYear,
        });
        logger.info(`Connexion réussie : ${identifier}`);
      }
    );

   
    
  } catch (err) {
    console.error('Erreur du serveur:', err.message);
    res.status(500).send('Erreur du serveur');
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('Erreur lors de la récupération du profil utilisateur', err.message);
    res.status(500).send('Erreur du serveur');
  }
};

// Récupérer tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclure les mots de passe
    res.json(users);
  } catch (err) {
    console.error('Erreur lors de la récupération des utilisateurs:', err.message);
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Désactiver un utilisateur
exports.deactivateUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ msg: 'Utilisateur non trouvé' });
    }

    user.isActive = false;
    await user.save();

    res.json({ msg: 'Utilisateur désactivé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la désactivation de l\'utilisateur:', err);
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'Utilisateur non trouvé' });
    }

    res.json({ msg: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', err);
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

//activer un utilisateur
exports.activateUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ msg: 'Utilisateur non trouvé' });
    }

    user.isActive = true; // Réactiver l'utilisateur
    await user.save();

    res.json({ msg: 'Utilisateur activé avec succès' });
  } catch (err) {
    console.error('Erreur lors de l\'activation de l\'utilisateur:', err);
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};



exports.teacherLogin = async (req, res) => {
  const { phone, password } = req.body;

  try {
    console.log('Tentative de connexion de l\'enseignant avec le téléphone:', phone);

    // Chercher l'enseignant dans la base de données avec le numéro de téléphone
    const teacher = await Teacher.findOne({ phone });
    if (!teacher) {
      console.log('Enseignant non trouvé avec ce numéro de téléphone');
      return res.status(400).json({ msg: "Numéro de téléphone ou mot de passe incorrect" });
    }

    // Comparer le mot de passe
    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      console.log('Mot de passe incorrect pour l\'enseignant avec le téléphone:', phone);
      return res.status(400).json({ msg: "Numéro de téléphone ou mot de passe incorrect" });
    }

    // Loguer l'enseignant trouvé
    console.log('Enseignant trouvé:', teacher);

    // Vérifier les établissements associés à cet enseignant
    const establishments = await Establishment.find({ _id: { $in: teacher.establishmentIds } });
    console.log('Établissements associés:', establishments);

    if (establishments.length > 1) {
      console.log('L\'enseignant est associé à plusieurs établissements');
      return res.json({ msg: "Sélectionnez un établissement", establishments });
    }

    // Si un seul établissement, connecter directement
    const token = generateToken(teacher._id); // Générer le token en utilisant votre méthode actuelle
    console.log('Connexion réussie, token généré pour l\'enseignant:', token);

    // Restitution de la réponse, sans changer votre flux
    res.json({ token, teacher });
  } catch (err) {
    console.error('Erreur lors de la connexion de l\'enseignant:', err);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
};





exports.selectEstablishment = async (req, res) => {
  const { teacherId, establishmentId } = req.body;

  try {
    // Vérifier que l'enseignant est bien associé à cet établissement
    const teacher = await Teacher.findById(teacherId);
    const establishment = await Establishment.findOne({ _id: establishmentId, _id: { $in: teacher.establishmentIds } });

    if (!establishment) {
      return res.status(400).json({ msg: "Cet enseignant n'est pas associé à cet établissement." });
    }

    // Mettre à jour la session ou le token avec l'établissement sélectionné
    const token = generateToken(teacher._id, establishmentId); // Générer un token incluant l'établissement
    res.json({ msg: "Établissement sélectionné avec succès", token });
  } catch (err) {
    res.status(500).json({ msg: "Erreur lors de la sélection de l'établissement." });
  }
};




