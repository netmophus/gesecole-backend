const mongoose = require('mongoose');

const centreExamenSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
  },
  region: {
    type: String,
    enum: ['Agadez', 'Dosso', 'Maradi', 'Diffa', 'Zinder', 'Niamey', 'Tillabery', 'Tahoua'], // Les régions disponibles
    required: true,
  },
});

module.exports = mongoose.model('CentreExamenCFEPD', centreExamenSchema);
