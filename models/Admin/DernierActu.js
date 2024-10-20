// models/Admin/DernierActu.js

const mongoose = require('mongoose');

const DernierActuSchema = new mongoose.Schema({
  titleCard: {
    type: String,
    required: true,
    trim: true, // Enlever les espaces avant et après
  },
  bodyCard: {
    type: String,
    required: true,
    trim: true,
  },
  boutonCard: {
    type: String,
    required: true,
    trim: true,
  },
  titreArticles: {
    type: String,
    required: true,
    trim: true,
  },
  bodyArticle: {
    type: String,
    required: true,
    trim: true,
  },
  imageArticle: {
    type: String, // Chemin du fichier ou URL de l'image
    required: false,
  },
  videoArticle: {
    type: String, // Chemin du fichier ou URL de la vidéo
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Ajoute automatiquement la date de création
  },
});

const DernierActu = mongoose.model('DernierActu', DernierActuSchema);

module.exports = DernierActu;
