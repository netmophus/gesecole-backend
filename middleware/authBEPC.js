// const jwt = require('jsonwebtoken');
// const User = require('../models/User'); // Assurez-vous que c'est bien votre modèle

// // Middleware de protection des routes BEPC
// exports.protectBEPC = async (req, res, next) => {
//   let token;

//   // Vérifie si un token est présent dans l'en-tête Authorization
//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//     try {
//       token = req.headers.authorization.split(' ')[1]; // Récupérer le token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET); // Vérifier et décoder le token
      
//       // Récupérer l'utilisateur associé au token
//       req.user = await User.findById(decoded.user.id).select('-password');

//       // Vérifie si l'utilisateur a bien un rôle lié au BEPC
//       if (req.user.role !== 'bepc' && req.user.role !== 'bepcadmin') {
//         return res.status(403).json({ msg: 'Accès interdit : rôle non valide' });
//       }

//       next(); // Passe à la prochaine étape si tout est en ordre
//     } catch (err) {
//       console.error('Erreur lors de la vérification du token :', err.message);
//       return res.status(401).json({ msg: 'Token invalide ou expiré' });
//     }
//   } else {
//     return res.status(401).json({ msg: 'Non autorisé, aucun token fourni' });
//   }
// };

const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assurez-vous que c'est bien votre modèle

// Middleware de protection des routes BEPC avec gestion des rôles
exports.protectBEPC = async (req, res, next) => {
  let token;

  // Vérification de la présence d'un token dans l'en-tête Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]; // Extraction du token
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Vérification et décodage du token

      // Récupération de l'utilisateur
      req.user = await User.findById(decoded.user.id).select('-password');

      // Rôles autorisés à accéder au BEPC
      const authorizedRoles = ['bepc', 'bepcadmin', 'admincentralbepc'];

      // Vérification stricte du rôle de l'utilisateur
      if (!authorizedRoles.includes(req.user.role)) {
        return res.status(403).json({ msg: 'Accès interdit : vous n\'avez pas le rôle approprié' });
      }

      next(); // Passage à l'étape suivante si tout est correct
    } catch (err) {
      console.error('Erreur lors de la vérification du token :', err.message);
      return res.status(401).json({ msg: 'Token invalide ou expiré' });
    }
  } else {
    return res.status(401).json({ msg: 'Non autorisé, aucun token fourni' });
  }
};
