// const mongoose = require('mongoose');

// const inscriptionBepcSchema = new mongoose.Schema({
//   // 1. Identité de l’élève
//   prenom: {
//     type: String,
//     required: true,
//   },
//   nom: {
//     type: String,
//     required: true,
//   },
//   dateNaissance: {
//     type: Date,
//     required: true,
//   },
//   lieuNaissance: {
//     type: String,
//     required: true,
//   },
//   genre: {
//     type: String,
//     enum: ['Masculin', 'Féminin'],
//     required: true,
//   },

//   // 2. Coordonnées du parent/tuteur
//   telephoneParent: {
//     type: String,
//     required: true,
//   },
//   emailParent: {
//     type: String,
//     sparse: true,
//   },
//   adresseParent: {
//     type: String,
//     required: true,
//   },

//   // 3. Informations scolaires
//   nomEtablissement: {
//     type: String,
//     required: true,
//   },
//   regionEtablissement: {
//     type: String,
//     required: true,
//   },
//   classe: {
//     type: String,
//     required: true,
//   },
//   anneeScolaire: {
//     type: String,
//     default: '2024-2025',
//   }, 


//   dateInscription: {
//     type: Date,
//     default: Date.now,
//   },
//   centreExamen: {
//     type: String,
//   },

//   // 7. Matricule unique
//   matricule: {
//     type: String,
//     unique: true,
//     required: true,
//   },


//   // 8. Informations régionales
//   directionRegionale: {
//     type: String,
//     required: true,
//   },
//   inspectionRegionale: {
//     type: String,
//     required: true,
//   },

//   // 9. Documents joints (URL ou fichiers)
//   documents: {
//     certificatNaissance: {
//       type: String, // URL ou fichier PDF de certificat de naissance
//     },
//     certificatResidence: {
//       type: String, // URL ou fichier PDF de certificat de résidence
//     },
//     certificatScolarite: {
//       type: String, // URL ou fichier PDF de certificat de scolarité
//     },
//     photoIdentite: {
//       type: String, // URL ou fichier PDF de photo d'identité
//     },
//     pieceIdentiteParent: {
//       type: String, // URL ou fichier PDF de la pièce d'identité du parent
//     },
//     autresDocuments: {
//       type: String, // URL ou fichier PDF pour d'autres documents
//     },
//   },
// });

// // Middleware pour générer un numéro de référence unique avant d'enregistrer
// inscriptionBepcSchema.pre('save', function (next) {
//   const timestamp = Date.now();
//   const initiales = `${this.prenom.charAt(0)}${this.nom.charAt(0)}`.toUpperCase();
//   this.referencePaiement = `REF-${initiales}-${timestamp}`;
//   next();
// });

// module.exports = mongoose.model('InscriptionBEPC', inscriptionBepcSchema);



const mongoose = require('mongoose');

const inscriptionBepcSchema = new mongoose.Schema({
  // 1. Identité de l’élève
  prenom: {
    type: String,
    required: true,
  },
  nom: {
    type: String,
    required: true,
  },
  dateNaissance: {
    type: Date,
    required: true,
  },
  lieuNaissance: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    enum: ['Masculin', 'Féminin'],
    required: true,
  },

  // 2. Coordonnées du parent/tuteur
  telephoneParent: {
    type: String,
    required: true,
  },
  emailParent: {
    type: String,
    sparse: true,
  },
  adresseParent: {
    type: String,
    required: true,
  },

  // 3. Informations scolaires
  nomEtablissement: {
    type: String,
    required: true,
  },
  regionEtablissement: {
    type: String,
    required: true,
  },
  classe: {
    type: String,
    required: true,
  },
  anneeScolaire: {
    type: String,
    default: '2024-2025',
  }, 
  dateInscription: {
    type: Date,
    default: Date.now,
  },
  centreExamen: {
    type: String,
  },

  // Matricule unique de l’élève
  matricule: {
    type: String,
    unique: true,
    required: true,
  },

  // Informations régionales
  directionRegionale: {
    type: String,
    required: true,
  },
  inspectionRegionale: {
    type: String,
    required: true,
  },

  // Suivi du paiement
  referencePaiement: {
    type: String,
    unique: true,
    required: true,
  },
  montantPaiement: {
    type: Number,
    required: true,
    default: 10000,
  },

  // Documents joints (URL ou fichiers)
  documents: {
    certificatNaissance: String,
    certificatResidence: String,
    certificatScolarite: String,
    photoIdentite: String,
    pieceIdentiteParent: String,
    autresDocuments: String,
  },
});
// Middleware asynchrone pour générer une référence de paiement unique avant enregistrement
inscriptionBepcSchema.pre('save', async function (next) {
  // Vérifier si `referencePaiement` est déjà généré
  if (!this.referencePaiement) {
    const timestamp = Date.now();
    const initiales = `${this.prenom.charAt(0)}${this.nom.charAt(0)}`.toUpperCase();
    this.referencePaiement = `REF-${initiales}-${timestamp}`;
  }
  next();
});

module.exports = mongoose.model('InscriptionBEPC', inscriptionBepcSchema);
