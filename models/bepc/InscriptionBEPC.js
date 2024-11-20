
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
    enum: ['Agadez', 'Dosso', 'Maradi', 'Diffa', 'Zinder', 'Niamey', 'Tillabery', 'Tahoua'], // Limite aux régions spécifiées
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

  typeCandidat: {
    type: String,
    enum: ['Ecole publique', 'Ecole privée', 'Candidat libre national', 'Candidat libre étranger'],
    required: true,
    default: 'Ecole publique', // Optionnel
  },
  

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


  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Référence au modèle User
    required: true,
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
