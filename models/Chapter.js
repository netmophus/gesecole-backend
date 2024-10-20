const mongoose = require('mongoose');

const ChapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',  // Associe le chapitre à une classe
    required: true,
  },
  order: {
    type: Number,  // Utilisé pour organiser les chapitres dans un ordre spécifique
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Chapter = mongoose.model('Chapter', ChapterSchema);

module.exports = Chapter;
