const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protectCFEPD = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      console.log('Decoded JWT:', decoded); // Ajoutez ceci pour voir ce que contient `decoded`

      req.user = await User.findById(decoded.id).select('-password');

      const authorizedRoles = ['cfepd', 'cfepdadmin'];
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
