

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware pour protéger les routes
exports.protect = async (req, res, next) => {
  let token;

  // Vérifier si un token est présent dans l'en-tête Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Récupérer le token
      token = req.headers.authorization.split(' ')[1];

      // Vérifier et décoder le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Récupérer l'utilisateur associé au token sans le mot de passe
      req.user = await User.findById(decoded.user.id).select('-password');

      console.log("Utilisateur connecté :", req.user);  // Debugging: Affiche les informations de l'utilisateur

       // Rôles autorisés à accéder au module 
       const authorizedRoles = ['Admin', 'Enseignant', 'Eleve', 'Inspection', 'Regional', 'Parent', 'Etablissement'];

       // Vérification stricte du rôle de l'utilisateur
       if (!authorizedRoles.includes(req.user.role)) {
         return res.status(403).json({ msg: 'Accès interdit : vous n\'avez pas le rôle approprié' });
       }





      next();
    } catch (err) {
      console.error(err.message);


         // Vérifier si l'erreur est due à un token expiré
         if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ msg: 'Session expirée, veuillez vous reconnecter.' });
        }



      return res.status(401).json({ msg: 'Non autorisé, token invalide' });
    }
  }




  if (!token) {
    return res.status(401).json({ msg: 'Non autorisé, aucun token fourni' });
  }
};

// Middleware d'autorisation basé sur les rôles et permissions
exports.authorize = (action) => {
  return (req, res, next) => {
    const userPermissions = req.user.permissions;
    console.log("Permissions de l'utilisateur pour l'action", action, ":", userPermissions);  // Debugging: Affiche les permissions

    // Vérifie si l'utilisateur a la permission pour l'action spécifiée
    if (!userPermissions[action]) {
      return res.status(403).json({ msg: 'Accès interdit : vous n\'avez pas l\'autorisation nécessaire pour effectuer cette action' });
    }
    next();
  };
};


// Role-Based Authorization: Allow specific roles (e.g., 'Admin') to access certain routes
exports.authorizeRole = (role) => {
  return (req, res, next) => {
    console.log("Vérification du rôle - rôle requis:", role, "Rôle de l'utilisateur:", req.user.role);

    if (req.user.role !== role) {
      return res.status(403).json({ msg: 'Accès interdit : vous n\'avez pas le rôle requis pour effectuer cette action' });
    }
    next();
  };
};

