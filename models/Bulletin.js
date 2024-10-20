



const mongoose = require('mongoose');

// Sous-schema pour les matières avec note et coefficient
const SubjectSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher', // Assurez-vous que cela pointe vers le bon modèle
    required: true,
  },
  grade: {
    type: Number,
    required: true,
  },
  coefficient: {
    type: Number,
    default: 1,
  }
});

// Schéma principal pour le bulletin
const BulletinSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  establishmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Establishment',
    required: true,
  },


  year: {  // Modifier ici pour accepter une chaîne au lieu d'un ObjectId
    type: String,  // Remplacez ObjectId par String
    required: true,
  },

  // Passage des trimestres aux semestres
  period: {
    type: String,
    enum: ['Semestre 1', 'Semestre 2'], // Période avec Semestre 1 et Semestre 2
    required: true,
  },

  subjects: [SubjectSchema], // Liste des matières avec notes et coefficients

  conductGrade: { type: Number, default: 0 },
  disciplineGrade: { type: Number, default: 0 },

  // Ajout des notes et coefficients pour chaque semestre
  semestres: {
    'Semestre 1': {
      totalNotes: Number,
      totalCoefficients: Number,
      noteConduite: Number,
      noteDiscipline: Number,
      totalDefinitif: Number,
      moyenneSemestrielle: Number,
      semesterRank: Number, // Rang dans le semestre
    },
    'Semestre 2': {
      totalNotes: Number,
      totalCoefficients: Number,
      noteConduite: Number,
      noteDiscipline: Number,
      totalDefinitif: Number,
      moyenneSemestrielle: Number,
      semesterRank: Number, // Rang dans le semestre
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Modèle pour le bulletin
const Bulletin = mongoose.model('Bulletin', BulletinSchema);

module.exports = Bulletin;
