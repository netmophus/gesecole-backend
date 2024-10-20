


// const mongoose = require('mongoose');

// // Sous-schéma pour les fichiers de ressource
// const ResourceFileSchema = new mongoose.Schema({
//   url: {
//     type: String, 
//     required: function () {
//       return this.resourceType === 'VIDEO'; // URL requise si le type est VIDEO
//     },
//     validate: {
//       validator: function (v) {
//         return this.resourceType === 'VIDEO' ? /^(ftp|http|https):\/\/[^ "]+$/.test(v) : true;
//       },
//       message: props => `${props.value} n'est pas une URL valide pour une vidéo !`,
//     },
//   },
//   file: {
//     type: String, 
//     required: function () {
//       return this.resourceType === 'PDF'; // Le fichier est requis si c'est un PDF
//     },
//   },
//   description: {
//     type: String, // Description optionnelle pour chaque fichier
//   },
// });

// // Schéma principal pour les ressources pédagogiques
// const PedagogicalResourceSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true, // Le titre est obligatoire
//   },
//   description: {
//     type: String,
//     required: false, // Description générale de la ressource (optionnelle)
//   },
//   class: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Class',
//     required: true,
//   },
//   chapter: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Chapter',
//     required: true,
//   },
//   subject: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Subject',
//     required: true,
//   },
//   resourceType: {
//     type: String,
//     enum: ['PDF', 'VIDEO'], // Type de la ressource: PDF ou VIDEO
//     required: true,
//   },
//   resourceFiles: [ResourceFileSchema], // Contient les fichiers
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   isActive: {
//     type: Boolean,
//     default: true, // Pour activer ou désactiver la ressource
//   },
// });

// const PedagogicalResource = mongoose.model('PedagogicalResource', PedagogicalResourceSchema);

// module.exports = PedagogicalResource;


const mongoose = require('mongoose');

const PedagogicalResourceSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['College', 'Lycee'], // Niveau scolaire
    required: true,
  },
  series: {
    type: String,
    enum: ['A', 'C', 'D', 'E', 'F', 'G'], // Série du lycée
    required: function () {
      return this.level === 'lycee'; // Série requise uniquement pour le lycée
    },
  },
  class: {
    type: String,
    enum: ['6eme', '5eme', '4eme', '3eme', 'Seconde', 'Premiere', 'Terminale'],
    required: true, // Classe requise pour les deux niveaux
  },
  subject: {
    type: String, // Matière enseignée
    required: true,
  },
  chapter: {
    number: { type: String, required: true }, // Numéro du chapitre (ex. : Chapitre 1)
    title: { type: String, required: true }, // Titre du chapitre
  },
  resources: [
    {
      type: {
        type: String,
        enum: ['video', 'pdf'], // Type de la ressource
        required: true,
      },
      link: {
        type: String,
        required: function () {
          return this.type === 'video'; // Lien requis si c'est une vidéo
        },
      },
      file: {
        type: String,
        required: function () {
          return this.type === 'pdf'; // Fichier requis si c'est un PDF
        },
      },
      description: {
        type: String, // Description de la ressource
        required: true,
      },
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId, // Référence à l'admin créateur
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date, // Date de création de la ressource
    default: Date.now,
  },
});

// Création du modèle Mongoose
const PedagogicalResource = mongoose.model('PedagogicalResource', PedagogicalResourceSchema);

module.exports = PedagogicalResource;
