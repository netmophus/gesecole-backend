

const mongoose = require('mongoose');

const inscriptionBepcSchema = new mongoose.Schema({
  // Identité de l'élève
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
  nationalite: {
    type: String,
    enum: ['Nigérienne', 'Autre'],
    required: true,
  },
  autreNationalite: {
    type: String,
    required: function () {
      return this.nationalite === 'Autre';
    },
  },

  // Informations scolaires
  typeEnseignement: {
    type: String,
    enum: ['Français', 'Franco-arabe'],
    required: true,
  },


  regionEtablissement: {
    type: String,
    enum: ['Agadez', 'Dosso', 'Maradi', 'Diffa', 'Zinder', 'Niamey', 'Tillabery', 'Tahoua'],
    required: true,
  },


  nomEtablissement: {
    type: String,
    required: true, // Rendre obligatoire
  },


  centreExamen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CentreExamenBEPC',
    required: true,
  },

  // Nouveaux champs : Jury et numéro de table
  jury: {
    type: String,
    required: false, // Champ facultatif
  },
  numeroTable: {
    type: String,
    required: false, // Champ facultatif
  },

  typeCandidat: {
    type: String,
    enum: ['Ecole publique', 'Ecole privée', 'Candidat libre national', 'Candidat libre étranger'],
    required: true, // Assurez-vous qu'il est obligatoire
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
    default: 5000,
  },

  // Agent qui enregistre l'inscription
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Documents joints (URL ou fichiers)
  documents: {
    photoIdentite: {
      type: String,
      required: false, // Fichier non obligatoire
    },
    acteNaissance: {
      type: String,
      required: false, // Fichier non obligatoire
    },
    certificatNationalite: {
      type: String,
      required: false, // Fichier non obligatoire
    },
  },

  // Date d'inscription
  dateInscription: {
    type: Date,
    default: Date.now,
  },

  // Matricule facultatif
  matricule: {
    type: String,
    required: false,
  },
});

// Définition d'un index unique combiné
inscriptionBepcSchema.index(
  { nom: 1, prenom: 1, dateNaissance: 1, regionEtablissement: 1 },
  { unique: true, message: 'Une inscription avec ces informations existe déjà.' }
);

// Middleware pour générer une référence de paiement unique avant l'enregistrement
inscriptionBepcSchema.pre('save', async function (next) {
  if (!this.referencePaiement) {
    const timestamp = Date.now();
    const initiales = `${this.prenom.charAt(0)}${this.nom.charAt(0)}`.toUpperCase();
    this.referencePaiement = `REF-${initiales}-${timestamp}`;
  }
  next();
});

module.exports = mongoose.model('InscriptionBEPC', inscriptionBepcSchema);
