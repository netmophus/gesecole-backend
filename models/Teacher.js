const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
  },
  telephone: {
    type: String,
    required: true,
  },
  email: {
    type: String,   
    sparse: true,
  },
  establishmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Establishment',
    required: true,
  },
  educationLevel: {
    type: String,
    enum: ['Primaire', 'Collège', 'Lycée'],
    required: true,
  },
  photo: {
    type: String,
  },
}, {
  timestamps: true,
});

// Contrainte d'unicité sur la combinaison du téléphone et de l'établissement
TeacherSchema.index({ telephone: 1, establishmentId: 1 }, { unique: true });

const Teacher = mongoose.model('Teacher', TeacherSchema);

module.exports = Teacher;
