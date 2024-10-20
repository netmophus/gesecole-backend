// models/TeacherSubject.js

const mongoose = require('mongoose');

const TeacherSubjectSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  establishmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Establishment',
    required: true,
  },
}, {
  timestamps: true,
});

// Contrainte d'unicité sur la combinaison teacher et subject
TeacherSubjectSchema.index({ teacher: 1, subject: 1, establishmentId: 1 }, { unique: true });

const TeacherSubject = mongoose.model('TeacherSubject', TeacherSubjectSchema);

module.exports = TeacherSubject;
