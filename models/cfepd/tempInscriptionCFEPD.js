const mongoose = require('mongoose');

const inscriptionCFEPDSchema = new mongoose.Schema({
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
  genre: {
    type: String,
    enum: ['Masculin', 'Féminin'],
    required: true,
  },

  // Coordonnées du parent/tuteur
  telephoneParent: {
    type: String,
    required: true,
  },
  adresseParent: {
    type: String,
    required: true,
  },

  // Informations scolaires
  nomEtablissement: {
    type: String,
    required: true,
  },
  classe: {
    type: String,
    required: true,
  },
  regionEtablissement: {
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

  // Matricule unique de l'élève
  matricule: {
    type: String,
    unique: true,
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
    default: 500, // Montant ajusté
  },

  // Documents joints (URLs des documents)
  documents: {
    certificatNaissance: String,
    photoIdentite: String,
    pieceIdentiteParent: String,
  },
});

// Middleware pour générer une référence de paiement unique avant l'enregistrement
inscriptionCFEPDSchema.pre('save', async function (next) {
  if (!this.referencePaiement) {
    const timestamp = Date.now();
    const initiales = `${this.prenom.charAt(0)}${this.nom.charAt(0)}`.toUpperCase();
    this.referencePaiement = `REF-${initiales}-${timestamp}`;
  }
  next();
});

module.exports = mongoose.model('InscriptionCFEPD', inscriptionCFEPDSchema);