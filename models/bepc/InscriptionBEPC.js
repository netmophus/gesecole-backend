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
    default: '2023-2024',
  },

  // 4. Choix des matières
  langueVivante1: {
    type: String,
    enum: ['Français', 'Anglais'],
    required: true,
  },
  langueVivante2: {
    type: String,
    enum: ['Arabe', 'Anglais', 'Espagnol', 'Autre'],
  },
  matiereOptionnelle: {
    type: String,
  },

  // 5. Suivi du paiement
  referencePaiement: {
    type: String,
    unique: true,
    required: true,
  },
  montantPaiement: {
    type: Number,
    required: true,
    default: 10000, // Exemple : Montant fixé à 10 000 FCFA
  },
  statutPaiement: {
    type: String,
    enum: ['En attente', 'Payé', 'Rejeté'],
    default: 'En attente',
  },
  datePaiement: {
    type: Date,
  },

  // 6. Statut et suivi de l’inscription
  statutInscription: {
    type: String,
    enum: ['En attente', 'Validée', 'Rejetée'],
    default: 'En attente',
  },
  dateInscription: {
    type: Date,
    default: Date.now,
  },
  centreExamen: {
    type: String,
  },

  // 7. Matricule unique
  matricule: {
    type: String,
    unique: true,
    required: true,
  },
});

// Middleware pour générer un numéro de référence unique avant d'enregistrer
inscriptionBepcSchema.pre('save', function (next) {
  const timestamp = Date.now();
  const initiales = `${this.prenom.charAt(0)}${this.nom.charAt(0)}`.toUpperCase();
  this.referencePaiement = `REF-${initiales}-${timestamp}`;
  next();
});

module.exports = mongoose.model('InscriptionBEPC', inscriptionBepcSchema);
