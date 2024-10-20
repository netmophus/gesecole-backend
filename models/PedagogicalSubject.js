// const mongoose = require('mongoose');

// const PedagogicalSubjectSchema = new mongoose.Schema({
//   name: { 
//     type: String, 
//     required: true 
//   },
//   level: { 
//     type: String, 
//     enum: ['Collège', 'Lycée'], 
//     required: true 
//   },
//   className: { 
//     type: String, 
//     required: true 
//   },
//   series: { 
//     type: String, 
//     enum: ['A', 'C', 'D', 'E', 'F', 'G'], 
//     required: function () {
//       return this.level === 'Lycée';  // Série obligatoire pour le lycée
//     },
//   },
//   establishment: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'Establishment', 
//     required: true 
//   },
//   academicYear: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'AcademicYear', 
//     required: true 
//   },
// }, { timestamps: true });

// // Index unique pour empêcher la duplication des matières dans une classe donnée
// PedagogicalSubjectSchema.index(
//   { name: 1, level: 1, className: 1, series: 1, establishment: 1 },
//   { unique: true }
// );

// const PedagogicalSubject = mongoose.model('PedagogicalSubject', PedagogicalSubjectSchema);
// module.exports = PedagogicalSubject;


// const mongoose = require('mongoose');

// const PedagogicalSubjectSchema = new mongoose.Schema({
//   name: { 
//     type: String, 
//     required: true 
//   },
//   level: { 
//     type: String, 
//     enum: ['Collège', 'Lycée'], 
//     required: true 
//   },
//   className: { 
//     type: String, 
//     required: true 
//   },
//   series: { 
//     type: String, 
//     enum: ['A', 'C', 'D', 'E', 'F', 'G'], 
//     required: function () {
//       return this.level === 'Lycée';  // Série obligatoire uniquement pour le lycée
//     },
//   }
// }, { timestamps: true });

// // Index unique pour empêcher la duplication des matières par niveau et classe
// PedagogicalSubjectSchema.index(
//   { name: 1, level: 1, className: 1, series: 1 },
//   { unique: true }
// );

// const PedagogicalSubject = mongoose.model('PedagogicalSubject', PedagogicalSubjectSchema);
// module.exports = PedagogicalSubject;




const mongoose = require('mongoose');

const PedagogicalSubjectSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  level: { 
    type: String, 
    enum: ['College', 'Lycee'], // Suppression des accents
    required: true 
  },
  className: { 
    type: String, 
    required: true 
  },
  series: { 
    type: String, 
    enum: ['A', 'C', 'D', 'E', 'F', 'G'], 
    required: function () {
      return this.level === 'Lycee'; // Ajustement sans accent
    },
  }
}, { timestamps: true });

// Index unique pour empêcher la duplication des matières par niveau et classe
PedagogicalSubjectSchema.index(
  { name: 1, level: 1, className: 1, series: 1 },
  { unique: true }
);

const PedagogicalSubject = mongoose.model('PedagogicalSubject', PedagogicalSubjectSchema);
module.exports = PedagogicalSubject;
