

const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protectCFEPD = async (req, res, next) => {
  let token;

  // Vérification de la présence d'un token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    try {
      // Décodage du token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Recherche de l'utilisateur
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(404).json({ msg: 'Utilisateur non trouvé' });
      }

      // Vérification du rôle autorisé
      const authorizedRoles = ['cfepd', 'cfepdadmin'];
      if (!req.user.role || !authorizedRoles.includes(req.user.role)) {
        return res.status(403).json({ msg: 'Accès interdit : rôle non autorisé' });
      }

      next();
    } catch (err) {
      // Gestion des erreurs JWT
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ msg: 'Token expiré. Veuillez vous reconnecter.' });
      } else if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ msg: 'JWT invalide. Veuillez fournir un token valide.' });
      } else {
        console.error('Erreur lors de la vérification du token :', err.message);
        return res.status(401).json({ msg: 'Erreur d\'authentification.' });
      }
    }
  } else {
    return res.status(401).json({ msg: 'Non autorisé, aucun token fourni' });
  }
};


exports.protectCFEPDAdmin = async (req, res, next) => {
  try {
    // Vérifiez si req.user est défini
    if (!req.user) {
      return res.status(401).json({ msg: 'Accès interdit : utilisateur non authentifié.' });
    }

    // Vérifiez si l'utilisateur a le rôle cfepdadmin
    if (req.user.role !== 'cfepdadmin') {
      return res.status(403).json({ msg: 'Accès interdit : réservé aux administrateurs CFEPD.' });
    }

    // Passe au middleware suivant si tout est correct
    next();
  } catch (error) {
    console.error('Erreur dans protectCFEPDAdmin:', error);
    res.status(500).json({ msg: 'Erreur serveur lors de la vérification des autorisations.' });
  }
};
