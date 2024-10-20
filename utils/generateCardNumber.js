// utils/generateCardNumber.js
const SchoolCard = require('../models/SchoolCard');

async function generateUniqueCardNumber() {
  let cardNumber;
  let cardExists = true;

  while (cardExists) {
    // Générer un numéro de carte aléatoire, ici un code alphanumérique de 9 caractères
    cardNumber = Math.random().toString(36).substr(2, 9).toUpperCase();

    // Vérifier si le numéro de carte existe déjà dans la base de données
    cardExists = await SchoolCard.exists({ cardNumber });
  }

  return cardNumber;
}

module.exports = { generateUniqueCardNumber };



