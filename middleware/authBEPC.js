const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protectBEPC = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      console.log('Decoded JWT:', decoded); // Ajoutez ceci pour voir ce que contient `decoded`


      if (!decoded.id) {
        return res.status(401).json({ msg: 'Token invalide : ID utilisateur manquant' });
      }
      
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(404).json({ msg: 'Utilisateur non trouvé' });
      }

      console.log('Utilisateur connecté dans protectBEPC:', req.user); // Debugging: Voir l'utilisateur connecté


      const authorizedRoles = ['bepc', 'bepcadmin', 'admincentralbepc'];


      if (!authorizedRoles.includes(req.user.role)) {
        return res.status(403).json({ msg: 'Accès interdit : vous n\'avez pas le rôle approprié' });
      }

      next();
    } catch (err) {
      console.error('Erreur lors de la vérification du token :', err.message);
      return res.status(401).json({ msg: 'Token invalide ou expiré' });
    }
  } else {
    return res.status(401).json({ msg: 'Non autorisé, aucun token fourni' });
  }
};



exports.protectBEPCAdmin = async (req, res, next) => {
  try {
    // Vérifiez si req.user est défini
    if (!req.user) {
      return res.status(401).json({ msg: 'Accès interdit : utilisateur non authentifié.' });
    }

    // Vérifiez si l'utilisateur a le rôle bepcadmin
    if (req.user.role !== 'bepcadmin') {
      return res.status(403).json({ msg: 'Accès interdit : réservé aux administrateurs BEPC.' });
    }

    // Passe au middleware suivant si tout est correct
    next();
  } catch (error) {
    console.error('Erreur dans protectBEPCAdmin:', error);
    res.status(500).json({ msg: 'Erreur serveur lors de la vérification des autorisations.' });
  }
};

