// models/SchoolCard.js
const mongoose = require('mongoose');

const SchoolCardSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  establishment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Establishment',
    required: true,
  },
  cardNumber: {
    type: String,
    unique: true,
    required: true,
  },
  issueDate: {
    type: Date,
    default: Date.now,
  },
  expirationDate: {
    type: Date,
    required: true,
  },
  photoUrl: {
    type: String,
    required: false,
  },
  barcode: {
    type: String,
    required: false,
  },
  qrCode: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
});

const SchoolCard = mongoose.model('SchoolCard', SchoolCardSchema);

module.exports = SchoolCard;



