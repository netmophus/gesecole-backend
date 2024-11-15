const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: function() {
      return this.role !== 'Eleve';  // Obligatoire sauf pour les élèves
    },
    unique: function() {
      return this.phone !== null && this.phone !== undefined; // Unicité uniquement si le numéro est défini
    },
    sparse: true,
  },
  

  matricule: {
    type: String,
    unique: true,  // Chaque élève aura un matricule unique
    sparse: true,  // Facultatif pour les autres utilisateurs
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Permet aux utilisateurs sans email d'exister, tout en imposant l'unicité s'il est fourni
  },
  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ['Admin', 'Enseignant', 'Eleve', 'Inspection', 'Regional', 'Parent', 'Etablissement', 'bepc', 'bepcadmin', 'cfepd', 'cfepdadmin'],
    required: true,
  },
  


  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',  // Référence à l'élève
    unique: true,    // Un utilisateur ne peut être lié qu'à un seul élève
    sparse: true,    // Autoriser les utilisateurs qui ne sont pas des élèves à ne pas avoir ce champ
  },

  permissions: {
    create: { type: Boolean, default: false },
    read: { type: Boolean, default: true },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Establishment',
    required: function() {
      return this.role === 'Etablissement';
    }, // Le champ est requis uniquement pour le rôle 'Etablissement'
  },
  isConfigured: {
    type: Boolean,
    default: false,
  },
  establishments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Establishment', // Utilisé pour associer plusieurs établissements aux enseignants, par exemple
    }
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  loginAttempts: {
    type: Number,
    default: 0, // Suivi des tentatives de connexion pour des raisons de sécurité
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware pour hacher le mot de passe avant la sauvegarde
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next(); // Ne pas hacher si le mot de passe n'a pas été modifié
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Mot de passe haché:', this.password);
    next();
  } catch (err) {
    next(err);
  }
});

// Méthode pour comparer les mots de passe lors de la connexion
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
