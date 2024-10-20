const User = require('../../models/User'); // Assurez-vous que le modèle est bien importé
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Génération de token JWT
const generateToken = (user) => {
  return jwt.sign(
    { user: { id: user._id, role: user.role, permissions: user.permissions } },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// Permissions par rôle
const permissionsByRole = {
  bepcadmin: { create: true, read: true, update: true, delete: true },
  bepc: { create: false, read: true, update: false, delete: false },
};


// **Enregistrement d'un utilisateur BEPC**

exports.registerBEPC = async (req, res) => {
  const { name, phone, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ phone });
    if (user) {
      return res.status(400).json({ msg: 'Utilisateur avec ce numéro de téléphone déjà existant.' });
    }

    // Attribuer les permissions pour le rôle BEPC
    const userPermissions = { create: false, read: true, update: false, delete: false };

    // Créer un nouvel utilisateur avec le rôle "bepc"
    user = new User({
      name,
      phone,
      password,
      role: 'bepc',  // Forcer le rôle à être "bepc"
      permissions: userPermissions,  // Attribuer les permissions ici
    });

   
    // Enregistrer l'utilisateur en base de données
    await user.save();

    // Générer le token JWT
    const token = generateToken(user);

    res.status(201).json({ token, user: { id: user._id, name: user.name, role: user.role, permissions: user.permissions } });
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement BEPC:', err.message);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
};



// **Connexion d'un utilisateur BEPC**
// exports.loginBEPC = async (req, res) => {
//   const { phone, password } = req.body;

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

//     // Générer le token JWT
//     const token = generateToken(user);

//     res.json({ token, user: { id: user._id, name: user.name, role: user.role, permissions: user.permissions } });
//   } catch (err) {
//     console.error('Erreur lors de la connexion BEPC:', err.message);
//     res.status(500).json({ msg: 'Erreur serveur' });
//   }
// };

exports.loginBEPC = async (req, res) => {
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

    // Comparer les mots de passe
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Mot de passe incorrect.' });
    }

    // Vérifiez si le rôle est lié au BEPC
    const validRoles = ['bepc', 'bepcadmin', 'admincentralbepc'];
    if (!validRoles.includes(user.role)) {
      return res.status(403).json({ msg: 'Accès interdit pour ce rôle.' });
    }

    // Générer le token JWT
    const token = generateToken(user);

    // Répondre avec le token et les informations de l'utilisateur
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        role: user.role, 
        permissions: user.permissions 
      } 
    });
  } catch (err) {
    console.error('Erreur lors de la connexion BEPC:', err.message);
    res.status(500).json({ msg: 'Erreur serveur, veuillez réessayer plus tard.' });
  }
};


// **Obtenir le profil utilisateur BEPC**
exports.getProfileBEPC = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'Utilisateur non trouvé.' });
    }
    res.json(user);
  } catch (err) {
    console.error('Erreur lors de la récupération du profil BEPC:', err.message);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
};


// Logout pour l'utilisateur BEPC
exports.logoutBEPC = async (req, res) => {
  try {
    // Suppression du token du stockage local côté client
    res.clearCookie('token'); // Optionnel si vous utilisez un cookie pour le token

    res.status(200).json({ msg: 'Déconnexion réussie. À bientôt !' });
  } catch (err) {
    console.error('Erreur lors de la déconnexion:', err);
    res.status(500).json({ msg: 'Erreur serveur lors de la déconnexion.' });
  }
};

