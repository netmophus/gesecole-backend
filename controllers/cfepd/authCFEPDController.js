const User = require('../../models/User'); // Assurez-vous que le modèle est bien importé
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



// Génération de token JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, permissions: user.permissions },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};


// const generateRefreshToken = (user) => {
//   return jwt.sign(
//     { id: user._id }, // Payload
//     process.env.REFRESH_TOKEN_SECRET, // Clé secrète différente de celle des accessTokens
//     { expiresIn: '7d' } // Expiration plus longue
//   );
// };


// Permissions par rôle pour CFEPD
const permissionsByRole = {
  cfepdadmin: { create: true, read: true, update: true, delete: true },
  cfepd: { create: false, read: true, update: false, delete: false },
};

// **Enregistrement d'un utilisateur CFEPD**
exports.registerCFEPD = async (req, res) => {
  const { name, phone, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ phone });
    if (user) {
      return res.status(400).json({ msg: 'Utilisateur avec ce numéro de téléphone déjà existant.' });
    }

    // Attribuer les permissions pour le rôle CFEPD
    const userPermissions = permissionsByRole['cfepd'];

    // Créer un nouvel utilisateur avec le rôle "cfepd"
    user = new User({
      name,
      phone,
      password,
      role: 'cfepd',  // Forcer le rôle à être "cfepd"
      permissions: userPermissions,  // Attribuer les permissions ici
    });

    // Enregistrer l'utilisateur en base de données
    await user.save();

    // Générer le token JWT
    //const token = generateToken(user);

     // Générer les tokens
     const token = generateToken(user);
     //const refreshToken = generateRefreshToken(user);

    res.status(201).json({ token, user: { id: user._id, name: user.name, role: user.role, permissions: user.permissions } });
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement CFEPD:', err.message);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
};

// **Connexion d'un utilisateur CFEPD**
// exports.loginCFEPD = async (req, res) => {
//   const { phone, password } = req.body;

//   if (!phone || !password) {
//     return res.status(400).json({ msg: 'Veuillez fournir un numéro de téléphone et un mot de passe.' });
//   }

//   try {
//     // Vérifier si l'utilisateur existe
//     const user = await User.findOne({ phone });
//     if (!user) {
//       return res.status(400).json({ msg: 'Utilisateur non trouvé.' });
//     }

//     // Comparer les mots de passe
//     const isMatch = await user.matchPassword(password);
//     if (!isMatch) {
//       return res.status(401).json({ msg: 'Mot de passe incorrect.' });
//     }

//     // Vérifiez si le rôle est lié au CFEPD
//     const validRoles = ['cfepd', 'cfepdadmin'];
//     if (!validRoles.includes(user.role)) {
//       return res.status(403).json({ msg: 'Accès interdit pour ce rôle.' });
//     }

//     // Générer le token JWT
//     const token = generateToken(user);

//     // Répondre avec le token et les informations de l'utilisateur
//     res.json({ 
//       token, 
//       user: { 
//         id: user._id, 
//         name: user.name, 
//         role: user.role, 
//         permissions: user.permissions 
//       } 
//     });
//   } catch (err) {
//     console.error('Erreur lors de la connexion CFEPD:', err.message);
//     res.status(500).json({ msg: 'Erreur serveur, veuillez réessayer plus tard.' });
//   }
// };


exports.loginCFEPD = async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ msg: 'Veuillez fournir un numéro de téléphone et un mot de passe.' });
  }

  try {
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ msg: 'Utilisateur non trouvé.' });
    }


      // Vérifier si l'utilisateur est actif
      if (!user.isActive) {
        return res.status(403).json({ msg: 'Votre compte est désactivé. Veuillez contacter l\'administrateur.' });
      }
      

    // Comparer les mots de passe
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Mot de passe incorrect.' });
    }

    // Vérifiez si le rôle est lié au CFEPD
    const validRoles = ['cfepd', 'cfepdadmin'];
    if (!validRoles.includes(user.role)) {
      return res.status(403).json({ msg: 'Accès interdit pour ce rôle.' });
    }

    // Générer le token JWT avec expiration
    const token = generateToken(user); // Votre méthode `generateToken` génère un token avec `expiresIn: '1h'`

    // Calculer le temps d'expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Décoder le token pour obtenir l'expiration
    const expirationTime = decoded.exp * 1000; // Convertir en millisecondes

    // Répondre avec le token, l'heure d'expiration, et les informations de l'utilisateur
    res.json({ 
      token, 
      expiresAt: expirationTime, // Retourne l'heure d'expiration en timestamp
      user: { 
        id: user._id, 
        name: user.name, 
        role: user.role, 
        permissions: user.permissions 
      } 
    });
  } catch (err) {
    console.error('Erreur lors de la connexion CFEPD:', err.message);
    res.status(500).json({ msg: 'Erreur serveur, veuillez réessayer plus tard.' });
  }
};


// **Obtenir le profil utilisateur CFEPD**
exports.getProfileCFEPD = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'Utilisateur non trouvé.' });
    }
    res.json(user);
  } catch (err) {
    console.error('Erreur lors de la récupération du profil:', err.message);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
};

// **Déconnexion d'un utilisateur CFEPD**
exports.logoutCFEPD = async (req, res) => {
  try {
    res.clearCookie('token'); // Optionnel si vous utilisez un cookie pour le token
    res.status(200).json({ msg: 'Déconnexion réussie. À bientôt !' });
  } catch (err) {
    console.error('Erreur lors de la déconnexion:', err);
    res.status(500).json({ msg: 'Erreur serveur lors de la déconnexion.' });
  }
};





exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ msg: 'Token de rafraîchissement manquant.' });
  }

  try {
    // Vérifiez et décodez le token de rafraîchissement
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Récupérez l'utilisateur correspondant au token
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ msg: 'Utilisateur non trouvé.' });
    }

    // Générer un nouveau token d'accès
    const accessToken = jwt.sign(
      { id: user._id, role: user.role, permissions: user.permissions },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      accessToken,
      expiresAt: Date.now() + 60 * 60 * 1000, // 1 heure en millisecondes
    });
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token :', error);
    res.status(403).json({ msg: 'Token invalide ou expiré.' });
  }
};

