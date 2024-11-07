
// const mongoose = require('mongoose');

// const DevoirCompoSchema = new mongoose.Schema({
//   student: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Student',  // Référence à l'élève
//     required: true,
//   },
//   subject: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Subject',  // Référence à la matière
//     required: true,
//   },
//   teacher: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Teacher',  // Référence à l'enseignant responsable
//     required: true,
//   },
//   classId: {
//     type: mongoose.Schema.Types.ObjectId,  // Ajout de la classe
//     ref: 'Class',  // Référence à la classe
//     required: true,
//   },
//   type: {
//     type: String,
//     enum: ['Devoir 1', 'Devoir 2', 'Composition'],  // Type d'évaluation
//     required: true,
//   },
//   note: {
//     type: Number,  // La note obtenue par l'élève
//     required: true,
//   },

//   coefficient: {
//     type: Number,  // Coefficient appliqué à la note
//     default: 1,  // Valeur par défaut
//   },

//   semester: {
//     type: String,
//     enum: ['Semestre 1', 'Semestre 2'],  // Le semestre auquel appartient l'évaluation
//     required: true,
//   },

//   academicYear: {
//     type: String,  // Ajout de l'année académique sous forme de texte (par exemple : "2023-2024")
//     required: true,  // Le champ année académique est requis
//   },
//   date: {
//     type: Date,
//     default: Date.now,  // Date de l'évaluation
//   },
// }, {
//   timestamps: true,  // Crée des champs createdAt et updatedAt
// });

// // Ajouter un index d'unicité sur la combinaison de `student`, `subject`, `type`, et `semester`
// DevoirCompoSchema.index({ student: 1, subject: 1, type: 1, semester: 1 }, { unique: true });

// const DevoirCompo = mongoose.model('DevoirCompo', DevoirCompoSchema);

// module.exports = DevoirCompo;




// const mongoose = require('mongoose');

// const DevoirCompoSchema = new mongoose.Schema({
//   student: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Student',
//     required: true,
//   },
//   subject: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Subject',
//     required: true,
//   },
//   teacher: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Teacher',
//     required: true,
//   },
//   classId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Class',
//     required: true,
//   },
//   type: {
//     type: String,
//     enum: ['Devoir 1', 'Devoir 2', 'Composition'],
//     required: true,
//   },
//   note: {
//     type: Number,
//     required: true,
//     min: 0,  // Assurez-vous que la note est positive
//     max: 20, // Par exemple, si la note maximale est 20
//   },
//   coefficient: {
//     type: Number,
//     default: 1,
//     min: 1, // Assurez-vous que le coefficient est au moins 1
//   },
//   semester: {
//     type: String,
//     enum: ['Semestre 1', 'Semestre 2'],
//     required: true,
//   },
//   academicYear: {
//     type: String,
//     required: true,
//     match: /^\d{4}-\d{4}$/,  // Validation de format : "2023-2024"
//   },
//   date: {
//     type: Date,
//     default: Date.now,
//   },
// }, {
//   timestamps: true,
// });


// // Index d'unicité incluant 'classId'
// DevoirCompoSchema.index({ 
//   student: 1, 
//   subject: 1, 
//   type: 1, 
//   semester: 1, 
//   academicYear: 1,
//   classId: 1  // Ajout de classId pour l'unicité
// }, { unique: true });

// const DevoirCompo = mongoose.model('DevoirCompo', DevoirCompoSchema);

// module.exports = DevoirCompo;




const mongoose = require('mongoose');

const DevoirCompoSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  establishment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Establishment',
    required: true,
  },
  type: {
    type: String,
    enum: ['Devoir 1', 'Devoir 2', 'Composition'],
    required: true,
  },
  note: {
    type: Number,
    required: true,
    min: 0,  
    max: 20,
  },
  coefficient: {
    type: Number,
    default: 1,
    min: 1,
  },
  semester: {
    type: String,
    enum: ['Semestre 1', 'Semestre 2'],
    required: true,
  },
  academicYear: {
    type: String,
    required: true,
    match: /^\d{4}-\d{4}$/,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Ajout du champ establishment dans l'index d'unicité
DevoirCompoSchema.index({ 
  student: 1, 
  subject: 1, 
  type: 1, 
  semester: 1, 
  academicYear: 1,
  classId: 1,
  establishment: 1
}, { unique: true });

const DevoirCompo = mongoose.model('DevoirCompo', DevoirCompoSchema);

module.exports = DevoirCompo;
