const mongoose = require('mongoose');

const SectionCardSchema = new mongoose.Schema({
  titleCard: {
    type: String,
    required: true,
  },
  bodyCard: {
    type: String,
    required: true,
  },

  titlePage: {  // Ajout du titre de la page pour cette section
    type: String,
    required: true,
    unique: true, // S'assurer que le titre de la page est unique
  },
  btnCard: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SectionCard', SectionCardSchema);
