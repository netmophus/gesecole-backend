// models/Subject.js
const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    enum: ['Primaire', 'Collège', 'Lycée'],
    required: true,
  },

  
  establishment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Establishment',
    required: true, // Lier la matière à un établissement spécifique
  },

  isActive: {
    type: Boolean,
    default: false, // Activer ou désactiver une matière
  },
  
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',  // Lier la matière à une année académique
    required: true,
  },
 
});



// Ajouter un index unique sur la combinaison du nom, du niveau et de l'établissement
SubjectSchema.index({ name: 1, level: 1, establishment: 1 }, { unique: true });

const Subject = mongoose.model('Subject', SubjectSchema);

module.exports = Subject;


