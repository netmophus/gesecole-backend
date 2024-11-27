const mongoose = require('mongoose');

const centreExamenBepcSchema = new mongoose.Schema({
  // Nom du centre
  nom: {
    type: String,
    required: true,
  },

  // Région où se trouve le centre
  region: {
    type: String,
    enum: ['Agadez', 'Dosso', 'Maradi', 'Diffa', 'Zinder', 'Niamey', 'Tillabery', 'Tahoua'], // Régions disponibles
    required: true,
  },
});


// Définir un index unique sur la combinaison de `nom` et `region`
centreExamenBepcSchema.index({ nom: 1, region: 1 }, { unique: true });


module.exports = mongoose.model('CentreExamenBEPC', centreExamenBepcSchema);
