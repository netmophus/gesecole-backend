
// const mongoose = require('mongoose');

// const ClassSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   level: {
//     type: String,
//     required: true,
//     enum: ['Primaire', 'Collège', 'Lycée'], // Niveau de la classe (primaire, collège, lycée)
//   },
//   series: { 
//     type: String, 
//     enum: ['A', 'C', 'D', 'E', 'F', 'G'], 
//     default: null  // Ajout d'une valeur par défaut
//   },
//   maxStudents: {
//     type: Number,
//     required: true,
//   },
//   establishment: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Establishment',
//     required: true,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// ClassSchema.index({ name: 1, level: 1, series: 1, establishment: 1 }, { unique: true });

// const Class = mongoose.model('Class', ClassSchema);

// module.exports = Class;

const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true,
    enum: ['Primaire', 'Collège', 'Lycée'], // Niveau de la classe (primaire, collège, lycée)
  },
  series: { 
    type: String, 
    enum: ['A', 'C', 'D', 'E', 'F', 'G'], 
    default: null  // Ajout d'une valeur par défaut
  },
  maxStudents: {
    type: Number,
    required: true,
  },
  establishment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Establishment',
    required: true,
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student', // Référence au modèle Student
    required: false, // Une classe peut avoir 0 ou plusieurs étudiants
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ClassSchema.index({ name: 1, level: 1, series: 1, establishment: 1 }, { unique: true });

const Class = mongoose.model('Class', ClassSchema);

module.exports = Class;
