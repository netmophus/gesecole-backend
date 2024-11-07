const mongoose = require('mongoose');

const MoyenneSchema = new mongoose.Schema({
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
  semester: {
    type: String,
    enum: ['Semestre 1', 'Semestre 2'],
    required: true,
  },
  average: {
    type: Number,
    required: true,
    min: 0,
    max: 20, // Adapte en fonction de ton système de notation
  },
  academicYear: {
    type: String,
    required: true,
    match: /^\d{4}-\d{4}$/,  // Validation du format : "2023-2024"
  },
  dateCalculated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

const Moyenne = mongoose.model('Moyenne', MoyenneSchema);

module.exports = Moyenne;
