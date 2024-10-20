// const mongoose = require('mongoose');

// const ClassSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   level: {
//     type: String,
//     required: true,
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
//   teachers: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User', // Référence au modèle User pour les enseignants
//     required: false, // Cette association est optionnelle
//   }],
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

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
  teachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Référence au modèle User pour les enseignants
    required: false, // Cette association est optionnelle
  }],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Class = mongoose.model('Class', ClassSchema);

module.exports = Class;
