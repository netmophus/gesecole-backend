// const mongoose = require('mongoose');

// const userBEPCSchema = new mongoose.Schema({
//   telephone: {
//     type: String,
//     required: true,
//     unique: true, // Unicité du numéro de téléphone
//   },
//   email: {
//     type: String,
//     sparse: true, // Email facultatif
//     validate: {
//       validator: function (v) {
//         return /^\S+@\S+\.\S+$/.test(v); // Vérification du format email
//       },
//       message: 'Adresse email invalide.',
//     },
//   },
//   password: {
//     type: String,
//     required: true, // Stockage haché du mot de passe
//   },
//   role: {
//     type: String,
//     enum: ['admin', 'student'], // Limitation des rôles à admin et student
//     default: 'student', // Rôle par défaut : student
//   },
//   dateCreated: {
//     type: Date,
//     default: Date.now, // Enregistrer la date de création
//   },
// });

// module.exports = mongoose.model('UserBEPC', userBEPCSchema);
