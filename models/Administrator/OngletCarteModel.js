const mongoose = require('mongoose');

const OngletCarteSchema = new mongoose.Schema({
  titleOnglet: {
    type: String,
    required: true,
  },
  bodyOnglet: {
    type: String,
    required: true,
  },
  imgOnglet: {
    type: String,  // URL de l'image
    required: false,
  },
  videoOnglet: {
    type: String,  // URL de la vidéo
    required: false,
  },
  btnOnglet: {
    type: String,  // Texte du bouton
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('OngletCarte', OngletCarteSchema);
