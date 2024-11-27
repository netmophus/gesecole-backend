

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
 

  nationalite: {
    type: String,
    enum: ['Nigérienne', 'Autre'], // Choix possibles
    required: true,
  },
  autreNationalite: {
    type: String,
    required: function () {
      return this.nationalite === 'Autre'; // Requis seulement si nationalité est "Autre"
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
  centreExamen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CentreExamenCFEPD',
    required: true,
  },
  nomEtablissement: {
    type: String,
    required: true,
  },
  // classe: {
  //   type: String, // Champ facultatif
  // },
  matricule: {
    type: String,
    required: false, // Facultatif
    unique: false, // Suppression de l'unicité
  },

  
  jury: { type: String }, // Champ facultatif
numeroDeTable: { type: String }, // Champ facultatif


  // Agent qui enregistre l'inscription
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
    default: 1000,
  },





  documents: {
    certificatNaissance: { type: String, required: false },
    certificatScolarite: { type: String, required: false },
    photoIdentite: { type: String, required: false },
    certificatNationalite: { type: String, required: false },
    acteNaissance: { type: String, required: false },
  },
  

  // Date d'inscription
  dateInscription: {
    type: Date,
    default: Date.now,
  },
});

// Index pour garantir l'unicité sur nom, prénom, date de naissance et région
inscriptionCFEPDSchema.index(
  { nom: 1, prenom: 1, dateNaissance: 1, regionEtablissement: 1 },
  { unique: true }
);

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
